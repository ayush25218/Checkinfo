"use client";

import { useEffect, useState } from "react";
import { LocationSearchForm } from "./LocationSearchForm";
import { HeaderUserProfileDropdown } from "./HeaderUserProfileDropdown";

type SiteHeaderProps = {
  showSearch?: boolean;
  activeNav?: string;
  className?: string;
};

function useIsMemberLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const cookies = document.cookie || "";
    const mid = cookies.match(/checkinfo_member_id=([^;]+)/)?.[1];
    setLoggedIn(!!(mid?.trim() && mid.trim().length > 2));
  }, []);
  return loggedIn;
}

function ListBusinessButton() {
  const isMember = useIsMemberLoggedIn();
  return (
    <a className="check-post-button" href={isMember ? "/members/my_listings" : "/members/login"}>
      {isMember ? "My Listings" : "List Your Business"}
    </a>
  );
}

export function SiteHeader({ showSearch = true, activeNav, className = "" }: SiteHeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer when pressing Escape or resizing to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 850) {
        setIsMobileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const navLinks = [
    { label: "Home", href: "/#top" },
    { label: "About Us", href: "/about" },
    { label: "Business", href: "/new" },
    { label: "Categories", href: "/#categories" },
    { label: "Featured Ads", href: "/featured" },
    { label: "Advertise", href: "/#advertise" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className={`check-header ${className}`}>
      <div className="check-header-container">
        {/* Brand Logo */}
        <a className="check-logo" href="/" aria-label="Checkinfo home">
          <img src="/logo.png" alt="Checkinfo - Check Kiya Kya ?" className="check-logo-img" />
        </a>

        {/* Top Search Bar (visible on mid and large screens) */}
        {showSearch ? (
          <div className="check-top-search-wrap">
            <LocationSearchForm className="check-top-search" compact />
          </div>
        ) : null}

        {/* Primary Desktop Navigation */}
        <nav className="check-desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={activeNav === link.label ? "is-active" : ""}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Header Action Buttons (List Business & Profile Dropdown) */}
        <div className="check-header-actions">
          <ListBusinessButton />
          <HeaderUserProfileDropdown />

          {/* 3-Nav-Lines Hamburger Toggle (Visible <= 850px) */}
          <button
            type="button"
            className="check-mobile-toggle"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer Panel (Triggered by 3 nav lines toggle) */}
      {isMobileOpen ? (
        <div className="check-mobile-drawer-overlay" onClick={() => setIsMobileOpen(false)}>
          <div
            className="check-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Mobile Navigation"
          >
            <div className="check-mobile-drawer-header">
              <a className="check-logo" href="/" onClick={() => setIsMobileOpen(false)}>
                <img src="/logo.png" alt="Checkinfo - Check Kiya Kya ?" className="check-logo-img" />
              </a>
              <button
                type="button"
                className="check-mobile-drawer-close"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {showSearch ? (
              <div className="check-mobile-drawer-search">
                <LocationSearchForm className="check-top-search" compact />
              </div>
            ) : null}

            <nav className="check-mobile-nav" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={activeNav === link.label ? "is-active" : ""}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="check-mobile-drawer-actions">
              <a
                className="check-post-button full-width"
                href="/members/login"
                onClick={() => setIsMobileOpen(false)}
              >
                List Your Business
              </a>
              <div className="check-mobile-user-profile">
                <HeaderUserProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile Sticky Bottom Navigation Bar (Visible <= 768px) */}
      <div className="check-mobile-bottom-bar" aria-label="Mobile Bottom Navigation">
        <a href="/#top" className="bottom-bar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </a>
        <a href="/#categories" className="bottom-bar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Categories</span>
        </a>
        <a href="/members/login" className="bottom-bar-item bottom-bar-cta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>List Free</span>
        </a>
        <a href="/#contact" className="bottom-bar-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Support</span>
        </a>
      </div>
    </header>
  );
}
