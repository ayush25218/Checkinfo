import { searchDirectory } from "@/backend/search";
import { LocationSearchForm } from "@/frontend/web/LocationSearchForm";

type SearchPageProps = {
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    location?: string;
    q?: string;
    radius?: string;
  }>;
};

function toNumber(value?: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const location = params.location ?? "";
  const data = await searchDirectory({
    lat: toNumber(params.lat),
    lng: toNumber(params.lng),
    location,
    q,
    radius: toNumber(params.radius),
  });

  return (
    <main className="search-page">
      <header className="search-header">
        <a className="check-logo" href="/" aria-label="Checkinfo home">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Check kiya kya?</small>
        </a>
        <LocationSearchForm
          className="check-top-search search-page-form"
          defaultLocation={location}
          defaultQuery={q}
        />
        <a className="check-post-button" href="/members/add_listing">Post Your Ad</a>
      </header>

      <section className="search-hero">
        <p className="eyebrow">Local business search</p>
        <h1>{q ? `Results for ${q}` : "Search nearby businesses"}</h1>
        <p>
          Sponsored Checkinfo listings appear first, followed by nearby Google
          Places results sorted for your search intent.
        </p>
        <div className="search-summary">
          <span>{data.count} results</span>
          <span>{data.sponsored.length} sponsored</span>
          <span>{data.googleCount} Google Places</span>
        </div>
        {data.warning ? <strong className="search-warning">{data.warning}</strong> : null}
      </section>

      <section className="search-results">
        {data.results.length ? (
          data.results.map((result) => (
            <article className={result.sponsored ? "search-card sponsored" : "search-card"} key={result.id}>
              <div>
                <span className="search-badge">{result.sponsored ? "Sponsored" : result.source === "google" ? "Google Places" : "Checkinfo"}</span>
                <h2>{result.name}</h2>
                <p>{result.category}</p>
                <address>{result.address}</address>
              </div>
              <div className="search-card-meta">
                {result.rating ? <strong>{result.rating} / 5</strong> : <strong>New</strong>}
                {result.reviewCount ? <span>{result.reviewCount} reviews</span> : null}
                {result.phone ? <a href={`tel:${result.phone}`}>{result.phone}</a> : null}
                {result.url ? <a href={result.url}>View Checkinfo Page</a> : null}
                {result.website ? <a href={result.website} target="_blank" rel="noreferrer">Website</a> : null}
                {result.mapUrl ? <a href={result.mapUrl} target="_blank" rel="noreferrer">Google Map</a> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="search-empty">
            <h2>No matching businesses found</h2>
            <p>Try a category with city name, or search again with “near me” and allow location access.</p>
          </div>
        )}
      </section>
    </main>
  );
}
