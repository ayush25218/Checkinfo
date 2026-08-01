"use client";

import { useEffect } from "react";

function formLabel(editor: HTMLElement) {
  if (editor.classList.contains("admin-editor-business")) return "Add Business";
  if (editor.classList.contains("admin-editor-members")) return "Add Member";
  if (editor.classList.contains("admin-editor-location")) return "Add Location";
  if (editor.classList.contains("admin-editor-meta")) return "Add Meta Tag";
  if (editor.classList.contains("admin-editor-subadmins")) return "Add Subadmin";
  if (editor.classList.contains("admin-editor-settings")) return "Open Settings Form";
  if (editor.classList.contains("admin-editor-password")) return "Change Password";
  if (editor.classList.contains("admin-editor-content")) return "Open Form";
  return "Open Form";
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
          button.textContent = willOpen ? "Hide Form" : formLabel(editor);
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
