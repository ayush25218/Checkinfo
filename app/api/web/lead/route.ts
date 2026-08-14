import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { saveContactEnquiry } from "@/backend/mongodb";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const name = String(payload.name || payload.fullName || payload.business_name || "Website Lead").trim();
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || payload.mobile || payload.contact || "").trim();
    const subject = String(payload.subject || payload.topic || "Business Callback Enquiry").trim();
    const message = String(payload.message || payload.details || payload.comment || "Lead request from website").trim();

    if (!name || (!phone && !email)) {
      return Response.json(
        createResponse("Name and contact number/email are required.", { ok: false }),
        { status: 400 }
      );
    }

    const savedEnquiry = await saveContactEnquiry({
      name,
      email,
      phone,
      subject: subject || "Business Callback Request",
      message,
      type: "Advertise",
    });

    return Response.json(
      createResponse("Enquiry received successfully! Admin and support team have been notified.", {
        ok: true,
        enquiry: savedEnquiry,
        nextStep: "Admin can view this in Admin Panel under Manage Advertise Enquiries.",
      })
    );
  } catch (error) {
    return Response.json(
      createResponse("Error submitting lead enquiry", { ok: false }),
      { status: 500 }
    );
  }
}
