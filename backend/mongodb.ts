import { MongoClient, type Collection, type Db } from "mongodb";
import { categories } from "./checkinfo";
import type {
  MemberEnquiry,
  MemberListing,
  MemberNotification,
  MemberReview,
  SupportTicket,
} from "./member";

export type MemberProfile = {
  email: string;
  id: string;
  initials: string;
  name: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  username: string;
};

export type MemberAccount = {
  _id?: string;
  enquiries: MemberEnquiry[];
  listings: MemberListing[];
  loggedOutAt: string | null;
  notifications: MemberNotification[];
  packageName: string;
  passwordUpdatedAt: string | null;
  profile: MemberProfile;
  registeredAt: string;
  reviews: MemberReview[];
  tickets: SupportTicket[];
};

type CategoryRecord = {
  _id: string;
  displayOrder: number;
  homePlacement: "Top" | "Bottom";
  image: string;
  name: string;
  slug: string;
  status: "Active" | "Inactive";
};

type NewsletterRecord = {
  email: string;
  source: string;
  subscribedAt: string;
};

type SettingRecord = {
  _id: string;
  createdAt?: string;
  name?: string;
  supportEmail?: string;
};

type LeadRecord = Record<string, unknown> & {
  createdAt: string;
  source: string;
};

const globalMongo = globalThis as typeof globalThis & {
  __checkinfoMongoClientPromise?: Promise<MongoClient>;
};

function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || process.env.MONGO_URL?.trim() || "";
}

export function isMongoConfigured() {
  return Boolean(getMongoUri());
}

export async function getMongoClient() {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  globalMongo.__checkinfoMongoClientPromise ??= new MongoClient(uri).connect();
  return globalMongo.__checkinfoMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB?.trim() || "checkinfo");
}

export async function getMongoCollections() {
  const db = await getMongoDb();

  return {
    categories: db.collection<CategoryRecord>("categories"),
    leads: db.collection<LeadRecord>("advertising_leads"),
    members: db.collection<MemberAccount>("members"),
    newsletters: db.collection<NewsletterRecord>("newsletter_subscribers"),
    settings: db.collection<SettingRecord>("settings"),
  };
}

export function emptyMemberAccount(memberId: string): MemberAccount {
  const suffix = memberId.slice(-4).toUpperCase() || "USER";

  return {
    _id: memberId,
    enquiries: [],
    listings: [],
    loggedOutAt: null,
    notifications: [],
    packageName: "Free Listing",
    passwordUpdatedAt: null,
    profile: {
      email: "",
      id: memberId,
      initials: suffix.slice(0, 2),
      name: "Business Owner",
      phone: "",
      role: "Business owner account",
      status: "Active",
      username: memberId,
    },
    registeredAt: new Date().toISOString(),
    reviews: [],
    tickets: [],
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureIndexes(collections: Awaited<ReturnType<typeof getMongoCollections>>) {
  await Promise.all([
    collections.categories.createIndex({ slug: 1 }, { unique: true }),
    collections.categories.createIndex({ status: 1, displayOrder: 1 }),
    collections.members.createIndex({ "profile.username": 1 }),
    collections.newsletters.createIndex({ email: 1 }, { unique: true }),
    collections.leads.createIndex({ createdAt: -1 }),
  ]);
}

export async function seedMongoDatabase() {
  const collections = await getMongoCollections();
  await ensureIndexes(collections);

  const categoryCount = await collections.categories.countDocuments();

  if (categoryCount === 0) {
    await collections.categories.insertMany(
      categories.map((name, index) => ({
        _id: slugify(name),
        displayOrder: (index + 1) * 10,
        homePlacement: index < 4 ? "Top" : "Bottom",
        image: "Image",
        name,
        slug: slugify(name),
        status: "Active",
      })),
    );
  }

  await collections.settings.updateOne(
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

  return {
    categories: await collections.categories.countDocuments(),
    members: await collections.members.countDocuments(),
    ok: true,
  };
}

export async function getOrCreateMongoMember(memberId: string) {
  const { members } = await getMongoCollections();
  const existing = await members.findOne({ _id: memberId });

  if (existing) return existing;

  const account = emptyMemberAccount(memberId);
  await members.insertOne(account);
  return account;
}

export async function saveMongoMember(account: MemberAccount) {
  const { members } = await getMongoCollections();
  const { _id, ...record } = account;
  await members.updateOne({ _id: account.profile.id }, { $set: record, $setOnInsert: { _id: _id ?? account.profile.id } }, { upsert: true });
}

export async function listMongoMembers() {
  const { members } = await getMongoCollections();
  return members.find({}).sort({ registeredAt: -1 }).toArray();
}

export async function saveNewsletterSubscription(email: string, source = "website") {
  if (!isMongoConfigured() || !email) return null;

  const { newsletters } = await getMongoCollections();
  const record = { email, source, subscribedAt: new Date().toISOString() };
  await newsletters.updateOne({ email }, { $set: record }, { upsert: true });
  return record;
}

export async function saveAdvertisingLead(payload: Record<string, unknown>, source = "advertise-form") {
  if (!isMongoConfigured()) return null;

  const { leads } = await getMongoCollections();
  const record = { ...payload, createdAt: new Date().toISOString(), source };
  await leads.insertOne(record);
  return record;
}

export type MongoCollectionMap = {
  categories: Collection<CategoryRecord>;
  leads: Collection<LeadRecord>;
  members: Collection<MemberAccount>;
  newsletters: Collection<NewsletterRecord>;
};
