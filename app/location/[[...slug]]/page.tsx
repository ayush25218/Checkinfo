import type { Metadata } from "next";
import { getAdminResourceAsync } from "@/backend/directoryStore";
import {
  listingLocationText,
  listingPublicPath,
  matchesLocationSlug,
  type PublicBusinessListing,
} from "@/backend/listingSeo";

import { PublicListingInteractiveForm } from "@/frontend/web/PublicListingInteractiveForm";

type LocationPageProps = {
  params: Promise<{ slug?: string[] }>;
};

async function getApprovedListings() {
  const business = ((await getAdminResourceAsync("business")) ?? []) as PublicBusinessListing[];
  return business.filter((listing) => listing.status === "Active" || listing.status === "Featured");
}

function titleCaseSlug(value = "") {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const segments = (await params).slug ?? [];
  const listings = await getApprovedListings();
  const exact = listings.find((listing) => matchesLocationSlug(listing, segments));
  const locationName = segments.slice(0, 3).map(titleCaseSlug).filter(Boolean).join(", ");

  if (exact) {
    return {
      description: `${exact.name} contact number, email, address, services, and details in ${listingLocationText(exact)} on Checkinfo.`,
      title: `${exact.name} in ${listingLocationText(exact)} | Checkinfo`,
    };
  }

  return {
    description: `Find approved businesses in ${locationName || "India"} with phone, email, location, and service details on Checkinfo.`,
    title: `Businesses in ${locationName || "India"} | Checkinfo`,
  };
}

export default async function LocationListingPage({ params }: LocationPageProps) {
  const segments = (await params).slug ?? [];
  const listings = await getApprovedListings();
  const exact = segments.length >= 4 ? listings.find((listing) => matchesLocationSlug(listing, segments)) : null;
  const filtered = exact ? [exact] : listings.filter((listing) => matchesLocationSlug(listing, segments));
  const headingLocation = segments.slice(0, 3).map(titleCaseSlug).filter(Boolean).join(", ") || "India";

  return (
    <main className="location-page">
      <header className="search-header">
        <a className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </a>
        <a className="check-post-button" href="/members/add_listing">Post Your Ad</a>
      </header>

      <section className="location-hero">
        <p className="eyebrow">Checkinfo approved business</p>
        <h1>{exact ? exact.name : `Businesses in ${headingLocation}`}</h1>
        <p>
          {exact
            ? `${exact.category || "Business"} listing with verified contact and location details.`
            : "Approved businesses from member submissions appear here after admin review."}
        </p>
      </section>

      <section className="location-listing-grid">
        {filtered.length ? filtered.map((listing) => (
          <article className="location-business-card" key={listing.id}>
            <div>
              <span className="search-badge">{listing.status === "Featured" ? "Featured" : "Verified"}</span>
              <h2>{listing.name}</h2>
              <p>{[listing.category, listing.subcategory, listing.businessType].filter(Boolean).join(" / ") || "Business"}</p>
              <address>{listing.address || listingLocationText(listing)}</address>
              {listing.details || listing.description ? <p>{listing.details || listing.description}</p> : null}
            </div>
            <div className="search-card-meta">
              {listing.mobile || listing.contact ? <a href={`tel:${listing.mobile || listing.contact}`}>{listing.mobile || listing.contact}</a> : null}
              {listing.ownerEmail ? <a href={`mailto:${listing.ownerEmail}`}>{listing.ownerEmail}</a> : null}
              {listing.website ? <a href={listing.website} target="_blank" rel="noreferrer">Website</a> : null}
              {!exact ? <a href={listingPublicPath(listing)}>Open Page</a> : null}
              <span>{listingLocationText(listing)}</span>
            </div>
          </article>
        )) : (
          <div className="search-empty">
            <h2>No approved business found</h2>
            <p>This location page is ready. Listings will appear here after admin approval.</p>
          </div>
        )}
      </section>

      {exact ? <PublicListingInteractiveForm listing={exact} /> : null}
    </main>
  );
}
