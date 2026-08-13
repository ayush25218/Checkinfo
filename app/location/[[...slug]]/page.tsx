import type { Metadata } from "next";
import { getAdminResourceAsync } from "@/backend/directoryStore";
import {
  listingLocationText,
  matchesLocationSlug,
  type PublicBusinessListing,
} from "@/backend/listingSeo";

import { SiteHeader } from "@/frontend/web/SiteHeader";
import { SiteFooter } from "@/frontend/web/SiteFooter";
import { BusinessCard } from "@/frontend/web/BusinessCard";
import { BusinessDetailView } from "@/frontend/web/BusinessDetailView";

type LocationPageProps = {
  params: Promise<{ slug?: string[] }>;
};

async function getApprovedListings() {
  const business = ((await getAdminResourceAsync("business")) ?? []) as PublicBusinessListing[];
  return business.filter((listing) => listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular");
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

  if (exact) {
    return <BusinessDetailView listing={exact} />;
  }

  const filtered = listings.filter((listing) => matchesLocationSlug(listing, segments));
  const headingLocation = segments.slice(0, 3).map(titleCaseSlug).filter(Boolean).join(", ") || "India";

  return (
    <main className="check-home location-page">
      <SiteHeader activeNav="Business" />

      <section className="check-about-hero">
        <span className="check-hero-aurora" aria-hidden="true" />
        <span className="check-hero-grid" aria-hidden="true" />
        <div className="check-about-hero-content">
          <p className="eyebrow">Location Directory</p>
          <h1>Verified Businesses in {headingLocation}</h1>
          <p>
            Browse top-rated local vendors, manufacturers, and service providers in {headingLocation} with verified contact numbers and direct enquiries.
          </p>
        </div>
      </section>

      <section className="check-section" style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 16px" }}>
        {filtered.length ? (
          <div className="check-new-grid">
            {filtered.map((listing) => (
              <BusinessCard listing={listing} key={listing.id} />
            ))}
          </div>
        ) : (
          <div className="check-empty-listing" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2>No approved businesses found in {headingLocation} yet</h2>
            <p>Listings in this location will appear here once approved by admin.</p>
            <a href="/members/login" className="check-post-button" style={{ display: "inline-block", marginTop: 16 }}>
              List Your Business in {headingLocation}
            </a>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
