"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryIconVisual } from "./CategoryIconVisual";
import type { CategoryExperience } from "./categoryExperience";
import { LocationSearchForm } from "./LocationSearchForm";

type CategoryLandingPageProps = {
  category: CategoryExperience;
};

export function CategoryLandingPage({ category }: CategoryLandingPageProps) {
  const [activeCategory, setActiveCategory] = useState(category);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("checkinfo:lastCategory");
      if (!raw) return;
      const stored = JSON.parse(raw) as CategoryExperience;
      if (stored.slug === category.slug) {
        window.setTimeout(() => setActiveCategory(stored), 0);
      }
    } catch {
      window.setTimeout(() => setActiveCategory(category), 0);
    }
  }, [category]);

  return (
    <main className="category-world is-landed">
      <header className="category-world-header">
        <Link className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </Link>
        <a className="check-post-button" href="/members/add_listing">Post Your Ad</a>
      </header>

      <section className="category-hero">
        <div className="category-hero-copy">
          <p className="eyebrow">Category hub</p>
          <h1>{activeCategory.name}</h1>
          <p>{activeCategory.description}</p>
          <div className="category-stats">
            <span><strong>{activeCategory.count}</strong> Active ads</span>
            <span><strong>4.8</strong> Avg. rating</span>
            <span><strong>24h</strong> Fresh leads</span>
          </div>
          <LocationSearchForm className="check-hero-search category-search" defaultQuery={activeCategory.name} />
          <div className="category-actions">
            <a href={`/search?q=${encodeURIComponent(activeCategory.name)}`}>Search Listings</a>
            <a href="/members/add_listing">Post In Category</a>
          </div>
        </div>

        <div className="category-orb-wrap">
          <span className="category-orb">
            <CategoryIconVisual className="category-orb-text" icon={activeCategory.icon} initials={activeCategory.initials} />
          </span>
          <span className="category-orb-shadow" />
        </div>
      </section>
    </main>
  );
}
