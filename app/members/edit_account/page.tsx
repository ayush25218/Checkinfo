import {
  AccountHeader,
  categories,
  Field,
  imageSlots,
  MemberShell,
  PanelSection,
} from "../_components/MemberPanel";

export default function EditAccountPage() {
  return (
    <MemberShell active="Edit Detail">
      <AccountHeader
        eyebrow="Edit Details"
        subtitle="Update business identity, media, contact information, address, category, and service description."
        title="Personal Info"
      />

      <PanelSection
        action={<button type="button">Update</button>}
        eyebrow="Business Profile"
        title="Listing details"
      >
        <div className="form-grid">
          <Field label="Business Name *" placeholder="Enter business name" />
          <Field label="Embedded YouTube URL" placeholder="https://youtube.com/..." />
        </div>

        <div className="upload-grid" aria-label="Upload images">
          {imageSlots.map((slot) => (
            <label className="upload-card" key={slot}>
              <span>{slot}</span>
              <input type="file" />
              <small>JPG, PNG or GIF. Best size 800 x 560.</small>
            </label>
          ))}
        </div>

        <h3>Contact Details</h3>
        <div className="form-grid">
          <Field label="Contact Person *" placeholder="Owner or manager name" />
          <Field label="Contact Number *" placeholder="Mobile number" />
          <Field label="Alternate Number" placeholder="Optional phone number" />
          <Field label="E-mail ID" type="email" placeholder="name@example.com" />
          <Field label="Website" placeholder="https://example.com" />
        </div>

        <h3>Address Details</h3>
        <div className="form-grid">
          <label className="panel-field wide">
            <span>Address *</span>
            <textarea placeholder="Full business address" />
          </label>
          <label className="panel-field">
            <span>Country *</span>
            <select defaultValue="India">
              <option>India</option>
            </select>
          </label>
          <label className="panel-field">
            <span>State *</span>
            <select defaultValue="">
              <option value="">Select State</option>
              <option>Delhi</option>
              <option>Maharashtra</option>
              <option>Karnataka</option>
            </select>
          </label>
          <label className="panel-field">
            <span>City *</span>
            <select defaultValue="">
              <option value="">Select City</option>
              <option>New Delhi</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
            </select>
          </label>
          <Field label="Location *" placeholder="Area or locality" />
          <Field label="Pincode *" placeholder="110001" />
        </div>

        <h3>Deals In</h3>
        <div className="form-grid">
          <label className="panel-field">
            <span>Category *</span>
            <select defaultValue="">
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <Field label="Keyword Tags" placeholder="services, products, city" />
          <label className="panel-field wide">
            <span>Business Description</span>
            <textarea placeholder="Describe your products, services, timing, and service area" />
          </label>
        </div>
      </PanelSection>
    </MemberShell>
  );
}
