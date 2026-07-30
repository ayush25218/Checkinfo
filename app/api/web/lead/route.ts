import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { saveAdvertisingLead } from "@/backend/mongodb";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());
  const savedLead = await saveAdvertisingLead(payload);

  return Response.json(
    createResponse("Advertising lead received", {
      lead: payload,
      persisted: Boolean(savedLead),
      nextStep: "Admin can review this under Manage Advertise Enquiries.",
    }),
  );
}
