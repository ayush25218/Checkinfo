import {
  createResponse,
  formDataToObject,
} from "@/backend/checkinfo";
import { getMemberState, handleMemberAction } from "@/backend/member";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";

  return Response.json({
    data: getMemberState(active),
    ok: true,
    resource: active,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { resource } = await params;
  const active = resource?.[0] ?? "profile";
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  return Response.json(
    createResponse("Member request processed", {
      data: handleMemberAction(active, payload),
      resource: active,
    }),
  );
}
