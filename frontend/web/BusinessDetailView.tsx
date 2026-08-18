import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { PublicListingInteractiveForm } from "./PublicListingInteractiveForm";
import { getCategoryCoverImage } from "./dummyImages";
import { listingLocationText, type PublicBusinessListing } from "@/backend/listingSeo";

export function BusinessDetailView({ listing, isExact = true }: { listing: PublicBusinessListing; isExact?: boolean }) {
  const location = listingLocationText(listing);
  const category = listing.businessType || listing.subcategory || listing.category || "Business";
  const rawContact = listing.contact || listing.mobile || "";
  const cleanPhone = String(rawContact).replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hi ${listing.name}, I found your profile on Checkinfo and would like to enquire about your services.`)}`;

  const isPlaceholder = !listing.image || listing.image.includes("370X290") || listing.image.includes("fioxen") || listing.image.includes("dummy");
  const coverImage = isPlaceholder ? getCategoryCoverImage(`${listing.name} ${category}`) : listing.image;
  const ratingValue = Number(listing.rating || 0);
  const reviewCount = Number(listing.reviewCount || 0);
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    address: listing.address || location,
    aggregateRating: ratingValue > 0 ? {
      "@type": "AggregateRating",
      ratingCount: reviewCount || 1,
      ratingValue,
    } : undefined,
    areaServed: listing.city || listing.state || "India",
    image: coverImage,
    name: listing.name,
    telephone: cleanPhone.length >= 10 ? `+91${cleanPhone.slice(-10)}` : undefined,
    url: listing.website || listing.publicPath,
  };

  return (
    <main className="check-home check-business-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <SiteHeader activeNav="Business" />

      {/* Hero Header Section */}
      <section className="business-detail-hero">
        <span className="check-hero-aurora" aria-hidden="true" />
        <span className="check-hero-grid" aria-hidden="true" />
        <div className="business-detail-hero-inner">
          <div className="business-hero-breadcrumbs">
            <a href="/">Home</a>
            <span className="sep">/</span>
            <a href="/search">Businesses</a>
            <span className="sep">/</span>
            <span>{location || "India"}</span>
          </div>

          <div className="business-hero-content-row">
            <div className="business-hero-text">
              <div className="business-hero-badges">
                {listing.status === "Featured" ? <span className="detail-badge badge-featured">★ Featured</span> : null}
                <span className={`detail-badge ${listing.status === "Featured" ? "badge-featured" : "badge-status"}`}>
                  {listing.status === "Active" ? "✔ Active" : listing.status}
                </span>
                {listing.addressProofName ? <span className="detail-badge badge-verified">✔ Address Verified</span> : null}
                {listing.website ? <span className="detail-badge badge-website">🌐 Has Website</span> : null}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "0.25rem 0 0.5rem" }}>
                {listing.logo ? (
                  <img src={listing.logo} alt={`${listing.name} Logo`} style={{ width: 52, height: 52, objectFit: "contain", borderRadius: "10px", background: "#ffffff", padding: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0 }} />
                ) : null}
                <h1 style={{ margin: 0 }}>{listing.name}</h1>
              </div>

              <div className="business-category-tags">
                <span className="category-tag">{category}</span>
                {listing.subcategory && listing.subcategory !== category ? (
                  <span className="category-tag alt">{listing.subcategory}</span>
                ) : null}
              </div>

              <p className="business-location-subtitle">
                📍 {listing.address || location || "Verified Local Business in India"}
              </p>
              <p className="business-location-subtitle">
                {ratingValue > 0 ? `${ratingValue} / 5 from ${reviewCount || 1} review${(reviewCount || 1) === 1 ? "" : "s"}` : "New listing, reviews welcome"}
              </p>
            </div>

            <div className="business-hero-cover">
              <img src={coverImage} alt={`${listing.name} Cover`} loading="lazy" />
            </div>
          </div>

          {/* Quick Action Contact Bar */}
          <div className="business-quick-action-bar">
            {cleanPhone.length >= 10 ? (
              <>
                <a href={`tel:${cleanPhone.slice(-10)}`} className="action-btn action-call" title="Call Business">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Call: +91 {cleanPhone.slice(-10)}</span>
                </a>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="action-btn action-whatsapp" title="Chat on WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.573-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.106 1.517 5.836L0 24l6.327-1.472A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.578-.496-5.072-1.363l-.364-.21-3.766.877.9-3.666-.231-.378A9.941 9.941 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  <span>WhatsApp Chat</span>
                </a>
              </>
            ) : null}

            {listing.website ? (
              <a href={listing.website} target="_blank" rel="noopener noreferrer" className="action-btn action-website" title="Visit Official Website">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Website</span>
              </a>
            ) : null}

            <a href="#enquiry-form" className="action-btn action-enquire" title="Send Enquiry">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Send Enquiry</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Layout (2 Columns) */}
      <div className="business-detail-container">
        <div className="business-detail-main">
          {/* Company Profile & Description */}
          <section className="detail-section-card">
            <h2>About {listing.name}</h2>
            <p className="detail-description">
              {listing.details || listing.description || `${listing.name} is a verified business listed under ${category} in ${location}. Contact directly for price quotes, service estimates, and orders.`}
            </p>

            <div className="detail-info-grid">
              <div className="info-item">
                <span className="info-label">Category</span>
                <strong className="info-value">{category}</strong>
              </div>
              <div className="info-item">
                <span className="info-label">Phone / Mobile</span>
                <strong className="info-value">+91 {cleanPhone.slice(-10)}</strong>
              </div>
              {listing.ownerEmail ? (
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <strong className="info-value">{listing.ownerEmail}</strong>
                </div>
              ) : null}
              <div className="info-item">
                <span className="info-label">Location / City</span>
                <strong className="info-value">{location || "India"}</strong>
              </div>
              <div className="info-item">
                <span className="info-label">Verification Status</span>
                {listing.addressProofName ? (
                  <strong className="info-value text-green">✔ Address Proof Submitted</strong>
                ) : (
                  <strong className="info-value text-slate-500">ⓘ Listing Pending Verification</strong>
                )}
              </div>
            </div>
          </section>

          {/* Trust Guarantees Banner */}
          <section className="detail-trust-card">
            <h3>Why Contact Through Checkinfo?</h3>
            <div className="trust-features-list">
              <div className="trust-feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>Zero Spam Call Guarantee</strong>
                  <p>Your enquiry goes ONLY to {listing.name}. We never sell your number to telecallers.</p>
                </div>
              </div>
              <div className="trust-feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Direct Vendor Connect</strong>
                  <p>Connect directly via Phone call or WhatsApp without middleman commission charges.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Enquiry & Review Forms */}
          <div id="enquiry-form">
            <PublicListingInteractiveForm listing={listing} />
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
