import type { CSSProperties, ReactNode } from "react";
import { adminGroups, adminPages, type AdminPageConfig } from "@/backend/checkinfo";

export { adminPages };

export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <strong>Checkinfo</strong>
          <span>Administrator Area</span>
        </a>
        <nav aria-label="Admin navigation">
          {adminGroups.map(([group, items]) => (
            <section className="admin-nav-group" key={group as string}>
              <h2>{group as string}</h2>
              {(items as string[][]).map(([label, slug]) => (
                <a
                  aria-current={active === slug ? "page" : undefined}
                  href={`/admin/${slug}`}
                  key={slug}
                >
                  {label}
                </a>
              ))}
            </section>
          ))}
        </nav>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}

export function AdminHeader({ page }: { page: AdminPageConfig }) {
  return (
    <header className="admin-header">
      <div>
        <span>{page.group}</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </div>
      <a href="/">View Website</a>
    </header>
  );
}

export function AdminPageBody({
  page,
  resource,
}: {
  page: AdminPageConfig;
  resource: string;
}) {
  return (
    <>
      {page.stats ? (
        <section className="admin-stats">
          {page.stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>
      ) : null}

      <section className="admin-card">
        {page.filters ? (
          <form className="admin-filters" action={`/api/admin/${resource}`} method="get">
            {page.filters.map((filter) => (
              <label key={filter}>
                <span>{filter}</span>
                <input
                  name={filter.toLowerCase().replace(/[^a-z0-9]+/g, "_")}
                  placeholder={filter}
                  type={filter.toLowerCase().includes("password") ? "password" : "text"}
                />
              </label>
            ))}
            <button type="submit">Submit</button>
          </form>
        ) : null}

        {page.actions ? (
          <div className="admin-actions">
            {page.actions.map((action) => (
              <button type="button" key={action}>
                {action}
              </button>
            ))}
          </div>
        ) : null}

        {page.columns ? (
          <div
            className="admin-table"
            role="table"
            style={{ "--admin-cols": page.columns.length } as CSSProperties}
          >
            <div className="admin-row admin-row-head" role="row">
              {page.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {(page.rows ?? []).map((row) => (
              <div className="admin-row" role="row" key={row.join("-")}>
                {page.columns?.map((column, index) => (
                  <span key={column}>{row[index] ?? "-"}</span>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
