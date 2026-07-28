import { AccountHeader, MemberShell } from "@/frontend/member/MemberPanel";

export default function LogoutPage() {
  return (
    <MemberShell active="Logout">
      <AccountHeader
        eyebrow="Logout"
        subtitle="End the current member session securely."
        title="Ready to leave?"
      />

      <section className="logout-panel">
        <div>
          <h2>Logout from member panel</h2>
          <p>You can return to the homepage or sign in again from the profile menu.</p>
        </div>
        <button type="button">Logout</button>
      </section>
    </MemberShell>
  );
}
