import { getAdminResourceAsync } from "@/backend/directoryStore";
import type { PublicBusinessListing } from "@/backend/listingSeo";
import { slugifyCategory } from "./categoryExperience";

export type ListingCollectionKind = "featured" | "new" | "trending" | "category";

export async function getApprovedListings() {
  try {
    const business = (((await getAdminResourceAsync("business")) ?? []) as PublicBusinessListing[]);
    return business.filter((listing) => {
      const activeStatus = listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular";
      return activeStatus && listing.approvalStatus !== "Pending" && listing.approvalStatus !== "Rejected";
    });
  } catch {
    return [];
  }
}

function listingPlacements(listing: PublicBusinessListing) {
  if (listing.placementStartsAt && Date.parse(listing.placementStartsAt) > Date.now()) return [];
  if (listing.placementExpiresAt && Date.parse(listing.placementExpiresAt) < Date.now()) return ["new"];
  if (Array.isArray(listing.placements) && listing.placements.length) return listing.placements;
  if (listing.status === "Featured") return ["new", "featured"];
  if (listing.status === "Popular") return ["new", "trending"];
  if (listing.status === "Active") return ["new"];
  return [];
}

export function filterCollectionListings(
  listings: PublicBusinessListing[],
  kind: ListingCollectionKind,
) {
  if (kind === "featured") return listings.filter((listing) => listingPlacements(listing).includes("featured"));
  if (kind === "trending") return listings.filter((listing) => listingPlacements(listing).includes("trending"));
  if (kind === "new") return listings.filter((listing) => listingPlacements(listing).includes("new"));
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
