import { getAdminResourceAsync } from "@/backend/directoryStore";
import type { PublicBusinessListing } from "@/backend/listingSeo";
import { slugifyCategory } from "./categoryExperience";

export type ListingCollectionKind = "featured" | "new" | "trending" | "category";

export async function getApprovedListings() {
  try {
    const business = (((await getAdminResourceAsync("business")) ?? []) as PublicBusinessListing[]);
    return business.filter((listing) => listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular");
  } catch {
    return [];
  }
}

export function filterCollectionListings(
  listings: PublicBusinessListing[],
  kind: ListingCollectionKind,
) {
  if (kind === "featured") return listings.filter((listing) => listing.status === "Featured");
  if (kind === "trending") return listings.filter((listing) => listing.status === "Popular");
  if (kind === "new") return listings.filter((listing) => listing.status === "Active");
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

export { ListingCollectionPage } from "./ListingCollectionClientPage";
