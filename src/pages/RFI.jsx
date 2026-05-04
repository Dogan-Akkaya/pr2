import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

/* ────────────────────────────────────────────────────────────────────────────
   RFI — Request For Information
   Per the wireframe brief: "the simplest page in the entire dashboard."
   Pure marketing/contact page. The single interactive element is the CTA →
   modal form. No tickets, no tracker, no stats.
   ──────────────────────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    title: "Threat Actor Engagement",
    color: "#FF4562",
    bg: "rgba(255,69,98,0.08)",
    border: "rgba(255,69,98,0.18)",
    iconKey: "target",
    desc: "SOCRadar's analysts can directly engage with threat actors on dark web forums and encrypted channels on your behalf — verifying threats, assessing exposed data scope, and gathering intelligence to inform your response.",
  },
  {
    title: "Ransomware Negotiation Support",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
    iconKey: "lock",
    desc: "Expert guidance through ransomware negotiations. Our team manages communications with operators, assesses demands, and advises on response options aligned with your legal and business requirements.",
  },
  {
    title: "Custom Intelligence Reports",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.18)",
    iconKey: "clipboard",
    desc: "Tailored threat intelligence reports on specific topics — threat actors targeting your industry, regional landscapes, supply chain risk assessments, or deep-dive investigations into active campaigns.",
  },
];

const GHOST_CARDS = [
  {
    title: "Tailored to Your Needs",
    desc: "Every organization faces unique threats. Tell us what you're dealing with — we'll build a custom response.",
    glyph: "···",
  },
  {
    title: "And More",
    desc: "Dark web takedowns, incident response advisory, executive briefings, and capabilities we scope to your situation.",
    glyph: "···",
  },
  {
    title: "Let's Talk",
    desc: "Describe your situation. Our team scopes a solution and responds within 24 hours.",
    glyph: "→",
    accent: true,
  },
];

const SERVICE_OPTIONS = [
  "Threat Actor Engagement",
  "Ransomware Negotiation Support",
  "Custom Intelligence Reports",
  "Dark Web Takedown",
  "Incident Response Advisory",
  "Executive Briefing",
  "Other",
];

const URGENCY = [
  { key: "routine", label: "Routine",         desc: "Standard request, response within 24h" },
  { key: "urgent",  label: "Urgent",          desc: "Expedited, response within 4h" },
  { key: "active",  label: "Active Incident", desc: "Live situation, immediate engagement" },
];

const Icon = {
  shield:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  target:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  lock:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  clipboard: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>,
  arrowRight:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
};

const ICON_BY_KEY = { target: Icon.target, lock: Icon.lock, clipboard: Icon.clipboard };

/* ────────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────────── */

export default function RFI() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "Dogan Akkaya",
    email: "dogan.akkaya@socradar.io",
    company: "SOCRadar",
    service: SERVICE_OPTIONS[0],
    urgency: "routine",
    description: "",
  });
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const openModal = (preselectedService) => {
    if (preselectedService) setForm((f) => ({ ...f, service: preselectedService }));
    setSubmitted(false);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: "40px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <div style={{ width: "100%", maxWidth: 720, animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: "0 auto 18px",
            background: "rgba(255,69,98,0.08)", border: "1px solid rgba(255,69,98,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#FF4562",
          }}>
            <Icon.shield width="26" height="26" />
          </div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", color: t.text25, fontWeight: 700, marginBottom: 8 }}>Data & Services</div>
          <h1 className="hfont" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10, color: t.text }}>
            Request For Information
          </h1>
          <p style={{ fontSize: 13, color: t.text50, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            SOCRadar's professional services team provides expert-led support for active threat situations.
            These services are available on request to supplement your platform monitoring.
          </p>
        </div>

        {/* Service grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 40, animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
          {SERVICES.map((s) => {
            const I = ICON_BY_KEY[s.iconKey];
            return (
              <div
                key={s.title}
                onClick={() => openModal(s.title)}
                className="glass"
                style={{
                  padding: "20px 18px", cursor: "pointer", transition: "all 0.2s",
                  borderTop: `2px solid ${s.color}50`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderTopColor = s.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderTopColor = `${s.color}50`; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, marginBottom: 12,
                  background: s.bg, border: `1px solid ${s.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: s.color,
                }}>
                  <I width="17" height="17" />
                </div>
                <h3 className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: t.text, letterSpacing: "-0.01em" }}>{s.title}</h3>
                <p style={{ fontSize: 11, color: t.text50, lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            );
          })}

          {GHOST_CARDS.map((g, i) => (
            <div
              key={g.title}
              style={{
                padding: "20px 18px", cursor: g.accent ? "pointer" : "default",
                background: "transparent",
                border: g.accent ? "1px solid rgba(255,69,98,0.30)" : `1px dashed ${t.borderMed}`,
                borderRadius: 14,
                opacity: g.accent ? 1 : 0.62,
                transition: "all 0.2s",
              }}
              onClick={g.accent ? () => openModal() : undefined}
              onMouseEnter={g.accent ? (e) => { e.currentTarget.style.background = "rgba(255,69,98,0.06)"; e.currentTarget.style.borderColor = "rgba(255,69,98,0.55)"; } : undefined}
              onMouseLeave={g.accent ? (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,69,98,0.30)"; } : undefined}
            >
              <div style={{
                fontSize: g.glyph === "→" ? 24 : 28, lineHeight: 1, marginBottom: 12,
                color: g.accent ? "#FF4562" : t.text20,
                letterSpacing: g.glyph === "···" ? 4 : 0,
                fontWeight: 800,
              }}>
                {g.glyph === "→" ? <Icon.arrowRight width="22" height="22" /> : g.glyph}
              </div>
              <h3 className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: g.accent ? "#FF4562" : t.text40, letterSpacing: "-0.01em" }}>{g.title}</h3>
              <p style={{ fontSize: 11, color: g.accent ? t.text55 : t.text30, lineHeight: 1.55 }}>{g.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginBottom: 24, animation: loaded ? "fadeUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
          <button
            onClick={() => openModal()}
            style={{
              padding: "14px 38px", borderRadius: 11, border: "none", cursor: "pointer",
              background: "#FF4562", color: "#fff",
              fontSize: 14, fontWeight: 700, fontFamily: "'Red Hat Display', sans-serif",
              boxShadow: "0 6px 24px rgba(255,69,98,0.30)", letterSpacing: "0.02em",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,69,98,0.38)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,69,98,0.30)"; }}
          >
            Contact Our Team
          </button>
        </div>

        {/* Trust line */}
        <div style={{ textAlign: "center", fontSize: 11, color: t.text35, maxWidth: 460, margin: "0 auto", lineHeight: 1.5 }}>
          Available to all SOCRadar Advanced Dark Web Monitoring customers. Our team typically responds within 24 hours.
        </div>
      </div>

      {/* ═══ MODAL ═══ */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 460,
            background: t.bgPanel, backdropFilter: "blur(20px)",
            borderLeft: `1px solid ${t.borderLight}`,
            zIndex: 51, overflow: "auto", padding: "24px 26px",
            animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700 }}>RFI · Submit Request</div>
              <button onClick={() => setModalOpen(false)} style={{
                width: 28, height: 28, borderRadius: 8, border: "none",
                background: t.bgElevated, color: t.text50, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon.close width="14" height="14" />
              </button>
            </div>
            <h2 className="hfont" style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20, color: t.text }}>Contact Our Team</h2>

            {submitted ? (
              <div style={{ padding: "30px 0", textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                  background: "rgba(22,163,74,0.10)", border: "1px solid rgba(22,163,74,0.30)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A",
                }}>
                  <Icon.check width="24" height="24" />
                </div>
                <h3 className="hfont" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Request submitted</h3>
                <p style={{ fontSize: 12, color: t.text50, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 18px" }}>
                  Our team will respond within 24 hours{form.urgency === "active" ? " — your case has been flagged as Active Incident and routed to on-call analysts" : form.urgency === "urgent" ? " (expedited within 4h)" : ""}.
                </p>
                <button onClick={() => setModalOpen(false)} style={{
                  padding: "10px 24px", borderRadius: 9, border: `1px solid ${t.borderMed}`,
                  background: "transparent", color: t.text60,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                }}>Close</button>
              </div>
            ) : (
              <>
                {/* Identity (prefilled) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} t={t} />
                  <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} t={t} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FormField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} t={t} />
                </div>

                {/* Service */}
                <div style={{ marginBottom: 16 }}>
                  <FormLabel>Service of Interest</FormLabel>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      background: t.bgInput, color: t.text,
                      border: `1px solid ${t.borderMed}`,
                      fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {/* Urgency */}
                <div style={{ marginBottom: 16 }}>
                  <FormLabel>Urgency</FormLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {URGENCY.map((u) => {
                      const sel = form.urgency === u.key;
                      const accent = u.key === "active" ? "#DC2626" : u.key === "urgent" ? "#F59E0B" : "#3B82F6";
                      return (
                        <div
                          key={u.key}
                          onClick={() => setForm({ ...form, urgency: u.key })}
                          style={{
                            padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                            background: sel ? `${accent}10` : t.bgCard,
                            border: `1px solid ${sel ? `${accent}40` : t.border}`,
                            display: "flex", alignItems: "center", gap: 10,
                            transition: "all 0.15s",
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                            border: `2px solid ${sel ? accent : t.borderStrong}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: sel ? t.text : t.text60 }}>{u.label}</div>
                            <div style={{ fontSize: 10, color: t.text40, marginTop: 1 }}>{u.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <FormLabel>Brief Description <span style={{ color: t.text30, fontWeight: 400 }}>(optional)</span></FormLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your situation. Include relevant context — affected assets, threat actor names, deadlines, or prior intelligence."
                    rows={5}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      background: t.bgInput, color: t.text,
                      border: `1px solid ${t.borderMed}`,
                      fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none",
                      resize: "vertical", lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 9,
                      border: `1px solid ${t.borderMed}`, background: "transparent", color: t.text60,
                      fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    }}
                  >Cancel</button>
                  <button
                    onClick={() => setSubmitted(true)}
                    style={{
                      flex: 2, padding: "12px", borderRadius: 9, border: "none", cursor: "pointer",
                      background: "#FF4562", color: "#fff",
                      fontSize: 13, fontWeight: 700, fontFamily: "'Red Hat Display', sans-serif",
                      boxShadow: "0 4px 16px rgba(255,69,98,0.30)",
                    }}
                  >Submit Request</button>
                </div>

                <div style={{ fontSize: 10, color: t.text30, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                  By submitting, you agree to be contacted by SOCRadar's professional services team. Standard response time: 24 hours.
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FormLabel({ children }) {
  return <div className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-35)", fontWeight: 700, marginBottom: 6 }}>{children}</div>;
}

function FormField({ label, value, onChange, t }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          background: t.bgInput, color: t.text,
          border: `1px solid ${t.borderMed}`,
          fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none",
        }}
      />
    </div>
  );
}
