"use client";

import { useEffect, useState, useRef } from "react";

type CityItem = {
  city: string;
  text: string;
  href: string;
  image: string;
  badge?: string;
};

const topCities: CityItem[] = [
  { city: "Delhi NCR", text: "Verified corporate businesses, services, and local enquiries.", href: "/search?location=Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80", badge: "Capital Region" },
  { city: "Mumbai", text: "Manufacturing, food, finance, and trade listings.", href: "/search?location=Mumbai", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80", badge: "Financial Hub" },
  { city: "Bengaluru", text: "IT, startups, home services, and corporate vendors.", href: "/search?location=Bengaluru", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80", badge: "Tech Capital" },
  { city: "Hyderabad", text: "Healthcare, training, fitness, and business services.", href: "/search?location=Hyderabad", image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=80", badge: "Cyber Hub" },
  { city: "Chennai", text: "Automobile, port logistics, healthcare, and education.", href: "/search?location=Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80", badge: "Detroit of Asia" },
  { city: "Kolkata", text: "Cultural hub, trade, textiles, and manufacturing.", href: "/search?location=Kolkata", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80", badge: "City of Joy" },
  { city: "Ahmedabad", text: "Textiles, chemicals, pharmaceuticals, and startups.", href: "/search?location=Ahmedabad", image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80", badge: "Heritage City" },
  { city: "Pune", text: "IT parks, education hubs, automotive, and manufacturing.", href: "/search?location=Pune", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80", badge: "Oxford of the East" },
  { city: "Jaipur", text: "Tourism, handicrafts, gems, jewelry, and real estate.", href: "/search?location=Jaipur", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80", badge: "Pink City" },
  { city: "Surat", text: "Diamond processing, silk textiles, and export vendors.", href: "/search?location=Surat", image: "https://images.unsplash.com/photo-1618083840243-7f28328bf3f8?auto=format&fit=crop&w=600&q=80", badge: "Diamond Hub" },
  { city: "Lucknow", text: "Chikan embroidery, handicraft, medical, and trade.", href: "/search?location=Lucknow", image: "https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&w=600&q=80", badge: "City of Nawabs" },
  { city: "Chandigarh", text: "Planned urban city, trade, retail, and corporate hubs.", href: "/search?location=Chandigarh", image: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=600&q=80", badge: "Beautiful City" },
  { city: "Kochi", text: "Maritime trade, tourism, IT, and seafood export.", href: "/search?location=Kochi", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80", badge: "Queen of Arabian Sea" },
  { city: "Indore", text: "Cleanest city, commercial hub, food, and education.", href: "/search?location=Indore", image: "https://images.unsplash.com/photo-1619441207978-3d326c46e2c9?auto=format&fit=crop&w=600&q=80", badge: "Cleanest City" },
  { city: "Varanasi", text: "Handloom silk, tourism, spiritual, and cultural trade.", href: "/search?location=Varanasi", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80", badge: "Spiritual Hub" },
  { city: "Coimbatore", text: "Textile machinery, pumps, motors, and IT services.", href: "/search?location=Coimbatore", image: "https://images.unsplash.com/photo-1627894099066-96b61df3e73a?auto=format&fit=crop&w=600&q=80", badge: "Manchester of South" },
  { city: "Visakhapatnam", text: "Steel, port shipping, petroleum, and IT hubs.", href: "/search?location=Visakhapatnam", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", badge: "Port City" },
  { city: "Nagpur", text: "Logistics center, agriculture, mining, and trade.", href: "/search?location=Nagpur", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80", badge: "Orange City" },
  { city: "Patna", text: "Historic capital, education, trade, and agriculture.", href: "/search?location=Patna", image: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&w=600&q=80", badge: "Heritage Capital" },
  { city: "Bhopal", text: "Lakes, electrical engineering, software, and trade.", href: "/search?location=Bhopal", image: "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=600&q=80", badge: "City of Lakes" },
];

export function CityCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const total = topCities.length;

  // Auto slide every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [startIndex, isPaused]);

  function handleNext() {
    setAnimatingIndex(0); // Trigger exit animation on leftmost card
    setTimeout(() => {
      setStartIndex((prev) => (prev + 1) % total);
      setAnimatingIndex(null);
    }, 300);
  }

  function handlePrev() {
    setStartIndex((prev) => (prev - 1 + total) % total);
  }

  // Get 4 visible cities
  const visibleCities = [0, 1, 2, 3].map((offset) => {
    const actualIndex = (startIndex + offset) % total;
    return {
      ...topCities[actualIndex],
      displayNumber: String(actualIndex + 1).padStart(2, "0"),
      key: `${topCities[actualIndex].city}-${actualIndex}`,
    };
  });

  return (
    <div
      className="city-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="city-carousel-controls">
        <span className="carousel-status">
          Showing <strong>4</strong> of <strong>20 Top Indian Cities</strong>
        </span>
        <div className="carousel-nav-buttons">
          <button
            type="button"
            className="carousel-btn prev-btn"
            onClick={handlePrev}
            title="Previous City"
            aria-label="Previous City"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="carousel-btn next-btn"
            onClick={handleNext}
            title="Next City"
            aria-label="Next City"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="city-carousel-grid">
        {visibleCities.map((item, index) => (
          <a
            key={item.key}
            className={`check-city-card check-city-landmark-card ${
              animatingIndex === index ? "is-exiting" : "is-entering"
            }`}
            href={item.href}
          >
            <img
              src={item.image}
              alt={`${item.city} Landmark`}
              className="city-landmark-image"
              loading="lazy"
            />
            <div className="city-landmark-overlay" />
            {item.badge ? <span className="city-landmark-badge">{item.badge}</span> : null}
            <div className="city-landmark-content">
              <span className="city-number">{item.displayNumber}</span>
              <strong>{item.city}</strong>
              <small>{item.text}</small>
            </div>
          </a>
        ))}
      </div>

      {/* Slide Indicators / Dots */}
      <div className="city-carousel-dots" aria-label="City pagination">
        {Array.from({ length: Math.ceil(total / 4) }).map((_, dotIndex) => {
          const isActive = Math.floor(startIndex / 4) === dotIndex;
          return (
            <button
              key={dotIndex}
              type="button"
              className={`carousel-dot ${isActive ? "is-active" : ""}`}
              onClick={() => setStartIndex(dotIndex * 4)}
              title={`Go to page ${dotIndex + 1}`}
              aria-label={`Go to page ${dotIndex + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
