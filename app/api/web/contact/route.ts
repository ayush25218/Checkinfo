import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { saveContactEnquiry } from "@/backend/mongodb";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const name = String(payload.name || payload.fullName || "").trim();
    const email = String(payload.email || "").trim();
    const phone = String(payload.phone || payload.mobile || payload.contact || "").trim();
    const subject = String(payload.subject || payload.topic || "General Enquiry").trim();
    const message = String(payload.message || payload.details || "").trim();

    if (!name || (!phone && !email) || !message) {
      return Response.json(
        createResponse("Name, message, and contact (phone or email) are required.", { ok: false }),
        { status: 400 }
      );
    }

    const savedEnquiry = await saveContactEnquiry({
      name,
      email,
      phone,
      subject,
      message,
      type: "Contact",
    });

    return Response.json(
      createResponse("Enquiry submitted successfully! Our team will contact you shortly.", {
        ok: true,
        enquiry: savedEnquiry,
      })
    );
  } catch (error) {
    return Response.json(
      createResponse("Error submitting contact enquiry.", { ok: false }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(createResponse("Contact API is active and ready.", { ok: true, status: "healthy" }));
}
