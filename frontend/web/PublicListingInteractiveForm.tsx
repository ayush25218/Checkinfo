"use client";

import { useState } from "react";
import type { PublicBusinessListing } from "@/backend/listingSeo";

export function PublicListingInteractiveForm({ listing }: { listing: PublicBusinessListing }) {
  const [enquiryForm, setEnquiryForm] = useState({ contact: "", email: "", message: "", name: "" });
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [claimForm, setClaimForm] = useState({ email: "", message: "", name: "", phone: "" });
  const [claimMsg, setClaimMsg] = useState("");
  const [reportForm, setReportForm] = useState({ email: "", issue: "", name: "", phone: "" });
  const [reportMsg, setReportMsg] = useState("");
  const [reviewForm, setReviewForm] = useState({ author: "", message: "", rating: "5" });
  const [reviewMsg, setReviewMsg] = useState("");

  async function submitEnquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!enquiryForm.name || (!enquiryForm.contact && !enquiryForm.email)) {
      setEnquiryMsg("Name and contact number/email are required.");
      return;
    }
    setEnquiryMsg("Sending enquiry...");
    try {
      const res = await fetch("/api/web/enquiry", {
        body: JSON.stringify({
          ...enquiryForm,
          businessName: listing.name,
          ownerId: listing.ownerId || listing.id,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        setEnquiryMsg("Enquiry sent! The business owner has received your lead.");
        setEnquiryForm({ contact: "", email: "", message: "", name: "" });
      } else {
        setEnquiryMsg("Failed to send enquiry. Please try again.");
      }
    } catch {
      setEnquiryMsg("Error submitting enquiry.");
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.author || !reviewForm.message) {
      setReviewMsg("Your name and review comment are required.");
      return;
    }
    setReviewMsg("Submitting review...");
    try {
      const res = await fetch("/api/web/review", {
        body: JSON.stringify({
          ...reviewForm,
          businessName: listing.name,
          ownerId: listing.ownerId || listing.id,
          rating: Number(reviewForm.rating),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        setReviewMsg("Review submitted successfully! Thank you for your feedback.");
        setReviewForm({ author: "", message: "", rating: "5" });
      } else {
        setReviewMsg("Failed to submit review.");
      }
    } catch {
      setReviewMsg("Error submitting review.");
    }
  }

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!claimForm.name || (!claimForm.email && !claimForm.phone)) {
      setClaimMsg("Name and email/phone are required.");
      return;
    }
    setClaimMsg("Submitting claim...");
    const res = await fetch("/api/web/claim", {
      body: JSON.stringify({ ...claimForm, businessName: listing.name }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (data?.ok) {
      setClaimMsg("Claim request sent. Admin will verify ownership.");
      setClaimForm({ email: "", message: "", name: "", phone: "" });
    } else {
      setClaimMsg(data?.message || "Claim request failed.");
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.issue) {
      setReportMsg("Please describe what is incorrect.");
      return;
    }
    setReportMsg("Submitting report...");
    const res = await fetch("/api/web/report", {
      body: JSON.stringify({ ...reportForm, businessName: listing.name }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (data?.ok) {
      setReportMsg("Report submitted. Team will review this listing.");
      setReportForm({ email: "", issue: "", name: "", phone: "" });
    } else {
      setReportMsg(data?.message || "Report failed.");
    }
  }

  return (
    <section className="listing-interactive-forms" style={{ marginTop: "2rem", display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
      <article className="location-business-card" style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Send Direct Enquiry</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>Contact {listing.name} directly with your lead or buyer request.</p>
        <form onSubmit={submitEnquiry} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            placeholder="Your Full Name *"
            value={enquiryForm.name}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
            required
          />
          <input
            placeholder="Phone / Mobile *"
            value={enquiryForm.contact}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, contact: e.target.value })}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            placeholder="Email Address"
            type="email"
            value={enquiryForm.email}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <textarea
            placeholder="Write message details..."
            rows={3}
            value={enquiryForm.message}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }}
          />
          <button type="submit" style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "#0284c7", color: "#fff", fontWeight: "600", border: "none", cursor: "pointer" }}>
            Send Enquiry
          </button>
          {enquiryMsg ? <p style={{ fontSize: "0.85rem", color: enquiryMsg.includes("sent") ? "#16a34a" : "#dc2626" }}>{enquiryMsg}</p> : null}
        </form>
      </article>

      <article className="location-business-card" style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Write a Review</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>Share customer rating & feedback for {listing.name}.</p>
        <form onSubmit={submitReview} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            placeholder="Your Name *"
            value={reviewForm.author}
            onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
            required
          />
          <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Rating:</span>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              style={{ padding: "0.3rem 0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="5">5 ★★★★★ (Excellent)</option>
              <option value="4">4 ★★★★☆ (Good)</option>
              <option value="3">3 ★★★☆☆ (Average)</option>
              <option value="2">2 ★★☆☆☆ (Poor)</option>
              <option value="1">1 ★☆☆☆☆ (Terrible)</option>
            </select>
          </label>
          <textarea
            placeholder="Write review comment..."
            rows={3}
            value={reviewForm.message}
            onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }}
            required
          />
          <button type="submit" style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "#059669", color: "#fff", fontWeight: "600", border: "none", cursor: "pointer" }}>
            Submit Review
          </button>
          {reviewMsg ? <p style={{ fontSize: "0.85rem", color: reviewMsg.includes("success") ? "#16a34a" : "#dc2626" }}>{reviewMsg}</p> : null}
        </form>
      </article>

      <article className="location-business-card" style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Claim This Business</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>Own {listing.name}? Request admin verification and account mapping.</p>
        <form onSubmit={submitClaim} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input placeholder="Owner name *" value={claimForm.name} onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input placeholder="Owner phone" value={claimForm.phone} onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input placeholder="Owner email" type="email" value={claimForm.email} onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
          <textarea placeholder="Verification note or proof details" rows={3} value={claimForm.message} onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }} />
          <button type="submit" style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "#1d4ed8", color: "#fff", fontWeight: "600", border: "none", cursor: "pointer" }}>Submit Claim</button>
          {claimMsg ? <p style={{ fontSize: "0.85rem", color: claimMsg.includes("sent") ? "#16a34a" : "#dc2626" }}>{claimMsg}</p> : null}
        </form>
      </article>

      <article className="location-business-card" style={{ padding: "1.5rem", borderRadius: "12px", background: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e5e7eb)" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Report Incorrect Listing</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>Help keep Checkinfo accurate by reporting wrong phone, address, or closed business.</p>
        <form onSubmit={submitReport} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input placeholder="Your name" value={reportForm.name} onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input placeholder="Phone or email" value={reportForm.phone} onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
          <textarea placeholder="What is incorrect? *" rows={3} value={reportForm.issue} onChange={(e) => setReportForm({ ...reportForm, issue: e.target.value })} style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }} />
          <button type="submit" style={{ padding: "0.6rem 1rem", borderRadius: "6px", background: "#b91c1c", color: "#fff", fontWeight: "600", border: "none", cursor: "pointer" }}>Report Listing</button>
          {reportMsg ? <p style={{ fontSize: "0.85rem", color: reportMsg.includes("submitted") ? "#16a34a" : "#dc2626" }}>{reportMsg}</p> : null}
        </form>
      </article>
    </section>
  );
}
