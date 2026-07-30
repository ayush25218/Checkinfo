import { NextResponse, type NextRequest } from "next/server";

function hasValidSession(request: NextRequest, name: string, role: "admin" | "member") {
  const token = request.cookies.get(name)?.value;
  const payload = token?.split(".")[0];

  if (!payload) return false;

  try {
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
    const data = JSON.parse(atob(padded)) as { exp?: number; role?: string };
    return data.role === role && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasValidSession(request, "checkinfo_admin_auth", "admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/members") && pathname !== "/members/login") {
    if (!hasValidSession(request, "checkinfo_member_auth", "member")) {
      return NextResponse.redirect(new URL("/members/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/members/:path*"],
};
