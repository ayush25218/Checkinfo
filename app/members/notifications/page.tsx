import { AccountHeader, MemberShell, PanelSection } from "../_components/MemberPanel";

const notifications = [
  ["Profile reminder", "Add images and keyword tags to improve listing quality.", "Today"],
  ["Review queue", "No pending reviews at the moment.", "Today"],
  ["Package tip", "Featured Boost can move your ad above regular listings.", "Yesterday"],
];

export default function NotificationsPage() {
  return (
    <MemberShell active="Notifications">
      <AccountHeader
        eyebrow="Notifications"
        subtitle="Stay updated on profile health, reviews, enquiries, and promotions."
        title="Activity Center"
      />

      <PanelSection eyebrow="Recent Updates" title="Member alerts">
        <div className="timeline">
          {notifications.map(([title, text, time]) => (
            <article className="timeline-item" key={title}>
              <span>{time}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </PanelSection>
    </MemberShell>
  );
}
