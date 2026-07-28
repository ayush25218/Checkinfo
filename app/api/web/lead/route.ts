import { createResponse, formDataToObject } from "@/backend/checkinfo";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  return Response.json(
    createResponse("Advertising lead received", {
      lead: payload,
      nextStep: "Admin can review this under Manage Advertise Enquiries.",
    }),
  );
}
