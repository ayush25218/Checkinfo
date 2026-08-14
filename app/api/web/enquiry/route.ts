import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { addEnquiryToMemberAsync } from "@/backend/directoryStore";
import { saveContactEnquiry } from "@/backend/mongodb";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const ownerId = String(payload.ownerId || payload.owner || "").trim();
    const name = String(payload.name || payload.visitorName || "Website Visitor").trim();
    const email = String(payload.email || "").trim();
    const contact = String(payload.phone || payload.contact || payload.mobile || "").trim();
    const message = String(payload.message || payload.details || "Business enquiry from website").trim();
    const businessName = String(payload.businessName || payload.listing || "").trim();
    const subject = businessName ? `Enquiry for: ${businessName}` : "Business Listing Enquiry";

    if (!name && !email && !contact) {
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

