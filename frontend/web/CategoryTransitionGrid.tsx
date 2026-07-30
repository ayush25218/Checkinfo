"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { CategoryIconVisual } from "./CategoryIconVisual";
import { createCategoryExperience, slugifyCategory, type CategoryExperience } from "./categoryExperience";

type CategoryTransitionGridProps = {
  categories: CategoryExperience[];
};

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
            style={{ "--category-accent": category.accent } as CSSProperties}
          >
            <span className="check-category-topline" />
            <span className="check-category-main">
              <span className="check-category-icon-shell">
                <CategoryIconVisual className="check-category-icon" icon={category.icon} initials={category.initials} />
              </span>
              <span>
                <strong>{category.name}</strong>
                <small>{category.count} active ads</small>
              </span>
            </span>
            <span className="check-category-action">Explore</span>
          </a>
        ))}
      </div>
    </div>
  );
}
