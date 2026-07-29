import {
  AdminHeader,
  AdminPageBody,
  adminPages,
  AdminShell,
} from "@/frontend/admin/AdminPanel";
import {
  ManageBusinessModule,
  ManageCategoriesModule,
} from "@/frontend/admin/AdminWorkingModules";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const active = slug?.[0] ?? "dashboard";
  const page = adminPages[active] ?? adminPages.dashboard;

  return (
    <AdminShell active={active}>
      <AdminHeader page={page} />
      {active === "categories" ? (
        <ManageCategoriesModule />
      ) : active === "business" ? (
        <ManageBusinessModule />
      ) : (
        <AdminPageBody page={page} resource={active} />
      )}
    </AdminShell>
  );
}
