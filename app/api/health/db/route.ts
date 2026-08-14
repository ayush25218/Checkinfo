import { getMongoHealth } from "@/backend/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getMongoHealth();

  return Response.json(health, {
    headers: {
      "Cache-Control": "no-store",
    },
    status: health.ok ? 200 : 503,
  });
}
