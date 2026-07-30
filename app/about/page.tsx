import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Checkinfo | Corporate Business Directory",
  description:
    "Learn about Checkinfo's mission, vision, goals, and purpose as a modern India business discovery platform.",
};

const sections = [
  {
    kicker: "Who We Are",
    title: "A modern business discovery platform for India.",
    body:
      "Checkinfo helps customers find business information faster and helps business owners present their services with clarity. Inspired by the original Checkinfo journey of providing online corporate information since 2009, we are building a cleaner, faster, and more useful directory experience for today's local search needs.",
    stat: "2009",
    statLabel: "information-first roots",
  },
  {
    kicker: "Our Mission",
    title: "Make every trusted business easier to discover.",
    body:
      "Our mission is to simplify how people search, compare, and contact businesses across categories, cities, and local areas. We focus on clean information, verified presentation, and practical tools that support real enquiries.",
    stat: "Fast",
    statLabel: "search-led discovery",
  },
  {
    kicker: "Our Vision",
    title: "Build a dependable digital map of Indian businesses.",
    body:
      "We want Checkinfo to become a reliable place where customers can explore local services with confidence and business owners can grow their visibility without unnecessary complexity.",
    stat: "India",
    statLabel: "local-first coverage",
  },
  {
    kicker: "Our Goals",
    title: "Better listings, better locations, better connections.",
    body:
      "Our goals are to improve category quality, create city and location based discovery pages, support simple business onboarding, and keep the platform professional, accessible, and useful for everyday decisions.",
    stat: "4",
    statLabel: "clear priorities",
  },
];

export default function AboutPage() {
  return (
    <main className="about-corporate-page">
      <header className="about-corporate-header">
        <a className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </a>
        <nav aria-label="About page navigation">
          <a href="/">Home</a>
          <a href="/#categories">Categories</a>
          <a href="/members/add_listing">Post Your Ad</a>
          <a href="/#contact">Contact</a>
        </nav>
      </header>

      <div className="about-corporate-shell">
        {sections.map((section, index) => (
          <section className="about-corporate-section" key={section.kicker}>
            <div className="about-corporate-copy">
              <p className="eyebrow">{section.kicker}</p>
              <h1>{section.title}</h1>
              <p>{section.body}</p>
            </div>
            <div className="about-corporate-visual" aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{section.stat}</strong>
              <small>{section.statLabel}</small>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
