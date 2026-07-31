import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { addEnquiryToMemberAsync } from "@/backend/directoryStore";
import { saveAdvertisingLead } from "@/backend/mongodb";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  const ownerId = String(payload.ownerId || payload.owner || "member-default");
  const name = String(payload.name || "Buyer Lead");
  const email = String(payload.email || "");
  const contact = String(payload.phone || payload.contact || payload.mobile || "");
  const message = String(payload.message || payload.details || "Business enquiry from website");

  const memberEnquiry = await addEnquiryToMemberAsync(ownerId, { contact, email, message, name });
  await saveAdvertisingLead({ ...payload, type: "Business" }, "business-enquiry-form");

  return Response.json(
    createResponse("Business enquiry sent successfully", {
      enquiry: memberEnquiry,
      ok: true,
    }),
  );
}
