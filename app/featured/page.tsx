import type { Metadata } from "next";
import { filterCollectionListings, getApprovedListings, ListingCollectionPage } from "@/frontend/web/listingCollections";

export const metadata: Metadata = {
  title: "Featured Ads | Checkinfo",
  description: "Browse featured and promoted business listings on Checkinfo.",
};

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  const listings = filterCollectionListings(await getApprovedListings(), "featured");

  return (
    <ListingCollectionPage
      eyebrow="Featured Ads"
      listings={listings}
      subtitle="Premium approved listings selected for stronger visibility across Checkinfo."
      title="Featured business listings"
    />
  );
}
