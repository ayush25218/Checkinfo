"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
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
        msg: "Please fill in your Name, Message, and at least one Contact detail.",
      });
      return;
    }

    setStatus({ type: "loading", msg: "Submitting message to Admin..." });

    try {
      const res = await fetch("/api/web/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.address ? `Inquiry from ${formData.address}` : "Contact Inquiry",
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus({
          type: "success",
          msg: "Your message has been received! Our team will get back to you shortly.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          msg: data.message || "Failed to send message. Please try again.",
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
    <div className="atlas-get-in-touch-section">
      <div className="atlas-get-in-touch-container">
        {/* Left Column: Title, Subtitle, Contact Items, Social Links */}
        <div className="atlas-touch-left">
          <h2 className="atlas-touch-heading">Get In Touch</h2>
          <p className="atlas-touch-desc">
            Promote your business and get discovered with ease — List your services on Checkinfo, the smart directory solution.
          </p>

          <div className="atlas-touch-info-list">
            <div className="atlas-touch-info-item">
              <div className="atlas-touch-icon-badge">
                <span className="atlas-touch-icon">📞</span>
              </div>
              <div className="atlas-touch-info-text">
                <span className="atlas-info-label">Phone</span>
                <a href="tel:9718290290" className="atlas-info-val">+91 9718-290-290</a>
              </div>
            </div>

            <div className="atlas-touch-info-item">
              <div className="atlas-touch-icon-badge">
                <span className="atlas-touch-icon">✉️</span>
              </div>
              <div className="atlas-touch-info-text">
                <span className="atlas-info-label">Email</span>
                <a href="mailto:info@checkinfo.in" className="atlas-info-val">info@checkinfo.in</a>
              </div>
            </div>

            <div className="atlas-touch-info-item">
              <div className="atlas-touch-icon-badge">
                <span className="atlas-touch-icon">📍</span>
              </div>
              <div className="atlas-touch-info-text">
                <span className="atlas-info-label">Location</span>
                <span className="atlas-info-val">Connaught Place, New Delhi, India</span>
              </div>
            </div>
          </div>

          <div className="atlas-touch-socials" aria-label="Social links">
            <a href="https://facebook.com/checkinfo" target="_blank" rel="noreferrer" title="Facebook">f</a>
            <a href="https://twitter.com/checkinfo" target="_blank" rel="noreferrer" title="Twitter / X">𝕏</a>
            <a href="https://linkedin.com/company/checkinfo" target="_blank" rel="noreferrer" title="LinkedIn">in</a>
          </div>
        </div>

        {/* Right Column: Clean Floating White Form Box */}
        <div className="atlas-touch-right">
          <form className="atlas-touch-form-card" onSubmit={handleSubmit}>
            {status.msg ? (
              <div className={`form-status-alert ${status.type}`}>
                {status.type === "loading" ? "⏳ " : status.type === "success" ? "✅ " : "⚠️ "}
                <span>{status.msg}</span>
              </div>
            ) : null}

            <div className="atlas-touch-form-grid">
              {/* Name */}
              <div className="atlas-touch-field">
                <label htmlFor="touch-name">Name</label>
                <input
                  id="touch-name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="atlas-touch-field">
                <label htmlFor="touch-email">Email</label>
                <input
                  id="touch-email"
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Phone */}
              <div className="atlas-touch-field">
                <label htmlFor="touch-phone">Phone</label>
                <input
                  id="touch-phone"
                  type="tel"
                  placeholder="Your number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Address / Subject */}
              <div className="atlas-touch-field">
                <label htmlFor="touch-address">Address</label>
                <input
                  id="touch-address"
                  type="text"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Message */}
              <div className="atlas-touch-field full-width">
                <label htmlFor="touch-message">Message</label>
                <textarea
                  id="touch-message"
                  rows={5}
                  placeholder="Write here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="atlas-touch-form-btn-wrap">
              <button
                type="submit"
                className="atlas-touch-submit-btn"
                disabled={status.type === "loading"}
              >
                {status.type === "loading" ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
