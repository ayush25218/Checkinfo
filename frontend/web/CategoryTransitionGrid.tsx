"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useState } from "react";
import type { CategoryExperience } from "./categoryExperience";

type CategoryTransitionGridProps = {
  categories: CategoryExperience[];
};

function flyToCategory(router: ReturnType<typeof useRouter>, href: string) {
  const viewTransition = document.startViewTransition?.(() => router.push(href));
  if (!viewTransition) {
    router.push(href);
  }
}

export function CategoryTransitionGrid({ categories }: CategoryTransitionGridProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const activeCategory = categories.find((category) => category.slug === activeSlug);

  function openCategory(category: CategoryExperience) {
    const href = `/category/${category.slug}`;
    if (reduceMotion) {
      router.push(href);
      return;
    }

    setActiveSlug(category.slug);
    sessionStorage.setItem("checkinfo:lastCategory", JSON.stringify(category));
    window.setTimeout(() => flyToCategory(router, href), 1800);
  }

  return (
    <LayoutGroup id="category-flight">
      <div className={activeSlug ? "check-category-stage is-launching" : "check-category-stage"}>
        <AnimatePresence>
          {activeSlug ? <motion.span className="check-category-cinema-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /> : null}
        </AnimatePresence>
        <div className="check-category-strip">
          {categories.map((category) => {
            const isActive = category.slug === activeSlug;
            return (
              <motion.button
                className={isActive ? "check-category-card is-active" : "check-category-card"}
                data-muted={activeSlug && !isActive ? "true" : undefined}
                key={category.slug}
                onClick={() => openCategory(category)}
                type="button"
                whileTap={{ scale: 0.985 }}
              >
                <span className="check-category-topline" />
                <span className="check-category-main">
                  <motion.span className="check-category-icon-shell" layoutId={`category-icon-${category.slug}`}>
                    <span className="check-category-icon" aria-hidden="true">{category.initials}</span>
                    <span className="check-category-icon-glow" />
                    <span className="check-category-ring check-category-ring-one" />
                    <span className="check-category-ring check-category-ring-two" />
                  </motion.span>
                  <span>
                    <strong>{category.name}</strong>
                    <small>{category.count} active ads</small>
                  </span>
                </span>
                <span className="check-category-action">Explore</span>
                {isActive ? <span className="check-category-pulse" aria-hidden="true" /> : null}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {activeCategory ? (
            <motion.div
              className="check-category-flight"
              initial={{ opacity: 0, x: "-8vw", y: 0, scale: 0.44, rotateX: 8, rotateY: -24, filter: "blur(0px)" }}
              animate={{
                opacity: [0, 1, 1, 1],
                x: ["-8vw", "10vw", "42vw", "78vw"],
                y: [0, -92, -155, -34],
                scale: [0.44, 0.98, 1.45, 0.86],
                rotateX: [8, 12, -4, 0],
                rotateY: [-24, 140, 300, 360],
                filter: ["blur(0px)", "blur(0px)", "blur(8px)", "blur(0px)"],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 0.84, 0.22, 1], times: [0, 0.34, 0.72, 1] }}
            >
              <span className="check-category-flight-glow" />
              <span className="check-category-flight-icon">{activeCategory.initials}</span>
              <span className="check-category-flight-trail" />
              {Array.from({ length: 10 }).map((_, index) => (
                <span className="check-category-particle" style={{ "--p": index, "--py": (index % 5) - 2 } as CSSProperties} key={index} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
