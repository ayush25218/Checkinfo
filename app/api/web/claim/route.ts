import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { saveContactEnquiry } from "@/backend/mongodb";
import { assertCsrf, cleanText, csrfResponse, isEmail, isPhone, rateLimit, rateLimitResponse } from "@/backend/security";

export async function POST(request: Request) {
  try {
    const limited = rateLimit(request, "web:claim", 8, 60_000);
    if (!limited.ok) return rateLimitResponse(limited);
    if (!assertCsrf(request)) return csrfResponse();
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const businessName = cleanText(payload.businessName || "Business listing", 140);
    const name = cleanText(payload.name || "Business claimant", 120);
    const email = cleanText(payload.email || "", 160);
    const phone = cleanText(payload.phone || payload.contact || "", 20);
    const message = cleanText(payload.message || "Business claim request", 800);

    if (!name || (!isEmail(email) && !isPhone(phone))) {
      return Response.json(createResponse("Name and email/phone are required to claim a listing.", { ok: false }), { status: 400 });
    }

    const enquiry = await saveContactEnquiry({
      email,
      message: `${message}\n\nClaim listing: ${businessName}`,
      name,
      phone,
      subject: `Claim Request: ${businessName}`,
      type: "Business",
    });

    return Response.json(createResponse("Claim request submitted. Admin will verify ownership.", { enquiry, ok: true }));
  } catch (error) {
    console.error("Error in /api/web/claim:", error);
    return Response.json(createResponse("Claim request failed. Please try again.", { ok: false }), { status: 500 });
  }
}
