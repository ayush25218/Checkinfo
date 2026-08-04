import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "user:google";
  const origin = new URL(request.url).origin;

  const [role, provider] = state.split(":");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=OAuth+Authorization+Failed", origin));
  }

  // Handle OAuth code exchange here when ENV credentials are configured
  const response = NextResponse.redirect(new URL(role === "member" ? "/members/myaccount" : "/", origin));

  const authCookieName = role === "member" ? "checkinfo_member_auth" : "checkinfo_user_auth";
  const nameCookieName = role === "member" ? "checkinfo_member_name" : "checkinfo_user_name";

  response.cookies.set(authCookieName, "true", { path: "/" });
  response.cookies.set(nameCookieName, `${provider ? provider.toUpperCase() : "Social"} User`, { path: "/" });

  return response;
}
