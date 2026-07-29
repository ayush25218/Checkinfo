"use client";

import { useMemo, useState } from "react";
import { categories, listings } from "@/backend/checkinfo";

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
  badge: string;
  category: string;
  contact: string;
  details: string;
  name: string;
  status: Status;
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
  id: string;
  city: string;
  country: string;
  name: string;
  state: string;
  status: "Active" | "Inactive";
};

type LocationAdminRecord = StateRecord | CityRecord | LocationRecord;

const categorySeed: CategoryRecord[] = categories.map((name, index) => ({
  id: `cat-${index + 1}`,
  image: "Image",
  name,
  order: (index + 1) * 10,
  status: "Active",
  homeBottom: index > 3 && index < 8,
  homeTop: index < 4,
}));

const businessSeed: BusinessRecord[] = listings.map((listing, index) => ({
  id: `biz-${index + 1}`,
  address: listing.location,
  badge: listing.badge,
  category: listing.category,
  contact: listing.type,
  details: listing.type,
  name: listing.name,
  status: listing.status as Status,
}));

const memberSeed: MemberRecord[] = [
  {
    id: "mem-1",
    email: "raghavendra@example.com",
    name: "Raghavendra",
    phone: "98XXXXXX39",
    registeredAt: "28 Jul, 2026",
    status: "Active",
    username: "member-demo",
  },
  {
    id: "mem-2",
    email: "ayush@example.com",
    name: "Ayush Kumar",
    phone: "98XXXXXX10",
    registeredAt: "Demo",
    status: "Active",
    username: "business-owner",
  },
];

const newsletterSeed: NewsletterRecord[] = [
  {
    id: "news-1",
    email: "subscriber1@example.com",
    joinedAt: "28 Jul, 2026",
    lastSent: "Not sent",
    status: "Subscribed",
  },
  {
    id: "news-2",
    email: "subscriber2@example.com",
    joinedAt: "26 Jul, 2026",
    lastSent: "Welcome campaign",
    status: "Subscribed",
  },
];

const stateSeed: StateRecord[] = [
  { id: "state-1", country: "India", name: "Delhi", status: "Active" },
  { id: "state-2", country: "India", name: "Maharashtra", status: "Active" },
  { id: "state-3", country: "India", name: "Karnataka", status: "Active" },
];

const citySeed: CityRecord[] = [
  { id: "city-1", country: "India", name: "New Delhi", state: "Delhi", status: "Active" },
  { id: "city-2", country: "India", name: "Mumbai", state: "Maharashtra", status: "Active" },
  { id: "city-3", country: "India", name: "Bengaluru", state: "Karnataka", status: "Active" },
];

const locationSeed: LocationRecord[] = [
  { id: "loc-1", city: "New Delhi", country: "India", name: "Dwarka", state: "Delhi", status: "Active" },
  { id: "loc-2", city: "Mumbai", country: "India", name: "Andheri East", state: "Maharashtra", status: "Active" },
  { id: "loc-3", city: "Bengaluru", country: "India", name: "Residency Road", state: "Karnataka", status: "Active" },
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

function toggleSelection(selected: string[], id: string, checked: boolean) {
  return checked ? [...selected, id] : selected.filter((selectedId) => selectedId !== id);
}

export function ManageCategoriesModule() {
  const [records, setRecords] = useState(() =>
    readStored("checkinfo-admin-categories", categorySeed),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [form, setForm] = useState({
    image: "Image",
    name: "",
    order: "",
    status: "Active" as "Active" | "Inactive",
    homeBottom: false,
    homeTop: false,
  });

  const filtered = useMemo(() => {
    return records
      .filter((record) => record.name.toLowerCase().includes(query.toLowerCase()))
      .filter((record) => status === "All" || record.status === status)
      .sort((a, b) => a.order - b.order);
  }, [query, records, status]);

  function sync(next: CategoryRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-categories", next);
  }

  function resetForm() {
    setEditing(null);
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
    resetForm();
  }

  function editRecord(record: CategoryRecord) {
    setEditing(record);
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
    setSelected([]);
  }

  function deleteSelected() {
    sync(records.filter((record) => !selected.includes(record.id)));
    setSelected([]);
  }

  function updateOrder() {
    sync(records.map((record, index) => ({ ...record, order: (index + 1) * 10 })));
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

      <div className="admin-editor">
        <label>
          <span>Category Name</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          <span>Image</span>
          <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
        </label>
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
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

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
            <span>{record.image}</span>
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
  const [records, setRecords] = useState(() =>
    readStored("checkinfo-admin-business", businessSeed),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ category: "All", name: "", status: "All", type: "" });
  const [editing, setEditing] = useState<BusinessRecord | null>(null);
  const [form, setForm] = useState({
    address: "",
    badge: "Verified",
    category: categories[0] ?? "General",
    contact: "",
    details: "",
    name: "",
    status: "Pending" as Status,
  });

  const filtered = useMemo(() => {
    return records
      .filter((record) => record.name.toLowerCase().includes(filters.name.toLowerCase()))
      .filter((record) => record.details.toLowerCase().includes(filters.type.toLowerCase()))
      .filter((record) => filters.category === "All" || record.category === filters.category)
      .filter((record) => filters.status === "All" || record.status === filters.status);
  }, [filters, records]);

  function sync(next: BusinessRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-business", next);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      address: "",
      badge: "Verified",
      category: categories[0] ?? "General",
      contact: "",
      details: "",
      name: "",
      status: "Pending",
    });
  }

  function saveRecord() {
    if (!form.name.trim()) return;

    const nextRecord: BusinessRecord = {
      id: editing?.id ?? `biz-${Date.now()}`,
      address: form.address.trim(),
      badge: form.badge,
      category: form.category,
      contact: form.contact.trim(),
      details: form.details.trim(),
      name: form.name.trim(),
      status: form.status,
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
      category: record.category,
      contact: record.contact,
      details: record.details,
      name: record.name,
      status: record.status,
    });
  }

  function bulkStatus(nextStatus: Status) {
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
            <span>{record.name}<small>{record.category}</small></span>
            <span>{record.address}</span>
            <span>{record.contact}</span>
            <span>{record.badge} / {record.details}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => editRecord(record)}>Manage</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManageMembersModule() {
  const [records, setRecords] = useState(() => readStored("checkinfo-admin-members", memberSeed));
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

  function sync(next: MemberRecord[]) {
    setRecords(next);
    writeStored("checkinfo-admin-members", next);
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
    resetForm();
  }

  function sendSelected() {
    const stamp = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, lastSent: `Campaign sent ${stamp}` } : record)));
    setSelected([]);
  }

  function unsubscribeSelected() {
    sync(records.map((record) => (selected.includes(record.id) ? { ...record, status: "Unsubscribed" } : record)));
    setSelected([]);
  }

  function deleteSelected() {
    sync(records.filter((record) => !selected.includes(record.id)));
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
  const stateRecords = readStored("checkinfo-admin-states", stateSeed);
  const cityRecords = readStored("checkinfo-admin-cities", citySeed);
  const isStates = kind === "states";
  const isCities = kind === "cities";
  const storageKey = `checkinfo-admin-${kind}`;
  const fallback: LocationAdminRecord[] = isStates ? stateSeed : isCities ? citySeed : locationSeed;
  const [records, setRecords] = useState<LocationAdminRecord[]>(() => readStored(storageKey, fallback));
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({ city: "All", keyword: "", state: "All", status: "All" });
  const [editing, setEditing] = useState<StateRecord | CityRecord | LocationRecord | null>(null);
  const [form, setForm] = useState({
    city: cityRecords[0]?.name ?? "",
    country: "India",
    name: "",
    state: stateRecords[0]?.name ?? "",
    status: "Active" as "Active" | "Inactive",
  });

  const filtered = useMemo(() => {
    return records
      .filter((record) => record.name.toLowerCase().includes(filters.keyword.toLowerCase()))
      .filter((record) => filters.status === "All" || record.status === filters.status)
      .filter((record) => isStates || filters.state === "All" || "state" in record && record.state === filters.state)
      .filter((record) => !isStates && !isCities ? filters.city === "All" || "city" in record && record.city === filters.city : true);
  }, [filters, isCities, isStates, records]);

  function sync(next: LocationAdminRecord[]) {
    setRecords(next);
    writeStored(storageKey, next);
  }

  function resetForm() {
    setEditing(null);
    setForm({
      city: cityRecords[0]?.name ?? "",
      country: "India",
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
        : { ...base, city: form.city, state: form.state };

    sync(editing ? records.map((record) => (record.id === editing.id ? nextRecord : record)) : [...records, nextRecord]);
    resetForm();
  }

  function editRecord(record: StateRecord | CityRecord | LocationRecord) {
    setEditing(record);
    setForm({
      city: "city" in record ? record.city : cityRecords[0]?.name ?? "",
      country: record.country,
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
        <label><span>{isStates ? "State Name" : isCities ? "City Name" : "Location Name"}</span><input value={filters.keyword} onChange={(event) => setFilters({ ...filters, keyword: event.target.value })} /></label>
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
            <span>City</span>
            <select value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })}>
              <option>All</option>
              {cityRecords.map((record) => <option key={record.id}>{record.name}</option>)}
            </select>
          </label>
        ) : null}
        <button type="button" onClick={() => undefined}>Submit</button>
      </div>

      <div className="admin-editor admin-editor-location">
        <label><span>{isStates ? "State Name" : isCities ? "City Name" : "Location Name"}</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label><span>Country Name</span><input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></label>
        {!isStates ? (
          <label>
            <span>State</span>
            <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
              {stateRecords.map((record) => <option key={record.id}>{record.name}</option>)}
            </select>
          </label>
        ) : null}
        {!isStates && !isCities ? (
          <label>
            <span>City</span>
            <select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}>
              {cityRecords.map((record) => <option key={record.id}>{record.name}</option>)}
            </select>
          </label>
        ) : null}
        <label>
          <span>Status</span>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}>
            <option>Active</option><option>Inactive</option>
          </select>
        </label>
        <button type="button" onClick={saveRecord}>{editing ? "Update" : isStates ? "Add State" : isCities ? "Add City" : "Add Location"}</button>
        {editing ? <button type="button" className="admin-light-button" onClick={resetForm}>Cancel</button> : null}
      </div>

      <div className="admin-actions">
        <button type="button" onClick={() => bulkStatus("Active")} disabled={!selected.length}>Activate</button>
        <button type="button" onClick={() => bulkStatus("Inactive")} disabled={!selected.length}>Deactivate</button>
        <button type="button" onClick={deleteSelected} disabled={!selected.length}>Delete</button>
      </div>

      <div className={`admin-real-table ${isStates ? "admin-real-table-states" : isCities ? "admin-real-table-cities" : "admin-real-table-locations"}`}>
        <div className="admin-real-row admin-real-head">
          <span>Select</span><span>Name</span>{!isStates ? <span>State Name</span> : null}{!isStates && !isCities ? <span>City Name</span> : null}<span>Country Name</span><span>Status</span><span>Action</span>
        </div>
        {filtered.map((record) => (
          <div className="admin-real-row" key={record.id}>
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(toggleSelection(selected, record.id, event.target.checked))} /></span>
            <span>{record.name}</span>
            {!isStates ? <span>{"state" in record ? record.state : "-"}</span> : null}
            {!isStates && !isCities ? <span>{"city" in record ? record.city : "-"}</span> : null}
            <span>{record.country}</span>
            <span><b className={`admin-status admin-status-${record.status.toLowerCase()}`}>{record.status}</b></span>
            <span><button type="button" className="admin-link-button" onClick={() => editRecord(record)}>Edit</button></span>
          </div>
        ))}
      </div>
    </section>
  );
}
