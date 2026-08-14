import { SiteHeader } from "@/frontend/web/SiteHeader";
import { SiteFooter } from "@/frontend/web/SiteFooter";
import { CareerForm } from "./CareerForm";

export default function CareerPage() {
  return (
    <main className="check-home">
      <SiteHeader activeNav="Career" />
      <section className="check-about-hero" style={{ position: "relative", overflow: "hidden" }}>
        <span className="check-hero-aurora check-hero-aurora-1" aria-hidden="true" />
        <span className="check-hero-aurora check-hero-aurora-2" aria-hidden="true" />
        <div className="check-hero-grid" aria-hidden="true" />
        <h1>Join the Checkinfo Team</h1>
        <p>Explore opportunities and grow with us</p>
      </section>
      
      <section style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>Current Openings</h2>
        <div style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
          <div style={{ padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
            <h3>Business Development Executive</h3>
            <p>Location: New Delhi / Remote</p>
            <p style={{ marginTop: "0.5rem" }}>Drive business growth and partnerships.</p>
          </div>
          <div style={{ padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
            <h3>Digital Marketing Associate</h3>
            <p>Location: New Delhi / Remote</p>
            <p style={{ marginTop: "0.5rem" }}>Manage campaigns and digital presence.</p>
          </div>
          <div style={{ padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
            <h3>Customer Support Executive</h3>
            <p>Location: New Delhi / Remote</p>
            <p style={{ marginTop: "0.5rem" }}>Help users get the best out of Checkinfo.</p>
          </div>
        </div>

        <h2 style={{ marginBottom: "1.5rem" }}>Apply Now</h2>
        <CareerForm />
      </section>

      <SiteFooter />
    </main>
  );
}
