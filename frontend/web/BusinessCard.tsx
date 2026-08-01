import { listingLocationText, listingPublicPath, type PublicBusinessListing } from "@/backend/listingSeo";

export function BusinessCard({ listing }: { listing: PublicBusinessListing }) {
  const location = listingLocationText(listing);
  const category = listing.businessType || listing.subcategory || listing.category || "Business";
  const contact = listing.contact || listing.mobile || listing.email;

  return (
    <article className="check-ad-card">
      <div className="check-ad-card-head">
        <div className={listing.image ? "check-ad-image has-photo" : "check-ad-image blue"}>
          {listing.image ? <img src={listing.image} alt="" loading="lazy" /> : <span>{(listing.name || "CI").slice(0, 2).toUpperCase()}</span>}
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
