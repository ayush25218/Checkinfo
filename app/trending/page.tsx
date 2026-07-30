import type { Metadata } from "next";
import { filterCollectionListings, getApprovedListings, ListingCollectionPage } from "@/frontend/web/listingCollections";

export const metadata: Metadata = {
  title: "Trending Ads | Checkinfo",
  description: "Browse trending business listings on Checkinfo.",
};

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  const listings = filterCollectionListings(await getApprovedListings(), "trending");

  return (
    <ListingCollectionPage
      eyebrow="Trending Ads"
      listings={listings}
      subtitle="High-interest business profiles surfaced for faster discovery and comparison."
      title="Popular trending ads"
    />
  );
}
