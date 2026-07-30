import fs from "node:fs/promises";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
const databaseName = process.env.MONGODB_DB || "checkinfo";

if (!uri) {
  console.error("Missing MONGODB_URI. Add it to .env.local or export it before running this script.");
  process.exit(1);
}

function extractArray(source, exportName) {
  const marker = `export const ${exportName} = `;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${exportName}`);

  const arrayStart = source.indexOf("[", start);
  const endMarker = ` as India`;
  const arrayEnd = source.indexOf(endMarker, arrayStart);
  if (arrayStart === -1 || arrayEnd === -1) throw new Error(`Unable to parse ${exportName}`);

  return JSON.parse(source.slice(arrayStart, arrayEnd));
}

async function upsertMany(collection, records, transform = (record) => record, filterFor = (record) => ({ _id: record._id })) {
  if (!records.length) return;

  const batchSize = 800;
  for (let index = 0; index < records.length; index += batchSize) {
    const batch = records.slice(index, index + batchSize);
    await collection.bulkWrite(
      batch.map((record) => {
        const next = transform(record);
        const { _id, ...setFields } = next;
        return {
          updateOne: {
            filter: filterFor(next),
            update: { $set: setFields, $setOnInsert: { _id } },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );
  }
}

const source = await fs.readFile("frontend/admin/indiaLocations.ts", "utf8");
const states = extractArray(source, "indiaStates");
const districts = extractArray(source, "indiaDistricts");
const subdistricts = extractArray(source, "indiaSubdistricts");
const cities = extractArray(source, "indiaCities");

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(databaseName);
  const stateCollection = db.collection("states");
  const districtCollection = db.collection("districts");
  const subdistrictCollection = db.collection("subdistricts");
  const cityCollection = db.collection("cities");
  const locationCollection = db.collection("locations");

  await Promise.all([
    stateCollection.createIndex({ name: 1 }, { unique: true }),
    districtCollection.createIndex({ state: 1, name: 1 }, { unique: true }),
    subdistrictCollection.createIndex({ state: 1, district: 1, name: 1 }),
    cityCollection.createIndex({ state: 1, name: 1 }, { unique: true }),
    cityCollection.createIndex({ geonameId: 1 }),
    locationCollection.createIndex({ kind: 1, state: 1, name: 1 }),
  ]);

  await upsertMany(stateCollection, states, (record) => ({ ...record, _id: record.id }), (record) => ({ name: record.name }));
  await upsertMany(districtCollection, districts, (record) => ({ ...record, _id: record.id }), (record) => ({ name: record.name, state: record.state }));
  await upsertMany(subdistrictCollection, subdistricts, (record) => ({ ...record, _id: record.id }), (record) => ({ district: record.district, name: record.name, state: record.state }));
  await cityCollection.deleteMany({ geonameId: { $exists: true } });
  await upsertMany(cityCollection, cities, (record) => ({ ...record, _id: record.id }), (record) => ({ name: record.name, state: record.state }));
  await locationCollection.deleteMany({ kind: { $in: ["District", "Sub-district", "City"] } });

  console.log(`India locations seeded: ${databaseName}`);
  console.table({
    cities: await cityCollection.countDocuments(),
    districts: await districtCollection.countDocuments(),
    locations: await locationCollection.countDocuments(),
    states: await stateCollection.countDocuments(),
    subdistricts: await subdistrictCollection.countDocuments(),
  });
} finally {
  await client.close();
}
