import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { addEnquiryToMemberAsync } from "@/backend/directoryStore";
import { saveContactEnquiry } from "@/backend/mongodb";
import { assertCsrf, cleanText, csrfResponse, isEmail, isPhone, rateLimit, rateLimitResponse } from "@/backend/security";

export async function POST(request: Request) {
  try {
    const limited = rateLimit(request, "web:enquiry", 20, 60_000);
    if (!limited.ok) return rateLimitResponse(limited);
    if (!assertCsrf(request)) return csrfResponse();
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const ownerId = cleanText(payload.ownerId || payload.owner || "", 100);
    const name = cleanText(payload.name || payload.visitorName || "Website Visitor", 120);
    const email = cleanText(payload.email || "", 160);
    const contact = cleanText(payload.phone || payload.contact || payload.mobile || "", 20);
    const message = cleanText(payload.message || payload.details || "Business enquiry from website", 900);
    const businessName = cleanText(payload.businessName || payload.listing || "", 140);
    const subject = businessName ? `Enquiry for: ${businessName}` : "Business Listing Enquiry";

    if (!name || (!isEmail(email) && !isPhone(contact))) {
      return Response.json(
        createResponse("Please provide your name and contact details.", { ok: false }),
        { status: 400 }
      );
    }

    // 1. Save to global enquiries collection → visible in Admin "Manage Business Enquiries"
    const savedEnquiry = await saveContactEnquiry({
      name,
      email,
      phone: contact,
      subject,
      message,
      type: "Business",
    });

    // 2. Push to specific business owner's member panel (if ownerId known)
    let memberEnquiry = null;
    if (ownerId && ownerId !== "member-default") {
      try {
        memberEnquiry = await addEnquiryToMemberAsync(ownerId, { contact, email, message, name });
      } catch {
        // Non-critical — admin already has the enquiry
      }
    }

    return Response.json(
      createResponse("Business enquiry sent successfully! The owner has been notified.", {
        ok: true,
        enquiry: savedEnquiry,
        memberEnquiry,
      }),
    );
  } catch (error) {
    console.error("Error in /api/web/enquiry:", error);
    return Response.json(
      createResponse("Failed to submit enquiry. Please try again.", { ok: false }),
      { status: 500 }
    );
  }
}
