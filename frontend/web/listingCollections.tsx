import { getAdminResourceAsync } from "@/backend/directoryStore";
import type { PublicBusinessListing } from "@/backend/listingSeo";
import { BusinessCard } from "./BusinessCard";
import { slugifyCategory } from "./categoryExperience";
import { SiteHeader } from "./SiteHeader";

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
      <SiteHeader />

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
