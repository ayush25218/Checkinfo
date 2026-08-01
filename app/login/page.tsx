import { getExpectedCredentials } from "@/backend/auth";

export default async function VisitorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const demo = getExpectedCredentials("user");

  return (
    <main className="auth-page auth-page-user" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "1.5rem" }}>
      <section className="auth-card" style={{ maxWidth: "420px", width: "100%", padding: "2rem", background: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
        <a className="brand" href="/" style={{ textDecoration: "none", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <span style={{ background: "#0284c7", color: "#fff", width: "38px", height: "38px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>CI</span>
          <span>
            <strong style={{ display: "block", fontSize: "1.2rem" }}>Checkinfo</strong>
            <small style={{ color: "#64748b" }}>Visitor Login</small>
          </span>
        </a>
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow" style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#0284c7", fontWeight: "700" }}>Site Visitor Account</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0.25rem 0" }}>User Login</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
            Sign in as a website visitor to browse businesses, save searches, and leave reviews.
          </p>
        </div>
        
        {error ? <p className="auth-error" style={{ background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p> : null}
        
        <form className="auth-form" action="/api/auth/login" method="post" autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input name="role" type="hidden" value="user" />
          <input type="text" name="fake_username_remember" style={{ display: "none" }} tabIndex={-1} />
          <input type="password" name="fake_password_remember" style={{ display: "none" }} tabIndex={-1} />
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: "500" }}>
            <span>Username / Email</span>
            <input autoComplete="off" name="username" placeholder="Enter username or email" required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: "500" }}>
            <span>Password</span>
            <input autoComplete="new-password" name="password" placeholder="Enter password" required type="password" style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }} />
          </label>
          <button type="submit" style={{ padding: "0.75rem", borderRadius: "6px", background: "#0284c7", color: "#fff", fontWeight: "600", border: "none", cursor: "pointer", fontSize: "1rem" }}>
            Login as Visitor
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
          <span>Looking to list your business? </span>
          <a href="/members/login" style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>List Your Business Login</a>
        </div>
      </section>
    </main>
  );
}
