import {
  createResponse,
  formDataToObject,
} from "@/backend/checkinfo";
import { getAuthCookieName, verifySessionToken } from "@/backend/auth";
import { getMemberId, getMemberStateAsync, handleMemberActionAsync } from "@/backend/directoryStore";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

async function requireMemberAuth() {
  const token = (await cookies()).get(getAuthCookieName("member"))?.value;
  return verifySessionToken(token, "member");
}

export async function GET(request: Request, { params }: RouteContext) {
  if (!(await requireMemberAuth())) {
    return Response.json({ ok: false, message: "Member login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const memberId = getMemberId(request);

  return Response.json({
    data: await getMemberStateAsync(memberId, active),
    memberId,
    ok: true,
    resource: active,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await requireMemberAuth())) {
    return Response.json({ ok: false, message: "Member login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "profile";
  const memberId = getMemberId(request);
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  return Response.json(
    createResponse("Member request processed", {
      data: await handleMemberActionAsync(memberId, active, payload),
      memberId,
      resource: active,
    }),
  );
}
