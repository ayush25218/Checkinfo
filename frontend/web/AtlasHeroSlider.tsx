"use client";

import { useEffect, useState } from "react";
import { AtlasHeroSearch } from "./AtlasHeroSearch";

type SlideData = {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  bgImage: string;
};

const slides: SlideData[] = [
  {
    id: 1,
    title: "Discover Your Dream Business Today",
    subtitle: "On the top local directory & verified business network in India — connect directly with top rated corporate vendors & service providers.",
    badge: "Trusted Business Network",
    bgImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 2,
    title: "Verified Commercial Real Estate & Services",
    subtitle: "Find premium office spaces, architects, contractors, and corporate legal advisors across top metro cities.",
    badge: "100% Verified Profiles",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 3,
    title: "Top Luxury Stays & Banquet Halls",
    subtitle: "Explore 5-star hotels, luxury resorts, event venues, and fine dining restaurants with instant price quotes.",
    badge: "Direct Vendor Connect",
    bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: 4,
    title: "Leading IT Services & Digital Solutions",
    subtitle: "Connect with expert web developers, software agencies, digital marketing teams, and tech consultants.",
    badge: "Corporate IT Directory",
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
  },
];

export function AtlasHeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  function handlePrev() {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }

  const activeSlide = slides[currentIndex];

  return (
    <section
      className="atlas-hero-slider-section"
      id="top"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images Stack with Fade Transition */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`atlas-slide-bg ${idx === currentIndex ? "is-active" : ""}`}
          style={{ backgroundImage: `linear-gradient(180deg, rgba(11, 10, 22, 0.88) 0%, rgba(15, 12, 28, 0.94) 100%), url('${slide.bgImage}')` }}
          aria-hidden={idx !== currentIndex}
        />
      ))}

      <div className="atlas-hero-bg-overlay" aria-hidden="true" />

      {/* Slider Left / Right Navigation Buttons */}
      <button
        type="button"
        className="atlas-slider-arrow atlas-slider-prev"
        onClick={handlePrev}
        aria-label="Previous Slide"
      >
        ‹
      </button>

      <button
        type="button"
        className="atlas-slider-arrow atlas-slider-next"
        onClick={handleNext}
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Slide Content */}
      <div className="atlas-hero-content">
        <span className="atlas-hero-eyebrow">{activeSlide.badge}</span>
        <h1 className="atlas-hero-title">{activeSlide.title}</h1>
        <p className="atlas-hero-subtitle">{activeSlide.subtitle}</p>

        {/* Interactive Pagination Indicators (- - • - -) */}
        <div className="atlas-hero-dots" role="tablist" aria-label="Hero slider pagination">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`atlas-dot ${idx === currentIndex ? "is-active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Atlas Floating Search Box */}
        <AtlasHeroSearch />
      </div>
    </section>
  );
}
