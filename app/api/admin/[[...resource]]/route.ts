import {
  adminGroups,
  createResponse,
  formDataToObject,
  getAdminPage,
} from "@/backend/checkinfo";
import { getAdminResource, handleAdminAction } from "@/backend/directoryStore";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const filters = Object.fromEntries(new URL(request.url).searchParams.entries());

  return Response.json({
    data: getAdminResource(active),
    filters,
    groups: adminGroups,
    ok: true,
    page: getAdminPage(active),
    resource: active,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  return Response.json(
    createResponse("Admin action queued", {
      data: handleAdminAction(active, payload),
      resource: active,
    }),
  );
}
