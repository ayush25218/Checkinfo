"use client";

import { useState } from "react";

type AdminGroup = readonly [string, readonly (readonly [string, string])[]];

export function AdminSidebarNav({
  active,
  groups,
}: {
  active: string;
  groups: readonly AdminGroup[];
}) {
  const activeGroup = groups.find(([_, items]) => items.some(([, slug]) => slug === active))?.[0] ?? groups[0]?.[0] ?? "";
  const [openGroups, setOpenGroups] = useState(() => new Set([activeGroup]));

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
              <span>{group}</span>
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
