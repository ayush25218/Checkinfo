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

test("member login fields stay separate from admin autofill fields", async () => {
  const [memberLoginPage, authRoute] = await Promise.all([
    readFile(new URL("../app/members/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/login/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(memberLoginPage, /AutofillSafeInput/);
  assert.match(memberLoginPage, /name="member_username"/);
  assert.match(memberLoginPage, /name="member_password"/);
  assert.match(memberLoginPage, /autoComplete="new-password"/);
  assert.doesNotMatch(memberLoginPage, /name="username"/);
  assert.doesNotMatch(memberLoginPage, /name="password"/);
  assert.match(authRoute, /member_username/);
  assert.match(authRoute, /member_password/);
});

test("google business oauth uses real code exchange and member linking", async () => {
  const [oauthRoute, oauthCallback, envExample, mongodb] = await Promise.all([
    readFile(new URL("../app/api/auth/oauth/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/oauth/callback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../backend/mongodb.ts", import.meta.url), "utf8"),
  ]);

  assert.match(oauthRoute, /GOOGLE_CLIENT_ID/);
  assert.match(oauthRoute, /Google sign-in is not configured yet/);
  assert.match(oauthCallback, /oauth2\.googleapis\.com\/token/);
  assert.match(oauthCallback, /openidconnect\.googleapis\.com\/v1\/userinfo/);
  assert.match(oauthCallback, /upsertMongoOAuthMember/);
  assert.match(envExample, /GOOGLE_CLIENT_ID=/);
  assert.match(envExample, /GOOGLE_CLIENT_SECRET=/);
  assert.match(mongodb, /upsertMongoOAuthMember/);
});
