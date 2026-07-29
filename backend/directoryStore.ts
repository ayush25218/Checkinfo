import { categories } from "./checkinfo";
import type {
  MemberEnquiry,
  MemberListing,
  MemberNotification,
  MemberReview,
  SupportTicket,
} from "./member";

type MemberProfile = {
  email: string;
  id: string;
  initials: string;
  name: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  username: string;
};

type MemberAccount = {
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

export function getMemberState(memberId: string, resource = "dashboard") {
  const account = getMemberAccount(memberId);

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

export function handleMemberAction(memberId: string, resource: string, payload: Record<string, unknown>) {
  const account = getMemberAccount(memberId);
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

export function getAdminResource(resource = "dashboard") {
  const store = getStore();
  const members = Object.values(store.members);
  const business = members.flatMap((member) =>
    member.listings.map((listing) => ({
      address: listing.address || listing.location,
      badge: listing.status === "Featured" ? "Featured" : "Verified",
      category: listing.category,
      contact: listing.mobile || listing.email,
      details: listing.description || listing.keywords,
      id: listing.id,
      mobile: listing.mobile,
      name: listing.name,
      ownerEmail: member.profile.email,
      ownerId: member.profile.id,
      ownerName: member.profile.name,
      status: listing.status,
      website: listing.website,
    })),
  );

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
