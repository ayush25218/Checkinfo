"use client";

export function LeadCallbackForm() {
  return (
    <form
      className="lead-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const btn = e.currentTarget.querySelector("button") as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = "Sending...";
        try {
          const res = await fetch("/api/web/lead", { method: "POST", body: fd });
          btn.textContent = res.ok ? "Request Sent ✓" : "Try Again";
        } catch {
          btn.textContent = "Try Again";
        } finally {
          btn.disabled = false;
        }
      }}
    >
      <strong>Get a callback</strong>
      <input name="business_name" placeholder="Business name" aria-label="Business name" required />
      <input name="phone" placeholder="Phone number" aria-label="Phone number" required />
      <input name="email" type="email" placeholder="Email address" aria-label="Email address" />
      <button type="submit">Request Callback</button>
    </form>
  );
}
