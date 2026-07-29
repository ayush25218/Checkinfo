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
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, record.id] : selected.filter((id) => id !== record.id))} /></span>
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
            <span><input type="checkbox" checked={selected.includes(record.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, record.id] : selected.filter((id) => id !== record.id))} /></span>
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
