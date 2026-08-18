"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PasswordFieldWithToggle } from "@/frontend/web/PasswordFieldWithToggle";
import { RegistrationSuccessCard } from "./RegistrationSuccessCard";

export function MemberRegisterForm() {
  const searchParams = useSearchParams();
  const paramError = searchParams ? searchParams.get("error") : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(paramError || "");
  const [successData, setSuccessData] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    if (paramError) setError(paramError);
  }, [paramError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setError("Business owner name must be at least 2 characters");
      return;
    }
    if (!cleanEmail.includes("@")) {
      setError("Valid email address is required");
      return;
    }
    if (cleanPhone.replace(/\D/g, "").length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success -> Instantly switch view & navigate to dynamic congratulations registration page!
      setSuccessData({ email: cleanEmail, name: cleanName });
      if (typeof window !== "undefined") {
        window.location.href = `/members/registered?email=${encodeURIComponent(cleanEmail)}&name=${encodeURIComponent(cleanName)}`;
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Network error during registration. Please try again.");
      setLoading(false);
    }
  };

  if (successData) {
    return <RegistrationSuccessCard email={successData.email} name={successData.name} />;
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {error ? (
        <div className="auth-error" style={{ display: "flex", alignItems: "center", gap: "8px", animation: "fadeIn 0.2s ease-in-out" }}>
          <span style={{ fontSize: "1.1rem" }}>⚠️</span>
          <span>{error}</span>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
        <label>
          <span>Business Owner Name *</span>
          <input
            autoComplete="name"
            name="name"
            placeholder="Enter owner or manager name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
          />
        </label>

        <label>
          <span>Email Address *</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="name@example.com"
            required
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
          />
        </label>

        <label>
          <span>Mobile Number *</span>
          <input
            autoComplete="tel"
            name="phone"
            placeholder="10-digit mobile number"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError("");
            }}
          />
          {phone && phone.replace(/\D/g, "").length < 10 ? (
            <small style={{ color: "#d97706", fontSize: "0.78rem", marginTop: "2px" }}>
              {10 - phone.replace(/\D/g, "").length} digits remaining (10 digits required)
            </small>
          ) : null}
        </label>

        <label>
          <span>Password *</span>
          <PasswordFieldWithToggle
            name="password"
            placeholder="Create password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
          />
        </label>

        <button
          disabled={loading}
          type="submit"
          style={{
            minHeight: "52px",
            border: 0,
            borderRadius: "12px",
            background: loading ? "#0284c7" : "linear-gradient(135deg, #0052cc 0%, #0080ff 100%)",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 10px 24px rgba(0, 102, 255, 0.3)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: loading ? 0.85 : 1,
            pointerEvents: "auto",
          }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ display: "inline-block", width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Business Member Account</span>
          )}
        </button>
      </form>
    </div>
  );
}
