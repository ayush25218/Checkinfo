"use client";

import { useState } from "react";

type AdminGroup = readonly [string, readonly (readonly [string, string])[]];

const groupMarks: Record<string, string> = {
  Dashboard: "DB",
  "Business Management": "BM",
  "Members Management": "MM",
  Newsletter: "NL",
  "Manage Admin": "AD",
  "Locations Management": "LM",
  "Other Management": "OM",
};

export function AdminSidebarNav({
  active,
  groups,
}: {
  active: string;
  groups: readonly AdminGroup[];
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  function toggleGroup(group: string) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

  return (
    <nav aria-label="Admin navigation">
      {groups.map(([group, items]) => {
        const isOpen = openGroups.has(group);

        return (
          <section className={isOpen ? "admin-nav-group is-open" : "admin-nav-group"} key={group}>
            <button
              aria-expanded={isOpen}
              className="admin-nav-toggle"
              onClick={() => toggleGroup(group)}
              type="button"
            >
              <span className="admin-nav-label">
                <i aria-hidden="true">{groupMarks[group] ?? group.slice(0, 2).toUpperCase()}</i>
                <span>{group}</span>
              </span>
              <b aria-hidden="true">+</b>
            </button>
            <div className="admin-submenu" hidden={!isOpen}>
              {items.map(([label, slug]) => (
                <a
                  aria-current={active === slug ? "page" : undefined}
                  href={`/admin/${slug}`}
                  key={slug}
                >
                  {label}
                </a>
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
