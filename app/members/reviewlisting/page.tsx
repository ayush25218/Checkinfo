import {
  AccountHeader,
  EmptyState,
  MemberShell,
  PanelSection,
} from "@/frontend/member/MemberPanel";

export default function ReviewListingPage() {
  return (
    <MemberShell active="Manage Reviews">
      <AccountHeader
        eyebrow="Manage Reviews"
        subtitle="Track published, pending, and moderated customer feedback for your listing."
        title="Customer Reviews"
      />

      <PanelSection eyebrow="Reviews" title="Customer feedback">
        <EmptyState
          text="Published and pending reviews will be listed here for quick moderation."
          title="No record(s) found."
        />
      </PanelSection>
    </MemberShell>
  );
}
