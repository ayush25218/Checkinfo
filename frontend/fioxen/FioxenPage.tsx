import fs from "node:fs";
import path from "node:path";
import { FioxenScripts } from "./FioxenScripts";

type FioxenPageProps = {
  file: string;
};

const pageMap: Record<string, string> = {
  "about.html": "/about",
  "add-listing.html": "/add-listing",
  "blog-details.html": "/blog-details",
  "blog.html": "/blog",
  "contact.html": "/contact",
  "how-work.html": "/how-work",
  "index-2.html": "/home-2",
  "index-3.html": "/home-3",
  "index.html": "/",
  "listing-details-1.html": "/listing-details-1",
  "listing-details-2.html": "/listing-details-2",
  "listing-grid.html": "/listing-grid",
  "listing-list.html": "/listing-list",
  "listing-map.html": "/listing-map",
  "pricing.html": "/pricing",
  "product-details.html": "/product-details",
  "products.html": "/products",
};

function transformHtml(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] ?? html;

  return body
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/(href|src)=["']assets\//gi, '$1="/fioxen/assets/')
    .replace(/url\(["']?assets\//gi, 'url("/fioxen/assets/')
    .replace(/\bindex\.html\b/g, "/")
    .replace(/\b([a-z0-9-]+\.html)\b/gi, (match) => pageMap[match] ?? match)
    .replace(/\sdata-wow-delay=/g, " data-wow-delay=")
    .replace(/\sdta-wow-delay=/g, " data-wow-delay=");
}

export function FioxenPage({ file }: FioxenPageProps) {
  const safeFile = pageMap[file] ? file : "index.html";
  const htmlPath = path.join(process.cwd(), "public", "fioxen", "pages", safeFile);
  const html = fs.readFileSync(htmlPath, "utf8");
  const content = transformHtml(html);

  return (
    <>
      <link rel="shortcut icon" href="/fioxen/assets/images/favicon.ico" type="image/png" />
      <link rel="stylesheet" href="/fioxen/assets/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/fioxen/assets/fonts/themify-icons/themify-icons.css" />
      <link rel="stylesheet" href="/fioxen/assets/fonts/flaticon/flaticon.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/magnific-popup.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/slick.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/nice-select.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/jquery-ui.min.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/animate.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/default.css" />
      <link rel="stylesheet" href="/fioxen/assets/css/style.css" />
      <main className="fioxen-react-page" dangerouslySetInnerHTML={{ __html: content }} />
      <FioxenScripts />
    </>
  );
}

export const fioxenPages = pageMap;
