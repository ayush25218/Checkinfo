import { MemberRegisterForm } from "@/frontend/member/MemberRegisterForm";
import { Suspense } from "react";

export default function MemberRegisterPage() {
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

        <Suspense fallback={<div style={{ padding: "20px", textAlign: "center", color: "#0066ff" }}>Loading registration form...</div>}>
          <MemberRegisterForm />
        </Suspense>

        <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "0.85rem" }}>
          <span>Already registered? </span>
          <a href="/members/login" style={{ color: "#0284c7", fontWeight: "700", textDecoration: "none" }}>Login to Business Member Panel</a>
        </div>
      </section>
    </main>
  );
}
