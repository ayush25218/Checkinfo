import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET() {
  const token = crypto.randomBytes(24).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set("checkinfo_csrf", token, {
    httpOnly: false,
    maxAge: 60 * 60 * 6,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return Response.json({ ok: true, token });
}
