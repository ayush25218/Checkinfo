import { createResponse, formDataToObject } from "@/backend/checkinfo";
import { addReviewToMemberAsync } from "@/backend/directoryStore";
import { assertCsrf, cleanText, csrfResponse, rateLimit, rateLimitResponse } from "@/backend/security";

export async function POST(request: Request) {
  try {
    const limited = rateLimit(request, "web:review", 10, 60_000);
    if (!limited.ok) return rateLimitResponse(limited);
    if (!assertCsrf(request)) return csrfResponse();
    const contentType = request.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await request.json()
      : formDataToObject(await request.formData());

    const ownerId = cleanText(payload.ownerId || payload.owner || "member-default", 100);
    const author = cleanText(payload.author || payload.name || "Customer Reviewer", 120);
    const message = cleanText(payload.message || payload.review || "", 800);
    const rating = Math.min(5, Math.max(1, Number(payload.rating || 5)));
    if (!author || !message) {
      return Response.json(createResponse("Name and review message are required.", { ok: false }), { status: 400 });
    }

    const memberReview = await addReviewToMemberAsync(ownerId, { author, message, rating });

    return Response.json(
      createResponse("Customer review submitted successfully", {
        ok: true,
        review: memberReview,
      }),
    );
  } catch (error) {
    console.error("Error in /api/web/review:", error);
    return Response.json(
      createResponse("Review database is currently unavailable. Please try again later.", { ok: false }),
      { status: 503 },
    );
  }
}
