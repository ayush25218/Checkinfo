"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { businessTaxonomy } from "@/backend/businessTaxonomy";
import type { PublicBusinessListing } from "@/backend/listingSeo";
import { BusinessCard } from "./BusinessCard";
import { CategoryIconVisual } from "./CategoryIconVisual";
import type { CategoryExperience } from "./categoryExperience";
import { HeaderUserProfileDropdown } from "./HeaderUserProfileDropdown";
import { LocationSearchForm } from "./LocationSearchForm";

type CategoryLandingPageProps = {
  category: CategoryExperience;
  initialSubcategorySlug?: string;
  initialTypeSlug?: string;
  listings?: PublicBusinessListing[];
};

export function CategoryLandingPage({ category, initialSubcategorySlug = "", initialTypeSlug = "", listings = [] }: CategoryLandingPageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(category);
  const [activeSubcategorySlug, setActiveSubcategorySlug] = useState(initialSubcategorySlug);
  const [activeTypeSlug, setActiveTypeSlug] = useState(initialTypeSlug);
  const taxonomyCategory = useMemo(
    () => businessTaxonomy.find((item) => item.slug === activeCategory.slug),
    [activeCategory.slug],
  );
  const activeSubcategory = taxonomyCategory?.subcategories.find((item) => item.slug === activeSubcategorySlug);
  const activeBusinessType = activeSubcategory?.businessTypes.find((item) => item.slug === activeTypeSlug);
  const finalQuery = activeBusinessType?.name ?? activeSubcategory?.name ?? activeCategory.name;
  const currentCategoryPath = `/category/${activeCategory.slug}`;
  const activeSubcategoryPath = activeSubcategory ? `${currentCategoryPath}/${activeSubcategory.slug}` : currentCategoryPath;
  const finalPagePath = activeBusinessType ? `${activeSubcategoryPath}/${activeBusinessType.slug}` : activeSubcategoryPath;

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

  useEffect(() => {
    setActiveSubcategorySlug(initialSubcategorySlug);
    setActiveTypeSlug(initialTypeSlug);
  }, [activeCategory.slug, initialSubcategorySlug, initialTypeSlug]);

  function selectSubcategory(slug: string) {
    setActiveSubcategorySlug((current) => (current === slug ? "" : slug));
    setActiveTypeSlug("");
    router.push(`${currentCategoryPath}/${slug}`);
  }

  return (
    <main className="category-world is-landed" style={{ "--category-accent": activeCategory.accent } as CSSProperties}>
      <header className="category-world-header">
        <Link className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </Link>
        <nav aria-label="Category navigation">
          <a href="/">Home</a>
          <a href="/featured">Featured</a>
          <a href="/new">New Ads</a>
          <a href="/trending">Trending</a>
        </nav>
        <div className="check-header-actions">
          <a className="check-post-button" href="/members/login">List Your Business</a>
          <HeaderUserProfileDropdown />
        </div>
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
            <a href={finalPagePath}>Open Page</a>
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

      {taxonomyCategory ? (
        <section className="category-drilldown">
          <div className="category-drilldown-head">
            <div>
              <p className="eyebrow">Explore step by step</p>
              <h2>{activeBusinessType ? "Final business type" : activeSubcategory ? "Choose a business type" : "Choose a subcategory"}</h2>
              <p>
                Click karte jao: category se subcategory, phir business type, aur final search output par pahuch jao.
              </p>
            </div>
            <div className="category-drilldown-stats">
              <span><strong>{taxonomyCategory.subcategories.length}</strong> Subcategories</span>
              <span><strong>{taxonomyCategory.subcategories.reduce((total, item) => total + item.businessTypes.length, 0)}</strong> Business types</span>
            </div>
          </div>

          <div className="category-breadcrumbs" aria-label="Category path">
            <button type="button" onClick={() => { setActiveSubcategorySlug(""); setActiveTypeSlug(""); }}>{taxonomyCategory.name}</button>
            {activeSubcategory ? <a href={`${currentCategoryPath}/${activeSubcategory.slug}`}>{activeSubcategory.name}</a> : null}
            {activeBusinessType ? <span>{activeBusinessType.name}</span> : null}
          </div>

          <div className="category-drilldown-grid">
            <div className="category-drilldown-column">
              <span className="category-drilldown-label">Subcategories</span>
              {taxonomyCategory.subcategories.map((subcategory) => (
                <button
                  className={subcategory.slug === activeSubcategorySlug ? "active" : ""}
                  key={subcategory.slug}
                  onClick={() => selectSubcategory(subcategory.slug)}
                  type="button"
                >
                  <span>{subcategory.name}</span>
                  <b>{subcategory.businessTypes.length}</b>
                </button>
              ))}
            </div>

            <div className="category-drilldown-column category-drilldown-types">
              <span className="category-drilldown-label">Business Types</span>
              {activeSubcategory ? activeSubcategory.businessTypes.map((businessType) => (
                <button
                  className={businessType.slug === activeTypeSlug ? "active" : ""}
                  key={businessType.slug}
                  onClick={() => {
                    setActiveTypeSlug((current) => current === businessType.slug ? "" : businessType.slug);
                    router.push(`${currentCategoryPath}/${activeSubcategorySlug}/${businessType.slug}`);
                  }}
                  type="button"
                >
                  <span>{businessType.name}</span>
                </button>
              )) : (
                <div className="category-drilldown-empty">
                  <strong>Select a subcategory</strong>
                  <span>Right side me business types open honge.</span>
                </div>
              )}
            </div>

            <div className="category-output-card">
              <span>Final Output</span>
              <strong>{finalQuery}</strong>
              <p>{activeBusinessType ? `${activeBusinessType.name} listings in this category are ready for search and SEO pages.` : "Subcategory/business type select karne ke baad final output yahan dikhega."}</p>
              <a href={finalPagePath}>Open Page</a>
              <a href="/members/add_listing">Register Business</a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="category-listings-section">
        <div className="check-section-title centered">
          <h2>{finalQuery} listings</h2>
          <p>Approved businesses for this category path. Homepage limited hai, full category results yahan milenge.</p>
        </div>
        <div className="listing-collection-grid category-listing-grid">
          {listings.length ? listings.map((listing) => <BusinessCard listing={listing} key={`${listing.ownerId}-${listing.id}`} />) : (
            <article className="check-empty-listing">
              <strong>No listings found</strong>
              <span>Is category path me approved listings admin approval ke baad show hongi.</span>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
