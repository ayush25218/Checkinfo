"use client";

import { useEffect, useState } from "react";
import { LocationSearchForm } from "./LocationSearchForm";
import { HeaderUserProfileDropdown } from "./HeaderUserProfileDropdown";

type SiteHeaderProps = {
  showSearch?: boolean;
  activeNav?: string;
  className?: string;
};

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
          <span>i</span>
          <div className="check-logo-text">
            <strong>Checkinfo</strong>
            <small>Check kiya kya?</small>
          </div>
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
          <a className="check-post-button" href="/members/login">
            List Your Business
          </a>
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
                <span>i</span>
                <div className="check-logo-text">
                  <strong>Checkinfo</strong>
                  <small>Check kiya kya?</small>
                </div>
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
                <LocationSearchForm compact />
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
    </header>
  );
}
