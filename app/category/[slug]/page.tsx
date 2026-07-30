import { getAllCategoryExperiences, getCategoryExperienceOrFallback } from "@/frontend/web/categoryExperience";
import { CategoryLandingPage } from "@/frontend/web/CategoryLandingPage";
import { filterTaxonomyListings, getApprovedListings } from "@/frontend/web/listingCollections";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllCategoryExperiences().map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryExperienceOrFallback(slug);
  const listings = filterTaxonomyListings(await getApprovedListings(), slug);

  return <CategoryLandingPage category={category} listings={listings} />;
}
