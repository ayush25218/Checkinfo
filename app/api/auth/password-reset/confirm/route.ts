import { createResponse } from "@/backend/checkinfo";
import { hashPassword } from "@/backend/auth";
import { rateLimit, rateLimitResponse, verifySecurityToken } from "@/backend/security";

export async function POST(request: Request) {
  const limited = rateLimit(request, "auth:password-reset-confirm", 8, 60_000);
  if (!limited.ok) return rateLimitResponse(limited);
  const payload = await request.json().catch(() => ({}));
  const resetId = String(payload.resetId || "");
  const resetCode = String(payload.resetCode || "");
  const password = String(payload.password || "");
  if (password.length < 8) {
    return Response.json(createResponse("Password must be at least 8 characters.", { ok: false }), { status: 400 });
  }
  const identifier = verifySecurityToken(resetId, resetCode, "password-reset");
  if (!identifier) {
    return Response.json(createResponse("Reset token is invalid or expired.", { ok: false }), { status: 400 });
  }
  try {
    const { getMongoMemberByUsernameOrEmail, isMongoConfigured, saveMongoMember } = await import("@/backend/mongodb");
    if (!isMongoConfigured()) throw new Error("MongoDB is not configured");
    const account = await getMongoMemberByUsernameOrEmail(identifier);
    if (!account) return Response.json(createResponse("Account not found.", { ok: false }), { status: 404 });
    account.passwordHash = hashPassword(password);
    account.passwordUpdatedAt = new Date().toISOString();
    account.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: "Your password was reset successfully.",
      time: new Date().toLocaleDateString("en-IN"),
      title: "Password Reset",
      unread: true,
    });
    await saveMongoMember(account);
    return Response.json(createResponse("Password reset successful.", { ok: true }));
  } catch {
    return Response.json(createResponse("Password reset database update failed.", { ok: false }), { status: 503 });
  }
}
