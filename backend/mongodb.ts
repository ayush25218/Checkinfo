import { MongoClient, type Collection, type Db } from "mongodb";
import { categories } from "./checkinfo";
import { listingLocationText, listingPublicPath } from "./listingSeo";
import type {
  MemberEnquiry,
  MemberListing,
  MemberNotification,
  MemberReview,
  SupportTicket,
} from "./member";

export type UserAccount = {
  _id?: string;
  createdAt: string;
  email: string;
  name: string;
  passwordHash: string;
  phone: string;
  role: "user";
  username: string;
};

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
  passwordHash?: string;
  passwordUpdatedAt: string | null;
  profile: MemberProfile;
  registeredAt: string;
  reviews: MemberReview[];
  tickets: SupportTicket[];
};

export type BusinessListingRecord = MemberListing & {
  _id: string;
  badge: "Featured" | "Popular" | "Verified";
  contact: string;
  createdAt: string;
  details: string;
  ownerEmail: string;
  ownerId: string;
  ownerName: string;
  publicPath: string;
  updatedAt: string;
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

export type EnquiryRecord = {
  _id: string;
  createdAt: string;
  email: string;
  message: string;
  name: string;
  phone: string;
  receivedAt: string;
  status: "New" | "Replied" | "Closed";
  subject?: string;
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

type TestimonialRecord = {
  _id: string;
  description: string;
  displayOrder: number;
  name: string;
  status: "Active" | "Inactive";
  updatedAt: string;
};

type FaqRecord = {
  _id: string;
  answer: string;
  displayOrder: number;
  question: string;
  status: "Active" | "Inactive";
  updatedAt: string;
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
    businesses: db.collection<BusinessListingRecord>("businesses"),
    categories: db.collection<CategoryRecord>("categories"),
    enquiries: db.collection<EnquiryRecord>("enquiries"),
    faqs: db.collection<FaqRecord>("faqs"),
    leads: db.collection<LeadRecord>("advertising_leads"),
    media: db.collection<MediaRecord>("media"),
    members: db.collection<MemberAccount>("members"),
    metaTags: db.collection<MetaTagRecord>("meta_tags"),
    newsletters: db.collection<NewsletterRecord>("newsletter_subscribers"),
    settings: db.collection<SettingRecord>("settings"),
    staticPages: db.collection<StaticPageRecord>("static_pages"),
    subadmins: db.collection<SubadminRecord>("subadmins"),
    testimonials: db.collection<TestimonialRecord>("testimonials"),
    users: db.collection<UserAccount>("users"),
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
    collections.businesses.createIndex({ ownerId: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ status: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ category: 1, status: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ state: 1, city: 1, subcity: 1, status: 1 }),
    collections.businesses.createIndex({ name: "text", category: "text", subcategory: "text", businessType: "text", city: "text", subcity: "text", state: "text", keywords: "text" }),
    collections.categories.createIndex({ slug: 1 }, { unique: true }),
    collections.categories.createIndex({ status: 1, displayOrder: 1 }),
    collections.enquiries.createIndex({ createdAt: -1 }),
    collections.enquiries.createIndex({ type: 1, status: 1 }),
    collections.faqs.createIndex({ displayOrder: 1 }),
    collections.leads.createIndex({ createdAt: -1 }),
    collections.media.createIndex({ kind: 1 }),
    collections.members.createIndex({ "profile.username": 1 }),
    collections.metaTags.createIndex({ url: 1 }, { unique: true }),
    collections.newsletters.createIndex({ email: 1 }, { unique: true }),
    collections.staticPages.createIndex({ slug: 1 }, { unique: true }),
    collections.subadmins.createIndex({ username: 1 }, { unique: true }),
    collections.testimonials.createIndex({ displayOrder: 1 }),
    collections.users.createIndex({ username: 1 }, { unique: true }),
    collections.users.createIndex({ email: 1 }, { unique: true }),
  ]);
}

// ─── User Accounts (Visitor Role) ──────────────────────────────────────────────

export async function getMongoUserByUsernameOrEmail(identifier: string): Promise<UserAccount | null> {
  if (!isMongoConfigured() || !identifier) return null;
  const { users } = await getMongoCollections();
  const query = identifier.trim().toLowerCase();
  return users.findOne({
    $or: [{ username: query }, { email: query }],
  });
}

export async function createMongoUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  phone: string;
  username: string;
}): Promise<UserAccount> {
  const { users } = await getMongoCollections();
  const now = new Date().toISOString();
  const username = data.username.trim().toLowerCase();
  const email = data.email.trim().toLowerCase();

  const userDoc: UserAccount = {
    _id: username,
    createdAt: now,
    email,
    name: data.name,
    passwordHash: data.passwordHash,
    phone: data.phone,
    role: "user",
    username,
  };

  await users.updateOne(
    { username },
    { $set: userDoc, $setOnInsert: { _id: username } },
    { upsert: true },
  );

  return userDoc;
}

// ─── Member Account Lookup By Username or Email ────────────────────────────────

export async function getMongoMemberByUsernameOrEmail(identifier: string): Promise<MemberAccount | null> {
  if (!isMongoConfigured() || !identifier) return null;
  const { members } = await getMongoCollections();
  const query = identifier.trim().toLowerCase();

  return members.findOne({
    $or: [
      { _id: query },
      { "profile.username": query },
      { "profile.email": query },
    ],
  });
}

// ─── Seed Initial Default Auth Accounts in MongoDB ──────────────────────────────

export async function createMongoMember(data: {
  email: string;
  name: string;
  passwordHash: string;
  phone: string;
  username: string;
}): Promise<MemberAccount> {
  const { members } = await getMongoCollections();
  const username = data.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "");
  const email = data.email.trim().toLowerCase();
  const existing = await members.findOne({
    $or: [
      { _id: username },
      { "profile.username": username },
      { "profile.email": email },
    ],
  });

  if (existing) {
    throw new Error("MEMBER_ALREADY_EXISTS");
  }

  const account = emptyMemberAccount(username);
  account.passwordHash = data.passwordHash;
  account.passwordUpdatedAt = new Date().toISOString();
  account.profile.email = email;
  account.profile.initials = data.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || username.slice(0, 2).toUpperCase();
  account.profile.name = data.name;
  account.profile.phone = data.phone;
  account.profile.username = username;
  account.registeredAt = new Date().toISOString();

  await members.insertOne(account);
  return account;
}
export async function seedMongoAuthAccounts(hashPasswordFn: (password: string) => string) {
  if (!isMongoConfigured()) return;
  const { adminSettings, users, members } = await getMongoCollections();

  // 1. Seed Admin account passwordHash in site settings if not present
  const adminDoc = await adminSettings.findOne({ _id: "site" });
  if (!adminDoc?.passwordHash) {
    const defaultAdminPass = process.env.ADMIN_LOGIN_PASSWORD || "admin123";
    await adminSettings.updateOne(
      { _id: "site" },
      { $set: { passwordHash: hashPasswordFn(defaultAdminPass), updatedAt: new Date().toISOString() }, $setOnInsert: { _id: "site" } },
      { upsert: true },
    );
  }

  // 2. Seed Visitor user account if not present
  const defaultUserIdent = (process.env.USER_LOGIN_USERNAME || "user").toLowerCase();
  const existingUser = await users.findOne({ username: defaultUserIdent });
  if (!existingUser) {
    const defaultUserPass = process.env.USER_LOGIN_PASSWORD || "user123";
    await users.updateOne(
      { username: defaultUserIdent },
      {
        $set: {
          createdAt: new Date().toISOString(),
          email: "user@checkinfo.in",
          name: "Default Visitor User",
          passwordHash: hashPasswordFn(defaultUserPass),
          phone: "9876543210",
          role: "user",
          username: defaultUserIdent,
        },
        $setOnInsert: { _id: defaultUserIdent },
      },
      { upsert: true },
    );
  }

  // 3. Seed Business member account if not present
  const defaultMemberIdent = (process.env.MEMBER_LOGIN_USERNAME || "member").toLowerCase();
  const existingMember = await members.findOne({
    $or: [{ _id: defaultMemberIdent }, { "profile.username": defaultMemberIdent }],
  });

  if (!existingMember || !existingMember.passwordHash) {
    const defaultMemberPass = process.env.MEMBER_LOGIN_PASSWORD || "member123";
    const memberId = defaultMemberIdent;
    const baseAccount = existingMember || emptyMemberAccount(memberId);

    baseAccount.passwordHash = hashPasswordFn(defaultMemberPass);
    baseAccount.profile.username = defaultMemberIdent;
    baseAccount.profile.email = baseAccount.profile.email || "member@checkinfo.in";

    await members.updateOne(
      { _id: memberId },
      { $set: baseAccount, $setOnInsert: { _id: memberId } },
      { upsert: true },
    );
  }
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

  if ((await collections.businesses.countDocuments()) === 0) {
    const memberDocs = await collections.members.find({ "listings.0": { $exists: true } }).toArray();
    for (const member of memberDocs) {
      await syncMongoMemberListings(member);
    }
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

function businessId(ownerId: string, listingId: string) {
  return `${ownerId}::${listingId}`;
}

function badgeForStatus(status: MemberListing["status"]) {
  if (status === "Featured") return "Featured";
  if (status === "Popular") return "Popular";
  return "Verified";
}

function businessRecordFromListing(account: MemberAccount, listing: MemberListing): Omit<BusinessListingRecord, "createdAt"> {
  return {
    ...listing,
    _id: businessId(account.profile.id, listing.id),
    address: listing.address || listingLocationText(listing),
    badge: badgeForStatus(listing.status),
    contact: listing.mobile || listing.email,
    details: listing.description || listing.keywords,
    location: listingLocationText(listing),
    ownerEmail: account.profile.email,
    ownerId: account.profile.id,
    ownerName: account.profile.name,
    publicPath: listingPublicPath(listing),
    updatedAt: new Date().toISOString(),
  };
}

export async function syncMongoMemberListings(account: MemberAccount) {
  const { businesses } = await getMongoCollections();
  const listingIds = account.listings.map((listing) => businessId(account.profile.id, listing.id));

  if (account.listings.length) {
    await businesses.bulkWrite(
      account.listings.map((listing) => {
        const record = businessRecordFromListing(account, listing);
        const { _id, ...fields } = record;
        return {
          updateOne: {
            filter: { _id },
            update: {
              $set: fields,
              $setOnInsert: { _id, createdAt: new Date().toISOString() },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );
  }

  await businesses.deleteMany({
    ownerId: account.profile.id,
    ...(listingIds.length ? { _id: { $nin: listingIds } } : {}),
  });
}

export async function saveMongoMember(account: MemberAccount) {
  const { members } = await getMongoCollections();
  const { _id, ...record } = account;
  await members.updateOne({ _id: account.profile.id }, { $set: record, $setOnInsert: { _id: _id ?? account.profile.id } }, { upsert: true });
  await syncMongoMemberListings(account);
}

export async function deleteMongoMembersByIds(ids: string[]) {
  if (!ids.length) return;
  const { businesses, members } = await getMongoCollections();
  await Promise.all([
    businesses.deleteMany({ ownerId: { $in: ids } }),
    members.deleteMany({ _id: { $in: ids } }),
  ]);
}

export async function listMongoMembers(options: { limit?: number } = {}) {
  const { members } = await getMongoCollections();
  const cursor = members.find({}).sort({ registeredAt: -1 });
  if (options.limit && options.limit > 0) cursor.limit(options.limit);
  return cursor.toArray();
}

export async function countMongoMembers(filter: Record<string, unknown> = {}) {
  const { members } = await getMongoCollections();
  return members.countDocuments(filter);
}

export async function listMongoBusinessListings(options: { limit?: number; status?: MemberListing["status"] } = {}) {
  const { businesses } = await getMongoCollections();
  const filter: Partial<Pick<BusinessListingRecord, "status">> = options.status ? { status: options.status } : {};
  const cursor = businesses.find(filter).sort({ updatedAt: -1 });
  if (options.limit && options.limit > 0) cursor.limit(options.limit);
  return cursor.toArray();
}

export async function countMongoBusinessListings(filter: Record<string, unknown> = {}) {
  const { businesses } = await getMongoCollections();
  return businesses.countDocuments(filter);
}

export async function updateMongoBusinessStatus(ownerId: string, listingId: string, status: MemberListing["status"]) {
  const { businesses } = await getMongoCollections();
  await businesses.updateOne(
    { _id: businessId(ownerId, listingId) },
    { $set: { status, badge: badgeForStatus(status), updatedAt: new Date().toISOString() } },
  );
}

export async function saveNewsletterSubscription(email: string, source = "website") {
  if (!isMongoConfigured() || !email) return null;

  const { newsletters } = await getMongoCollections();
  const record = { email, source, subscribedAt: new Date().toISOString() };
  await newsletters.updateOne({ email }, { $set: record }, { upsert: true });
  return record;
}

export async function saveContactEnquiry(payload: {
  email?: string;
  message?: string;
  name?: string;
  phone?: string;
  subject?: string;
  type?: EnquiryRecord["type"];
}) {
  const now = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const cleanName = String(payload.name || "Website Lead").trim();
  const cleanEmail = String(payload.email || "").trim();
  const cleanPhone = String(payload.phone || "").trim();
  const cleanSubject = String(payload.subject || "General Contact Enquiry").trim();
  const cleanMessage = String(payload.message || "Lead request from website").trim();

  const enquiryDoc: EnquiryRecord = {
    _id: `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    email: cleanEmail,
    message: cleanSubject ? `[Subject: ${cleanSubject}]\n\n${cleanMessage}` : cleanMessage,
    name: cleanName,
    phone: cleanPhone,
    receivedAt: dateStr,
    status: "New",
    subject: cleanSubject,
    type: payload.type || "Contact",
  };

  if (isMongoConfigured()) {
    try {
      const { enquiries, leads } = await getMongoCollections();
      await Promise.all([
        enquiries.insertOne(enquiryDoc),
        leads.insertOne({ ...payload, createdAt: now, source: "contact-form" }),
      ]);
    } catch (dbErr) {
      console.error("MongoDB error in saveContactEnquiry:", dbErr);
    }
  }

  return enquiryDoc;
}

export async function saveAdvertisingLead(payload: Record<string, unknown>, source = "advertise-form") {
  if (!isMongoConfigured()) return null;

  const { leads, enquiries } = await getMongoCollections();
  const now = new Date().toISOString();
  const record = { ...payload, createdAt: now, source };
  await leads.insertOne(record);

  const enquiryType = (payload.type as EnquiryRecord["type"]) || "Advertise";
  const enqDoc: EnquiryRecord = {
    _id: `enq-${Date.now()}`,
    createdAt: now,
    email: String(payload.email || ""),
    message: String(payload.message || payload.details || payload.comment || "Website enquiry lead"),
    name: String(payload.name || payload.poster || payload.fullName || "Website Lead"),
    phone: String(payload.phone || payload.mobile || payload.contact || ""),
    receivedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    status: "New",
    subject: String(payload.subject || "Advertising Lead"),
    type: enquiryType,
  };
  await enquiries.insertOne(enqDoc);

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

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function listMongoTestimonials() {
  const { testimonials } = await getMongoCollections();
  return testimonials.find({}).sort({ displayOrder: 1 }).toArray();
}

export async function upsertMongoTestimonial(record: {
  description: string;
  id: string;
  name: string;
  order: number;
  status: "Active" | "Inactive";
}) {
  const { testimonials } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: TestimonialRecord = {
    _id: record.id,
    description: record.description,
    displayOrder: record.order,
    name: record.name,
    status: record.status,
    updatedAt: now,
  };
  await testimonials.updateOne(
    { _id: record.id },
    { $set: { description: doc.description, displayOrder: doc.displayOrder, name: doc.name, status: doc.status, updatedAt: now }, $setOnInsert: { _id: doc._id } },
    { upsert: true },
  );
  return doc;
}

export async function deleteMongoTestimonialById(id: string) {
  const { testimonials } = await getMongoCollections();
  await testimonials.deleteOne({ _id: id });
}

// ─── FAQs ──────────────────────────────────────────────────────────────────────

export async function listMongoFaqs() {
  const { faqs } = await getMongoCollections();
  return faqs.find({}).sort({ displayOrder: 1 }).toArray();
}

export async function upsertMongoFaq(record: {
  answer: string;
  id: string;
  order: number;
  question: string;
  status: "Active" | "Inactive";
}) {
  const { faqs } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: FaqRecord = {
    _id: record.id,
    answer: record.answer,
    displayOrder: record.order,
    question: record.question,
    status: record.status,
    updatedAt: now,
  };
  await faqs.updateOne(
    { _id: record.id },
    { $set: { answer: doc.answer, displayOrder: doc.displayOrder, question: doc.question, status: doc.status, updatedAt: now }, $setOnInsert: { _id: doc._id } },
    { upsert: true },
  );
  return doc;
}

export async function deleteMongoFaqById(id: string) {
  const { faqs } = await getMongoCollections();
  await faqs.deleteOne({ _id: id });
}

export async function updateMongoFaqsOrder(records: Array<{ id: string; order: number }>) {
  const { faqs } = await getMongoCollections();
  await Promise.all(
    records.map((item) => faqs.updateOne({ _id: item.id }, { $set: { displayOrder: item.order } })),
  );
}

export type MongoCollectionMap = {
  adminSettings: import("mongodb").Collection<AdminSettingsExtended>;
  categories: import("mongodb").Collection<CategoryRecord>;
  enquiries: import("mongodb").Collection<EnquiryRecord>;
  faqs: import("mongodb").Collection<FaqRecord>;
  leads: import("mongodb").Collection<LeadRecord>;
  media: import("mongodb").Collection<MediaRecord>;
  members: import("mongodb").Collection<MemberAccount>;
  metaTags: import("mongodb").Collection<MetaTagRecord>;
  newsletters: import("mongodb").Collection<NewsletterRecord>;
  staticPages: import("mongodb").Collection<StaticPageRecord>;
  subadmins: import("mongodb").Collection<SubadminRecord>;
  testimonials: import("mongodb").Collection<TestimonialRecord>;
};
