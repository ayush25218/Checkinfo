import { createSessionToken, getAuthCookieName, validCredentialsAsync, type AuthRole } from "@/backend/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function isAuthRole(value: FormDataEntryValue | null): value is AuthRole {
  return value === "admin" || value === "member" || value === "user";
}

function destinationFor(role: AuthRole) {
  if (role === "admin") return "/admin";
  if (role === "user") return "/?login=success";
  return "/members/myaccount";
}

function loginPath(role: AuthRole, error = "") {
  const path = role === "admin" ? "/admin/login" : role === "user" ? "/login" : "/members/login";
  return error ? `${path}?error=${encodeURIComponent(error)}` : path;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = formData.get("role");
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isAuthRole(role)) redirect("/members/login?error=Invalid login role");

  if (!(await validCredentialsAsync(role, username, password))) {
    redirect(loginPath(role, "Invalid username or password"));
  }

  const cookieStore = await cookies();
  let sessionUsername = username;
  let memberProfileName = "";
  let memberProfileId = "";

  if (role === "member") {
    try {
      const { getMongoMemberByUsernameOrEmail, isMongoConfigured } = await import("@/backend/mongodb");
      if (isMongoConfigured()) {
        const member = await getMongoMemberByUsernameOrEmail(username);
        if (member?.profile) {
          sessionUsername = member.profile.username || member.profile.id || username;
          memberProfileId = member.profile.id || sessionUsername;
          memberProfileName = member.profile.name || "";
        }
      }
    } catch {}
  }

  cookieStore.set(getAuthCookieName(role), createSessionToken(role, username), {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (role === "member") {
    const cleanName = memberProfileName || sessionUsername.split("@")[0] || sessionUsername || "Business Member";
    cookieStore.set("checkinfo_member_id", memberProfileId || sessionUsername.replace(/[^a-zA-Z0-9_-]/g, "") || "member", {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    cookieStore.set("checkinfo_member_name", cleanName, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  if (role === "user") {
    const cleanName = username.split("@")[0] || username || "User";
    cookieStore.set("checkinfo_user_auth", "true", {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    cookieStore.set("checkinfo_user_name", cleanName, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect(destinationFor(role));
}
