import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Checkinfo application structure and responsive header integration", async () => {
  const [page, siteHeader, homePage] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../frontend/web/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../frontend/web/HomePage.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /import \{ HomePage \} from "@\/frontend\/web\/HomePage"/);
  assert.match(homePage, /<SiteHeader \/>/);
  assert.match(siteHeader, /check-mobile-toggle/);
  assert.match(siteHeader, /check-mobile-drawer/);
  assert.match(siteHeader, /HeaderUserProfileDropdown/);
});
