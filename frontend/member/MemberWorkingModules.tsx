"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AccountHeader,
  categories,
  EmptyState,
  imageSlots,
  MemberShell,
  PanelSection,
} from "@/frontend/member/MemberPanel";
import { indiaDistricts, indiaStates, indiaSubdistricts } from "@/frontend/admin/indiaLocations";
import { businessTaxonomy, getEffectiveTaxonomy } from "@/backend/businessTaxonomy";

type ListingStatus = "Draft" | "Pending" | "Active" | "Featured" | "Popular" | "Inactive";

type MemberListing = {
  id: string;
  address: string;
  category: string;
  contactPerson: string;
  description: string;
  email: string;
  gallery?: string[];
  keywords: string;
  image?: string;
  logo?: string;
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
  createdAt?: string;
  id: string;
  email: string;
  issue: string;
  message: string;
  name: string;
  phone: string;
  status: "Open" | "Resolved";
};

type PackageState = {
  couponCode?: string;
  invoices?: Array<{ amount: number; createdAt: string; id: string; packageName: string; status: string }>;
  packageExpiresAt?: string | null;
  packageName?: string;
  paymentStatus?: string;
  trialEndsAt?: string | null;
  walletCredits?: number;
};

function calculateProfileScore(listing?: Partial<MemberListing>) {
  if (!listing) return 0;
  const weightedFields: Array<[unknown, number]> = [
    [listing.name, 12],
    [listing.contactPerson, 8],
    [listing.mobile, 10],
    [listing.email, 8],
    [listing.address, 12],
    [listing.state, 6],
    [listing.city, 8],
    [listing.category, 8],
    [listing.subcategory, 6],
    [listing.businessType, 6],
    [listing.description, 8],
    [listing.image, 4],
    [listing.website || listing.youtube, 4],
  ];
  return Math.min(100, weightedFields.reduce((sum, [value, points]) => {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(String(value ?? "").trim());
    return sum + (filled ? points : 0);
  }, 0));
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function validateImageUpload(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return "Only JPG, PNG, WEBP, or GIF images are allowed.";
  if (file.size > 2 * 1024 * 1024) return "Image must be 2MB or smaller.";
  return "";
}

function validateProofUpload(file: File) {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return "Address proof must be PDF, JPG, PNG, or WEBP.";
  if (file.size > 4 * 1024 * 1024) return "Address proof must be 4MB or smaller.";
  return "";
}

const listingSeed: MemberListing[] = [];

const enquirySeed: MemberEnquiry[] = [];

const reviewSeed: MemberReview[] = [];

const notificationSeed: NotificationRecord[] = [];

const packageSeed = [
  ["Free Listing", "Rs 0", "Basic profile, category listing, contact visibility"],
  ["Featured Boost", "Rs 999", "Top category visibility, highlight badge, priority review"],
  ["City Leader", "Rs 2499", "Trending placement, wider city reach, weekly performance report"],
] as const;

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;

    // Auto-restore from backup key if primary key was ever cleared
    const backupRaw = window.localStorage.getItem(`backup-${key}`);
    if (backupRaw) {
      const parsed = JSON.parse(backupRaw) as T;
      window.localStorage.setItem(key, backupRaw);
      return parsed;
    }
  } catch {}
  return fallback;
}

function writeStored<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      window.localStorage.setItem(`backup-${key}`, serialized);
    } catch {}
  }
}

function getMemberId() {
  if (typeof window === "undefined") return "member-default-account";

  // 1. First try the server-set cookie (checkinfo_member_id) — set at login to actual username
  const cookieMatch = document.cookie.match(/checkinfo_member_id=([^;]+)/);
  if (cookieMatch?.[1]) {
    const fromCookie = decodeURIComponent(cookieMatch[1]).replace(/[^a-zA-Z0-9_-]/g, "");
    if (fromCookie.length > 2) {
      // Keep localStorage in sync
      try { window.localStorage.setItem("checkinfo-member-id", fromCookie); } catch {}
      return fromCookie;
    }
  }

  // 2. Fallback: localStorage (already stored from prior session)
  const stored = window.localStorage.getItem("checkinfo-member-id");
  if (stored && stored.length > 2 && stored !== "member-primary-account") return stored;

  // 3. Last resort: use a stable key (only if truly unknown — should never happen after login)
  const memberId = "member-primary-account";
  try {
    window.localStorage.setItem("checkinfo-member-id", memberId);
    document.cookie = `checkinfo_member_id=${encodeURIComponent(memberId)}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
  return memberId;
}

function memberStorageKey(key: string) {
  // Scope storage keys to logged-in member so multiple businesses on same browser don't mix data
  const mid = getMemberId();
  return `checkinfo-${mid}-${key}`;
}

function postMemberAction(resource: string, payload: Record<string, unknown>) {
  return fetch(`/api/member/${resource}`, {
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json", "x-checkinfo-member-id": getMemberId() },
    method: "POST",
  })
    .then(async (res) => {
      const json = await res.json().catch(() => ({}));
      return res.ok ? json : { ...json, ok: false };
    })
    .catch(() => ({ ok: false, message: "Network error. Changes were not saved." }));
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
  const [value, setValue] = useState(fallback);
  function sync(next: T) {
    setValue(next);
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
    gallery: [],
    keywords: "",
    image: "",
    logo: "",
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
  onSaveDraft,
}: {
  buttonLabel: string;
  initial?: Partial<MemberListing>;
  onSave: (record: Omit<MemberListing, "id" | "status">) => void | Promise<void>;
  onSaveDraft?: (record: Omit<MemberListing, "id" | "status">) => void | Promise<void>;
}) {
  const [form, setForm] = useState({ ...initialListing(), ...initial });
  const [previewOpen, setPreviewOpen] = useState(false);
  const effectiveTaxonomy = useMemo(() => getEffectiveTaxonomy(), []);
  const selectedTaxonomy = useMemo(
    () => effectiveTaxonomy.find((category) => category.name === form.category) ?? effectiveTaxonomy[0],
    [form.category, effectiveTaxonomy],
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

  function buildRecord() {
    return {
      address: form.address.trim(),
      addressProofName: form.addressProofName?.trim(),
      businessType: form.businessType.trim(),
      category: form.category,
      city: form.city.trim(),
      contactPerson: form.contactPerson.trim(),
      description: form.description.trim(),
      email: form.email.trim(),
      gallery: Array.isArray(form.gallery) ? form.gallery : [],
      image: form.image?.trim() ?? "",
      logo: form.logo?.trim() ?? "",
      keywords: form.keywords.trim(),
      location: [form.subcity, form.city, form.state].filter(Boolean).join(", "),
      mobile: form.mobile.trim(),
      name: form.name.trim(),
      state: form.state.trim(),
      subcategory: form.subcategory.trim(),
      subcity: form.subcity.trim(),
      website: form.website.trim(),
      youtube: form.youtube.trim(),
    };
  }

  function submit() {
    if (!form.name.trim() || !form.mobile.trim() || !form.email.trim() || !form.address.trim() || !form.city.trim()) return;
    onSave(buildRecord());
  }

  function saveDraft() {
    if (!form.name.trim()) return;
    void onSaveDraft?.(buildRecord());
  }

  return (
    <>
      <div className="form-grid">
        <label className="panel-field"><span>Business Name *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="panel-field"><span>Contact Person *</span><input value={form.contactPerson} onChange={(event) => setForm({ ...form, contactPerson: event.target.value })} /></label>
        <label className="panel-field"><span>Mobile Number *</span><input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
        <label className="panel-field"><span>Email ID *</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label className="panel-field">
          <span>Website URL</span>
          <input
            aria-label="Website URL"
            placeholder="https://www.xyz.com"
            value={form.website}
            onChange={(event) => setForm({ ...form, website: event.target.value })}
          />
        </label>
        <label className="panel-field">
          <span>YouTube Video URL</span>
          <input
            aria-label="YouTube Video URL"
            placeholder="https://www.youtube.com/watch?v=example"
            value={form.youtube}
            onChange={(event) => setForm({ ...form, youtube: event.target.value })}
          />
        </label>

        <label className="panel-field wide"><span>Address *</span><textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
        <label className="panel-field"><span>Main Category *</span><select value={form.category} onChange={(event) => { const next = businessTaxonomy.find((category) => category.name === event.target.value); const firstSub = next?.subcategories[0]; setForm({ ...form, businessType: firstSub?.businessTypes[0]?.name ?? "General Provider", category: event.target.value, subcategory: firstSub?.name ?? "General Services" }); }}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="panel-field">
          <span>Subcategory</span>
          <select 
            value={
              selectedTaxonomy?.subcategories.some((s) => s.name === form.subcategory) 
                ? form.subcategory 
                : (form.subcategory ? "Other" : "")
            } 
            onChange={(event) => { 
              const val = event.target.value;
              if (val === "Other") {
                setForm({ ...form, subcategory: "" });
              } else {
                const next = selectedTaxonomy?.subcategories.find((s) => s.name === val); 
                setForm({ ...form, businessType: next?.businessTypes[0]?.name ?? "General Provider", subcategory: val }); 
              }
            }}
          >
            {selectedTaxonomy?.subcategories.length 
              ? selectedTaxonomy.subcategories.map((subcategory) => <option key={subcategory.slug} value={subcategory.name}>{subcategory.name}</option>) 
              : <option value="General Services">General Services</option>
            }
            <option value="Other">Other (Type custom)</option>
          </select>
          {(!selectedTaxonomy?.subcategories.some((s) => s.name === form.subcategory)) && (
            <input 
              style={{ marginTop: '8px' }} 
              placeholder="Type custom subcategory..." 
              value={form.subcategory} 
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })} 
            />
          )}
        </label>
        <label className="panel-field"><span>Business Type</span><select value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })}>{selectedSubcategory?.businessTypes.length ? selectedSubcategory.businessTypes.map((businessType) => <option key={businessType.slug}>{businessType.name}</option>) : <option value="General Provider">General Provider</option>}</select></label>
        <label className="panel-field"><span>State *</span><select value={form.state} onChange={(event) => setForm({ ...form, city: "", state: event.target.value, subcity: "" })}>{indiaStates.map((state) => <option key={state.id}>{state.name}</option>)}</select></label>
        <label className="panel-field"><span>City / District *</span><select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value, subcity: "" })}><option value="">Select city</option>{cityOptions.map((city) => <option key={city.id}>{city.name}</option>)}</select></label>
        <label className="panel-field"><span>Subcity / Area</span><select value={form.subcity} onChange={(event) => setForm({ ...form, subcity: event.target.value })}><option value="">Optional area</option>{subcityOptions.map((subcity) => <option key={subcity.id}>{subcity.name}</option>)}</select></label>
        <label className="panel-field"><span>Service Keywords</span><input value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} /></label>
        <label className="panel-field wide"><span>Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      </div>
      <h3>Business Logo</h3>
      <div className="upload-grid optional-proof-grid" aria-label="Upload business logo">
        <label className="upload-card">
          <span>Upload Business Logo</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const error = validateImageUpload(file);
              if (error) {
                window.alert(error);
                event.currentTarget.value = "";
                return;
              }
              const dataUrl = await readImageAsDataUrl(file);
              setForm({ ...form, logo: dataUrl });
            }}
          />
          <small>Upload official business logo (PNG, JPG, SVG). Best format: Square (200x200).</small>
          {form.logo ? (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={form.logo} alt="Business logo preview" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff", padding: 4 }} />
              <button type="button" onClick={() => setForm({ ...form, logo: "" })} style={{ fontSize: "0.8rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove logo</button>
            </div>
          ) : null}
        </label>

        <label className="upload-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span>Or Logo Image URL</span>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={form.logo && !form.logo.startsWith("data:") ? form.logo : ""}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", width: "100%", boxSizing: "border-box" }}
          />
          <small>Direct image URL for your business logo icon</small>
        </label>
      </div>
      <h3>Upload Images</h3>
      <div className="upload-grid" aria-label="Upload listing images">
        {imageSlots.map((slot) => (
          <label className="upload-card" key={slot}>
            <span>{slot}</span>
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const error = validateImageUpload(file);
                if (error) {
                  window.alert(error);
                  event.currentTarget.value = "";
                  return;
                }
                const dataUrl = await readImageAsDataUrl(file);
                const gallery = Array.from(new Set([...(form.gallery ?? []), dataUrl])).slice(0, 5);
                setForm({ ...form, gallery, image: form.image || dataUrl });
              }}
            />
            <small>JPG, PNG or GIF. Best size 800 x 560.</small>
          </label>
        ))}
      </div>
      {(form.gallery?.length || form.image) ? (
        <div className="upload-grid" aria-label="Gallery preview">
          {[form.image, ...(form.gallery ?? [])].filter(Boolean).slice(0, 6).map((src, index) => (
            <div className="upload-card" key={`${src}-${index}`}>
              <img src={src} alt={`Gallery image ${index + 1}`} style={{ height: 120, objectFit: "cover", width: "100%" }} />
              <button type="button" onClick={() => setForm({ ...form, image: String(src) })}>Set primary</button>
            </div>
          ))}
        </div>
      ) : null}
      {previewOpen ? (
        <div className="member-notice" style={{ marginTop: "1rem" }}>
          <strong>Listing Preview</strong>
          <p>{form.name || "Business name"} - {form.category} / {form.subcategory}</p>
          <p>{[form.subcity, form.city, form.state].filter(Boolean).join(", ") || "Location not selected"}</p>
          <p>{form.mobile || "Phone"} | {form.email || "Email"}</p>
          <p>{form.description || "Description preview will appear here."}</p>
        </div>
      ) : null}
      <div className="member-actions">
        {onSaveDraft ? <button type="button" className="secondary-button" onClick={saveDraft}>Save Draft</button> : null}
        <button type="button" className="secondary-button" onClick={() => setPreviewOpen((open) => !open)}>{previewOpen ? "Hide Preview" : "Preview Listing"}</button>
        <button type="button" onClick={submit}>{buttonLabel}</button>
      </div>
    </>
  );
}

export function MemberDashboardModule() {
  const [listings, setListings] = useStoredState("checkinfo-member-listings", listingSeed);
  const [enquiries, setEnquiries] = useStoredState("checkinfo-member-enquiries", enquirySeed);

  useEffect(() => {
    void getMemberData<MemberListing[]>("listings", []).then((data) => {
      if (Array.isArray(data)) setListings(data);
    });
    void getMemberData<MemberEnquiry[]>("enquiries", []).then((data) => {
      if (Array.isArray(data)) setEnquiries(data);
    });
  }, []);

  const activeListings = listings.filter((listing) => listing.status === "Active" || listing.status === "Featured" || listing.status === "Popular").length;
  const newEnquiries = enquiries.filter((enquiry) => enquiry.status === "New").length;

  const profileStatus = calculateProfileScore(listings[0]);

  const dashboardCards = [
    [
      "Profile status",
      listings.length > 0 ? `${profileStatus}%` : "0%",
      listings.length > 0
        ? profileStatus === 100 ? "Profile 100% complete" : "Complete remaining details for 100%"
        : "Create your business profile to get started",
    ],
    [
      "Listings",
      listings.length > 0 ? `${activeListings} active` : "0 listings",
      listings.length > 0 ? `Total ${listings.length} registered business profile(s)` : "No business profile created yet",
    ],
    [
      "My Business Listing",
      listings.length > 0 ? `${listings[0]?.name}` : "Not Created",
      listings.length > 0 ? `Status: ${listings[0]?.status}` : "Click button above to add your business",
    ],
    [
      "Enquiries",
      `${newEnquiries} new`,
      enquiries.length > 0 ? `${enquiries.length} total customer lead(s)` : "No buyer leads received yet",
    ],
    [
      "Reach score",
      listings.some((listing) => listing.status === "Featured") ? "Featured Boost" : listings.length > 0 ? "Standard" : "Inactive",
      listings.some((listing) => listing.status === "Featured")
        ? "Highest search ranking active"
        : listings.length > 0
        ? "Upgrade package to boost reach"
        : "Publish listing to appear in customer searches",
    ],
  ];

  const quickActions = [
    ["My Business Listing", listings.length > 0 ? "View, manage, or update your business listing details." : "Publish your business listing on Checkinfo.", "/members/my_listings"],
    ["My Enquiries", "Filter and manage buyer enquiries received from listings.", "/members/enquirylisting"],
    ["Manage Reviews", "View customer feedback and moderate reviews.", "/members/reviewlisting"],
    ["Featured Packages", "Compare visibility plans and promotional placements.", "/members/packages"],
    ["Notifications", "See profile alerts, approval updates, and enquiry activity.", "/members/notifications"],
    ["Support", "Contact Checkinfo care for listing or payment help.", "/members/support"],
    ["Change Password", "Keep account login secure with a fresh password.", "/members/change_password"],
  ];

  return (
    <MemberShell active="Dashboard">
      <AccountHeader
        action={<a className="primary-button" href="/members/my_listings">{listings.length > 0 ? "My Business Listing" : "Add Business Listing"}</a>}
        eyebrow="Welcome to your account"
        subtitle="Manage listings, visibility, enquiries, reviews, support, and security from your dashboard."
        title="Your business command center"
      />
      <section className="dashboard-grid">
        {dashboardCards.map(([title, value, note]) => (
          <article className="dashboard-card" key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>
      <section className="panel-section">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Account Shortcuts</p>
            <h2>Choose a panel section</h2>
          </div>
        </div>
        <div className="shortcut-grid">
          {quickActions.map(([title, text, href]) => (
            <a className="shortcut-card" href={href} key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </a>
          ))}
        </div>
      </section>
    </MemberShell>
  );
}

function downloadVisitingCardPng(listing: MemberListing) {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.width = 1050;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Draw Right White Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1050, 600);

  // 2. Draw Left Curved Wave Gradient Background
  const grad = ctx.createLinearGradient(0, 0, 650, 600);
  grad.addColorStop(0, "#581c87");
  grad.addColorStop(0.5, "#6b21a8");
  grad.addColorStop(1, "#5b21b6");

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(540, 0);
  ctx.bezierCurveTo(650, 180, 480, 420, 570, 600);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 3. Draw Soft Secondary Curve Overlay
  ctx.beginPath();
  ctx.moveTo(540, 0);
  ctx.bezierCurveTo(670, 150, 500, 450, 620, 600);
  ctx.lineTo(570, 600);
  ctx.bezierCurveTo(480, 420, 650, 180, 540, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(196, 181, 253, 0.4)";
  ctx.fill();

  // 4. Draw Left Side Text (Name & Details)
  const name = (listing.contactPerson || listing.name || "Business Owner").toUpperCase();
  const designation = "Business Owner";
  const email = listing.email?.trim() || "";
  const phone = listing.mobile?.trim() || "";
  const address = (listing.address || listing.location || "").trim();
  const website = listing.website?.trim();
  const hasWebsite = Boolean(website && website.toLowerCase() !== "n/a" && website !== "undefined");

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(name, 50, 80);

  ctx.fillStyle = "#ddd6fe";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText(designation, 50, 115);

  const items = [];
  if (email) items.push({ text: email, symbol: "✉" });
  if (phone) items.push({ text: phone, symbol: "📞" });
  if (address) items.push({ text: address.length > 38 ? address.substring(0, 35) + "..." : address, symbol: "📍" });
  if (hasWebsite) items.push({ text: website, symbol: "🌐" });

  let startY = 220;
  items.forEach((item) => {
    ctx.beginPath();
    ctx.arc(75, startY - 6, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.symbol, 75, startY);

    ctx.textAlign = "left";
    ctx.font = "18px Arial, sans-serif";
    ctx.fillText(item.text, 115, startY);

    startY += 80;
  });

  // 5. Draw Right Side Business Name & Checkinfo Brand
  const companyName = (listing.name || "COMPANY NAME").toUpperCase();
  ctx.fillStyle = "#1e1b4b";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";

  if (companyName.length > 20) {
    const words = companyName.split(" ");
    const mid = Math.ceil(words.length / 2);
    ctx.fillText(words.slice(0, mid).join(" "), 820, 130);
    ctx.fillText(words.slice(mid).join(" "), 820, 175);
  } else {
    ctx.fillText(companyName, 820, 140);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "bold 13px Arial, sans-serif";
  ctx.fillText("VERIFIED ON CHECKINFO.IN", 820, 210);

  // 6. Draw QR Code image pointing directly to business listing page on website
  const listingPageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/search?q=${encodeURIComponent(listing.name)}`
    : `https://checkinfo.in/search?q=${encodeURIComponent(listing.name)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(listingPageUrl)}`;

  const qrImg = new Image();
  qrImg.crossOrigin = "anonymous";

  function triggerDownload() {
    const link = document.createElement("a");
    link.download = `${companyName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Visiting_Card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  qrImg.onload = () => {
    ctx.drawImage(qrImg, 710, 260, 220, 220);
    triggerDownload();
  };

  qrImg.onerror = () => {
    triggerDownload();
  };

  qrImg.src = qrUrl;
}

function DigitalVisitingCard({ listing }: { listing: MemberListing }) {
  const name = listing.contactPerson || listing.name || "Business Owner";
  const companyName = listing.name || "Your Company Name";
  const email = listing.email || "owner@business.com";
  const phone = listing.mobile || "+91 98765 43210";
  const address = listing.address || listing.location || "Business Address, India";
  const website = listing.website?.trim();
  const hasWebsite = Boolean(website && website.toLowerCase() !== "n/a" && website !== "undefined");
  const listingPageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/search?q=${encodeURIComponent(listing.name)}`
    : `https://checkinfo.in/search?q=${encodeURIComponent(listing.name)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(listingPageUrl)}`;

  return (
    <div className="visiting-card-container" style={{ marginBottom: "2rem", display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#0f172a" }}>Digital Business Visiting Card</h3>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>Autofetched from your business listing details. Ready to share or download.</p>
        </div>
        <button
          type="button"
          onClick={() => downloadVisitingCardPng(listing)}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px", borderRadius: "8px", background: "linear-gradient(135deg, #6d28d9, #4c1d95)", color: "#ffffff", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: "700", boxShadow: "0 6px 18px rgba(109, 40, 217, 0.28)", transition: "transform 180ms ease, box-shadow 180ms ease" }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download Business Card 📥
        </button>
      </div>

      <div
        className="visiting-card-preview"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "640px",
          height: "350px",
          borderRadius: "20px",
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #cbd5e1",
          fontFamily: "Arial, sans-serif",
          display: "flex",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: "58%",
            background: "linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #5b21b6 100%)",
            clipPath: "ellipse(95% 140% at 0% 50%)",
            zIndex: 1,
            padding: "2rem",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: "800", letterSpacing: "0.02em", color: "#ffffff", textTransform: "uppercase" }}>
              {name}
            </h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#ddd6fe", fontWeight: "500" }}>
              Business Owner
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.6rem", fontSize: "0.8rem" }}>
            {email ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", fontSize: "0.75rem" }}>✉</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "210px" }}>{email}</span>
              </div>
            ) : null}
            {phone ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", fontSize: "0.75rem" }}>📞</span>
                <span>{phone}</span>
              </div>
            ) : null}
            {address ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", fontSize: "0.75rem" }}>📍</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "210px" }}>{address}</span>
              </div>
            ) : null}
            {hasWebsite ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", fontSize: "0.75rem" }}>🌐</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "210px" }}>{website}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            marginLeft: "auto",
            width: "48%",
            padding: "1.75rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <img src="/logo.png" alt="Checkinfo" style={{ height: "26px", width: "auto", marginBottom: "0.5rem" }} />
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#1e1b4b", textTransform: "uppercase", lineHeight: "1.2" }}>
            {companyName}
          </h3>
          <span style={{ fontSize: "0.65rem", fontWeight: "800", letterSpacing: "0.08em", color: "#64748b", margin: "0.25rem 0 0.85rem", textTransform: "uppercase" }}>
            VERIFIED ON CHECKINFO
          </span>

          <div style={{ padding: "6px", background: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
            <img src={qrUrl} alt="Business QR Code" style={{ width: "105px", height: "105px", display: "block" }} />
          </div>
        </div>
      </div>
    </div>
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

  function saveGlobalRegisteredListing(listing: MemberListing) {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("checkinfo-all-registered-listings");
      const existing = raw ? (JSON.parse(raw) as MemberListing[]) : [];
      const updated = [listing, ...existing.filter((item) => item.id !== listing.id)];
      window.localStorage.setItem("checkinfo-all-registered-listings", JSON.stringify(updated));
    } catch {}
  }

  async function persistListing(record: Omit<MemberListing, "id" | "status">, mode: "submit" | "draft") {
    if (hasListing && currentListing) {
      const updated: MemberListing = { ...currentListing, ...record, status: mode === "draft" ? "Draft" : "Pending" };
      const response = await postMemberAction("listing", { action: mode === "draft" ? "update-draft" : "update", id: currentListing.id, record });
      if (!response?.ok) {
        setMessage(response?.message || "Business details could not be saved. Please try again.");
        return;
      }
      const serverListings = response?.data?.listings;
      const nextListings = Array.isArray(serverListings) && serverListings.length ? serverListings as MemberListing[] : [updated];
      setListings(nextListings);
      saveGlobalRegisteredListing(nextListings[0]);
      setMessage(mode === "draft"
        ? "Draft saved successfully. You can submit it for admin approval when ready."
        : "Business details updated successfully. Your listing is pending admin review and will update on the website after approval.");
    } else {
      const newListing: MemberListing = {
        ...record,
        id: `list-${Date.now()}`,
        status: mode === "draft" ? "Draft" : "Pending",
      };
      const response = await postMemberAction("listing", { action: mode === "draft" ? "draft" : "create", record: newListing });
      if (!response?.ok) {
        setMessage(response?.message || "Business profile could not be saved. Please try again.");
        return;
      }
      const serverListing = response?.data?.listing as MemberListing | undefined;
      const nextListing = serverListing || newListing;
      setListings([nextListing]);
      saveGlobalRegisteredListing(nextListing);
      setMessage(mode === "draft"
        ? "Business draft saved successfully. It will stay private until you submit it for approval."
        : "Business profile created successfully. It is pending admin approval and will go live once approved.");
    }
    setIsEditing(false);
  }

  async function handleSaveListing(record: Omit<MemberListing, "id" | "status">) {
    await persistListing(record, "submit");
  }

  async function handleSaveDraft(record: Omit<MemberListing, "id" | "status">) {
    await persistListing(record, "draft");
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
            onSaveDraft={handleSaveDraft}
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
            onSaveDraft={handleSaveDraft}
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

      <PanelSection eyebrow="Business Visiting Card" title="Digital Business Card">
        <DigitalVisitingCard listing={currentListing} />
      </PanelSection>

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
                {currentListing.status === "Pending" ? "⏳ Pending Approval" : currentListing.status}
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

          {/* Admin Approval Workflow Status Banner */}
          {currentListing.status === "Pending" ? (
            <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: "10px", padding: "0.95rem 1.25rem", color: "#92400e", display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>⏳</span>
              <div>
                <strong style={{ fontSize: "0.925rem", display: "block", color: "#78350f" }}>Listing Submitted — Pending Admin Approval</strong>
                <span style={{ fontSize: "0.825rem", color: "#92400e" }}>
                  Your business profile is currently under review by Admin. As soon as Administrator approves it, your business will go live on Checkinfo public search and category listings.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ background: "#f0fdf4", border: "1px solid #22c55e", borderRadius: "10px", padding: "0.95rem 1.25rem", color: "#14532d", display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>✅</span>
              <div>
                <strong style={{ fontSize: "0.925rem", display: "block", color: "#15803d" }}>Listing Approved & Live on Checkinfo!</strong>
                <span style={{ fontSize: "0.825rem", color: "#166534" }}>
                  Your business profile is active and publicly visible to customers searching for services in your area.
                </span>
              </div>
            </div>
          )}

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
  const [statusFilter, setStatusFilter] = useState<"All" | MemberEnquiry["status"]>("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    void getMemberData<MemberEnquiry[]>("enquiries", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setRecords(data);
    });
  }, [setRecords]);

  const filtered = useMemo(() => records.filter((record) => {
    const matchesQuery = [record.name, record.email, record.contact, record.message].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date.toLowerCase().includes(dateFilter.toLowerCase());
    return matchesQuery && matchesStatus && matchesDate;
  }), [dateFilter, query, records, statusFilter]);
  async function status(id: string, next: MemberEnquiry["status"]) {
    const response = await postMemberAction("enquiry", { id, status: next });
    if (!response?.ok) return;
    const serverRecords = response?.data?.enquiries;
    if (Array.isArray(serverRecords)) setRecords(serverRecords);
  }
  return (
    <MemberShell active="My Enquiries">
      <AccountHeader eyebrow="Manage Enquiries" subtitle="Search buyer leads by user name, email, phone number, and date range." title="My Enquiries" />
      <PanelSection eyebrow="Filter By" title="Find enquiry records">
        <div className="member-filter">
          <label className="panel-field"><span>User Name / Email / Contact</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." /></label>
          <label className="panel-field"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option>All</option><option>New</option><option>Read</option><option>Closed</option></select></label>
          <label className="panel-field"><span>Date</span><input value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} placeholder="14 Aug 2026" /></label>
          <button type="button" className="secondary-button" onClick={() => { setQuery(""); setStatusFilter("All"); setDateFilter(""); }}>Clear</button>
        </div>
        {filtered.length > 0 ? (
          <div className="data-table member-table-enquiries">
            <div className="data-row data-head"><span>User</span><span>Email</span><span>Contact</span><span>Message</span><span>Action</span></div>
            {filtered.map((record) => (
              <div className="data-row" key={record.id}>
                <strong>{record.name}<small>{record.date}</small></strong>
                <span>{record.email}</span>
                <span>{record.contact}</span>
                <span>{record.message}</span>
                <span className="row-actions">
                  <button type="button" onClick={() => status(record.id, "Read")}>{record.status}</button>
                  <button type="button" onClick={() => status(record.id, "Closed")}>Close</button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No Enquiries Received" text="When customers contact your business listing on Checkinfo, their enquiries will appear here." />
        )}
      </PanelSection>
    </MemberShell>
  );
}

export function ReviewsModule() {
  const [reviews, setReviews] = useStoredState("checkinfo-member-reviews", reviewSeed);
  const [statusFilter, setStatusFilter] = useState<"All" | MemberReview["status"]>("All");
  const [minimumRating, setMinimumRating] = useState("0");

  useEffect(() => {
    void getMemberData<MemberReview[]>("reviews", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setReviews(data);
    });
  }, [setReviews]);

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const matchesStatus = statusFilter === "All" || review.status === statusFilter;
    const matchesRating = review.rating >= Number(minimumRating || 0);
    return matchesStatus && matchesRating;
  }), [minimumRating, reviews, statusFilter]);

  async function update(id: string, status: MemberReview["status"]) {
    const response = await postMemberAction("review", { id, status });
    if (!response?.ok) return;
    const serverReviews = response?.data?.reviews;
    if (Array.isArray(serverReviews)) setReviews(serverReviews);
  }
  return (
    <MemberShell active="Manage Reviews">
      <AccountHeader eyebrow="Manage Reviews" subtitle="Track published, pending, and moderated customer feedback for your listing." title="Customer Reviews" />
      <PanelSection eyebrow="Reviews" title="Customer feedback">
        <div className="member-filter">
          <label className="panel-field"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option>All</option><option>Pending</option><option>Published</option><option>Hidden</option></select></label>
          <label className="panel-field"><span>Minimum Rating</span><select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}><option value="0">All ratings</option><option value="3">3+ stars</option><option value="4">4+ stars</option><option value="5">5 stars</option></select></label>
        </div>
        {filteredReviews.length > 0 ? (
          <div className="data-table member-table-reviews">
            <div className="data-row data-head"><span>Customer</span><span>Rating</span><span>Review</span><span>Status</span><span>Action</span></div>
            {filteredReviews.map((review) => (
              <div className="data-row" key={review.id}>
                <strong>{review.author}</strong>
                <span>{review.rating} / 5</span>
                <span>{review.message}</span>
                <span className={`status-pill ${review.status.toLowerCase()}`}>{review.status}</span>
                <span className="row-actions">
                  <button type="button" onClick={() => update(review.id, "Published")}>Publish</button>
                  <button type="button" onClick={() => update(review.id, "Hidden")}>Hide</button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No Reviews Yet" text="Ratings and reviews submitted by customers for your business will appear here." />
        )}
      </PanelSection>
    </MemberShell>
  );
}

interface PackagePlan {
  id: string;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  badge?: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
}

const featuredPackagesData: PackagePlan[] = [
  {
    id: "Free Listing",
    name: "Free Listing",
    price: "₹0",
    period: "Forever Free",
    description: "Standard business profile for local category discovery and basic search placement.",
    features: [
      { text: "Standard Category & Location Listing", included: true },
      { text: "Contact Name, Mobile & Address Display", included: true },
      { text: "Top Category Priority Ranking", included: false },
      { text: "Featured Search Badge & Highlight Border", included: false },
      { text: "Verified QR Code & Instant Buyer Leads", included: false },
    ],
  },
  {
    id: "Featured Boost",
    name: "Featured Boost",
    price: "₹999",
    period: "per year",
    popular: true,
    badge: "MOST POPULAR",
    description: "Maximum visibility package for top search placement and verified buyer trust.",
    features: [
      { text: "Standard Category & Location Listing", included: true },
      { text: "Contact Name, Mobile & Address Display", included: true },
      { text: "Top Category Priority Ranking", included: true },
      { text: "Featured Search Badge & Highlight Border", included: true },
      { text: "City Leader Homepage Placement", included: false },
    ],
  },
  {
    id: "City Leader",
    name: "City Leader",
    price: "₹2,499",
    period: "per year",
    badge: "PREMIUM PRO",
    description: "Ultimate business growth package with city-wide prime placement & priority support.",
    features: [
      { text: "Standard Category & Location Listing", included: true },
      { text: "Contact Name, Mobile & Address Display", included: true },
      { text: "Top Category Priority Ranking", included: true },
      { text: "Featured Search Badge & Highlight Border", included: true },
      { text: "City Leader Banner & Priority 24/7 Care", included: true },
    ],
  },
];

export function PackagesModule() {
  const [couponCode, setCouponCode] = useState("");
  const [invoices, setInvoices] = useState<NonNullable<PackageState["invoices"]>>([]);
  const [paymentStatus, setPaymentStatus] = useState("Free");
  const [selectedPlan, setSelectedPlan] = useState("Free Listing");
  const [packageExpiresAt, setPackageExpiresAt] = useState<string | null>(null);
  const [walletCredits, setWalletCredits] = useState(0);

  useEffect(() => {
    void getMemberData<PackageState>("package", { packageName: "Free Listing", packageExpiresAt: null }).then((data) => {
      if (data && typeof data === "object") {
        setCouponCode(data.couponCode ?? "");
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
        if (typeof data.packageName === "string") setSelectedPlan(data.packageName);
        setPackageExpiresAt(data.packageExpiresAt ?? null);
        setPaymentStatus(data.paymentStatus ?? "Free");
        setWalletCredits(Number(data.walletCredits ?? 0));
      }
    });
  }, []);

  async function choose(name: string, action = "select") {
    const response = await postMemberAction("package", { action, couponCode, packageName: name });
    if (!response?.ok) return;
    const savedPlan = response?.data?.packageName;
    if (typeof savedPlan === "string") setSelectedPlan(savedPlan);
    setPackageExpiresAt(response?.data?.packageExpiresAt ?? null);
    setPaymentStatus(response?.data?.paymentStatus ?? paymentStatus);
    setWalletCredits(Number(response?.data?.walletCredits ?? walletCredits));
    if (response?.data?.invoice) setInvoices([response.data.invoice, ...invoices]);
  }

  return (
    <MemberShell active="Featured Packages">
      <AccountHeader
        eyebrow="Advertise With Us"
        subtitle="Choose promotion plans that help customers notice your business faster."
        title="Featured Packages"
      />
      <PanelSection eyebrow="Visibility Plans" title="Boost Search & Customer Discovery">
        <div className="member-notice" style={{ marginBottom: "1rem" }}>
          {packageExpiresAt
            ? `Active package: ${selectedPlan}. ${paymentStatus} status. Expires on ${new Date(packageExpiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}. Renewal reminder active.`
            : `Active package: ${selectedPlan}. No paid package expiry is active.`}
        </div>
        <div className="member-filter" style={{ marginBottom: "1rem" }}>
          <label className="panel-field"><span>Coupon Code</span><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="CHECKINFO20" /></label>
          <div className="member-notice" style={{ alignSelf: "end", margin: 0 }}>Wallet credits: {walletCredits}</div>
        </div>
        <div className="modern-package-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "0.5rem" }}>
          {featuredPackagesData.map((pkg) => {
            const isSelected = selectedPlan === pkg.name;
            return (
              <article
                key={pkg.id}
                style={{
                  position: "relative",
                  background: pkg.popular
                    ? "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                    : "#ffffff",
                  border: isSelected
                    ? "2px solid #2563eb"
                    : pkg.popular
                    ? "2px solid #6366f1"
                    : "1px solid #cbd5e1",
                  borderRadius: "16px",
                  padding: "1.75rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: pkg.popular
                    ? "0 20px 40px rgba(99, 102, 241, 0.12), 0 2px 6px rgba(0,0,0,0.05)"
                    : "0 4px 20px rgba(15, 23, 42, 0.05)",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                }}
              >
                {pkg.badge ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "20px",
                      padding: "4px 14px",
                      borderRadius: "999px",
                      background: pkg.popular
                        ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                        : "linear-gradient(135deg, #0f172a, #334155)",
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {pkg.badge}
                  </span>
                ) : null}

                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                    {pkg.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "0.75rem 0 0.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>{pkg.price}</span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>/ {pkg.period}</span>
                  </div>
                  <p style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", color: "#475569", lineHeight: "1.45" }}>
                    {pkg.description}
                  </p>

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.25rem", display: "grid", gap: "0.75rem" }}>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.85rem" }}>
                        {feat.included ? (
                          <span style={{ color: "#16a34a", fontWeight: "800", fontSize: "1rem", lineHeight: "1" }}>✔</span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontWeight: "800", fontSize: "0.9rem", lineHeight: "1" }}>✖</span>
                        )}
                        <span style={{ color: feat.included ? "#1e293b" : "#94a3b8", fontWeight: feat.included ? "500" : "400" }}>
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => choose(pkg.name)}
                    style={{
                      width: "100%",
                      padding: "11px 20px",
                      borderRadius: "10px",
                      background: isSelected
                        ? "linear-gradient(135deg, #16a34a, #15803d)"
                        : pkg.popular
                        ? "linear-gradient(90deg, #1e293b 0%, #334155 45%, #2563eb 100%)"
                        : "linear-gradient(135deg, #0f172a, #1e293b)",
                      backgroundSize: pkg.popular ? "220% 100%" : "auto",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      boxShadow: isSelected
                        ? "0 4px 14px rgba(22, 163, 74, 0.28)"
                        : "0 4px 14px rgba(15, 23, 42, 0.18)",
                      transition: "all 500ms ease",
                    }}
                  >
                    {isSelected ? "✔ Currently Active Plan" : `Select ${pkg.name}`}
                  </button>
                  {pkg.name !== "Free Listing" ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => choose(`${pkg.name} Trial`, "trial")}
                      style={{ marginTop: "0.6rem", width: "100%" }}
                    >
                      Start 14 Day Trial
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
        {invoices.length ? (
          <div className="data-table" style={{ marginTop: "1.25rem" }}>
            <div className="data-row data-head"><span>Invoice</span><span>Package</span><span>Amount</span><span>Status</span></div>
            {invoices.slice(0, 5).map((invoice) => (
              <div className="data-row" key={invoice.id}>
                <span>{invoice.id}<small>{new Date(invoice.createdAt).toLocaleDateString("en-IN")}</small></span>
                <span>{invoice.packageName}</span>
                <span>Rs {invoice.amount}</span>
                <span className="status-pill active">{invoice.status}</span>
              </div>
            ))}
          </div>
        ) : null}
      </PanelSection>
    </MemberShell>
  );
}

export function NotificationsModule() {
  const [notifications, setNotifications] = useStoredState<NotificationRecord[]>("checkinfo-member-notifications", []);
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  useEffect(() => {
    void getMemberData<NotificationRecord[]>("notifications", []).then((data) => {
      if (Array.isArray(data)) setNotifications(data);
    });
  }, [setNotifications]);

  const visibleNotifications = useMemo(() => notifications.filter((item) => filter === "All" || item.unread), [filter, notifications]);
  const unreadCount = notifications.filter((item) => item.unread).length;

  async function markAllRead() {
    const updated = notifications.map((item) => ({ ...item, unread: false }));
    setNotifications(updated);
    const response = await postMemberAction("notification", { action: "mark-all-read" });
    if (response?.ok && Array.isArray(response?.data?.notifications)) {
      setNotifications(response.data.notifications);
    }
  }

  async function clearAll() {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setNotifications([]);
    await postMemberAction("notification", { action: "clear-all" });
  }

  return (
    <MemberShell active="Notifications">
      <AccountHeader
        action={
          notifications.length > 0 ? (
            <div style={{ display: "flex", gap: "10px" }}>
              {unreadCount > 0 ? (
                <button className="primary-button" type="button" onClick={markAllRead}>
                  Mark all read
                </button>
              ) : null}
              <button className="secondary-button" type="button" onClick={clearAll} style={{ color: "#ef4444", borderColor: "#fca5a5" }}>
                Clear all
              </button>
            </div>
          ) : undefined
        }
        eyebrow="Notifications"
        subtitle="Stay updated on profile health, reviews, enquiries, and promotions."
        title="Activity Center"
      />
      <PanelSection eyebrow="Recent Updates" title="Member alerts">
        <div className="member-filter">
          <label className="panel-field">
            <span>View</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              <option value="All">All Notifications ({notifications.length})</option>
              <option value="Unread">Unread Only ({unreadCount})</option>
            </select>
          </label>
          <div className="member-notice" style={{ alignSelf: "end", margin: 0, fontWeight: 600 }}>
            {unreadCount > 0 ? `🔴 ${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}` : "🟢 All caught up!"}
          </div>
        </div>

        {visibleNotifications.length > 0 ? (
          <div className="timeline">
            {visibleNotifications.map((item) => (
              <article
                className="timeline-item"
                key={item.id}
                style={{
                  borderLeft: item.unread ? "4px solid #2563eb" : "4px solid #cbd5e1",
                  background: item.unread ? "#f8fafc" : "#ffffff",
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  marginBottom: "0.75rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{item.title}</strong>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                    {item.time} {item.unread ? <b style={{ color: "#2563eb", marginLeft: "6px" }}>• NEW</b> : null}
                  </span>
                </div>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: "1.45" }}>{item.text}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No Notifications" text="Alerts regarding profile verification status, new buyer enquiries, and account updates will appear here." />
        )}
      </PanelSection>
    </MemberShell>
  );
}

export function SupportModule() {
  const [tickets, setTickets] = useStoredState<SupportTicket[]>("checkinfo-member-support", []);
  const [form, setForm] = useState({ email: "", issue: "", message: "", name: "", phone: "" });
  const [ticketFilter, setTicketFilter] = useState<"All" | SupportTicket["status"]>("All");

  useEffect(() => {
    void getMemberData<SupportTicket[]>("tickets", []).then((data) => {
      if (Array.isArray(data) && data.length > 0) setTickets(data);
    });
  }, [setTickets]);

  const visibleTickets = useMemo(() => tickets.filter((ticket) => ticketFilter === "All" || ticket.status === ticketFilter), [ticketFilter, tickets]);

  const [successMessage, setSuccessMessage] = useState("");

  async function submit() {
    if (!form.name.trim() || !form.message.trim()) {
      window.alert("Please fill in your Name and Message.");
      return;
    }
    const response = await postMemberAction("support", { ticket: form });
    if (!response?.ok) {
      window.alert("Failed to submit support ticket. Please try again.");
      return;
    }
    const serverTickets = response?.data?.tickets;
    if (Array.isArray(serverTickets)) {
      setTickets(serverTickets);
      setForm({ email: "", issue: "", message: "", name: "", phone: "" });
      setSuccessMessage("🎉 Support ticket submitted! Checkinfo Admin team has received your ticket.");
    }
  }
  return (
    <MemberShell active="Support">
      <AccountHeader eyebrow="Customer Care" subtitle="Reach Checkinfo support for listing updates, enquiry issues, packages, or account help." title="Support Center" />
      <PanelSection eyebrow="Need Help?" title="Create support request">
        {successMessage ? (
          <div className="member-notice" style={{ background: "#f0fdf4", borderColor: "#86efac", color: "#166534", marginBottom: "1rem", fontWeight: 600 }}>
            {successMessage}
          </div>
        ) : null}
        <div className="form-grid"><label className="panel-field"><span>Name *</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="panel-field"><span>Phone Number *</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label className="panel-field"><span>Email ID</span><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="panel-field"><span>Issue Type</span><select value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })}><option value="">Select issue</option><option>Listing update</option><option>Package or payment</option><option>Enquiry issue</option><option>Account access</option></select></label><label className="panel-field wide"><span>Message *</span><textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label></div>
        <div className="member-actions"><button type="button" onClick={submit}>Submit Ticket</button></div>
        {tickets.length ? (
          <>
            <div className="member-filter"><label className="panel-field"><span>Ticket Status</span><select value={ticketFilter} onChange={(event) => setTicketFilter(event.target.value as typeof ticketFilter)}><option>All</option><option>Open</option><option>Resolved</option></select></label></div>
            <div className="data-table member-table-support"><div className="data-row data-head"><span>Ticket</span><span>Issue</span><span>Created</span><span>Message</span><span>Status</span></div>{visibleTickets.map((ticket) => <div className="data-row" key={ticket.id}><strong>{ticket.name}<small>{ticket.phone}</small></strong><span>{ticket.issue || "General"}</span><span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-IN") : "New"}</span><span>{ticket.message}</span><span className="status-pill pending">{ticket.status}</span></div>)}</div>
          </>
        ) : null}
      </PanelSection>
    </MemberShell>
  );
}

export function ChangePasswordModule() {
  const [form, setForm] = useState({ confirm: "", next: "", old: "" });
  const [message, setMessage] = useState("Password not updated yet.");
  async function update() {
    if (!form.old || !form.next || !form.confirm) setMessage("All fields are required.");
    else if (form.next.length < 8) setMessage("New password must be at least 8 characters.");
    else if (form.next !== form.confirm) setMessage("New password and confirm password do not match.");
    else {
      const response = await postMemberAction("password", { action: "update", newPassword: form.next });
      if (!response?.ok) {
        setMessage("Password could not be saved. Please try again.");
        return;
      }
      writeStored("checkinfo-member-password", { updatedAt: new Date().toISOString() });
      setForm({ confirm: "", next: "", old: "" });
      setMessage("Password updated successfully in database.");
    }
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
