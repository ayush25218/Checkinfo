import { createResponse } from "@/backend/checkinfo";
import { issueSecurityToken, isEmail, rateLimit, rateLimitResponse } from "@/backend/security";

export async function POST(request: Request) {
  const limited = rateLimit(request, "auth:password-reset-request", 5, 60_000);
  if (!limited.ok) return rateLimitResponse(limited);
  const payload = await request.json().catch(() => ({}));
  const email = String(payload.email || payload.username || "").trim().toLowerCase();
  if (!isEmail(email)) {
    return Response.json(createResponse("Valid email is required.", { ok: false }), { status: 400 });
  }
  const token = issueSecurityToken(email, "password-reset", 20 * 60_000);
  return Response.json(createResponse("Password reset token generated.", {
    expiresAt: token.expiresAt,
    ok: true,
    resetCode: token.code,
    resetId: token.id,
  }));
}
