import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { saveContactEnquiry } from "@/backend/mongodb";
import { assertCsrf, cleanText, csrfResponse, rateLimit, rateLimitResponse } from "@/backend/security";

export async function POST(request: Request) {
  try {
    const limited = rateLimit(request, "web:report", 12, 60_000);
    if (!limited.ok) return rateLimitResponse(limited);
    if (!assertCsrf(request)) return csrfResponse();
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const businessName = cleanText(payload.businessName || "Business listing", 140);
    const issue = cleanText(payload.issue || "Incorrect listing information", 800);
    const name = cleanText(payload.name || "Website visitor", 120);
    const email = cleanText(payload.email || "", 160);
    const phone = cleanText(payload.phone || payload.contact || "", 20);

    const enquiry = await saveContactEnquiry({
      email,
      message: `Reported issue: ${issue}\n\nListing: ${businessName}`,
      name,
      phone,
      subject: `Incorrect Listing Report: ${businessName}`,
      type: "Business",
    });

    return Response.json(createResponse("Report submitted. Checkinfo team will review this listing.", { enquiry, ok: true }));
  } catch (error) {
    console.error("Error in /api/web/report:", error);
    return Response.json(createResponse("Report failed. Please try again.", { ok: false }), { status: 500 });
  }
}
