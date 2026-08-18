"use client";

type PickupArticle = {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  image: string;
  link: string;
};

const defaultPickupUpdates: PickupArticle[] = [
  {
    id: "p1",
    tag: "Travel & Hospitality (Hotels)",
    title: "Luxury stays, budget-friendly travel, and cultural experiences.",
    excerpt: "City life refers to the lifestyle and characteristics associated with living in...",
    authorName: "John Doe",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    date: "August 17, 2026",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80",
    link: "/blog",
  },
  {
    id: "p2",
    tag: "Food & Dining (Restaurants)",
    title: "Restaurant reviews, recipes, and food trends.",
    excerpt: "Welcome to a world of delicious discoveries! This blog covers everything from in...",
    authorName: "John Doe",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    date: "August 17, 2026",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
    link: "/blog",
  },
  {
    id: "p3",
    tag: "Beauty & Wellness",
    title: "Skincare routines, makeup tips, and beauty product reviews.",
    excerpt: "This blog is dedicated to providing expert advice on skincare routines, makeup t...",
    authorName: "John Doe",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    date: "August 17, 2026",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
    link: "/blog",
  },
];

export function AtlasPickupUpdates() {
  return (
    <section className="atlas-pickup-section" aria-label="Pickup New Updates">
      <div className="atlas-pickup-header centered">
        <h2 className="atlas-pickup-title">Pickup New Updates</h2>
      </div>

      <div className="atlas-pickup-grid">
        {defaultPickupUpdates.map((article) => (
          <a key={article.id} href={article.link} className="atlas-pickup-card">
            {/* Card Image */}
            <div className="atlas-pickup-img-wrap">
              <img src={article.image} alt={article.title} className="atlas-pickup-img" loading="lazy" />
            </div>

            {/* Card Content Body */}
            <div className="atlas-pickup-body">
              <span className="atlas-pickup-tag">{article.tag}</span>
              <h3 className="atlas-pickup-headline">{article.title}</h3>
              <p className="atlas-pickup-excerpt">{article.excerpt}</p>

              {/* Author & Arrow Footer */}
              <div className="atlas-pickup-footer">
                <div className="atlas-pickup-author">
                  <img src={article.authorAvatar} alt={article.authorName} className="atlas-author-img" loading="lazy" />
                  <div className="atlas-author-meta">
                    <strong className="atlas-author-name">{article.authorName}</strong>
                    <span className="atlas-author-date">{article.date}</span>
                  </div>
                </div>

                <span className="atlas-pickup-arrow" aria-hidden="true">↗</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
