import fs from "node:fs/promises";

const LEVELS = ["ADM1", "ADM2", "ADM3"];

function cleanName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function flattenRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

function bboxOf(geometry) {
  const points = flattenRings(geometry).flat();
  const xs = points.map(([lng]) => lng);
  const ys = points.map(([, lat]) => lat);
  return {
    maxLat: Math.max(...ys),
    maxLng: Math.max(...xs),
    minLat: Math.min(...ys),
    minLng: Math.min(...xs),
  };
}

function centroidOf(geometry) {
  const points = flattenRings(geometry).flat();
  const total = points.reduce(
    (sum, [lng, lat]) => ({ lat: sum.lat + lat, lng: sum.lng + lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: total.lat / points.length, lng: total.lng / points.length };
}

function bboxContains(bbox, point) {
  return point.lat >= bbox.minLat && point.lat <= bbox.maxLat && point.lng >= bbox.minLng && point.lng <= bbox.maxLng;
}

function pointInRing(point, ring) {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInGeometry(point, geometry) {
  return flattenRings(geometry).some((ring) => pointInRing(point, ring));
}

function slug(value) {
  return cleanName(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fetchLevel(level) {
  const meta = await fetch(`https://www.geoboundaries.org/api/current/gbOpen/IND/${level}/`).then((response) => response.json());
  const geojson = await fetch(meta.simplifiedGeometryGeoJSON).then((response) => response.json());

  return geojson.features
    .map((feature) => ({
      bbox: bboxOf(feature.geometry),
      centroid: centroidOf(feature.geometry),
      geometry: feature.geometry,
      id: feature.properties.shapeID,
      iso: cleanName(feature.properties.shapeISO).replace(/^IN-/, ""),
      name: cleanName(feature.properties.shapeName),
    }))
    .filter((record) => record.name);
}

function findContainer(record, containers) {
  return containers.find((container) => bboxContains(container.bbox, record.centroid) && pointInGeometry(record.centroid, container.geometry));
}

function toRecord(prefix, index, value) {
  return {
    ...value,
    country: "India",
    id: `${prefix}-${slug(value.name)}-${index + 1}`,
    status: "Active",
  };
}

const cityAsset = JSON.parse(await fs.readFile("package/lib/assets/city.json", "utf8"));
const stateAsset = JSON.parse(await fs.readFile("package/lib/assets/state.json", "utf8")).filter((state) => state.countryCode === "IN");
const stateCodeToName = new Map(stateAsset.map((state) => [state.isoCode, state.name]));
const [statesRaw, districtsRaw, subdistrictsRaw] = await Promise.all(LEVELS.map(fetchLevel));

statesRaw.forEach((state) => {
  state.displayName = stateCodeToName.get(state.iso) ?? state.name;
});

const states = statesRaw
  .map((state, index) => toRecord("state", index, { name: state.displayName }))
  .sort((a, b) => a.name.localeCompare(b.name));

const districts = districtsRaw
  .map((district, index) => {
    const state = findContainer(district, statesRaw);
    return toRecord("district", index, { name: district.name, state: state?.displayName ?? "India" });
  })
  .sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));

const subdistricts = subdistrictsRaw
  .map((subdistrict, index) => {
    const district = findContainer(subdistrict, districtsRaw);
    const state = district ? findContainer(district, statesRaw) : undefined;
    return toRecord("subdistrict", index, {
      district: district?.name ?? "",
      name: subdistrict.name,
      state: state?.displayName ?? "India",
    });
  })
  .sort((a, b) => a.state.localeCompare(b.state) || a.district.localeCompare(b.district) || a.name.localeCompare(b.name));

const cities = cityAsset
  .filter((city) => city[1] === "IN")
  .map((city, index) => toRecord("city", index, {
    latitude: city[3],
    longitude: city[4],
    name: cleanName(city[0]),
    state: stateCodeToName.get(city[2]) ?? city[2],
  }))
  .sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));

const sourceNote = [
  "Generated from geoBoundaries India gbOpen simplified ADM1/ADM2/ADM3 data and country-state-city city data.",
  "geoBoundaries source: William & Mary geoLab / DataMeet India community. City source: country-state-city package.",
].join(" ");

const output = `export type IndiaStateSeed = { country: string; id: string; name: string; status: "Active" | "Inactive" };
export type IndiaDistrictSeed = IndiaStateSeed & { state: string };
export type IndiaSubdistrictSeed = IndiaStateSeed & { district: string; state: string };
export type IndiaCitySeed = IndiaStateSeed & { latitude?: string; longitude?: string; state: string };

export const indiaLocationSourceNote = ${JSON.stringify(sourceNote)};
export const indiaStates = ${JSON.stringify(states)} as IndiaStateSeed[];
export const indiaDistricts = ${JSON.stringify(districts)} as IndiaDistrictSeed[];
export const indiaSubdistricts = ${JSON.stringify(subdistricts)} as IndiaSubdistrictSeed[];
export const indiaCities = ${JSON.stringify(cities)} as IndiaCitySeed[];
`;

await fs.writeFile("frontend/admin/indiaLocations.ts", output);

console.log({
  cities: cities.length,
  districts: districts.length,
  states: states.length,
  subdistricts: subdistricts.length,
});
