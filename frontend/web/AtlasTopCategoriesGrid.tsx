"use client";

type CategoryItem = {
  name: string;
  countLabel: string;
  image: string;
  link: string;
};

const atlasCategories: CategoryItem[] = [
  {
    name: "Beauty",
    countLabel: "13 Listing",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Beauty",
  },
  {
    name: "Hotel",
    countLabel: "9 Listing",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Hotels",
  },
  {
    name: "Real Estate",
    countLabel: "9 Listing",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Real+Estate",
  },
  {
    name: "Restaurant",
    countLabel: "8 Listing",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Restaurants",
  },
  {
    name: "Dentist",
    countLabel: "5 Listing",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Dentist",
  },
  {
    name: "Hospitals",
    countLabel: "12 Listing",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    link: "/search?q=Hospitals",
  },
];

export function AtlasTopCategoriesGrid() {
  return (
    <section className="atlas-categories-section" id="categories">
      <div className="atlas-categories-header centered">
        <h2 className="atlas-categories-title">Browse Top Categories.</h2>
      </div>

      <div className="atlas-categories-grid">
        {atlasCategories.map((cat) => (
          <a key={cat.name} href={cat.link} className="atlas-category-tile-card">
            <img src={cat.image} alt={cat.name} className="atlas-tile-img" loading="lazy" />
            <div className="atlas-tile-overlay" />
            <div className="atlas-tile-content">
              <strong className="atlas-tile-name">{cat.name}</strong>
              <span className="atlas-tile-count">{cat.countLabel}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
