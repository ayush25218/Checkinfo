import type { CSSProperties, ReactNode } from "react";

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

export const adminPages: Record<string, AdminPageConfig> = {
  dashboard: {
    group: "Dashboard",
    title: "Dashboard",
    subtitle: "Welcome to Checkinfo Administrator Area",
    stats: [
      ["172483", "Total Members"],
      ["26", "Total Business"],
      ["319", "Total Enquiry"],
      ["148", "Total Categories"],
      ["68", "Newsletter Subscribers"],
      ["248", "Total Banners"],
    ],
    columns: ["Recent Module", "Latest Item", "Status"],
    rows: [
      ["Categories", "Pathlabs, Sweet Shop", "Active"],
      ["Business", "Recently added coaching and institute listings", "Review"],
      ["FAQs", "12 published FAQs", "Active"],
      ["Testimonials", "11 testimonials", "Active"],
    ],
  },
  categories: {
    group: "Business Management",
    title: "Manage Categories",
    subtitle: "Create, sort, activate, and feature category records.",
    filters: ["Category Name", "Status", "Records Per Page"],
    columns: ["Name", "Image", "Display Order", "Current Status", "Action"],
    rows: [
      ["Website Developer", "Image", "18", "Active", "View / Edit"],
      ["Advertising", "Image", "31", "Active", "View / Edit"],
      ["Restaurants", "Image", "40", "Active", "View / Edit"],
    ],
    actions: ["Add Category", "Set Home Top", "Set Home Bottom", "Update Order"],
  },
  business: {
    group: "Business Management",
    title: "Manage Business",
    subtitle: "Review business listings, status, categories, reviews, and related ads.",
    filters: ["Business Name", "Status", "Type", "Category", "Records Per Page"],
    columns: ["Business Name", "Address", "Contact Details", "Details", "Current Status", "Action"],
    rows: [
      ["Raghavendra", "Nagarabhavi, Bengaluru", "9880518539", "View Details", "Pending", "Review"],
      ["PS Tutorials", "Malviya Nagar, Delhi", "9810810393", "View Details", "Active", "Edit"],
      ["Dreamz Institute", "GTB Nagar, Delhi", "Business profile", "Reviews 0", "Featured", "Manage"],
    ],
    actions: ["Add Business", "Activate", "Deactivate", "Delete"],
  },
  export: {
    group: "Business Management",
    title: "Manage Export",
    subtitle: "Export business and category data for reporting.",
    columns: ["Export Type", "Format", "Action"],
    rows: [
      ["Business Export", "CSV", "Download"],
      ["Category Export", "CSV", "Download"],
    ],
    actions: ["Export Business", "Export Categories"],
  },
  members: {
    group: "Members Management",
    title: "Manage Members",
    subtitle: "Control registered users, account status, mail, and switch-account workflow.",
    filters: ["Name, Username", "Status", "Records Per Page"],
    columns: ["Name", "Username", "Registration Date", "Status", "Action"],
    rows: [
      ["Raghavendra", "member-demo", "28 Jul, 2026", "Active", "View / Send Mail"],
      ["PS Tutorials", "member-demo", "28 Jul, 2026", "Active", "Switch Account"],
      ["Ayush Kumar", "business-owner", "Demo", "Active", "View Details"],
    ],
    actions: ["Registration", "Activate", "Deactivate", "Delete"],
  },
  newsletter: {
    group: "Newsletter",
    title: "Manage Newsletter",
    subtitle: "Search subscriber records and send newsletter campaigns.",
    filters: ["Email", "Records Per Page"],
    columns: ["Email", "Current Status", "Action"],
    rows: [
      ["subscriber1@example.com", "Subscribed", "Send"],
      ["subscriber2@example.com", "Subscribed", "Send"],
      ["subscriber3@example.com", "Subscribed", "Delete"],
    ],
    actions: ["Send", "Delete"],
  },
  meta: {
    group: "Manage Admin",
    title: "Manage Meta Tags",
    subtitle: "Maintain SEO title, keywords, and descriptions for listing pages.",
    filters: ["URL", "Records Per Page"],
    columns: ["URL", "Meta Details", "Action"],
    rows: [
      ["/business/raghavendra", "Title, keyword, description", "Edit"],
      ["/business/ps-tutorials", "Title, keyword, description", "Edit"],
      ["/category/website-developer", "Title, keyword, description", "Edit"],
    ],
  },
  subadmins: {
    group: "Manage Admin",
    title: "Manage Subadmins",
    subtitle: "Add, activate, deactivate, and delete admin team users.",
    filters: ["Email, Username", "Status", "Records Per Page"],
    columns: ["Email", "Username", "Name", "Phone", "Registration Date", "Status", "Action"],
    rows: [
      ["admin1@example.com", "admin-one", "Support Admin", "98XXXXXX10", "23 Dec, 2024", "Active", "Edit"],
      ["admin2@example.com", "admin-two", "Content Admin", "78XXXXXX38", "23 Dec, 2024", "Active", "Edit"],
    ],
    actions: ["Add Sub Admin", "Activate", "Deactivate", "Delete"],
  },
  settings: {
    group: "Manage Admin",
    title: "Manage Admin Settings",
    subtitle: "Update admin email, phone, map embed, address, social links, analytics, and web code.",
    filters: ["Admin Email", "Phone", "Address", "Google Analytics ID"],
    columns: ["Setting", "Value", "Action"],
    rows: [
      ["Contact Email", "info@checkinfo.in", "Update"],
      ["Phone", "9718-290-290", "Update"],
      ["Social Links", "Facebook, X, LinkedIn, YouTube, Instagram", "Update"],
      ["Analytics", "Google analytics and web code", "Update"],
    ],
    actions: ["Update Info"],
  },
  "admin-password": {
    group: "Manage Admin",
    title: "Change Password",
    subtitle: "Change administrator login password.",
    filters: ["Old Password", "New Password", "Confirm Password"],
    actions: ["Update Info"],
  },
  states: {
    group: "Locations Management",
    title: "Manage States",
    subtitle: "Add, search, activate, and delete states.",
    filters: ["State Name", "Status", "Records Per Page"],
    columns: ["State Name", "Country Name", "Status", "Action"],
    rows: [["Delhi", "India", "Active", "Edit"], ["Maharashtra", "India", "Active", "Edit"]],
    actions: ["Add State", "Activate", "Deactivate", "Delete"],
  },
  cities: {
    group: "Locations Management",
    title: "Manage City",
    subtitle: "Add cities and map them to states.",
    filters: ["City Name", "Status", "State", "Records Per Page"],
    columns: ["City Name", "State Name", "Country Name", "Status", "Action"],
    rows: [["New Delhi", "Delhi", "India", "Active", "Edit"], ["Bengaluru", "Karnataka", "India", "Active", "Edit"]],
    actions: ["Add City", "Activate", "Deactivate", "Delete"],
  },
  locations: {
    group: "Locations Management",
    title: "Manage Location",
    subtitle: "Manage local areas by city and state.",
    filters: ["Location Name", "Status", "State", "City"],
    columns: ["Location Name", "City Name", "State Name", "Country Name", "Status", "Action"],
    rows: [["Dwarka", "New Delhi", "Delhi", "India", "Active", "Edit"], ["Andheri East", "Mumbai", "Maharashtra", "India", "Active", "Edit"]],
    actions: ["Add Location", "Activate", "Deactivate", "Delete"],
  },
  "static-pages": {
    group: "Other Management",
    title: "Manage Static Pages",
    subtitle: "Edit content pages like About, Terms, FAQs, and policies.",
    filters: ["Page Name", "Records Per Page"],
    columns: ["Sl.", "Page Name", "Details", "Action"],
    rows: [["1", "About Us", "Content page", "View"], ["2", "Privacy Policy", "Legal page", "View"]],
  },
  "contact-enquiries": enquiryPage("Manage Contact Enquiries", "Contact form messages from website visitors."),
  "business-enquiries": enquiryPage("Manage Business Enquiry", "Buyer enquiries generated from business detail pages."),
  banners: {
    group: "Other Management",
    title: "Manage Banners",
    subtitle: "Control banner positions, images, and active status.",
    filters: ["Banner Position", "Records Per Page"],
    columns: ["Banner Position", "Banner Picture", "Current Status", "Action"],
    rows: [["Home Page Middle Small", "Image", "Active", "Edit"], ["Home Page Middle Big", "Image", "Active", "Edit"]],
    actions: ["Add Banner", "Activate", "Deactivate", "Delete"],
  },
  "header-images": {
    group: "Other Management",
    title: "Manage Header Images",
    subtitle: "Manage top header images and banner copy.",
    filters: ["Status", "Records Per Page"],
    columns: ["Header Image", "Line One", "Line Two", "Status", "Action"],
    rows: [["Image", "Search any Business Details here", "Local Search Engine", "Active", "View Actual Image"]],
    actions: ["Add Header Image", "Activate", "Deactivate", "Delete"],
  },
  testimonials: {
    group: "Other Management",
    title: "Manage Testimonials",
    subtitle: "Publish, edit, activate, and delete client testimonials.",
    filters: ["Name", "Records Per Page"],
    columns: ["Poster", "Description", "Current Status", "Action"],
    rows: [["Satish", "Write information about our business thank you", "Active", "Edit"], ["Test", "Demo testimonial", "Active", "Edit"]],
    actions: ["Post Testimonial", "Activate", "Deactivate", "Delete"],
  },
  faqs: {
    group: "Other Management",
    title: "Manage FAQs",
    subtitle: "Maintain questions, answers, status, and display order.",
    filters: ["Question", "Records Per Page"],
    columns: ["Question / Answer", "Display Order", "Current Status", "Action"],
    rows: [["How to buy?", "18", "Active", "View"], ["How to list business?", "19", "Active", "View"]],
    actions: ["Activate", "Deactivate", "Update Order", "Delete"],
  },
  "career-enquiries": enquiryPage("Manage Career Enquiry", "Career applications, resume links, and reply actions."),
  "advertise-enquiries": {
    ...enquiryPage("Manage Advertise Enquiry", "Advertising requests with banner upload and message details."),
    columns: ["User Info", "Email", "Banner Picture", "Message Details", "Action"],
  },
};

function enquiryPage(title: string, subtitle: string): AdminPageConfig {
  return {
    group: "Other Management",
    title,
    subtitle,
    filters: ["Name, Email", "Records Per Page"],
    columns: ["User Info", "Email", "Message Details", "Action"],
    rows: [
      ["Demo User", "user@example.com", "Customer message preview", "Send Reply"],
      ["Business Lead", "lead@example.com", "Need listing details", "Send Reply"],
    ],
    actions: ["Send Reply", "Delete"],
  };
}

const groups = [
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
];

export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <strong>Checkinfo</strong>
          <span>Administrator Area</span>
        </a>
        <nav aria-label="Admin navigation">
          {groups.map(([group, items]) => (
            <section className="admin-nav-group" key={group as string}>
              <h2>{group as string}</h2>
              {(items as string[][]).map(([label, slug]) => (
                <a
                  aria-current={active === slug ? "page" : undefined}
                  href={`/admin/${slug}`}
                  key={slug}
                >
                  {label}
                </a>
              ))}
            </section>
          ))}
        </nav>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}

export function AdminHeader({ page }: { page: AdminPageConfig }) {
  return (
    <header className="admin-header">
      <div>
        <span>{page.group}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <a href="/">View Website</a>
    </header>
  );
}

export function AdminPageBody({ page }: { page: AdminPageConfig }) {
  return (
    <>
      {page.stats ? (
        <section className="admin-stats">
          {page.stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>
      ) : null}

      <section className="admin-card">
        {page.filters ? (
          <div className="admin-filters">
            {page.filters.map((filter) => (
              <label key={filter}>
                <span>{filter}</span>
                <input placeholder={filter} type={filter.toLowerCase().includes("password") ? "password" : "text"} />
              </label>
            ))}
            <button type="button">Submit</button>
          </div>
        ) : null}

        {page.actions ? (
          <div className="admin-actions">
            {page.actions.map((action) => (
              <button type="button" key={action}>
                {action}
              </button>
            ))}
          </div>
        ) : null}

        {page.columns ? (
          <div
            className="admin-table"
            role="table"
            style={{ "--admin-cols": page.columns.length } as CSSProperties}
          >
            <div className="admin-row admin-row-head" role="row">
              {page.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {(page.rows ?? []).map((row) => (
              <div className="admin-row" role="row" key={row.join("-")}>
                {page.columns?.map((column, index) => (
                  <span key={column}>{row[index] ?? "-"}</span>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
