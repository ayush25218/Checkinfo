import { categories } from "./checkinfo";
import { demoMemberAccounts } from "./demoBusinessData";
import type {
  MemberEnquiry,
  MemberListing,
  MemberNotification,
  MemberReview,
  SupportTicket,
} from "./member";
import {
  getOrCreateMongoMember,
  isMongoConfigured,
  countMongoBusinessListings,
  countMongoMembers,
  deleteMongoMembersByIds,
  listMongoBusinessListings,
  listMongoMembers,
  listMongoAdminAuditLogs,
  logMongoAdminAudit,
  saveMongoMember,
  updateMongoBusinessPlacements,
  updateMongoBusinessStatus,
  type MemberAccount,
  type MemberProfile,
  // Categories
  listMongoCategories,
  upsertMongoCategory,
  deleteMongoCategoryById,
  bulkUpdateMongoCategoryStatus,
  deleteMongoCategoriesByIds,
  updateMongoCategoriesOrder,
  listMongoSubcategories,
  upsertMongoSubcategory,
  deleteMongoSubcategoryById,
  // Newsletter
  listMongoNewsletter,
  upsertMongoNewsletterRecord,
  bulkUnsubscribeNewsletter,
  deleteMongoNewsletterByEmails,
  markNewsletterSent,
  // Meta Tags
  listMongoMetaTags,
  upsertMongoMetaTag,
  deleteMongoMetaTagById,
  // Subadmins
  listMongoSubadmins,
  upsertMongoSubadmin,
  bulkUpdateMongoSubadminStatus,
  deleteMongoSubadminsByIds,
  // Admin Settings
  getMongoAdminSettings,
  saveMongoAdminSettings,
  // Static Pages
  listMongoStaticPages,
  upsertMongoStaticPage,
  deleteMongoStaticPageById,
  // Enquiries
  listMongoEnquiries,
  type EnquiryRecord,
  bulkUpdateMongoEnquiryStatus,
  deleteMongoEnquiriesByIds,
  // Media
  listMongoMedia,
  upsertMongoMedia,
  bulkUpdateMongoMediaStatus,
  deleteMongoMediaByIds,
  // Testimonials
  listMongoTestimonials,
  upsertMongoTestimonial,
  deleteMongoTestimonialById,
  // FAQs
  listMongoFaqs,
  upsertMongoFaq,
  deleteMongoFaqById,
  updateMongoFaqsOrder,
  // States
  listMongoStates,
  upsertMongoState,
  bulkUpdateMongoStateStatus,
  deleteMongoStatesByIds,
  // Cities
  listMongoCities,
  upsertMongoCity,
  bulkUpdateMongoCityStatus,
  deleteMongoCitiesByIds,
  // Locations
  listMongoLocations,
  upsertMongoLocation,
  bulkUpdateMongoLocationStatus,
  deleteMongoLocationsByIds,
} from "./mongodb";
import { listingLocationText, listingPublicPath } from "./listingSeo";

type DirectoryStore = {
  members: Record<string, MemberAccount>;
};

const globalStore = globalThis as typeof globalThis & {
  __checkinfoStore?: DirectoryStore;
};

function emptyAccount(memberId: string): MemberAccount {
  const suffix = memberId.slice(-4).toUpperCase() || "USER";

  return {
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

export function getStore() {
  globalStore.__checkinfoStore ??= { members: {} };
  return globalStore.__checkinfoStore;
}

export function getMemberId(request: Request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("memberId");
  const fromHeader = request.headers.get("x-checkinfo-member-id");
  const fromCookie = request.headers.get("cookie")?.match(/checkinfo_member_id=([^;]+)/)?.[1];

  return decodeURIComponent(fromQuery ?? fromHeader ?? fromCookie ?? "member-default").replace(/[^a-zA-Z0-9_-]/g, "");
}

export function getMemberAccount(memberId: string) {
  const store = getStore();
  store.members[memberId] ??= emptyAccount(memberId);
  return store.members[memberId];
}

async function getMemberAccountForWrite(memberId: string) {
  if (!isMongoConfigured()) return getMemberAccount(memberId);

  return getOrCreateMongoMember(memberId);
}

async function commitMemberAccount(account: MemberAccount) {
  if (!isMongoConfigured()) return;

  await saveMongoMember(account);
}

export function getMemberState(memberId: string, resource = "dashboard") {
  const account = getMemberAccount(memberId);
  return getMemberStateFromAccount(account, resource);
}

function getMemberStateFromAccount(account: MemberAccount, resource = "dashboard") {

  if (resource === "dashboard") {
    const activeListings = account.listings.filter((listing) => listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular").length;
    const newEnquiries = account.enquiries.filter((enquiry) => enquiry.status === "New").length;

    return {
      activeListings,
      listingCount: account.listings.length,
      newEnquiries,
      packageName: account.packageName,
      profile: account.profile,
      profileScore: Math.min(100, 55 + account.listings.length * 12),
    };
  }

  return {
    enquiries: account.enquiries,
    listings: account.listings,
    notifications: account.notifications,
    package: {
      couponCode: account.couponCode ?? "",
      invoices: account.invoices ?? [],
      packageExpiresAt: (account as MemberAccount & { packageExpiresAt?: string | null }).packageExpiresAt ?? null,
      packageName: account.packageName,
      paymentStatus: account.paymentStatus ?? "Free",
      trialEndsAt: account.trialEndsAt ?? null,
      walletCredits: account.walletCredits ?? 0,
    },
    packageExpiresAt: (account as MemberAccount & { packageExpiresAt?: string | null }).packageExpiresAt ?? null,
    packageName: account.packageName,
    profile: account.profile,
    reviews: account.reviews,
    tickets: account.tickets,
  }[resource] ?? account;
}

export async function getMemberStateAsync(memberId: string, resource = "dashboard") {
  if (!isMongoConfigured()) return getMemberState(memberId, resource);

  const account = await getOrCreateMongoMember(memberId);
  return getMemberStateFromAccount(account, resource);
}

export function handleMemberAction(memberId: string, resource: string, payload: Record<string, unknown>) {
  const account = getMemberAccount(memberId);
  return mutateMemberAction(account, resource, payload);
}

function mutateMemberAction(account: MemberAccount, resource: string, payload: Record<string, unknown>) {
  const action = String(payload.action ?? "");
  const nowIso = new Date().toISOString();

  if (resource === "listing") {
    if (action === "create" || action === "draft") {
      const record = payload.record as Partial<MemberListing>;
      const isDraft = action === "draft";
      const listing = {
        ...record,
        approvalStatus: isDraft ? "Draft" : "Pending",
        createdAt: record.createdAt || nowIso,
        createdBy: account.profile.id,
        editHistory: [
          ...(Array.isArray(record.editHistory) ? record.editHistory : []),
          { action: "created", actorId: account.profile.id, at: nowIso, notes: isDraft ? "Saved as draft" : "Submitted for admin approval" },
        ],
        id: String(record.id || `list-${Date.now()}`),
        memberId: account.profile.id,
        ownerId: account.profile.id,
        status: isDraft ? "Draft" : "Pending",
        submittedAt: isDraft ? record.submittedAt : nowIso,
        updatedAt: nowIso,
        verificationStatus: isDraft ? "Unverified" : "Pending",
      } as MemberListing;
      account.listings = [listing, ...account.listings.filter((item) => item.id !== listing.id)];
      account.notifications.unshift({
        id: `notif-${Date.now()}`,
        text: isDraft ? "Your business listing draft was saved." : "Your business listing was submitted for admin approval.",
        time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        title: isDraft ? "Draft Saved" : "Listing Submitted",
        unread: true,
      });
      return { listing, listings: account.listings };
    }

    if (action === "update" || action === "update-draft") {
      const id = String(payload.id ?? account.listings[0]?.id ?? "");
      const isDraft = action === "update-draft";
      account.listings = account.listings.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              ...(payload.record as Partial<MemberListing>),
              approvalStatus: isDraft ? "Draft" : "Pending",
              memberId: account.profile.id,
              ownerId: account.profile.id,
              editHistory: [
                ...(Array.isArray(listing.editHistory) ? listing.editHistory : []),
                { action: "updated", actorId: account.profile.id, at: nowIso, notes: isDraft ? "Member saved draft changes" : "Member submitted edits for review" },
              ],
              status: isDraft ? "Draft" : "Pending",
              submittedAt: isDraft ? listing.submittedAt : nowIso,
              updatedAt: nowIso,
              verificationStatus: isDraft ? "Unverified" : "Pending",
            }
          : listing,
      );
      account.notifications.unshift({
        id: `notif-${Date.now()}`,
        text: isDraft ? "Your business listing draft changes were saved." : "Your business listing changes were submitted for admin review.",
        time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        title: isDraft ? "Draft Updated" : "Listing Review Requested",
        unread: true,
      });
      return { listings: account.listings };
    }

    if (action === "delete") {
      const id = String(payload.id ?? "");
      account.listings = account.listings.filter((listing) => listing.id !== id);
      return { listings: account.listings };
    }

    if (action === "submit-review") {
      const id = String(payload.id ?? "");
      account.listings = account.listings.map((listing) => listing.id === id ? { ...listing, status: "Pending" } : listing);
      return { listings: account.listings };
    }
  }

  if (resource === "enquiry") {
    const id = String(payload.id ?? "");
    const status = payload.status as MemberEnquiry["status"];
    account.enquiries = account.enquiries.map((enquiry) => enquiry.id === id ? { ...enquiry, status } : enquiry);
    return { enquiries: account.enquiries };
  }

  if (resource === "review") {
    const id = String(payload.id ?? "");
    const status = payload.status as MemberReview["status"];
    account.reviews = account.reviews.map((review) => review.id === id ? { ...review, status } : review);
    return { reviews: account.reviews };
  }

  if (resource === "package") {
    account.packageName = String(payload.packageName ?? "Free Listing");
    const couponCode = String(payload.couponCode ?? "").trim().toUpperCase();
    const action = String(payload.action ?? "select");
    const now = new Date();
    const isTrial = action === "trial" || account.packageName.toLowerCase().includes("trial");
    const planPrice = account.packageName === "City Leader" ? 2499 : account.packageName === "Featured Boost" ? 999 : 0;
    const discount = couponCode === "CHECKINFO20" ? Math.round(planPrice * 0.2) : couponCode === "WELCOME50" ? Math.min(500, planPrice) : 0;
    const finalAmount = Math.max(0, planPrice - discount);
    const expiresAt = account.packageName === "Free Listing"
      ? null
      : new Date(now.getTime() + (isTrial ? 14 : 365) * 24 * 60 * 60 * 1000).toISOString();
    account.couponCode = couponCode || account.couponCode;
    account.packageExpiresAt = expiresAt;
    account.paymentStatus = account.packageName === "Free Listing" ? "Free" : isTrial ? "Trial" : "Paid";
    account.trialEndsAt = isTrial ? expiresAt : account.trialEndsAt ?? null;
    account.walletCredits = Number(account.walletCredits ?? 0) + (account.packageName === "City Leader" ? 100 : 0);
    account.invoices = [
      {
        amount: finalAmount,
        createdAt: now.toISOString(),
        id: `inv-${Date.now()}`,
        packageName: account.packageName,
        status: isTrial ? "Trial" : account.paymentStatus === "Paid" ? "Paid" : "Manual",
      },
      ...(Array.isArray(account.invoices) ? account.invoices : []),
    ];
    account.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: expiresAt ? `Your ${account.packageName} package is active until ${new Date(expiresAt).toLocaleDateString("en-IN")}. Renewal reminders will appear before expiry.` : "Free Listing package is active.",
      time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      title: "Package Updated",
      unread: true,
    });
    return { couponCode, discount, invoice: account.invoices[0], packageExpiresAt: expiresAt, packageName: account.packageName, paymentStatus: account.paymentStatus, walletCredits: account.walletCredits };
  }

  if (resource === "notification") {
    if (action === "clear-all") {
      account.notifications = [];
    } else {
      account.notifications = account.notifications.map((notification) => ({ ...notification, unread: false }));
    }
    return { notifications: account.notifications };
  }

  if (resource === "support") {
    const ticket = { ...(payload.ticket as Omit<SupportTicket, "id" | "status">), createdAt: new Date().toISOString(), id: `ticket-${Date.now()}`, status: "Open" } as SupportTicket;
    account.tickets.push(ticket);
    account.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: `Support ticket ${ticket.id} has been created.`,
      time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      title: "Support Ticket Created",
      unread: true,
    });

    // Save ticket into Mongo Enquiries collection so it shows up live in Admin Panel!
    try {
      const { saveContactEnquiry, isMongoConfigured } = require("./mongodb");
      if (isMongoConfigured()) {
        void saveContactEnquiry({
          email: ticket.email || account.profile.email || "",
          name: ticket.name || account.profile.name || "Member",
          phone: ticket.phone || account.profile.phone || "",
          subject: `Support Ticket: ${ticket.issue || 'General'}`,
          message: ticket.message || "",
          type: "Contact",
        });
      }
    } catch {}

    return { ticket, tickets: account.tickets };
  }

  if (resource === "password") {
    account.passwordUpdatedAt = new Date().toISOString();
    const newPass = String(payload.newPassword ?? payload.next ?? payload.password ?? "");
    if (newPass) {
      const { hashPassword } = require("./auth");
      account.passwordHash = hashPassword(newPass);
    }
    return { passwordHash: account.passwordHash, passwordUpdatedAt: account.passwordUpdatedAt };
  }

  if (resource === "logout") {
    account.loggedOutAt = new Date().toISOString();
    return { loggedOutAt: account.loggedOutAt };
  }

  return { account };
}

export async function handleMemberActionAsync(memberId: string, resource: string, payload: Record<string, unknown>) {
  if (!isMongoConfigured()) return handleMemberAction(memberId, resource, payload);

  const account = await getMemberAccountForWrite(memberId);
  const result = mutateMemberAction(account, resource, payload);
  await commitMemberAccount(account);
  return result;
}

function buildBusinessFromMembers(members: MemberAccount[]) {
  return members.flatMap((member) =>
    member.listings.map((listing) => ({
      address: listing.address || listingLocationText(listing),
      addressProofName: listing.addressProofName,
      approvalStatus: listing.approvalStatus,
      approvedAt: listing.approvedAt,
      approvedBy: listing.approvedBy,
      badge: listing.status === "Featured" ? "Featured" : listing.status === "Popular" ? "Popular" : "Verified",
      businessType: listing.businessType,
      category: listing.category,
      city: listing.city,
      contact: listing.mobile || listing.email,
      createdBy: listing.createdBy,
      details: listing.description || listing.keywords,
      id: listing.id,
      image: listing.image,
      location: listingLocationText(listing),
      mobile: listing.mobile,
      name: listing.name,
      memberId: listing.memberId,
      ownerEmail: member.profile.email,
      ownerId: member.profile.id,
      ownerName: member.profile.name,
      packageName: member.packageName,
      placementExpiresAt: listing.placementExpiresAt,
      placements: listing.placements,
      placementStartsAt: listing.placementStartsAt,
      publicPath: listingPublicPath(listing),
      state: listing.state,
      status: listing.status,
      subcategory: listing.subcategory,
      subcity: listing.subcity,
      website: listing.website,
    })),
  );
}

type BusinessPlacement = "new" | "featured" | "trending";

function defaultPlacementsForListing(listing: Pick<MemberListing, "status"> & { placements?: MemberListing["placements"] }) {
  if (Array.isArray(listing.placements) && listing.placements.length) return listing.placements;
  if (listing.status === "Featured") return ["new", "featured"] as BusinessPlacement[];
  if (listing.status === "Popular") return ["new", "trending"] as BusinessPlacement[];
  if (listing.status === "Active") return ["new"] as BusinessPlacement[];
  return [] as BusinessPlacement[];
}

function normalizeBusinessPlacements(values: unknown) {
  const raw = Array.isArray(values) ? values : [values];
  const allowed = new Set(["new", "featured", "trending"]);
  return Array.from(new Set(raw.map(String).filter((value): value is BusinessPlacement => allowed.has(value))));
}

function duplicateBusinessKey(record: {
  city?: string;
  contact?: string;
  mobile?: string;
  name?: string;
  ownerEmail?: string;
}) {
  return [record.name, record.city, record.mobile || record.contact || record.ownerEmail]
    .map((part) => String(part ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean)
    .join("|");
}

function importSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}

function validListingStatus(value: string): MemberListing["status"] {
  return ["Active", "Inactive", "Pending", "Draft", "Featured", "Popular"].includes(value)
    ? value as MemberListing["status"]
    : "Pending";
}

function approvalStatusForStatus(status: MemberListing["status"]): NonNullable<MemberListing["approvalStatus"]> {
  if (status === "Active" || status === "Featured" || status === "Popular") return "Approved";
  if (status === "Draft") return "Draft";
  if (status === "Inactive") return "Rejected";
  return "Pending";
}

async function bulkImportBusinesses(records: Array<Record<string, unknown>>) {
  const imported: MemberListing[] = [];
  const now = Date.now();

  for (const [index, record] of records.entries()) {
    const name = String(record.name ?? record.businessName ?? "").trim();
    if (!name) continue;

    const email = String(record.email ?? record.ownerEmail ?? "").trim().toLowerCase();
    const phone = String(record.mobile ?? record.contact ?? record.phone ?? "").trim();
    const ownerId = importSlug(String(record.ownerId || email || phone || `${name}-${now}-${index}`)) || `owner-${now}-${index}`;
    const account = await getOrCreateMongoMember(ownerId);

    account.profile.email = email || account.profile.email;
    account.profile.name = String(record.ownerName ?? record.contactPerson ?? name).trim();
    account.profile.phone = phone || account.profile.phone;
    account.profile.username = account.profile.username || ownerId;
    account.profile.status = "Active";

    const status = validListingStatus(String(record.status ?? "Pending"));
    const listing: MemberListing = {
      id: importSlug(String(record.id ?? `${name}-${now}-${index}`)) || `list-${now}-${index}`,
      address: String(record.address ?? "").trim(),
      addressProofName: String(record.addressProofName ?? record.proof ?? "").trim(),
      approvalStatus: approvalStatusForStatus(status),
      businessType: String(record.businessType ?? "").trim(),
      category: String(record.category ?? categories[0] ?? "General").trim(),
      city: String(record.city ?? "").trim(),
      contactPerson: String(record.contactPerson ?? record.ownerName ?? account.profile.name ?? "").trim(),
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      description: String(record.details ?? record.description ?? "").trim(),
      email,
      image: String(record.image ?? "").trim(),
      keywords: String(record.keywords ?? record.details ?? record.description ?? "").trim(),
      location: [record.subcity, record.city, record.state].map((part) => String(part ?? "").trim()).filter(Boolean).join(", "),
      memberId: ownerId,
      mobile: phone,
      name,
      ownerId,
      state: String(record.state ?? "").trim(),
      status,
      subcategory: String(record.subcategory ?? "").trim(),
      subcity: String(record.subcity ?? record.area ?? record.location ?? "").trim(),
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      website: String(record.website ?? "").trim(),
      youtube: String(record.youtube ?? "").trim(),
    };

    account.listings = [
      ...account.listings.filter((item) => item.id !== listing.id),
      listing,
    ];
    account.notifications.unshift({
      id: `notif-${now}-${index}`,
      text: "Your store was imported by Administrator and is waiting for review.",
      time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      title: "Store Imported",
      unread: true,
    });
    await saveMongoMember(account);
    imported.push(listing);
  }

  return imported.length;
}

async function upsertAdminBusiness(record: Record<string, unknown>) {
  const id = importSlug(String(record.id ?? record.name ?? `biz-${Date.now()}`)) || `biz-${Date.now()}`;
  const name = String(record.name ?? "").trim();
  if (!name) return null;

  const ownerId = importSlug(String(record.ownerId ?? record.ownerEmail ?? record.contact ?? `admin-${id}`)) || `admin-${id}`;
  const account = await getOrCreateMongoMember(ownerId);
  const contact = String(record.contact ?? "").trim();
  const ownerEmail = String(record.ownerEmail ?? account.profile.email ?? "").trim().toLowerCase();
  const ownerName = String(record.ownerName ?? account.profile.name ?? name).trim();

  account.profile.email = ownerEmail;
  account.profile.name = ownerName;
  account.profile.phone = contact || account.profile.phone;
  account.profile.username = account.profile.username || ownerId;
  account.profile.status = "Active";

  const status = validListingStatus(String(record.status ?? "Pending"));
  const listing: MemberListing = {
    id,
    address: String(record.address ?? "").trim(),
    addressProofName: String(record.addressProofName ?? record.proof ?? "").trim(),
    approvalStatus: approvalStatusForStatus(status),
    businessType: String(record.businessType ?? "").trim(),
    category: String(record.category ?? categories[0] ?? "General").trim(),
    city: String(record.city ?? "").trim(),
    contactPerson: ownerName,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    description: String(record.details ?? record.description ?? "").trim(),
    email: ownerEmail,
    image: String(record.image ?? "").trim(),
    keywords: String(record.keywords ?? record.details ?? "").trim(),
    location: [record.subcity, record.city, record.state].map((part) => String(part ?? "").trim()).filter(Boolean).join(", "),
    memberId: ownerId,
    mobile: contact,
    name,
    ownerId,
    state: String(record.state ?? "").trim(),
    status,
    subcategory: String(record.subcategory ?? "").trim(),
    subcity: String(record.subcity ?? "").trim(),
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    website: String(record.website ?? "").trim(),
    youtube: String(record.youtube ?? "").trim(),
  };

  account.listings = [listing, ...account.listings.filter((item) => item.id !== listing.id)];
  await saveMongoMember(account);
  return listing;
}

async function deleteAdminBusinesses(ids: string[]) {
  if (!ids.length) return;
  const members = await listMongoMembers({ limit: 5000 });
  await Promise.all(members.map(async (account) => {
    const nextListings = account.listings.filter((listing) => {
      const bId = `${account.profile.id}::${listing.id}`;
      return !ids.includes(listing.id) && !ids.includes(bId);
    });
    if (nextListings.length === account.listings.length) return;
    account.listings = nextListings;
    await saveMongoMember(account);
  }));
}

export function getAdminResource(resource = "dashboard") {
  const store = getStore();
  const localMembers = Object.values(store.members);
  const allMembersMap = new Map<string, MemberAccount>();
  [...demoMemberAccounts, ...localMembers].forEach((m) => {
    if (m?.profile?.id || m?.profile?.username) {
      allMembersMap.set(m.profile.id || m.profile.username, m);
    }
  });
  const members = Array.from(allMembersMap.values());
  const business = buildBusinessFromMembers(members);

  if (resource === "dashboard") {
    const catDistributionMap: Record<string, number> = {};
    business.forEach((b) => {
      if (b.category) {
        catDistributionMap[b.category] = (catDistributionMap[b.category] || 0) + 1;
      }
    });

    const categoryDistribution = Object.entries(catDistributionMap)
      .map(([name, count]) => ({ count, name }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      activeMembers: members.filter((member) => member.profile.status === "Active").length,
      categoriesCount: categories.length,
      categoryDistribution,
      membersCount: members.length,
      pendingBusiness: business.filter((listing) => listing.status === "Pending").length,
      recentEnquiries: [],
      systemHealth: {
        dbName: "local_memory",
        isMongoConfigured: false,
        lastSync: new Date().toISOString(),
      },
      totalBusiness: business.length,
      totalEnquiries: 0,
      totalUsers: 0,
    };
  }

  if (resource === "business") return business;

  if (resource === "members") {
    return members.map((member) => ({
      email: member.profile.email,
      id: member.profile.id,
      listingCount: member.listings.length,
      name: member.profile.name,
      packageName: member.packageName,
      phone: member.profile.phone,
      registeredAt: member.registeredAt,
      status: member.profile.status,
      username: member.profile.username,
    }));
  }

  return null;
}

export async function getAdminResourceAsync(resource = "dashboard"): Promise<unknown> {
  if (!isMongoConfigured()) return getAdminResource(resource);

  // Categories
  if (resource === "categories") {
    try {
      const docs = await listMongoCategories();
      return docs.map((doc) => ({
        homeBottom: doc.homePlacement === "Bottom",
        homeTop: doc.homePlacement === "Top",
        id: doc._id,
        image: doc.image,
        name: doc.name,
        order: doc.displayOrder,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Subcategories
  if (resource === "subcategories") {
    const docs = await listMongoSubcategories();
    return docs.map((doc) => ({
      businessTypes: doc.businessTypes,
      categoryName: doc.categoryName,
      categorySlug: doc.categorySlug,
      createdAt: doc.createdAt,
      id: doc._id,
      name: doc.name,
      slug: doc.slug,
    }));
  }

  // Newsletter
  if (resource === "newsletter") {
    try {
      const docs = await listMongoNewsletter();
      return docs.map((doc, index) => ({
        email: doc.email,
        id: `news-${index}`,
        joinedAt: (doc as Record<string, unknown>).joinedAt ?? doc.subscribedAt,
        lastSent: (doc as Record<string, unknown>).lastSent ?? "Not sent",
        status: (doc as Record<string, unknown>).status ?? "Subscribed",
      }));
    } catch (error) {
      throw error;
    }
  }

  // Meta Tags
  if (resource === "meta") {
    try {
      const docs = await listMongoMetaTags();
      return docs.map((doc) => ({
        description: doc.description,
        id: doc._id,
        keywords: doc.keywords,
        title: doc.title,
        url: doc.url,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Subadmins
  if (resource === "subadmins") {
    try {
      const docs = await listMongoSubadmins();
      return docs.map((doc) => ({
        email: doc.email,
        id: doc._id,
        name: doc.name,
        permissions: Array.isArray(doc.permissions) ? doc.permissions : ["dashboard"],
        phone: doc.phone,
        registeredAt: doc.registeredAt,
        status: doc.status,
        username: doc.username,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Admin Settings
  if (resource === "settings") {
    try {
      const doc = await getMongoAdminSettings();
      if (doc) {
        const { passwordHash: _, ...rest } = doc;
        return rest;
      }
    } catch (error) {
      throw error;
    }
    return null;
  }

  // Static Pages
  if (resource === "static-pages") {
    try {
      const docs = await listMongoStaticPages();
      return docs.map((doc) => ({
        content: doc.content,
        id: doc._id,
        slug: doc.slug,
        status: doc.status,
        title: doc.title,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Enquiries (Contact / Business / Career / Advertise)
  const enquiryTypeMap: Record<string, "Contact" | "Business" | "Career" | "Advertise"> = {
    "contact-enquiries": "Contact",
    "business-enquiries": "Business",
    "career-enquiries": "Career",
    "advertise-enquiries": "Advertise",
  };
  if (resource in enquiryTypeMap) {
    const type = enquiryTypeMap[resource];
    try {
      const docs = await listMongoEnquiries(type);
      return docs.map((doc) => ({
        email: doc.email,
        id: doc._id,
        message: doc.message,
        name: doc.name,
        phone: doc.phone,
        receivedAt: doc.receivedAt,
        status: doc.status,
        type: doc.type,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Banners
  if (resource === "banners") {
    try {
      const docs = await listMongoMedia("banner");
      return docs.map((doc) => ({
        id: doc._id,
        image: doc.image,
        lineOne: doc.lineOne,
        lineTwo: doc.lineTwo,
        position: doc.position,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Header Images
  if (resource === "header-images") {
    try {
      const docs = await listMongoMedia("header-image");
      return docs.map((doc) => ({
        id: doc._id,
        image: doc.image,
        lineOne: doc.lineOne,
        lineTwo: doc.lineTwo,
        position: doc.position,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Testimonials
  if (resource === "testimonials") {
    try {
      const docs = await listMongoTestimonials();
      return docs.map((doc) => ({
        description: doc.description,
        id: doc._id,
        name: doc.name,
        order: doc.displayOrder,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // FAQs
  if (resource === "faqs") {
    try {
      const docs = await listMongoFaqs();
      return docs.map((doc) => ({
        answer: doc.answer,
        id: doc._id,
        order: doc.displayOrder,
        question: doc.question,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // States
  if (resource === "states") {
    try {
      const docs = await listMongoStates();
      return docs.map((doc) => ({
        country: doc.countryName,
        countryName: doc.countryName,
        id: doc._id,
        name: doc.name,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Cities
  if (resource === "cities") {
    try {
      const docs = await listMongoCities();
      return docs.map((doc) => ({
        cityName: doc.name,
        country: doc.countryName,
        countryName: doc.countryName,
        id: doc._id,
        name: doc.name,
        state: doc.stateName,
        stateName: doc.stateName,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Locations
  if (resource === "locations") {
    try {
      const docs = await listMongoLocations();
      return docs.map((doc) => ({
        city: doc.cityName,
        cityName: doc.cityName,
        country: doc.countryName,
        countryName: doc.countryName,
        id: doc._id,
        name: doc.name,
        state: doc.stateName,
        stateName: doc.stateName,
        status: doc.status,
      }));
    } catch (error) {
      throw error;
    }
  }

  if (resource === "audit-logs") {
    const docs = await listMongoAdminAuditLogs({ limit: 200 });
    return docs.map((doc) => ({
      action: doc.action,
      actorId: doc.actorId,
      actorRole: doc.actorRole,
      businessId: doc.businessId,
      createdAt: doc.createdAt,
      details: doc.details,
      id: doc._id,
      memberId: doc.memberId,
      ownerId: doc.ownerId,
      resource: doc.resource,
    }));
  }

  let members: MemberAccount[];
  let business: ReturnType<typeof buildBusinessFromMembers>;
  let totalBusinessCount = 0;
  let totalMembersCount = 0;

  try {
    members = await listMongoMembers({ limit: 5000 });
    totalMembersCount = await countMongoMembers();
  } catch (error) {
    throw error;
  }

  try {
    const mongoBusiness = await listMongoBusinessListings({ limit: 5000 });
    business = mongoBusiness.length
      ? mongoBusiness.map((listing) => ({
          ...listing,
        addressProofName: listing.addressProofName,
        image: listing.image,
        packageName: listing.packageName,
        placementExpiresAt: listing.placementExpiresAt,
        placements: listing.placements,
        placementStartsAt: listing.placementStartsAt,
        publicPath: listing.publicPath || listingPublicPath(listing),
      })) as ReturnType<typeof buildBusinessFromMembers>
      : buildBusinessFromMembers(members);
    const duplicateCounts = new Map<string, number>();
    business.forEach((listing) => {
      const key = duplicateBusinessKey(listing);
      if (key) duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
    });
    business = business.map((listing) => {
      const key = duplicateBusinessKey(listing);
      return {
        ...listing,
        duplicateKey: key,
        isDuplicate: Boolean(key && (duplicateCounts.get(key) ?? 0) > 1),
      };
    }) as typeof business;
    totalBusinessCount = business.length;
  } catch (error) {
    throw error;
  }

  if (resource === "dashboard") {
    let mongoCategoriesCount = categories.length;
    let mongoEnquiries: EnquiryRecord[] = [];
    let mongoUsersCount = 0;

    try {
      const cats = await listMongoCategories();
      if (cats.length > 0) mongoCategoriesCount = cats.length;
    } catch (error) {
      throw error;
    }

    try {
      mongoEnquiries = await listMongoEnquiries();
    } catch (error) {
      throw error;
    }

    try {
      const { getMongoCollections } = await import("./mongodb");
      const collections = await getMongoCollections();
      mongoUsersCount = await collections.users.countDocuments();
    } catch (error) {
      throw error;
    }

    // Compute real category distribution from active listings
    const catDistributionMap: Record<string, number> = {};
    business.forEach((b) => {
      if (b.category) {
        catDistributionMap[b.category] = (catDistributionMap[b.category] || 0) + 1;
      }
    });

    const categoryDistribution = Object.entries(catDistributionMap)
      .map(([name, count]) => ({ count, name }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const recentEnquiries = mongoEnquiries.slice(0, 5).map((e) => ({
      email: e.email,
      id: e._id,
      message: e.message,
      name: e.name,
      phone: e.phone,
      receivedAt: e.receivedAt,
      status: e.status,
      type: e.type,
    }));

    return {
      activeMembers: isMongoConfigured() ? await countMongoMembers({ "profile.status": "Active" }) : members.filter((member) => member.profile.status === "Active").length,
      approvedBusiness: business.filter((listing) => listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular").length,
      categoriesCount: mongoCategoriesCount,
      categoryDistribution,
      featuredBusiness: business.filter((listing) => Array.isArray(listing.placements) && listing.placements.includes("featured")).length,
      membersCount: totalMembersCount,
      pendingBusiness: business.filter((listing) => listing.status === "Pending").length,
      rejectedBusiness: business.filter((listing) => listing.status === "Inactive" || listing.approvalStatus === "Rejected").length,
      recentEnquiries,
      systemHealth: {
        dbName: process.env.MONGODB_DB?.trim() || "checkinfo",
        isMongoConfigured: isMongoConfigured(),
        lastSync: new Date().toISOString(),
      },
      totalBusiness: totalBusinessCount,
      totalEnquiries: mongoEnquiries.length,
      totalUsers: mongoUsersCount,
      trendingBusiness: business.filter((listing) => Array.isArray(listing.placements) && listing.placements.includes("trending")).length,
    };
  }

  if (resource === "business") return business;

  if (resource === "members") {
    return members.map((member) => ({
      email: member.profile.email,
      id: member.profile.id,
      listingCount: member.listings.length,
      name: member.profile.name,
      packageName: member.packageName,
      phone: member.profile.phone,
      registeredAt: member.registeredAt,
      status: member.profile.status,
      username: member.profile.username,
    }));
  }

  return null;
}

export function handleAdminAction(resource: string, payload: Record<string, unknown>) {
  if (resource === "business") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record && typeof payload.record === "object") {
      const record = payload.record as Record<string, unknown>;
      const id = importSlug(String(record.id ?? record.name ?? `biz-${Date.now()}`)) || `biz-${Date.now()}`;
      const ownerId = importSlug(String(record.ownerId ?? record.ownerEmail ?? record.contact ?? `admin-${id}`)) || `admin-${id}`;
      const account = getMemberAccount(ownerId);
      const listing: MemberListing = {
        id,
        address: String(record.address ?? "").trim(),
        addressProofName: String(record.addressProofName ?? record.proof ?? "").trim(),
        businessType: String(record.businessType ?? "").trim(),
        category: String(record.category ?? categories[0] ?? "General").trim(),
        city: String(record.city ?? "").trim(),
        contactPerson: String(record.ownerName ?? account.profile.name ?? record.name ?? "").trim(),
        description: String(record.details ?? "").trim(),
        email: String(record.ownerEmail ?? account.profile.email ?? "").trim(),
        image: String(record.image ?? "").trim(),
        keywords: String(record.keywords ?? record.details ?? "").trim(),
        location: [record.subcity, record.city, record.state].map((part) => String(part ?? "").trim()).filter(Boolean).join(", "),
        mobile: String(record.contact ?? "").trim(),
        name: String(record.name ?? "").trim(),
        state: String(record.state ?? "").trim(),
        status: validListingStatus(String(record.status ?? "Pending")),
        subcategory: String(record.subcategory ?? "").trim(),
        subcity: String(record.subcity ?? "").trim(),
        website: String(record.website ?? "").trim(),
        youtube: String(record.youtube ?? "").trim(),
      };
      account.profile.id = ownerId;
      account.profile.name = listing.contactPerson || listing.name;
      account.profile.email = listing.email;
      account.profile.phone = listing.mobile;
      account.listings = [listing, ...account.listings.filter((item) => item.id !== listing.id)];
      return { business: getAdminResource("business") };
    }

    if (action === "delete" && (Array.isArray(payload.ids) || payload.id)) {
      const ids = Array.isArray(payload.ids) ? payload.ids.map(String) : [String(payload.id)];
      Object.values(getStore().members).forEach((account) => {
        account.listings = account.listings.filter((listing) => !ids.includes(listing.id));
      });
      return { business: getAdminResource("business") };
    }

    const ownerId = String(payload.ownerId ?? "");
    const id = String(payload.id ?? "");
    const account = ownerId ? getMemberAccount(ownerId) : null;

    if (account && ["Active", "Inactive", "Pending", "Draft", "Featured", "Popular"].includes(action)) {
      account.listings = account.listings.map((listing) =>
        listing.id === id ? { ...listing, status: action as MemberListing["status"] } : listing,
      );
      return { business: getAdminResource("business") };
    }

    if (!ownerId && id && ["Active", "Inactive", "Pending", "Draft", "Featured", "Popular"].includes(action)) {
      Object.values(getStore().members).forEach((member) => {
        member.listings = member.listings.map((listing) =>
          listing.id === id ? { ...listing, status: action as MemberListing["status"] } : listing,
        );
      });
      return { business: getAdminResource("business") };
    }
  }

  if (resource === "members") {
    const action = String(payload.action ?? "");
    const id = String(payload.id ?? "");
    const account = id ? getMemberAccount(id) : null;

    if (action === "upsert" && payload.record && typeof payload.record === "object") {
      const record = payload.record as Record<string, unknown>;
      const username = String(record.username ?? "").trim().toLowerCase();
      const memberId = String(record.id ?? username).trim().toLowerCase();

      if (!memberId || !username) return { members: getAdminResource("members") };

      const nextAccount = getMemberAccount(memberId);
      const name = String(record.name ?? "").trim();
      const email = String(record.email ?? "").trim().toLowerCase();
      const phone = String(record.phone ?? "").trim();
      const password = String(record.password ?? "");

      nextAccount.profile.id = memberId;
      nextAccount.profile.name = name || nextAccount.profile.name;
      nextAccount.profile.initials = (name || username).slice(0, 2).toUpperCase();
      nextAccount.profile.username = username;
      nextAccount.profile.email = email;
      nextAccount.profile.phone = phone;
      nextAccount.profile.status = record.status === "Inactive" ? "Inactive" : "Active";
      nextAccount.packageName = String(record.packageName ?? nextAccount.packageName ?? "Free Listing");
      nextAccount.registeredAt = String(record.registeredAt ?? nextAccount.registeredAt);

      if (password) {
        const { hashPassword } = require("./auth");
        nextAccount.passwordHash = hashPassword(password);
        nextAccount.passwordUpdatedAt = new Date().toISOString();
      }

      return { members: getAdminResource("members") };
    }

    if (action === "delete") {
      const ids = Array.isArray(payload.ids) ? payload.ids.map(String) : id ? [id] : [];
      const localStore = getStore();
      ids.forEach((memberId) => {
        delete localStore.members[memberId];
      });
      return { members: getAdminResource("members") };
    }

    if (account && ["Active", "Inactive"].includes(action)) {
      account.profile.status = action as MemberProfile["status"];
      return { members: getAdminResource("members") };
    }
  }

  return { data: getAdminResource(resource) };
}

export async function handleAdminActionAsync(resource: string, payload: Record<string, unknown>) {
  const actorId = String(payload.__actorId ?? "admin");
  const actorRole = payload.__actorRole === "subadmin" ? "subadmin" : "admin";

  // Categories
  if (resource === "categories") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        displayOrder: number;
        homeBottom: boolean;
        homeTop: boolean;
        id: string;
        image: string;
        name: string;
        status: "Active" | "Inactive";
      };
      if (isMongoConfigured()) {
        await upsertMongoCategory(rec);
      }
      return { categories: await getAdminResourceAsync("categories") };
    }

    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoCategoryById(String(payload.id));
      return { categories: await getAdminResourceAsync("categories") };
    }

    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) {
        await bulkUpdateMongoCategoryStatus(
          payload.ids as string[],
          payload.status as "Active" | "Inactive",
        );
      }
      return { categories: await getAdminResourceAsync("categories") };
    }

    if (action === "bulk-delete" && Array.isArray(payload.ids)) {
      if (isMongoConfigured()) await deleteMongoCategoriesByIds(payload.ids as string[]);
      return { categories: await getAdminResourceAsync("categories") };
    }

    if (action === "update-order" && Array.isArray(payload.records)) {
      if (isMongoConfigured()) await updateMongoCategoriesOrder(payload.records as Array<{ id: string; order: number }>);
      return { categories: await getAdminResourceAsync("categories") };
    }

    return { categories: await getAdminResourceAsync("categories") };
  }

  // Subcategories
  if (resource === "subcategories") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        businessTypes: Array<{ name: string; slug: string }>;
        categoryName: string;
        categorySlug: string;
        id: string;
        name: string;
        slug: string;
      };
      if (isMongoConfigured()) await upsertMongoSubcategory(rec);
      return { subcategories: await getAdminResourceAsync("subcategories") };
    }

    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoSubcategoryById(String(payload.id));
      return { subcategories: await getAdminResourceAsync("subcategories") };
    }

    return { subcategories: await getAdminResourceAsync("subcategories") };
  }

  // Newsletter
  if (resource === "newsletter") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        email: string;
        joinedAt: string;
        lastSent: string;
        status: "Subscribed" | "Unsubscribed";
      };
      if (isMongoConfigured()) await upsertMongoNewsletterRecord(rec);
      return { ok: true };
    }

    if (action === "unsubscribe" && Array.isArray(payload.emails)) {
      if (isMongoConfigured()) await bulkUnsubscribeNewsletter(payload.emails as string[]);
      return { ok: true };
    }

    if (action === "delete" && Array.isArray(payload.emails)) {
      if (isMongoConfigured()) await deleteMongoNewsletterByEmails(payload.emails as string[]);
      return { ok: true };
    }

    if (action === "send" && Array.isArray(payload.emails)) {
      if (isMongoConfigured()) await markNewsletterSent(payload.emails as string[]);
      return { ok: true };
    }

    return { ok: true };
  }

  // Meta Tags
  if (resource === "meta") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        description: string;
        id: string;
        keywords: string;
        title: string;
        url: string;
      };
      if (isMongoConfigured()) await upsertMongoMetaTag(rec);
      return { ok: true };
    }

    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoMetaTagById(String(payload.id));
      return { ok: true };
    }

    return { ok: true };
  }

  // Subadmins
  if (resource === "subadmins") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        email: string; id: string; name: string; password?: string; permissions?: string[]; phone: string;
        registeredAt: string; status: "Active" | "Inactive"; username: string;
      };
      if (isMongoConfigured()) {
        const { hashPassword } = await import("./auth");
        await upsertMongoSubadmin({
          ...rec,
          passwordHash: rec.password ? hashPassword(rec.password) : undefined,
          permissions: Array.isArray(rec.permissions) ? rec.permissions : ["dashboard"],
        });
      }
      return { ok: true };
    }
    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoSubadminStatus(payload.ids as string[], payload.status as "Active" | "Inactive");
      return { ok: true };
    }
    if (action === "bulk-delete" && Array.isArray(payload.ids)) {
      if (isMongoConfigured()) await deleteMongoSubadminsByIds(payload.ids as string[]);
      return { ok: true };
    }
    return { ok: true };
  }

  // Admin Settings
  if (resource === "settings") {
    const action = String(payload.action ?? "");

    if (action === "save" && payload.record) {
      const rec = payload.record as {
        address: string; analyticsId: string; email: string; facebook: string;
        instagram: string; mapEmbed: string; phone: string; webCode: string; youtube: string;
      };
      if (isMongoConfigured()) await saveMongoAdminSettings(rec);
      return { ok: true };
    }
    return { ok: true };
  }

  // Admin Password
  if (resource === "admin-password") {
    const action = String(payload.action ?? "");
    if (action === "update" && payload.newPassword) {
      const { updateAdminPasswordInDb } = await import("./auth");
      const saved = await updateAdminPasswordInDb(String(payload.newPassword));
      return { ok: saved, saved };
    }
    return { ok: true };
  }

  // Static Pages
  if (resource === "static-pages") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        content: string; id: string; slug: string; status: "Active" | "Inactive"; title: string;
      };
      if (isMongoConfigured()) await upsertMongoStaticPage(rec);
      return { ok: true };
    }
    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoStaticPageById(String(payload.id));
      return { ok: true };
    }
    return { ok: true };
  }

  // Enquiries (Contact / Business / Career / Advertise)
  const enquiryResources = ["contact-enquiries", "business-enquiries", "career-enquiries", "advertise-enquiries"];
  if (enquiryResources.includes(resource)) {
    const action = String(payload.action ?? "");

    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoEnquiryStatus(payload.ids as string[], payload.status as "New" | "Replied" | "Closed");
      return { ok: true };
    }
    if (action === "bulk-delete" && Array.isArray(payload.ids)) {
      if (isMongoConfigured()) await deleteMongoEnquiriesByIds(payload.ids as string[]);
      return { ok: true };
    }
    return { ok: true };
  }

  // Banners
  if (resource === "banners") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        id: string; image: string; lineOne: string; lineTwo: string; position: string; status: "Active" | "Inactive";
      };
      if (isMongoConfigured()) await upsertMongoMedia({ ...rec, kind: "banner" });
      return { ok: true };
    }
    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoMediaStatus(payload.ids as string[], payload.status as "Active" | "Inactive");
      return { ok: true };
    }
    if (action === "bulk-delete" && Array.isArray(payload.ids)) {
      if (isMongoConfigured()) await deleteMongoMediaByIds(payload.ids as string[]);
      return { ok: true };
    }
    return { ok: true };
  }

  // Header Images
  if (resource === "header-images") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        id: string; image: string; lineOne: string; lineTwo: string; position: string; status: "Active" | "Inactive";
      };
      if (isMongoConfigured()) await upsertMongoMedia({ ...rec, kind: "header-image" });
      return { ok: true };
    }
    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoMediaStatus(payload.ids as string[], payload.status as "Active" | "Inactive");
      return { ok: true };
    }
    if (action === "bulk-delete" && Array.isArray(payload.ids)) {
      if (isMongoConfigured()) await deleteMongoMediaByIds(payload.ids as string[]);
      return { ok: true };
    }
    return { ok: true };
  }

  // Testimonials
  if (resource === "testimonials") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        description: string; id: string; name: string; order: number; status: "Active" | "Inactive";
      };
      if (isMongoConfigured()) await upsertMongoTestimonial(rec);
      return { ok: true };
    }
    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoTestimonialById(String(payload.id));
      return { ok: true };
    }
    return { ok: true };
  }

  // FAQs
  if (resource === "faqs") {
    const action = String(payload.action ?? "");

    if (action === "upsert" && payload.record) {
      const rec = payload.record as {
        answer: string; id: string; order: number; question: string; status: "Active" | "Inactive";
      };
      if (isMongoConfigured()) await upsertMongoFaq(rec);
      return { ok: true };
    }
    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoFaqById(String(payload.id));
      return { ok: true };
    }
    if (action === "update-order" && Array.isArray(payload.records)) {
      if (isMongoConfigured()) await updateMongoFaqsOrder(payload.records as Array<{ id: string; order: number }>);
      return { ok: true };
    }
    return { ok: true };
  }

  // States
  if (resource === "states") {
    const action = String(payload.action ?? "");
    if (action === "upsert" && payload.record) {
      const rec = payload.record as { countryName: string; id: string; name: string; status: "Active" | "Inactive" };
      if (isMongoConfigured()) await upsertMongoState(rec);
      return { ok: true };
    }
    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoStateStatus(payload.ids as string[], payload.status as "Active" | "Inactive");
      return { ok: true };
    }
    if ((action === "bulk-delete" || action === "delete") && (Array.isArray(payload.ids) || payload.id)) {
      const ids = Array.isArray(payload.ids) ? payload.ids as string[] : [String(payload.id)];
      if (isMongoConfigured()) await deleteMongoStatesByIds(ids);
      return { ok: true };
    }
    return { ok: true };
  }

  // Cities
  if (resource === "cities") {
    const action = String(payload.action ?? "");
    if (action === "upsert" && payload.record) {
      const rec = payload.record as { countryName: string; id: string; name: string; stateName: string; status: "Active" | "Inactive" };
      if (isMongoConfigured()) await upsertMongoCity(rec);
      return { ok: true };
    }
    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoCityStatus(payload.ids as string[], payload.status as "Active" | "Inactive");
      return { ok: true };
    }
    if ((action === "bulk-delete" || action === "delete") && (Array.isArray(payload.ids) || payload.id)) {
      const ids = Array.isArray(payload.ids) ? payload.ids as string[] : [String(payload.id)];
      if (isMongoConfigured()) await deleteMongoCitiesByIds(ids);
      return { ok: true };
    }
    return { ok: true };
  }

  // Locations
  if (resource === "locations") {
    const action = String(payload.action ?? "");
    if (action === "upsert" && payload.record) {
      const rec = payload.record as { cityName: string; countryName: string; id: string; name: string; stateName: string; status: "Active" | "Inactive" };
      if (isMongoConfigured()) await upsertMongoLocation(rec);
      return { ok: true };
    }
    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) await bulkUpdateMongoLocationStatus(payload.ids as string[], payload.status as "Active" | "Inactive");
      return { ok: true };
    }
    if ((action === "bulk-delete" || action === "delete") && (Array.isArray(payload.ids) || payload.id)) {
      const ids = Array.isArray(payload.ids) ? payload.ids as string[] : [String(payload.id)];
      if (isMongoConfigured()) await deleteMongoLocationsByIds(ids);
      return { ok: true };
    }
    return { ok: true };
  }

  if (resource === "business") {
    const action = String(payload.action ?? "");
    if (action === "bulk-import" && Array.isArray(payload.records)) {
      if (!isMongoConfigured()) return { imported: 0, message: "MongoDB is required for CSV/Excel store import." };
      const imported = await bulkImportBusinesses(payload.records as Array<Record<string, unknown>>);
      await logMongoAdminAudit({
        action: "bulk-import",
        actorId,
        actorRole,
        details: { imported },
        resource: "business",
      });
      return { business: await getAdminResourceAsync("business"), imported };
    }
  }

  if (!isMongoConfigured()) return handleAdminAction(resource, payload);

  if (resource === "business") {
    const action = String(payload.action ?? "");
    if (action === "upsert" && payload.record && typeof payload.record === "object") {
      const listing = await upsertAdminBusiness(payload.record as Record<string, unknown>);
      if (listing) {
        await logMongoAdminAudit({
          action: "upsert",
          actorId,
          actorRole,
          businessId: listing.id,
          memberId: listing.memberId,
          ownerId: listing.ownerId,
          resource: "business",
        });
      }
      return { business: await getAdminResourceAsync("business") };
    }

    if (action === "delete" && (Array.isArray(payload.ids) || payload.id)) {
      const ids = Array.isArray(payload.ids) ? payload.ids.map(String) : [String(payload.id)];
      await deleteAdminBusinesses(ids);
      await logMongoAdminAudit({
        action: "delete",
        actorId,
        actorRole,
        details: { ids },
        resource: "business",
      });
      return { business: await getAdminResourceAsync("business") };
    }

    const ownerId = String(payload.ownerId ?? "");
    const id = String(payload.id ?? "");
    const reason = String(payload.reason ?? payload.rejectionReason ?? "").trim();
    const adminNotes = String(payload.adminNotes ?? "").trim();
    const account = ownerId ? await getOrCreateMongoMember(ownerId) : null;

    if (account && (action === "set-placements" || action === "unset-placements")) {
      const requested = normalizeBusinessPlacements(payload.placements ?? payload.placement);
      const placementExpiresAt = String(payload.placementExpiresAt ?? "").trim() || undefined;
      const placementStartsAt = String(payload.placementStartsAt ?? "").trim() || undefined;
      account.listings = account.listings.map((listing) => {
        if (listing.id !== id) return listing;
        const current = defaultPlacementsForListing(listing);
        const placements = action === "set-placements"
          ? Array.from(new Set([...current, ...requested]))
          : current.filter((placement) => !requested.includes(placement));
        const updatedAt = new Date().toISOString();
        return {
          ...listing,
          approvalStatus: "Approved",
          approvedAt: updatedAt,
          approvedBy: actorId,
          editHistory: [
            ...(Array.isArray(listing.editHistory) ? listing.editHistory : []),
            { action: "admin-placement", actorId, at: updatedAt, notes: `Placement ${action}` },
          ],
          placementExpiresAt: placementExpiresAt ?? listing.placementExpiresAt,
          placementStartsAt: placementStartsAt ?? listing.placementStartsAt,
          placements,
          status: "Active",
          updatedAt,
          verificationStatus: "Verified",
        };
      });
      account.notifications.unshift({
        id: `notif-${Date.now()}`,
        text: `Your listing placements were updated by Administrator.`,
        time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        title: "Listing Placement Update",
        unread: true,
      });
      const listing = account.listings.find((item) => item.id === id);
      await updateMongoBusinessPlacements(ownerId, id, defaultPlacementsForListing(listing ?? { status: "Active" }), actorId, { placementExpiresAt, placementStartsAt });
      await logMongoAdminAudit({
        action,
        actorId,
        actorRole,
        businessId: id,
        details: { placementExpiresAt, placementStartsAt, placements: requested },
        memberId: ownerId,
        ownerId,
        resource: "business",
      });
      await saveMongoMember(account);
      return { business: await getAdminResourceAsync("business") };
    }

    if (account && ["Active", "Inactive", "Pending", "Draft", "Featured", "Popular"].includes(action)) {
      const updatedAt = new Date().toISOString();
      const approvalStatus = action === "Active" || action === "Featured" || action === "Popular"
        ? "Approved"
        : action === "Draft"
          ? "Draft"
          : action === "Inactive"
            ? "Rejected"
            : "Pending";
      account.listings = account.listings.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              approvalStatus,
              adminNotes: adminNotes || listing.adminNotes,
              approvedAt: approvalStatus === "Approved" ? updatedAt : listing.approvedAt,
              approvedBy: approvalStatus === "Approved" ? actorId : listing.approvedBy,
              editHistory: [
                ...(Array.isArray(listing.editHistory) ? listing.editHistory : []),
                { action: "admin-status", actorId, at: updatedAt, notes: reason || `Status changed to ${action}` },
              ],
              placements: approvalStatus === "Approved"
                ? Array.from(new Set([...(listing.placements ?? []), "new" as const]))
                : listing.placements,
              rejectionReason: approvalStatus === "Rejected" ? reason : listing.rejectionReason,
              status: action as MemberListing["status"],
              updatedAt,
              verificationStatus: approvalStatus === "Approved" ? "Verified" : approvalStatus === "Rejected" ? "Rejected" : "Pending",
            }
          : listing,
      );
      account.notifications.unshift({
        id: `notif-${Date.now()}`,
        text: `Your listing status was updated to ${action} by Administrator.${reason ? ` Reason: ${reason}` : ""}`,
        time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        title: "Listing Status Update",
        unread: true,
      });
      await updateMongoBusinessStatus(ownerId, id, action as MemberListing["status"], actorId);
      await logMongoAdminAudit({
        action: `status:${action}`,
        actorId,
        actorRole,
        businessId: id,
        details: { reason, status: action },
        memberId: ownerId,
        ownerId,
        resource: "business",
      });
      await saveMongoMember(account);
      return { business: await getAdminResourceAsync("business") };
    }

    if (!ownerId && id && (action === "set-placements" || action === "unset-placements")) {
      const requested = normalizeBusinessPlacements(payload.placements ?? payload.placement);
      const placementExpiresAt = String(payload.placementExpiresAt ?? "").trim() || undefined;
      const placementStartsAt = String(payload.placementStartsAt ?? "").trim() || undefined;
      const members = await listMongoMembers({ limit: 5000 });
      await Promise.all(members.map(async (member) => {
        if (!member.listings.some((listing) => listing.id === id)) return;
        member.listings = member.listings.map((listing) => {
          if (listing.id !== id) return listing;
          const current = defaultPlacementsForListing(listing);
          const placements = action === "set-placements"
            ? Array.from(new Set([...current, ...requested]))
            : current.filter((placement) => !requested.includes(placement));
          const updatedAt = new Date().toISOString();
          return {
            ...listing,
            approvalStatus: "Approved",
            approvedAt: updatedAt,
            approvedBy: actorId,
            editHistory: [
              ...(Array.isArray(listing.editHistory) ? listing.editHistory : []),
              { action: "admin-placement", actorId, at: updatedAt, notes: `Placement ${action}` },
            ],
            placementExpiresAt: placementExpiresAt ?? listing.placementExpiresAt,
            placementStartsAt: placementStartsAt ?? listing.placementStartsAt,
            placements,
            status: "Active",
            updatedAt,
            verificationStatus: "Verified",
          };
        });
        member.notifications.unshift({
          id: `notif-${Date.now()}`,
          text: "Your listing placements were updated by Administrator.",
          time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          title: "Listing Placement Update",
          unread: true,
        });
        await logMongoAdminAudit({
          action,
          actorId,
          actorRole,
          businessId: id,
          details: { placementExpiresAt, placementStartsAt, placements: requested },
          memberId: member.profile.id,
          ownerId: member.profile.id,
          resource: "business",
        });
        await saveMongoMember(member);
      }));
      return { business: await getAdminResourceAsync("business") };
    }

    if (!ownerId && id && ["Active", "Inactive", "Pending", "Draft", "Featured", "Popular"].includes(action)) {
      const members = await listMongoMembers({ limit: 5000 });
      await Promise.all(members.map(async (member) => {
        if (!member.listings.some((listing) => listing.id === id)) return;
        const updatedAt = new Date().toISOString();
        const approvalStatus = action === "Active" || action === "Featured" || action === "Popular"
          ? "Approved"
          : action === "Draft"
            ? "Draft"
            : action === "Inactive"
              ? "Rejected"
              : "Pending";
        member.listings = member.listings.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                approvalStatus,
                adminNotes: adminNotes || listing.adminNotes,
                approvedAt: approvalStatus === "Approved" ? updatedAt : listing.approvedAt,
                approvedBy: approvalStatus === "Approved" ? actorId : listing.approvedBy,
                editHistory: [
                  ...(Array.isArray(listing.editHistory) ? listing.editHistory : []),
                  { action: "admin-status", actorId, at: updatedAt, notes: reason || `Status changed to ${action}` },
                ],
                placements: approvalStatus === "Approved"
                  ? Array.from(new Set([...(listing.placements ?? []), "new" as const]))
                  : listing.placements,
                rejectionReason: approvalStatus === "Rejected" ? reason : listing.rejectionReason,
                status: action as MemberListing["status"],
                updatedAt,
                verificationStatus: approvalStatus === "Approved" ? "Verified" : approvalStatus === "Rejected" ? "Rejected" : "Pending",
              }
            : listing,
        );
        member.notifications.unshift({
          id: `notif-${Date.now()}`,
          text: `Your listing status was updated to ${action} by Administrator.${reason ? ` Reason: ${reason}` : ""}`,
          time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          title: "Listing Status Update",
          unread: true,
        });
        await logMongoAdminAudit({
          action: `status:${action}`,
          actorId,
          actorRole,
          businessId: id,
          details: { reason, status: action },
          memberId: member.profile.id,
          ownerId: member.profile.id,
          resource: "business",
        });
        await saveMongoMember(member);
      }));
      return { business: await getAdminResourceAsync("business") };
    }
  }

  if (resource === "admin-password") {
    const newPassword = String(payload.newPassword ?? payload.password ?? "");
    if (newPassword) {
      const { updateAdminPasswordInDb } = await import("./auth");
      const ok = await updateAdminPasswordInDb(newPassword);
      return { ok, saved: ok };
    }
  }

  if (resource === "members") {
    const action = String(payload.action ?? "");
    const id = String(payload.id ?? "");

    if (action === "upsert" && payload.record && typeof payload.record === "object") {
      const record = payload.record as Record<string, unknown>;
      const username = String(record.username ?? "").trim().toLowerCase();
      const memberId = String(record.id ?? username).trim().toLowerCase();

      if (!memberId || !username) return { members: await getAdminResourceAsync("members") };

      const account = await getOrCreateMongoMember(memberId);
      const name = String(record.name ?? "").trim();
      const email = String(record.email ?? "").trim().toLowerCase();
      const phone = String(record.phone ?? "").trim();
      const password = String(record.password ?? "");

      account.profile.id = memberId;
      account.profile.name = name || account.profile.name;
      account.profile.initials = (name || username).slice(0, 2).toUpperCase();
      account.profile.username = username;
      account.profile.email = email;
      account.profile.phone = phone;
      account.profile.status = record.status === "Inactive" ? "Inactive" : "Active";
      account.packageName = String(record.packageName ?? account.packageName ?? "Free Listing");
      account.registeredAt = String(record.registeredAt ?? account.registeredAt);

      if (password) {
        const { hashPassword } = await import("./auth");
        account.passwordHash = hashPassword(password);
        account.passwordUpdatedAt = new Date().toISOString();
      }

      await saveMongoMember(account);
      return { members: await getAdminResourceAsync("members") };
    }

    if (action === "delete") {
      const ids = Array.isArray(payload.ids) ? payload.ids.map((value) => String(value).trim().toLowerCase()).filter(Boolean) : id ? [id.trim().toLowerCase()] : [];
      if (isMongoConfigured()) await deleteMongoMembersByIds(ids);
      return { members: await getAdminResourceAsync("members") };
    }

    const account = id ? await getOrCreateMongoMember(id) : null;

    if (account && ["Active", "Inactive"].includes(action)) {
      account.profile.status = action as MemberProfile["status"];
      await saveMongoMember(account);
      return { members: await getAdminResourceAsync("members") };
    }
  }

  return { data: await getAdminResourceAsync(resource) };
}

export async function addEnquiryToMemberAsync(ownerId: string, enquiry: { contact: string; email: string; message: string; name: string }) {
  if (!ownerId) return null;
  const account = await getOrCreateMongoMember(ownerId);
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const newEnq: MemberEnquiry = {
    id: `enq-${Date.now()}`,
    contact: enquiry.contact,
    date: now,
    email: enquiry.email,
    message: enquiry.message,
    name: enquiry.name,
    status: "New",
  };
  account.enquiries.unshift(newEnq);
  account.notifications.unshift({
    id: `notif-${Date.now()}`,
    text: `New lead received from ${enquiry.name} (${enquiry.contact || enquiry.email}).`,
    time: now,
    title: "New Buyer Enquiry",
    unread: true,
  });
  await saveMongoMember(account);
  return newEnq;
}

export async function addReviewToMemberAsync(ownerId: string, review: { author: string; message: string; rating: number }) {
  if (!ownerId) return null;
  const account = await getOrCreateMongoMember(ownerId);
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const newRev: MemberReview = {
    id: `rev-${Date.now()}`,
    author: review.author,
    message: review.message,
    rating: review.rating,
    status: "Published",
  };
  account.reviews.unshift(newRev);
  account.notifications.unshift({
    id: `notif-${Date.now()}`,
    text: `New ${review.rating}★ review received from ${review.author}.`,
    time: now,
    title: "Customer Review Received",
    unread: true,
  });
  await saveMongoMember(account);
  return newRev;
}
