import {
  AdminHeader,
  AdminPageBody,
  adminPages,
  AdminShell,
} from "@/frontend/admin/AdminPanel";
import {
  canAccessAdminResource,
  filterAdminGroupsByPermissions,
} from "@/backend/checkinfo";
import { getAuthCookieName, readSessionToken } from "@/backend/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminDashboardModule,
  ChangeAdminPasswordModule,
  ManageAdminSettingsModule,
  ManageEnquiriesModule,
  ManageFaqsModule,
  ManageBusinessModule,
  ManageCategoriesModule,
  ManageCitiesModule,
  ManageLocationsModule,
  ManageMediaModule,
  ManageMembersModule,
  ManageMetaTagsModule,
  ManageNewsletterModule,
  ManageStatesModule,
  ManageStaticPagesModule,
  ManageSubadminsModule,
  ManageTestimonialsModule,
  ManageExportModule,
  ManageAuditLogsModule,
} from "@/frontend/admin/AdminWorkingModules";

async function getAdminPageSession() {
  const cookieStore = await cookies();
  const adminSession = readSessionToken(cookieStore.get(getAuthCookieName("admin"))?.value, "admin");
  if (adminSession) return { permissions: "all" as const, roleLabel: "administrator" };

  const subadminSession = readSessionToken(cookieStore.get(getAuthCookieName("subadmin"))?.value, "subadmin");
  if (!subadminSession) redirect("/admin/login");

  const { getMongoSubadminByUsernameOrEmail, isMongoConfigured } = await import("@/backend/mongodb");
  if (!isMongoConfigured()) redirect("/admin/login");
  const subadmin = await getMongoSubadminByUsernameOrEmail(subadminSession.username);
  if (!subadmin || subadmin.status !== "Active") redirect("/admin/login");

  return {
    permissions: Array.isArray(subadmin.permissions) ? subadmin.permissions : ["dashboard"],
    roleLabel: "subadmin",
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const active = slug?.[0] ?? "dashboard";
  const session = await getAdminPageSession();
  if (!canAccessAdminResource(active, session.permissions)) {
    redirect("/admin");
  }
  const page = adminPages[active] ?? adminPages.dashboard;

  return (
    <AdminShell active={active} groups={filterAdminGroupsByPermissions(session.permissions)} roleLabel={session.roleLabel}>
      <AdminHeader page={page} />
      {active === "dashboard" ? (
        <AdminDashboardModule />
      ) : active === "categories" ? (
        <ManageCategoriesModule />
      ) : active === "business" ? (
        <ManageBusinessModule />
      ) : active === "export" ? (
        <ManageExportModule />
      ) : active === "members" ? (
        <ManageMembersModule />
      ) : active === "newsletter" ? (
        <ManageNewsletterModule />
      ) : active === "meta" ? (
        <ManageMetaTagsModule />
      ) : active === "subadmins" ? (
        <ManageSubadminsModule />
      ) : active === "audit-logs" ? (
        <ManageAuditLogsModule />
      ) : active === "settings" ? (
        <ManageAdminSettingsModule />
      ) : active === "admin-password" ? (
        <ChangeAdminPasswordModule />
      ) : active === "states" ? (
        <ManageStatesModule />
      ) : active === "cities" ? (
        <ManageCitiesModule />
      ) : active === "locations" ? (
        <ManageLocationsModule />
      ) : active === "static-pages" ? (
        <ManageStaticPagesModule />
      ) : active === "contact-enquiries" ? (
        <ManageEnquiriesModule type="Contact" />
      ) : active === "business-enquiries" ? (
        <ManageEnquiriesModule type="Business" />
      ) : active === "career-enquiries" ? (
        <ManageEnquiriesModule type="Career" />
      ) : active === "advertise-enquiries" ? (
        <ManageEnquiriesModule type="Advertise" />
      ) : active === "banners" ? (
        <ManageMediaModule kind="banners" />
      ) : active === "header-images" ? (
        <ManageMediaModule kind="header-images" />
      ) : active === "testimonials" ? (
        <ManageTestimonialsModule />
      ) : active === "faqs" ? (
        <ManageFaqsModule />
      ) : (
        <AdminPageBody page={page} resource={active} />
      )}
    </AdminShell>
  );
}
