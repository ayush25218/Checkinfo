import {
  createResponse,
  formDataToObject,
} from "@/backend/checkinfo";
import { getMemberId, getMemberState, handleMemberAction } from "@/backend/directoryStore";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const memberId = getMemberId(request);

  return Response.json({
    data: getMemberState(memberId, active),
    memberId,
    ok: true,
    resource: active,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { resource } = await params;
  const active = resource?.[0] ?? "profile";
  const memberId = getMemberId(request);
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  return Response.json(
    createResponse("Member request processed", {
      data: handleMemberAction(memberId, active, payload),
      memberId,
      resource: active,
    }),
  );
}
