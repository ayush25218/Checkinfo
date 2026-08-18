"use client";

import { useState } from "react";

export type FeaturedCardItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  priceLabel: string;
  badge: "Top" | "Popular";
  image: string;
  link: string;
};

const defaultFeaturedData: FeaturedCardItem[] = [
  {
    id: "f1",
    name: "Sheraton Grand Sydney Hotel",
    category: "Hotel",
    location: "Sydney, Australia",
    rating: 4.9,
    reviewsCount: 1,
    amenities: ["Free WiFi", "Swimming Pool", "+3 More"],
    priceLabel: "₹1,000 /night",
    badge: "Top",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Sheraton+Sydney",
  },
  {
    id: "f2",
    name: "Hilton Garden Inn Parth",
    category: "Hotel",
    location: "Parth, Australia",
    rating: 4.8,
    reviewsCount: 1,
    amenities: ["Free WiFi", "Swimming Pool", "+5 More"],
    priceLabel: "₹50,000 /night",
    badge: "Top",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Hilton+Parth",
  },
  {
    id: "f3",
    name: "Conrad Brussels Hotel",
    category: "Hotel",
    location: "Brussels, Belgium",
    rating: 5.0,
    reviewsCount: 1,
    amenities: ["Free WiFi", "Swimming Pool", "+1 More"],
    priceLabel: "₹40,000 /night",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Conrad+Brussels",
  },
  {
    id: "f4",
    name: "Hotel Indigo Toronto Downtown",
    category: "Hotel",
    location: "Toronto, Canada",
    rating: 4.9,
    reviewsCount: 1,
    amenities: ["Free WiFi", "Room Service", "+5 More"],
    priceLabel: "₹30,000 /night",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Hotel+Indigo+Toronto",
  },
  {
    id: "f5",
    name: "Crowne Plaza Shanghai Hotel",
    category: "Hotel",
    location: "Shanghai, China",
    rating: 4.7,
    reviewsCount: 2,
    amenities: ["Free WiFi", "Fitness Center", "+4 More"],
    priceLabel: "₹25,000 /night",
    badge: "Top",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Crowne+Plaza+Shanghai",
  },
  {
    id: "f6",
    name: "InterContinental Shanghai West",
    category: "Real-Estate",
    location: "Shanghai, China",
    rating: 4.9,
    reviewsCount: 3,
    amenities: ["Luxury Suites", "Valet Parking", "+2 More"],
    priceLabel: "₹65,000 /night",
    badge: "Top",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=InterContinental+Shanghai",
  },
  {
    id: "f7",
    name: "The Westin Ghent Spa & Salon",
    category: "Beauty",
    location: "Ghent, Belgium",
    rating: 4.8,
    reviewsCount: 5,
    amenities: ["Spa Packages", "Expert Stylists", "+3 More"],
    priceLabel: "₹12,000 /session",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Westin+Ghent",
  },
  {
    id: "f8",
    name: "DoubleTree Dental Care Clinic",
    category: "Dentist",
    location: "Toronto, Canada",
    rating: 4.9,
    reviewsCount: 4,
    amenities: ["Root Canal", "Teeth Whitening", "+4 More"],
    priceLabel: "₹2,500 /consult",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=DoubleTree+Dental",
  },
];

const categoryTabs = ["Hotel", "Real-Estate", "Beauty", "Dentist", "Restaurant"];

interface AtlasFeaturedListingsProps {
  listings?: any[];
  title?: string;
  id?: string;
}

export function AtlasFeaturedListings({
  listings,
  title = "Featured Listings",
  id = "featured",
}: AtlasFeaturedListingsProps) {
  const [activeTab, setActiveTab] = useState<string>("Hotel");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (idKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [idKey]: !prev[idKey] }));
  };

  // Map dynamic listings from database/props if provided
  const sourceItems: FeaturedCardItem[] = (listings && listings.length > 0)
    ? listings.map((item, idx) => ({
        id: String(item.id || idx),
        name: item.name || item.title || "Business Listing",
        category: item.category || "Hotel",
        location: item.location || item.city || item.address || "India",
        rating: item.rating || 4.9,
        reviewsCount: item.reviewsCount || item.reviewCount || 1,
        amenities: item.amenities || ["Verified Listing", "Contact Available"],
        priceLabel: item.priceLabel || "Verified Lead",
        badge: (item.status === "Featured" || idx % 2 === 0) ? "Top" : "Popular",
        image: item.image || item.photo || defaultFeaturedData[idx % defaultFeaturedData.length].image,
        link: `/search?q=${encodeURIComponent(item.name || item.title || "")}`,
      }))
    : defaultFeaturedData;

  // Filter listings based on active tab
  const displayItems = sourceItems.filter((item) => {
    if (!activeTab || activeTab === "All") return true;
    const catLower = (item.category || "").toLowerCase();
    const tabLower = activeTab.toLowerCase();
    return catLower.includes(tabLower) || sourceItems.length < 5;
  });

  return (
    <section className="atlas-featured-section" id={id}>
      <div className="atlas-featured-header centered">
        <h2 className="atlas-featured-title">{title}</h2>
        
        {/* Category Tabs Bar */}
        <div className="atlas-featured-tabs" role="tablist">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`atlas-featured-tab-btn ${activeTab === tab ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Cards Grid (4 Columns) */}
      <div className="atlas-featured-grid">
        {displayItems.slice(0, 8).map((card) => {
          const isFav = favorites[card.id];
          return (
            <article className="atlas-featured-card" key={card.id}>
              {/* Card Image Wrap */}
              <div className="atlas-card-img-wrap">
                <img src={card.image} alt={card.name} className="atlas-card-img" loading="lazy" />
                
                {/* Badge Top Left */}
                <span className={`atlas-card-badge ${card.badge.toLowerCase()}`}>
                  {card.badge}
                </span>

                {/* Favorite Heart Top Right */}
                <button
                  type="button"
                  className={`atlas-card-fav-btn ${isFav ? "is-fav" : ""}`}
                  onClick={(e) => toggleFavorite(card.id, e)}
                  title="Save listing"
                >
                  {isFav ? "❤️" : "🤍"}
                </button>
              </div>

              {/* Card Content Body */}
              <div className="atlas-card-body">
                {/* Title with Verified Shield */}
                <h3 className="atlas-card-title">
                  <span className="atlas-verified-icon" title="Verified Listing">🛡️</span>
                  <a href={card.link}>{card.name}</a>
                </h3>

                {/* Location & Rating */}
                <div className="atlas-card-meta">
                  <span className="atlas-card-location">
                    <span className="location-pin">📍</span> {card.location}
                  </span>
                  <span className="atlas-card-rating">
                    ⭐ ({card.reviewsCount})
                  </span>
                </div>

                {/* Amenities Tags */}
                <div className="atlas-card-amenities">
                  {card.amenities.join(" • ")}
                </div>

                {/* Footer Action & Price Row */}
                <div className="atlas-card-footer">
                  <a href={card.link} className="atlas-card-details-btn">
                    See Details
                  </a>
                  <span className="atlas-card-price">{card.priceLabel}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
