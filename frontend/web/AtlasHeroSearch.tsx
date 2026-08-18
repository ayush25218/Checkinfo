"use client";

import { useEffect, useState, type FormEvent } from "react";

type SearchOption = {
  label: string;
  value: string;
};

type SearchOptionsPayload = {
  categories: SearchOption[];
  cities: SearchOption[];
};

const topPillCategories = [
  { label: "Hotels", query: "Hotels" },
  { label: "Real-Estate", query: "Real Estate" },
  { label: "Beauty", query: "Beauty & Wellness" },
  { label: "Hospitals", query: "Hospitals" },
  { label: "Restaurants", query: "Restaurants" },
  { label: "IT Services", query: "Website Developer" },
];

export function AtlasHeroSearch() {
  const [activeCategory, setActiveCategory] = useState("Hotels");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<SearchOptionsPayload>({ categories: [], cities: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/web/search-options")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SearchOptionsPayload | null) => {
        if (!cancelled && payload) {
          setOptions(payload);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function handlePillClick(pillQuery: string) {
    setActiveCategory(pillQuery);
    setCategory(pillQuery);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const params = new URLSearchParams();
    const qValue = keyword.trim() || category || activeCategory;
    if (qValue) params.set("q", qValue);
    if (category) params.set("category", category);
    if (city) params.set("location", city);

    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <div className="atlas-hero-search-wrapper">
      {/* Floating Category Pills above Search Card */}
      <div className="atlas-category-pills" role="tablist" aria-label="Category quick filter">
        {topPillCategories.map((item) => {
          const isActive = activeCategory === item.query || category === item.query;
          return (
            <button
              key={item.label}
              type="button"
              className={`atlas-pill-item ${isActive ? "is-active" : ""}`}
              onClick={() => handlePillClick(item.query)}
              role="tab"
              aria-selected={isActive}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Atlas Floating Search Card */}
      <form className="atlas-search-card" onSubmit={handleSubmit} action="/search" method="get">
        {/* Field 1: Category */}
        <div className="atlas-field-group">
          <label className="atlas-field-label" htmlFor="atlas-select-category">Category</label>
          <div className="atlas-select-wrap">
            <select
              id="atlas-select-category"
              name="category"
              className="atlas-field-input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value) setActiveCategory(e.target.value);
              }}
            >
              <option value="">Select Category</option>
              {options.categories.length ? (
                options.categories.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="Hotels">Hotels</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Hospitals">Hospitals</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Website Developer">Website Developer</option>
                </>
              )}
            </select>
            <span className="atlas-chevron">˅</span>
          </div>
        </div>

        <div className="atlas-field-divider" />

        {/* Field 2: Type / Keyword */}
        <div className="atlas-field-group">
          <label className="atlas-field-label" htmlFor="atlas-input-type">Type / Keyword</label>
          <input
            id="atlas-input-type"
            name="q"
            className="atlas-field-input"
            placeholder="Select Type or Keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="atlas-field-divider" />

        {/* Field 3: City */}
        <div className="atlas-field-group">
          <label className="atlas-field-label" htmlFor="atlas-select-city">City / Location</label>
          <div className="atlas-select-wrap">
            <select
              id="atlas-select-city"
              name="location"
              className="atlas-field-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Select City</option>
              {options.cities.length ? (
                options.cities.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </>
              )}
            </select>
            <span className="atlas-chevron">˅</span>
          </div>
        </div>

        {/* Action Button */}
        <button type="submit" className="atlas-search-submit-btn" disabled={isSubmitting}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>{isSubmitting ? "Searching..." : "Search"}</span>
        </button>
      </form>
    </div>
  );
}
