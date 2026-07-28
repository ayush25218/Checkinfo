import type { ReactNode } from "react";
import { categories as backendCategories, memberProfile } from "@/backend/checkinfo";

export const imageSlots = [
  "Primary image",
  "Gallery image 2",
  "Gallery image 3",
  "Gallery image 4",
  "Gallery image 5",
];

export const categories = backendCategories;

const accountNav = [
  ["Dashboard", "/members/myaccount"],
  ["Add Listing", "/members/add_listing"],
  ["My Listings", "/members/my_listings"],
  ["Edit Detail", "/members/edit_account"],
  ["My Enquiries", "/members/enquirylisting"],
  ["Manage Reviews", "/members/reviewlisting"],
  ["Featured Packages", "/members/packages"],
  ["Notifications", "/members/notifications"],
  ["Support", "/members/support"],
  ["Change Password", "/members/change_password"],
  ["Logout", "/members/logout"],
];

export function MemberShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <main className="account-shell">
      <aside className="account-sidebar">
        <a className="brand account-brand" href="/">
          <span className="brand-mark">CI</span>
          <span>
            <strong>Checkinfo</strong>
            <small>Member panel</small>
          </span>
        </a>

        <div className="member-card">
          <div className="avatar">{memberProfile.initials}</div>
          <strong>{memberProfile.name}</strong>
          <span>{memberProfile.role}</span>
          <small>{memberProfile.email}</small>
        </div>

        <nav className="panel-nav" aria-label="Member panel navigation">
          {accountNav.map(([label, href]) => (
            <a
              aria-current={active === label ? "page" : undefined}
              className={active === label ? "active" : undefined}
              href={href}
              key={label}
            >
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <section className="account-main">{children}</section>
    </main>
  );
}

export function AccountHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="account-topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function PanelSection({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="panel-field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder ?? label} />
    </label>
  );
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
