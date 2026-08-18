export const dynamic = "force-dynamic";
import {
  adminGroups,
  canAccessAdminResource,
  createResponse,
  filterAdminGroupsByPermissions,
  formDataToObject,
  getAdminPage,
} from "@/backend/checkinfo";
import { getAdminResourceAsync, handleAdminActionAsync } from "@/backend/directoryStore";
import { getAuthCookieName, readSessionToken } from "@/backend/auth";
import { assertCsrf, csrfResponse, rateLimit, rateLimitResponse } from "@/backend/security";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

type AdminApiSession = {
  permissions: string[] | "all";
  role: "admin" | "subadmin";
  username: string;
};

async function requireAdminAuth(): Promise<AdminApiSession | false> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(getAuthCookieName("admin"))?.value;
  const adminSession = readSessionToken(adminToken, "admin");
  if (adminSession) {
    return { permissions: "all", role: "admin", username: adminSession.username || "admin" };
  }

  const subadminToken = cookieStore.get(getAuthCookieName("subadmin"))?.value;
  const subadminSession = readSessionToken(subadminToken, "subadmin");
  if (!subadminSession) return false;

  try {
    const { getMongoSubadminByUsernameOrEmail, isMongoConfigured } = await import("@/backend/mongodb");
    if (!isMongoConfigured()) return false;
    const subadmin = await getMongoSubadminByUsernameOrEmail(subadminSession.username);
    if (!subadmin || subadmin.status !== "Active") return false;
    return {
      permissions: Array.isArray(subadmin.permissions) ? subadmin.permissions : ["dashboard"],
      role: "subadmin",
      username: subadmin.username || subadminSession.username,
    };
  } catch {
    return false;
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const session = await requireAdminAuth();
  if (!session) {
    return Response.json({ ok: false, message: "Admin login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const filters = Object.fromEntries(new URL(request.url).searchParams.entries());
  if (!canAccessAdminResource(active, session.permissions)) {
    return Response.json({ ok: false, message: "Permission denied" }, { status: 403 });
  }

  try {
    return Response.json({
      data: await getAdminResourceAsync(active),
      filters,
      groups: filterAdminGroupsByPermissions(session.permissions),
      ok: true,
      page: getAdminPage(active),
      resource: active,
      session: { role: session.role, username: session.username },
    });
  } catch (error) {
    console.error("Admin API read failed", error);
    return Response.json({
      data: null,
      filters,
      groups: filterAdminGroupsByPermissions(session.permissions),
      message: "Admin database is currently unavailable. Please try again after database connection is fixed.",
      ok: false,
      page: getAdminPage(active),
      resource: active,
    }, { status: 503 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const limited = rateLimit(request, "admin:write", 120, 60_000);
  if (!limited.ok) return rateLimitResponse(limited);
  if (!assertCsrf(request)) return csrfResponse();
  const session = await requireAdminAuth();
  if (!session) {
    return Response.json({ ok: false, message: "Admin login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  if (!canAccessAdminResource(active, session.permissions)) {
    return Response.json({ ok: false, message: "Permission denied" }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());
  const actionPayload = {
    ...payload,
    __actorId: session.username || "admin",
    __actorRole: session.role,
  };

  try {
    return Response.json(
      createResponse("Admin action queued", {
        data: await handleAdminActionAsync(active, actionPayload),
        resource: active,
      }),
    );
  } catch (error) {
    console.error("Admin API write failed", error);
    return Response.json({
      data: null,
      message: "Admin database is currently unavailable. Your changes were not saved.",
      ok: false,
      resource: active,
    }, { status: 503 });
  }
}
