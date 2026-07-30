import type { Metadata } from "next";
import { businessTaxonomy } from "@/backend/businessTaxonomy";
import { CategoryLandingPage } from "@/frontend/web/CategoryLandingPage";
import { getCategoryExperienceOrFallback } from "@/frontend/web/categoryExperience";
import { filterTaxonomyListings, getApprovedListings } from "@/frontend/web/listingCollections";

type FilteredCategoryPageProps = {
  params: Promise<{
    filters?: string[];
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businessTaxonomy.flatMap((category) => [
    ...category.subcategories.map((subcategory) => ({
      filters: [subcategory.slug],
      slug: category.slug,
    })),
    ...category.subcategories.flatMap((subcategory) =>
      subcategory.businessTypes.map((businessType) => ({
        filters: [subcategory.slug, businessType.slug],
        slug: category.slug,
      })),
    ),
  ]);
}

export async function generateMetadata({ params }: FilteredCategoryPageProps): Promise<Metadata> {
  const { filters = [], slug } = await params;
  const category = getCategoryExperienceOrFallback(slug);
  const taxonomyCategory = businessTaxonomy.find((item) => item.slug === slug);
  const subcategory = taxonomyCategory?.subcategories.find((item) => item.slug === filters[0]);
  const businessType = subcategory?.businessTypes.find((item) => item.slug === filters[1]);
  const title = [businessType?.name, subcategory?.name, category.name].filter(Boolean).join(" | ");

  return {
    title: `${title} | Checkinfo`,
    description: `Browse approved ${businessType?.name ?? subcategory?.name ?? category.name} business listings on Checkinfo.`,
  };
}

export default async function FilteredCategoryPage({ params }: FilteredCategoryPageProps) {
  const { filters = [], slug } = await params;
  const [subcategorySlug, typeSlug] = filters;
  const category = getCategoryExperienceOrFallback(slug);
  const listings = filterTaxonomyListings(await getApprovedListings(), slug, subcategorySlug, typeSlug);

  return (
    <CategoryLandingPage
      category={category}
      initialSubcategorySlug={subcategorySlug}
      initialTypeSlug={typeSlug}
      listings={listings}
    />
  );
}
