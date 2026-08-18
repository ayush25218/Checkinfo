import { type AuthRole } from "@/backend/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getRole(request: Request): AuthRole {
  const role = new URL(request.url).searchParams.get("role");
  if (role === "admin") return "admin";
  if (role === "subadmin") return "subadmin";
  if (role === "user") return "user";
  return "member";
}

function logout() {
  return async (request: Request) => {
    const activeRole = getRole(request);
    const cookieStore = await cookies();

    const allAuthCookies = [
      "checkinfo_admin_auth",
      "checkinfo_subadmin_auth",
      "checkinfo_member_auth",
      "checkinfo_user_auth",
      "checkinfo_member_id",
      "checkinfo_member_name",
      "checkinfo_user_name",
    ];

    for (const cookieName of allAuthCookies) {
      try {
        cookieStore.delete({
          name: cookieName,
          path: "/",
        });
      } catch {}
    }

    const redirectPath =
      activeRole === "admin"
        ? "/admin/login"
        : activeRole === "subadmin"
        ? "/admin/login"
        : activeRole === "user"
        ? "/?logout=success"
        : "/members/login";

    redirect(redirectPath);
  };
}

export const GET = logout();
export const POST = logout();
