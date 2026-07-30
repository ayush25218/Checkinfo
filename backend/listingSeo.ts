import type { MemberListing } from "./member";

export type PublicBusinessListing = Partial<MemberListing> & {
  badge?: string;
  contact?: string;
  details?: string;
  ownerEmail?: string;
  ownerId?: string;
  ownerName?: string;
};

export function slugifyLocationPart(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function listingLocationText(listing: PublicBusinessListing) {
  return [listing.subcity, listing.city, listing.state].filter(Boolean).join(", ") || listing.location || listing.address || "";
}

export function listingSlugSegments(listing: PublicBusinessListing) {
  const state = slugifyLocationPart(listing.state || "india");
  const city = slugifyLocationPart(listing.city || listing.location || "city");
  const subcity = slugifyLocationPart(listing.subcity || "all");
  const business = slugifyLocationPart(listing.name || listing.id || "business");

  return [state, city, subcity, business];
}

export function listingPublicPath(listing: PublicBusinessListing) {
  return `/location/${listingSlugSegments(listing).join("/")}`;
}

export function matchesLocationSlug(listing: PublicBusinessListing, segments: string[]) {
  const ownSegments = listingSlugSegments(listing);
  return segments.every((segment, index) => segment === ownSegments[index]);
}
