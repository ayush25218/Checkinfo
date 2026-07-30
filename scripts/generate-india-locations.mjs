import fs from "node:fs/promises";
import zlib from "node:zlib";

const LEVELS = ["ADM1", "ADM2", "ADM3"];
const GEONAMES_IN_URL = "https://download.geonames.org/export/dump/IN.zip";
const GEONAMES_ADMIN1_URL = "https://download.geonames.org/export/dump/admin1CodesASCII.txt";
const MIN_CITY_POPULATION = 1000;
const ADMIN_SEAT_CODES = new Set(["PPLC", "PPLA", "PPLA2", "PPLA3", "PPLA4"]);

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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function readZipText(buffer, expectedName) {
  let eocdOffset = -1;
  for (let index = buffer.length - 22; index >= 0; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      eocdOffset = index;
      break;
    }
  }

  if (eocdOffset === -1) throw new Error("Invalid zip: missing central directory");

  let directoryOffset = buffer.readUInt32LE(eocdOffset + 16);

  while (directoryOffset < eocdOffset) {
    if (buffer.readUInt32LE(directoryOffset) !== 0x02014b50) break;

    const method = buffer.readUInt16LE(directoryOffset + 10);
    const compressedSize = buffer.readUInt32LE(directoryOffset + 20);
    const fileNameLength = buffer.readUInt16LE(directoryOffset + 28);
    const extraLength = buffer.readUInt16LE(directoryOffset + 30);
    const commentLength = buffer.readUInt16LE(directoryOffset + 32);
    const localHeaderOffset = buffer.readUInt32LE(directoryOffset + 42);
    const fileName = buffer.toString("utf8", directoryOffset + 46, directoryOffset + 46 + fileNameLength);

    if (fileName === expectedName) {
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return compressed.toString("utf8");
      if (method === 8) return zlib.inflateRawSync(compressed).toString("utf8");
      throw new Error(`Unsupported zip method ${method} for ${expectedName}`);
    }

    directoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error(`Missing ${expectedName} in zip`);
}

async function fetchLevel(level) {
  const meta = await fetchJson(`https://www.geoboundaries.org/api/current/gbOpen/IND/${level}/`);
  const geojson = await fetchJson(meta.simplifiedGeometryGeoJSON);

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

function parseAdmin1Names(text) {
  return new Map(
    text
      .split("\n")
      .map((line) => line.split("\t"))
      .filter((cols) => cols[0]?.startsWith("IN."))
      .map((cols) => [cols[0].replace("IN.", ""), cleanName(cols[1])]),
  );
}

function parseGeoNamesCities(text, stateCodeToName) {
  const deduped = new Map();

  for (const line of text.split("\n")) {
    if (!line) continue;
    const cols = line.split("\t");
    const featureClass = cols[6];
    const featureCode = cols[7];
    const population = Number(cols[14] || 0);

    if (featureClass !== "P" || !featureCode.startsWith("PPL")) continue;
    if (population < MIN_CITY_POPULATION && !ADMIN_SEAT_CODES.has(featureCode)) continue;

    const name = cleanName(cols[1]);
    const state = stateCodeToName.get(cols[10]) ?? cleanName(cols[10]);
    if (!name || !state) continue;

    const key = `${state.toLowerCase()}::${slug(name)}`;
    const current = deduped.get(key);
    const record = {
      featureCode,
      geonameId: cols[0],
      latitude: cols[4],
      longitude: cols[5],
      name,
      population,
      state,
    };

    if (!current || record.population > current.population) deduped.set(key, record);
  }

  return [...deduped.values()]
    .map((city, index) => toRecord("city", index, city))
    .sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
}

const [admin1Text, geonamesZip, statesRaw, districtsRaw, subdistrictsRaw] = await Promise.all([
  fetchText(GEONAMES_ADMIN1_URL),
  fetchBuffer(GEONAMES_IN_URL),
  ...LEVELS.map(fetchLevel),
]);

const stateCodeToName = parseAdmin1Names(admin1Text);
const geonamesText = readZipText(geonamesZip, "IN.txt");

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

const cities = parseGeoNamesCities(geonamesText, stateCodeToName);

const sourceNote = [
  "Generated from geoBoundaries India gbOpen simplified ADM1/ADM2/ADM3 data and GeoNames India populated places.",
  `Cities include GeoNames populated places with population ${MIN_CITY_POPULATION}+ plus administrative seats.`,
  "geoBoundaries source: William & Mary geoLab / DataMeet India community. City source: GeoNames CC-BY data.",
].join(" ");

const output = `export type IndiaStateSeed = { country: string; id: string; name: string; status: "Active" | "Inactive" };
export type IndiaDistrictSeed = IndiaStateSeed & { state: string };
export type IndiaSubdistrictSeed = IndiaStateSeed & { district: string; state: string };
export type IndiaCitySeed = IndiaStateSeed & { featureCode?: string; geonameId?: string; latitude?: string; longitude?: string; population?: number; state: string };

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
