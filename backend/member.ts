export type MemberListing = {
  id: string;
  address: string;
  category: string;
  contactPerson: string;
  description: string;
  email: string;
  keywords: string;
  location: string;
  mobile: string;
  name: string;
  status: "Draft" | "Pending" | "Active" | "Featured";
  website: string;
  youtube: string;
};

export type MemberEnquiry = {
  id: string;
  contact: string;
  date: string;
  email: string;
  message: string;
  name: string;
  status: "New" | "Read" | "Closed";
};

export type MemberReview = {
  id: string;
  author: string;
  message: string;
  rating: number;
  status: "Pending" | "Published" | "Hidden";
};

export type MemberNotification = {
  id: string;
  text: string;
  time: string;
  title: string;
  unread: boolean;
};

export type SupportTicket = {
  id: string;
  email: string;
  issue: string;
  message: string;
  name: string;
  phone: string;
  status: "Open" | "Resolved";
};

const state: {
  enquiries: MemberEnquiry[];
  listings: MemberListing[];
  loggedOutAt: string | null;
  notifications: MemberNotification[];
  packageName: string;
  passwordUpdatedAt: string | null;
  reviews: MemberReview[];
  tickets: SupportTicket[];
} = {
  listings: [
    {
      id: "list-1",
      address: "GTB Nagar, New Delhi",
      category: "Education",
      contactPerson: "Ayush Kumar",
      description: "Coaching and institute listing draft.",
      email: "demo@checkinfo.in",
      keywords: "coaching, education, training",
      location: "GTB Nagar",
      mobile: "98XXXXXX10",
      name: "Dreamz Institute",
      status: "Draft",
      website: "",
      youtube: "",
    },
    {
      id: "list-2",
      address: "Bhagalpur, Bihar",
      category: "Website Developer",
      contactPerson: "Ayush Kumar",
      description: "Website development and digital services.",
      email: "demo@checkinfo.in",
      keywords: "website, app, seo",
      location: "Bhagalpur",
      mobile: "98XXXXXX10",
      name: "Ayush Digital Services",
      status: "Pending",
      website: "https://example.com",
      youtube: "",
    },
  ],
  enquiries: [
    { id: "enq-1", contact: "98XXXXXX22", date: "Today", email: "buyer@example.com", message: "Need website development quotation.", name: "Business Lead", status: "New" },
    { id: "enq-2", contact: "88XXXXXX11", date: "Yesterday", email: "demo-user@example.com", message: "Please share package details.", name: "Demo User", status: "Read" },
  ],
  reviews: [
    { id: "rev-1", author: "Satish Sharma", message: "Write information about our business thank you", rating: 5, status: "Published" },
    { id: "rev-2", author: "Demo Customer", message: "Good response and clear listing details.", rating: 4, status: "Pending" },
  ],
  notifications: [
    { id: "not-1", text: "Add images and keyword tags to improve listing quality.", time: "Today", title: "Profile reminder", unread: true },
    { id: "not-2", text: "Featured Boost can move your ad above regular listings.", time: "Yesterday", title: "Package tip", unread: false },
  ],
  packageName: "Free Listing",
  tickets: [] as SupportTicket[],
  passwordUpdatedAt: null as string | null,
  loggedOutAt: null as string | null,
};

export function getMemberState(resource = "dashboard") {
  if (resource === "dashboard") {
    const activeListings = state.listings.filter((listing) => listing.status === "Active" || listing.status === "Featured").length;
    const newEnquiries = state.enquiries.filter((enquiry) => enquiry.status === "New").length;
    return {
      activeListings,
      listingCount: state.listings.length,
      newEnquiries,
      packageName: state.packageName,
      profileScore: Math.min(100, 55 + state.listings.length * 12),
    };
  }

  return {
    enquiries: state.enquiries,
    listings: state.listings,
    notifications: state.notifications,
    packageName: state.packageName,
    reviews: state.reviews,
    tickets: state.tickets,
  }[resource] ?? state;
}

export function handleMemberAction(resource: string, payload: Record<string, unknown>) {
  const action = String(payload.action ?? "");

  if (resource === "listing") {
    if (action === "create") {
      const listing = { ...(payload.record as Omit<MemberListing, "id" | "status">), id: `list-${Date.now()}`, status: "Pending" } as MemberListing;
      state.listings.push(listing);
      return { listing, listings: state.listings };
    }

    if (action === "update") {
      const id = String(payload.id ?? state.listings[0]?.id ?? "");
      state.listings = state.listings.map((listing) =>
        listing.id === id ? { ...listing, ...(payload.record as Partial<MemberListing>), status: "Pending" } : listing,
      );
      return { listings: state.listings };
    }

    if (action === "delete") {
      const id = String(payload.id ?? "");
      state.listings = state.listings.filter((listing) => listing.id !== id);
      return { listings: state.listings };
    }

    if (action === "submit-review") {
      const id = String(payload.id ?? "");
      state.listings = state.listings.map((listing) => listing.id === id ? { ...listing, status: "Pending" } : listing);
      return { listings: state.listings };
    }
  }

  if (resource === "enquiry") {
    const id = String(payload.id ?? "");
    const status = payload.status as MemberEnquiry["status"];
    state.enquiries = state.enquiries.map((enquiry) => enquiry.id === id ? { ...enquiry, status } : enquiry);
    return { enquiries: state.enquiries };
  }

  if (resource === "review") {
    const id = String(payload.id ?? "");
    const status = payload.status as MemberReview["status"];
    state.reviews = state.reviews.map((review) => review.id === id ? { ...review, status } : review);
    return { reviews: state.reviews };
  }

  if (resource === "package") {
    state.packageName = String(payload.packageName ?? "Free Listing");
    return { packageName: state.packageName };
  }

  if (resource === "notification") {
    state.notifications = state.notifications.map((notification) => ({ ...notification, unread: false }));
    return { notifications: state.notifications };
  }

  if (resource === "support") {
    const ticket = { ...(payload.ticket as Omit<SupportTicket, "id" | "status">), id: `ticket-${Date.now()}`, status: "Open" } as SupportTicket;
    state.tickets.push(ticket);
    return { ticket, tickets: state.tickets };
  }

  if (resource === "password") {
    state.passwordUpdatedAt = new Date().toISOString();
    return { passwordUpdatedAt: state.passwordUpdatedAt };
  }

  if (resource === "logout") {
    state.loggedOutAt = new Date().toISOString();
    return { loggedOutAt: state.loggedOutAt };
  }

  return { state };
}
