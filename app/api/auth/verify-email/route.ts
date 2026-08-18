import { createResponse } from "@/backend/checkinfo";
import { isEmail, issueSecurityToken, rateLimit, rateLimitResponse, verifySecurityToken } from "@/backend/security";

export async function POST(request: Request) {
  const limited = rateLimit(request, "auth:verify-email", 8, 60_000);
  if (!limited.ok) return rateLimitResponse(limited);
  const payload = await request.json().catch(() => ({}));
  const email = String(payload.email || "").trim().toLowerCase();
  const verificationId = String(payload.verificationId || "");
  const code = String(payload.code || "");

  if (verificationId && code) {
    const verified = verifySecurityToken(verificationId, code, "email");
    return Response.json(createResponse(verified ? "Email verified." : "Invalid email verification code.", { ok: Boolean(verified), verifiedEmail: verified }), { status: verified ? 200 : 400 });
  }

  if (!isEmail(email)) return Response.json(createResponse("Valid email is required.", { ok: false }), { status: 400 });
  const token = issueSecurityToken(email, "email", 20 * 60_000);
  return Response.json(createResponse("Email verification code generated.", { code: token.code, expiresAt: token.expiresAt, ok: true, verificationId: token.id }));
}
