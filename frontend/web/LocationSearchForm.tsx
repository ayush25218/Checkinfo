"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type LocationSearchFormProps = {
  className?: string;
  compact?: boolean;
  defaultCategory?: string;
  defaultLocation?: string;
  defaultQuery?: string;
  showSuggestions?: boolean;
};

const suggestions = [
  ["Website Developer", "New Delhi", "💻"],
  ["Restaurants", "near me", "🍽️"],
  ["Hospitals", "Dwarka", "🩺"],
  ["Hotels", "New Delhi", "🏨"],
];

type SpeechRecognitionResultLike = {
  item(index: number): { transcript: string };
};

type SpeechRecognitionEventLike = {
  results: {
    item(index: number): SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type SearchOption = {
  label: string;
  value: string;
};

type SearchOptionsPayload = {
  categories: SearchOption[];
  cities: SearchOption[];
};

function isNearMeSearch(query: string, location: string) {
  return /\bnear\s+me\b/i.test(query) || (!location.trim() && /\bnearby\b/i.test(query));
}

export function LocationSearchForm({
  className,
  compact = false,
  defaultCategory = "",
  defaultLocation = "",
  defaultQuery = "",
  showSuggestions = false,
}: LocationSearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(defaultCategory);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState(defaultLocation);
  const [options, setOptions] = useState<SearchOptionsPayload>({ categories: [], cities: [] });
  const [query, setQuery] = useState(defaultQuery);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const formClassName = useMemo(() => [className, compact ? "is-compact" : "with-location"].join(" "), [className, compact]);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/web/search-options")
      .then((response) => response.ok ? response.json() : null)
      .then((payload: SearchOptionsPayload | null) => {
        if (!cancelled && payload) setOptions(payload);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (defaultLocation.trim()) return;

    let cancelled = false;
    fetch("/api/web/location")
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { city?: string; region?: string } | null) => {
        if (cancelled || location.trim()) return;
        const detectedLocation = [payload?.city, payload?.region].filter(Boolean).join(", ");
        if (detectedLocation) setLocation(detectedLocation);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [defaultLocation, location]);

  function submitWithPosition(form: HTMLFormElement, position: GeolocationPosition) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
      params.set(key, String(value));
    }
    params.set("lat", String(position.coords.latitude));
    params.set("lng", String(position.coords.longitude));
    params.set("radius", "8000");
    window.location.href = `/search?${params.toString()}`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const data = new FormData(form);
    const q = String(data.get("q") ?? "");
    const searchLocation = String(data.get("location") ?? "");
    setIsSubmitting(true);

    if (!isNearMeSearch(q, searchLocation) || !navigator.geolocation) return;

    event.preventDefault();
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => submitWithPosition(form, position),
      () => {
        // ✅ FIX: Do NOT call requestSubmit() here — that causes an infinite loop.
        // Instead gracefully fall back to a normal search without coordinates.
        setIsLocating(false);
        const params = new URLSearchParams();
        for (const [key, value] of new FormData(form).entries()) {
          params.set(key, String(value));
        }
        window.location.href = `/search?${params.toString()}`;
      },
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 8000 },
    );
  }

  function startVoiceSearch() {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      const transcript = event.results.item(0).item(0).transcript.trim();
      if (transcript) {
        setQuery(transcript);
        inputRef.current?.focus();
        window.setTimeout(() => formRef.current?.requestSubmit(), 180);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setLocation("Near Me");
        if (formRef.current) {
          submitWithPosition(formRef.current, position);
        }
      },
      () => {
        setIsLocating(false);
        alert("Unable to retrieve your location");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function clearFilters() {
    setCategory("");
    setLocation("");
  }

  return (
    <form ref={formRef} className={formClassName} action="/search" method="get" onSubmit={handleSubmit}>
      <div className="search-input-group search-what-group">
        <span className="search-field-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <div className="search-field-content">
          {!compact ? <span className="search-field-label">WHAT</span> : null}
          <input
            ref={inputRef}
            name="q"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={compact ? "Search..." : "Service, business, or category..."}
            value={query}
          />
        </div>
      </div>

      {!compact ? <span className="search-divider" aria-hidden="true" /> : null}

      <input name="category" type="hidden" value={category} />

      {compact ? (
        <input name="location" type="hidden" value={location} />
      ) : (
        <div className="search-input-group search-where-group">
          <span className="search-field-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div className="search-field-content">
            <span className="search-field-label">WHERE</span>
            <input
              name="location"
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, pincode, or area..."
              value={location}
            />
          </div>
          <button
            type="button"
            className="use-location-btn"
            onClick={handleUseMyLocation}
            title="Use My Current Location (GPS)"
            disabled={isLocating}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span>{isLocating ? "Locating..." : "Near Me"}</span>
          </button>
        </div>
      )}
      <button
        aria-expanded={filterOpen}
        aria-haspopup="dialog"
        className={category || location ? "search-filter-button is-active" : "search-filter-button"}
        onClick={() => setFilterOpen((open) => !open)}
        title="Search filters"
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 7h10" />
          <path d="M18 7h2" />
          <path d="M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
          <path d="M4 17h2" />
          <path d="M10 17h10" />
          <path d="M6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
          <path d="M4 12h5" />
          <path d="M13 12h7" />
          <path d="M9 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
        </svg>
        <span>Filters</span>
      </button>
      {filterOpen ? (
        <div className="search-filter-popover" role="dialog" aria-label="Search filters">
          <div>
            <strong>Search</strong>
            <button type="button" onClick={() => setFilterOpen(false)} aria-label="Close search filters">x</button>
          </div>
          <label>
            <span>Select Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Select Category</option>
              {options.categories.map((option) => <option key={option.value} value={option.label}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span>Select City</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="">Select City</option>
              {options.cities.map((option) => <option key={option.value} value={option.label}>{option.label}</option>)}
            </select>
          </label>
          <div className="search-filter-actions">
            <button type="submit">Submit</button>
            <button type="button" onClick={clearFilters}>Clear</button>
          </div>
        </div>
      ) : null}
      <button
        className={isListening ? "voice-search-button is-listening" : "voice-search-button"}
        disabled={!voiceSupported}
        onClick={startVoiceSearch}
        title={voiceSupported ? "Voice search" : "Voice search is not supported in this browser"}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 14.5c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3S9 4.3 9 6v5.5c0 1.7 1.3 3 3 3Z" />
          <path d="M18.5 10.5c0 3.6-2.8 6.5-6.5 6.5s-6.5-2.9-6.5-6.5" />
          <path d="M12 17v4" />
          <path d="M8.5 21h7" />
        </svg>
        <span>{isListening ? "Listening" : "Voice search"}</span>
      </button>
      <button type="submit" className="search-submit-btn" title="Search business listings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>{isLocating ? "Locating..." : isSubmitting ? "Searching..." : "Search"}</span>
      </button>
      {isSubmitting || isLocating ? <span className="search-live-status" role="status">{isLocating ? "Finding nearby businesses..." : "Loading results..."}</span> : null}
      {showSuggestions ? (
        <div className="check-search-suggestions" aria-label="Popular searches">
          {suggestions.map(([suggestedQuery, suggestedLocation, icon]) => (
            <a href={`/search?q=${encodeURIComponent(suggestedQuery)}&location=${encodeURIComponent(suggestedLocation)}`} key={`${suggestedQuery}-${suggestedLocation}`}>
              <span className="suggestion-icon">{icon}</span>
              {suggestedQuery}
            </a>
          ))}
        </div>
      ) : null}
    </form>
  );
}
