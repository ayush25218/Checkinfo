import { AccountHeader, MemberShell, PanelSection } from "../_components/MemberPanel";

const packages = [
  ["Free Listing", "₹0", "Basic profile, category listing, contact visibility"],
  ["Featured Boost", "₹999", "Top category visibility, highlight badge, priority review"],
  ["City Leader", "₹2499", "Trending placement, wider city reach, weekly performance report"],
];

export default function PackagesPage() {
  return (
    <MemberShell active="Featured Packages">
      <AccountHeader
        eyebrow="Advertise With Us"
        subtitle="Choose promotion plans that help customers notice your business faster."
        title="Featured Packages"
      />

      <PanelSection eyebrow="Visibility Plans" title="Boost search discovery">
        <div className="package-grid">
          {packages.map(([name, price, text]) => (
            <article className="package-card" key={name}>
              <span>{name}</span>
              <strong>{price}</strong>
              <p>{text}</p>
              <button type="button">Select Plan</button>
            </article>
          ))}
        </div>
      </PanelSection>
    </MemberShell>
  );
}
