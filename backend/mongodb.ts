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

type MetaTagRecord = {
  _id: string;
  createdAt: string;
  description: string;
  keywords: string;
  title: string;
  updatedAt: string;
  url: string;
};

type SubadminRecord = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  registeredAt: string;
  status: "Active" | "Inactive";
  username: string;
};

type AdminSettingsExtended = {
  _id: string;
  address: string;
  analyticsId: string;
  email: string;
  facebook: string;
  instagram: string;
  mapEmbed: string;
  passwordHash?: string;
  phone: string;
  updatedAt: string;
  webCode: string;
  youtube: string;
};

type StaticPageRecord = {
  _id: string;
  content: string;
  slug: string;
  status: "Active" | "Inactive";
  title: string;
  updatedAt: string;
};

type EnquiryRecord = {
  _id: string;
  createdAt: string;
  email: string;
  message: string;
  name: string;
  phone: string;
  receivedAt: string;
  status: "New" | "Replied" | "Closed";
  type: "Contact" | "Business" | "Career" | "Advertise";
};

type MediaRecord = {
  _id: string;
  image: string;
  kind: "banner" | "header-image";
  lineOne: string;
  lineTwo: string;
  position: string;
  status: "Active" | "Inactive";
  updatedAt: string;
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

  globalMongo.__checkinfoMongoClientPromise ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 6000,
  }).connect();
  return globalMongo.__checkinfoMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB?.trim() || "checkinfo");
}

export async function getMongoCollections() {
  const db = await getMongoDb();

  return {
    adminSettings: db.collection<AdminSettingsExtended>("admin_settings"),
    categories: db.collection<CategoryRecord>("categories"),
    enquiries: db.collection<EnquiryRecord>("enquiries"),
    leads: db.collection<LeadRecord>("advertising_leads"),
    media: db.collection<MediaRecord>("media"),
    members: db.collection<MemberAccount>("members"),
    metaTags: db.collection<MetaTagRecord>("meta_tags"),
    newsletters: db.collection<NewsletterRecord>("newsletter_subscribers"),
    settings: db.collection<SettingRecord>("settings"),
    staticPages: db.collection<StaticPageRecord>("static_pages"),
    subadmins: db.collection<SubadminRecord>("subadmins"),
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
    collections.enquiries.createIndex({ createdAt: -1 }),
    collections.enquiries.createIndex({ type: 1, status: 1 }),
    collections.leads.createIndex({ createdAt: -1 }),
    collections.media.createIndex({ kind: 1 }),
    collections.members.createIndex({ "profile.username": 1 }),
    collections.metaTags.createIndex({ url: 1 }, { unique: true }),
    collections.newsletters.createIndex({ email: 1 }, { unique: true }),
    collections.staticPages.createIndex({ slug: 1 }, { unique: true }),
    collections.subadmins.createIndex({ username: 1 }, { unique: true }),
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

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listMongoCategories() {
  const { categories } = await getMongoCollections();
  return categories.find({}).sort({ displayOrder: 1 }).toArray();
}

export async function upsertMongoCategory(record: {
  displayOrder: number;
  homeBottom: boolean;
  homeTop: boolean;
  id: string;
  image: string;
  name: string;
  status: "Active" | "Inactive";
}) {
  const { categories } = await getMongoCollections();
  const slug = slugify(record.name);
  const doc: Omit<CategoryRecord, "_id"> & { _id: string } = {
    _id: record.id,
    displayOrder: record.displayOrder,
    homePlacement: record.homeTop ? "Top" : "Bottom",
    image: record.image,
    name: record.name,
    slug,
    status: record.status,
  };
  await categories.updateOne(
    { _id: record.id },
    { $set: doc, $setOnInsert: { _id: record.id } },
    { upsert: true },
  );
  return doc;
}

export async function deleteMongoCategoryById(id: string) {
  const { categories } = await getMongoCollections();
  await categories.deleteOne({ _id: id });
}

export async function bulkUpdateMongoCategoryStatus(ids: string[], status: "Active" | "Inactive") {
  const { categories } = await getMongoCollections();
  await categories.updateMany({ _id: { $in: ids } }, { $set: { status } });
}

export async function deleteMongoCategoriesByIds(ids: string[]) {
  const { categories } = await getMongoCollections();
  await categories.deleteMany({ _id: { $in: ids } });
}

// ─── Newsletter ────────────────────────────────────────────────────────────────

export async function listMongoNewsletter() {
  const { newsletters } = await getMongoCollections();
  return newsletters.find({}).sort({ subscribedAt: -1 }).toArray();
}

export async function upsertMongoNewsletterRecord(record: {
  email: string;
  joinedAt: string;
  lastSent: string;
  status: "Subscribed" | "Unsubscribed";
}) {
  const { newsletters } = await getMongoCollections();
  const doc = {
    email: record.email,
    joinedAt: record.joinedAt,
    lastSent: record.lastSent,
    source: "admin",
    status: record.status,
    subscribedAt: record.joinedAt,
  };
  await newsletters.updateOne(
    { email: record.email },
    { $set: doc },
    { upsert: true },
  );
  return doc;
}

export async function bulkUnsubscribeNewsletter(emails: string[]) {
  const { newsletters } = await getMongoCollections();
  await newsletters.updateMany({ email: { $in: emails } }, { $set: { status: "Unsubscribed" } });
}

export async function deleteMongoNewsletterByEmails(emails: string[]) {
  const { newsletters } = await getMongoCollections();
  await newsletters.deleteMany({ email: { $in: emails } });
}

export async function markNewsletterSent(emails: string[]) {
  const { newsletters } = await getMongoCollections();
  const stamp = new Date().toISOString();
  await newsletters.updateMany(
    { email: { $in: emails } },
    { $set: { lastSent: stamp } },
  );
  return stamp;
}

// ─── Meta Tags ─────────────────────────────────────────────────────────────────

export async function listMongoMetaTags() {
  const { metaTags } = await getMongoCollections();
  return metaTags.find({}).sort({ url: 1 }).toArray();
}

export async function upsertMongoMetaTag(record: {
  description: string;
  id: string;
  keywords: string;
  title: string;
  url: string;
}) {
  const { metaTags } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: MetaTagRecord = {
    _id: record.id,
    createdAt: now,
    description: record.description,
    keywords: record.keywords,
    title: record.title,
    updatedAt: now,
    url: record.url,
  };
  await metaTags.updateOne(
    { _id: record.id },
    {
      $set: { description: doc.description, keywords: doc.keywords, title: doc.title, updatedAt: now, url: doc.url },
      $setOnInsert: { _id: doc._id, createdAt: now },
    },
    { upsert: true },
  );
  return doc;
}

export async function deleteMongoMetaTagById(id: string) {
  const { metaTags } = await getMongoCollections();
  await metaTags.deleteOne({ _id: id });
}

// ─── Subadmins ─────────────────────────────────────────────────────────────────

export async function listMongoSubadmins() {
  const { subadmins } = await getMongoCollections();
  return subadmins.find({}).sort({ registeredAt: -1 }).toArray();
}

export async function upsertMongoSubadmin(record: {
  email: string;
  id: string;
  name: string;
  phone: string;
  registeredAt: string;
  status: "Active" | "Inactive";
  username: string;
}) {
  const { subadmins } = await getMongoCollections();
  const doc: SubadminRecord = {
    _id: record.id,
    email: record.email,
    name: record.name,
    phone: record.phone,
    registeredAt: record.registeredAt,
    status: record.status,
    username: record.username,
  };
  await subadmins.updateOne(
    { _id: record.id },
    { $set: doc, $setOnInsert: { _id: record.id } },
    { upsert: true },
  );
  return doc;
}

export async function bulkUpdateMongoSubadminStatus(ids: string[], status: "Active" | "Inactive") {
  const { subadmins } = await getMongoCollections();
  await subadmins.updateMany({ _id: { $in: ids } }, { $set: { status } });
}

export async function deleteMongoSubadminsByIds(ids: string[]) {
  const { subadmins } = await getMongoCollections();
  await subadmins.deleteMany({ _id: { $in: ids } });
}

// ─── Admin Settings ────────────────────────────────────────────────────────────

export async function getMongoAdminSettings(): Promise<AdminSettingsExtended | null> {
  const { adminSettings } = await getMongoCollections();
  return adminSettings.findOne({ _id: "site" });
}

export async function saveMongoAdminSettings(record: Omit<AdminSettingsExtended, "_id" | "updatedAt" | "passwordHash">) {
  const { adminSettings } = await getMongoCollections();
  const now = new Date().toISOString();
  await adminSettings.updateOne(
    { _id: "site" },
    {
      $set: { ...record, updatedAt: now },
      $setOnInsert: { _id: "site" },
    },
    { upsert: true },
  );
}

export async function getMongoAdminPasswordHash(): Promise<string | null> {
  const { adminSettings } = await getMongoCollections();
  const doc = await adminSettings.findOne({ _id: "site" });
  return doc?.passwordHash ?? null;
}

export async function setMongoAdminPasswordHash(hash: string) {
  const { adminSettings } = await getMongoCollections();
  await adminSettings.updateOne(
    { _id: "site" },
    { $set: { passwordHash: hash, updatedAt: new Date().toISOString() }, $setOnInsert: { _id: "site" } },
    { upsert: true },
  );
}

// ─── Static Pages ──────────────────────────────────────────────────────────────

export async function listMongoStaticPages() {
  const { staticPages } = await getMongoCollections();
  return staticPages.find({}).sort({ title: 1 }).toArray();
}

export async function upsertMongoStaticPage(record: {
  content: string;
  id: string;
  slug: string;
  status: "Active" | "Inactive";
  title: string;
}) {
  const { staticPages } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: StaticPageRecord = {
    _id: record.id,
    content: record.content,
    slug: record.slug,
    status: record.status,
    title: record.title,
    updatedAt: now,
  };
  await staticPages.updateOne(
    { _id: record.id },
    { $set: { content: doc.content, slug: doc.slug, status: doc.status, title: doc.title, updatedAt: now }, $setOnInsert: { _id: doc._id } },
    { upsert: true },
  );
  return doc;
}

export async function deleteMongoStaticPageById(id: string) {
  const { staticPages } = await getMongoCollections();
  await staticPages.deleteOne({ _id: id });
}

// ─── Enquiries ─────────────────────────────────────────────────────────────────

export async function listMongoEnquiries(type?: EnquiryRecord["type"]) {
  const { enquiries } = await getMongoCollections();
  const filter = type ? { type } : {};
  return enquiries.find(filter).sort({ createdAt: -1 }).toArray();
}

export async function bulkUpdateMongoEnquiryStatus(ids: string[], status: EnquiryRecord["status"]) {
  const { enquiries } = await getMongoCollections();
  await enquiries.updateMany({ _id: { $in: ids } }, { $set: { status } });
}

export async function deleteMongoEnquiriesByIds(ids: string[]) {
  const { enquiries } = await getMongoCollections();
  await enquiries.deleteMany({ _id: { $in: ids } });
}

// ─── Media (Banners / Header Images) ──────────────────────────────────────────

export async function listMongoMedia(kind: MediaRecord["kind"]) {
  const { media } = await getMongoCollections();
  return media.find({ kind }).sort({ position: 1 }).toArray();
}

export async function upsertMongoMedia(record: {
  id: string;
  image: string;
  kind: "banner" | "header-image";
  lineOne: string;
  lineTwo: string;
  position: string;
  status: "Active" | "Inactive";
}) {
  const { media } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: MediaRecord = {
    _id: record.id,
    image: record.image,
    kind: record.kind,
    lineOne: record.lineOne,
    lineTwo: record.lineTwo,
    position: record.position,
    status: record.status,
    updatedAt: now,
  };
  await media.updateOne(
    { _id: record.id },
    { $set: { image: doc.image, lineOne: doc.lineOne, lineTwo: doc.lineTwo, position: doc.position, status: doc.status, updatedAt: now }, $setOnInsert: { _id: doc._id, kind: doc.kind } },
    { upsert: true },
  );
  return doc;
}

export async function bulkUpdateMongoMediaStatus(ids: string[], status: "Active" | "Inactive") {
  const { media } = await getMongoCollections();
  await media.updateMany({ _id: { $in: ids } }, { $set: { status } });
}

export async function deleteMongoMediaByIds(ids: string[]) {
  const { media } = await getMongoCollections();
  await media.deleteMany({ _id: { $in: ids } });
}

export type MongoCollectionMap = {
  adminSettings: import("mongodb").Collection<AdminSettingsExtended>;
  categories: import("mongodb").Collection<CategoryRecord>;
  enquiries: import("mongodb").Collection<EnquiryRecord>;
  leads: import("mongodb").Collection<LeadRecord>;
  media: import("mongodb").Collection<MediaRecord>;
  members: import("mongodb").Collection<MemberAccount>;
  metaTags: import("mongodb").Collection<MetaTagRecord>;
  newsletters: import("mongodb").Collection<NewsletterRecord>;
  staticPages: import("mongodb").Collection<StaticPageRecord>;
  subadmins: import("mongodb").Collection<SubadminRecord>;
};

