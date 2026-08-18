import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ContactForm } from "./ContactForm";

export function ContactPage() {
  return (
    <main className="check-home check-contact-page" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <SiteHeader activeNav="Contact Us" />

      {/* Modern Atlas 2-Column Get In Touch Layout */}
      <ContactForm />

      <SiteFooter />

      <div className="check-floating-actions">
        <a href="/members/add_listing">Free Listing</a>
        <a href="#contact-form">Customer Care</a>
      </div>
    </main>
  );
}
