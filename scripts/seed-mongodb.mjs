import { createHmac } from "node:crypto";
import { MongoClient } from "mongodb";
import fs from "node:fs/promises";

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
const databaseName = process.env.MONGODB_DB || "checkinfo";
const authSecret = process.env.AUTH_SECRET || "checkinfo-local-dev-secret-change-in-production";

function hashPassword(password) {
  return createHmac("sha256", authSecret).update(password).digest("base64url");
}

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
  const users = db.collection("users");
  const adminSettings = db.collection("admin_settings");
  const newsletters = db.collection("newsletter_subscribers");
  const leads = db.collection("advertising_leads");
  const settings = db.collection("settings");

  await Promise.all([
    categories.createIndex({ slug: 1 }, { unique: true }),
    categories.createIndex({ status: 1, displayOrder: 1 }),
    members.createIndex({ "profile.username": 1 }),
    users.createIndex({ username: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
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

  // 1. Seed Admin Account Credentials in MongoDB
  const defaultAdminPass = process.env.ADMIN_LOGIN_PASSWORD || "admin123";
  await adminSettings.updateOne(
    { _id: "site" },
    { $set: { passwordHash: hashPassword(defaultAdminPass), updatedAt: new Date().toISOString() }, $setOnInsert: { _id: "site" } },
    { upsert: true },
  );

  // 2. Seed Visitor User Account in MongoDB
  const defaultUserPass = process.env.USER_LOGIN_PASSWORD || "user123";
  await users.updateOne(
    { username: "user" },
    {
      $set: {
        createdAt: new Date().toISOString(),
        email: "user@checkinfo.in",
        name: "Default Visitor User",
        passwordHash: hashPassword(defaultUserPass),
        phone: "9876543210",
        role: "user",
        username: "user",
      },
      $setOnInsert: { _id: "user" },
    },
    { upsert: true },
  );

  // 3. Seed Business Member Account in MongoDB
  const defaultMemberPass = process.env.MEMBER_LOGIN_PASSWORD || "member123";
  await members.updateOne(
    { _id: "member" },
    {
      $set: {
        passwordHash: hashPassword(defaultMemberPass),
        profile: {
          email: "member@checkinfo.in",
          id: "member",
          initials: "MB",
          name: "Default Business Owner",
          phone: "9876543210",
          role: "Business owner account",
          status: "Active",
          username: "member",
        },
      },
      $setOnInsert: {
        _id: "member",
        enquiries: [],
        listings: [],
        loggedOutAt: null,
        notifications: [],
        packageName: "Free Listing",
        passwordUpdatedAt: null,
        registeredAt: new Date().toISOString(),
        reviews: [],
        tickets: [],
      },
    },
    { upsert: true },
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

  console.log(`MongoDB ready & authenticated accounts seeded: ${databaseName}`);
  console.table({
    admin_settings: await adminSettings.countDocuments(),
    advertising_leads: await leads.countDocuments(),
    categories: await categories.countDocuments(),
    members: await members.countDocuments(),
    newsletter_subscribers: await newsletters.countDocuments(),
    users: await users.countDocuments(),
  });
} finally {
  await client.close();
}
