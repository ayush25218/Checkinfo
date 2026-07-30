"use client";

import { LayoutGroup, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
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
  const [landed, setLanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useSpring(mouseX, { stiffness: 80, damping: 24 });
  const rotateX = useSpring(mouseY, { stiffness: 80, damping: 24 });

  useEffect(() => {
    const timer = window.setTimeout(() => setLanded(true), reduceMotion ? 80 : 700);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

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
    <main
      className={landed ? "category-world is-landed" : "category-world"}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        mouseX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
        mouseY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -8);
      }}
    >
      <header className="category-world-header">
        <Link className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </Link>
        <a className="check-post-button" href="/members/add_listing">Post Your Ad</a>
      </header>

      <LayoutGroup id="category-flight">
        <section className="category-hero">
          <motion.div
            className="category-hero-copy"
            initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: reduceMotion ? 0 : 2.5, duration: 0.65, ease: [0.16, 0.84, 0.22, 1] }}
          >
            <p className="eyebrow">Premium category hub</p>
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
          </motion.div>

          <motion.div
            className="category-orb-wrap"
            initial={reduceMotion ? false : { opacity: 0, x: "38vw", y: -90, scale: 0.46, rotateY: -100, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0, filter: "blur(0px)" }}
            transition={{ duration: reduceMotion ? 0.01 : 2.2, ease: [0.16, 0.84, 0.22, 1] }}
            style={{ rotateX, rotateY }}
          >
            <span className="category-arrival-ripple" />
            <motion.span className="category-orb" layoutId={`category-icon-${activeCategory.slug}`}>
              <span className="category-orb-light" />
              <span className="category-orb-ring category-orb-ring-one" />
              <span className="category-orb-ring category-orb-ring-two" />
              <CategoryIconVisual className="category-orb-text" icon={activeCategory.icon} initials={activeCategory.initials} />
            </motion.span>
            <span className="category-orb-shadow" />
          </motion.div>
        </section>
      </LayoutGroup>
    </main>
  );
}
