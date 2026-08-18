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
  couponCode?: string;
  enquiries: MemberEnquiry[];
  invoices?: Array<{
    amount: number;
    createdAt: string;
    id: string;
    packageName: string;
    status: "Paid" | "Trial" | "Manual";
  }>;
  listings: MemberListing[];
  loggedOutAt: string | null;
  notifications: MemberNotification[];
  packageExpiresAt?: string | null;
  packageName: string;
  paymentStatus?: "Free" | "Trial" | "Paid" | "Manual";
  passwordHash?: string;
  passwordUpdatedAt: string | null;
  profile: MemberProfile;
  registeredAt: string;
  reviews: MemberReview[];
  tickets: SupportTicket[];
  trialEndsAt?: string | null;
  walletCredits?: number;
};

export type BusinessListingRecord = MemberListing & {
  _id: string;
  approvalStatus: "Draft" | "Pending" | "Approved" | "Rejected";
  approvedAt?: string;
  approvedBy?: string;
  badge: "Featured" | "Popular" | "Verified";
  contact: string;
  createdAt: string;
  createdBy: string;
  details: string;
  memberId: string;
  ownerEmail: string;
  ownerId: string;
  ownerName: string;
  packageName?: string;
  placementExpiresAt?: string;
  placementStartsAt?: string;
  publicPath: string;
  submittedAt?: string;
  updatedAt: string;
};

export type AdminAuditRecord = {
  _id: string;
  action: string;
  actorId: string;
  actorRole: "admin" | "subadmin";
  businessId?: string;
  createdAt: string;
  details?: Record<string, unknown>;
  memberId?: string;
  ownerId?: string;
  resource: string;
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

type SubcategoryRecord = {
  _id: string;
  businessTypes: Array<{ name: string; slug: string }>;
  categoryName: string;
  categorySlug: string;
  createdAt: string;
  name: string;
  slug: string;
  updatedAt: string;
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

export type SubadminRecord = {
  _id: string;
  email: string;
  name: string;
  passwordHash?: string;
  permissions?: string[];
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

type StateRecord = {
  _id: string;
  countryName: string;
  createdAt: string;
  name: string;
  status: "Active" | "Inactive";
  updatedAt: string;
};

type CityRecord = {
  _id: string;
  countryName: string;
  createdAt: string;
  name: string;
  stateName: string;
  status: "Active" | "Inactive";
  updatedAt: string;
};

type LocationRecord = {
  _id: string;
  cityName: string;
  countryName: string;
  createdAt: string;
  name: string;
  stateName: string;
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
    appName: "Checkinfo",
    connectTimeoutMS: 6000,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 6000,
    socketTimeoutMS: 15000,
    tls: true,
  }).connect().catch((error) => {
    globalMongo.__checkinfoMongoClientPromise = undefined;
    throw error;
  });
  return globalMongo.__checkinfoMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB?.trim() || "checkinfo");
}

export function getMongoErrorSummary(error: unknown) {
  const err = error as { code?: unknown; codeName?: unknown; message?: unknown; name?: unknown };
  const message = typeof err?.message === "string" ? err.message : "Unknown MongoDB error";

  return {
    code: typeof err?.code === "number" || typeof err?.code === "string" ? err.code : undefined,
    codeName: typeof err?.codeName === "string" ? err.codeName : undefined,
    message: message
      .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb://***@")
      .replace(/\/\/([^:/\s]+):([^@\s]+)@/g, "//***:***@"),
    name: typeof err?.name === "string" ? err.name : "MongoError",
  };
}

export async function getMongoHealth() {
  const configured = isMongoConfigured();
  const dbName = process.env.MONGODB_DB?.trim() || "checkinfo";

  if (!configured) {
    return {
      configured,
      dbName,
      ok: false,
      status: "missing-env",
      timestamp: new Date().toISOString(),
    };
  }

  const startedAt = Date.now();

  try {
    const db = await getMongoDb();
    const ping = await db.admin().ping();
    const collections = await getMongoCollections();
    const [members, businesses] = await Promise.all([
      collections.members.estimatedDocumentCount(),
      collections.businesses.estimatedDocumentCount(),
    ]);

    return {
      configured,
      dbName,
      latencyMs: Date.now() - startedAt,
      ok: Boolean(ping?.ok),
      status: "connected",
      counts: { businesses, members },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      configured,
      dbName,
      error: getMongoErrorSummary(error),
      latencyMs: Date.now() - startedAt,
      ok: false,
      status: "connection-failed",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getMongoCollections() {
  const db = await getMongoDb();

  return {
    adminSettings: db.collection<AdminSettingsExtended>("admin_settings"),
    auditLogs: db.collection<AdminAuditRecord>("audit_logs"),
    businesses: db.collection<BusinessListingRecord>("businesses"),
    categories: db.collection<CategoryRecord>("categories"),
    cities: db.collection<CityRecord>("cities"),
    enquiries: db.collection<EnquiryRecord>("enquiries"),
    faqs: db.collection<FaqRecord>("faqs"),
    leads: db.collection<LeadRecord>("advertising_leads"),
    locations: db.collection<LocationRecord>("locations"),
    media: db.collection<MediaRecord>("media"),
    members: db.collection<MemberAccount>("members"),
    metaTags: db.collection<MetaTagRecord>("meta_tags"),
    newsletters: db.collection<NewsletterRecord>("newsletter_subscribers"),
    settings: db.collection<SettingRecord>("settings"),
    states: db.collection<StateRecord>("states"),
    staticPages: db.collection<StaticPageRecord>("static_pages"),
    subcategories: db.collection<SubcategoryRecord>("subcategories"),
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
    invoices: [],
    packageExpiresAt: null,
    packageName: "Free Listing",
    paymentStatus: "Free",
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
    trialEndsAt: null,
    walletCredits: 0,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureIndexes(collections: Awaited<ReturnType<typeof getMongoCollections>>) {
  await Promise.all([
    collections.businesses.createIndex({ ownerId: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ memberId: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ approvalStatus: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ placements: 1, status: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ status: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ category: 1, status: 1, updatedAt: -1 }),
    collections.businesses.createIndex({ state: 1, city: 1, subcity: 1, status: 1 }),
    collections.businesses.createIndex({ name: "text", category: "text", subcategory: "text", businessType: "text", city: "text", subcity: "text", state: "text", keywords: "text" }),
    collections.categories.createIndex({ slug: 1 }, { unique: true }),
    collections.auditLogs.createIndex({ createdAt: -1 }),
    collections.auditLogs.createIndex({ resource: 1, action: 1, createdAt: -1 }),
    collections.categories.createIndex({ status: 1, displayOrder: 1 }),
    collections.subcategories.createIndex({ categorySlug: 1, slug: 1 }, { unique: true }),
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
    collections.subadmins.createIndex({ email: 1 }),
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
  const safeRegex = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return users.findOne({
    $or: [
      { username: query },
      { email: query },
      { email: { $regex: new RegExp(`^${safeRegex}$`, "i") } },
      { username: { $regex: new RegExp(`^${safeRegex}$`, "i") } },
    ],
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
  const safeRegex = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return members.findOne({
    $or: [
      { _id: query },
      { "profile.username": query },
      { "profile.email": query },
      { email: query },
      { username: query },
      { "profile.email": { $regex: new RegExp(`^${safeRegex}$`, "i") } },
      { "profile.username": { $regex: new RegExp(`^${safeRegex}$`, "i") } },
      { email: { $regex: new RegExp(`^${safeRegex}$`, "i") } },
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
  const email = data.email.trim().toLowerCase();

  // Check strictly by email address only
  const existing = await members.findOne({
    $or: [
      { "profile.email": email },
      { email: email },
    ],
  });

  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // Generate 100% unique member ID so people with same name never clash
  const uniqueId = `member_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const account = emptyMemberAccount(uniqueId);
  account._id = uniqueId;
  account.passwordHash = data.passwordHash;
  account.passwordUpdatedAt = new Date().toISOString();
  account.profile.email = email;
  account.profile.id = uniqueId;
  account.profile.initials = data.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "MB";
  account.profile.name = data.name;
  account.profile.phone = data.phone;
  account.profile.username = email;
  account.registeredAt = new Date().toISOString();

  await members.insertOne(account);
  return account;
}

export async function upsertMongoOAuthMember(data: {
  email: string;
  id: string;
  name: string;
  provider: "google";
  username: string;
}): Promise<MemberAccount | null> {
  if (!isMongoConfigured()) return null;

  const { members } = await getMongoCollections();
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "");
  const existing = await members.findOne({
    $or: [
      { _id: data.id },
      { "profile.id": data.id },
      { "profile.username": username },
      { "profile.email": email },
    ],
  });

  const recordId = existing?._id || existing?.profile.id || data.id || username;
  const account = existing ? { ...existing } : emptyMemberAccount(recordId);
  const initials = data.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || email.slice(0, 2).toUpperCase() || recordId.slice(0, 2).toUpperCase();

  account._id = recordId;
  account.profile.id = recordId;
  account.profile.email = email;
  account.profile.initials = initials;
  account.profile.name = data.name || account.profile.name || "Business Member";
  account.profile.phone = account.profile.phone || "";
  account.profile.role = `${data.provider} business member`;
  account.profile.status = "Active";
  account.profile.username = existing?.profile.username || username || recordId;
  account.registeredAt = existing?.registeredAt || account.registeredAt || new Date().toISOString();

  await members.updateOne(
    { _id: recordId },
    { $set: account, $setOnInsert: { _id: recordId } },
    { upsert: true },
  );

  return account;
}

let hasSeededMongoAuth = false;

export async function seedMongoAuthAccounts(hashPasswordFn: (password: string) => string) {
  if (!isMongoConfigured() || hasSeededMongoAuth) return;
  hasSeededMongoAuth = true;
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

function defaultPlacementsForStatus(status: MemberListing["status"]) {
  if (status === "Featured") return ["new", "featured"] as NonNullable<MemberListing["placements"]>;
  if (status === "Popular") return ["new", "trending"] as NonNullable<MemberListing["placements"]>;
  if (status === "Active") return ["new"] as NonNullable<MemberListing["placements"]>;
  return [] as NonNullable<MemberListing["placements"]>;
}

function normalizePlacements(listing: Partial<MemberListing>) {
  const raw = Array.isArray(listing.placements) ? listing.placements : defaultPlacementsForStatus(listing.status ?? "Draft");
  const allowed = new Set(["new", "featured", "trending"]);
  return Array.from(new Set(raw.filter((item): item is "new" | "featured" | "trending" => allowed.has(item))));
}

function badgeForPlacements(status: MemberListing["status"], placements: NonNullable<MemberListing["placements"]>) {
  if (placements.includes("featured")) return "Featured";
  if (placements.includes("trending")) return "Popular";
  return badgeForStatus(status);
}

function approvalStatusForListing(listing: Pick<MemberListing, "approvalStatus" | "status">) {
  if (listing.approvalStatus) return listing.approvalStatus;
  if (listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular") return "Approved";
  if (listing.status === "Draft") return "Draft";
  return "Pending";
}

function businessRecordFromListing(account: MemberAccount, listing: MemberListing): Omit<BusinessListingRecord, "createdAt"> {
  const placements = normalizePlacements(listing);
  const ownerId = listing.ownerId || account.profile.id;
  const memberId = listing.memberId || account.profile.id;
  const createdBy = listing.createdBy || memberId;
  const publishedReviews = account.reviews.filter((review) => review.status === "Published");
  const rating = publishedReviews.length
    ? Number((publishedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / publishedReviews.length).toFixed(1))
    : listing.rating;
  return {
    ...listing,
    _id: businessId(account.profile.id, listing.id),
    address: listing.address || listingLocationText(listing),
    approvalStatus: approvalStatusForListing(listing),
    approvedAt: listing.approvedAt,
    approvedBy: listing.approvedBy,
    badge: badgeForPlacements(listing.status, placements),
    contact: listing.mobile || listing.email,
    createdBy,
    details: listing.description || listing.keywords,
    location: listingLocationText(listing),
    memberId,
    ownerEmail: account.profile.email,
    ownerId,
    ownerName: account.profile.name,
    packageName: account.packageName,
    placementExpiresAt: listing.placementExpiresAt,
    placementStartsAt: listing.placementStartsAt,
    placements,
    publicPath: listingPublicPath(listing),
    rating,
    reviewCount: publishedReviews.length || listing.reviewCount,
    submittedAt: listing.submittedAt,
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
        const { _id, ...fields } = record as any;
        delete fields.createdAt;
        return {
          updateOne: {
            filter: { _id },
            update: {
              $set: { ...fields, updatedAt: new Date().toISOString() },
              $setOnInsert: { _id, createdAt: listing.createdAt || new Date().toISOString() },
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
  await Promise.all([
    members.updateOne({ _id: account.profile.id }, { $set: record, $setOnInsert: { _id: _id ?? account.profile.id } }, { upsert: true }),
    syncMongoMemberListings(account)
  ]);
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

export async function logMongoAdminAudit(record: Omit<AdminAuditRecord, "_id" | "createdAt">) {
  const { auditLogs } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: AdminAuditRecord = {
    _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    ...record,
  };
  await auditLogs.insertOne(doc);
  return doc;
}

export async function listMongoAdminAuditLogs(options: { limit?: number } = {}) {
  const { auditLogs } = await getMongoCollections();
  const cursor = auditLogs.find({}).sort({ createdAt: -1 });
  if (options.limit && options.limit > 0) cursor.limit(options.limit);
  return cursor.toArray();
}

export async function updateMongoBusinessStatus(
  ownerId: string,
  listingId: string,
  status: MemberListing["status"],
  actorId = "admin",
) {
  const { businesses } = await getMongoCollections();
  const existing = await businesses.findOne({ _id: businessId(ownerId, listingId) }, { projection: { placements: 1 } });
  const placements = status === "Active"
    ? Array.from(new Set([...(normalizePlacements(existing ?? { status })), "new" as const]))
    : normalizePlacements(existing ?? { status });
  const now = new Date().toISOString();
  const approvalStatus = status === "Active" || status === "Featured" || status === "Popular"
    ? "Approved"
    : status === "Draft"
      ? "Draft"
      : status === "Inactive"
        ? "Rejected"
        : "Pending";
  const setFields: Partial<BusinessListingRecord> = {
    approvalStatus,
    badge: badgeForPlacements(status, placements),
    placements,
    status,
    updatedAt: now,
  };
  if (approvalStatus === "Approved") {
    setFields.approvedAt = now;
    setFields.approvedBy = actorId;
  }
  await businesses.updateOne(
    { _id: businessId(ownerId, listingId) },
    {
      $set: setFields,
      ...(approvalStatus === "Approved" ? {} : { $unset: { approvedAt: "", approvedBy: "" } }),
    },
  );
}

export async function updateMongoBusinessPlacements(
  ownerId: string,
  listingId: string,
  placements: NonNullable<MemberListing["placements"]>,
  actorId = "admin",
  options: { placementExpiresAt?: string; placementStartsAt?: string } = {},
) {
  const { businesses } = await getMongoCollections();
  const normalized = normalizePlacements({ placements, status: "Active" });
  const now = new Date().toISOString();
  await businesses.updateOne(
    { _id: businessId(ownerId, listingId) },
    {
      $set: {
        approvalStatus: "Approved",
        approvedAt: now,
        approvedBy: actorId,
        badge: badgeForPlacements("Active", normalized),
        ...(options.placementExpiresAt ? { placementExpiresAt: options.placementExpiresAt } : {}),
        ...(options.placementStartsAt ? { placementStartsAt: options.placementStartsAt } : {}),
        placements: normalized,
        status: "Active",
        updatedAt: now,
      },
    },
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

export async function listMongoSubcategories() {
  const { subcategories } = await getMongoCollections();
  return subcategories.find({}).sort({ categoryName: 1, name: 1 }).toArray();
}

export async function upsertMongoSubcategory(record: {
  businessTypes: Array<{ name: string; slug: string }>;
  categoryName: string;
  categorySlug: string;
  id: string;
  name: string;
  slug: string;
}) {
  const { subcategories } = await getMongoCollections();
  const now = new Date().toISOString();
  const doc: SubcategoryRecord = {
    _id: record.id,
    businessTypes: record.businessTypes,
    categoryName: record.categoryName,
    categorySlug: record.categorySlug,
    createdAt: now,
    name: record.name,
    slug: record.slug,
    updatedAt: now,
  };
  await subcategories.updateOne(
    { _id: record.id },
    {
      $set: {
        businessTypes: doc.businessTypes,
        categoryName: doc.categoryName,
        categorySlug: doc.categorySlug,
        name: doc.name,
        slug: doc.slug,
        updatedAt: now,
      },
      $setOnInsert: { _id: doc._id, createdAt: now },
    },
    { upsert: true },
  );
  return doc;
}

export async function deleteMongoSubcategoryById(id: string) {
  const { subcategories } = await getMongoCollections();
  await subcategories.deleteOne({ _id: id });
}

export async function bulkUpdateMongoCategoryStatus(ids: string[], status: "Active" | "Inactive") {
  const { categories } = await getMongoCollections();
  await categories.updateMany({ _id: { $in: ids } }, { $set: { status } });
}

export async function updateMongoCategoriesOrder(records: Array<{ id: string; order: number }>) {
  const { categories } = await getMongoCollections();
  await Promise.all(
    records.map((record) => categories.updateOne({ _id: record.id }, { $set: { displayOrder: record.order } })),
  );
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

export async function getMongoSubadminByUsernameOrEmail(identifier: string) {
  if (!isMongoConfigured() || !identifier) return null;
  const { subadmins } = await getMongoCollections();
  const query = identifier.trim().toLowerCase();
  return subadmins.findOne({
    $or: [{ username: query }, { email: query }],
  });
}

export async function upsertMongoSubadmin(record: {
  email: string;
  id: string;
  name: string;
  passwordHash?: string;
  permissions?: string[];
  phone: string;
  registeredAt: string;
  status: "Active" | "Inactive";
  username: string;
}) {
  const { subadmins } = await getMongoCollections();
  const doc: SubadminRecord = {
    _id: record.id,
    email: record.email.trim().toLowerCase(),
    name: record.name,
    permissions: Array.isArray(record.permissions) ? record.permissions : ["dashboard"],
    phone: record.phone,
    registeredAt: record.registeredAt,
    status: record.status,
    username: record.username.trim().toLowerCase(),
  };
  if (record.passwordHash) doc.passwordHash = record.passwordHash;
  const { _id, ...setFields } = doc;
  await subadmins.updateOne(
    { _id: record.id },
    { $set: setFields, $setOnInsert: { _id: record.id } },
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

// ─── States ───────────────────────────────────────────────────────────────────

export async function listMongoStates() {
  const { states } = await getMongoCollections();
  return states.find({}).sort({ name: 1 }).toArray();
}

export async function upsertMongoState(record: {
  countryName: string;
  id: string;
  name: string;
  status: "Active" | "Inactive";
}) {
  const { states } = await getMongoCollections();
  const now = new Date().toISOString();
  await states.updateOne(
    { _id: record.id },
    {
      $set: { countryName: record.countryName, name: record.name, status: record.status, updatedAt: now },
      $setOnInsert: { _id: record.id, createdAt: now },
    },
    { upsert: true },
  );
  return record;
}

export async function bulkUpdateMongoStateStatus(ids: string[], status: "Active" | "Inactive") {
  const { states } = await getMongoCollections();
  await states.updateMany({ _id: { $in: ids } }, { $set: { status, updatedAt: new Date().toISOString() } });
}

export async function deleteMongoStatesByIds(ids: string[]) {
  const { states } = await getMongoCollections();
  await states.deleteMany({ _id: { $in: ids } });
}

// ─── Cities ───────────────────────────────────────────────────────────────────

export async function listMongoCities(stateName?: string) {
  const { cities } = await getMongoCollections();
  const filter = stateName ? { stateName } : {};
  return cities.find(filter).sort({ name: 1 }).toArray();
}

export async function upsertMongoCity(record: {
  countryName: string;
  id: string;
  name: string;
  stateName: string;
  status: "Active" | "Inactive";
}) {
  const { cities } = await getMongoCollections();
  const now = new Date().toISOString();
  await cities.updateOne(
    { _id: record.id },
    {
      $set: { countryName: record.countryName, name: record.name, stateName: record.stateName, status: record.status, updatedAt: now },
      $setOnInsert: { _id: record.id, createdAt: now },
    },
    { upsert: true },
  );
  return record;
}

export async function bulkUpdateMongoCityStatus(ids: string[], status: "Active" | "Inactive") {
  const { cities } = await getMongoCollections();
  await cities.updateMany({ _id: { $in: ids } }, { $set: { status, updatedAt: new Date().toISOString() } });
}

export async function deleteMongoCitiesByIds(ids: string[]) {
  const { cities } = await getMongoCollections();
  await cities.deleteMany({ _id: { $in: ids } });
}

// ─── Locations (Sub-areas) ─────────────────────────────────────────────────────

export async function listMongoLocations(cityName?: string) {
  const { locations } = await getMongoCollections();
  const filter = cityName ? { cityName } : {};
  return locations.find(filter).sort({ name: 1 }).toArray();
}

export async function upsertMongoLocation(record: {
  cityName: string;
  countryName: string;
  id: string;
  name: string;
  stateName: string;
  status: "Active" | "Inactive";
}) {
  const { locations } = await getMongoCollections();
  const now = new Date().toISOString();
  await locations.updateOne(
    { _id: record.id },
    {
      $set: { cityName: record.cityName, countryName: record.countryName, name: record.name, stateName: record.stateName, status: record.status, updatedAt: now },
      $setOnInsert: { _id: record.id, createdAt: now },
    },
    { upsert: true },
  );
  return record;
}

export async function bulkUpdateMongoLocationStatus(ids: string[], status: "Active" | "Inactive") {
  const { locations } = await getMongoCollections();
  await locations.updateMany({ _id: { $in: ids } }, { $set: { status, updatedAt: new Date().toISOString() } });
}

export async function deleteMongoLocationsByIds(ids: string[]) {
  const { locations } = await getMongoCollections();
  await locations.deleteMany({ _id: { $in: ids } });
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
  subcategories: import("mongodb").Collection<SubcategoryRecord>;
  subadmins: import("mongodb").Collection<SubadminRecord>;
  testimonials: import("mongodb").Collection<TestimonialRecord>;
};
