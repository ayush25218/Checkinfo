import {
  AdminHeader,
  AdminPageBody,
  adminPages,
  AdminShell,
} from "@/frontend/admin/AdminPanel";
import {
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
