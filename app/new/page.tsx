import type { Metadata } from "next";
import { filterCollectionListings, getApprovedListings, ListingCollectionPage } from "@/frontend/web/listingCollections";

export const metadata: Metadata = {
  title: "New Ads | Checkinfo",
  description: "Browse newly approved business listings on Checkinfo.",
};

export const dynamic = "force-dynamic";

export default async function NewAdsPage() {
  const listings = filterCollectionListings(await getApprovedListings(), "new");

  return (
    <ListingCollectionPage
      eyebrow="New Ads"
      listings={listings}
      subtitle="Fresh approved business profiles ready for search, comparison, and customer enquiries."
      title="New business listings"
    />
  );
}
