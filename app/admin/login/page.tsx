import { getExpectedCredentials } from "@/backend/auth";
import { PasswordFieldWithToggle } from "@/frontend/web/PasswordFieldWithToggle";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const demo = getExpectedCredentials("admin");

  return (
    <main className="auth-page auth-page-admin">
      <section className="auth-card">
        <a className="check-logo auth-logo" href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
          <img src="/logo.png" alt="Checkinfo Administrator" style={{ height: "46px", width: "auto", objectFit: "contain" }} />
        </a>
        <div>
          <p className="eyebrow">Secure admin access</p>
          <h1>Admin Login</h1>
          <p>Sign in to manage categories, listings, members, enquiries, and website settings.</p>
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" action="/api/auth/login" method="post" autoComplete="off">
          <input name="role" type="hidden" value="admin" />
          <input type="text" name="fake_username_remember" style={{ display: "none" }} tabIndex={-1} />
          <input type="password" name="fake_password_remember" style={{ display: "none" }} tabIndex={-1} />
          <label>
            <span>Username</span>
            <input autoComplete="off" name="username" placeholder="Enter admin username" required type="text" />
          </label>
          <label>
            <span>Password</span>
            <PasswordFieldWithToggle name="password" placeholder="Enter admin password" required />
          </label>
          <button type="submit">Login to Admin</button>
        </form>
      </section>
    </main>
  );
}
