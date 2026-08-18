"use client";

export function SocialLoginButtons({
  role = "user",
  title = "Or sign in with",
}: {
  role?: "user" | "member";
  title?: string;
}) {
  function handleOAuthClick(provider: "google") {
    window.location.href = `/api/auth/oauth?provider=${provider}&role=${role}`;
  }

  return (
    <div className="social-auth-container" style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
      <p style={{ margin: "0 0 0.85rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.6rem" }}>
        <button
          type="button"
          onClick={() => handleOAuthClick("google")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "11px 14px",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#334155",
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "all 150ms ease",
          }}
          title="Sign in with Google"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  );
}
