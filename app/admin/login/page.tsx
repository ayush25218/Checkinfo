import { getExpectedCredentials } from "@/backend/auth";

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
        <a className="check-logo auth-logo" href="/">
          <span>i</span>
          <strong>Checkinfo</strong>
          <small>Administrator</small>
        </a>
        <div>
          <p className="eyebrow">Secure admin access</p>
          <h1>Admin Login</h1>
          <p>Sign in to manage categories, listings, members, enquiries, and website settings.</p>
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" action="/api/auth/login" method="post">
          <input name="role" type="hidden" value="admin" />
          <label>
            <span>Username</span>
            <input autoComplete="username" name="username" placeholder={demo.username} required />
          </label>
          <label>
            <span>Password</span>
            <input autoComplete="current-password" name="password" placeholder="Password" required type="password" />
          </label>
          <button type="submit">Login to Admin</button>
        </form>
        <small>Set `ADMIN_LOGIN_USERNAME`, `ADMIN_LOGIN_PASSWORD`, and `AUTH_SECRET` in Vercel for production.</small>
      </section>
    </main>
  );
}
