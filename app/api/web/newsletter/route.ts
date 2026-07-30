import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { saveNewsletterSubscription } from "@/backend/mongodb";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());
  const email = String(payload.subscriber_email ?? payload.email ?? "");
  const savedSubscriber = await saveNewsletterSubscription(email);

  return Response.json(
    createResponse("Newsletter subscription saved", {
      persisted: Boolean(savedSubscriber),
      subscriber: email,
    }),
  );
}
