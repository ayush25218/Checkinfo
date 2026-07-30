"use client";

import { useState } from "react";

type CategoryIconVisualProps = {
  className: string;
  icon?: string;
  initials: string;
};

function looksLikeImage(value: string) {
  return /^(https?:|data:image\/|\/)/i.test(value) || /\.(svg|png|jpe?g|webp|gif)$/i.test(value);
}

function imageSource(value: string) {
  if (/^(https?:|data:image\/|\/)/i.test(value)) return value;
  return `/uploads/${value}`;
}

export function CategoryIconVisual({ className, icon, initials }: CategoryIconVisualProps) {
  const [failed, setFailed] = useState(false);
  const value = icon?.trim();

  if (value && !failed && looksLikeImage(value)) {
    return (
      <span className={`${className} has-image`} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={imageSource(value)} onError={() => setFailed(true)} />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {value && value !== "Image" ? value.slice(0, 3) : initials}
    </span>
  );
}
