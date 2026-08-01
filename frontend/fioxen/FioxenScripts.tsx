"use client";

import Script from "next/script";

const scripts = [
  "/fioxen/assets/js/vendor/jquery-3.6.0.min.js",
  "/fioxen/assets/js/popper.min.js",
  "/fioxen/assets/js/bootstrap.min.js",
  "/fioxen/assets/js/slick.min.js",
  "/fioxen/assets/js/jquery.magnific-popup.min.js",
  "/fioxen/assets/js/isotope.pkgd.min.js",
  "/fioxen/assets/js/imagesloaded.pkgd.min.js",
  "/fioxen/assets/js/jquery.nice-select.min.js",
  "/fioxen/assets/js/jquery.counterup.min.js",
  "/fioxen/assets/js/jquery.waypoints.js",
  "/fioxen/assets/js/jquery-ui.min.js",
  "/fioxen/assets/js/wow.min.js",
  "/fioxen/assets/js/main.js",
];

export function FioxenScripts() {
  return (
    <>
      {scripts.map((src, index) => (
        <Script
          key={src}
          src={src}
          strategy="afterInteractive"
          id={`fioxen-script-${index}`}
        />
      ))}
    </>
  );
}
