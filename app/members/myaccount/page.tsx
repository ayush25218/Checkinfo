import { AccountHeader, MemberShell } from "../_components/MemberPanel";

const dashboardCards = [
  ["Profile status", "Draft ready", "Complete contact and category details"],
  ["Enquiries", "0 new", "Track buyer leads from your listing"],
  ["Reviews", "0 pending", "Review customer feedback in one place"],
  ["Security", "Password active", "Update account access anytime"],
];

const quickActions = [
  ["Edit Detail", "Update business profile, media, contact details, and category.", "/members/edit_account"],
  ["My Enquiries", "Filter and manage buyer enquiries received from listings.", "/members/enquirylisting"],
  ["Manage Reviews", "View customer feedback and moderate reviews.", "/members/reviewlisting"],
  ["Change Password", "Keep account login secure with a fresh password.", "/members/change_password"],
];

export default function DashboardPage() {
  return (
    <MemberShell active="Dashboard">
      <AccountHeader
        action={<a className="primary-button" href="/#advertise">Post Your Ad</a>}
        eyebrow="Welcome to your account"
        subtitle="Manage your business profile, enquiries, reviews, and password from separate pages."
        title="What do you want to do today?"
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
