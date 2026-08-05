"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: "",
  });
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; msg: string }>({
    type: "idle",
    msg: "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formData.name.trim() || (!formData.phone.trim() && !formData.email.trim()) || !formData.message.trim()) {
      setStatus({
        type: "error",
        msg: "Please fill in your Name, Message, and at least one Contact (Phone or Email).",
      });
      return;
    }

    setStatus({ type: "loading", msg: "Submitting enquiry to Admin..." });

    try {
      const res = await fetch("/api/web/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus({
          type: "success",
          msg: "Your enquiry has been received! Our team will contact you within 30 minutes.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "General Enquiry",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          msg: data.message || "Failed to submit enquiry. Please try again.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        msg: "Network error. Please check your connection and try again.",
      });
    }
  }

  return (
    <form className="check-contact-form-card" onSubmit={handleSubmit}>
      <div className="contact-form-header">
        <h3>Send Us a Direct Message</h3>
        <p>Fill in the 5 details below. Your request will be routed directly to Admin Support.</p>
      </div>

      {status.msg ? (
        <div className={`form-status-alert ${status.type}`}>
          {status.type === "loading" ? "⏳ " : status.type === "success" ? "✅ " : "⚠️ "}
          <span>{status.msg}</span>
        </div>
      ) : null}

      <div className="form-grid-2">
        <div className="form-field">
          <label htmlFor="contact-name">Full Name *</label>
          <div className="input-with-icon">
            <span className="field-icon">👤</span>
            <input
              id="contact-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="contact-phone">Phone / Mobile Number *</label>
          <div className="input-with-icon">
            <span className="field-icon">📞</span>
            <input
              id="contact-phone"
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-field">
          <label htmlFor="contact-email">Email Address *</label>
          <div className="input-with-icon">
            <span className="field-icon">✉️</span>
            <input
              id="contact-email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="contact-subject">Enquiry Subject / Topic *</label>
          <div className="input-with-icon">
            <span className="field-icon">📋</span>
            <select
              id="contact-subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            >
              <option value="General Enquiry">General Enquiry</option>
              <option value="Business Listing Verification">Business Listing Verification</option>
              <option value="Advertising & Sponsorship">Advertising & Sponsorship</option>
              <option value="Technical & Website Support">Technical & Website Support</option>
              <option value="Partnership Opportunity">Partnership Opportunity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">Message & Details *</label>
        <textarea
          id="contact-message"
          rows={4}
          placeholder="Describe your query or business requirement in detail..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>

      <button
        type="submit"
        className="contact-submit-btn"
        disabled={status.type === "loading"}
      >
        {status.type === "loading" ? "Submitting Enquiry..." : "Send Message to Admin →"}
      </button>
    </form>
  );
}
