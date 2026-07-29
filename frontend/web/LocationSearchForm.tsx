"use client";

import { useState, type FormEvent } from "react";

type LocationSearchFormProps = {
  className: string;
  compact?: boolean;
  defaultLocation?: string;
  defaultQuery?: string;
};

function isNearMeSearch(query: string, location: string) {
  return /\bnear\s+me\b/i.test(query) || (!location.trim() && /\bnearby\b/i.test(query));
}

export function LocationSearchForm({
  className,
  compact = false,
  defaultLocation = "",
  defaultQuery = "",
}: LocationSearchFormProps) {
  const [isLocating, setIsLocating] = useState(false);

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
    const location = String(data.get("location") ?? "");

    if (!isNearMeSearch(q, location) || !navigator.geolocation) return;

    event.preventDefault();
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => submitWithPosition(form, position),
      () => {
        setIsLocating(false);
        form.requestSubmit();
      },
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 8000 },
    );
  }

  return (
    <form className={className} action="/search" method="get" onSubmit={handleSubmit}>
      <input name="q" placeholder={compact ? "Search" : "What are you looking for?"} defaultValue={defaultQuery} />
      {!compact ? <input name="location" placeholder="City or location" defaultValue={defaultLocation} /> : null}
      <button type="submit">{isLocating ? "Locating..." : "Search"}</button>
    </form>
  );
}
