import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("checkinfo_member_auth")?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }

  const payload = token.split(".")[0];
  if (!payload) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const data = JSON.parse(atob(padded)) as { exp?: number; role?: string };
    
    if (data.role === "member" && typeof data.exp === "number" && data.exp > Date.now()) {
      const name = cookieStore.get("checkinfo_member_name")?.value || "";
      return NextResponse.json({ loggedIn: true, name });
    }
  } catch {}

  return NextResponse.json({ loggedIn: false });
}
