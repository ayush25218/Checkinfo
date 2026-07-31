import { searchDirectory } from "@/backend/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "";
  const q = url.searchParams.get("q") ?? url.searchParams.get("keyword2") ?? "";
  const location = url.searchParams.get("location") ?? "";
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radius = Number(url.searchParams.get("radius"));
  const results = await searchDirectory({
    category,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    location,
    q,
    radius: Number.isFinite(radius) ? radius : undefined,
  });

  return Response.json(results);
}
