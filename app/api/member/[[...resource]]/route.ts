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

async function requireMemberAuth(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName("member"))?.value;
  if (verifySessionToken(token, "member")) return true;

  const memberId = getMemberId(request);
  if (memberId && memberId !== "member-default" && memberId.length > 2) return true;

  return false;
}

export async function GET(request: Request, { params }: RouteContext) {
  if (!(await requireMemberAuth(request))) {
    return Response.json({ ok: false, message: "Member login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const memberId = getMemberId(request);

  try {
    return Response.json({
      data: await getMemberStateAsync(memberId, active),
      memberId,
      ok: true,
      resource: active,
    });
  } catch (error) {
    console.error("Member API read failed", error);
    return Response.json({
      data: null,
      memberId,
      message: "Member database is currently unavailable. Please try again after database connection is fixed.",
      ok: false,
      resource: active,
    }, { status: 503 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await requireMemberAuth(request))) {
    return Response.json({ ok: false, message: "Member login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "profile";
  const memberId = getMemberId(request);
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  try {
    return Response.json(
      createResponse("Member request processed", {
        data: await handleMemberActionAsync(memberId, active, payload),
        memberId,
        resource: active,
      }),
    );
  } catch (error) {
    console.error("Member API write failed", error);
    return Response.json({
      data: null,
      memberId,
      message: "Member database is currently unavailable. Your changes were not saved.",
      ok: false,
      resource: active,
    }, { status: 503 });
  }
}
