"use client";

import { useState, type ReactNode } from "react";
import { AdminFormAutoToggle } from "./AdminFormAutoToggle";
import { AdminSidebarNav } from "./AdminSidebarNav";

type AdminGroup = readonly [string, readonly (readonly [string, string])[]];

export function AdminShellFrame({
  active,
  children,
  groups,
  roleLabel = "administrator",
}: {
  active: string;
  children: ReactNode;
  groups: readonly AdminGroup[];
  roleLabel?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className={sidebarOpen ? "admin-shell" : "admin-shell admin-shell-sidebar-closed"}>
      <aside className="admin-sidebar" aria-hidden={!sidebarOpen}>
        <button
          className="admin-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          type="button"
          aria-label="Close admin sidebar"
        >
          <span />
          <span />
        </button>
        <AdminSidebarNav active={active} groups={groups} />
      </aside>
      <section className="admin-workspace">
        <div className="admin-topbar">
          <div className="admin-topbar-brand">
            <button
              className="admin-menu-button"
              onClick={() => setSidebarOpen(true)}
              type="button"
              aria-label="Open admin sidebar"
            >
              <span />
              <span />
              <span />
            </button>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              <img src="/logo.png" alt="Checkinfo Admin" style={{ height: "36px", width: "auto", objectFit: "contain" }} />
            </a>
          </div>
          <div className="admin-topbar-actions">
            <span>You are logged in as <strong>{roleLabel}</strong></span>
            <a aria-label="Logout" href={`/api/auth/logout?role=${roleLabel === "subadmin" ? "subadmin" : "admin"}`}>Logout</a>
          </div>
        </div>
        <AdminFormAutoToggle />
        <section className="admin-main">{children}</section>
      </section>
    </main>
  );
}
