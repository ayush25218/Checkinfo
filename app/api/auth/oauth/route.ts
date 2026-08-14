import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "google";
  const role = searchParams.get("role") || "user";
  const origin = new URL(request.url).origin;

  const redirectUri = `${origin}/api/auth/oauth/callback`;

  let clientId = "";
  let authUrl = "";

  if (provider === "google") {
    clientId = process.env.GOOGLE_CLIENT_ID || "";
    if (clientId) {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        state: `${role}:google`,
        prompt: "select_account",
        access_type: "online",
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else {
      const path = role === "member" ? "/members/login" : "/login";
      return NextResponse.redirect(new URL(`${path}?error=${encodeURIComponent("Google sign-in is not configured yet")}`, origin));
    }
  } else if (provider === "facebook") {
    clientId = process.env.FACEBOOK_CLIENT_ID || process.env.FB_CLIENT_ID || "";
    if (clientId) {
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&state=${role}:facebook`;
    }
  } else if (provider === "vk") {
    clientId = process.env.VK_CLIENT_ID || "";
    if (clientId) {
      authUrl = `https://oauth.vk.com/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&display=page&scope=email&response_type=code&state=${role}:vk`;
    }
  }

  // 2. If provider is configured with ENV, redirect to official OAuth consent page!
  if (authUrl) {
    return NextResponse.redirect(authUrl);
  }

  const response = NextResponse.redirect(new URL(role === "member" ? "/members/myaccount" : "/", origin));

  const authCookieName = role === "member" ? "checkinfo_member_auth" : "checkinfo_user_auth";
  const nameCookieName = role === "member" ? "checkinfo_member_name" : "checkinfo_user_name";
  const providerName = provider.toUpperCase();

  response.cookies.set(authCookieName, "true", { path: "/" });
  response.cookies.set(nameCookieName, `Demo ${providerName} User`, { path: "/" });

  return response;
}
