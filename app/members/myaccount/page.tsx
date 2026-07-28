const accountNav = [
  ["Dashboard", "#dashboard"],
  ["Edit Detail", "#edit-detail"],
  ["My Enquiries", "#enquiries"],
  ["Manage Reviews", "#reviews"],
  ["Change Password", "#password"],
  ["Logout", "#logout"],
];

const imageSlots = ["Primary image", "Gallery image 2", "Gallery image 3", "Gallery image 4", "Gallery image 5"];

const categories = [
  "Website Developer",
  "Advertising",
  "Animation Institute",
  "Restaurants",
  "Hotels",
  "Education",
  "Hospitals",
  "Home Decor",
];

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="panel-field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder ?? label} />
    </label>
  );
}

export default function MemberAccount() {
  return (
    <main className="account-shell">
      <aside className="account-sidebar">
        <a className="brand account-brand" href="/">
          <span className="brand-mark">CI</span>
          <span>
            <strong>Checkinfo</strong>
            <small>Member panel</small>
          </span>
        </a>

        <div className="member-card">
          <div className="avatar">AK</div>
          <strong>Ayush Kumar</strong>
          <span>Business owner account</span>
          <small>demo@checkinfo.in</small>
        </div>

        <nav className="panel-nav" aria-label="Member panel navigation">
          {accountNav.map(([label, href]) => (
            <a href={href} key={label}>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <section className="account-main">
        <header className="account-topbar" id="dashboard">
          <div>
            <p className="eyebrow">Welcome to your account</p>
            <h1>What do you want to do today?</h1>
            <p>Manage your business profile, enquiries, reviews, and password.</p>
          </div>
          <a className="primary-button" href="/#advertise">Post Your Ad</a>
        </header>

        <section className="dashboard-grid">
          {[
            ["Profile status", "Draft ready", "Complete contact and category details"],
            ["Enquiries", "0 new", "Track buyer leads from your listing"],
            ["Reviews", "0 pending", "Review customer feedback in one place"],
            ["Security", "Password active", "Update account access anytime"],
          ].map(([title, value, note]) => (
            <article className="dashboard-card" key={title}>
              <span>{title}</span>
              <strong>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </section>

        <section className="panel-section" id="edit-detail">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Edit Details</p>
              <h2>Personal Info</h2>
            </div>
            <button type="button">Update</button>
          </div>

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
        </section>

        <section className="panel-section" id="enquiries">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Manage Enquiries</p>
              <h2>Filter buyer leads</h2>
            </div>
            <button type="button">Search</button>
          </div>
          <div className="filter-grid">
            <Field label="User Name" />
            <Field label="Email ID" type="email" />
            <Field label="Contact Number" />
            <Field label="From" type="date" />
            <Field label="To" type="date" />
          </div>
          <div className="empty-state">
            <strong>No record(s) found.</strong>
            <span>New enquiries will appear here with user details, message, and received date.</span>
          </div>
        </section>

        <section className="panel-section" id="reviews">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Manage Reviews</p>
              <h2>Customer feedback</h2>
            </div>
          </div>
          <div className="empty-state">
            <strong>No record(s) found.</strong>
            <span>Published and pending reviews will be listed here for quick moderation.</span>
          </div>
        </section>

        <section className="panel-section" id="password">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Change Password</p>
              <h2>Account security</h2>
            </div>
            <button type="button">Update</button>
          </div>
          <div className="form-grid">
            <Field label="Old Password *" type="password" />
            <Field label="New Password *" type="password" />
            <Field label="Confirm Password *" type="password" />
          </div>
        </section>

        <section className="logout-panel" id="logout">
          <div>
            <h2>Ready to leave?</h2>
            <p>End the current member session securely.</p>
          </div>
          <button type="button">Logout</button>
        </section>
      </section>
    </main>
  );
}
