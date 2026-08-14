import { createSessionToken, getAuthCookieName, type AuthRole } from "@/backend/auth";
import { isMongoConfigured, upsertMongoOAuthMember } from "@/backend/mongodb";
import { NextResponse } from "next/server";

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub?: string;
};

function isAuthRole(value: string | null): value is AuthRole {
  return value === "admin" || value === "member" || value === "user";
}

function errorPath(role: AuthRole) {
  return role === "member" ? "/members/login" : "/login";
}

function oauthError(role: AuthRole, origin: string, message: string) {
  return NextResponse.redirect(new URL(`${errorPath(role)}?error=${encodeURIComponent(message)}`, origin));
}

function normalizeMemberId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

function memberIdFromGoogle(profile: GoogleUserInfo) {
  return normalizeMemberId(`google-${profile.sub || profile.email || "member"}`) || "google-member";
}

async function exchangeGoogleCode(origin: string, code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    return { error: "Google sign-in is not configured yet" as const };
  }

  const redirectUri = `${origin}/api/auth/oauth/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    return { error: "Google sign-in failed while exchanging the authorization code" as const };
  }

  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenPayload.access_token) {
    return { error: "Google sign-in did not return an access token" as const };
  }

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    return { error: "Google sign-in failed while loading the user profile" as const };
  }

  const profile = (await userInfoResponse.json()) as GoogleUserInfo;
  if (!profile.email || profile.email_verified === false) {
    return { error: "Google account email is missing or not verified" as const };
  }

  return { profile };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "user:google";
  const origin = new URL(request.url).origin;
  const [rawRole, provider] = state.split(":");
  const role: AuthRole = isAuthRole(rawRole) ? rawRole : "member";

  if (provider !== "google") {
    const response = NextResponse.redirect(new URL(role === "member" ? "/members/myaccount" : "/", origin));
    const authCookieName = role === "member" ? "checkinfo_member_auth" : "checkinfo_user_auth";
    const nameCookieName = role === "member" ? "checkinfo_member_name" : "checkinfo_user_name";
    response.cookies.set(authCookieName, "true", { path: "/" });
    response.cookies.set(nameCookieName, `${provider ? provider.toUpperCase() : "Social"} User`, { path: "/" });
    return response;
  }

  if (!code) {
    return oauthError(role, origin, "Google authorization was cancelled or failed");
  }

  const exchange = await exchangeGoogleCode(origin, code);
  if ("error" in exchange) {
    return oauthError(role, origin, exchange.error || "Google sign-in failed");
  }

  const profile = exchange.profile;
  const googleEmail = (profile.email || "").toLowerCase();
  if (!googleEmail) {
    return oauthError(role, origin, "Google account email is missing or not verified");
  }
  const googleName = profile.name?.trim() || googleEmail.split("@")[0] || "Business Member";
  const googleMemberId = memberIdFromGoogle(profile);

  let sessionUsername = googleEmail;
  let memberId = googleMemberId;
  let memberName = googleName;

  if (role === "member" && isMongoConfigured()) {
    const memberAccount = await upsertMongoOAuthMember({
      email: googleEmail,
      id: googleMemberId,
      name: googleName,
      provider: "google",
      username: googleMemberId,
    });

    if (memberAccount) {
      memberId = memberAccount.profile.id || memberId;
      memberName = memberAccount.profile.name || memberName;
      sessionUsername = memberAccount.profile.username || sessionUsername;
    }
  }

  const response = NextResponse.redirect(new URL(role === "member" ? "/members/myaccount" : "/", origin));
  const authCookieName = getAuthCookieName(role);
  const nameCookieName = role === "member" ? "checkinfo_member_name" : "checkinfo_user_name";

  response.cookies.set(authCookieName, createSessionToken(role, sessionUsername), {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (role === "member") {
    response.cookies.set("checkinfo_member_id", memberId, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  response.cookies.set(nameCookieName, memberName, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
