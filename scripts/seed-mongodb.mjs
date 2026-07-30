import { MongoClient } from "mongodb";
import fs from "node:fs/promises";

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
const databaseName = process.env.MONGODB_DB || "checkinfo";

if (!uri) {
  console.error("Missing MONGODB_URI. Add it to .env.local or export it before running this script.");
  process.exit(1);
}

async function readDefaultCategories() {
  const source = await fs.readFile("backend/businessTaxonomy.ts", "utf8");
  const marker = "export const businessTaxonomy = ";
  const start = source.indexOf(marker);
  const end = source.indexOf(" as const", start);
  if (start === -1 || end === -1) throw new Error("Unable to read business taxonomy.");

  const taxonomy = JSON.parse(source.slice(start + marker.length, end));
  return taxonomy.map((category) => category.name);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const client = new MongoClient(uri);

try {
  const defaultCategories = await readDefaultCategories();
  await client.connect();
  const db = client.db(databaseName);
  const categories = db.collection("categories");
  const members = db.collection("members");
  const newsletters = db.collection("newsletter_subscribers");
  const leads = db.collection("advertising_leads");
  const settings = db.collection("settings");

  await Promise.all([
    categories.createIndex({ slug: 1 }, { unique: true }),
    categories.createIndex({ status: 1, displayOrder: 1 }),
    members.createIndex({ "profile.username": 1 }),
    newsletters.createIndex({ email: 1 }, { unique: true }),
    leads.createIndex({ createdAt: -1 }),
  ]);

  const categorySlugs = defaultCategories.map(slugify);
  await categories.deleteMany({ slug: { $nin: categorySlugs } });
  await Promise.all(
    defaultCategories.map((name, index) => categories.updateOne(
      { slug: slugify(name) },
      {
        $set: {
          displayOrder: (index + 1) * 10,
          homePlacement: index < 8 ? "Top" : "Bottom",
          image: "Image",
          name,
          slug: slugify(name),
          status: "Active",
        },
        $setOnInsert: { _id: slugify(name) },
      },
      { upsert: true },
    )),
  );

  await settings.updateOne(
    { _id: "site" },
    {
      $setOnInsert: {
        createdAt: new Date().toISOString(),
        name: "Checkinfo",
        supportEmail: "info@checkinfo.in",
      },
    },
    { upsert: true },
  );

  console.log(`MongoDB ready: ${databaseName}`);
  console.table({
    advertising_leads: await leads.countDocuments(),
    categories: await categories.countDocuments(),
    members: await members.countDocuments(),
    newsletter_subscribers: await newsletters.countDocuments(),
  });
} finally {
  await client.close();
}
