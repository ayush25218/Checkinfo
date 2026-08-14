"use client";

import { useState } from "react";

export function CareerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/web/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error || "Failed to submit application");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error occurred");
      setStatus("error");
    }
  };

  if (status === "success") {
    return <div style={{ padding: "2rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
      <h3>Application Submitted Successfully!</h3>
      <p style={{ marginTop: "1rem" }}>Thank you for your interest. We will get back to you soon.</p>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Full Name *</label>
        <input name="name" required style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Email *</label>
        <input type="email" name="email" required style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Phone *</label>
        <input type="tel" name="phone" required style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Position Applied For *</label>
        <select name="position" required style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }}>
          <option value="Business Development Executive">Business Development Executive</option>
          <option value="Digital Marketing Associate">Digital Marketing Associate</option>
          <option value="Customer Support Executive">Customer Support Executive</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Resume Link / Portfolio URL</label>
        <input type="url" name="resumeUrl" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Cover Message *</label>
        <textarea name="message" required rows={4} style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </div>
      {status === "error" && <p style={{ color: "#f44336" }}>{errorMsg}</p>}
      <button type="submit" disabled={status === "loading"} style={{ padding: "0.75rem", borderRadius: "4px", border: "none", background: "#0070f3", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
        {status === "loading" ? "Submitting..." : "Apply Now"}
      </button>
    </form>
  );
}
