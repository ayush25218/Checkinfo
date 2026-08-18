import { categories } from "@/backend/checkinfo";
import { CategoryTransitionGrid } from "./CategoryTransitionGrid";
import { getAllCategoryExperiences } from "./categoryExperience";
import { BusinessCard } from "./BusinessCard";
import { filterCollectionListings, getApprovedListings } from "./listingCollections";
import { DUMMY_BUSINESS_IMAGE } from "./dummyImages";
import { LocationSearchForm } from "./LocationSearchForm";
import { LeadCallbackForm } from "./LeadCallbackForm";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { CityCarousel } from "./CityCarousel";
import { AtlasHeroSlider } from "./AtlasHeroSlider";
import { AtlasStatsCard } from "./AtlasStatsCard";
import { AtlasTopCategoriesGrid } from "./AtlasTopCategoriesGrid";
import { AtlasFeaturedListings } from "./AtlasFeaturedListings";
import { AtlasPickupUpdates } from "./AtlasPickupUpdates";
import { AtlasAdvertiseContactCard } from "./AtlasAdvertiseContactCard";

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
  const featured = filterCollectionListings(business, "featured").slice(0, 3);
  const newest = filterCollectionListings(business, "new").slice(0, 8);
  const trending = filterCollectionListings(business, "trending").slice(0, 6);

  return (
    <main className="check-home atlas-home">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      {/* Atlas Multi-Slide Interactive Corporate Hero Slider */}
      <AtlasHeroSlider />

      {/* Atlas Floating Dark Statistics Counter Box */}
      <AtlasStatsCard />

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

      {/* Atlas "Browse Top Categories." Image Grid */}
      <AtlasTopCategoriesGrid />

      {/* City Discovery Section with Landmark Covers & Carousel */}
      <section className="check-city-discovery" aria-label="Explore city business listings">
        <div className="check-section-title centered">
          <p className="eyebrow">Explore by city</p>
          <h2>Find businesses across high-intent locations.</h2>
          <p>Real city discovery tiles connected with Checkinfo category, search, and location routes.</p>
        </div>
        <CityCarousel />
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

      {/* Atlas Modern Featured Listings Section */}
      <AtlasFeaturedListings listings={featured} />

      {/* Atlas Pickup New Updates Section */}
      <AtlasPickupUpdates />

      <GoogleAdSlot label="Middle homepage advertisement" slot="2222222222" />

      {/* Atlas Popular Trending Ads Section (Corporate Card Grid) */}
      <AtlasFeaturedListings title="Popular Trending Ads" id="trending" listings={trending} />

      {/* Atlas Modern Advertise With Us / Contact Card (Matching Reference Design) */}
      <AtlasAdvertiseContactCard />

      <SiteFooter />

      <div className="check-floating-actions">
        <a href="/members/add_listing">Free Listing</a>
        <a href="#contact">Customer Care</a>
      </div>
    </main>
  );
}
