"use client";

export function AtlasStatsCard() {
  return (
    <section className="atlas-stats-wrapper" aria-label="Checkinfo Directory Statistics">
      <div className="atlas-stats-card-box">
        <div className="atlas-stat-item">
          <span className="atlas-stat-icon" aria-hidden="true">📊</span>
          <strong className="atlas-stat-number">1,50,000+</strong>
          <span className="atlas-stat-label">LISTED BUSINESSES</span>
        </div>

        <div className="atlas-stat-item">
          <span className="atlas-stat-icon" aria-hidden="true">🌆</span>
          <strong className="atlas-stat-number">100+</strong>
          <span className="atlas-stat-label">CITIES COVERED</span>
        </div>

        <div className="atlas-stat-item">
          <span className="atlas-stat-icon" aria-hidden="true">🤝</span>
          <strong className="atlas-stat-number">1M+</strong>
          <span className="atlas-stat-label">CUSTOMER ENQUIRIES</span>
        </div>
      </div>
    </section>
  );
}
