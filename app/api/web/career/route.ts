import { NextResponse } from "next/server";
import { saveContactEnquiry } from "@/backend/mongodb";
import { createResponse, formDataToObject } from "@/backend/checkinfo";

export async function POST(req: Request) {
  try {
    let payload;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      payload = formDataToObject(await req.formData());
    }

    const { name, email, phone, position, resumeUrl, message } = payload;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const combinedMessage = `Position: ${position || "Not specified"}\nResume: ${resumeUrl || "None provided"}\n\n${message || ""}`;

    await saveContactEnquiry({
      type: "Career",
      subject: `Career Application: ${position || "Other"}`,
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : "",
      message: combinedMessage,
    });

    return NextResponse.json(createResponse("Application submitted successfully"));
  } catch (error) {
    console.error("Career form error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
