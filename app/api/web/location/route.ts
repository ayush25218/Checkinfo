function decodeHeaderValue(value: string | null) {
  if (!value) return "";

  try {
    return decodeURIComponent(value).replace(/\+/g, " ");
  } catch {
    return value.replace(/\+/g, " ");
  }
}

export function GET(request: Request) {
  const headers = request.headers;
  const city = decodeHeaderValue(headers.get("x-vercel-ip-city") ?? headers.get("cf-ipcity"));
  const region = decodeHeaderValue(headers.get("x-vercel-ip-country-region") ?? headers.get("cf-region"));
  const country = decodeHeaderValue(headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"));
  const latitude = decodeHeaderValue(headers.get("x-vercel-ip-latitude"));
  const longitude = decodeHeaderValue(headers.get("x-vercel-ip-longitude"));

  return Response.json({
    city,
    country,
    latitude,
    longitude,
    ok: Boolean(city || region || latitude || longitude),
    region,
    source: "ip",
  });
}
