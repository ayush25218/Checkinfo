"use client";

import { useState, type FormEvent } from "react";

export function LeadCallbackForm() {
  const [form, setForm] = useState({ business_name: "", phone: "", email: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.business_name.trim() || (!form.phone.trim() && !form.email.trim())) {
      setStatus("error");
      setMsg("Name and phone/email are required.");
      return;
    }

    setStatus("sending");
    setMsg("Sending request...");

    try {
      const res = await fetch("/api/web/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMsg("Request Sent ✓");
        setForm({ business_name: "", phone: "", email: "" });
      } else {
        setStatus("error");
        setMsg(data.message || "Failed. Try Again.");
      }
    } catch {
      setStatus("error");
      setMsg("Connection error. Try Again.");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <strong>Get a callback</strong>
      <input
        name="business_name"
        placeholder="Business / Your name *"
        aria-label="Business name"
        value={form.business_name}
        onChange={(e) => setForm({ ...form, business_name: e.target.value })}
        required
      />
      <input
        name="phone"
        placeholder="Phone number *"
        aria-label="Phone number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email address (optional)"
        aria-label="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          background: status === "success" ? "#16a34a" : status === "error" ? "#dc2626" : undefined,
        }}
      >
        {status === "sending" ? "Sending..." : status === "success" ? "Request Sent ✓" : status === "error" ? msg : "Request Callback"}
      </button>
    </form>
  );
}
