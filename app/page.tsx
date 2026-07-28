import { Fragment } from "react";

const categories = [
  "Website Developer",
  "Advertising",
  "Animation Institute",
  "Food",
  "Restaurants",
  "Hotels",
  "Schools",
  "Hospitals",
  "Automobile",
  "Home Decor",
  "Education",
  "PG/Hostels",
];

const listings = [
  {
    name: "Thomas Cook",
    type: "Money transfer, visa services, holiday services",
    location: "Dwarka Nagar, Visakhapatnam",
    badge: "Featured",
    score: "4.8",
  },
  {
    name: "Travelyaari",
    type: "Travel agent, tour operator",
    location: "Residency Road, Bengaluru",
    badge: "Verified",
    score: "4.6",
  },
  {
    name: "Dreamz Institute",
    type: "Coaching, fashion design, entrance exam training",
    location: "GTB Nagar, New Delhi",
    badge: "Popular",
    score: "4.7",
  },
  {
    name: "Orbit Communication",
    type: "SMS service provider",
    location: "Andheri East, Mumbai",
    badge: "Trending",
    score: "4.5",
  },
  {
    name: "Unnati Pumps Pvt Ltd.",
    type: "Submersible pumps, motors, borewell solutions",
    location: "Naroda Road, Ahmedabad",
    badge: "New",
    score: "4.4",
  },
  {
    name: "Digital Krushna",
    type: "Digital marketing agency",
    location: "Pimpri-Chinchwad, Maharashtra",
    badge: "Featured",
    score: "4.9",
  },
];

const stats = [
  ["36K+", "active ads"],
  ["120+", "cities covered"],
  ["24 hr", "listing review"],
  ["9718-290-290", "business support"],
];

const smartSearches = [
  "best website developer near me",
  "family restaurants open today",
  "school admissions in Delhi",
  "hotel with banquet hall",
];

function GoogleAdSlot({
  label,
  slot,
  format = "auto",
}: {
  label: string;
  slot: string;
  format?: string;
}) {
  return (
    <aside className="ad-slot" aria-label={label}>
      <div className="ad-slot-label">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <small>Replace client and slot code manually</small>
    </aside>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Checkinfo home">
          <span className="brand-mark">CI</span>
          <span>
            <strong>Checkinfo</strong>
            <small>India business directory</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#categories">Business</a>
          <a href="#featured">Featured Ads</a>
          <a href="#advertise">Advertise</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <a className="ghost-button" href="/members/myaccount">My Panel</a>
          <a className="ghost-button" href="/admin">Admin Panel</a>
          <a className="primary-button" href="#advertise">Post Your Ad</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-content">
          <p className="eyebrow">Local search engine for growing businesses</p>
          <h1>Find trusted local businesses across India in seconds.</h1>
          <p className="hero-copy">
            Search services, compare verified listings, discover featured ads,
            and connect with shops, schools, hotels, travel agents, clinics,
            agencies, and service providers near you.
          </p>

          <form className="search-panel" action="#featured">
            <label>
              <span>What are you looking for?</span>
              <input placeholder="Search restaurant, hotel, web developer..." />
            </label>
            <label>
              <span>Location</span>
              <input placeholder="Delhi, Bengaluru, Mumbai..." />
            </label>
            <button type="submit">Search</button>
          </form>

          <div className="quick-tags" aria-label="Popular searches">
            {["Travels", "Property", "Hotels", "Education", "Events", "Hospitals"].map(
              (item) => (
                <a href="#featured" key={item}>
                  {item}
                </a>
              ),
            )}
          </div>
        </div>

        <aside className="hero-card" aria-label="Directory highlights">
          <div className="insight-card active">
            <span>Live category</span>
            <strong>Website Developer</strong>
            <small>290 business ads</small>
          </div>
          <div className="insight-card">
            <span>Top city</span>
            <strong>New Delhi</strong>
            <small>Customer care available</small>
          </div>
          <div className="insight-card">
            <span>Business owner</span>
            <strong>Free listing</strong>
            <small>Post, promote, and manage ads</small>
          </div>
        </aside>
      </section>

      <section className="smart-search-strip" aria-label="Smart search examples">
        <div>
          <p className="eyebrow">Smart Discovery</p>
          <h2>Search like you think. Find like a pro.</h2>
        </div>
        <div className="search-marquee">
          {smartSearches.map((search) => (
            <span key={search}>{search}</span>
          ))}
        </div>
      </section>

      <section className="stats-band" aria-label="Checkinfo summary">
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <GoogleAdSlot label="Top leaderboard ad" slot="1111111111" />

      <section className="section" id="categories">
        <div className="section-heading">
          <p className="eyebrow">Browse by need</p>
          <h2>Top Categories by Ads</h2>
          <a href="#featured">View all categories</a>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <a className="category-tile" href="#featured" key={category}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{category}</strong>
              <small>Explore verified providers</small>
            </a>
          ))}
        </div>
      </section>

      <section className="section split-section" id="featured">
        <div className="feature-intro">
          <p className="eyebrow">Featured Ads</p>
          <h2>Make quick, confident decisions with rich business cards.</h2>
          <p>
            Featured ads stay visible at the top of category and search pages,
            helping buyers notice reliable businesses faster.
          </p>
          <a className="primary-button" href="#advertise">Promote a listing</a>
        </div>
        <div className="listing-grid">
          {listings.map((listing, index) => (
            <Fragment key={listing.name}>
              <article className="listing-card">
                <div className="listing-top">
                  <span>{listing.badge}</span>
                  <strong>{listing.score} / 5</strong>
                </div>
                <h3>{listing.name}</h3>
                <p>{listing.type}</p>
                <div className="listing-meta">{listing.location}</div>
                <a href="#contact">View Detail</a>
              </article>
              {index === 1 ? (
                <GoogleAdSlot
                  key="featured-feed-ad"
                  label="Featured listings in-feed ad"
                  slot="2222222222"
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="section trending-section">
        <div className="section-heading">
          <p className="eyebrow">Popular Trending Ads</p>
          <h2>Businesses getting attention right now</h2>
          <a href="#featured">View trending</a>
        </div>
        <div className="trend-row">
          {["Play schools", "Security services", "Daycare", "Water pumps"].map(
            (item) => (
              <div className="trend-pill" key={item}>
                <strong>{item}</strong>
                <span>High buyer interest</span>
              </div>
            ),
          )}
        </div>
      </section>

      <GoogleAdSlot label="Trending section banner ad" slot="3333333333" />

      <section className="advertise" id="advertise">
        <div>
          <p className="eyebrow">Advertise with us</p>
          <h2>List your business and stand out where customers search.</h2>
          <p>
            Add your profile, publish contact details, highlight services, and
            upgrade to featured placement for stronger visibility.
          </p>
        </div>
        <form className="lead-form">
          <input placeholder="Business name" aria-label="Business name" />
          <input placeholder="Phone number" aria-label="Phone number" />
          <input placeholder="Email address" aria-label="Email address" />
          <button type="submit">Request Callback</button>
        </form>
      </section>

      <section className="section testimonial-news">
        <blockquote>
          <p>
            "Write information about our business thank you"
          </p>
          <cite>Satish Sharma</cite>
        </blockquote>
        <div className="newsletter">
          <h2>Subscribe to business updates</h2>
          <p>Get new listings, offers, and promoted ads from Checkinfo.</p>
          <form>
            <input placeholder="Enter your email address" aria-label="Email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <GoogleAdSlot label="Bottom responsive ad" slot="4444444444" />

      <footer className="footer" id="contact">
        <div>
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark">CI</span>
            <span>
              <strong>Checkinfo</strong>
              <small>Find local businesses in India</small>
            </span>
          </a>
          <p>
            A modern local business directory experience for buyers and business
            owners.
          </p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <a href="#top">Home</a>
          <a href="#categories">Business</a>
          <a href="#advertise">Advertise</a>
          <a href="#contact">Support</a>
        </div>
        <div>
          <h3>Contact Detail</h3>
          <p>New Delhi</p>
          <a href="tel:9718290290">9718-290-290</a>
          <a href="mailto:info@checkinfo.in">info@checkinfo.in</a>
        </div>
      </footer>
    </main>
  );
}
