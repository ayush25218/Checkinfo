"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "@/backend/checkinfo";
import { businessTaxonomy } from "@/backend/businessTaxonomy";
import {
  indiaCities,
  indiaDistricts,
  indiaLocationSourceNote,
  indiaStates,
  indiaSubdistricts,
} from "./indiaLocations";

type Status = "Active" | "Inactive" | "Pending" | "Draft" | "Featured";

type CategoryRecord = {
  id: string;
  image: string;
  name: string;
  order: number;
  status: "Active" | "Inactive";
  homeBottom: boolean;
  homeTop: boolean;
};

type BusinessRecord = {
  id: string;
  address: string;
  addressProofName?: string;
  badge: string;
  businessType?: string;
  category: string;
  city?: string;
  contact: string;
  details: string;
  location?: string;
  name: string;
  ownerEmail?: string;
  ownerId?: string;
  ownerName?: string;
  publicPath?: string;
  state?: string;
  status: Status;
  subcategory?: string;
  subcity?: string;
};

type MemberRecord = {
  id: string;
  email: string;
  name: string;
  phone: string;
  registeredAt: string;
  status: "Active" | "Inactive";
  username: string;
};

type NewsletterRecord = {
  id: string;
  email: string;
  joinedAt: string;
  lastSent: string;
  status: "Subscribed" | "Unsubscribed";
};

type StateRecord = {
  id: string;
  country: string;
  name: string;
  status: "Active" | "Inactive";
};

type CityRecord = {
  id: string;
  country: string;
  name: string;
  state: string;
  status: "Active" | "Inactive";
};

type LocationRecord = {
  city?: string;
  country: string;
  district?: string;
  id: string;
  kind: "District" | "Sub-district" | "City";
  name: string;
  state: string;
  status: "Active" | "Inactive";
};

type LocationAdminRecord = StateRecord | CityRecord | LocationRecord;

type MetaRecord = {
  id: string;
  description: string;
  keywords: string;
  title: string;
  url: string;
};

type SubadminRecord = {
  id: string;
  email: string;
  name: string;
  phone: string;
  registeredAt: string;
  status: "Active" | "Inactive";
  username: string;
};

type AdminSettingsRecord = {
  address: string;
  analyticsId: string;
  email: string;
  facebook: string;
  instagram: string;
  mapEmbed: string;
  phone: string;
  webCode: string;
  youtube: string;
};

type StaticPageRecord = {
  id: string;
  content: string;
  slug: string;
  status: "Active" | "Inactive";
  title: string;
};

type EnquiryRecord = {
  id: string;
  email: string;
  message: string;
  name: string;
  phone: string;
  receivedAt: string;
  status: "New" | "Replied" | "Closed";
  type: "Contact" | "Business" | "Career" | "Advertise";
};

type MediaRecord = {
  id: string;
  image: string;
  lineOne: string;
  lineTwo: string;
  position: string;
  status: "Active" | "Inactive";
};

type TestimonialRecord = {
  id: string;
  description: string;
  name: string;
  order: number;
  status: "Active" | "Inactive";
};

type FaqRecord = {
  answer: string;
  id: string;
  order: number;
  question: string;
  status: "Active" | "Inactive";
};

const categorySeed: CategoryRecord[] = categories.map((name, index) => ({
  id: `cat-${index + 1}`,
  image: "Image",
  name,
  order: (index + 1) * 10,
  status: "Active",
  homeBottom: index > 3 && index < 8,
  homeTop: index < 4,
}));

const businessSeed: BusinessRecord[] = [];

const memberSeed: MemberRecord[] = [];

const newsletterSeed: NewsletterRecord[] = [];

const stateSeed: StateRecord[] = indiaStates;

const citySeed: CityRecord[] = indiaCities;

const locationSeed: LocationRecord[] = [];

const metaSeed: MetaRecord[] = [
  {
    id: "meta-1",
    description: "Find trusted local businesses and service providers on Checkinfo.",
    keywords: "business directory, local search, india services",
    title: "Checkinfo - India Business Directory",
    url: "/",
  },
  {
    id: "meta-2",
    description: "Compare website developers, agencies, and digital partners near you.",
    keywords: "website developer, digital marketing, web agency",
    title: "Website Developer Listings",
    url: "/category/website-developer",
  },
];

const subadminSeed: SubadminRecord[] = [];

const adminSettingsSeed: AdminSettingsRecord = {
  address: "New Delhi, India",
  analyticsId: "",
  email: "info@checkinfo.in",
  facebook: "",
  instagram: "",
  mapEmbed: "",
  phone: "9718-290-290",
  webCode: "",
  youtube: "",
};

const staticPageSeed: StaticPageRecord[] = [
  { id: "page-1", content: "About Checkinfo business directory.", slug: "about-us", status: "Active", title: "About Us" },
  { id: "page-2", content: "Privacy policy content goes here.", slug: "privacy-policy", status: "Active", title: "Privacy Policy" },
  { id: "page-3", content: "Terms and conditions content goes here.", slug: "terms", status: "Active", title: "Terms & Conditions" },
];

const enquirySeed: EnquiryRecord[] = [];

const bannerSeed: MediaRecord[] = [
  { id: "ban-1", image: "home-middle-small.jpg", lineOne: "Featured local businesses", lineTwo: "Promote your brand", position: "Home Page Middle Small", status: "Active" },
  { id: "ban-2", image: "home-middle-big.jpg", lineOne: "Top business ads", lineTwo: "High visibility placement", position: "Home Page Middle Big", status: "Active" },
];

const headerImageSeed: MediaRecord[] = [
  { id: "head-1", image: "header-search.jpg", lineOne: "Search any Business Details here", lineTwo: "Local Search Engine", position: "Website Header", status: "Active" },
];

const testimonialSeed: TestimonialRecord[] = [];

const faqSeed: FaqRecord[] = [
  { answer: "Search by service or city and open the business listing.", id: "faq-1", order: 10, question: "How to find a business?", status: "Active" },
  { answer: "Business owners can post an ad from the website or member panel.", id: "faq-2", order: 20, question: "How to list my business?", status: "Active" },
];

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
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function isImageValue(value: string) {
  return /^(data:image\/|https?:\/\/|\/)/i.test(value) || /\.(svg|png|jpe?g|webp|gif)$/i.test(value);
}

function categoryImageSource(value: string) {
  if (/^(data:image\/|https?:\/\/|\/)/i.test(value)) return value;
  return `/uploads/${value}`;
}

function toggleSelection(selected: string[], id: string, checked: boolean) {
  return checked ? [...selected, id] : selected.filter((selectedId) => selectedId !== id);
}

async function getAdminData<T>(resource: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`/api/admin/${resource}`, { cache: "no-store" });
    const payload = await response.json() as { data?: T };
    return payload.data ?? fallback;
  } catch {
    return fallback;
  }
}

async function postAdminAction(resource: string, payload: Record<string, unknown>) {
  try {
    const response = await fetch(`/api/admin/${resource}`, {
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    return await response.json() as { data?: { business?: BusinessRecord[]; members?: MemberRecord[] } };
  } catch {
    return {};
  }
}

export function ManageCategoriesModule() {
  const [records, setRecords] = useState(() =>
    readStored("checkinfo-admin-categories-v2", categorySeed),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedMain, setSelectedMain] = useState<string>(businessTaxonomy[0]?.slug ?? "");
  const [openSubcategories, setOpenSubcategories] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [form, setForm] = useState({
    image: "Image",
    name: "",
    order: "",
    status: "Active" as "Active" | "Inactive",
    homeBottom: false,
    homeTop: false,
  });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<CategoryRecord[]>("categories", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-categories-v2", data);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    return records
      .filter((record) => record.name.toLowerCase().includes(query.toLowerCase()))
      .filter((record) => status === "All" || record.status === status)
      .sort((a, b) => a.order - b.order);
  }, [query, records, status]);
  const visibleTaxonomy = useMemo(() => {
    const term = query.trim().toLowerCase();
    const recordByName = new Map(records.map((record) => [record.name, record]));

    return businessTaxonomy
      .map((category) => ({ category, record: recordByName.get(category.name) }))
      .filter(({ category, record }) => {
        const statusMatch = status === "All" || (record?.status ?? "Active") === status;
        if (!statusMatch) return false;
        if (!term) return true;

        return [
          category.name,
          ...category.subcategories.map((subcategory) => subcategory.name),
          ...category.subcategories.flatMap((subcategory) => subcategory.businessTypes.map((businessType) => businessType.name)),
        ].join(" ").toLowerCase().includes(term);
      });
  }, [query, records, status]);
  const activeMain = visibleTaxonomy.find((item) => item.category.slug === selectedMain)?.category ?? visibleTaxonomy[0]?.category ?? businessTaxonomy[0];
  const categoryStats = {
    main: businessTaxonomy.length,
    subcategories: businessTaxonomy.reduce((total, category) => total + category.subcategories.length, 0),
    types: businessTaxonomy.reduce((total, category) => total + category.subcategories.reduce((sum, subcategory) => sum + subcategory.businessTypes.length, 0), 0),
  };

  function sync(next: CategoryRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-categories-v2", next);
    writeStored("checkinfo-admin-categories", next);
  }

  function resetForm() {
    setEditing(null);
    setShowCategoryForm(false);
    setForm({
      image: "Image",
      name: "",
      order: "",
      status: "Active",
      homeBottom: false,
      homeTop: false,
    });
  }

  function saveRecord() {
    if (!form.name.trim()) return;

    const nextRecord: CategoryRecord = {
      id: editing?.id ?? `cat-${Date.now()}`,
      image: form.image.trim() || "Image",
      name: form.name.trim(),
      order: Number(form.order) || records.length * 10 + 10,
      status: form.status,
      homeBottom: form.homeBottom,
      homeTop: form.homeTop,
    };

    sync(
      editing
        ? records.map((record) => (record.id === editing.id ? nextRecord : record))
        : [...records, nextRecord],
    );

    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("categories", {
      action: "upsert",
      record: {
        displayOrder: nextRecord.order,
        homeBottom: nextRecord.homeBottom,
        homeTop: nextRecord.homeTop,
        id: nextRecord.id,
        image: nextRecord.image,
        name: nextRecord.name,
        status: nextRecord.status,
      },
    });

    resetForm();
  }

  function editRecord(record: CategoryRecord) {
    setEditing(record);
    setShowCategoryForm(true);
    setForm({
      image: record.image,
      name: record.name,
      order: String(record.order),
      status: record.status,
      homeBottom: record.homeBottom,
      homeTop: record.homeTop,
    });
  }

  function bulkStatus(nextStatus: "Active" | "Inactive") {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: nextStatus } : record)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("categories", { action: "bulk-status", ids: selected, status: nextStatus });
    setSelected([]);
  }

  function deleteSelected() {
    const toDelete = [...selected];
    sync(records.filter((record) => !selected.includes(record.id)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("categories", { action: "bulk-delete", ids: toDelete });
    setSelected([]);
  }

  function updateOrder() {
    sync(records.map((record, index) => ({ ...record, order: (index + 1) * 10 })));
  }

  function uploadCategoryImage(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((current) => ({ ...current, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  function toggleSubcategory(slug: string) {
    setOpenSubcategories((current) => ({ ...current, [slug]: !current[slug] }));
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label>
          <span>Category Name</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Category Name" />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label>
          <span>Records Per Page</span>
          <input value={filtered.length} readOnly />
        </label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-category-browser">
        <div className="admin-location-tree-head">
          <div>
            <span>India Business Taxonomy</span>
            <strong>Manage category hierarchy</strong>
          </div>
          <div className="admin-location-tree-stats">
            <span>Main</span><b>{categoryStats.main}</b>
            <span>Sub</span><b>{categoryStats.subcategories}</b>
            <span>Types</span><b>{categoryStats.types}</b>
            <span>Shown</span><b>{visibleTaxonomy.length}</b>
          </div>
        </div>
        <div className="admin-category-browser-grid">
          <div className="admin-category-main-list">
            {visibleTaxonomy.map(({ category, record }) => (
              <button
                className={category.slug === activeMain?.slug ? "active" : ""}
                key={category.slug}
                onClick={() => setSelectedMain(category.slug)}
                type="button"
              >
                <span>{category.name}</span>
                <b>{category.subcategories.length * 4}</b>
                <small>{record?.status ?? "Active"}</small>
              </button>
            ))}
          </div>
          <div className="admin-category-detail">
            {activeMain ? (
              <>
                <div className="admin-category-detail-head">
                  <div>
                    <span>Main Category</span>
                    <strong>{activeMain.name}</strong>
                    <p>{activeMain.description}</p>
                  </div>
                  <a href={`/category/${activeMain.slug}`} target="_blank" rel="noreferrer">Open Page</a>
                </div>
                <div className="admin-category-sub-list">
                  {activeMain.subcategories.map((subcategory) => {
                    const isOpen = openSubcategories[subcategory.slug] ?? false;
                    return (
                      <div className="admin-category-sub-card" key={subcategory.slug}>
                        <button type="button" onClick={() => toggleSubcategory(subcategory.slug)}>
                          <span>{subcategory.name}</span>
                          <b>{subcategory.businessTypes.length} types</b>
                        </button>
                        {isOpen ? (
                          <div className="admin-category-type-grid">
                            {subcategory.businessTypes.map((businessType) => <span key={businessType.slug}>{businessType.name}</span>)}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="admin-location-empty">
                <strong>No category found</strong>
                <span>Try clearing the search filter.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-form-toggle-row">
        <button
          className="admin-form-toggle-button"
          onClick={() => {
            if (showCategoryForm && editing) resetForm();
            else setShowCategoryForm((current) => !current);
          }}
          type="button"
        >
          {showCategoryForm ? "Hide Category Form" : "Add Category Name"}
        </button>
      </div>

      {showCategoryForm ? (
        <div className="admin-editor">
          <label>
            <span>Category Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            <span>Image</span>
            <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Emoji, icon text, image URL, or file name" />
          </label>
          <label>
            <span>Upload Icon</span>
            <input accept="image/*" type="file" onChange={(event) => uploadCategoryImage(event.target.files?.[0])} />
          </label>
          <div className="admin-category-preview">
            <span>Preview</span>
            <strong>
              {isImageValue(form.image) ? <img alt="" src={categoryImageSource(form.image)} /> : form.image && form.image !== "Image" ? form.image.slice(0, 3) : "Icon"}
            </strong>
          </div>
          <label>
            <span>Display Order</span>
            <input value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} />
          </label>
          <label>
            <span>Status</span>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={form.homeTop} onChange={(event) => setForm({ ...form, homeTop: event.target.checked })} />
            <span>Home Top</span>
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={form.homeBottom} onChange={(event) => setForm({ ...form, homeBottom: event.target.checked })} />
            <span>Home Bottom</span>
          </label>
          <button type="button" onClick={saveRecord}>{editing ? "Update Category" : "Add Category"}</button>
          <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button>
        </div>
      ) : null}

      <div className="admin-actions">
        <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
        <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
        <button type="button" onClick={updateOrder}>Update Order</button>
      </div>

      <div className="admin-real-table">
        <div className="admin-real-row admin-real-head">
          <span>Select</span>
          <span>Name</span>
          <span>Image</span>
          <span>Display Order</span>
          <span>Home</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.name}</span>
            <span className="admin-category-image-cell">
              {isImageValue(record.image) ? <img alt="" src={categoryImageSource(record.image)} /> : record.image}
            </span>
            <span>{record.order}</span>
            <span>{record.homeTop ? "Top" : ""}{record.homeTop && record.homeBottom ? " / " : ""}{record.homeBottom ? "Bottom" : ""}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => editRecord(record)}>View / Edit</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageBusinessModule() {
  const [records, setRecords] = useState<BusinessRecord[]>(businessSeed);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ category: "All", name: "", status: "All", type: "" });
  const [editing, setEditing] = useState<BusinessRecord | null>(null);
  const [form, setForm] = useState({
    address: "",
    badge: "Verified",
    businessType: "",
    category: categories[0] ?? "General",
    city: "",
    contact: "",
    details: "",
    proof: "",
    name: "",
    state: "",
    status: "Pending" as Status,
    subcategory: "",
    subcity: "",
  });

  const filtered = useMemo(() => {
    return records
      .filter((record) => record.name.toLowerCase().includes(filters.name.toLowerCase()))
      .filter((record) => record.details.toLowerCase().includes(filters.type.toLowerCase()))
      .filter((record) => filters.category === "All" || record.category === filters.category)
      .filter((record) => filters.status === "All" || record.status === filters.status);
  }, [filters, records]);

  useEffect(() => {
    void getAdminData<BusinessRecord[]>("business", businessSeed).then(setRecords);
  }, []);

  function sync(next: BusinessRecord[]) {
    setRecords(next);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      address: "",
      badge: "Verified",
      businessType: "",
      category: categories[0] ?? "General",
      city: "",
      contact: "",
      details: "",
      proof: "",
      name: "",
      state: "",
      status: "Pending",
      subcategory: "",
      subcity: "",
    });
  }

  function saveRecord() {
    if (!form.name.trim()) return;

    const nextRecord: BusinessRecord = {
      id: editing?.id ?? `biz-${Date.now()}`,
      address: form.address.trim(),
      addressProofName: form.proof.trim(),
      badge: form.badge,
      businessType: form.businessType.trim(),
      category: form.category,
      city: form.city.trim(),
      contact: form.contact.trim(),
      details: form.details.trim(),
      name: form.name.trim(),
      state: form.state.trim(),
      status: form.status,
      subcategory: form.subcategory.trim(),
      subcity: form.subcity.trim(),
    };

    sync(
      editing
        ? records.map((record) => (record.id === editing.id ? nextRecord : record))
        : [...records, nextRecord],
    );
    resetForm();
  }

  function editRecord(record: BusinessRecord) {
    setEditing(record);
    setForm({
      address: record.address,
      badge: record.badge,
      businessType: record.businessType ?? "",
      category: record.category,
      city: record.city ?? "",
      contact: record.contact,
      details: record.details,
      proof: record.addressProofName ?? "",
      name: record.name,
      state: record.state ?? "",
      status: record.status,
      subcategory: record.subcategory ?? "",
      subcity: record.subcity ?? "",
    });
  }

  function bulkStatus(nextStatus: Status) {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: nextStatus } : record)));
    selected.forEach((id) => {
      const record = records.find((item) => item.id === id);
      if (record?.ownerId) void postAdminAction("business", { action: nextStatus, id: record.id, ownerId: record.ownerId });
    });
    setSelected([]);
  }

  function setRecordStatus(record: BusinessRecord, nextStatus: Status) {
    sync(records.map((item) => (item.id === record.id ? { ...item, status: nextStatus } : item)));
    if (record.ownerId) void postAdminAction("business", { action: nextStatus, id: record.id, ownerId: record.ownerId });
  }

  function deleteSelected() {
    sync(records.filter((record) => !selected.includes(record.id)));
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label>
          <span>Business Name</span>
          <input value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} placeholder="Business Name" />
        </label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
            <option>Draft</option>
            <option>Featured</option>
          </select>
        </label>
        <label>
          <span>Type</span>
          <input value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} placeholder="Type" />
        </label>
        <label>
          <span>Category</span>
          <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
            <option>All</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span>Subcategory</span>
          <input value={form.subcategory} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} />
        </label>
        <label>
          <span>Business Type</span>
          <input value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })} />
        </label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-editor admin-editor-business">
        <label>
          <span>Business Name</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          <span>Address</span>
          <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </label>
        <label>
          <span>Contact Details</span>
          <input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} />
        </label>
        <label>
          <span>State</span>
          <input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
        </label>
        <label>
          <span>City / District</span>
          <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        </label>
        <label>
          <span>Subcity / Area</span>
          <input value={form.subcity} onChange={(event) => setForm({ ...form, subcity: event.target.value })} />
        </label>
        <label>
          <span>Category</span>
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span>Details</span>
          <input value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} />
        </label>
        <label>
          <span>Address Proof</span>
          <input value={form.proof} onChange={(event) => setForm({ ...form, proof: event.target.value })} placeholder="Optional filename" />
        </label>
        <label>
          <span>Badge</span>
          <select value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })}>
            <option>Featured</option>
            <option>Verified</option>
            <option>Popular</option>
            <option>Trending</option>
            <option>New</option>
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Status })}>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
            <option>Draft</option>
            <option>Featured</option>
          </select>
        </label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Business" : "Add Business"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

      <div className="admin-actions">
        <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
        <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
      </div>

      <div className="admin-real-table admin-real-table-business">
        <div className="admin-real-row admin-real-head">
          <span>Select</span>
          <span>Business Name</span>
          <span>Address</span>
          <span>Contact Details</span>
          <span>Details</span>
          <span>Current Status</span>
          <span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.name}<small>{[record.category, record.subcategory, record.businessType].filter(Boolean).join(" / ")}{record.ownerName ? ` / ${record.ownerName}` : ""}</small></span>
            <span>{record.address}<small>{record.subcity || record.city || record.state ? [record.subcity, record.city, record.state].filter(Boolean).join(", ") : record.location}</small></span>
            <span>{record.contact}<small>{record.ownerEmail || ""}</small></span>
            <span>{record.badge} / {record.details}<small>{record.addressProofName ? `Proof: ${record.addressProofName}` : "Address proof optional"}</small>{record.publicPath ? <a className="admin-mini-link" href={record.publicPath} target="_blank" rel="noreferrer">SEO page</a> : null}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span className="admin-business-actions">
              <button type="button" className="admin-link-button" onClick={() => editRecord(record)}>Manage</button>
              {record.status !== "Active" ? <button type="button" className="admin-link-button" onClick={() => setRecordStatus(record, "Active")}>Approve</button> : null}
              {record.status !== "Featured" ? <button type="button" className="admin-link-button" onClick={() => setRecordStatus(record, "Featured")}>Feature</button> : null}
              {record.status !== "Inactive" ? <button type="button" className="admin-link-button" onClick={() => setRecordStatus(record, "Inactive")}>Hide</button> : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageMembersModule() {
  const [records, setRecords] = useState<MemberRecord[]>(memberSeed);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ keyword: "", status: "All" });
  const [editing, setEditing] = useState<MemberRecord | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    registeredAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Active" as "Active" | "Inactive",
    username: "",
  });

  const filtered = useMemo(
    () =>
      records
        .filter((record) =>
          [record.name, record.username, record.email].join(" ").toLowerCase().includes(filters.keyword.toLowerCase()),
        )
        .filter((record) => filters.status === "All" || record.status === filters.status),
    [filters, records],
  );

  useEffect(() => {
    void getAdminData<MemberRecord[]>("members", memberSeed).then(setRecords);
  }, []);

  function sync(next: MemberRecord[]) {
    setRecords(next);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      email: "",
      name: "",
      phone: "",
      registeredAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Active",
      username: "",
    });
  }

  function saveRecord() {
    if (!form.name.trim() || !form.username.trim()) return;

    const nextRecord: MemberRecord = {
      id: editing?.id ?? `mem-${Date.now()}`,
      email: form.email.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      registeredAt: form.registeredAt,
      status: form.status,
      username: form.username.trim(),
    };

    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    resetForm();
  }

  function editRecord(record: MemberRecord) {
    setEditing(record);
    setForm(record);
  }

  function bulkStatus(nextStatus: "Active" | "Inactive") {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: nextStatus } : record)));
    selected.forEach((id) => void postAdminAction("members", { action: nextStatus, id }));
    setSelected([]);
  }

  function deleteSelected() {
    sync(records.filter((record) => !selected.includes(record.id)));
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label>
          <span>Name, Username</span>
          <input value={filters.keyword} onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} placeholder="Name, Username" />
        </label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label>
          <span>Records Per Page</span>
          <input value={filtered.length} readOnly />
        </label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-editor admin-editor-members">
        <label><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label><span>Username</span><input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
        <label><span>Email</span><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label><span>Phone</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label><span>Registration Date</span><input value={form.registeredAt} onChange={(event) => setForm({ ...form, registeredAt: event.target.value })} /></label>
        <label>
          <span>Status</span>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Member" : "Registration"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

      <div className="admin-actions">
        <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
        <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
      </div>

      <div className="admin-real-table admin-real-table-members">
        <div className="admin-real-row admin-real-head">
          <span>Select</span><span>Name</span><span>Username</span><span>Email</span><span>Phone</span><span>Registration Date</span><span>Status</span><span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.name}</span><span>{record.username}</span><span>{record.email}</span><span>{record.phone}</span><span>{record.registeredAt}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => editRecord(record)}>View / Send Mail</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageNewsletterModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-newsletter", newsletterSeed));
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<NewsletterRecord | null>(null);
  const [form, setForm] = useState({ email: "", joinedAt: new Date().toLocaleDateString("en-IN"), lastSent: "Not sent", status: "Subscribed" as "Subscribed" | "Unsubscribed" });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<NewsletterRecord[]>("newsletter", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-newsletter", data);
      }
    });
  }, []);

  const filtered = useMemo(() => records.filter((record) => record.email.toLowerCase().includes(query.toLowerCase())), [query, records]);

  function sync(next: NewsletterRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-newsletter", next);
  }

  function resetForm() {
    setEditing(null);
    setForm({ email: "", joinedAt: new Date().toLocaleDateString("en-IN"), lastSent: "Not sent", status: "Subscribed" });
  }

  function saveRecord() {
    if (!form.email.trim()) return;
    const nextRecord: NewsletterRecord = { id: editing?.id ?? `news-${Date.now()}`, ...form, email: form.email.trim() };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("newsletter", {
      action: "upsert",
      record: { email: nextRecord.email, joinedAt: nextRecord.joinedAt, lastSent: nextRecord.lastSent, status: nextRecord.status },
    });
    resetForm();
  }

  function sendSelected() {
    const emails = selected.map((id) => records.find((r) => r.id === id)?.email).filter(Boolean) as string[];
    const stamp = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, lastSent: `Campaign sent ${stamp}` } : record)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("newsletter", { action: "send", emails });
    setSelected([]);
  }

  function unsubscribeSelected() {
    const emails = selected.map((id) => records.find((r) => r.id === id)?.email).filter(Boolean) as string[];
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: "Unsubscribed" } : record)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("newsletter", { action: "unsubscribe", emails });
    setSelected([]);
  }

  function deleteSelected() {
    const emails = selected.map((id) => records.find((r) => r.id === id)?.email).filter(Boolean) as string[];
    sync(records.filter((record) => !selected.includes(record.id)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("newsletter", { action: "delete", emails });
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label><span>Email</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email" /></label>
        <label><span>Records Per Page</span><input value={filtered.length} readOnly /></label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-editor">
        <label><span>Email</span><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label><span>Joined Date</span><input value={form.joinedAt} onChange={(event) => setForm({ ...form, joinedAt: event.target.value })} /></label>
        <label>
          <span>Status</span>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Subscribed" | "Unsubscribed" })}>
            <option>Subscribed</option>
            <option>Unsubscribed</option>
          </select>
        </label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Subscriber" : "Add Subscriber"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

      <div className="admin-actions">
        <button type="button" onClick={sendSelected} disabled={!selected.length}>Send</button>
        <button type="button" onClick={unsubscribeSelected} disabled={!selected.length}>Unsubscribe</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
      </div>

      <div className="admin-real-table admin-real-table-newsletter">
        <div className="admin-real-row admin-real-head">
          <span>Select</span><span>Email</span><span>Joined Date</span><span>Last Sent</span><span>Current Status</span><span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.email}</span><span>{record.joinedAt}</span><span>{record.lastSent}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm(record); }}>Edit</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageStatesModule() {
  return <LocationAdminModule kind="states" />;
}

export function ManageCitiesModule() {
  return <LocationAdminModule kind="cities" />;
}

export function ManageLocationsModule() {
  return <LocationAdminModule kind="locations" />;
}

function LocationAdminModule({ kind }: { kind: "states" | "cities" | "locations" }) {
  const stateRecords = readStored("checkinfo-admin-states-india-v7", stateSeed);
  const cityRecords = readStored("checkinfo-admin-cities-india-v7", citySeed);
  const isStates = kind === "states";
  const isCities = kind === "cities";
  const storageKey = `checkinfo-admin-${kind}-india-v7`;
  const fallback: LocationAdminRecord[] = isStates ? stateSeed : isCities ? citySeed : locationSeed;
  const [records, setRecords] = useState<LocationAdminRecord[]>(() => readStored(storageKey, fallback));
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ city: "All", district: "All", keyword: "", state: "All", status: "All", type: "All" });
  const [openState, setOpenState] = useState("");
  const [openDistrict, setOpenDistrict] = useState("");
  const [editing, setEditing] = useState<StateRecord | CityRecord | LocationRecord | null>(null);
  const [form, setForm] = useState({
    city: cityRecords[0]?.name ?? "",
    country: "India",
    district: "",
    kind: "District" as LocationRecord["kind"],
    name: "",
    state: stateRecords[0]?.name ?? "",
    status: "Active" as "Active" | "Inactive",
  });

  const filtered = useMemo(() => {
    return records
      .filter((record) => record.name.toLowerCase().includes(filters.keyword.toLowerCase()))
      .filter((record) => filters.status === "All" || record.status === filters.status)
      .filter((record) => isStates || filters.state === "All" || "state" in record && record.state === filters.state)
      .filter((record) => !isStates && !isCities ? filters.type === "All" || "kind" in record && record.kind === filters.type : true)
      .filter((record) => !isStates && !isCities ? filters.district === "All" || "district" in record && record.district === filters.district : true)
      .filter((record) => !isStates && !isCities ? filters.city === "All" || "city" in record && record.city === filters.city : true);
  }, [filters, isCities, isStates, records]);

  const visibleRecords = filtered.slice(0, 300);
  const searchLabel = isStates ? "Search State / UT" : isCities ? "Search City" : "Search Location";
  const searchPlaceholder = isStates
    ? "Type state or UT name..."
    : isCities
      ? "Type city name, for example Delhi, Jaipur, Patna..."
      : "Type district, sub-district, or city name...";
  const districtOptions = useMemo(
    () => locationSeed.filter((record) => record.kind === "District" && (filters.state === "All" || record.state === filters.state)).slice(0, 900),
    [filters.state],
  );
  const cityOptions = useMemo(
    () => cityRecords.filter((record) => filters.state === "All" || record.state === filters.state).slice(0, 900),
    [cityRecords, filters.state],
  );
  const openStateDistricts = useMemo(
    () => indiaDistricts.filter((record) => record.state === openState),
    [openState],
  );
  const openDistrictSubdistricts = useMemo(
    () => indiaSubdistricts.filter((record) => record.state === openState && record.district === openDistrict),
    [openDistrict, openState],
  );
  const cityCount = cityRecords.length;
  const cityCountByState = useMemo(() => {
    return cityRecords.reduce<Record<string, number>>((counts, record) => {
      counts[record.state] = (counts[record.state] ?? 0) + 1;
      return counts;
    }, {});
  }, [cityRecords]);
  const subdistrictCountByDistrict = useMemo(() => {
    return indiaSubdistricts.reduce<Record<string, number>>((counts, record) => {
      const key = `${record.state}::${record.district}`;
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});
  }, []);

  function toggleStateBox(stateName: string) {
    const nextState = openState === stateName ? "" : stateName;
    setOpenState(nextState);
    setOpenDistrict("");
    setFilters((current) => ({ ...current, city: "All", district: "All", state: nextState || "All" }));
    setForm((current) => ({ ...current, state: nextState || (stateRecords[0]?.name ?? "") }));
  }

  function toggleDistrictBox(districtName: string) {
    setOpenDistrict((current) => current === districtName ? "" : districtName);
  }

  function sync(next: LocationAdminRecord[]) {
    setRecords(next);
    writeStored(storageKey, next);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      city: cityRecords[0]?.name ?? "",
      country: "India",
      district: "",
      kind: "District",
      name: "",
      state: stateRecords[0]?.name ?? "",
      status: "Active",
    });
  }

  function saveRecord() {
    if (!form.name.trim()) return;
    const id = editing?.id ?? `${kind}-${Date.now()}`;
    const base = { id, country: form.country.trim() || "India", name: form.name.trim(), status: form.status };
    const nextRecord: LocationAdminRecord = isStates
      ? base
      : isCities
        ? { ...base, state: form.state }
        : { ...base, city: form.kind === "City" ? form.city : undefined, district: form.kind === "Sub-district" ? form.district : undefined, kind: form.kind, state: form.state };

    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    resetForm();
  }

  function editRecord(record: StateRecord | CityRecord | LocationRecord) {
    setEditing(record);
    setForm({
      city: "city" in record ? record.city ?? "" : cityRecords[0]?.name ?? "",
      country: record.country,
      district: "district" in record ? record.district ?? "" : "",
      kind: "kind" in record ? record.kind : "District",
      name: record.name,
      state: "state" in record ? record.state : stateRecords[0]?.name ?? "",
      status: record.status,
    });
  }

  function bulkStatus(nextStatus: "Active" | "Inactive") {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: nextStatus } : record)));
    setSelected([]);
  }

  function deleteSelected() {
    sync(records.filter((record) => !selected.includes(record.id)));
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label className="admin-search-filter">
          <span>{searchLabel}</span>
          <input
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            type="search"
            value={filters.keyword}
            onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
          />
        </label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
        </label>
        {!isStates ? (
          <label>
            <span>State</span>
            <select value={filters.state} onChange={(event) => setFilters({ ...filters, state: event.target.value })}>
              <option>All</option>
              {stateRecords.map((record) => <option key={record.id}>{record.name}</option>)}
            </select>
          </label>
        ) : null}
        {!isStates && !isCities ? (
          <label>
            <span>Type</span>
            <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
              <option>All</option><option>District</option><option>Sub-district</option><option>City</option>
            </select>
          </label>
        ) : null}
        {!isStates && !isCities ? (
          <label>
            <span>District</span>
            <select value={filters.district} onChange={(event) => setFilters({ ...filters, district: event.target.value })}>
              <option>All</option>
              {districtOptions.map((record) => <option key={record.id}>{record.name}</option>)}
            </select>
          </label>
        ) : null}
        {!isStates && !isCities ? (
          <label>
            <span>City</span>
            <select value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })}>
              <option>All</option>
              {cityOptions.map((record) => <option key={record.id}>{record.name}</option>)}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => setFilters({ city: "All", district: "All", keyword: "", state: "All", status: "All", type: "All" })}
        >
          Clear Search
        </button>
      </div>

      {isCities ? (
        <div className="admin-location-tree">
          <div className="admin-location-tree-head">
            <div>
              <span>India City Browser</span>
              <strong>{openState || "Select a state"}</strong>
            </div>
            <div className="admin-location-tree-stats">
              <b>{stateRecords.length}</b><span>States</span>
              <b>{cityCount.toLocaleString()}</b><span>Cities</span>
            </div>
          </div>
          <div className="admin-location-browser">
            <aside className="admin-state-panel">
              <div className="admin-panel-mini-head">
                <strong>States</strong>
                <span>Click to filter cities</span>
              </div>
              <div className="admin-state-box-grid">
                {stateRecords.map((record) => (
                  <button
                    className={`admin-state-box ${openState === record.name ? "is-open" : ""}`}
                    key={record.id}
                    type="button"
                    onClick={() => toggleStateBox(record.name)}
                  >
                    <span>{record.name}</span>
                    <b>{(cityCountByState[record.name] ?? 0).toLocaleString()}</b>
                  </button>
                ))}
              </div>
            </aside>
            <section className="admin-district-panel">
              {openState ? (
                <>
                  <div className="admin-panel-mini-head">
                    <strong>{openState}</strong>
                    <span>{openStateDistricts.length.toLocaleString()} districts, {(cityCountByState[openState] ?? 0).toLocaleString()} cities</span>
                  </div>
                  <div className="admin-district-grid">
                    {openStateDistricts.map((record) => (
                      <button
                        className={`admin-district-box ${openDistrict === record.name ? "is-open" : ""}`}
                        key={record.id}
                        type="button"
                        onClick={() => toggleDistrictBox(record.name)}
                      >
                        <span>{record.name}</span>
                        <b>{(subdistrictCountByDistrict[`${openState}::${record.name}`] ?? 0).toLocaleString()}</b>
                      </button>
                    ))}
                  </div>
                  {openDistrict ? (
                    <div className="admin-subdistrict-panel">
                      <div className="admin-panel-mini-head">
                        <strong>{openDistrict}</strong>
                        <span>{openDistrictSubdistricts.length.toLocaleString()} subdistricts</span>
                      </div>
                      <div className="admin-subdistrict-grid">
                        {openDistrictSubdistricts.map((record) => (
                          <span key={record.id}>{record.name}</span>
                        ))}
                        {!openDistrictSubdistricts.length ? <span>No subdistricts</span> : null}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="admin-location-empty">
                  <strong>Select any state</strong>
                  <span>Districts and subdistricts will open here. Click the same item again to hide it.</span>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {!isCities ? (
        <>
          <div className="admin-editor admin-editor-location">
            {!isStates ? (
              <label>
                <span>Location Type</span>
                <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as LocationRecord["kind"] })}>
                  <option>District</option><option>Sub-district</option><option>City</option>
                </select>
              </label>
            ) : null}
            <label><span>{isStates ? "State / UT Name" : "Name"}</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label><span>Country Name</span><input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></label>
            {!isStates ? (
              <label>
                <span>State</span>
                <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
                  {stateRecords.map((record) => <option key={record.id}>{record.name}</option>)}
                </select>
              </label>
            ) : null}
            {!isStates && form.kind === "Sub-district" ? (
              <label>
                <span>District</span>
                <select value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}>
                  <option value="">Select District</option>
                  {locationSeed.filter((record) => record.kind === "District" && record.state === form.state).slice(0, 900).map((record) => <option key={record.id}>{record.name}</option>)}
                </select>
              </label>
            ) : null}
            {!isStates ? (
              <label>
                <span>City</span>
                <select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}>
                  {cityRecords.filter((record) => record.state === form.state).slice(0, 900).map((record) => <option key={record.id}>{record.name}</option>)}
                </select>
              </label>
            ) : null}
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </label>
            <button type="button" onClick={saveRecord}>{editing ? "Update" : isStates ? "Add State / UT" : "Add Location"}</button>
            {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
          </div>

          <p className="admin-data-note">
            Loaded {records.length.toLocaleString()} {isStates ? "states/UTs" : "location records"}.
            Showing {visibleRecords.length.toLocaleString()} of {filtered.length.toLocaleString()} filtered records. {isStates ? indiaLocationSourceNote : "Manage Location is kept blank for city-level local areas, sectors, colonies, and neighbourhoods."}
          </p>

          <div className="admin-actions">
            <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
            <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
            <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
          </div>

          <div className={`admin-real-table ${isStates ? "admin-real-table-states" : "admin-real-table-locations"}`}>
            <div className="admin-real-row admin-real-head">
              <span>Select</span><span>Name</span>{!isStates ? <span>Type</span> : null}{!isStates ? <span>State Name</span> : null}{!isStates ? <span>District</span> : null}{!isStates ? <span>City Name</span> : null}<span>Country Name</span><span>Status</span><span>Action</span>
            </div>
            {visibleRecords.map((record) => (
              <div className="admin-real-row" key={record.id}>
                <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
                <span>{record.name}</span>
                {!isStates ? <span>{"kind" in record ? record.kind : "-"}</span> : null}
                {!isStates ? <span>{"state" in record ? record.state : "-"}</span> : null}
                {!isStates ? <span>{"district" in record ? record.district || "-" : "-"}</span> : null}
                {!isStates ? <span>{"city" in record ? record.city : "-"}</span> : null}
                <span>{record.country}</span>
                <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
                <span><button type="button" className="admin-link-button" onClick={() => editRecord(record)}>Edit</button></span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export function ManageMetaTagsModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-meta", metaSeed));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MetaRecord | null>(null);
  const [form, setForm] = useState({ description: "", keywords: "", title: "", url: "" });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<MetaRecord[]>("meta", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-meta", data);
      }
    });
  }, []);

  const filtered = useMemo(
    () => records.filter((record) => [record.url, record.title].join(" ").toLowerCase().includes(query.toLowerCase())),
    [query, records],
  );

  function sync(next: MetaRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-meta", next);
  }

  function resetForm() {
    setEditing(null);
    setForm({ description: "", keywords: "", title: "", url: "" });
  }

  function saveRecord() {
    if (!form.url.trim() || !form.title.trim()) return;
    const nextRecord: MetaRecord = {
      id: editing?.id ?? `meta-${Date.now()}`,
      description: form.description.trim(),
      keywords: form.keywords.trim(),
      title: form.title.trim(),
      url: form.url.trim(),
    };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("meta", {
      action: "upsert",
      record: { description: nextRecord.description, id: nextRecord.id, keywords: nextRecord.keywords, title: nextRecord.title, url: nextRecord.url },
    });
    resetForm();
  }

  function deleteRecord(id: string) {
    sync(records.filter((record) => record.id !== id));
    if (editing?.id === id) resetForm();
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("meta", { action: "delete", id });
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label><span>URL</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="URL" /></label>
        <label><span>Records Per Page</span><input value={filtered.length} readOnly /></label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-editor admin-editor-meta">
        <label><span>URL</span><input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="/category/name" /></label>
        <label><span>Meta Title</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label><span>Meta Keywords</span><input value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} /></label>
        <label className="admin-wide-field"><span>Meta Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Meta" : "Add Meta"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

      <div className="admin-real-table admin-real-table-meta">
        <div className="admin-real-row admin-real-head">
          <span>URL</span><span>Title</span><span>Keywords</span><span>Description</span><span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span>{record.url}</span><span>{record.title}</span><span>{record.keywords}</span><span>{record.description}</span>
            <span>
              <button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm(record); }}>Edit</button>
              <button type="button" className="admin-link-button" onClick={() => deleteRecord(record.id)}>Delete</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageSubadminsModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-subadmins", subadminSeed));
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ keyword: "", status: "All" });
  const [editing, setEditing] = useState<SubadminRecord | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    registeredAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Active" as "Active" | "Inactive",
    username: "",
  });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<SubadminRecord[]>("subadmins", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-subadmins", data);
      }
    });
  }, []);

  const filtered = useMemo(
    () =>
      records
        .filter((record) => [record.email, record.username, record.name].join(" ").toLowerCase().includes(filters.keyword.toLowerCase()))
        .filter((record) => filters.status === "All" || record.status === filters.status),
    [filters, records],
  );

  function sync(next: SubadminRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-subadmins", next);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      email: "",
      name: "",
      phone: "",
      registeredAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Active",
      username: "",
    });
  }

  function saveRecord() {
    if (!form.email.trim() || !form.username.trim()) return;
    const nextRecord: SubadminRecord = {
      id: editing?.id ?? `sub-${Date.now()}`,
      email: form.email.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      registeredAt: form.registeredAt,
      status: form.status,
      username: form.username.trim(),
    };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    resetForm();
  }

  function bulkStatus(nextStatus: "Active" | "Inactive") {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: nextStatus } : record)));
    setSelected([]);
  }

  function deleteSelected() {
    sync(records.filter((record) => !selected.includes(record.id)));
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label><span>Email, Username</span><input value={filters.keyword} onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} /></label>
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option>All</option><option>Active</option><option>Inactive</option>
          </select>
        </label>
        <label><span>Records Per Page</span><input value={filtered.length} readOnly /></label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-editor admin-editor-subadmins">
        <label><span>Email</span><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label><span>Username</span><input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
        <label><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label><span>Phone</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label><span>Registration Date</span><input value={form.registeredAt} onChange={(event) => setForm({ ...form, registeredAt: event.target.value })} /></label>
        <label>
          <span>Status</span>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}>
            <option>Active</option><option>Inactive</option>
          </select>
        </label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Sub Admin" : "Add Sub Admin"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

      <div className="admin-actions">
        <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
        <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
      </div>

      <div className="admin-real-table admin-real-table-subadmins">
        <div className="admin-real-row admin-real-head">
          <span>Select</span><span>Email</span><span>Username</span><span>Name</span><span>Phone</span><span>Registration Date</span><span>Status</span><span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.email}</span><span>{record.username}</span><span>{record.name}</span><span>{record.phone}</span><span>{record.registeredAt}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm(record); }}>Edit</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageAdminSettingsModule() {
  const [settings, setSettings] = useState(() => readStored("checkinfo-admin-settings", adminSettingsSeed));
  const [saved, setSaved] = useState(false);

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<typeof adminSettingsSeed>("settings", adminSettingsSeed).then((data) => {
      if (data) {
        setSettings(data);
        writeStored("checkinfo-admin-settings", data);
      }
    });
  }, []);

  function update<K extends keyof AdminSettingsRecord>(key: K, value: AdminSettingsRecord[K]) {
    setSaved(false);
    setSettings({ ...settings, [key]: value });
  }

  function saveSettings() {
    writeStored("checkinfo-admin-settings", settings);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("settings", { action: "save", record: settings });
    setSaved(true);
  }

  return (
    <section className="admin-card">
      <div className="admin-editor admin-editor-settings">
        <label><span>Admin Email</span><input value={settings.email} onChange={(event) => update("email", event.target.value)} /></label>
        <label><span>Phone</span><input value={settings.phone} onChange={(event) => update("phone", event.target.value)} /></label>
        <label><span>Address</span><input value={settings.address} onChange={(event) => update("address", event.target.value)} /></label>
        <label><span>Google Analytics ID</span><input value={settings.analyticsId} onChange={(event) => update("analyticsId", event.target.value)} /></label>
        <label><span>Facebook</span><input value={settings.facebook} onChange={(event) => update("facebook", event.target.value)} /></label>
        <label><span>YouTube</span><input value={settings.youtube} onChange={(event) => update("youtube", event.target.value)} /></label>
        <label><span>Instagram</span><input value={settings.instagram} onChange={(event) => update("instagram", event.target.value)} /></label>
        <label className="admin-wide-field"><span>Map Embed Code</span><textarea value={settings.mapEmbed} onChange={(event) => update("mapEmbed", event.target.value)} /></label>
        <label className="admin-wide-field"><span>Web Code / Header Script</span><textarea value={settings.webCode} onChange={(event) => update("webCode", event.target.value)} /></label>
        <button type="button" onClick={saveSettings}>Update Info</button>
      </div>

      <div className="admin-settings-preview">
        <strong>Current saved contact block</strong>
        <span>{settings.email}</span>
        <span>{settings.phone}</span>
        <span>{settings.address}</span>
        {saved ? <b className="admin-status admin-status-active">Saved</b> : <b className="admin-status admin-status-pending">Unsaved changes</b>}
      </div>
    </section>
  );
}

export function ChangeAdminPasswordModule() {
  const [form, setForm] = useState({ confirmPassword: "", newPassword: "", oldPassword: "" });
  const [message, setMessage] = useState("Password has not been changed in this browser session.");

  async function updatePassword() {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("All password fields are required.");
      return;
    }

    if (form.newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    // ── Backend sync ──────────────────────────────────────────────────────────
    setMessage("Saving...");
    const result = await postAdminAction("admin-password", { action: "update", newPassword: form.newPassword });
    writeStored("checkinfo-admin-password-updated", { updatedAt: new Date().toISOString() });
    setForm({ confirmPassword: "", newPassword: "", oldPassword: "" });
    const saved = (result as Record<string, unknown>)?.data;
    const ok = (saved as Record<string, unknown>)?.saved ?? (saved as Record<string, unknown>)?.ok;
    setMessage(ok ? "Password updated successfully in database." : "Password validation passed. Saved locally (DB not configured).");
  }

  return (
    <section className="admin-card">
      <div className="admin-editor admin-editor-password">
        <label><span>Old Password</span><input type="password" value={form.oldPassword} onChange={(event) => setForm({ ...form, oldPassword: event.target.value })} /></label>
        <label><span>New Password</span><input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} /></label>
        <label><span>Confirm Password</span><input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></label>
        <button type="button" onClick={updatePassword}>Update Info</button>
      </div>
      <div className="admin-settings-preview">
        <strong>Password status</strong>
        <span>{message}</span>
      </div>
    </section>
  );
}

export function ManageStaticPagesModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-static-pages", staticPageSeed));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StaticPageRecord | null>(null);
  const [form, setForm] = useState({ content: "", slug: "", status: "Active" as "Active" | "Inactive", title: "" });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<StaticPageRecord[]>("static-pages", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-static-pages", data);
      }
    });
  }, []);

  const filtered = useMemo(
    () => records.filter((record) => [record.title, record.slug].join(" ").toLowerCase().includes(query.toLowerCase())),
    [query, records],
  );

  function sync(next: StaticPageRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-static-pages", next);
  }

  function resetForm() {
    setEditing(null);
    setForm({ content: "", slug: "", status: "Active", title: "" });
  }

  function saveRecord() {
    if (!form.title.trim() || !form.slug.trim()) return;
    const nextRecord: StaticPageRecord = { id: editing?.id ?? `page-${Date.now()}`, ...form, slug: form.slug.trim(), title: form.title.trim() };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("static-pages", {
      action: "upsert",
      record: { content: nextRecord.content, id: nextRecord.id, slug: nextRecord.slug, status: nextRecord.status, title: nextRecord.title },
    });
    resetForm();
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label><span>Page Name</span><input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label><span>Records Per Page</span><input value={filtered.length} readOnly /></label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>
      <div className="admin-editor admin-editor-content">
        <label><span>Page Name</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label><span>Slug</span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
        <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}><option>Active</option><option>Inactive</option></select></label>
        <label className="admin-wide-field"><span>Page Content</span><textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Page" : "Add Page"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>
      <div className="admin-real-table admin-real-table-static">
        <div className="admin-real-row admin-real-head"><span>Page Name</span><span>Slug</span><span>Content</span><span>Status</span><span>Action</span></div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span>{record.title}</span><span>{record.slug}</span><span>{record.content}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm(record); }}>View / Edit</button><button type="button" className="admin-link-button" onClick={() => sync(records.filter((item) => item.id !== record.id))}>Delete</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageEnquiriesModule({ type }: { type: EnquiryRecord["type"] }) {
  const enquiryResourceMap: Record<EnquiryRecord["type"], string> = {
    Contact: "contact-enquiries",
    Business: "business-enquiries",
    Career: "career-enquiries",
    Advertise: "advertise-enquiries",
  };
  const apiResource = enquiryResourceMap[type];
  const storageKey = `checkinfo-admin-${type.toLowerCase()}-enquiries`;
  const [records, setRecords] = useState(() => readStored(storageKey, enquirySeed.filter((record) => record.type === type)));
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ keyword: "", status: "All" });
  const [reply, setReply] = useState("");

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<EnquiryRecord[]>(apiResource, []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored(storageKey, data);
      }
    });
  }, [apiResource, storageKey]);

  const filtered = useMemo(
    () =>
      records
        .filter((record) => [record.name, record.email, record.phone, record.message].join(" ").toLowerCase().includes(filters.keyword.toLowerCase()))
        .filter((record) => filters.status === "All" || record.status === filters.status),
    [filters, records],
  );

  function sync(next: EnquiryRecord[]) {
    setRecords(next);
    writeStored(storageKey, next);
  }

  function markStatus(status: EnquiryRecord["status"]) {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status } : record)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction(apiResource, { action: "bulk-status", ids: selected, status });
    setSelected([]);
  }

  function deleteSelected() {
    const toDelete = [...selected];
    sync(records.filter((record) => !selected.includes(record.id)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction(apiResource, { action: "bulk-delete", ids: toDelete });
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-filters">
        <label><span>Name, Email</span><input value={filters.keyword} onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} /></label>
        <label><span>Status</span><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option>All</option><option>New</option><option>Replied</option><option>Closed</option></select></label>
        <label><span>Records Per Page</span><input value={filtered.length} readOnly /></label>
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>
      <div className="admin-editor admin-editor-content">
        <label className="admin-wide-field"><span>Reply Message</span><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write reply note for selected enquiries" /></label>
        <button type="button" onClick={() => markStatus("Replied")} disabled={!selected.length || !reply.trim()}>Send Reply</button>
        <button type="button" className="admin-light-button" onClick={() => markStatus("Closed")} disabled={!selected.length}>Close</button>
      </div>
      <div className="admin-actions">
        <button type="button" onClick={() => markStatus("New")} disabled={!selected.length}>Mark New</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
      </div>
      <div className="admin-real-table admin-real-table-enquiries">
        <div className="admin-real-row admin-real-head"><span>Select</span><span>User Info</span><span>Email</span><span>Phone</span><span>Message Details</span><span>Status</span></div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.name}<small>{record.receivedAt}</small></span><span>{record.email}</span><span>{record.phone}</span><span>{record.message}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageMediaModule({ kind }: { kind: "banners" | "header-images" }) {
  const storageKey = `checkinfo-admin-${kind}`;
  const apiResource = kind;
  const mediaKind = kind === "banners" ? "banner" : "header-image";
  const [records, setRecords] = useState(() => readStored(storageKey, kind === "banners" ? bannerSeed : headerImageSeed));
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<MediaRecord | null>(null);
  const [form, setForm] = useState({ image: "", lineOne: "", lineTwo: "", position: "", status: "Active" as "Active" | "Inactive" });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<MediaRecord[]>(apiResource, []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored(storageKey, data);
      }
    });
  }, [apiResource, storageKey]);

  function sync(next: MediaRecord[]) {
    setRecords(next);
    writeStored(storageKey, next);
  }

  function resetForm() {
    setEditing(null);
    setForm({ image: "", lineOne: "", lineTwo: "", position: "", status: "Active" });
  }

  function saveRecord() {
    if (!form.position.trim()) return;
    const nextRecord: MediaRecord = { id: editing?.id ?? `${kind}-${Date.now()}`, ...form, image: form.image.trim() || "Image" };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction(apiResource, {
      action: "upsert",
      record: { id: nextRecord.id, image: nextRecord.image, lineOne: nextRecord.lineOne, lineTwo: nextRecord.lineTwo, position: nextRecord.position, status: nextRecord.status, kind: mediaKind },
    });
    resetForm();
  }

  function bulkStatus(status: "Active" | "Inactive") {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status } : record)));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction(apiResource, { action: "bulk-status", ids: selected, status });
    setSelected([]);
  }

  return (
    <section className="admin-card">
      <div className="admin-editor admin-editor-content">
        <label><span>{kind === "banners" ? "Banner Position" : "Header Position"}</span><input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} /></label>
        <label><span>Image / File Name</span><input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
        <label><span>Line One</span><input value={form.lineOne} onChange={(event) => setForm({ ...form, lineOne: event.target.value })} /></label>
        <label><span>Line Two</span><input value={form.lineTwo} onChange={(event) => setForm({ ...form, lineTwo: event.target.value })} /></label>
        <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}><option>Active</option><option>Inactive</option></select></label>
        <button type="button" onClick={saveRecord}>{editing ? "Update" : kind === "banners" ? "Add Banner" : "Add Header Image"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>
      <div className="admin-actions">
        <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
        <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
        <button type="button" onClick={() => { const toDelete = [...selected]; sync(records.filter((record) => !selected.includes(record.id))); void postAdminAction(apiResource, { action: "bulk-delete", ids: toDelete }); setSelected([]); }} disabled={!selected.length}>Delete</button>
      </div>
      <div className="admin-real-table admin-real-table-media">
        <div className="admin-real-row admin-real-head"><span>Select</span><span>Position</span><span>Image</span><span>Line One</span><span>Line Two</span><span>Status</span><span>Action</span></div>
        {records.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.position}</span><span>{record.image}</span><span>{record.lineOne}</span><span>{record.lineTwo}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm(record); }}>View Actual Image</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageTestimonialsModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-testimonials", testimonialSeed));
  const [editing, setEditing] = useState<TestimonialRecord | null>(null);
  const [form, setForm] = useState({ description: "", name: "", order: "", status: "Active" as "Active" | "Inactive" });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<TestimonialRecord[]>("testimonials", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-testimonials", data);
      }
    });
  }, []);

  const sorted = useMemo(() => [...records].sort((a, b) => a.order - b.order), [records]);

  function sync(next: TestimonialRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-testimonials", next);
  }

  function saveRecord() {
    if (!form.name.trim() || !form.description.trim()) return;
    const nextRecord: TestimonialRecord = { id: editing?.id ?? `test-${Date.now()}`, description: form.description.trim(), name: form.name.trim(), order: Number(form.order) || records.length * 10 + 10, status: form.status };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("testimonials", {
      action: "upsert",
      record: { description: nextRecord.description, id: nextRecord.id, name: nextRecord.name, order: nextRecord.order, status: nextRecord.status },
    });
    setEditing(null);
    setForm({ description: "", name: "", order: "", status: "Active" });
  }

  function deleteRecord(id: string) {
    sync(records.filter((item) => item.id !== id));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("testimonials", { action: "delete", id });
  }

  return (
    <section className="admin-card">
      <div className="admin-editor admin-editor-content">
        <label><span>Poster</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label><span>Display Order</span><input value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} /></label>
        <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}><option>Active</option><option>Inactive</option></select></label>
        <label className="admin-wide-field"><span>Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <button type="button" onClick={saveRecord}>{editing ? "Update Testimonial" : "Post Testimonial"}</button>
      </div>
      <div className="admin-real-table admin-real-table-testimonials">
        <div className="admin-real-row admin-real-head"><span>Poster</span><span>Description</span><span>Order</span><span>Status</span><span>Action</span></div>
        {sorted.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span>{record.name}</span><span>{record.description}</span><span>{record.order}</span><span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm({ description: record.description, name: record.name, order: String(record.order), status: record.status }); }}>Edit</button><button type="button" className="admin-link-button" onClick={() => deleteRecord(record.id)}>Delete</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageFaqsModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-faqs", faqSeed));
  const [editing, setEditing] = useState<FaqRecord | null>(null);
  const [form, setForm] = useState({ answer: "", order: "", question: "", status: "Active" as "Active" | "Inactive" });

  // ── Load from backend on mount ──────────────────────────────────────────────
  useEffect(() => {
    void getAdminData<FaqRecord[]>("faqs", []).then((data) => {
      if (data.length > 0) {
        setRecords(data);
        writeStored("checkinfo-admin-faqs", data);
      }
    });
  }, []);

  const sorted = useMemo(() => [...records].sort((a, b) => a.order - b.order), [records]);

  function sync(next: FaqRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-faqs", next);
  }

  function saveRecord() {
    if (!form.question.trim() || !form.answer.trim()) return;
    const nextRecord: FaqRecord = { answer: form.answer.trim(), id: editing?.id ?? `faq-${Date.now()}`, order: Number(form.order) || records.length * 10 + 10, question: form.question.trim(), status: form.status };
    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("faqs", {
      action: "upsert",
      record: { answer: nextRecord.answer, id: nextRecord.id, order: nextRecord.order, question: nextRecord.question, status: nextRecord.status },
    });
    setEditing(null);
    setForm({ answer: "", order: "", question: "", status: "Active" });
  }

  function deleteRecord(id: string) {
    sync(records.filter((item) => item.id !== id));
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("faqs", { action: "delete", id });
  }

  function updateOrder() {
    const updated = records.map((record, index) => ({ ...record, order: (index + 1) * 10 }));
    sync(updated);
    // ── Backend sync ──────────────────────────────────────────────────────────
    void postAdminAction("faqs", {
      action: "update-order",
      records: updated.map((r) => ({ id: r.id, order: r.order })),
    });
  }

  return (
    <section className="admin-card">
      <div className="admin-editor admin-editor-content">
        <label><span>Question</span><input value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} /></label>
        <label><span>Display Order</span><input value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} /></label>
        <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}><option>Active</option><option>Inactive</option></select></label>
        <label className="admin-wide-field"><span>Answer</span><textarea value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} /></label>
        <button type="button" onClick={saveRecord}>{editing ? "Update FAQ" : "Add FAQ"}</button>
        <button type="button" className="admin-light-button" onClick={updateOrder}>Update Order</button>
      </div>
      <div className="admin-real-table admin-real-table-faqs">
        <div className="admin-real-row admin-real-head"><span>Question</span><span>Answer</span><span>Order</span><span>Status</span><span>Action</span></div>
        {sorted.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span>{record.question}</span><span>{record.answer}</span><span>{record.order}</span><span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => { setEditing(record); setForm({ answer: record.answer, order: String(record.order), question: record.question, status: record.status }); }}>View</button><button type="button" className="admin-link-button" onClick={() => deleteRecord(record.id)}>Delete</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageExportModule() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function exportResource(resource: string, filename: string) {
    setDownloading(resource);
    try {
      const data = await getAdminData<Array<Record<string, unknown>>>(resource, []);
      if (!Array.isArray(data) || data.length === 0) {
        alert(`No records found for ${resource} export.`);
        setDownloading(null);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((field) => {
              const val = String(row[field] ?? "").replace(/"/g, '""');
              return `"${val}"`;
            })
            .join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to export data.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-actions">
        <button type="button" onClick={() => exportResource("business", "business_export")} disabled={downloading === "business"}>
          {downloading === "business" ? "Exporting..." : "Export Business"}
        </button>
        <button type="button" onClick={() => exportResource("categories", "categories_export")} disabled={downloading === "categories"}>
          {downloading === "categories" ? "Exporting..." : "Export Categories"}
        </button>
        <button type="button" onClick={() => exportResource("members", "members_export")} disabled={downloading === "members"}>
          {downloading === "members" ? "Exporting..." : "Export Members"}
        </button>
        <button type="button" onClick={() => exportResource("contact-enquiries", "enquiries_export")} disabled={downloading === "contact-enquiries"}>
          {downloading === "contact-enquiries" ? "Exporting..." : "Export Enquiries"}
        </button>
      </div>

      <div className="admin-real-table admin-real-table-export">
        <div className="admin-real-row admin-real-head">
          <span>Export Type</span>
          <span>Format</span>
          <span>Action</span>
        </div>
        <div className="admin-real-row">
          <span>Business Export</span>
          <span>CSV</span>
          <span>
            <button type="button" className="admin-link-button" onClick={() => exportResource("business", "business_export")}>
              Download CSV
            </button>
          </span>
        </div>
        <div className="admin-real-row">
          <span>Category Export</span>
          <span>CSV</span>
          <span>
            <button type="button" className="admin-link-button" onClick={() => exportResource("categories", "categories_export")}>
              Download CSV
            </button>
          </span>
        </div>
        <div className="admin-real-row">
          <span>Members Export</span>
          <span>CSV</span>
          <span>
            <button type="button" className="admin-link-button" onClick={() => exportResource("members", "members_export")}>
              Download CSV
            </button>
          </span>
        </div>
        <div className="admin-real-row">
          <span>Enquiries Export</span>
          <span>CSV</span>
          <span>
            <button type="button" className="admin-link-button" onClick={() => exportResource("contact-enquiries", "enquiries_export")}>
              Download CSV
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}

type DashboardRealData = {
  activeMembers: number;
  categoriesCount: number;
  categoryDistribution: Array<{ count: number; name: string }>;
  membersCount: number;
  pendingBusiness: number;
  recentEnquiries: Array<{
    email: string;
    id: string;
    message: string;
    name: string;
    phone: string;
    receivedAt: string;
    status: string;
    type: string;
  }>;
  systemHealth: {
    dbName: string;
    isMongoConfigured: boolean;
    lastSync: string;
  };
  totalBusiness: number;
  totalEnquiries: number;
  totalUsers: number;
};

export function AdminDashboardModule() {
  const [data, setData] = useState<DashboardRealData | null>(null);

  useEffect(() => {
    void getAdminData<DashboardRealData>("dashboard", {} as DashboardRealData).then((res) => {
      if (res && typeof res === "object") {
        setData(res);
      }
    });
  }, []);

  const totalListings = data?.totalBusiness ?? 0;
  const totalMembers = data?.membersCount ?? 0;
  const totalEnquiries = data?.totalEnquiries ?? 0;
  const totalCategories = data?.categoriesCount ?? 24;
  const pendingCount = data?.pendingBusiness ?? 0;
  const activeMembersCount = data?.activeMembers ?? 0;
  const isMongo = data?.systemHealth?.isMongoConfigured ?? false;
  const dbName = data?.systemHealth?.dbName ?? "checkinfo";
  const recentEnquiries = data?.recentEnquiries ?? [];
  const catDistribution = data?.categoryDistribution ?? [];

  return (
    <div className="admin-dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "1.75rem", paddingBottom: "2rem" }}>
      {/* ── System Status Banner ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff", padding: "1.25rem 1.5rem", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", boxShadow: "0 10px 25px -5px rgba(15,23,42,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: isMongo ? "#10b981" : "#f59e0b", boxShadow: isMongo ? "0 0 12px #10b981" : "0 0 12px #f59e0b" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Checkinfo Control Hub ({isMongo ? `MongoDB Atlas: ${dbName}` : "Local Store"})</h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>Real-time Database Direct Feed • Live Synced • All Directory Services Online</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a href="/admin/business" style={{ background: "#0284c7", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none" }}>Manage Directory ({totalListings})</a>
          <a href="/admin/admin-password" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>Security</a>
        </div>
      </div>

      {/* ── Real Metric Cards Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px -2px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle, rgba(2,132,199,0.12) 0%, transparent 70%)" }} />
          <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0284c7", fontWeight: "700" }}>Total Business Directory</p>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0.4rem 0", color: "#0f172a" }}>{totalListings}</h2>
          <span style={{ fontSize: "0.825rem", color: pendingCount > 0 ? "#d97706" : "#16a34a", background: pendingCount > 0 ? "#fffbeb" : "#f0fdf4", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>
            {pendingCount > 0 ? `${pendingCount} Pending Approvals` : `All Listings Active`}
          </span>
        </div>

        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px -2px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }} />
          <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#10b981", fontWeight: "700" }}>Registered Members</p>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0.4rem 0", color: "#0f172a" }}>{totalMembers}</h2>
          <span style={{ fontSize: "0.825rem", color: "#0284c7", background: "#f0f9ff", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>{activeMembersCount} Active Members</span>
        </div>

        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px -2px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)" }} />
          <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#f59e0b", fontWeight: "700" }}>Buyer Enquiries & Leads</p>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0.4rem 0", color: "#0f172a" }}>{totalEnquiries}</h2>
          <span style={{ fontSize: "0.825rem", color: "#d97706", background: "#fffbeb", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>Real Buyer Leads</span>
        </div>

        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px -2px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
          <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#8b5cf6", fontWeight: "700" }}>Active Categories</p>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "0.4rem 0", color: "#0f172a" }}>{totalCategories}</h2>
          <span style={{ fontSize: "0.825rem", color: "#7c3aed", background: "#f5f3ff", padding: "0.25rem 0.5rem", borderRadius: "6px", fontWeight: "600" }}>Indexed Sectors</span>
        </div>
      </div>

      {/* ── Quick Action Shortcuts Grid ── */}
      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>Quick Management Hub</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <a href="/admin/categories" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none", color: "#0f172a" }}>
            <span style={{ fontSize: "1.4rem" }}>📁</span>
            <strong style={{ fontSize: "0.95rem" }}>Categories</strong>
            <small style={{ color: "#64748b" }}>Manage {totalCategories} sectors</small>
          </a>
          <a href="/admin/business" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none", color: "#0f172a" }}>
            <span style={{ fontSize: "1.4rem" }}>🏢</span>
            <strong style={{ fontSize: "0.95rem" }}>Business Directory</strong>
            <small style={{ color: "#64748b" }}>Approve & feature listings ({totalListings})</small>
          </a>
          <a href="/admin/members" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none", color: "#0f172a" }}>
            <span style={{ fontSize: "1.4rem" }}>👥</span>
            <strong style={{ fontSize: "0.95rem" }}>Business Members</strong>
            <small style={{ color: "#64748b" }}>{totalMembers} registered accounts</small>
          </a>
          <a href="/admin/contact-enquiries" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none", color: "#0f172a" }}>
            <span style={{ fontSize: "1.4rem" }}>✉️</span>
            <strong style={{ fontSize: "0.95rem" }}>Enquiries & Leads</strong>
            <small style={{ color: "#64748b" }}>{totalEnquiries} buyer leads</small>
          </a>
          <a href="/admin/banners" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none", color: "#0f172a" }}>
            <span style={{ fontSize: "1.4rem" }}>🖼️</span>
            <strong style={{ fontSize: "0.95rem" }}>Media & Banners</strong>
            <small style={{ color: "#64748b" }}>Banners & sliders</small>
          </a>
          <a href="/admin/meta" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "1rem", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none", color: "#0f172a" }}>
            <span style={{ fontSize: "1.4rem" }}>🔍</span>
            <strong style={{ fontSize: "0.95rem" }}>SEO Meta Tags</strong>
            <small style={{ color: "#64748b" }}>Search optimization</small>
          </a>
        </div>
      </div>

      {/* ── Real Category Distribution & Activity Stream ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: "700", color: "#0f172a" }}>Real Listing Category Distribution</h3>
          {catDistribution.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>No business listings added to categories yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {catDistribution.map((cat, idx) => {
                const colors = ["#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];
                const pct = totalListings > 0 ? Math.round((cat.count / totalListings) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                      <span>{cat.name}</span>
                      <span>{cat.count} listings ({pct}%)</span>
                    </div>
                    <div style={{ background: "#f1f5f9", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(pct, 5)}%`, height: "100%", background: colors[idx % colors.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Enquiries Stream ── */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "700", color: "#0f172a" }}>Real Buyer Enquiries Stream</h3>
            <a href="/admin/contact-enquiries" style={{ fontSize: "0.85rem", color: "#0284c7", fontWeight: "600", textDecoration: "none" }}>View All →</a>
          </div>
          
          {recentEnquiries.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>No buyer enquiries received yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentEnquiries.map((enq) => (
                <div key={enq.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem", color: "#0f172a" }}>{enq.name || "Buyer Enquiry"}</strong>
                    <small style={{ color: "#64748b" }}>{enq.email || enq.phone || "No contact info"}</small>
                  </div>
                  <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "6px", fontWeight: "600", background: enq.status === "New" ? "#eff6ff" : "#f0fdf4", color: enq.status === "New" ? "#1d4ed8" : "#15803d" }}>
                    {enq.status || "New"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
