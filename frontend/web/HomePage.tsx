import { categories } from "@/backend/checkinfo";
import { CategoryTransitionGrid } from "./CategoryTransitionGrid";
import { getAllCategoryExperiences } from "./categoryExperience";
import { BusinessCard } from "./BusinessCard";
import { getApprovedListings } from "./listingCollections";
import { DUMMY_BUSINESS_IMAGE } from "./dummyImages";
import { LocationSearchForm } from "./LocationSearchForm";

import { HeaderUserProfileDropdown } from "./HeaderUserProfileDropdown";

const footerLinks = {
  info: ["How to buy", "FAQs", "Career", "Privacy Policy", "Legal Disclaimer", "Terms And Conditions", "Refer to Friend"],
  quick: ["Home", "About Us", "Business", "Advertise with Us", "Testimonials", "Support", "Contact Us", "Sitemap"],
};

const trendingSearches = ["Website Developer", "Restaurants near me", "Hospitals", "Hotels", "Schools", "Bank"];

const cityHighlights = [
  ["Delhi NCR", "Verified businesses, services, and local enquiries.", "/search?location=Delhi"],
  ["Mumbai", "Manufacturing, food, finance, and trade listings.", "/search?location=Mumbai"],
  ["Bengaluru", "IT, startups, home services, and corporate vendors.", "/search?location=Bengaluru"],
  ["Hyderabad", "Healthcare, training, fitness, and business services.", "/search?location=Hyderabad"],
];

const templateFeatures = [
  ["Business profiles", "Clean listing pages for contact, services, city, and enquiry details."],
  ["Member submission", "Owners can add a business from the member panel without document pressure."],
  ["Admin review", "Every new listing stays pending until admin verifies and publishes it."],
  ["Search reach", "Category, city, and location pages help customers discover the right business faster."],
];

function GoogleAdSlot({ label, slot }: { label: string; slot: string }) {
  return (
    <aside className="ad-slot" aria-label={label}>
      <div className="ad-slot-label">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <small>Replace client and slot code manually</small>
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
      <header className="check-header">
        <a className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </a>
        <LocationSearchForm className="check-top-search" compact />
        <nav aria-label="Primary navigation">
          <a href="#top">Home</a>
          <a href="/about">About Us</a>
          <a href="/new">Business</a>
          <a href="#categories">Categories</a>
          <a href="/featured">Featured Ads</a>
          <a href="#advertise">Advertise</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="check-header-actions">
          <a className="check-post-button" href="/members/login">List Your Business</a>
          <HeaderUserProfileDropdown />
        </div>
      </header>

      <section className="check-hero" id="top">
        <span className="check-hero-aurora" aria-hidden="true" />
        <span className="check-hero-grid" aria-hidden="true" />
        <div>
          <p className="eyebrow">India local search engine</p>
          <h1>Search any business details here.</h1>
          <p>
            A faster corporate directory for verified businesses, promoted ads,
            new listings, trending searches, customer care, and free business
            onboarding.
          </p>
          <LocationSearchForm className="check-hero-search" showSuggestions />
          <div className="check-trending-searches" aria-label="Trending searches">
            {trendingSearches.map((search) => (
              <a href={`/search?q=${encodeURIComponent(search)}`} key={search}>{search}</a>
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

      <GoogleAdSlot label="Top homepage advertisement" slot="1111111111" />

      <section className="check-template-mix" aria-label="Featured local discovery">
        <div className="check-template-copy">
          <p className="eyebrow">Corporate business discovery</p>
          <h2>Verified local businesses, organized for faster customer decisions.</h2>
          <p>
            Checkinfo helps customers compare local businesses by category,
            city, and service area while owners get a simple path to submit,
            manage, and promote their listings after admin approval.
          </p>
          <div className="check-template-feature-grid">
            {templateFeatures.map(([title, text]) => (
              <article key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="check-template-showcase">
          <span className="check-template-orbit" aria-hidden="true" />
          {featured.slice(0, 2).map((listing, index) => (
            <article className={`check-template-float-card float-${index + 1}`} key={listing.id}>
              <div className="check-template-float-image">
                <img src={DUMMY_BUSINESS_IMAGE} alt="" />
              </div>
              <small>{listing.city || "India"} / {listing.badge || "Verified"}</small>
              <strong>{listing.name}</strong>
              <a href={listing.publicPath || "#featured"}>View Detail</a>
            </article>
          ))}
          <div className="check-template-search-card">
            <span>Directory dashboard</span>
            <strong>{business.length} listings ready</strong>
            <p>Dummy visuals are active while final business images are prepared.</p>
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

      <section className="check-city-discovery" aria-label="Explore city business listings">
        <div className="check-section-title centered">
          <p className="eyebrow">Explore by city</p>
          <h2>Find businesses across high-intent locations.</h2>
          <p>Real city discovery tiles connected with Checkinfo category, search, and location routes.</p>
        </div>
        <div className="check-city-grid">
          {cityHighlights.map(([city, text, href], index) => (
            <a className={`check-city-card city-${index + 1}`} href={href} key={city}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{city}</strong>
              <small>{text}</small>
            </a>
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
        <form className="lead-form" action="/api/web/lead" method="post">
          <strong>Get a callback</strong>
          <input name="business_name" placeholder="Business name" aria-label="Business name" />
          <input name="phone" placeholder="Phone number" aria-label="Phone number" />
          <input name="email" placeholder="Email address" aria-label="Email address" />
          <button type="submit">Request Callback</button>
        </form>
      </section>

      <footer className="check-footer" id="contact">
        <div className="check-footer-card">
          <span className="check-footer-card-sheen" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
          <h3>Quick Links</h3>
          {footerLinks.quick.map((link) => <a href={link === "About Us" ? "/about" : "#top"} key={link}>{link}</a>)}
          <p><strong>Business Owner :</strong> Login | Register</p>
        </div>
        <div className="check-footer-card">
          <span className="check-footer-card-sheen" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
          <h3>Info Links</h3>
          {footerLinks.info.map((link) => <a href="#top" key={link}>{link}</a>)}
        </div>
        <div className="check-footer-card">
          <span className="check-footer-card-sheen" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
          <h3>Our Categories</h3>
          {categories.map((category) => (
            <a href="#categories" key={category}>{category}</a>
          ))}
          <a href="#categories">View All</a>
        </div>
        <div className="check-footer-card">
          <span className="check-footer-card-sheen" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-top" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-left-bottom" aria-hidden="true" />
          <span className="check-footer-rod check-footer-rod-right-bottom" aria-hidden="true" />
          <h3>Contact Detail</h3>
          <p>New Delhi</p>
          <a href="tel:9718290290">9718-290-290</a>
          <a href="mailto:info@checkinfo.in">info@checkinfo.in</a>
          <div className="check-socials" aria-label="Social links">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
        <small>Copyright © 2026, Checkinfo. All rights reserved.</small>
      </footer>

      <div className="check-floating-actions">
        <a href="/members/add_listing">Free Listing</a>
        <a href="#contact">Customer Care</a>
      </div>
    </main>
  );
}
