import { AccountHeader, Field, MemberShell, PanelSection } from "../_components/MemberPanel";

export default function SupportPage() {
  return (
    <MemberShell active="Support">
      <AccountHeader
        eyebrow="Customer Care"
        subtitle="Reach Checkinfo support for listing updates, enquiry issues, packages, or account help."
        title="Support Center"
      />

      <PanelSection
        action={<button type="button">Submit Ticket</button>}
        eyebrow="Need Help?"
        title="Create support request"
      >
        <div className="form-grid">
          <Field label="Name *" placeholder="Your name" />
          <Field label="Phone Number *" placeholder="Contact number" />
          <Field label="Email ID" type="email" placeholder="name@example.com" />
          <label className="panel-field">
            <span>Issue Type</span>
            <select defaultValue="">
              <option value="">Select issue</option>
              <option>Listing update</option>
              <option>Package or payment</option>
              <option>Enquiry issue</option>
              <option>Account access</option>
            </select>
          </label>
          <label className="panel-field wide">
            <span>Message *</span>
            <textarea placeholder="Describe your issue" />
          </label>
        </div>
      </PanelSection>
    </MemberShell>
  );
}
