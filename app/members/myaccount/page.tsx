import { AccountHeader, MemberShell } from "@/frontend/member/MemberPanel";

const dashboardCards = [
  ["Profile status", "78%", "Complete media, category, and service tags"],
  ["Listings", "1 active", "Manage free and featured business ads"],
  ["Enquiries", "0 new", "Track buyer leads from your listing"],
  ["Reach score", "Starter", "Upgrade package to boost search ranking"],
];

const quickActions = [
  ["Add Listing", "Create a new business profile with media, location, and services.", "/members/add_listing"],
  ["My Listings", "View active, pending, draft, and featured ads in one place.", "/members/my_listings"],
  ["Edit Detail", "Update business profile, media, contact details, and category.", "/members/edit_account"],
  ["My Enquiries", "Filter and manage buyer enquiries received from listings.", "/members/enquirylisting"],
  ["Manage Reviews", "View customer feedback and moderate reviews.", "/members/reviewlisting"],
  ["Featured Packages", "Compare visibility plans and promotional placements.", "/members/packages"],
  ["Notifications", "See profile alerts, approval updates, and enquiry activity.", "/members/notifications"],
  ["Support", "Contact Checkinfo care for listing or payment help.", "/members/support"],
  ["Change Password", "Keep account login secure with a fresh password.", "/members/change_password"],
];

export default function DashboardPage() {
  return (
    <MemberShell active="Dashboard">
      <AccountHeader
        action={<a className="primary-button" href="/#advertise">Post Your Ad</a>}
        eyebrow="Welcome to your account"
        subtitle="Manage listings, visibility, enquiries, reviews, support, and security from dedicated pages."
        title="Your business command center"
      />

      <section className="dashboard-grid">
        {dashboardCards.map(([title, value, note]) => (
          <article className="dashboard-card" key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Account Shortcuts</p>
            <h2>Choose a panel section</h2>
          </div>
        </div>
        <div className="shortcut-grid">
          {quickActions.map(([title, text, href]) => (
            <a className="shortcut-card" href={href} key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </a>
          ))}
        </div>
      </section>
    </MemberShell>
  );
}
