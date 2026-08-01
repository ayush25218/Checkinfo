"use client";

import { useEffect, useMemo, useState } from "react";
import { createCategoryExperience, slugifyCategory, type CategoryExperience } from "./categoryExperience";

type CategoryTransitionGridProps = {
  categories: CategoryExperience[];
};

function iconType(slug: string) {
  if (slug.includes("agriculture")) return "leaf";
  if (slug.includes("mining")) return "cube";
  if (slug.includes("food")) return "bowl";
  if (slug.includes("textile")) return "tag";
  if (slug.includes("industrial")) return "factory";
  if (slug.includes("chemicals") || slug.includes("healthcare")) return "plus";
  if (slug.includes("packaging")) return "box";
  if (slug.includes("wholesale") || slug.includes("logistics")) return "truck";
  if (slug.includes("retail")) return "cart";
  if (slug.includes("construction")) return "building";
  if (slug.includes("home-improvement")) return "tool";
  if (slug.includes("automotive")) return "car";
  if (slug.includes("hospitality")) return "bed";
  if (slug.includes("education")) return "book";
  if (slug.includes("financial")) return "briefcase";
  if (slug.includes("it-telecom")) return "screen";
  if (slug.includes("professional")) return "chart";
  if (slug.includes("media")) return "megaphone";
  if (slug.includes("energy")) return "bolt";
  if (slug.includes("public")) return "users";
  if (slug.includes("beauty")) return "spark";
  return "grid";
}

function CorporateCategoryIcon({ type }: { type: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg className="check-corporate-icon" viewBox="0 0 32 32" aria-hidden="true">
      {type === "leaf" && <path {...common} d="M25 7c-8 0-14 4-14 12 0 3 2 6 6 6 8 0 11-9 11-18h-3ZM17 25c1-6 4-10 9-14" />}
      {type === "cube" && <path {...common} d="m16 4 10 6v12l-10 6-10-6V10l10-6Zm0 12 10-6M16 16 6 10m10 6v12" />}
      {type === "bowl" && <path {...common} d="M7 15h18c0 6-4 10-9 10S7 21 7 15Zm3-5c2 1 4 1 6 0m2 0c2 1 4 1 6 0" />}
      {type === "tag" && <path {...common} d="M6 7h11l9 9-10 10-9-9V7Zm8 6h.1" />}
      {type === "factory" && <path {...common} d="M5 25V12l7 5v-5l7 5V8h6v17H5Zm4 0v-4m6 4v-4m6 4v-4" />}
      {type === "plus" && <path {...common} d="M16 5v22M5 16h22M8 8l16 16M24 8 8 24" />}
      {type === "box" && <path {...common} d="M6 10h20v16H6V10Zm4-5h12l4 5H6l4-5Zm6 5v16" />}
      {type === "truck" && <path {...common} d="M4 10h15v10H4V10Zm15 4h5l4 4v2h-9v-6ZM9 24a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />}
      {type === "cart" && <path {...common} d="M5 7h3l3 13h12l3-9H10m3 15a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm10 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />}
      {type === "building" && <path {...common} d="M6 27V8l12-3v22M18 12h8v15M10 11h3m-3 5h3m-3 5h3m12-5h-3m3 5h-3" />}
      {type === "tool" && <path {...common} d="M22 5a7 7 0 0 0-6 9L6 24l2 2 10-10a7 7 0 0 0 9-8l-5 5-3-3 5-5h-2Z" />}
      {type === "car" && <path {...common} d="M7 20h18l-2-7H9l-2 7Zm3 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 13l2-5h10l2 5" />}
      {type === "bed" && <path {...common} d="M6 25V8m20 17v-9a4 4 0 0 0-4-4H6v13m0-7h20M10 12v6" />}
      {type === "book" && <path {...common} d="M6 7h9a4 4 0 0 1 4 4v16a4 4 0 0 0-4-4H6V7Zm13 4a4 4 0 0 1 4-4h3v16h-3a4 4 0 0 0-4 4V11Z" />}
      {type === "briefcase" && <path {...common} d="M5 11h22v14H5V11Zm8 0V7h6v4m-3 4v4" />}
      {type === "screen" && <path {...common} d="M5 7h22v15H5V7Zm8 20h6m-3-5v5" />}
      {type === "chart" && <path {...common} d="M6 25V7m0 18h20M11 21v-7m6 7V10m6 11v-4" />}
      {type === "megaphone" && <path {...common} d="M5 17h5l14 6V9l-14 6H5v2Zm5 0 2 7h4l-3-7" />}
      {type === "bolt" && <path {...common} d="m17 3-9 15h7l-1 11 10-17h-7l0-9Z" />}
      {type === "users" && <path {...common} d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 12c1-5 4-8 7-8s6 3 7 8m3-11a3 3 0 1 0 0-6m-1 10c3 0 5 2 6 6" />}
      {type === "spark" && <path {...common} d="M16 4l2.5 7.5L26 14l-7.5 2.5L16 24l-2.5-7.5L6 14l7.5-2.5L16 4Zm9 15 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />}
      {type === "grid" && <path {...common} d="M7 7h7v7H7V7Zm11 0h7v7h-7V7ZM7 18h7v7H7v-7Zm11 0h7v7h-7v-7Z" />}
    </svg>
  );
}

export function CategoryTransitionGrid({ categories }: CategoryTransitionGridProps) {
  const [adminCategories, setAdminCategories] = useState<CategoryExperience[]>([]);
  const allowedCategorySlugs = useMemo(() => new Set(categories.map((category) => category.slug)), [categories]);
  const visibleCategories = useMemo(() => {
    const merged = new Map(categories.map((category) => [category.slug, category]));
    adminCategories.forEach((category) => {
      if (allowedCategorySlugs.has(category.slug)) merged.set(category.slug, category);
    });
    return [...merged.values()];
  }, [adminCategories, allowedCategorySlugs, categories]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("checkinfo-admin-categories");
      if (!raw) return;

      const records = JSON.parse(raw) as Array<{ image?: string; name?: string; order?: number; status?: string }>;
      const next = records
        .filter((record) => record.name && record.status !== "Inactive" && allowedCategorySlugs.has(slugifyCategory(record.name)))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((record, index) => createCategoryExperience(record.name ?? "", index, record.image));
      window.setTimeout(() => setAdminCategories(next), 0);
    } catch {
      window.setTimeout(() => setAdminCategories([]), 0);
    }
  }, [allowedCategorySlugs]);

  function rememberCategory(category: CategoryExperience) {
    window.sessionStorage.setItem("checkinfo:lastCategory", JSON.stringify(category));
  }

  return (
    <div className="check-category-stage">
      <div className="check-category-strip">
        {visibleCategories.map((category) => (
          <a
            className="check-category-card"
            href={`/category/${category.slug}`}
            key={category.slug}
            onClick={() => rememberCategory(category)}
          >
            <span className="check-category-main">
              <span className="check-category-icon-shell">
                <CorporateCategoryIcon type={iconType(category.slug)} />
              </span>
              <span>
                <strong>{category.name}</strong>
              </span>
            </span>
            <span className="check-category-action" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
