import { categories } from "./checkinfo";
import { getAdminResourceAsync } from "./directoryStore";
import { listingLocationText, listingPublicPath } from "./listingSeo";
import type { MemberListing } from "./member";

type PlaceLocation = {
  latitude: number;
  longitude: number;
};

type GooglePlace = {
  businessStatus?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  id?: string;
  location?: PlaceLocation;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
};

export type DirectorySearchParams = {
  category?: string;
  lat?: number;
  lng?: number;
  location?: string;
  q?: string;
  radius?: number;
};

export type DirectorySearchResult = {
  address: string;
  badge?: string;
  businessStatus?: string;
  category: string;
  id: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  name: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  source: "sponsored" | "google" | "local";
  sponsored: boolean;
  url?: string;
  website?: string;
};

const GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.businessStatus",
].join(",");

function normalizeText(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function queryTokens(query = "") {
  return normalizeText(query)
    .replace(/\bnear me\b/g, "")
    .split(" ")
    .filter((token) => token.length > 2 && !["near", "best", "top", "the"].includes(token));
}

type SearchableListing = Partial<MemberListing> & {
  badge?: string;
  contact?: string;
  details?: string;
  ownerEmail?: string;
  ownerId?: string;
  ownerName?: string;
};

function listingPlacements(listing: SearchableListing): Array<"new" | "featured" | "trending"> {
  if (listing.placementStartsAt && Date.parse(listing.placementStartsAt) > Date.now()) return [];
  if (listing.placementExpiresAt && Date.parse(listing.placementExpiresAt) < Date.now()) return ["new"];
  if (Array.isArray(listing.placements) && listing.placements.length) return listing.placements;
  if (listing.status === "Featured") return ["new", "featured"];
  if (listing.status === "Popular") return ["new", "trending"];
  if (listing.status === "Active") return ["new"];
  return [];
}

function listingMatches(listing: SearchableListing, query = "", location = "", category = "") {
  const haystack = normalizeText([listing.name, listing.description, listing.keywords, listing.details, listing.location, listing.address, listing.category, listing.subcategory, listing.businessType, listing.city, listing.subcity, listing.state].join(" "));
  const tokens = queryTokens(query);
  const locationTokens = queryTokens(location);
  const categoryTokens = queryTokens(category);

  const hasQueryMatch = tokens.length === 0 || tokens.some((token) => haystack.includes(token));
  const hasLocationMatch = locationTokens.length === 0 || locationTokens.some((token) => haystack.includes(token));
  const hasCategoryMatch = categoryTokens.length === 0 || categoryTokens.some((token) => haystack.includes(token));

  return hasQueryMatch && hasLocationMatch && hasCategoryMatch;
}

function listingToResult(listing: SearchableListing, source: "sponsored" | "local"): DirectorySearchResult {
  return {
    address: listing.address || listingLocationText(listing) || "Address not available",
    badge: listing.status === "Featured" ? "Featured" : listing.status === "Popular" ? "Popular" : "Verified",
    category: listing.category ?? "Business",
    id: `${source}-${normalizeText(listing.name || listing.id || "business").replaceAll(" ", "-")}`,
    name: listing.name || "Business listing",
    phone: listing.mobile || listing.contact,
    source,
    sponsored: source === "sponsored",
    url: listingPublicPath(listing),
    website: listing.website,
  };
}

function isApprovedListing(listing: SearchableListing) {
  const activeStatus = listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular";
  return activeStatus && listing.approvalStatus !== "Pending" && listing.approvalStatus !== "Rejected";
}

async function getSponsoredListings(query = "", location = "", category = "") {
  const business = ((await getAdminResourceAsync("business")) ?? []) as SearchableListing[];
  return business
    .filter(isApprovedListing)
    .filter((listing) => listingPlacements(listing).includes("featured"))
    .filter((listing) => listingMatches(listing, query, location, category))
    .map((listing) => listingToResult(listing, "sponsored"));
}

async function getFallbackLocalListings(query = "", location = "", category = "") {
  const business = ((await getAdminResourceAsync("business")) ?? []) as SearchableListing[];
  return business
    .filter(isApprovedListing)
    .filter((listing) => listingPlacements(listing).some((placement) => placement === "new" || placement === "trending"))
    .filter((listing) => listingMatches(listing, query, location, category))
    .map((listing) => listingToResult(listing, "local"));
}

function toFiniteNumber(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function cleanRadius(radius?: number) {
  const fallback = 8000;
  const value = toFiniteNumber(radius) ?? fallback;
  return Math.min(Math.max(value, 1000), 50000);
}

function buildTextQuery(params: DirectorySearchParams) {
  const q = params.q?.trim() || params.category?.trim() || "business";
  const location = params.location?.trim();

  if (location) return `${q} in ${location}`;
  return q;
}

async function fetchGooglePlaces(params: DirectorySearchParams) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  const lat = toFiniteNumber(params.lat);
  const lng = toFiniteNumber(params.lng);

  if (!apiKey) {
    return {
      places: [] as DirectorySearchResult[],
      warning: "Google Places API key is not configured.",
    };
  }

  const body: Record<string, unknown> = {
    maxResultCount: 20,
    textQuery: buildTextQuery(params),
  };

  if (lat !== undefined && lng !== undefined) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: cleanRadius(params.radius),
      },
    };
  }

  const response = await fetch(GOOGLE_PLACES_URL, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    method: "POST",
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    const message = errorPayload?.error?.message ? ` ${errorPayload.error.message}` : "";
    return {
      places: [] as DirectorySearchResult[],
      warning: `Google Places request failed with status ${response.status}.${message}`,
    };
  }

  const payload = (await response.json()) as { places?: GooglePlace[] };
  const places = (payload.places ?? []).map((place) => ({
    address: place.formattedAddress ?? "Address not available",
    businessStatus: place.businessStatus,
    category: categories.find((category) => normalizeText(params.q).includes(normalizeText(category))) ?? "Google Places",
    id: `google-${place.id ?? normalizeText(place.displayName?.text ?? place.formattedAddress ?? "place")}`,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    mapUrl: place.googleMapsUri,
    name: place.displayName?.text ?? "Business listing",
    phone: place.nationalPhoneNumber,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    source: "google" as const,
    sponsored: false,
    website: place.websiteUri,
  }));

  return { places };
}

function dedupeResults(priorityResults: DirectorySearchResult[], results: DirectorySearchResult[]) {
  const seen = new Set(priorityResults.map((result) => normalizeText(`${result.name} ${result.address}`)));

  return results.filter((result) => {
    const key = normalizeText(`${result.name} ${result.address}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchDirectory(params: DirectorySearchParams) {
  const q = params.q?.trim() ?? "";
  const location = params.location?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const sponsored = await getSponsoredListings(q, location, category);
  const googleResponse = await fetchGooglePlaces(params);
  const localFallback = googleResponse.places.length ? [] : await getFallbackLocalListings(q, location, category);
  const organic = dedupeResults(sponsored, [...googleResponse.places, ...localFallback]);
  const results = [...sponsored, ...organic];

  return {
    attribution: googleResponse.places.length ? "Google Places" : "Checkinfo local data",
    categories,
    count: results.length,
    googleCount: googleResponse.places.length,
    localFallbackCount: localFallback.length,
    ok: true,
    query: { category, lat: params.lat, lng: params.lng, location, q, radius: cleanRadius(params.radius) },
    results,
    sponsored,
    warning: googleResponse.warning,
  };
}
