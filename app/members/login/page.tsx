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
            <small>Member panel</small>
          </span>
        </a>
        <div>
          <p className="eyebrow">Protected business account</p>
          <h1>Member Login</h1>
          <p>Sign in to add listings, edit your account, review enquiries, and manage support requests.</p>
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" action="/api/auth/login" method="post">
          <input name="role" type="hidden" value="member" />
          <label>
            <span>Username</span>
            <input autoComplete="username" name="username" placeholder={demo.username} required />
          </label>
          <label>
            <span>Password</span>
            <input autoComplete="current-password" name="password" placeholder="Password" required type="password" />
          </label>
          <button type="submit">Login to Member Panel</button>
        </form>
        <small>Set `MEMBER_LOGIN_USERNAME`, `MEMBER_LOGIN_PASSWORD`, and `AUTH_SECRET` in Vercel for production.</small>
      </section>
    </main>
  );
}
