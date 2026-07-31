"use client";

import { useEffect, useRef, useState } from "react";

type VisitorProfile = {
  email: string;
  name: string;
  phone: string;
};

function readStoredVisitor(): VisitorProfile {
  if (typeof window === "undefined") return { email: "visitor@example.com", name: "Guest Visitor", phone: "" };
  try {
    const raw = window.localStorage.getItem("checkinfo_visitor_profile");
    if (raw) return JSON.parse(raw) as VisitorProfile;
  } catch {
    // fallback
  }
  return { email: "visitor@example.com", name: "Guest Visitor", phone: "" };
}

export function HeaderUserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisitorLoggedIn, setIsVisitorLoggedIn] = useState(false);
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile>({ email: "", name: "", phone: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ email: "", name: "", phone: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check cookies / auth indicators
    const cookies = typeof document !== "undefined" ? document.cookie : "";
    const hasVisitorAuth = cookies.includes("checkinfo_user_auth=true") || window.localStorage.getItem("checkinfo_user_auth") === "true";
    const hasMemberAuth = cookies.includes("checkinfo_member_auth=true") || cookies.includes("checkinfo_member_id=") || Boolean(window.localStorage.getItem("checkinfo-member-id"));

    setIsVisitorLoggedIn(hasVisitorAuth);
    setIsMemberLoggedIn(hasMemberAuth);

    const saved = readStoredVisitor();
    setVisitorProfile(saved);
    setEditForm(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function saveVisitorProfile(e: React.FormEvent) {
    e.preventDefault();
    setVisitorProfile(editForm);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("checkinfo_visitor_profile", JSON.stringify(editForm));
    }
    setEditingProfile(false);
  }

  function handleVisitorLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("checkinfo_user_auth");
      document.cookie = "checkinfo_user_auth=; path=/; max-age=0;";
      window.location.href = "/api/auth/logout?role=user";
    }
  }

  const initials = visitorProfile.name
    ? visitorProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "VP";

  return (
    <div className="header-user-dropdown-wrap" ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="check-profile-circle"
        onClick={() => setIsOpen(!isOpen)}
        title="Account Menu"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 14px 5px 5px",
          background: isVisitorLoggedIn || isMemberLoggedIn ? "#e0f2fe" : "#ffffff",
          border: isVisitorLoggedIn || isMemberLoggedIn ? "1.5px solid #0284c7" : "1.5px solid #d1d5db",
          borderRadius: "9999px",
          color: "#0f172a",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          transition: "all 0.2s ease",
        }}
      >
        <span
          className="check-profile-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isMemberLoggedIn ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #0284c7, #0369a1)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "700",
            position: "relative",
          }}
        >
          {isVisitorLoggedIn ? initials : isMemberLoggedIn ? "BIZ" : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
          {(isVisitorLoggedIn || isMemberLoggedIn) && (
            <span
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #ffffff",
              }}
            />
          )}
        </span>
        <span>{isVisitorLoggedIn ? (visitorProfile.name || "My Account") : isMemberLoggedIn ? "Business Account" : "My Profile"}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="profile-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "300px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            padding: "1rem",
            zIndex: 100,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {isVisitorLoggedIn ? (
            /* ── Logged In Visitor Menu ── */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#0284c7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px" }}>
                  {initials}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>{visitorProfile.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>{visitorProfile.email || "Visitor Account"}</p>
                  <span style={{ display: "inline-block", background: "#e0f2fe", color: "#0369a1", fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", marginTop: "4px" }}>
                    Website Visitor
                  </span>
                </div>
              </div>

              {editingProfile ? (
                <form onSubmit={saveVisitorProfile} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "8px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>Full Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required />
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>Email Address</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} required />
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>Phone Number</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }} />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button type="submit" style={{ flex: 1, padding: "0.4rem", background: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.8rem", cursor: "pointer" }}>Save</button>
                    <button type="button" onClick={() => setEditingProfile(false)} style={{ flex: 1, padding: "0.4rem", background: "#cbd5e1", color: "#334155", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(true)}
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem", width: "100%", textAlign: "left", background: "none", border: "none", borderRadius: "8px", fontSize: "0.85rem", color: "#334155", fontWeight: "500", cursor: "pointer" }}
                  >
                    ✏️ Edit Visitor Profile
                  </button>
                  <a
                    href="/#categories"
                    onClick={() => setIsOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem", borderRadius: "8px", fontSize: "0.85rem", color: "#334155", fontWeight: "500", textDecoration: "none" }}
                  >
                    🔍 Browse Business Directory
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={handleVisitorLogout}
                style={{ width: "100%", padding: "0.6rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
              >
                Logout Visitor Session
              </button>
            </div>
          ) : isMemberLoggedIn ? (
            /* ── Logged In Business Owner Menu ── */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px" }}>
                  BIZ
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>Business Owner</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Command Center Active</p>
                  <span style={{ display: "inline-block", background: "#dcfce7", color: "#15803d", fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "999px", marginTop: "4px" }}>
                    Verified Account
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
                <a href="/members/myaccount" onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem", color: "#0f172a", fontWeight: "600", textDecoration: "none", background: "#f8fafc" }}>
                  📊 Command Center Dashboard
                </a>
                <a href="/members/add_listing" onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem", color: "#334155", fontWeight: "500", textDecoration: "none" }}>
                  ➕ Post New Ad / Add Listing
                </a>
                <a href="/members/my_listings" onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem", color: "#334155", fontWeight: "500", textDecoration: "none" }}>
                  📁 My Business Listings
                </a>
                <a href="/members/enquirylisting" onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem", color: "#334155", fontWeight: "500", textDecoration: "none" }}>
                  📩 Buyer Leads & Enquiries
                </a>
                <a href="/members/edit_account" onClick={() => setIsOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.55rem 0.6rem", borderRadius: "8px", fontSize: "0.85rem", color: "#334155", fontWeight: "500", textDecoration: "none" }}>
                  ✏️ Edit Business Profile
                </a>
              </div>

              <a
                href="/api/auth/logout?role=member"
                style={{ width: "100%", padding: "0.6rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
              >
                Logout Business Panel
              </a>
            </div>
          ) : (
            /* ── Guest Visitor Menu (Matches checkinfo.in) ── */
            <div>
              <div style={{ marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>My Profile</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>Select login or register option</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <a
                  href="/users/login"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.55rem 0.75rem",
                    background: "#f0f9ff",
                    color: "#0369a1",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                >
                  🔑 Login
                </a>
                <a
                  href="/users/register"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.55rem 0.75rem",
                    background: "#f8fafc",
                    color: "#334155",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  📝 Register Account
                </a>
                <div style={{ margin: "0.25rem 0", height: "1px", background: "#f1f5f9" }} />
                <a
                  href="/members/login"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.55rem 0.75rem",
                    background: "#ecfdf5",
                    color: "#047857",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                  }}
                >
                  💼 Business Owner Login
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
