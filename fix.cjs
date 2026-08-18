const fs = require('fs');
let code = fs.readFileSync('frontend/member/MemberWorkingModules.tsx', 'utf8');

// Issue 1
code = code.replace(
  /<label className="panel-field wide"><span>Business Photo<\/span><input value={form\.image \?\? ""} placeholder="https:\/\/example\.com\/photo\.jpg or upload below" onChange={\(event\) => setForm\({ \.\.\.form, image: event\.target\.value }\)} \/><small>Paste a direct image URL or upload an image from gallery manager\.<\/small><\/label>/g,
  ''
);

// Issue 2
const oldSub = '<label className="panel-field"><span>Subcategory</span><select value={form.subcategory} onChange={(event) => { const next = selectedTaxonomy?.subcategories.find((subcategory) => subcategory.name === event.target.value); setForm({ ...form, businessType: next?.businessTypes[0]?.name ?? "General Provider", subcategory: event.target.value }); }}>{selectedTaxonomy?.subcategories.length ? selectedTaxonomy.subcategories.map((subcategory) => <option key={subcategory.slug}>{subcategory.name}</option>) : <option value="General Services">General Services</option>}</select></label>';
const newSub = `        <label className="panel-field">
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
        </label>`;
code = code.replace(oldSub, newSub);

// Issue 3 - Edit Details Lock
const isApprovedLine = 'const isApproved = currentListing.status === "Active" || currentListing.status === "Featured" || currentListing.status === "Popular" || currentListing.approvalStatus === "Approved";\n\n  return (';
code = code.replace('return (\n    <MemberShell active="My Business Listing">', isApprovedLine + '\n    <MemberShell active="My Business Listing">');

const oldHeaderAction = `<button
            type="button"
            className="primary-button"
            onClick={() => { setIsEditing(true); setMessage(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 22px", borderRadius: "8px", background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: "600", boxShadow: "0 4px 12px rgba(15,23,42,0.18)" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edit Details ✏️
          </button>`;

const newHeaderAction = `!isApproved ? (
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
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#16a34a", fontWeight: "600", background: "#f0fdf4", padding: "8px 16px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Approved (Locked)
            </div>
          )`;

code = code.replace(oldHeaderAction, newHeaderAction);

const oldSubtitle = 'subtitle="View your business listing details. Click the Edit button to modify details."';
const newSubtitle = 'subtitle={isApproved ? "Your business listing is approved and live. Modifications are currently locked." : "View your business listing details. Click the Edit button to modify details."}';
code = code.replace(oldSubtitle, newSubtitle);

const oldCardButton = `<button
                type="button"
                onClick={() => { setIsEditing(true); setMessage(""); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", color: "#0f172a" }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Details
              </button>`;
const newCardButton = `{!isApproved && (
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
            )}`;
code = code.replace(oldCardButton, newCardButton);

fs.writeFileSync('frontend/member/MemberWorkingModules.tsx', code);
console.log("Done");
