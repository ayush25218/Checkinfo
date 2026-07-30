import { listingLocationText, listingPublicPath, type PublicBusinessListing } from "@/backend/listingSeo";

export function BusinessCard({ listing }: { listing: PublicBusinessListing }) {
  const location = listingLocationText(listing);

  return (
    <article className="check-ad-card">
      <div className="check-ad-image blue">
        <span>{(listing.name || "CI").slice(0, 2).toUpperCase()}</span>
        <b>{listing.badge || "Verified"}</b>
      </div>
      <small>{listing.businessType || listing.subcategory || listing.category || "Business"}{location ? ` / ${location}` : ""}</small>
      <h3>{listing.name}</h3>
      <p>{listing.details || listing.description || listing.address || "Approved Checkinfo business listing."}</p>
      <a href={listingPublicPath(listing)}>View Details</a>
    </article>
  );
}
