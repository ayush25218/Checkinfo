"use client";

import { useState, useMemo } from "react";
import type { PublicBusinessListing } from "@/backend/listingSeo";
import { BusinessCard } from "./BusinessCard";
import { SiteHeader } from "./SiteHeader";

export function ListingCollectionPage({
  eyebrow,
  listings,
  subtitle,
  title,
}: {
  eyebrow: string;
  listings: PublicBusinessListing[];
  subtitle: string;
  title: string;
}) {
  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(listings.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedListings = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return listings.slice(start, start + pageSize);
  }, [listings, safePage]);

  return (
    <main className="listing-collection-page">
      <SiteHeader />

      <section className="listing-collection-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <span>
          {listings.length} verified listings (Page {safePage} of {totalPages})
        </span>
      </section>

      <section className="listing-collection-grid">
        {paginatedListings.length ? (
          paginatedListings.map((listing) => (
            <BusinessCard listing={listing} key={`${listing.ownerId}-${listing.id}`} />
          ))
        ) : (
          <article className="check-empty-listing">
            <strong>No listings found</strong>
            <span>Approved businesses will appear here after admin review.</span>
          </article>
        )}
      </section>

      {/* 20 Items Per Page Pagination Controls */}
      {totalPages > 1 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", margin: "2rem auto 3rem", padding: "0 1rem", flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: safePage <= 1 ? "#f1f5f9" : "#ffffff", color: safePage <= 1 ? "#94a3b8" : "#0f172a", cursor: safePage <= 1 ? "not-allowed" : "pointer", fontSize: "0.85rem", fontWeight: "600" }}
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
            .map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && pageNum - prev > 1;
              return (
                <span key={pageNum} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  {showEllipsis ? <span style={{ color: "#64748b", padding: "0 4px" }}>...</span> : null}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: pageNum === safePage ? "1px solid #2563eb" : "1px solid #cbd5e1",
                      background: pageNum === safePage ? "#2563eb" : "#ffffff",
                      color: pageNum === safePage ? "#ffffff" : "#0f172a",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: pageNum === safePage ? "700" : "500",
                    }}
                  >
                    {pageNum}
                  </button>
                </span>
              );
            })}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: safePage >= totalPages ? "#f1f5f9" : "#ffffff", color: safePage >= totalPages ? "#94a3b8" : "#0f172a", cursor: safePage >= totalPages ? "not-allowed" : "pointer", fontSize: "0.85rem", fontWeight: "600" }}
          >
            Next →
          </button>
        </div>
      ) : null}
    </main>
  );
}
