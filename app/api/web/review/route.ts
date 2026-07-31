import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { addReviewToMemberAsync } from "@/backend/directoryStore";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : formDataToObject(await request.formData());

  const ownerId = String(payload.ownerId || payload.owner || "member-default");
  const author = String(payload.author || payload.name || "Customer Reviewer");
  const message = String(payload.message || payload.review || "");
  const rating = Number(payload.rating || 5);

  const memberReview = await addReviewToMemberAsync(ownerId, { author, message, rating });

  return Response.json(
    createResponse("Customer review submitted successfully", {
      ok: true,
      review: memberReview,
    }),
  );
}
