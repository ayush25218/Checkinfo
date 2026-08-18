import { hashPassword } from "@/backend/auth";
import { createMongoUser, isMongoConfigured } from "@/backend/mongodb";
import { PasswordFieldWithToggle } from "@/frontend/web/PasswordFieldWithToggle";
import { SocialLoginButtons } from "@/frontend/web/SocialLoginButtons";
import { redirect } from "next/navigation";

export default function UserRegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="auth-page auth-page-user" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "1.5rem" }}>
      <section className="auth-card" style={{ maxWidth: "440px", width: "100%", padding: "2rem", background: "#fff", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
        <a className="brand" href="/" style={{ textDecoration: "none", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <img src="/logo.png" alt="Checkinfo - Check Kiya Kya ?" style={{ height: "46px", width: "auto", objectFit: "contain" }} />
        </a>
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow" style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#0284c7", fontWeight: "700" }}>Create Visitor Account</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0.25rem 0" }}>Register Account</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
            Create a user account to save favorite listings, leave reviews, and send direct seller enquiries.
          </p>
        </div>

        {searchParams?.error ? (
          <div style={{ padding: "0.75rem", marginBottom: "1rem", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "0.875rem", border: "1px solid #fca5a5" }}>
            {searchParams.error}
          </div>
        ) : null}

        <form
          className="auth-form"
          action={async (formData: FormData) => {
            "use server";
            const name = String(formData.get("name") || "").trim();
            const email = String(formData.get("email") || "").trim();
            const phone = String(formData.get("phone") || "").trim();
            const password = String(formData.get("password") || "");

            if (name.length < 2) redirect(`/users/register?error=${encodeURIComponent("Name must be at least 2 characters")}`);
            if (!email.includes("@")) redirect(`/users/register?error=${encodeURIComponent("Email must contain @")}`);
            if (phone.length < 10) redirect(`/users/register?error=${encodeURIComponent("Phone must be at least 10 digits")}`);
            if (password.length < 6) redirect(`/users/register?error=${encodeURIComponent("Password must be at least 6 characters")}`);

            const username = email.split("@")[0] || email || "user";

            if (isMongoConfigured()) {
              void createMongoUser({
                email,
                name,
                passwordHash: hashPassword(password),
                phone,
                username,
              }).catch((e) => console.warn("Background user registration warning:", e));
            }

            redirect(`/members/registered?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
          }}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: "500" }}>
            <span>Full Name *</span>
            <input name="name" placeholder="Enter your full name" required style={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: "500" }}>
            <span>Email Address *</span>
            <input type="email" name="email" placeholder="name@example.com" required style={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: "500" }}>
            <span>Mobile / Phone Number *</span>
            <input name="phone" placeholder="10-digit mobile number" required style={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.875rem", fontWeight: "500" }}>
            <span>Password *</span>
            <PasswordFieldWithToggle
              name="password"
              placeholder="Create a password"
              required
              inputStyle={{ padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
            />
          </label>

          <button type="submit" style={{ padding: "0.75rem", borderRadius: "8px", background: "#0284c7", color: "#fff", fontWeight: "600", border: "none", cursor: "pointer", fontSize: "1rem", marginTop: "0.5rem" }}>
            Register User Account
          </button>
        </form>

        <SocialLoginButtons role="user" title="Or Register / Sign Up With" />

        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
          <span>Already have a user account? </span>
          <a href="/users/login" style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>User Login</a>
        </div>
      </section>
    </main>
  );
}
