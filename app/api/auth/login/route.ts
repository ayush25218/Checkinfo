import { createSessionToken, getAuthCookieName, validCredentialsAsync, type AuthRole } from "@/backend/auth";
import { rateLimit } from "@/backend/security";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function isAuthRole(value: FormDataEntryValue | null): value is AuthRole {
  return value === "admin" || value === "subadmin" || value === "member" || value === "user";
}

function destinationFor(role: AuthRole) {
  if (role === "admin" || role === "subadmin") return "/admin";
  if (role === "user") return "/?login=success";
  return "/members/myaccount";
}

function loginPath(role: AuthRole, error = "") {
  const path = role === "admin" || role === "subadmin" ? "/admin/login" : role === "user" ? "/login" : "/members/login";
  return error ? `${path}?error=${encodeURIComponent(error)}` : path;
}

function readLoginField(formData: FormData, names: string[]) {
  for (const name of names) {
    const value = formData.get(name);
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "auth:login", 20, 60_000);
  if (!limited.ok) redirect("/members/login?error=Too many login attempts. Try again shortly.");

  let roleStr = "member";
  let username = "";
  let password = "";

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      roleStr = String(body.role || "member").trim();
      username = String(body.username || body.member_username || body.admin_username || body.email || "").trim();
      password = String(body.password || body.member_password || body.admin_password || "");
    } catch {}
  } else {
    const formData = await request.formData();
    roleStr = String(formData.get("role") || "member").trim();
    username =
      roleStr === "member"
        ? readLoginField(formData, ["member_username", "username", "email"])
        : roleStr === "admin" || roleStr === "subadmin"
          ? readLoginField(formData, ["admin_username", "username", "email"])
          : readLoginField(formData, ["username", "email"]);
    password =
      roleStr === "member"
        ? readLoginField(formData, ["member_password", "password"])
        : roleStr === "admin" || roleStr === "subadmin"
          ? readLoginField(formData, ["admin_password", "password"])
          : readLoginField(formData, ["password"]);
  }

  const role: AuthRole = isAuthRole(roleStr) ? roleStr : "member";

  if (!username || !password) {
    redirect(loginPath(role, "Please enter both username/email and password"));
  }

  if (!(await validCredentialsAsync(role, username, password))) {
    redirect(loginPath(role, "Invalid username or password"));
  }

  const cookieStore = await cookies();
  let sessionUsername = username;
  let memberProfileName = "";
  let memberProfileId = "";

  if (role === "member") {
    try {
      const { getMongoMemberByUsernameOrEmail, getMongoUserByUsernameOrEmail, isMongoConfigured } = await import("@/backend/mongodb");
      if (isMongoConfigured()) {
        const member = (await getMongoMemberByUsernameOrEmail(username)) || (await getMongoUserByUsernameOrEmail(username));
        if ((member as Record<string, any>)?.profile) {
          sessionUsername = (member as Record<string, any>).profile.username || (member as Record<string, any>).profile.id || username;
          memberProfileId = (member as Record<string, any>).profile.id || sessionUsername;
          memberProfileName = (member as Record<string, any>).profile.name || "";
        } else if ((member as Record<string, any>)?._id) {
          sessionUsername = (member as Record<string, any>).username || (member as Record<string, any>).email || username;
          memberProfileId = String((member as Record<string, any>)._id);
          memberProfileName = (member as Record<string, any>).name || "";
        }
      }
    } catch {}
  }

  cookieStore.set(getAuthCookieName(role), createSessionToken(role, sessionUsername), {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (role === "member") {
    const cleanName = memberProfileName || sessionUsername.split("@")[0] || sessionUsername || "Business Member";
    cookieStore.set("checkinfo_member_id", memberProfileId || sessionUsername.replace(/[^a-zA-Z0-9_-]/g, "") || "member", {
      maxAge: 60 * 60 * 12,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    cookieStore.set("checkinfo_member_name", cleanName, {
      httpOnly: false,
      maxAge: 60 * 60 * 12,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  if (role === "user") {
    const cleanName = username.split("@")[0] || username || "User";
    cookieStore.set("checkinfo_user_auth", "true", {
      httpOnly: false,
      maxAge: 60 * 60 * 12,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    cookieStore.set("checkinfo_user_name", cleanName, {
      httpOnly: false,
      maxAge: 60 * 60 * 12,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect(destinationFor(role));
}
