import { categories } from "@/backend/checkinfo";
import { CategoryTransitionGrid } from "./CategoryTransitionGrid";
import { getAllCategoryExperiences } from "./categoryExperience";
import { BusinessCard } from "./BusinessCard";
import { getApprovedListings } from "./listingCollections";
import { DUMMY_BUSINESS_IMAGE } from "./dummyImages";
import { LocationSearchForm } from "./LocationSearchForm";
import { LeadCallbackForm } from "./LeadCallbackForm";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const footerLinks = {
  info: ["How to buy", "FAQs", "Career", "Privacy Policy", "Legal Disclaimer", "Terms And Conditions", "Refer to Friend"],
  quick: ["Home", "About Us", "Business", "Advertise with Us", "Testimonials", "Support", "Contact Us", "Sitemap"],
};

const trendingSearches = [
  { label: "Website Developer", icon: "💻" },
  { label: "Restaurants", icon: "🍽️" },
  { label: "Hospitals", icon: "🩺" },
  { label: "Hotels", icon: "🏨" },
  { label: "Schools", icon: "🎓" },
  { label: "Bank", icon: "🏦" },
];

const cityHighlights = [
  { city: "Delhi NCR", text: "Verified businesses, services, and local enquiries.", href: "/search?location=Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
  { city: "Mumbai", text: "Manufacturing, food, finance, and trade listings.", href: "/search?location=Mumbai", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80" },
  { city: "Bengaluru", text: "IT, startups, home services, and corporate vendors.", href: "/search?location=Bengaluru", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80" },
  { city: "Hyderabad", text: "Healthcare, training, fitness, and business services.", href: "/search?location=Hyderabad", image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=80" },
];

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Owner, Sharma Digital Services (Delhi)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    text: "Checkinfo helped us reach over 200+ direct customer leads within the first month. 100% genuine platform for local business owners!",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Marketing Head, Apex Clinic (Bengaluru)",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    text: "Listing our hospital services on Checkinfo drastically boosted our local search visibility. Highly recommended for all healthcare providers.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Founder, Gujarat Freight Logistics (Mumbai)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    text: "Zero spam calls and direct WhatsApp enquiries from real clients. The best corporate directory experience in India.",
    rating: 5,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://beta.checkinfo.in/#website",
      "url": "https://beta.checkinfo.in/",
      "name": "Checkinfo",
      "description": "India's Trusted Business Discovery Engine — Connect directly with 100% verified local vendors across India.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://beta.checkinfo.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://beta.checkinfo.in/#organization",
      "name": "Checkinfo",
      "url": "https://beta.checkinfo.in/",
      "logo": "https://beta.checkinfo.in/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-9718290290",
        "contactType": "customer service",
        "areaServed": "IN"
      }
    }
  ]
};

const templateFeatures = [
  ["Business profiles", "Clean listing pages for contact, services, city, and enquiry details."],
  ["Member submission", "Owners can add a business from the member panel without document pressure."],
  ["Admin review", "Every new listing stays pending until admin verifies and publishes it."],
  ["Search reach", "Category, city, and location pages help customers discover the right business faster."],
];

function GoogleAdSlot({ label, slot }: { label: string; slot: string }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!adsenseId || adsenseId.includes("XXXXXXXX")) return null;
  return (
    <aside className="ad-slot check-ad-slot-styled" aria-label={label}>
      <div className="ad-slot-label">Sponsored Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export async function HomePage() {
  const categoryExperiences = getAllCategoryExperiences();
  const business = await getApprovedListings();
  const featured = business.filter((listing) => listing.status === "Featured").slice(0, 3);
  const newest = business.slice(0, 8);
  const trending = [...business].sort((a, b) => Number(b.status === "Featured") - Number(a.status === "Featured")).slice(0, 6);

  return (
    <main className="check-home">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <section className="check-hero" id="top">
        <span className="check-hero-aurora" aria-hidden="true" />
        <span className="check-hero-grid" aria-hidden="true" />
        <div>
          <p className="eyebrow">India's Trusted Local Search Engine</p>
          <h1>Discover & Connect with Verified Businesses</h1>
          <p>
            India's Trusted Business Discovery Engine — Connect directly with 100% verified local vendors, corporate listings, and service providers across all major cities.
          </p>
          <LocationSearchForm className="check-hero-search" showSuggestions />
          <div className="check-trending-searches" aria-label="Trending searches">
            {trendingSearches.map(({ label, icon }) => (
              <a href={`/search?q=${encodeURIComponent(label)}`} key={label} className="check-trending-pill">
                <span className="trending-icon" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="check-hero-panel">
          <span className="check-hero-panel-light" aria-hidden="true" />
          <strong>Checkinfo</strong>
          <span>Business Owner: <a href="/members/login" style={{ color: "inherit", textDecoration: "underline" }}>Login</a></span>
          <a href="/members/login">List Your Business</a>
        </div>
      </section>

      {/* Live Statistics Counter Section */}
      <section className="check-stats-section" aria-label="Checkinfo Directory Statistics">
        <div className="check-stats-grid">
          <div className="check-stat-card">
            <span className="stat-icon">📊</span>
            <strong className="stat-number">50,000+</strong>
            <span className="stat-label">Listed Businesses</span>
          </div>
          <div className="check-stat-card">
            <span className="stat-icon">🌆</span>
            <strong className="stat-number">100+</strong>
            <span className="stat-label">Cities Covered</span>
          </div>
          <div className="check-stat-card">
            <span className="stat-icon">🤝</span>
            <strong className="stat-number">1M+</strong>
            <span className="stat-label">Customer Enquiries</span>
          </div>
        </div>
      </section>

      <GoogleAdSlot label="Top homepage advertisement" slot="1111111111" />

      {/* "Why Choose Checkinfo?" Trust Banner */}
      <section className="check-why-choose-section" aria-label="Why Choose Checkinfo">
        <div className="check-section-title centered">
          <p className="eyebrow">Why Choose Checkinfo</p>
          <h2>Direct Vendor Connect with Zero Friction</h2>
        </div>
        <div className="check-trust-banner-grid">
          <div className="trust-banner-card">
            <span className="trust-card-icon">✅</span>
            <h3>100% Verified Profiles</h3>
            <p>Every business profile passes manual verification for genuine GST, contact details, and location proofs.</p>
          </div>
          <div className="trust-banner-card">
            <span className="trust-card-icon">🔒</span>
            <h3>Zero Spam Call Guarantee</h3>
            <p>Connect directly with business owners on WhatsApp or phone without selling your data to third-party spammers.</p>
          </div>
          <div className="trust-banner-card">
            <span className="trust-card-icon">⚡</span>
            <h3>Instant Direct Connect</h3>
            <p>Get instant price quotes, service estimates, and book appointments directly with local vendors.</p>
          </div>
        </div>
      </section>

      <section className="check-section" id="categories">
        <div className="check-section-title">
          <h2>Top Categories by Ads</h2>
          <p>Explore business categories through a clean, high-speed discovery grid.</p>
        </div>
        <CategoryTransitionGrid categories={categoryExperiences} />
      </section>

      {/* City Discovery Section with Landmark Covers */}
      <section className="check-city-discovery" aria-label="Explore city business listings">
        <div className="check-section-title centered">
          <p className="eyebrow">Explore by city</p>
          <h2>Find businesses across high-intent locations.</h2>
          <p>Real city discovery tiles connected with Checkinfo category, search, and location routes.</p>
        </div>
        <div className="check-city-grid">
          {cityHighlights.map(({ city, text, href, image }, index) => (
            <a className={`check-city-card check-city-landmark-card city-${index + 1}`} href={href} key={city}>
              <img src={image} alt={`${city} Landmark`} className="city-landmark-image" loading="lazy" />
              <div className="city-landmark-overlay" />
              <div className="city-landmark-content">
                <span className="city-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{city}</strong>
                <small>{text}</small>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="check-testimonials-section" aria-label="Customer & Business Owner Reviews">
        <div className="check-section-title centered">
          <p className="eyebrow">Social Proof</p>
          <h2>Loved by Business Owners & Customers Across India</h2>
        </div>
        <div className="check-testimonials-grid">
          {testimonials.map((item) => (
            <article className="check-testimonial-card" key={item.name}>
              <div className="testimonial-stars">{"⭐".repeat(item.rating)}</div>
              <p className="testimonial-text">"{item.text}"</p>
              <div className="testimonial-author">
                <img src={item.avatar} alt={item.name} className="author-avatar" loading="lazy" />
                <div className="author-info">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="check-featured" id="featured">
        <div className="check-featured-copy">
          <h2>Find Your Needs In Our Best <span>Featured Ads</span></h2>
          <p>
            Featured placements keep premium businesses visible across search,
            category, and buyer-intent journeys with a sharper profile card.
          </p>
          <a href="/featured">View More</a>
        </div>
        <div className="check-card-row">
          {featured.length ? featured.map((listing) => <BusinessCard listing={listing} key={listing.id} />) : (
            <article className="check-empty-listing">
              <strong>No sponsored listings published yet</strong>
              <span>Approved paid listings from admin will appear here.</span>
            </article>
          )}
        </div>
      </section>

      <section className="check-section check-new-ads">
        <div className="check-section-title centered">
          <h2>Our New Ads</h2>
          <p>Freshly submitted business profiles, ready for discovery and enquiries.</p>
        </div>
        <div className="check-new-grid">
          {newest.length ? newest.map((listing) => <BusinessCard listing={listing} key={listing.id} />) : (
            <article className="check-empty-listing">
              <strong>No new listings published yet</strong>
              <span>User submitted listings will show after admin approval.</span>
            </article>
          )}
        </div>
        <a className="check-more-button" href="/new">View More</a>
      </section>

      <GoogleAdSlot label="Middle homepage advertisement" slot="2222222222" />

      <section className="check-section check-trending">
        <div className="check-section-title centered">
          <h2>Popular Trending Ads</h2>
          <p>
            High-interest listings surfaced for faster comparison and customer action.
          </p>
        </div>
        <div className="check-trending-grid">
          {trending.length ? trending.map((listing) => <BusinessCard listing={listing} key={listing.id} />) : (
            <article className="check-empty-listing">
              <strong>No trending listings yet</strong>
              <span>Trending placement will be calculated from real search and enquiry activity.</span>
            </article>
          )}
        </div>
        <a className="check-more-button" href="/trending">View More</a>
      </section>

      <section className="advertise" id="advertise">
        <div className="advertise-copy">
          <p className="eyebrow">Advertise with us</p>
          <h2>List your business and stand out where customers search.</h2>
          <p>
            Add your profile, publish contact details, highlight services, and
            upgrade to featured placement for stronger visibility.
          </p>
          <div className="advertise-points" aria-label="Advertising benefits">
            <span>Search priority</span>
            <span>Verified enquiries</span>
            <span>Featured placement</span>
          </div>
        </div>
        {/* ✅ FIX: Client Component handles fetch to avoid page reload to raw JSON */}
        <LeadCallbackForm />
      </section>

      <SiteFooter />

      <div className="check-floating-actions">
        <a href="/members/add_listing">Free Listing</a>
        <a href="#contact">Customer Care</a>
      </div>
    </main>
  );
}
