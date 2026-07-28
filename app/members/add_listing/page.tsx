import {
  AccountHeader,
  categories,
  Field,
  imageSlots,
  MemberShell,
  PanelSection,
} from "@/frontend/member/MemberPanel";

export default function AddListingPage() {
  return (
    <MemberShell active="Add Listing">
      <AccountHeader
        eyebrow="Post Your Ad"
        subtitle="Create a fresh business listing for Checkinfo search and category pages."
        title="Add New Listing"
      />

      <PanelSection
        action={<button type="button">Save Listing</button>}
        eyebrow="Listing Setup"
        title="Business information"
      >
        <div className="form-grid">
          <Field label="Business Name *" placeholder="Enter business name" />
          <Field label="Contact Person *" placeholder="Owner or manager name" />
          <Field label="Mobile Number *" placeholder="Primary contact number" />
          <Field label="Email ID" type="email" placeholder="business@example.com" />
          <Field label="Website" placeholder="https://example.com" />
          <Field label="YouTube Video" placeholder="Embedded YouTube URL" />
          <label className="panel-field wide">
            <span>Address *</span>
            <textarea placeholder="Full business address" />
          </label>
          <label className="panel-field">
            <span>Category *</span>
            <select defaultValue="">
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <Field label="Service Keywords" placeholder="repairs, hotel, coaching, clinic" />
          <label className="panel-field wide">
            <span>Description</span>
            <textarea placeholder="Tell customers what you offer, where you serve, and why they should contact you" />
          </label>
        </div>

        <h3>Upload Images</h3>
        <div className="upload-grid" aria-label="Upload listing images">
          {imageSlots.map((slot) => (
            <label className="upload-card" key={slot}>
              <span>{slot}</span>
              <input type="file" />
              <small>JPG, PNG or GIF. Best size 800 x 560.</small>
            </label>
          ))}
        </div>
      </PanelSection>
    </MemberShell>
  );
}
