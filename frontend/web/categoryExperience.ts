import { categories } from "@/backend/checkinfo";

export type CategoryExperience = {
  accent: string;
  count: number;
  description: string;
  icon?: string;
  index: number;
  initials: string;
  name: string;
  slug: string;
};

const counts = [248, 214, 192, 185, 176, 164, 151, 143, 137, 126, 118, 104, 92, 86, 74];
const accents = ["#1d65d8", "#00a8ff", "#1d776b", "#745cff", "#d59b2f", "#0ea75a"];

export function slugifyCategory(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function categoryInitials(name: string, index = 0) {
  return name.split(" ").map((word) => word[0]).join("").slice(0, 2) || String(index + 1);
}

export function titleFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Category";
}

export function createCategoryExperience(name: string, index = 0, icon?: string, count = counts[index] ?? 64): CategoryExperience {
  return {
    accent: accents[index % accents.length],
    count,
    description: `Explore trusted ${name.toLowerCase()} listings, compare contact details, and discover businesses with premium Checkinfo visibility.`,
    icon: icon && icon !== "Image" ? icon : undefined,
    index,
    initials: categoryInitials(name, index),
    name,
    slug: slugifyCategory(name),
  };
}

export function getAllCategoryExperiences(): CategoryExperience[] {
  return categories.map((name, index) => createCategoryExperience(name, index));
}

export function getCategoryExperience(slug: string) {
  return getAllCategoryExperiences().find((category) => category.slug === slug);
}

export function getCategoryExperienceOrFallback(slug: string) {
  return getCategoryExperience(slug) ?? createCategoryExperience(titleFromSlug(slug), 0);
}
