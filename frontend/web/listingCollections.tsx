import { getAdminResourceAsync } from "@/backend/directoryStore";
import type { PublicBusinessListing } from "@/backend/listingSeo";
import { BusinessCard } from "./BusinessCard";
import { slugifyCategory } from "./categoryExperience";

export type ListingCollectionKind = "featured" | "new" | "trending" | "category";

export async function getApprovedListings() {
  try {
    const business = (((await getAdminResourceAsync("business")) ?? []) as PublicBusinessListing[]);
    return business.filter((listing) => listing.status === "Active" || listing.status === "Featured");
  } catch {
    return [];
  }
}

export function filterCollectionListings(
  listings: PublicBusinessListing[],
  kind: ListingCollectionKind,
) {
  if (kind === "featured") return listings.filter((listing) => listing.status === "Featured");
  if (kind === "trending") return [...listings].sort((a, b) => Number(b.status === "Featured") - Number(a.status === "Featured"));
  return listings;
}

export function filterTaxonomyListings(
  listings: PublicBusinessListing[],
  categorySlug: string,
  subcategorySlug?: string,
  typeSlug?: string,
) {
  return listings.filter((listing) => {
    if (slugifyCategory(listing.category || "") !== categorySlug) return false;
    if (subcategorySlug && slugifyCategory(listing.subcategory || "") !== subcategorySlug) return false;
    if (typeSlug && slugifyCategory(listing.businessType || "") !== typeSlug) return false;
    return true;
  });
}

export function ListingCollectionPage({
  eyebrow,
  listings,
  subtitle,
  title,
}: {
  eyebrow: string;
  listings: PublicBusinessListing[];
  subtitle: string;
  title: string;
}) {
  return (
    <main className="listing-collection-page">
      <header className="listing-collection-header">
        <a className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </a>
        <nav aria-label="Listing page navigation">
          <a href="/">Home</a>
          <a href="/#categories">Categories</a>
          <a href="/featured">Featured</a>
          <a href="/new">New Ads</a>
          <a href="/trending">Trending</a>
        </nav>
        <div className="check-header-actions">
          <a className="check-post-button" href="/members/login">List Your Business</a>
          <a className="check-profile-circle" href="/login" title="Login / My Profile">
            <span className="check-profile-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span>My Profile</span>
          </a>
        </div>
      </header>

      <section className="listing-collection-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <span>{listings.length} listings</span>
      </section>

      <section className="listing-collection-grid">
        {listings.length ? listings.map((listing) => <BusinessCard listing={listing} key={`${listing.ownerId}-${listing.id}`} />) : (
          <article className="check-empty-listing">
            <strong>No listings found</strong>
            <span>Approved businesses will appear here after admin review.</span>
          </article>
        )}
      </section>
    </main>
  );
}
