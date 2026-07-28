import { AccountHeader, MemberShell, PanelSection } from "../_components/MemberPanel";

const listings = [
  ["Dreamz Institute", "Draft", "Education", "GTB Nagar, New Delhi", "Complete profile to publish"],
  ["Ayush Digital Services", "Pending", "Website Developer", "Bhagalpur, Bihar", "Under review"],
  ["Featured Demo Listing", "Featured", "Advertising", "New Delhi", "Visibility active"],
];

export default function MyListingsPage() {
  return (
    <MemberShell active="My Listings">
      <AccountHeader
        action={<a className="primary-button" href="/members/add_listing">Add Listing</a>}
        eyebrow="My Listings"
        subtitle="Track every business profile from draft to featured placement."
        title="Listing Manager"
      />

      <PanelSection eyebrow="Business Ads" title="Your listing portfolio">
        <div className="data-table" role="table" aria-label="Business listings">
          <div className="data-row data-head" role="row">
            <span>Business</span>
            <span>Status</span>
            <span>Category</span>
            <span>Location</span>
            <span>Next Step</span>
          </div>
          {listings.map(([name, status, category, location, next]) => (
            <div className="data-row" role="row" key={name}>
              <strong>{name}</strong>
              <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
              <span>{category}</span>
              <span>{location}</span>
              <span>{next}</span>
            </div>
          ))}
        </div>
      </PanelSection>
    </MemberShell>
  );
}
