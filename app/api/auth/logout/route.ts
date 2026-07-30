import { getAuthCookieName, type AuthRole } from "@/backend/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getRole(request: Request): AuthRole {
  const role = new URL(request.url).searchParams.get("role");
  return role === "admin" ? "admin" : "member";
}

function logout(role: AuthRole) {
  return async (request: Request) => {
    const activeRole = getRole(request);
    const cookieStore = await cookies();
    cookieStore.delete(getAuthCookieName(activeRole));

    if (activeRole === "member") {
      cookieStore.delete("checkinfo_member_id");
    }

    redirect(activeRole === "admin" ? "/admin/login" : "/members/login");
  };
}

export const GET = logout("member");
export const POST = logout("member");
