import fs from "node:fs";
import path from "node:path";
import { FioxenScripts } from "./FioxenScripts";

type FioxenPageProps = {
  file: string;
};

const pageMap: Record<string, string> = {
  "about.html": "/about",
  "add-listing.html": "/add-listing",
  "blog.html": "/blog",
  "contact.html": "/contact",
  "listing-grid.html": "/listing-grid",
};

function transformHtml(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] ?? html;

  return body
    .replace(
      /<li class="menu-item has-children"><a href="index\.html"[^>]*>Home<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>/gi,
      '<li class="menu-item"><a href="index.html" class="active">Home</a></li>',
    )
    .replace(
      /<li class="menu-item has-children"><a href="#">Listings<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>/gi,
      '<li class="menu-item"><a href="listing-grid.html">Listing Grid</a></li>',
    )
    .replace(
      /<li class="menu-item has-children"><a href="#">Pages<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>/gi,
      '<li class="menu-item"><a href="add-listing.html">Add Listing</a></li>',
    )
    .replace(
      /<li class="menu-item has-children"><a href="#">Article<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>/gi,
      '<li class="menu-item"><a href="blog.html">Blog</a></li>',
    )
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/(href|src)=["']assets\//gi, '$1="/fioxen/assets/')
    .replace(/url\(["']?assets\//gi, 'url("/fioxen/assets/')
    .replace(/\bindex\.html\b/g, "/")
    .replace(/\b(?:listing-details-1|listing-details-2|listing-list|listing-map)\.html\b/gi, "/listing-grid")
    .replace(/\bblog-details\.html\b/gi, "/blog")
    .replace(/\b(?:products|product-details|pricing|how-work)\.html\b/gi, "/")
    .replace(/\b([a-z0-9-]+\.html)\b/gi, (match) => pageMap[match] ?? match)
    .replace(/\sdata-wow-delay=/g, " data-wow-delay=")
    .replace(/\sdta-wow-delay=/g, " data-wow-delay=");
}

export function FioxenPage({ file }: FioxenPageProps) {
  const safeFile = pageMap[file] ? file : "about.html";
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
