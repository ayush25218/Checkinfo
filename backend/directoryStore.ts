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
  listMongoMembers,
  saveMongoMember,
  type MemberAccount,
  type MemberProfile,
  // Categories
  listMongoCategories,
  upsertMongoCategory,
  deleteMongoCategoryById,
  bulkUpdateMongoCategoryStatus,
  deleteMongoCategoriesByIds,
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
    const activeListings = account.listings.filter((listing) => listing.status === "Active" || listing.status === "Featured").length;
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

  if (resource === "listing") {
    if (action === "create") {
      const listing = {
        ...(payload.record as Omit<MemberListing, "id" | "status">),
        id: `list-${Date.now()}`,
        status: "Pending",
      } as MemberListing;
      account.listings.push(listing);
      return { listing, listings: account.listings };
    }

    if (action === "update") {
      const id = String(payload.id ?? account.listings[0]?.id ?? "");
      account.listings = account.listings.map((listing) =>
        listing.id === id ? { ...listing, ...(payload.record as Partial<MemberListing>), status: "Pending" } : listing,
      );
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
    return { packageName: account.packageName };
  }

  if (resource === "notification") {
    account.notifications = account.notifications.map((notification) => ({ ...notification, unread: false }));
    return { notifications: account.notifications };
  }

  if (resource === "support") {
    const ticket = { ...(payload.ticket as Omit<SupportTicket, "id" | "status">), id: `ticket-${Date.now()}`, status: "Open" } as SupportTicket;
    account.tickets.push(ticket);
    return { ticket, tickets: account.tickets };
  }

  if (resource === "password") {
    account.passwordUpdatedAt = new Date().toISOString();
    return { passwordUpdatedAt: account.passwordUpdatedAt };
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
      badge: listing.status === "Featured" ? "Featured" : "Verified",
      businessType: listing.businessType,
      category: listing.category,
      city: listing.city,
      contact: listing.mobile || listing.email,
      details: listing.description || listing.keywords,
      id: listing.id,
      location: listingLocationText(listing),
      mobile: listing.mobile,
      name: listing.name,
      ownerEmail: member.profile.email,
      ownerId: member.profile.id,
      ownerName: member.profile.name,
      publicPath: listingPublicPath(listing),
      state: listing.state,
      status: listing.status,
      subcategory: listing.subcategory,
      subcity: listing.subcity,
      website: listing.website,
    })),
  );
}

export function getAdminResource(resource = "dashboard") {
  const store = getStore();
  const localMembers = Object.values(store.members);
  const members = localMembers.length ? localMembers : demoMemberAccounts;
  const business = buildBusinessFromMembers(members);

  if (resource === "dashboard") {
    return {
      activeMembers: members.filter((member) => member.profile.status === "Active").length,
      categories: categories.length,
      members: members.length,
      pendingBusiness: business.filter((listing) => listing.status === "Pending").length,
      totalBusiness: business.length,
    };
  }

  if (resource === "business") return business;

  if (resource === "members") {
    return members.map((member) => ({
      email: member.profile.email,
      id: member.profile.id,
      listingCount: member.listings.length,
      name: member.profile.name,
      phone: member.profile.phone,
      registeredAt: member.registeredAt,
      status: member.profile.status,
      username: member.profile.username,
    }));
  }

  return null;
}

export async function getAdminResourceAsync(resource = "dashboard") {
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
    } catch {
      return getAdminResource(resource);
    }
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
    } catch {
      return getAdminResource(resource);
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
    } catch {
      return getAdminResource(resource);
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
        phone: doc.phone,
        registeredAt: doc.registeredAt,
        status: doc.status,
        username: doc.username,
      }));
    } catch {
      return [];
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
    } catch { /* fall through */ }
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
    } catch {
      return [];
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
    } catch {
      return [];
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
    } catch {
      return [];
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
    } catch {
      return [];
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
    } catch {
      return [];
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
    } catch {
      return [];
    }
  }

  let members: MemberAccount[];
  try {
    members = await listMongoMembers();
  } catch {
    members = demoMemberAccounts;
  }
  if (members.length === 0) members = demoMemberAccounts;
  const business = buildBusinessFromMembers(members);

  if (resource === "dashboard") {
    return {
      activeMembers: members.filter((member) => member.profile.status === "Active").length,
      categories: categories.length,
      members: members.length,
      pendingBusiness: business.filter((listing) => listing.status === "Pending").length,
      totalBusiness: business.length,
    };
  }

  if (resource === "business") return business;

  if (resource === "members") {
    return members.map((member) => ({
      email: member.profile.email,
      id: member.profile.id,
      listingCount: member.listings.length,
      name: member.profile.name,
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
    const ownerId = String(payload.ownerId ?? "");
    const id = String(payload.id ?? "");
    const account = ownerId ? getMemberAccount(ownerId) : null;

    if (account && ["Active", "Inactive", "Pending", "Draft", "Featured"].includes(action)) {
      account.listings = account.listings.map((listing) =>
        listing.id === id ? { ...listing, status: action as MemberListing["status"] } : listing,
      );
      return { business: getAdminResource("business") };
    }
  }

  if (resource === "members") {
    const action = String(payload.action ?? "");
    const id = String(payload.id ?? "");
    const account = id ? getMemberAccount(id) : null;

    if (account && ["Active", "Inactive"].includes(action)) {
      account.profile.status = action as MemberProfile["status"];
      return { members: getAdminResource("members") };
    }
  }

  return { data: getAdminResource(resource) };
}

export async function handleAdminActionAsync(resource: string, payload: Record<string, unknown>) {
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
      return { ok: true };
    }

    if (action === "delete" && payload.id) {
      if (isMongoConfigured()) await deleteMongoCategoryById(String(payload.id));
      return { ok: true };
    }

    if (action === "bulk-status" && Array.isArray(payload.ids) && payload.status) {
      if (isMongoConfigured()) {
        await bulkUpdateMongoCategoryStatus(
          payload.ids as string[],
          payload.status as "Active" | "Inactive",
        );
      }
      return { ok: true };
    }

    if (action === "bulk-delete" && Array.isArray(payload.ids)) {
      if (isMongoConfigured()) await deleteMongoCategoriesByIds(payload.ids as string[]);
      return { ok: true };
    }

    return { ok: true };
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
        email: string; id: string; name: string; phone: string;
        registeredAt: string; status: "Active" | "Inactive"; username: string;
      };
      if (isMongoConfigured()) await upsertMongoSubadmin(rec);
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

  if (!isMongoConfigured()) return handleAdminAction(resource, payload);

  if (resource === "business") {
    const action = String(payload.action ?? "");
    const ownerId = String(payload.ownerId ?? "");
    const id = String(payload.id ?? "");
    const account = ownerId ? await getOrCreateMongoMember(ownerId) : null;

    if (account && ["Active", "Inactive", "Pending", "Draft", "Featured"].includes(action)) {
      account.listings = account.listings.map((listing) =>
        listing.id === id ? { ...listing, status: action as MemberListing["status"] } : listing,
      );
      account.notifications.unshift({
        id: `notif-${Date.now()}`,
        text: `Your listing status was updated to ${action} by Administrator.`,
        time: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        title: "Listing Status Update",
        unread: true,
      });
      await saveMongoMember(account);
      return { business: await getAdminResourceAsync("business") };
    }
  }

  if (resource === "members") {
    const action = String(payload.action ?? "");
    const id = String(payload.id ?? "");
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
