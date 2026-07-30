"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type LocationSearchFormProps = {
  className: string;
  compact?: boolean;
  defaultLocation?: string;
  defaultQuery?: string;
  showSuggestions?: boolean;
};

const suggestions = [
  ["Website Developer", "New Delhi"],
  ["Restaurants", "near me"],
  ["Hospitals", "Dwarka"],
  ["Hotels", "New Delhi"],
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

function isNearMeSearch(query: string, location: string) {
  return /\bnear\s+me\b/i.test(query) || (!location.trim() && /\bnearby\b/i.test(query));
}

export function LocationSearchForm({
  className,
  compact = false,
  defaultLocation = "",
  defaultQuery = "",
  showSuggestions = false,
}: LocationSearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);

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
      if (inputRef.current && transcript) {
        inputRef.current.value = transcript;
        inputRef.current.focus();
        window.setTimeout(() => formRef.current?.requestSubmit(), 180);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  return (
    <form ref={formRef} className={className} action="/search" method="get" onSubmit={handleSubmit}>
      <input ref={inputRef} name="q" placeholder={compact ? "Search" : "What are you looking for?"} defaultValue={defaultQuery} />
      {!compact ? <input name="location" placeholder="City or location" defaultValue={defaultLocation} /> : null}
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
      <button type="submit">{isLocating ? "Locating..." : "Search"}</button>
      {showSuggestions ? (
        <div className="check-search-suggestions" aria-label="Popular searches">
          {suggestions.map(([query, location]) => (
            <a href={`/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`} key={`${query}-${location}`}>
              <span>{query.charAt(0)}</span>
              {query}
            </a>
          ))}
        </div>
      ) : null}
    </form>
  );
}
