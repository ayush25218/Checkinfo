import {
  AdminHeader,
  AdminPageBody,
  adminPages,
  AdminShell,
} from "@/frontend/admin/AdminPanel";
import {
  ManageBusinessModule,
  ManageCategoriesModule,
  ManageCitiesModule,
  ManageLocationsModule,
  ManageMembersModule,
  ManageNewsletterModule,
  ManageStatesModule,
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
      ) : active === "members" ? (
        <ManageMembersModule />
      ) : active === "newsletter" ? (
        <ManageNewsletterModule />
      ) : active === "states" ? (
        <ManageStatesModule />
      ) : active === "cities" ? (
        <ManageCitiesModule />
      ) : active === "locations" ? (
        <ManageLocationsModule />
      ) : (
        <AdminPageBody page={page} resource={active} />
      )}
    </AdminShell>
  );
}
