import { createResponse } from "@/backend/checkinfo";
import { isPhone, issueSecurityToken, rateLimit, rateLimitResponse, verifySecurityToken } from "@/backend/security";

export async function POST(request: Request) {
  const limited = rateLimit(request, "auth:verify-phone", 8, 60_000);
  if (!limited.ok) return rateLimitResponse(limited);
  const payload = await request.json().catch(() => ({}));
  const phone = String(payload.phone || "").replace(/\D/g, "").slice(-10);
  const otpId = String(payload.otpId || "");
  const code = String(payload.code || "");

  if (otpId && code) {
    const verified = verifySecurityToken(otpId, code, "otp");
    return Response.json(createResponse(verified ? "Phone verified." : "Invalid OTP.", { ok: Boolean(verified), verifiedPhone: verified }), { status: verified ? 200 : 400 });
  }

  if (!isPhone(phone)) return Response.json(createResponse("Valid Indian mobile number is required.", { ok: false }), { status: 400 });
  const token = issueSecurityToken(phone, "otp", 10 * 60_000);
  return Response.json(createResponse("Phone OTP generated.", { expiresAt: token.expiresAt, ok: true, otp: token.code, otpId: token.id }));
}
