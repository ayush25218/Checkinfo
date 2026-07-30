import { notFound } from "next/navigation";
import { getAllCategoryExperiences, getCategoryExperience } from "@/frontend/web/categoryExperience";
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
  const category = getCategoryExperience(slug);

  if (!category) {
    notFound();
  }

  return <CategoryLandingPage category={category} />;
}
