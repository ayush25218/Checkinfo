export type BusinessTaxonomyNode = {
  name: string;
  slug: string;
};

export type BusinessSubcategory = BusinessTaxonomyNode & {
  businessTypes: BusinessTaxonomyNode[];
};

export type BusinessMainCategory = BusinessTaxonomyNode & {
  description: string;
  subcategories: BusinessSubcategory[];
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const rawCategoryList = [
  "AC Services",
  "Acting School",
  "Advertising",
  "Advocate",
  "Agricultural Services",
  "Air Hostess Training Institutes",
  "Ambulance Services",
  "Animation Institute",
  "Architects",
  "Art Gallery",
  "Astrologers",
  "Auditoriums",
  "Automobile",
  "Aviation Academies",
  "Ayurvedic",
  "Baby Foods Store",
  "Bakeries",
  "Bank",
  "Banquet Halls",
  "Bar and Pub",
  "Battery Dealers",
  "Beauty & Wellness",
  "Beauty Parlours",
  "Bicycle Stores",
  "Blood Banks",
  "Book Publishers",
  "Books Stores",
  "Boutique",
  "Building and Construction",
  "Bulk Sms Services",
  "Camera Shop",
  "Car Rental",
  "Car Repair",
  "Cargo & Logistics",
  "Carpenters",
  "Carpet & Rugs",
  "Catering Services",
  "Chartered Accountant",
  "Club & Cafe",
  "Computer Repair",
  "Computer Training Institutes",
  "Computer World",
  "Consultants",
  "Courier Service",
  "Crane Services",
  "Dance Academies",
  "Decor & Lightings",
  "Dentists Services",
  "Detective Agencies",
  "Driver Service",
  "Driving Schools",
  "Dry Cleaners Service",
  "Education",
  "Electronics",
  "Emergency Services",
  "Entertainment",
  "Event Organizers",
  "Fabrication & Welding Works",
  "Fashion Designers",
  "Film Studios",
  "Fish Aquarium",
  "Flower Decorations",
  "Food",
  "Fruits",
  "Furniture",
  "Groceries",
  "Guest Houses",
  "Gym and Spa",
  "Hair Treatments",
  "Health Clubs",
  "Hospitals",
  "Hotels",
  "Housekeeping Services",
  "Institute",
  "Insurance Agents",
  "Interior Designers",
  "Jewellery Showroom",
  "Laptop Repair Service",
  "Manufacturer",
  "Medical Services",
  "Mobile World",
  "Money Transfer Services",
  "Mutton Shops",
  "Optical Shop",
  "Others",
  "Packers & Movers",
  "Pest Control",
  "Pet Shop",
  "PG/Hostels",
  "Photographers",
  "Physiotherapist",
  "Placement Services",
  "Play Schools",
  "Printing Services",
  "Property Dealers",
  "Publishing Services",
  "Real Estate",
  "Rent Services",
  "Restaurants",
  "Retailers",
  "Saloon",
  "Schools",
  "Security Services",
  "Service Provider",
  "Shopping Malls",
  "Skin Care Clinics",
  "Software Development",
  "Spare Part Dealers",
  "Sports Clubs",
  "Sports Goods",
  "Stationary Stores",
  "Stock Brokers",
  "Summer Camps",
  "Sweet Shop",
  "Tailors & Designers",
  "Tattoo Makers",
  "Tent Houses",
  "Tour Operator",
  "Toy Shops",
  "Transports Services",
  "Travel Agents",
  "Watches Shop",
  "Website Developer",
  "Weight Loss & Gain Centres",
  "Wine Shops",
  "Xerox Shops",
  "Yoga Centres",
  "Zumba Fitness",
];

export const businessTaxonomy: BusinessMainCategory[] = rawCategoryList.map((name) => ({
  name,
  slug: slugify(name),
  description: `Find top rated ${name} verified listings, contact details, reviews, and address on Checkinfo.`,
  subcategories: [],
}));

export const businessMainCategories: string[] = businessTaxonomy.map((category) => category.name);

export const businessSubcategories = businessTaxonomy.flatMap((category) =>
  category.subcategories.map((subcategory) => ({
    categoryName: category.name,
    categorySlug: category.slug,
    name: subcategory.name,
    slug: subcategory.slug,
  }))
);

export type CustomSubcategoryRecord = {
  id: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  businessTypes: Array<{ name: string; slug: string }>;
  createdAt: string;
};

export function getCustomSubcategories(): CustomSubcategoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      window.localStorage.getItem("checkinfo-admin-subcategories") ||
      window.localStorage.getItem("backup-checkinfo-admin-subcategories");
    return raw ? (JSON.parse(raw) as CustomSubcategoryRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomSubcategories(list: CustomSubcategoryRecord[]) {
  if (typeof window !== "undefined") {
    try {
      const serialized = JSON.stringify(list);
      window.localStorage.setItem("checkinfo-admin-subcategories", serialized);
      window.localStorage.setItem("backup-checkinfo-admin-subcategories", serialized);
    } catch {}
  }
}

export function getEffectiveTaxonomy(customList: CustomSubcategoryRecord[] = getCustomSubcategories()): BusinessMainCategory[] {
  const customMap = new Map<string, CustomSubcategoryRecord[]>();
  for (const item of customList) {
    const list = customMap.get(item.categorySlug) || [];
    list.push(item);
    customMap.set(item.categorySlug, list);
  }

  return businessTaxonomy.map((cat) => {
    const customSubs = customMap.get(cat.slug) || [];
    const formattedSubs = customSubs.map((sub) => ({
      name: sub.name,
      slug: sub.slug,
      businessTypes: sub.businessTypes.length ? sub.businessTypes : [{ name: "General Provider", slug: "general-provider" }],
    }));

    return {
      ...cat,
      subcategories: [...cat.subcategories, ...formattedSubs],
    };
  });
}
