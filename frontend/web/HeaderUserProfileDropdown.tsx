"use client";

import { useEffect, useRef, useState } from "react";

type AccountMode = "guest" | "member" | "visitor";

type VisitorProfile = {
  email: string;
  name: string;
  phone: string;
};

const defaultVisitor: VisitorProfile = {
  email: "",
  name: "",
  phone: "",
};

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return "";
}

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
  if (!name) return "U";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
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
  const [displayName, setDisplayName] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookies = document.cookie || "";
    // ✅ FIX: Use regex match to ensure cookie has a non-empty value (not just the key presence)
    const memberIdMatch = cookies.match(/checkinfo_member_id=([^;]+)/);
    const memberAuthMatch = cookies.match(/checkinfo_member_auth=([^;]+)/);
    const userAuthMatch = cookies.match(/checkinfo_user_auth=([^;]+)/);
    const hasMemberCookie = !!(memberIdMatch?.[1]?.trim() || memberAuthMatch?.[1]?.trim());
    const hasUserCookie = !!(userAuthMatch?.[1]?.trim() && userAuthMatch[1] !== "false");

    if (hasMemberCookie) {
      setMode("member");
      const memberName = getCookie("checkinfo_member_name") || window.localStorage.getItem("checkinfo_member_name") || "Business Member";
      setDisplayName(memberName);
    } else if (hasUserCookie) {
      setMode("visitor");
      const visitor = readStoredVisitor();
      const userName = getCookie("checkinfo_user_name") || visitor.name || window.localStorage.getItem("checkinfo_user_name") || "User Account";
      setDisplayName(userName);
    } else {
      // Cookies are absent -> Reset header display mode without clearing business listings
      try {
        window.localStorage.removeItem("checkinfo_user_auth");
        window.localStorage.removeItem("checkinfo_user_name");
        window.localStorage.removeItem("checkinfo_member_name");
      } catch {}
      setMode("guest");
      setDisplayName("");
    }
  }, []);

  function handlePerformLogout(role: "member" | "user" | "admin") {
    // 1. Expire all auth cookies on client side
    const allAuthCookies = [
      "checkinfo_admin_auth",
      "checkinfo_member_auth",
      "checkinfo_user_auth",
      "checkinfo_member_name",
      "checkinfo_user_name",
    ];
    for (const name of allAuthCookies) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
    }
    // 2. Clear auth session flags
    try {
      window.localStorage.removeItem("checkinfo_user_auth");
      window.localStorage.removeItem("checkinfo_user_name");
      window.localStorage.removeItem("checkinfo_member_name");
    } catch {}
    // 3. Reset local state
    setMode("guest");
    setDisplayName("");
    setIsOpen(false);
    // 4. Redirect to server logout endpoint
    window.location.href = `/api/auth/logout?role=${role}`;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSignedIn = mode !== "guest";
  
  // When NOT logged in -> Label is "Login"
  // When LOGGED IN -> Label is the User's / Member's Name!
  const buttonLabel = !isSignedIn ? "Login" : displayName || (mode === "member" ? "Business Account" : "User Account");
  const avatarLabel = !isSignedIn ? "LG" : mode === "member" ? (displayName && displayName !== "Business Member" ? initialsFor(displayName) : "BIZ") : initialsFor(displayName);

  return (
    <div className="header-user-dropdown-wrap" ref={dropdownRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`check-profile-circle ${isSignedIn ? "is-active" : "is-guest"} ${mode === "member" ? "is-business" : ""}`}
        onClick={() => setIsOpen((value) => !value)}
        title={!isSignedIn ? "Login or register account" : mode === "member" ? `Business Panel (${displayName})` : `User Account (${displayName})`}
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
                <span className="profile-menu-avatar business">{initialsFor(displayName)}</span>
                <div>
                  <strong>{displayName}</strong>
                  <small>Business Member Panel</small>
                </div>
              </div>
              <a href="/members/myaccount" role="menuitem"><AccountIcon name="dashboard" />Dashboard</a>
              <a href="/members/my_listings" role="menuitem"><AccountIcon name="user" />My Business Listing</a>
              <a className="danger" href="/api/auth/logout?role=member" onClick={(e) => { e.preventDefault(); handlePerformLogout("member"); }} role="menuitem"><AccountIcon name="logout" />Logout</a>
            </>
          ) : mode === "visitor" ? (
            <>
              <div className="profile-menu-head">
                <span className="profile-menu-avatar">{initialsFor(displayName)}</span>
                <div>
                  <strong>{displayName}</strong>
                  <small>Visitor User Account</small>
                </div>
              </div>
              <a href="/#categories" role="menuitem"><AccountIcon name="dashboard" />Browse Directory</a>
              <a href="/members/login" role="menuitem"><AccountIcon name="login" />Business Owner Login</a>
              <a className="danger" href="/api/auth/logout?role=user" onClick={(e) => { e.preventDefault(); handlePerformLogout("user"); }} role="menuitem"><AccountIcon name="logout" />Logout</a>
            </>
          ) : (
            <>
              <div className="profile-menu-head">
                <span className="profile-menu-avatar">LG</span>
                <div>
                  <strong>Login Account</strong>
                  <small>Select your account type to login</small>
                </div>
              </div>
              <a href="/users/login" role="menuitem"><AccountIcon name="login" />Visitor / User Login</a>
              <a className="business-link" href="/members/login" role="menuitem"><AccountIcon name="user" />Business Owner Login</a>
              <div className="profile-menu-footer">
                <span>Don&apos;t have an account?</span>
                <a href="/users/register">Sign Up / Create Account</a>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
