import { categories } from "@/backend/checkinfo";

const featuredAds = [
  {
    category: "Travel agent, tour operator",
    location: "Residency Road, Bengaluru",
    name: "Travelyaari",
    score: "0 / 5",
    tone: "red",
  },
  {
    category: "coaching, institute, coaching institute",
    location: "Near Samrat Restaurant and PNB, GTB Nagar",
    name: "Dreamz Institute",
    score: "0 / 5",
    tone: "violet",
  },
  {
    category: "SMS service provider",
    location: "Technopolis Knowledge Park, Andheri East, Mumbai",
    name: "Orbit Communication",
    score: "0 / 5",
    tone: "blue",
  },
];

const newAds = [
  ["Zoo Culture Gym & Spa", "Gym in Panchkula", "SCO: 411-412, Sector 8, Panchkula, Haryana 134112"],
  ["Hotel Sterling Inn Bangalore", "Hotel Sterling Inn Bangalore", "48,49 2nd Cross Chandramouleshwara Layout, Bengaluru"],
  ["ARN Packers and Movers Surat", "packers and movers in Surat", "Raj Corner Shopping Centre, Pal Rd, Adajan, Surat"],
  ["Digital Marketing Agency in", "Digital marketing agency", "Kolkata"],
];

const trendingAds = [
  ["Sureshchandra Rasiklal Shroff", "No. 309, Vrundavan Shopping Centre, Ratan Pole Ahmedabad"],
  ["Visishta The Unique Play School k", "15th Main, V-Block, H.B.R. Layout, Banaswadi Bangalore"],
  ["We Care i", "No. 1568, 3rd Floor, Outer Ring Road, H.S.R. Layout Bangalore"],
  ["Little Champs Play School", "B Block, Gurudware Gali No.13, Bhajanpura Delhi"],
  ["Viha Playschool & Daycare", "Cherrydale layout, Whitefield Bangalore"],
  ["Smart Kidz oi", "House No. 843/8/U/30, Uppal Hyderabad"],
];

const footerLinks = {
  info: ["How to buy", "FAQs", "Career", "Privacy Policy", "Legal Disclaimer", "Terms And Conditions", "Refer to Friend"],
  quick: ["Home", "About Us", "Business", "Advertise with Us", "Testimonials", "Support", "Contact Us", "Sitemap"],
};

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

function CategoryIcon({ label, index }: { label: string; index: number }) {
  return (
    <span className="check-category-icon" aria-hidden="true">
      {label.split(" ").map((word) => word[0]).join("").slice(0, 2) || String(index + 1)}
    </span>
  );
}

function AdCard({
  address,
  category,
  name,
  tone = "plain",
}: {
  address: string;
  category: string;
  name: string;
  tone?: string;
}) {
  return (
    <article className="check-ad-card">
      <div className={`check-ad-image ${tone}`}>
        <span>{name.slice(0, 2).toUpperCase()}</span>
        <b>0 / 5</b>
      </div>
      <small>{category}</small>
      <h3>{name}</h3>
      <p>{address}</p>
      <a href="#contact">View Detail</a>
    </article>
  );
}

function TrendingCard({ address, name }: { address: string; name: string }) {
  return (
    <article className="check-trending-card">
      <div className="check-no-image">
        <span>No Image</span>
        <b>0 / 5</b>
      </div>
      <div>
        <h3>{name}</h3>
        <p>{address}</p>
        <a href="#contact">View Detail</a>
      </div>
    </article>
  );
}

export function HomePage() {
  return (
    <main className="check-home">
      <header className="check-header">
        <a className="check-logo" href="#top" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </a>
        <form className="check-top-search" action="/api/web/search" method="get">
          <input name="q" placeholder="Search" />
          <button type="submit">Search</button>
        </form>
        <nav aria-label="Primary navigation">
          <a href="/members/myaccount">My Profile</a>
          <a href="#categories">Business</a>
          <a href="#featured">Featured Ads</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="check-post-button" href="/members/add_listing">Post Your Ad</a>
      </header>

      <section className="check-hero" id="top">
        <div>
          <p className="eyebrow">India local search engine</p>
          <h1>Search any business details here.</h1>
          <p>
            Find verified businesses, featured ads, trending ads, new ads,
            categories, customer care, and free listing tools in one modern
            Checkinfo experience.
          </p>
          <form className="check-hero-search" action="/api/web/search" method="get">
            <input name="q" placeholder="What are you looking for?" />
            <input name="location" placeholder="City or location" />
            <button type="submit">Search</button>
          </form>
        </div>
        <div className="check-hero-panel">
          <strong>Checkinfo</strong>
          <span>Business Owner: Login | Register</span>
          <a href="/members/add_listing">Start Free Listing</a>
        </div>
      </section>

      <GoogleAdSlot label="Top homepage advertisement" slot="1111111111" />

      <section className="check-section" id="categories">
        <div className="check-section-title">
          <h2>Top Categories by Ads</h2>
          <p>All major Checkinfo categories, polished for quick browsing.</p>
        </div>
        <div className="check-category-strip">
          {categories.concat(["Fruits", "Bank", "Rent Services"]).map((category, index) => (
            <a className="check-category-card" href="#featured" key={category}>
              <CategoryIcon label={category} index={index} />
              <strong>{category}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="check-featured" id="featured">
        <div className="check-featured-copy">
          <h2>Find Your Needs In Our Best <span>Featured Ads</span></h2>
          <p>
            Displayed your ads in top of the search results page and category
            listing. Featured ads help businesses stand out and attract more
            attention.
          </p>
          <a href="/members/add_listing">View More</a>
        </div>
        <div className="check-card-row">
          {featuredAds.map((ad) => (
            <AdCard
              address={ad.location}
              category={ad.category}
              key={ad.name}
              name={ad.name}
              tone={ad.tone}
            />
          ))}
        </div>
      </section>

      <section className="check-section check-new-ads">
        <div className="check-section-title centered">
          <h2>Our New Ads</h2>
          <p>New Ads refers to recently added listings displayed prominently on the website.</p>
        </div>
        <div className="check-new-grid">
          {newAds.map(([name, category, address]) => (
            <AdCard address={address} category={category} key={name} name={name} />
          ))}
        </div>
        <a className="check-more-button" href="/members/add_listing">View More</a>
      </section>

      <GoogleAdSlot label="Middle homepage advertisement" slot="2222222222" />

      <section className="check-section check-trending">
        <div className="check-section-title centered">
          <h2>Popular Trending Ads</h2>
          <p>
            Trending ads are advertisements that are currently popular or
            generating attention among website users.
          </p>
        </div>
        <div className="check-trending-grid">
          {trendingAds.map(([name, address]) => (
            <TrendingCard address={address} key={name} name={name} />
          ))}
        </div>
      </section>

      <section className="advertise" id="advertise">
        <div>
          <p className="eyebrow">Advertise with us</p>
          <h2>List your business and stand out where customers search.</h2>
          <p>
            Add your profile, publish contact details, highlight services, and
            upgrade to featured placement for stronger visibility.
          </p>
        </div>
        <form className="lead-form" action="/api/web/lead" method="post">
          <input name="business_name" placeholder="Business name" aria-label="Business name" />
          <input name="phone" placeholder="Phone number" aria-label="Phone number" />
          <input name="email" placeholder="Email address" aria-label="Email address" />
          <button type="submit">Request Callback</button>
        </form>
      </section>

      <footer className="check-footer" id="contact">
        <div>
          <h3>Quick Links</h3>
          {footerLinks.quick.map((link) => <a href="#top" key={link}>{link}</a>)}
          <p><strong>Business Owner :</strong> Login | Register</p>
        </div>
        <div>
          <h3>Info Links</h3>
          {footerLinks.info.map((link) => <a href="#top" key={link}>{link}</a>)}
        </div>
        <div>
          <h3>Our Categories</h3>
          {categories.concat(["Fruits", "Bank", "Rent Services"]).map((category) => (
            <a href="#categories" key={category}>{category}</a>
          ))}
          <a href="#categories">View All</a>
        </div>
        <div>
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
