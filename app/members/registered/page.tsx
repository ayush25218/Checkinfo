"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RegistrationSuccessCard } from "@/frontend/member/RegistrationSuccessCard";

function RegisteredContent() {
  const searchParams = useSearchParams();
  const email = searchParams ? searchParams.get("email") || "" : "";
  const name = searchParams ? searchParams.get("name") || "" : "";

  return (
    <main className="auth-page auth-page-member" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem 1rem", background: "linear-gradient(135deg, #f0f7ff 0%, #e6f0fa 100%)" }}>
      <section
        className="auth-card"
        style={{
          width: "min(100%, 520px)",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          boxShadow: "0 20px 50px rgba(0, 82, 204, 0.12)",
          border: "1px solid #dbeafe",
          textAlign: "center",
        }}
      >
        <a className="brand auth-member-logo" href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "1.5rem" }}>
          <img src="/logo.png" alt="Checkinfo - Check Kiya Kya ?" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
        </a>

        <RegistrationSuccessCard email={email} name={name} />
      </section>
    </main>
  );
}

export default function RegisteredSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#0052cc" }}>Loading details...</div>}>
      <RegisteredContent />
    </Suspense>
  );
}
