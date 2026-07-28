import { categories, searchListings } from "@/backend/checkinfo";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? url.searchParams.get("keyword2") ?? "";
  const location = url.searchParams.get("location") ?? "";
  const results = searchListings(q, location);

  return Response.json({
    categories,
    count: results.length,
    listings: results,
    ok: true,
    query: { location, q },
  });
}
