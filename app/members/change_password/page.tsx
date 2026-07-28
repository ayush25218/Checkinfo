import {
  AccountHeader,
  Field,
  MemberShell,
  PanelSection,
} from "../_components/MemberPanel";

export default function ChangePasswordPage() {
  return (
    <MemberShell active="Change Password">
      <AccountHeader
        eyebrow="Change Password"
        subtitle="Update your member login password from this dedicated security page."
        title="Account Security"
      />

      <PanelSection
        action={<button type="button">Update</button>}
        eyebrow="Password"
        title="Set a new password"
      >
        <div className="form-grid">
          <Field label="Old Password *" type="password" />
          <Field label="New Password *" type="password" />
          <Field label="Confirm Password *" type="password" />
        </div>
      </PanelSection>
    </MemberShell>
  );
}
