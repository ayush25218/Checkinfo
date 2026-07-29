export type Listing = {
  badge: string;
  category: string;
  location: string;
  name: string;
  score: string;
  status: string;
  type: string;
};

export type AdminPageConfig = {
  actions?: string[];
  columns?: string[];
  filters?: string[];
  group: string;
  rows?: string[][];
  stats?: string[][];
  subtitle: string;
  title: string;
};

export const categories = [
  "Website Developer",
  "Advertising",
  "Animation Institute",
  "Food",
  "Restaurants",
  "Hotels",
  "Schools",
  "Hospitals",
  "Automobile",
  "Home Decor",
  "Education",
  "PG/Hostels",
];

export const listings: Listing[] = [];

export const memberProfile = {
  email: "",
  initials: "BO",
  name: "Business Owner",
  phone: "",
  role: "Business owner account",
};

export const memberEnquiries: string[][] = [];

export const memberReviews: string[][] = [];

export const adminGroups = [
  ["Dashboard", [["Dashboard", "dashboard"]]],
  [
    "Business Management",
    [
      ["Manage Categories", "categories"],
      ["Manage Business", "business"],
      ["Manage Export", "export"],
    ],
  ],
  ["Members Management", [["Manage Members", "members"]]],
  ["Newsletter", [["Manage Newsletter", "newsletter"]]],
  [
    "Manage Admin",
    [
      ["Manage Meta Tags", "meta"],
      ["Manage Subadmins", "subadmins"],
      ["Manage Admin Settings", "settings"],
      ["Change Password", "admin-password"],
    ],
  ],
  [
    "Locations Management",
    [
      ["Manage States", "states"],
      ["Manage City", "cities"],
      ["Manage Location", "locations"],
    ],
  ],
  [
    "Other Management",
    [
      ["Manage Static Pages", "static-pages"],
      ["Manage Contact Enquiries", "contact-enquiries"],
      ["Manage Business Enquiries", "business-enquiries"],
      ["Manage Banners", "banners"],
      ["Manage Header Images", "header-images"],
      ["Manage Testimonials", "testimonials"],
      ["Manage FAQs", "faqs"],
      ["Manage Career Enquiries", "career-enquiries"],
      ["Manage Advertise Enquiries", "advertise-enquiries"],
    ],
  ],
] as const;

function enquiryPage(title: string, subtitle: string): AdminPageConfig {
  return {
    actions: ["Send Reply", "Delete"],
    columns: ["User Info", "Email", "Message Details", "Action"],
    filters: ["Name, Email", "Records Per Page"],
    group: "Other Management",
    rows: [],
    subtitle,
    title,
  };
}

export const adminPages: Record<string, AdminPageConfig> = {
  dashboard: {
    columns: ["Recent Module", "Latest Item", "Status"],
    group: "Dashboard",
    rows: [
      ["Categories", "Pathlabs, Sweet Shop", "Active"],
      ["Business", "Recently added coaching and institute listings", "Review"],
      ["FAQs", "12 published FAQs", "Active"],
      ["Testimonials", "11 testimonials", "Active"],
    ],
    stats: [
      ["172483", "Total Members"],
      ["26", "Total Business"],
      ["319", "Total Enquiry"],
      ["148", "Total Categories"],
      ["68", "Newsletter Subscribers"],
      ["248", "Total Banners"],
    ],
    subtitle: "Welcome to Checkinfo Administrator Area",
    title: "Dashboard",
  },
  categories: {
    actions: ["Add Category", "Set Home Top", "Set Home Bottom", "Update Order"],
    columns: ["Name", "Image", "Display Order", "Current Status", "Action"],
    filters: ["Category Name", "Status", "Records Per Page"],
    group: "Business Management",
    rows: [
      ["Website Developer", "Image", "18", "Active", "View / Edit"],
      ["Advertising", "Image", "31", "Active", "View / Edit"],
      ["Restaurants", "Image", "40", "Active", "View / Edit"],
    ],
    subtitle: "Create, sort, activate, and feature category records.",
    title: "Manage Categories",
  },
  business: {
    actions: ["Add Business", "Activate", "Deactivate", "Delete"],
    columns: ["Business Name", "Address", "Contact Details", "Details", "Current Status", "Action"],
    filters: ["Business Name", "Status", "Type", "Category", "Records Per Page"],
    group: "Business Management",
    rows: listings.map((listing) => [
      listing.name,
      listing.location,
      listing.type,
      listing.badge,
      listing.status,
      "Manage",
    ]),
    subtitle: "Review business listings, status, categories, reviews, and related ads.",
    title: "Manage Business",
  },
  export: tablePage("Business Management", "Manage Export", "Export business and category data for reporting.", ["Export Type", "Format", "Action"], [["Business Export", "CSV", "Download"], ["Category Export", "CSV", "Download"]], ["Export Business", "Export Categories"]),
  members: tablePage("Members Management", "Manage Members", "Control registered users, account status, mail, and switch-account workflow.", ["Name", "Username", "Registration Date", "Status", "Action"], [], ["Registration", "Activate", "Deactivate", "Delete"], ["Name, Username", "Status", "Records Per Page"]),
  newsletter: tablePage("Newsletter", "Manage Newsletter", "Search subscriber records and send newsletter campaigns.", ["Email", "Current Status", "Action"], [], ["Send", "Delete"], ["Email", "Records Per Page"]),
  meta: tablePage("Manage Admin", "Manage Meta Tags", "Maintain SEO title, keywords, and descriptions for listing pages.", ["URL", "Meta Details", "Action"], [["/business/raghavendra", "Title, keyword, description", "Edit"], ["/category/website-developer", "Title, keyword, description", "Edit"]], undefined, ["URL", "Records Per Page"]),
  subadmins: tablePage("Manage Admin", "Manage Subadmins", "Add, activate, deactivate, and delete admin team users.", ["Email", "Username", "Name", "Phone", "Registration Date", "Status", "Action"], [], ["Add Sub Admin", "Activate", "Deactivate", "Delete"], ["Email, Username", "Status", "Records Per Page"]),
  settings: tablePage("Manage Admin", "Manage Admin Settings", "Update admin email, phone, address, social links, analytics, and web code.", ["Setting", "Value", "Action"], [["Contact Email", "info@checkinfo.in", "Update"], ["Phone", "9718-290-290", "Update"], ["Analytics", "Google analytics and web code", "Update"]], ["Update Info"], ["Admin Email", "Phone", "Address", "Google Analytics ID"]),
  "admin-password": { actions: ["Update Info"], filters: ["Old Password", "New Password", "Confirm Password"], group: "Manage Admin", subtitle: "Change administrator login password.", title: "Change Password" },
  states: tablePage("Locations Management", "Manage States", "Add, search, activate, and delete states.", ["State Name", "Country Name", "Status", "Action"], [["Delhi", "India", "Active", "Edit"], ["Maharashtra", "India", "Active", "Edit"]], ["Add State", "Activate", "Deactivate", "Delete"], ["State Name", "Status", "Records Per Page"]),
  cities: tablePage("Locations Management", "Manage City", "Add cities and map them to states.", ["City Name", "State Name", "Country Name", "Status", "Action"], [["New Delhi", "Delhi", "India", "Active", "Edit"], ["Bengaluru", "Karnataka", "India", "Active", "Edit"]], ["Add City", "Activate", "Deactivate", "Delete"], ["City Name", "Status", "State", "Records Per Page"]),
  locations: tablePage("Locations Management", "Manage Location", "Manage local areas by city and state.", ["Location Name", "City Name", "State Name", "Country Name", "Status", "Action"], [["Dwarka", "New Delhi", "Delhi", "India", "Active", "Edit"], ["Andheri East", "Mumbai", "Maharashtra", "India", "Active", "Edit"]], ["Add Location", "Activate", "Deactivate", "Delete"], ["Location Name", "Status", "State", "City"]),
  "static-pages": tablePage("Other Management", "Manage Static Pages", "Edit content pages like About, Terms, FAQs, and policies.", ["Sl.", "Page Name", "Details", "Action"], [["1", "About Us", "Content page", "View"], ["2", "Privacy Policy", "Legal page", "View"]], undefined, ["Page Name", "Records Per Page"]),
  "contact-enquiries": enquiryPage("Manage Contact Enquiries", "Contact form messages from website visitors."),
  "business-enquiries": enquiryPage("Manage Business Enquiry", "Buyer enquiries generated from business detail pages."),
  banners: tablePage("Other Management", "Manage Banners", "Control banner positions, images, and active status.", ["Banner Position", "Banner Picture", "Current Status", "Action"], [["Home Page Middle Small", "Image", "Active", "Edit"], ["Home Page Middle Big", "Image", "Active", "Edit"]], ["Add Banner", "Activate", "Deactivate", "Delete"], ["Banner Position", "Records Per Page"]),
  "header-images": tablePage("Other Management", "Manage Header Images", "Manage top header images and banner copy.", ["Header Image", "Line One", "Line Two", "Status", "Action"], [["Image", "Search any Business Details here", "Local Search Engine", "Active", "View Actual Image"]], ["Add Header Image", "Activate", "Deactivate", "Delete"], ["Status", "Records Per Page"]),
  testimonials: tablePage("Other Management", "Manage Testimonials", "Publish, edit, activate, and delete client testimonials.", ["Poster", "Description", "Current Status", "Action"], [], ["Post Testimonial", "Activate", "Deactivate", "Delete"], ["Name", "Records Per Page"]),
  faqs: tablePage("Other Management", "Manage FAQs", "Maintain questions, answers, status, and display order.", ["Question / Answer", "Display Order", "Current Status", "Action"], [["How to buy?", "18", "Active", "View"], ["How to list business?", "19", "Active", "View"]], ["Activate", "Deactivate", "Update Order", "Delete"], ["Question", "Records Per Page"]),
  "career-enquiries": enquiryPage("Manage Career Enquiry", "Career applications, resume links, and reply actions."),
  "advertise-enquiries": { ...enquiryPage("Manage Advertise Enquiry", "Advertising requests with banner upload and message details."), columns: ["User Info", "Email", "Banner Picture", "Message Details", "Action"] },
};

function tablePage(group: string, title: string, subtitle: string, columns: string[], rows: string[][], actions?: string[], filters?: string[]): AdminPageConfig {
  return { actions, columns, filters, group, rows, subtitle, title };
}

export function searchListings(query = "", location = "") {
  const term = `${query} ${location}`.toLowerCase().trim();
  if (!term) return listings;
  return listings.filter((listing) =>
    [listing.name, listing.type, listing.location, listing.category].join(" ").toLowerCase().includes(term),
  );
}

export function createResponse(message: string, payload: Record<string, unknown> = {}) {
  return {
    message,
    ok: true,
    receivedAt: new Date().toISOString(),
    ...payload,
  };
}

export function getAdminPage(slug = "dashboard") {
  return adminPages[slug] ?? adminPages.dashboard;
}

export function getMemberResource(resource = "dashboard") {
  const dashboard = {
    cards: [
      ["Profile status", "78%", "Complete media, category, and service tags"],
      ["Listings", "1 active", "Manage free and featured business ads"],
      ["Enquiries", `${memberEnquiries.length} total`, "Track buyer leads from your listing"],
      ["Reach score", "Starter", "Upgrade package to boost search ranking"],
    ],
    profile: memberProfile,
  };

  const resources: Record<string, unknown> = {
    dashboard,
    enquiries: memberEnquiries,
    listings,
    notifications: [
      ["Profile review", "Your draft profile needs category and media updates.", "Unread"],
      ["Package reminder", "Featured placement is available for your category.", "Read"],
    ],
    packages: [
      ["Starter", "Free listing", "Basic search visibility"],
      ["Featured", "Promoted listing", "Top category placement"],
      ["Premium", "Lead boost", "Banner, featured card, and enquiry priority"],
    ],
    profile: memberProfile,
    reviews: memberReviews,
  };

  return resources[resource] ?? dashboard;
}

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
