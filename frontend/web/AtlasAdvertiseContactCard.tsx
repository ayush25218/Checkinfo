"use client";

import { useState } from "react";

export function AtlasAdvertiseContactCard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setErrorMessage("Please fill out your name and email address.");
      return;
    }
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/web/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || "Homepage Advertise Inquiry",
          message: formData.message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Failed to submit enquiry. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="atlas-advertise-wrapper" id="advertise">
      <div className="atlas-advertise-card-container">
        {/* Top Header Banner with Blue Curved Wave Design */}
        <div className="atlas-advertise-top-banner">
          <div className="atlas-banner-svg-waves" aria-hidden="true" />
          <div className="atlas-banner-content">
            <h2 className="atlas-banner-title">Advertise With Us</h2>
            <p className="atlas-banner-subtitle">
              List your business with Checkinfo to connect directly with verified buyers & grow your revenue across India.
            </p>
          </div>
        </div>

        {/* Bottom Dark Navy Base Section */}
        <div className="atlas-advertise-bottom-dark">
          {/* Overlapping Floating White Form Card */}
          <div className="atlas-advertise-form-box">
            {submitted ? (
              <div className="atlas-form-success">
                <span className="success-icon">✅</span>
                <h3>Enquiry Submitted Successfully!</h3>
                <p>Our advertising specialist will get back to you shortly.</p>
                <button
                  type="button"
                  className="atlas-reset-btn"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="atlas-advertise-form">
                {errorMessage && <div className="atlas-form-error">{errorMessage}</div>}

                {/* 2-Column Row for Name & Email */}
                <div className="atlas-form-row two-col">
                  <div className="atlas-input-group">
                    <input
                      type="text"
                      className="atlas-form-input"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="atlas-input-group">
                    <input
                      type="email"
                      className="atlas-form-input"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Subject / Business Name Row */}
                <div className="atlas-form-row">
                  <div className="atlas-input-group">
                    <input
                      type="text"
                      className="atlas-form-input"
                      placeholder="Subject / Business Name"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                {/* Message Row */}
                <div className="atlas-form-row">
                  <div className="atlas-input-group">
                    <textarea
                      className="atlas-form-textarea"
                      placeholder="Your Message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button type="submit" className="atlas-form-submit-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
