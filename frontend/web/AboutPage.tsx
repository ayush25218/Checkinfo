import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { LeadCallbackForm } from "./LeadCallbackForm";

const values = [
  {
    icon: "🎯",
    title: "100% Manual Verification",
    description: "Every business profile listed on Checkinfo undergoes rigorous verification of contact information, GST registration, and physical address."
  },
  {
    icon: "⚡",
    title: "Direct Buyer-Seller Connection",
    description: "We eliminate expensive middlemen. Customers connect directly via phone calls, WhatsApp, or instant lead callbacks."
  },
  {
    icon: "🔒",
    title: "Data Privacy & Zero Spam",
    description: "We protect user privacy. Unlike traditional directories, your contact information is never auctioned off to spammers."
  },
  {
    icon: "📈",
    title: "Empowering SME Growth",
    description: "Giving local businesses across 100+ Indian cities the enterprise-grade web presence they need to scale effortlessly."
  }
];

const teamStats = [
  { label: "Listed Verified Businesses", value: "1,50,000+" },
  { label: "Cities & Towns Covered", value: "100+" },
  { label: "Monthly Customer Enquiries", value: "1,000,000+" },
  { label: "Platform Uptime & Speed", value: "99.9%" },
];

export function AboutPage() {
  return (
    <main className="check-home check-about-page">
      {/* Official Header with Active "About Us" state */}
      <SiteHeader activeNav="About Us" />

      {/* Hero Banner */}
      <section className="check-about-hero">
        <span className="check-hero-aurora" aria-hidden="true" />
        <span className="check-hero-grid" aria-hidden="true" />
        <div className="check-about-hero-content">
          <p className="eyebrow">About Checkinfo</p>
          <h1>Empowering Local Search & Verified Business Discovery</h1>
          <p>
            Checkinfo is India's fastest-growing corporate directory and local discovery platform. We connect high-intent buyers directly with 100% verified local vendors, service providers, and manufacturers across India.
          </p>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="check-stats-section" aria-label="Platform reach">
        <div className="check-stats-grid">
          {teamStats.map((stat) => (
            <div className="check-stat-card" key={stat.label}>
              <strong className="stat-number">{stat.value}</strong>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Story Section */}
      <section className="check-about-story-section">
        <div className="check-section-title centered">
          <p className="eyebrow">Our Mission</p>
          <h2>Building Trust in Local Commerce</h2>
        </div>
        <div className="check-about-story-grid">
          <div className="about-story-card">
            <h3>Why Checkinfo Was Founded</h3>
            <p>
              Local business search in India has long been broken by aggressive telecallers, unverified listings, and hidden fee structures. Checkinfo was built to change that by providing a transparent, high-speed, and spam-free directory.
            </p>
            <p>
              Whether you are looking for top-rated hospitals in Delhi, software developers in Bengaluru, or logistics partners in Mumbai, Checkinfo provides instant access to verified contact numbers, WhatsApp connections, and customer reviews.
            </p>
          </div>
          <div className="about-story-card highlight">
            <h3>For Business Owners</h3>
            <p>
              We provide business owners with a hassle-free digital storefront. From instant profile setup to location-based SEO visibility, Checkinfo ensures your business stands out where local customers search.
            </p>
            <a href="/members/login" className="check-post-button inline-cta">
              List Your Business Free
            </a>
          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="check-about-values-section">
        <div className="check-section-title centered">
          <p className="eyebrow">Our Core Values</p>
          <h2>Driven by Quality, Transparency & Speed</h2>
        </div>
        <div className="check-trust-banner-grid">
          {values.map((val) => (
            <div className="trust-banner-card" key={val.title}>
              <span className="trust-card-icon">{val.icon}</span>
              <h3>{val.title}</h3>
              <p>{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead / Contact CTA Section */}
      <section className="advertise" id="advertise">
        <div className="advertise-copy">
          <p className="eyebrow">Get In Touch</p>
          <h2>Have questions or want to advertise with Checkinfo?</h2>
          <p>
            Speak directly with our team for business listing verification, custom corporate ad packages, or partnership opportunities.
          </p>
          <div className="advertise-points" aria-label="Support features">
            <span>24/7 Priority Support</span>
            <span>Verified Listing Badge</span>
            <span>Featured Visibility</span>
          </div>
        </div>
        <LeadCallbackForm />
      </section>

      {/* Official Reusable Footer */}
      <SiteFooter />

      <div className="check-floating-actions">
        <a href="/members/add_listing">Free Listing</a>
        <a href="#contact">Customer Care</a>
      </div>
    </main>
  );
}
