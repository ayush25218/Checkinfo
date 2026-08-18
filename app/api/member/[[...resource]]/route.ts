import {
  createResponse,
  formDataToObject,
} from "@/backend/checkinfo";
import { getAuthCookieName, readSessionToken } from "@/backend/auth";
import { getMemberStateAsync, handleMemberActionAsync } from "@/backend/directoryStore";
import { assertCsrf, csrfResponse, rateLimit, rateLimitResponse } from "@/backend/security";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{ resource?: string[] }>;
};

async function requireMemberAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName("member"))?.value;
  return readSessionToken(token, "member");
}

async function getSessionMemberId(username: string) {
  try {
    const { getMongoMemberByUsernameOrEmail, getMongoUserByUsernameOrEmail, isMongoConfigured } = await import("@/backend/mongodb");
    if (isMongoConfigured()) {
      const member = (await getMongoMemberByUsernameOrEmail(username)) || (await getMongoUserByUsernameOrEmail(username));
      if ((member as Record<string, any>)?.profile?.id) return (member as Record<string, any>).profile.id;
      if ((member as Record<string, any>)?._id) return String((member as Record<string, any>)._id);
    }
  } catch {}
  return username.replace(/[^a-zA-Z0-9_-]/g, "") || "member";
}

export async function GET(request: Request, { params }: RouteContext) {
  const session = await requireMemberAuth();
  if (!session) {
    return Response.json({ ok: false, message: "Member login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "dashboard";
  const memberId = await getSessionMemberId(session.username);

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
  const limited = rateLimit(request, "member:write", 90, 60_000);
  if (!limited.ok) return rateLimitResponse(limited);
  if (!assertCsrf(request)) return csrfResponse();
  const session = await requireMemberAuth();
  if (!session) {
    return Response.json({ ok: false, message: "Member login required" }, { status: 401 });
  }

  const { resource } = await params;
  const active = resource?.[0] ?? "profile";
  const memberId = await getSessionMemberId(session.username);
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
