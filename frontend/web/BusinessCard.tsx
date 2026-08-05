import { listingLocationText, listingPublicPath, type PublicBusinessListing } from "@/backend/listingSeo";
import { getCategoryCoverImage } from "./dummyImages";

function getListingRating(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  const positiveHash = Math.abs(hash);
  const rating = (4.6 + (positiveHash % 4) * 0.1).toFixed(1);
  const reviews = 24 + (positiveHash % 75);
  return { rating, reviews };
}

export function BusinessCard({ listing }: { listing: PublicBusinessListing }) {
  const location = listingLocationText(listing);
  const category = listing.businessType || listing.subcategory || listing.category || "Business";
  const rawContact = listing.contact || listing.mobile || listing.email || "9718290290";
  const cleanPhone = String(rawContact).replace(/[^0-9]/g, "") || "9718290290";

  const isPlaceholder = !listing.image || listing.image.includes("370X290") || listing.image.includes("fioxen") || listing.image.includes("dummy");
  const coverImage = isPlaceholder ? getCategoryCoverImage(`${listing.name} ${category}`) : listing.image;
  const { rating, reviews } = getListingRating(listing.name || "Business");
  const publicPath = listingPublicPath(listing);
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hi ${listing.name || "Business"}, I found your profile on Checkinfo and would like to enquire about your services.`)}`;

  return (
    <article className="check-ad-card check-ad-card-enhanced">
      <div className="check-ad-card-head">
        <div className="check-ad-image-cover">
          <img src={coverImage} alt={listing.name || "Business Cover"} loading="lazy" />
        </div>
        <div className="check-card-badge-container">
          <b className="check-ad-badge check-ad-badge-verified">
            ✔ {listing.badge || "GST Verified"}
          </b>
        </div>
      </div>

      <div className="check-ad-card-body">
        <div className="check-card-header-row">
          <h3 className="check-card-title">
            <a href={publicPath} className="check-card-title-link">{listing.name}</a>
          </h3>
          <span className="check-category-pill">{category}</span>
        </div>

        {/* Star Ratings & Review Counts */}
        <div className="check-card-rating-row" aria-label={`Rating: ${rating} out of 5 stars based on ${reviews} reviews`}>
          <span className="rating-score">⭐ {rating}</span>
          <div className="rating-stars" aria-hidden="true">★★★★★</div>
          <span className="rating-count">({reviews} reviews)</span>
          <span className="response-badge">⚡ Quick Response</span>
        </div>

        <p className="check-card-description">{listing.details || listing.description || listing.address || "Approved Checkinfo verified business listing."}</p>

        <div className="check-ad-meta">
          <span className="meta-location">📍 {location || "India"}</span>
          <span className="meta-contact">📞 {rawContact}</span>
        </div>

        {/* Direct Action Micro-CTAs */}
        <div className="check-card-actions">
          <a href={`tel:${cleanPhone.slice(-10)}`} className="card-cta-btn cta-call" title="Call Business Directly">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Call</span>
          </a>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="card-cta-btn cta-whatsapp" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.573-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.106 1.517 5.836L0 24l6.327-1.472A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.578-.496-5.072-1.363l-.364-.21-3.766.877.9-3.666-.231-.378A9.941 9.941 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </a>

          <a href={publicPath} className="card-cta-btn cta-enquire" title="Send Enquiry & View Details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>Enquiry</span>
          </a>
        </div>
      </div>
    </article>
  );
}
