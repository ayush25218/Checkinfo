import { hashPassword } from "@/backend/auth";
import { createMongoMember, isMongoConfigured } from "@/backend/mongodb";
import { PasswordFieldWithToggle } from "@/frontend/web/PasswordFieldWithToggle";
import { redirect } from "next/navigation";

function usernameFrom(email: string, phone: string) {
  const base = email.split("@")[0] || `member-${phone.slice(-4)}`;
  return base.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "") || `member-${Date.now()}`;
}

export default async function MemberRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="auth-page auth-page-member">
      <section className="auth-card">
        <a className="brand auth-member-logo" href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
          <img src="/logo.png" alt="Checkinfo - Check Kiya Kya ?" style={{ height: "46px", width: "auto", objectFit: "contain" }} />
        </a>
        <div>
          <p className="eyebrow">Business Registration</p>
          <h1>Create Business Member Account</h1>
          <p>Register your business owner account to add listings, manage enquiries, and track approvals from the member panel.</p>
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <form
          className="auth-form"
          action={async (formData: FormData) => {
            "use server";
            const name = String(formData.get("name") || "").trim();
            const email = String(formData.get("email") || "").trim().toLowerCase();
            const phone = String(formData.get("phone") || "").trim();
            const password = String(formData.get("password") || "");
            const username = usernameFrom(email, phone);

            if (name.length < 2) redirect(`/members/register?error=${encodeURIComponent("Business owner name must be at least 2 characters")}`);
            if (!email.includes("@")) redirect(`/members/register?error=${encodeURIComponent("Valid email address is required")}`);
            if (phone.replace(/\D/g, "").length < 10) redirect(`/members/register?error=${encodeURIComponent("Phone number must be at least 10 digits")}`);
            if (password.length < 6) redirect(`/members/register?error=${encodeURIComponent("Password must be at least 6 characters")}`);
            if (!isMongoConfigured()) redirect(`/members/register?error=${encodeURIComponent("Registration backend is not configured. Please add MongoDB connection first.")}`);

            try {
              await createMongoMember({
                email,
                name,
                passwordHash: hashPassword(password),
                phone,
                username,
              });
            } catch (error) {
              const code = typeof error === "object" && error && "code" in error ? (error as { code?: unknown }).code : undefined;
              const message = code === 11000
                ? "Business account with this email or username already exists"
                : "Registration database is currently unavailable. Please try again after database connection is fixed.";
              redirect(`/members/register?error=${encodeURIComponent(message)}`);
            }

            redirect(`/members/login?registered=true&email=${encodeURIComponent(email)}`);
          }}
        >
          <label>
            <span>Business Owner Name *</span>
            <input autoComplete="name" name="name" placeholder="Enter owner or manager name" required />
          </label>
          <label>
            <span>Email Address *</span>
            <input autoComplete="email" name="email" placeholder="name@example.com" required type="email" />
          </label>
          <label>
            <span>Mobile Number *</span>
            <input autoComplete="tel" name="phone" placeholder="10-digit mobile number" required />
          </label>
          <label>
            <span>Password *</span>
            <PasswordFieldWithToggle name="password" placeholder="Create password" required />
          </label>
          <button type="submit">Create Business Member Account</button>
        </form>

        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem" }}>
          <span>Already registered? </span>
          <a href="/members/login" style={{ color: "#0284c7", fontWeight: "700", textDecoration: "none" }}>Login to Business Member Panel</a>
        </div>
      </section>
    </main>
  );
}
