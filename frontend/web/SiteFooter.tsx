"use client";
import { categories } from "@/backend/checkinfo";
import { useState } from "react";

export function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/web/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="newsletter-widget" style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "bold" }}>Stay Updated</label>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Your email address" 
          required 
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }}
        />
        <button type="submit" disabled={status === "loading" || status === "success"} style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "none", background: "#0070f3", color: "#fff", cursor: "pointer" }}>
          Subscribe
        </button>
      </form>
      {status === "success" && <p style={{ color: "#4caf50", fontSize: "0.8rem", marginTop: "0.5rem" }}>Subscribed successfully!</p>}
      {status === "error" && <p style={{ color: "#f44336", fontSize: "0.8rem", marginTop: "0.5rem" }}>Error subscribing.</p>}
    </div>
  );
}

const footerLinks = {
  info: ["How to buy", "FAQs", "Career", "Privacy Policy", "Legal Disclaimer", "Terms And Conditions", "Refer to Friend"],
  quick: ["Home", "About Us", "Business", "Advertise with Us", "Testimonials", "Support", "Contact Us", "Sitemap"],
};

export function SiteFooter() {
  return (
    <footer className="check-footer" id="contact">
      <div className="check-footer-card">
        <span className="check-footer-card-sheen" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
        <h3>Quick Links</h3>
        {footerLinks.quick.map((link) => {
          const quickRoutes: Record<string, string> = {
            "Home": "/",
            "About Us": "/about",
            "Business": "/new",
            "Advertise with Us": "/contact?subject=Advertise",
            "Testimonials": "/about#testimonials",
            "Support": "/contact",
            "Contact Us": "/contact",
            "Sitemap": "/sitemap.xml",
          };
          return <a href={quickRoutes[link] ?? "/"} key={link}>{link}</a>;
        })}
        <p>
          <strong>Business Owner:</strong>{" "}
          <a href="/members/login">Login</a>{" | "}
          <a href="/register">Register</a>
        </p>
      </div>
      <div className="check-footer-card">
        <span className="check-footer-card-sheen" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
        <h3>Info Links</h3>
        {footerLinks.info.map((link) => {
          const infoRoutes: Record<string, string> = {
            "How to buy": "/about#how-it-works",
            "FAQs": "/contact#faq",
            "Career": "/career",
            "Privacy Policy": "/about#privacy",
            "Legal Disclaimer": "/about#legal",
            "Terms And Conditions": "/about#terms",
            "Refer to Friend": "/register",
          };
          return <a href={infoRoutes[link] ?? "/"} key={link}>{link}</a>;
        })}
      </div>
      <div className="check-footer-card">
        <span className="check-footer-card-sheen" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
        <h3>Our Categories</h3>
        {categories.slice(0, 12).map((category) => (
          <a href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={category}>{category}</a>
        ))}
        <a href="/new">View All</a>
      </div>
      <div className="check-footer-card">
        <span className="check-footer-card-sheen" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
        <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
        <h3>Contact Detail</h3>
        <NewsletterWidget />
        <p>New Delhi</p>
        <a href="tel:9718290290">9718-290-290</a>
        <a href="mailto:info@checkinfo.in">info@checkinfo.in</a>
        <div className="check-socials" aria-label="Social links">
          <a href="https://facebook.com/checkinfo" aria-label="Facebook" target="_blank" rel="noopener noreferrer">f</a>
          <a href="https://instagram.com/checkinfo" aria-label="Instagram" target="_blank" rel="noopener noreferrer">in</a>
          <a href="https://youtube.com/@checkinfo" aria-label="YouTube" target="_blank" rel="noopener noreferrer">yt</a>
        </div>
      </div>
      <small>Copyright © 2026, Checkinfo. All rights reserved.</small>
    </footer>
  );
}
