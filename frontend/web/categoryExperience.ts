import { categories } from "@/backend/checkinfo";

export type CategoryExperience = {
  accent: string;
  backgroundImage: string;
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
const categoryImageQueries: Record<string, string> = {
  "agriculture-fisheries-and-animal-husbandry": "farm,agriculture,india",
  "mining-quarrying-and-raw-materials": "quarry,mining,stone",
  "food-processing-and-fmcg-manufacturing": "food,factory,packaging",
  "textile-apparel-leather-and-lifestyle-manufacturing": "textile,fabric,garment",
  "industrial-manufacturing-machinery-and-components": "industrial,machinery,factory",
  "chemicals-pharma-and-healthcare-manufacturing": "laboratory,pharma,science",
  "packaging-printing-and-media-production": "printing,packaging,studio",
  "wholesale-distribution-and-b2b-trade": "warehouse,distribution,trade",
  "retail-ecommerce-and-consumer-shopping": "retail,shopping,store",
  "construction-real-estate-and-infrastructure": "construction,real-estate,building",
  "home-improvement-repair-and-household-services": "home,repair,tools",
  "automotive-mobility-and-spare-parts": "automotive,garage,car",
  "logistics-transport-and-warehousing": "logistics,truck,warehouse",
  "hospitality-food-service-and-travel": "hotel,restaurant,travel",
  "healthcare-diagnostics-pharma-retail-and-wellness": "healthcare,hospital,diagnostics",
  "education-training-and-childcare": "education,classroom,students",
  "financial-insurance-legal-and-tax-services": "finance,office,documents",
  "it-telecom-and-digital-services": "technology,software,server",
  "professional-corporate-and-administrative-services": "business,meeting,office",
  "media-advertising-design-and-events": "event,media,design",
  "energy-utilities-environment-and-waste": "solar,energy,environment",
  "public-civic-ngos-associations-and-community": "community,ngo,public",
  "beauty-fitness-sports-and-personal-services": "fitness,salon,wellness",
  "informal-cottage-village-and-household-economy": "handicraft,village,market",
};

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
  const slug = slugifyCategory(name);
  const imageQuery = categoryImageQueries[slug] ?? name.toLowerCase();

  return {
    accent: accents[index % accents.length],
    backgroundImage: `https://source.unsplash.com/900x620/?${encodeURIComponent(imageQuery)}`,
    count,
    description: `Explore trusted ${name.toLowerCase()} listings, compare contact details, and discover businesses with premium Checkinfo visibility.`,
    icon: icon && icon !== "Image" ? icon : undefined,
    index,
    initials: categoryInitials(name, index),
    name,
    slug,
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
