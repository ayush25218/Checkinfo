import { getAllCategoryExperiences, getCategoryExperienceOrFallback } from "@/frontend/web/categoryExperience";
import { CategoryLandingPage } from "@/frontend/web/CategoryLandingPage";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllCategoryExperiences().map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryExperienceOrFallback(slug);

  return <CategoryLandingPage category={category} />;
}
