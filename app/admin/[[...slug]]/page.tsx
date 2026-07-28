import {
  AdminHeader,
  AdminPageBody,
  adminPages,
  AdminShell,
} from "@/frontend/admin/AdminPanel";

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
      <AdminPageBody page={page} resource={active} />
    </AdminShell>
  );
}
