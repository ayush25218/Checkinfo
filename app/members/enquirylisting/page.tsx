import {
  AccountHeader,
  EmptyState,
  Field,
  MemberShell,
  PanelSection,
} from "@/frontend/member/MemberPanel";

export default function EnquiryListingPage() {
  return (
    <MemberShell active="My Enquiries">
      <AccountHeader
        eyebrow="Manage Enquiries"
        subtitle="Search buyer leads by user name, email, phone number, and date range."
        title="My Enquiries"
      />

      <PanelSection
        action={<button type="button">Search</button>}
        eyebrow="Filter By"
        title="Find enquiry records"
      >
        <div className="filter-grid">
          <Field label="User Name" />
          <Field label="Email ID" type="email" />
          <Field label="Contact Number" />
          <Field label="From" type="date" />
          <Field label="To" type="date" />
        </div>
        <EmptyState
          text="New enquiries will appear here with user details, message, and received date."
          title="No record(s) found."
        />
      </PanelSection>
    </MemberShell>
  );
}
