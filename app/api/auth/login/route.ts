import { createSessionToken, getAuthCookieName, validCredentials, type AuthRole } from "@/backend/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function isAuthRole(value: FormDataEntryValue | null): value is AuthRole {
  return value === "admin" || value === "member";
}

function destinationFor(role: AuthRole) {
  return role === "admin" ? "/admin" : "/members/myaccount";
}

function loginPath(role: AuthRole, error = "") {
  const path = role === "admin" ? "/admin/login" : "/members/login";
  return error ? `${path}?error=${encodeURIComponent(error)}` : path;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = formData.get("role");
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isAuthRole(role)) redirect("/members/login?error=Invalid login role");

  if (!validCredentials(role, username, password)) {
    redirect(loginPath(role, "Invalid username or password"));
  }

  const cookieStore = await cookies();
  cookieStore.set(getAuthCookieName(role), createSessionToken(role, username), {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (role === "member") {
    cookieStore.set("checkinfo_member_id", username.replace(/[^a-zA-Z0-9_-]/g, "") || "member", {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect(destinationFor(role));
}
