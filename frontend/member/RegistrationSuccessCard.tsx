"use client";

export function RegistrationSuccessCard({ email, name }: { email: string; name: string }) {
  const displayName = name.trim() || "Business Member";
  const displayEmail = email.trim() || "Registered Email";

  return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.3s ease-in-out" }}>
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0052cc 0%, #0080ff 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.2rem",
          margin: "0 auto 1.25rem",
          boxShadow: "0 10px 24px rgba(0, 82, 204, 0.3)",
        }}
      >
        ✓
      </div>

      <span
        style={{
          display: "inline-block",
          background: "#e0f2fe",
          color: "#0284c7",
          fontWeight: "800",
          fontSize: "0.82rem",
          padding: "5px 16px",
          borderRadius: "20px",
          marginBottom: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Registration Successful 🎉
      </span>

      <h2 style={{ fontSize: "1.85rem", color: "#0f172a", fontWeight: "800", margin: "0.25rem 0 0.75rem", lineHeight: "1.25" }}>
        Congratulations {displayName}!
      </h2>
      <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 auto 1.5rem", maxWidth: "420px" }}>
        Your Business Member Account has been successfully registered with Checkinfo. You can now log in to access your business panel.
      </p>

      {/* Credentials Summary Box */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px dashed #cbd5e1",
          borderRadius: "14px",
          padding: "1.25rem 1rem",
          textAlign: "left",
          margin: "1.5rem 0 2rem",
          display: "grid",
          gap: "10px",
          fontSize: "0.9rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Account Status:</span>
          <span style={{ color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            ✓ Registered & Active
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Login ID / Email:</span>
          <span style={{ color: "#0f172a", fontWeight: "700" }}>{displayEmail}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b", fontWeight: "600" }}>Password Status:</span>
          <span style={{ color: "#0052cc", fontWeight: "700" }}>•••••••• (Saved Securely)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gap: "12px" }}>
        <a
          href={`/members/login?email=${encodeURIComponent(displayEmail)}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "52px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0052cc 0%, #0080ff 100%)",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: "700",
            textDecoration: "none",
            boxShadow: "0 10px 24px rgba(0, 82, 204, 0.3)",
            transition: "transform 0.2s ease",
          }}
        >
          <span>Proceed to Business Member Login</span>
          <span style={{ fontSize: "1.1rem" }}>→</span>
        </a>

        <a
          href="/"
          style={{
            display: "block",
            padding: "10px",
            color: "#64748b",
            fontSize: "0.88rem",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          Return to Homepage
        </a>
      </div>
    </div>
  );
}
