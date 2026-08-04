"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  { icon: "dashboard", label: "Dashboard", href: "/members/myaccount" },
  { icon: "listings", label: "My Business Listing", href: "/members/my_listings" },
  { icon: "enquiries", label: "My Enquiries", href: "/members/enquirylisting" },
  { icon: "reviews", label: "Manage Reviews", href: "/members/reviewlisting" },
  { icon: "packages", label: "Featured Packages", href: "/members/packages" },
  { icon: "notifications", label: "Notifications", href: "/members/notifications" },
  { icon: "support", label: "Support", href: "/members/support" },
  { icon: "password", label: "Change Password", href: "/members/change_password" },
  { icon: "logout", label: "Logout", href: "/api/auth/logout?role=member" },
] as const;

function NavIcon({ name }: { name: (typeof accountNav)[number]["icon"] }) {
  const paths = {
    dashboard: "M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v4H4v-4Zm10 0h6v4h-6v-4Z",
    enquiries: "M4 5h16v10H8l-4 4V5Zm4 4h8M8 12h5",
    listings: "M5 6h14M5 12h14M5 18h14",
    logout: "M10 6H6v12h4M14 8l4 4-4 4M18 12H9",
    notifications: "M18 15H6l2-3V9a4 4 0 0 1 8 0v3l2 3Zm-7 3h2",
    packages: "M5 8l7-4 7 4v8l-7 4-7-4V8Zm7 4 7-4M12 12v8M12 12 5 8",
    password: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Zm6 4v2",
    reviews: "M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 4Z",
    support: "M5 12a7 7 0 0 1 14 0v4a2 2 0 0 1-2 2h-2v-6h4M5 12h4v6H7a2 2 0 0 1-2-2v-4Zm7 7h3",
  };

  return (
    <svg aria-hidden="true" className="panel-nav-icon" fill="none" viewBox="0 0 24 24">
      <path d={paths[name]} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
    </svg>
  );
}

export function MemberShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<{
    name: string;
    role: string;
    email: string;
    initials: string;
  }>({
    name: memberProfile.name,
    role: memberProfile.role,
    email: memberProfile.email,
    initials: memberProfile.initials,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const memberId = window.localStorage.getItem("checkinfo-member-id") || "member-default";
      const raw = window.localStorage.getItem(`${memberId}-checkinfo-member-listings`);
      if (raw) {
        const listings = JSON.parse(raw);
        if (Array.isArray(listings) && listings.length > 0) {
          const first = listings[0];
          const ownerName = first.contactPerson || first.name || memberProfile.name;
          const businessRole = first.name ? `${first.name} (${first.category})` : memberProfile.role;
          const ownerEmail = first.email || memberProfile.email;
          const initials = ownerName
            .split(" ")
            .map((w: string) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "BO";

          setProfile({
            name: ownerName,
            role: businessRole,
            email: ownerEmail,
            initials,
          });
        }
      }
    } catch {}
  }, []);

  const isListingActive =
    active === "My Business Listing" ||
    active === "Add Listing" ||
    active === "My Listings" ||
    active === "Edit Detail";

  return (
    <main className="account-shell">
      <aside className="account-sidebar">
        <a className="brand account-brand" href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", padding: "0.5rem 0" }}>
          <img src="/logo.png" alt="Checkinfo" style={{ height: "38px", width: "auto", objectFit: "contain" }} />
        </a>

        <div className="member-card">
          <div className="avatar" style={{ background: "linear-gradient(135deg, #0284c7, #0f766e)", display: "grid", placeItems: "center", fontWeight: "800", color: "#fff", fontSize: "14px" }}>
            {profile.initials}
          </div>
          <strong>{profile.name}</strong>
          <span>{profile.role}</span>
          <small>{profile.email}</small>
        </div>

        <nav className="panel-nav" aria-label="Member panel navigation">
          {accountNav.map(({ href, icon, label }) => {
            const isActive = active === label || (label === "My Business Listing" && isListingActive);
            return (
              <a
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "active" : undefined}
                href={href}
                key={label}
              >
                <NavIcon name={icon} />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <section className="account-workspace">
        <div className="member-topbar">
          <div>
            <strong>Member Business Center</strong>
            <span>Create listings, track approvals, manage enquiries, and update profile data.</span>
          </div>
          <div className="member-topbar-actions">
            <a href="/">Website</a>
            <a href="/api/auth/logout?role=member">Logout</a>
          </div>
        </div>
        <section className="account-main">{children}</section>
      </section>
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
