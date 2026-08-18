# Checkinfo SaaS Application Roadmap

## Product Goal
Build Checkinfo as a multi-tenant business directory SaaS where many business owners can manage their own listings, while one admin team can approve, promote, moderate, and monetize all businesses from a central control panel.

## Current Core Flow
- Member registers or logs in as a business owner.
- Member creates or updates a business listing.
- Listing is saved with `Pending` status and synced to the `businesses` collection.
- Admin reviews the same listing in Manage Business.
- Admin approval changes it to `Active` and marks `approvalStatus` as `Approved`.
- Public website shows only approved active listings.
- Member APIs are owner-isolated using the logged-in session, not query/header member IDs.

## SaaS Roles
- Super Admin: full platform control, billing setup, team permissions, settings, audit logs.
- Admin: manage business approvals, members, categories, enquiries, content, and media.
- Subadmin: limited modules based on permissions.
- Business Owner: manage own listing, enquiries, reviews, packages, notifications, support.
- Visitor: search, view listings, submit enquiries, reviews, and leads.

## Core SaaS Modules
- Authentication and Sessions
- Member Account Management
- Business Listing Management
- Admin Approval Workflow
- Public Directory Search
- Featured, Trending, and New Ads Placements
- Enquiries and Leads
- Reviews and Ratings
- Notifications
- Packages and Subscription Plans
- Subadmin Permissions
- Audit Logs
- Content Management
- Taxonomy and Location Management
- Reporting and Analytics
- Billing and Invoices

## Completed Foundation
- MongoDB connection.
- Member registration and login.
- Member listing save/update flow.
- Business collection sync.
- Admin approval and placement flow.
- Public approved-listing filtering.
- Owner-isolated member APIs.
- Admin audit log collection.
- Admin protected API routes.
- Manage Business placement support for multiple sections.
- Member notifications for status and placement changes.

## High Priority Remaining Work
1. Subadmin login with module-level permissions.
2. Package purchase flow with payment gateway.
3. Plan limits, such as max listings, max images, featured days, enquiry credits.
4. Admin audit logs UI page.
5. Member notification center with read/unread persistence.
6. Business approval detail view with before/after changes.
7. Rejection reason field and member-facing correction flow.
8. Public listing detail SEO polish and schema markup.
9. Image upload storage instead of direct image URL only.
10. Google Places enrichment with safe API key server-side only.

## SaaS Data Collections
- `members`
- `businesses`
- `admin_settings`
- `subadmins`
- `audit_logs`
- `categories`
- `subcategories`
- `states`
- `cities`
- `locations`
- `enquiries`
- `reviews`
- `notifications`
- `packages`
- `subscriptions`
- `payments`
- `invoices`
- `media`
- `static_pages`
- `meta_tags`
- `newsletter_subscribers`

## Security Checklist
- Member API must always use session-derived owner ID.
- Admin API must require admin or permitted subadmin role.
- Public API must never expose pending/rejected listings.
- Google and payment keys must stay server-side.
- Every admin mutation should write an audit log.
- Password changes must require server confirmation.
- File uploads must validate type, size, and destination.

## Next Sprint
1. Build subadmin permission model.
2. Add audit logs page in admin panel.
3. Add package/subscription DB collections.
4. Connect Featured Packages to real package limits.
5. Add rejection reason and correction workflow.
