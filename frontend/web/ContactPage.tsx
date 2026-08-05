import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { LeadCallbackForm } from "./LeadCallbackForm";

export function ContactPage() {
  return (
    <main className="check-home check-contact-page">
      <SiteHeader activeNav="Contact" />

      {/* Contact Hero Banner */}
      <section className="check-about-hero">
        <span className="check-hero-aurora" aria-hidden="true" />
        <span className="check-hero-grid" aria-hidden="true" />
        <div className="check-about-hero-content">
          <p className="eyebrow">Contact Us</p>
          <h1>We are Here to Help Your Business Grow</h1>
          <p>
            Have questions about business verification, listing packages, or advertising with Checkinfo? Reach out to our dedicated support team.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="check-why-choose-section" aria-label="Contact Information">
        <div className="check-trust-banner-grid">
          <div className="trust-banner-card">
            <span className="trust-card-icon">📞</span>
            <h3>Phone & WhatsApp</h3>
            <p>Direct Support & Business Enquiries:</p>
            <a href="tel:9718290290" style={{ fontWeight: 800, color: "#2563eb", fontSize: "16px" }}>
              +91 9718-290-290
            </a>
          </div>

          <div className="trust-banner-card">
            <span className="trust-card-icon">✉️</span>
            <h3>Email Address</h3>
            <p>For official support & corporate partnerships:</p>
            <a href="mailto:info@checkinfo.in" style={{ fontWeight: 800, color: "#2563eb", fontSize: "16px" }}>
              info@checkinfo.in
            </a>
          </div>

          <div className="trust-banner-card">
            <span className="trust-card-icon">📍</span>
            <h3>Headquarters</h3>
            <p>Corporate Office Location:</p>
            <strong style={{ color: "#0f172a", fontSize: "15px" }}>
              New Delhi, India
            </strong>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="advertise" id="contact-form">
        <div className="advertise-copy">
          <p className="eyebrow">Send an Enquiry</p>
          <h2>Request a Free Callback from Our Business Experts</h2>
          <p>
            Fill out your details below and our team will get in touch with you within 30 minutes.
          </p>
          <div className="advertise-points" aria-label="Contact benefits">
            <span>Instant Callback</span>
            <span>Dedicated Support</span>
            <span>Free Onboarding Consultation</span>
          </div>
        </div>
        <LeadCallbackForm />
      </section>

      <SiteFooter />

      <div className="check-floating-actions">
        <a href="/members/add_listing">Free Listing</a>
        <a href="#contact-form">Customer Care</a>
      </div>
    </main>
  );
}
