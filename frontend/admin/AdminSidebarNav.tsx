"use client";

import { useState } from "react";

type AdminGroup = readonly [string, readonly (readonly [string, string])[]];

const groupMarks: Record<string, string> = {
  Dashboard: "dashboard",
  "Business Management": "business",
  "Members Management": "members",
  Newsletter: "newsletter",
  "Manage Admin": "settings",
  "Locations Management": "locations",
  "Other Management": "folder",
};

export function AdminSidebarNav({
  active,
  groups,
}: {
  active: string;
  groups: readonly AdminGroup[];
}) {
  const activeGroup = groups.find(([, items]) => items.some(([, slug]) => slug === active))?.[0] ?? "";
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(activeGroup ? [activeGroup] : []));

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
                <i
                  aria-hidden="true"
                  className={`admin-nav-icon admin-nav-icon-${groupMarks[group] ?? "folder"}`}
                />
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
