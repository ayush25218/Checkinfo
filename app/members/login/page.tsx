import { getExpectedCredentials } from "@/backend/auth";
import { PasswordFieldWithToggle } from "@/frontend/web/PasswordFieldWithToggle";
import { SocialLoginButtons } from "@/frontend/web/SocialLoginButtons";

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const demo = getExpectedCredentials("member");

  return (
    <main className="auth-page auth-page-member">
      <section className="auth-card">
        <a className="brand auth-member-logo" href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
          <img src="/logo.png" alt="Checkinfo - Check Kiya Kya ?" style={{ height: "46px", width: "auto", objectFit: "contain" }} />
        </a>
        <div>
          <p className="eyebrow">List Your Business</p>
          <h1>Business Owner Login</h1>
          <p>Sign in to access your Business Member Panel: manage listings, review buyer enquiries, update packages, and view customer ratings.</p>
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" action="/api/auth/login" method="post" autoComplete="off">
          <input name="role" type="hidden" value="member" />
          <input type="text" name="fake_username_remember" style={{ display: "none" }} tabIndex={-1} />
          <input type="password" name="fake_password_remember" style={{ display: "none" }} tabIndex={-1} />
          <label>
            <span>Username / Email</span>
            <input autoComplete="off" name="username" placeholder="Enter username or email" required />
          </label>
          <label>
            <span>Password</span>
            <PasswordFieldWithToggle name="password" placeholder="Enter password" required />
          </label>
          <button type="submit">Login to Business Member Panel</button>
        </form>

        <SocialLoginButtons role="member" title="Or Business Sign In With" />

        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            <span>Don&apos;t have an account? </span>
            <a href="/members/register" style={{ color: "#0284c7", fontWeight: "700", textDecoration: "none" }}>Register / Sign Up Here</a>
          </div>
        </div>
      </section>
    </main>
  );
}
