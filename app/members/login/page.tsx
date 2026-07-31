import { getExpectedCredentials } from "@/backend/auth";

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
        <a className="brand auth-member-logo" href="/">
          <span className="brand-mark">CI</span>
          <span>
            <strong>Checkinfo</strong>
            <small>Business Member Panel</small>
          </span>
        </a>
        <div>
          <p className="eyebrow">List Your Business</p>
          <h1>Business Owner Login</h1>
          <p>Sign in to access your Business Member Panel: manage listings, review buyer enquiries, update packages, and view customer ratings.</p>
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" action="/api/auth/login" method="post">
          <input name="role" type="hidden" value="member" />
          <label>
            <span>Username</span>
            <input autoComplete="username" defaultValue={demo.username} name="username" placeholder={demo.username} required />
          </label>
          <label>
            <span>Password</span>
            <input autoComplete="current-password" defaultValue={demo.password} name="password" placeholder="Password" required type="password" />
          </label>
          <button type="submit">Login to Business Member Panel</button>
        </form>
        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem" }}>
          <span>Looking for normal site visitor login? </span>
          <a href="/login" style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>Visitor Login</a>
        </div>
      </section>
    </main>
  );
}
