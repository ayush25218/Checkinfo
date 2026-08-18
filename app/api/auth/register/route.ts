import { NextResponse } from "next/server";
import { hashPassword } from "@/backend/auth";
import { createMongoMember, isMongoConfigured } from "@/backend/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Business owner name must be at least 2 characters" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email address is required" }, { status: 400 });
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ ok: false, error: "Phone number must be at least 10 digits" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (isMongoConfigured()) {
      try {
        await createMongoMember({
          email,
          name,
          passwordHash: hashPassword(password),
          phone,
          username: email,
        });
      } catch (error) {
        const errStr = String(error);
        if (errStr.includes("EMAIL_ALREADY_EXISTS")) {
          return NextResponse.json({ ok: false, error: "This email address is already registered. Please login or use a different email." }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ ok: true, email });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Server error during registration" }, { status: 500 });
  }
}
