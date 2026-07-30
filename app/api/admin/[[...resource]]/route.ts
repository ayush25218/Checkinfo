import {
  adminGroups,
  createResponse,
  formDataToObject,
  getAdminPage,
} from "@/backend/checkinfo";
import { getAdminResourceAsync, handleAdminActionAsync } from "@/backend/directoryStore";
import { getAuthCookieName, verifySessionToken } from "@/backend/auth";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

async function requireAdminAuth() {
  const token = (await cookies()).get(getAuthCookieName("admin"))?.value;
  return verifySessionToken(token, "admin");
}

export async function GET(request: Request, { params }: RouteContext) {
  if (!(await requireAdminAuth())) {
    return Response.json({ ok: false, message: "Admin login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const filters = Object.fromEntries(new URL(request.url).searchParams.entries());

  return Response.json({
    data: await getAdminResourceAsync(active),
    filters,
    groups: adminGroups,
    ok: true,
    page: getAdminPage(active),
    resource: active,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await requireAdminAuth())) {
    return Response.json({ ok: false, message: "Admin login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  return Response.json(
    createResponse("Admin action queued", {
      data: await handleAdminActionAsync(active, payload),
      resource: active,
    }),
  );
}
