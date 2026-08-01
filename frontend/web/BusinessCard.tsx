import { listingLocationText, listingPublicPath, type PublicBusinessListing } from "@/backend/listingSeo";
import { DUMMY_BUSINESS_IMAGE } from "./dummyImages";

export function BusinessCard({ listing }: { listing: PublicBusinessListing }) {
  const location = listingLocationText(listing);
  const category = listing.businessType || listing.subcategory || listing.category || "Business";
  const contact = listing.contact || listing.mobile || listing.email;

  return (
    <article className="check-ad-card">
      <div className="check-ad-card-head">
        <div className="check-ad-image has-photo">
          <img src={DUMMY_BUSINESS_IMAGE} alt="" loading="lazy" />
        </div>
        <b className="check-ad-badge">{listing.badge || "Verified"}</b>
      </div>
      <h3>{listing.name}</h3>
      <small>{category}</small>
      <p>{listing.details || listing.description || listing.address || "Approved Checkinfo business listing."}</p>
      <div className="check-ad-meta">
        {location ? <span>{location}</span> : <span>India</span>}
        {contact ? <span>{contact}</span> : null}
      </div>
      <a href={listingPublicPath(listing)}>View Details</a>
    </article>
  );
}
