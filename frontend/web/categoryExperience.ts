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
const accents = ["#1d65d8", "#2f75e8", "#4a8cff", "#1d4ed8", "#315eea", "#5b7cff"];
const categoryBackgroundImages: Record<string, string> = {
  "agriculture-fisheries-and-animal-husbandry": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=70",
  "mining-quarrying-and-raw-materials": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=70",
  "food-processing-and-fmcg-manufacturing": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70",
  "textile-apparel-leather-and-lifestyle-manufacturing": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=70",
  "industrial-manufacturing-machinery-and-components": "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=70",
  "chemicals-pharma-and-healthcare-manufacturing": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=900&q=70",
  "packaging-printing-and-media-production": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=70",
  "wholesale-distribution-and-b2b-trade": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=70",
  "retail-ecommerce-and-consumer-shopping": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=70",
  "construction-real-estate-and-infrastructure": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=70",
  "home-improvement-repair-and-household-services": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=70",
  "automotive-mobility-and-spare-parts": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=70",
  "logistics-transport-and-warehousing": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=70",
  "hospitality-food-service-and-travel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=70",
  "healthcare-diagnostics-pharma-retail-and-wellness": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=70",
  "education-training-and-childcare": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70",
  "financial-insurance-legal-and-tax-services": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=70",
  "it-telecom-and-digital-services": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=70",
  "professional-corporate-and-administrative-services": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=70",
  "media-advertising-design-and-events": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=70",
  "energy-utilities-environment-and-waste": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=70",
  "public-civic-ngos-associations-and-community": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=70",
  "beauty-fitness-sports-and-personal-services": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=70",
  "informal-cottage-village-and-household-economy": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=70",
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

  return {
    accent: accents[index % accents.length],
    backgroundImage: categoryBackgroundImages[slug] ?? categoryBackgroundImages["professional-corporate-and-administrative-services"],
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
