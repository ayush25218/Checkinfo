"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AccountHeader,
  categories,
  imageSlots,
  MemberShell,
  PanelSection,
} from "@/frontend/member/MemberPanel";
import { indiaDistricts, indiaStates, indiaSubdistricts } from "@/frontend/admin/indiaLocations";
import { businessTaxonomy } from "@/backend/businessTaxonomy";

type ListingStatus = "Draft" | "Pending" | "Active" | "Featured";

type MemberListing = {
  id: string;
  address: string;
  category: string;
  contactPerson: string;
  description: string;
  email: string;
  keywords: string;
  addressProofName?: string;
  businessType: string;
  city: string;
  location: string;
  mobile: string;
  name: string;
  state: string;
  status: ListingStatus;
  subcategory: string;
  subcity: string;
  website: string;
  youtube: string;
};

type MemberEnquiry = {
  id: string;
  contact: string;
  date: string;
  email: string;
  message: string;
  name: string;
  status: "New" | "Read" | "Closed";
};

type MemberReview = {
  id: string;
  author: string;
  message: string;
  rating: number;
  status: "Pending" | "Published" | "Hidden";
};

type NotificationRecord = {
  id: string;
  text: string;
  time: string;
  title: string;
  unread: boolean;
};

type SupportTicket = {
  id: string;
  email: string;
  issue: string;
  message: string;
  name: string;
  phone: string;
  status: "Open" | "Resolved";
};

const listingSeed: MemberListing[] = [];

const enquirySeed: MemberEnquiry[] = [];

const reviewSeed: MemberReview[] = [];

const notificationSeed: NotificationRecord[] = [];

const packageSeed = [
  ["Free Listing", "Rs 0", "Basic profile, category listing, contact visibility"],
  ["Featured Boost", "Rs 999", "Top category visibility, highlight badge, priority review"],
  ["City Leader", "Rs 2499", "Trending placement, wider city reach, weekly performance report"],
] as const;

function readStored<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function getMemberId() {
  if (typeof window === "undefined") return "member-default";
  const urlMemberId = new URLSearchParams(window.location.search).get("memberId");
  const stored = window.localStorage.getItem("checkinfo-member-id");
  const memberId = urlMemberId || stored || `member-${crypto.randomUUID()}`;
  window.localStorage.setItem("checkinfo-member-id", memberId);
  document.cookie = `checkinfo_member_id=${encodeURIComponent(memberId)}; path=/; max-age=31536000; samesite=lax`;
  return memberId;
}

function memberStorageKey(key: string) {
  return `${getMemberId()}-${key}`;
}

function postMemberAction(resource: string, payload: Record<string, unknown>) {
  return fetch(`/api/member/${resource}`, {
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json", "x-checkinfo-member-id": getMemberId() },
    method: "POST",
  }).catch(() => undefined);
}

function getMemberData<T>(resource: string, fallback: T): Promise<T> {
  return fetch(`/api/member/${resource}`, {
    headers: { "x-checkinfo-member-id": getMemberId() },
  })
    .then((res) => res.json())
    .then((json) => (json.ok && json.data ? (json.data as T) : fallback))
    .catch(() => fallback);
}

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState(() => readStored(memberStorageKey(key), fallback));
  function sync(next: T) {
    setValue(next);
    writeStored(memberStorageKey(key), next);
  }
  return [value, sync] as const;
}

function initialListing(): Omit<MemberListing, "id" | "status"> {
  return {
    address: "",
    category: categories[0] ?? "Website Developer",
    contactPerson: "",
    description: "",
    email: "",
    keywords: "",
    addressProofName: "",
    businessType: businessTaxonomy[0]?.subcategories[0]?.businessTypes[0]?.name ?? "",
    city: "",
    location: "",
    mobile: "",
    name: "",
    state: "Delhi",
    subcategory: businessTaxonomy[0]?.subcategories[0]?.name ?? "",
    subcity: "",
    website: "",
    youtube: "",
  };
}

function ListingForm({
  buttonLabel,
  initial,
  onSave,
}: {
  buttonLabel: string;
  initial?: Partial<MemberListing>;
  onSave: (record: Omit<MemberListing, "id" | "status">) => void;
}) {
  const [form, setForm] = useState({ ...initialListing(), ...initial });
  const selectedTaxonomy = useMemo(
    () => businessTaxonomy.find((category) => category.name === form.category) ?? businessTaxonomy[0],
    [form.category],
  );
  const selectedSubcategory = useMemo(
    () => selectedTaxonomy?.subcategories.find((subcategory) => subcategory.name === form.subcategory) ?? selectedTaxonomy?.subcategories[0],
    [form.subcategory, selectedTaxonomy],
  );
  const cityOptions = useMemo(
    () => indiaDistricts.filter((city) => city.state === form.state).slice(0, 1200),
    [form.state],
  );
  const subcityOptions = useMemo(
    () => indiaSubdistricts.filter((subcity) => subcity.state === form.state && (!form.city || subcity.district === form.city)).slice(0, 900),
    [form.city, form.state],
  );

  function submit() {
    if (!form.name.trim() || !form.mobile.trim() || !form.email.trim() || !form.address.trim() || !form.city.trim()) return;
    onSave({
      address: form.address.trim(),
      addressProofName: form.addressProofName?.trim(),
      businessType: form.businessType.trim(),
      category: form.category,
      city: form.city.trim(),
      contactPerson: form.contactPerson.trim(),
      description: form.description.trim(),
      email: form.email.trim(),
      keywords: form.keywords.trim(),
      location: [form.subcity, form.city, form.state].filter(Boolean).join(", "),
      mobile: form.mobile.trim(),
      name: form.name.trim(),
      state: form.state.trim(),
      subcategory: form.subcategory.trim(),
      subcity: form.subcity.trim(),
      website: form.website.trim(),
      youtube: form.youtube.trim(),
    });
  }

  return (
    <>
      <div className="form-grid">
        <label className="panel-field"><span>Business Name *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="panel-field"><span>Contact Person *</span><input value={form.contactPerson} onChange={(event) => setForm({ ...form, contactPerson: event.target.value })} /></label>
        <label className="panel-field"><span>Mobile Number *</span><input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
        <label className="panel-field"><span>Email ID *</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label className="panel-field"><span>Website</span><input value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
        <label className="panel-field"><span>YouTube Video</span><input value={form.youtube} onChange={(event) => setForm({ ...form, youtube: event.target.value })} /></label>
        <label className="panel-field wide"><span>Address *</span><textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
        <label className="panel-field"><span>Main Category *</span><select value={form.category} onChange={(event) => { const next = businessTaxonomy.find((category) => category.name === event.target.value); const firstSub = next?.subcategories[0]; setForm({ ...form, businessType: firstSub?.businessTypes[0]?.name ?? "", category: event.target.value, subcategory: firstSub?.name ?? "" }); }}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="panel-field"><span>Subcategory *</span><select value={form.subcategory} onChange={(event) => { const next = selectedTaxonomy?.subcategories.find((subcategory) => subcategory.name === event.target.value); setForm({ ...form, businessType: next?.businessTypes[0]?.name ?? "", subcategory: event.target.value }); }}>{selectedTaxonomy?.subcategories.map((subcategory) => <option key={subcategory.slug}>{subcategory.name}</option>)}</select></label>
        <label className="panel-field"><span>Business Type *</span><select value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })}>{selectedSubcategory?.businessTypes.map((businessType) => <option key={businessType.slug}>{businessType.name}</option>)}</select></label>
        <label className="panel-field"><span>State *</span><select value={form.state} onChange={(event) => setForm({ ...form, city: "", state: event.target.value, subcity: "" })}>{indiaStates.map((state) => <option key={state.id}>{state.name}</option>)}</select></label>
        <label className="panel-field"><span>City / District *</span><select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value, subcity: "" })}><option value="">Select city</option>{cityOptions.map((city) => <option key={city.id}>{city.name}</option>)}</select></label>
        <label className="panel-field"><span>Subcity / Area</span><select value={form.subcity} onChange={(event) => setForm({ ...form, subcity: event.target.value })}><option value="">Optional area</option>{subcityOptions.map((subcity) => <option key={subcity.id}>{subcity.name}</option>)}</select></label>
        <label className="panel-field"><span>Service Keywords</span><input value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} /></label>
        <label className="panel-field wide"><span>Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      </div>
      <h3>Optional Verification</h3>
      <div className="upload-grid optional-proof-grid" aria-label="Optional address proof upload">
        <label className="upload-card">
          <span>Business address proof</span>
          <input type="file" accept="image/*,.pdf" onChange={(event) => setForm({ ...form, addressProofName: event.target.files?.[0]?.name ?? "" })} />
          <small>Optional only. No document is required to submit.</small>
          {form.addressProofName ? <b>{form.addressProofName}</b> : null}
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
      <div className="member-actions"><button type="button" onClick={submit}>{buttonLabel}</button></div>
    </>
  );
}

export function MemberDashboardModule() {
  const [listings] = useStoredState("checkinfo-member-listings", listingSeed);
  const [enquiries] = useStoredState("checkinfo-member-enquiries", enquirySeed);
  const activeListings = listings.filter((listing) => listing.status === "Active" || listing.status === "Featured").length;
  const newEnquiries = enquiries.filter((enquiry) => enquiry.status === "New").length;
  const dashboardCards = [
    ["Profile status", `${Math.min(100, 55 + listings.length * 12)}%`, "Complete media, category, and service tags"],
    ["Listings", `${activeListings} active`, "Manage free and featured business ads"],
    ["My Business Listing", listings.length > 0 ? `${listings[0]?.name} (${listings[0]?.status})` : "Not created", "View, manage, or update your 1 business profile listing"],
    ["Enquiries", `${newEnquiries} new`, "Track buyer leads from your listing"],
    ["Reach score", listings.some((listing) => listing.status === "Featured") ? "Boosted" : "Starter", "Upgrade package to boost search ranking"],
  ];
  const quickActions = [
    ["My Business Listing", "View, manage, or update your 1 business profile listing.", "/members/my_listings"],
    ["My Enquiries", "Filter and manage buyer enquiries received from listings.", "/members/enquirylisting"],
    ["Manage Reviews", "View customer feedback and moderate reviews.", "/members/reviewlisting"],
    ["Featured Packages", "Compare visibility plans and promotional placements.", "/members/packages"],
    ["Notifications", "See profile alerts, approval updates, and enquiry activity.", "/members/notifications"],
    ["Support", "Contact Checkinfo care for listing or payment help.", "/members/support"],
    ["Change Password", "Keep account login secure with a fresh password.", "/members/change_password"],
  ];

  return (
    <MemberShell active="Dashboard">
      <AccountHeader action={<a className="primary-button" href="/members/my_listings">{listings.length > 0 ? "My Business Listing" : "Add Business Listing"}</a>} eyebrow="Welcome to your account" subtitle="Manage listings, visibility, enquiries, reviews, support, and security from dedicated pages." title="Your business command center" />
      <section className="dashboard-grid">{dashboardCards.map(([title, value, note]) => <article className="dashboard-card" key={title}><span>{title}</span><strong>{value}</strong><p>{note}</p></article>)}</section>
      <section className="panel-section"><div className="panel-heading"><div><p className="eyebrow">Account Shortcuts</p><h2>Choose a panel section</h2></div></div><div className="shortcut-grid">{quickActions.map(([title, text, href]) => <a className="shortcut-card" href={href} key={title}><strong>{title}</strong><span>{text}</span></a>)}</div></section>
    </MemberShell>
  );
}

export function MyBusinessListingModule() {
  const [listings, setListings] = useStoredState("checkinfo-member-listings", listingSeed);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void getMemberData<MemberListing[]>("listings", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setListings(data);
    });
  }, [setListings]);

  const hasListing = listings.length > 0;
  const currentListing = listings[0];

  function handleSaveListing(record: Omit<MemberListing, "id" | "status">) {
    if (hasListing && currentListing) {
      const updated: MemberListing = { ...currentListing, ...record, status: "Pending" };
      setListings([updated]);
      void postMemberAction("listing", { action: "update", id: currentListing.id, record });
      setMessage("Business details updated successfully and sent for review.");
    } else {
      const newListing: MemberListing = {
        ...record,
        id: `list-${Date.now()}`,
        status: "Pending",
      };
      setListings([newListing]);
      void postMemberAction("listing", { action: "create", record });
      setMessage("Your business listing has been created successfully!");
    }
    setIsEditing(false);
  }

  if (!hasListing) {
    return (
      <MemberShell active="My Business Listing">
        <AccountHeader
          eyebrow="Create Your Business Profile"
          subtitle="One business account can manage 1 listing. Fill in your business details below to publish."
          title="Add Business Listing"
        />
        <PanelSection eyebrow="Listing Setup" title="Business Information">
          {message ? <div className="member-notice" style={{ marginBottom: "1rem" }}>{message}</div> : null}
          <ListingForm
            buttonLabel="Save & Publish Business Listing"
            onSave={handleSaveListing}
          />
        </PanelSection>
      </MemberShell>
    );
  }

  if (isEditing) {
    return (
      <MemberShell active="My Business Listing">
        <AccountHeader
          action={
            <button
              type="button"
              className="secondary-button"
              onClick={() => { setIsEditing(false); setMessage(""); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              ← Back to View Details
            </button>
          }
          eyebrow="Edit Business Profile"
          subtitle="Modify your business identity, category, contact info, address, or description."
          title={`Edit: ${currentListing.name}`}
        />
        <PanelSection eyebrow="Update Details" title="Business Information">
          {message ? <div className="member-notice" style={{ marginBottom: "1rem" }}>{message}</div> : null}
          <ListingForm
            buttonLabel="Save & Update Changes"
            initial={currentListing}
            onSave={handleSaveListing}
          />
        </PanelSection>
      </MemberShell>
    );
  }

  return (
    <MemberShell active="My Business Listing">
      <AccountHeader
        action={
          <button
            type="button"
            className="primary-button"
            onClick={() => { setIsEditing(true); setMessage(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 22px", borderRadius: "8px", background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: "600", boxShadow: "0 4px 12px rgba(15,23,42,0.18)" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit Details ✏️
          </button>
        }
        eyebrow="My Business Listing"
        subtitle="View your business listing details. Click the Edit button to modify details."
        title={currentListing.name}
      />
      
      {message ? <div className="member-notice" style={{ marginBottom: "1.25rem" }}>{message}</div> : null}

      <PanelSection eyebrow="Business Details View" title="Listing Overview">
        <div className="business-view-card" style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "1.5rem", display: "grid", gap: "1.5rem", boxShadow: "0 4px 20px rgba(15,23,42,0.05)" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700", color: "#0f172a" }}>{currentListing.name}</h2>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                {currentListing.category} &rsaquo; {currentListing.subcategory} ({currentListing.businessType})
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className={`status-pill ${currentListing.status.toLowerCase()}`} style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
                {currentListing.status}
              </span>
              <button
                type="button"
                onClick={() => { setIsEditing(true); setMessage(""); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", color: "#0f172a" }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Details
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Contact Person</span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{currentListing.contactPerson || "N/A"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Mobile Number</span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{currentListing.mobile || "N/A"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Email ID</span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{currentListing.email || "N/A"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Website</span>
              <strong style={{ fontSize: "0.95rem", color: "#0284c7" }}>{currentListing.website || "N/A"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>City & State</span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{[currentListing.subcity, currentListing.city, currentListing.state].filter(Boolean).join(", ") || "N/A"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>YouTube Link</span>
              <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{currentListing.youtube || "N/A"}</strong>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", display: "grid", gap: "1rem" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Full Business Address</span>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155" }}>{currentListing.address || "N/A"}</p>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Service Keywords</span>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155" }}>{currentListing.keywords || "N/A"}</p>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", marginBottom: "0.25rem" }}>Business Description</span>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", lineHeight: "1.5" }}>{currentListing.description || "N/A"}</p>
            </div>
          </div>
        </div>
      </PanelSection>
    </MemberShell>
  );
}

export function AddListingModule() {
  return <MyBusinessListingModule />;
}

export function MyListingsModule() {
  return <MyBusinessListingModule />;
}

export function EditAccountModule() {
  return <MyBusinessListingModule />;
}

export function EnquiriesModule() {
  const [records, setRecords] = useStoredState("checkinfo-member-enquiries", enquirySeed);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void getMemberData<MemberEnquiry[]>("enquiries", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setRecords(data);
    });
  }, [setRecords]);

  const filtered = useMemo(() => records.filter((record) => [record.name, record.email, record.contact, record.message].join(" ").toLowerCase().includes(query.toLowerCase())), [query, records]);
  function status(id: string, next: MemberEnquiry["status"]) {
    setRecords(records.map((record) => record.id === id ? { ...record, status: next } : record));
    void postMemberAction("enquiry", { id, status: next });
  }
  return (
    <MemberShell active="My Enquiries">
      <AccountHeader eyebrow="Manage Enquiries" subtitle="Search buyer leads by user name, email, phone number, and date range." title="My Enquiries" />
      <PanelSection eyebrow="Filter By" title="Find enquiry records">
        <div className="member-filter"><label className="panel-field"><span>User Name / Email / Contact</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
        <div className="data-table member-table-enquiries"><div className="data-row data-head"><span>User</span><span>Email</span><span>Contact</span><span>Message</span><span>Action</span></div>{filtered.map((record) => <div className="data-row" key={record.id}><strong>{record.name}<small>{record.date}</small></strong><span>{record.email}</span><span>{record.contact}</span><span>{record.message}</span><span className="row-actions"><button type="button" onClick={() => status(record.id, "Read")}>{record.status}</button><button type="button" onClick={() => status(record.id, "Closed")}>Close</button></span></div>)}</div>
      </PanelSection>
    </MemberShell>
  );
}

export function ReviewsModule() {
  const [reviews, setReviews] = useStoredState("checkinfo-member-reviews", reviewSeed);

  useEffect(() => {
    void getMemberData<MemberReview[]>("reviews", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setReviews(data);
    });
  }, [setReviews]);

  function update(id: string, status: MemberReview["status"]) {
    setReviews(reviews.map((review) => review.id === id ? { ...review, status } : review));
    void postMemberAction("review", { id, status });
  }
  return (
    <MemberShell active="Manage Reviews">
      <AccountHeader eyebrow="Manage Reviews" subtitle="Track published, pending, and moderated customer feedback for your listing." title="Customer Reviews" />
      <PanelSection eyebrow="Reviews" title="Customer feedback">
        <div className="data-table member-table-reviews"><div className="data-row data-head"><span>Customer</span><span>Rating</span><span>Review</span><span>Status</span><span>Action</span></div>{reviews.map((review) => <div className="data-row" key={review.id}><strong>{review.author}</strong><span>{review.rating} / 5</span><span>{review.message}</span><span className={`status-pill ${review.status.toLowerCase()}`}>{review.status}</span><span className="row-actions"><button type="button" onClick={() => update(review.id, "Published")}>Publish</button><button type="button" onClick={() => update(review.id, "Hidden")}>Hide</button></span></div>)}</div>
      </PanelSection>
    </MemberShell>
  );
}

export function PackagesModule() {
  const [selectedPlan, setSelectedPlan] = useState(readStored("checkinfo-member-package", "Free Listing"));
  function choose(name: string) {
    setSelectedPlan(name);
    writeStored("checkinfo-member-package", name);
    void postMemberAction("package", { packageName: name });
  }
  return (
    <MemberShell active="Featured Packages">
      <AccountHeader eyebrow="Advertise With Us" subtitle="Choose promotion plans that help customers notice your business faster." title="Featured Packages" />
      <PanelSection eyebrow="Visibility Plans" title="Boost search discovery">
        <div className="package-grid">{packageSeed.map(([name, price, text]) => <article className="package-card" key={name}><span>{name}</span><strong>{price}</strong><p>{text}</p><button type="button" onClick={() => choose(name)}>{selectedPlan === name ? "Selected" : "Select Plan"}</button></article>)}</div>
      </PanelSection>
    </MemberShell>
  );
}

export function NotificationsModule() {
  const [notifications, setNotifications] = useStoredState("checkinfo-member-notifications", notificationSeed);

  useEffect(() => {
    void getMemberData<NotificationRecord[]>("notifications", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setNotifications(data);
    });
  }, [setNotifications]);

  function markAllRead() {
    setNotifications(notifications.map((item) => ({ ...item, unread: false })));
    void postMemberAction("notification", { action: "mark-all-read" });
  }
  return (
    <MemberShell active="Notifications">
      <AccountHeader action={<button className="primary-button" type="button" onClick={markAllRead}>Mark all read</button>} eyebrow="Notifications" subtitle="Stay updated on profile health, reviews, enquiries, and promotions." title="Activity Center" />
      <PanelSection eyebrow="Recent Updates" title="Member alerts"><div className="timeline">{notifications.map((item) => <article className="timeline-item" key={item.id}><span>{item.time}{item.unread ? " / Unread" : ""}</span><strong>{item.title}</strong><p>{item.text}</p></article>)}</div></PanelSection>
    </MemberShell>
  );
}

export function SupportModule() {
  const [tickets, setTickets] = useStoredState<SupportTicket[]>("checkinfo-member-support", []);
  const [form, setForm] = useState({ email: "", issue: "", message: "", name: "", phone: "" });
  function submit() {
    if (!form.name.trim() || !form.message.trim()) return;
    const ticket = { ...form, id: `ticket-${Date.now()}`, status: "Open" as const };
    setTickets([...tickets, ticket]);
    void postMemberAction("support", { ticket: form });
    setForm({ email: "", issue: "", message: "", name: "", phone: "" });
  }
  return (
    <MemberShell active="Support">
      <AccountHeader eyebrow="Customer Care" subtitle="Reach Checkinfo support for listing updates, enquiry issues, packages, or account help." title="Support Center" />
      <PanelSection eyebrow="Need Help?" title="Create support request">
        <div className="form-grid"><label className="panel-field"><span>Name *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="panel-field"><span>Phone Number *</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label className="panel-field"><span>Email ID</span><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="panel-field"><span>Issue Type</span><select value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })}><option value="">Select issue</option><option>Listing update</option><option>Package or payment</option><option>Enquiry issue</option><option>Account access</option></select></label><label className="panel-field wide"><span>Message *</span><textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label></div>
        <div className="member-actions"><button type="button" onClick={submit}>Submit Ticket</button></div>
        {tickets.length ? <div className="data-table member-table-support"><div className="data-row data-head"><span>Ticket</span><span>Issue</span><span>Message</span><span>Status</span></div>{tickets.map((ticket) => <div className="data-row" key={ticket.id}><strong>{ticket.name}<small>{ticket.phone}</small></strong><span>{ticket.issue || "General"}</span><span>{ticket.message}</span><span className="status-pill pending">{ticket.status}</span></div>)}</div> : null}
      </PanelSection>
    </MemberShell>
  );
}

export function ChangePasswordModule() {
  const [form, setForm] = useState({ confirm: "", next: "", old: "" });
  const [message, setMessage] = useState("Password not updated yet.");
  function update() {
    if (!form.old || !form.next || !form.confirm) setMessage("All fields are required.");
    else if (form.next.length < 8) setMessage("New password must be at least 8 characters.");
    else if (form.next !== form.confirm) setMessage("New password and confirm password do not match.");
    else { writeStored("checkinfo-member-password", { updatedAt: new Date().toISOString() }); void postMemberAction("password", { action: "update", newPassword: form.next }); setForm({ confirm: "", next: "", old: "" }); setMessage("Password updated successfully in database."); }
  }
  return (
    <MemberShell active="Change Password">
      <AccountHeader eyebrow="Change Password" subtitle="Update your member login password from this dedicated security page." title="Account Security" />
      <PanelSection eyebrow="Password" title="Set a new password">
        <div className="form-grid"><label className="panel-field"><span>Old Password *</span><input type="password" value={form.old} onChange={(event) => setForm({ ...form, old: event.target.value })} /></label><label className="panel-field"><span>New Password *</span><input type="password" value={form.next} onChange={(event) => setForm({ ...form, next: event.target.value })} /></label><label className="panel-field"><span>Confirm Password *</span><input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} /></label></div>
        <div className="member-actions"><button type="button" onClick={update}>Update</button></div><div className="member-notice">{message}</div>
      </PanelSection>
    </MemberShell>
  );
}

export function LogoutModule() {
  const [loggedOut, setLoggedOut] = useState(false);

  function handleLogoutClick() {
    const allAuthCookies = [
      "checkinfo_admin_auth",
      "checkinfo_member_auth",
      "checkinfo_user_auth",
      "checkinfo_member_id",
      "checkinfo_member_name",
      "checkinfo_user_name",
    ];
    for (const name of allAuthCookies) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
    }
    try {
      window.localStorage.removeItem("checkinfo_user_auth");
      window.localStorage.removeItem("checkinfo_user_name");
      window.localStorage.removeItem("checkinfo_member_name");
      window.localStorage.removeItem("checkinfo-member-id");
      window.localStorage.removeItem("checkinfo_visitor_profile");
      window.localStorage.removeItem("checkinfo-member-session");
    } catch {}
    setLoggedOut(true);
    window.location.href = "/api/auth/logout?role=member";
  }

  return (
    <MemberShell active="Logout">
      <AccountHeader eyebrow="Logout" subtitle="End the current member session securely." title="Ready to leave?" />
      <section className="logout-panel">
        <div>
          <h2>{loggedOut ? "Logged out" : "Logout from member panel"}</h2>
          <p>{loggedOut ? "Session cleared successfully." : "Click below to safely log out of your business member account."}</p>
        </div>
        <button type="button" onClick={handleLogoutClick}>Logout</button>
      </section>
    </MemberShell>
  );
}
