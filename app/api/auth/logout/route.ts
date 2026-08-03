import { getAuthCookieName, type AuthRole } from "@/backend/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getRole(request: Request): AuthRole {
  const role = new URL(request.url).searchParams.get("role");
  if (role === "admin") return "admin";
  if (role === "user") return "user";
  return "member";
}

function logout() {
  return async (request: Request) => {
    const activeRole = getRole(request);
    const cookieStore = await cookies();
    cookieStore.delete(getAuthCookieName(activeRole));

    if (activeRole === "member") {
      cookieStore.delete("checkinfo_member_id");
      cookieStore.delete("checkinfo_member_name");
    }

    if (activeRole === "user") {
      cookieStore.delete("checkinfo_user_auth");
      cookieStore.delete("checkinfo_user_name");
    }

    const redirectPath = activeRole === "admin" ? "/admin/login" : activeRole === "user" ? "/?logout=success" : "/members/login";
    redirect(redirectPath);
  };
}

export const GET = logout();
export const POST = logout();
