import { categories } from "@/backend/checkinfo";

export type CategoryExperience = {
  count: number;
  description: string;
  index: number;
  initials: string;
  name: string;
  slug: string;
};

const counts = [248, 214, 192, 185, 176, 164, 151, 143, 137, 126, 118, 104, 92, 86, 74];
const extraCategories = ["Fruits", "Bank", "Rent Services"];

export function slugifyCategory(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function categoryInitials(name: string, index = 0) {
  return name.split(" ").map((word) => word[0]).join("").slice(0, 2) || String(index + 1);
}

export function getAllCategoryExperiences(): CategoryExperience[] {
  return categories.concat(extraCategories).map((name, index) => ({
    count: counts[index] ?? 64,
    description: `Explore trusted ${name.toLowerCase()} listings, compare contact details, and discover businesses with premium Checkinfo visibility.`,
    index,
    initials: categoryInitials(name, index),
    name,
    slug: slugifyCategory(name),
  }));
}

export function getCategoryExperience(slug: string) {
  return getAllCategoryExperiences().find((category) => category.slug === slug);
}
