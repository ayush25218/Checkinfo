"use client";

import { useEffect } from "react";

function formLabel(editor: HTMLElement) {
  if (editor.classList.contains("admin-editor-business")) return "Add Business";
  if (editor.classList.contains("admin-editor-members")) return "Add Member";
  if (editor.classList.contains("admin-editor-location")) {
    if (window.location.pathname.includes("states")) return "Add State";
    if (window.location.pathname.includes("cities")) return "Add City";
    return "Add Location";
  }
  if (editor.classList.contains("admin-editor-meta")) return "Add Meta Tag";
  if (editor.classList.contains("admin-editor-subadmins")) return "Add Subadmin";
  if (editor.classList.contains("admin-editor-settings")) return "Manage Admin Settings";
  if (editor.classList.contains("admin-editor-password")) return "Change Password";
  if (editor.classList.contains("admin-editor-content")) {
    const path = window.location.pathname;
    if (path.includes("static-pages")) return "Add Static Page";
    if (path.includes("contact-enquiries")) return "Reply Contact Enquiry";
    if (path.includes("business-enquiries")) return "Reply Business Enquiry";
    if (path.includes("career-enquiries")) return "Reply Career Enquiry";
    if (path.includes("advertise-enquiries")) return "Reply Advertise Enquiry";
    if (path.includes("banners")) return "Add Banner";
    if (path.includes("header-images")) return "Add Header Image";
    if (path.includes("testimonials")) return "Add Testimonial";
    if (path.includes("faqs")) return "Add FAQ";
    const firstLabel = editor.querySelector("label span")?.textContent?.trim();
    return firstLabel ? `Add ${firstLabel}` : "Add Record";
  }
  return "Add Record";
}

export function AdminFormAutoToggle() {
  useEffect(() => {
    const main = document.querySelector(".admin-main");
    if (!main) return undefined;
    const adminMain = main as HTMLElement;

    function setupForms() {
      adminMain.querySelectorAll<HTMLElement>(".admin-editor:not([data-admin-manual-toggle])").forEach((editor) => {
        if (editor.dataset.autoToggleReady === "true") return;

        editor.dataset.autoToggleReady = "true";
        editor.classList.add("admin-editor-collapsed");

        const row = document.createElement("div");
        row.className = "admin-form-toggle-row admin-form-toggle-row-auto";

        const button = document.createElement("button");
        button.className = "admin-form-toggle-button";
        button.type = "button";
        button.textContent = formLabel(editor);

        button.addEventListener("click", () => {
          const willOpen = editor.classList.contains("admin-editor-collapsed");
          editor.classList.toggle("admin-editor-collapsed", !willOpen);
          row.classList.toggle("is-open", willOpen);
          button.textContent = willOpen ? `Hide ${formLabel(editor)}` : formLabel(editor);
        });

        row.appendChild(button);
        editor.parentElement?.insertBefore(row, editor);
      });
    }

    setupForms();
    const observer = new MutationObserver(() => window.requestAnimationFrame(setupForms));
    observer.observe(adminMain, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
