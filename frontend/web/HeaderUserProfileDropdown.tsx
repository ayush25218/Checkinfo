"use client";

import { useEffect, useRef, useState } from "react";

type AccountMode = "guest" | "member" | "visitor";

type VisitorProfile = {
  email: string;
  name: string;
  phone: string;
};

const defaultVisitor: VisitorProfile = {
  email: "visitor@example.com",
  name: "Guest Visitor",
  phone: "",
};

function readStoredVisitor(): VisitorProfile {
  if (typeof window === "undefined") return defaultVisitor;

  try {
    const raw = window.localStorage.getItem("checkinfo_visitor_profile");
    return raw ? (JSON.parse(raw) as VisitorProfile) : defaultVisitor;
  } catch {
    return defaultVisitor;
  }
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "VP";
}

function AccountIcon({ name }: { name: "add" | "dashboard" | "edit" | "login" | "logout" | "register" | "user" }) {
  const paths = {
    add: "M12 5v14M5 12h14",
    dashboard: "M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v4H4v-4Zm10 0h6v4h-6v-4Z",
    edit: "M5 19h4l10-10-4-4L5 15v4Zm10-14 4 4",
    login: "M10 7V5h9v14h-9v-2M5 12h10M12 9l3 3-3 3",
    logout: "M14 7V5H5v14h9v-2M10 12h9M16 9l3 3-3 3",
    register: "M12 5v6l4 2M5 19v-2a4 4 0 0 1 4-4h2M9 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm8 5v5M14.5 18.5h5",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  };

  return (
    <svg aria-hidden="true" className="profile-menu-icon" fill="none" viewBox="0 0 24 24">
      <path d={paths[name]} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function HeaderUserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AccountMode>("guest");
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile>(defaultVisitor);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookies = document.cookie || "";
    const hasVisitorAuth = cookies.includes("checkinfo_user_auth=true") || window.localStorage.getItem("checkinfo_user_auth") === "true";
    const hasMemberAuth = cookies.includes("checkinfo_member_id=") || Boolean(window.localStorage.getItem("checkinfo-member-id"));

    setMode(hasMemberAuth ? "member" : hasVisitorAuth ? "visitor" : "guest");
    setVisitorProfile(readStoredVisitor());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSignedIn = mode !== "guest";
  const buttonLabel = mode === "member" ? "Business Panel" : mode === "visitor" ? visitorProfile.name || "My Account" : "Account";
  const avatarLabel = mode === "member" ? "BIZ" : mode === "visitor" ? initialsFor(visitorProfile.name) : "AC";

  return (
    <div className="header-user-dropdown-wrap" ref={dropdownRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`check-profile-circle ${isSignedIn ? "is-active" : ""} ${mode === "member" ? "is-business" : ""}`}
        onClick={() => setIsOpen((value) => !value)}
        title={mode === "member" ? "Business panel menu" : "Account menu"}
        type="button"
      >
        <span className="check-profile-avatar">
          {avatarLabel}
          {isSignedIn ? <span className="check-profile-status" /> : null}
        </span>
        <span className="check-profile-label">{buttonLabel}</span>
        <svg aria-hidden="true" className="check-profile-chevron" fill="none" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>

      {isOpen ? (
        <div className="profile-dropdown-menu" role="menu">
          {mode === "member" ? (
            <>
              <div className="profile-menu-head">
                <span className="profile-menu-avatar business">BIZ</span>
                <div>
                  <strong>Business Account</strong>
                  <small>Manage listings and enquiries</small>
                </div>
              </div>
              <a href="/members/myaccount" role="menuitem"><AccountIcon name="dashboard" />Dashboard</a>
              <a href="/members/add_listing" role="menuitem"><AccountIcon name="add" />Post Your Ad</a>
              <a href="/members/edit_account" role="menuitem"><AccountIcon name="edit" />Edit Business Profile</a>
              <a className="danger" href="/api/auth/logout?role=member" role="menuitem"><AccountIcon name="logout" />Logout</a>
            </>
          ) : mode === "visitor" ? (
            <>
              <div className="profile-menu-head">
                <span className="profile-menu-avatar">{initialsFor(visitorProfile.name)}</span>
                <div>
                  <strong>{visitorProfile.name || "Visitor Account"}</strong>
                  <small>{visitorProfile.email || "Website visitor"}</small>
                </div>
              </div>
              <a href="/#categories" role="menuitem"><AccountIcon name="dashboard" />Browse Directory</a>
              <a href="/members/login" role="menuitem"><AccountIcon name="login" />Business Owner Login</a>
              <a className="danger" href="/api/auth/logout?role=user" role="menuitem"><AccountIcon name="logout" />Logout</a>
            </>
          ) : (
            <>
              <div className="profile-menu-head">
                <span className="profile-menu-avatar">AC</span>
                <div>
                  <strong>Account Access</strong>
                  <small>Choose how you want to continue</small>
                </div>
              </div>
              <a href="/users/login" role="menuitem"><AccountIcon name="login" />Visitor Login</a>
              <a href="/users/register" role="menuitem"><AccountIcon name="register" />Create Visitor Account</a>
              <a className="business-link" href="/members/login" role="menuitem"><AccountIcon name="user" />Business Owner Login</a>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
