import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";

// ═══════════════════════════════════════
// REPORTS — generated artefacts (board, compliance, tactical)
// ═══════════════════════════════════════
const REPORTS = [
  {
    id: "RPT-2026-Q2-001",
    name: "Q2 Board Briefing — Dark Web Posture",
    kind: "Board",
    format: "PDF",
    pages: 28,
    sizeKb: 4180,
    owner: "Elena Marchetti",
    recipients: ["CEO", "CSO", "CFO", "Audit Committee"],
    cadence: "scheduled",
    schedule: "Quarterly",
    nextRun: "2026-07-15",
    lastRun: "2026-04-30 09:14",
    status: "ready",
    summary: "47,832 customer accounts exposed across 14 sources · est. breach cost $8.27M · KVKK exposure ~$300K · 47% MoM growth.",
  },
  {
    id: "RPT-2026-04-018",
    name: "Customer Leaks — KVKK Notification Pack",
    kind: "Compliance",
    format: "DOCX + PDF",
    pages: 12,
    sizeKb: 1840,
    owner: "Legal — Aylin Yıldız",
    recipients: ["Legal", "DPO"],
    cadence: "ad-hoc",
    schedule: "On demand",
    nextRun: null,
    lastRun: "2026-04-30 11:42",
    status: "ready",
    summary: "Templated breach notice for 47,832 affected customers (Turkish-language, KVKK Art 14 compliant). Awaiting legal sign-off before send.",
  },
  {
    id: "RPT-2026-W18-005",
    name: "Weekly Threat Posture (week 18)",
    kind: "Tactical",
    format: "PDF",
    pages: 9,
    sizeKb: 1260,
    owner: "Ahmet Kara",
    recipients: ["SOC Team", "CSO"],
    cadence: "scheduled",
    schedule: "Weekly · Mondays 06:00",
    nextRun: "2026-05-04",
    lastRun: "2026-04-27 06:01",
    status: "ready",
    summary: "12 active IOCs (incl. Storm-2050 OAuth phish, FIN8 typosquats), 3 fresh ransomware victim claims in your sector, 9 SOCRadar credentials force-rotated.",
  },
  {
    id: "RPT-2026-04-017",
    name: "Executive Risk Profile — Simon Johnsson",
    kind: "Executive",
    format: "PDF",
    pages: 6,
    sizeKb: 720,
    owner: "Elena Marchetti",
    recipients: ["CSO", "Legal"],
    cadence: "ad-hoc",
    schedule: "On demand",
    nextRun: null,
    lastRun: "2026-04-29 17:33",
    status: "ready",
    summary: "VIP risk score 72/100 (VERY HIGH). 8 breaches, 6 password exposures, National ID + DOB compromised. Recommended: SIM-swap protection, security-question reset, CEO-fraud SOP refresh.",
  },
  {
    id: "RPT-2026-04-016",
    name: "Stealer Log Triage — week 17",
    kind: "Tactical",
    format: "CSV + PDF",
    pages: 4,
    sizeKb: 380,
    owner: "Ahmet Kara",
    recipients: ["SOC Team", "IT Ops"],
    cadence: "scheduled",
    schedule: "Weekly · Mondays 06:00",
    nextRun: "2026-05-04",
    lastRun: "2026-04-20 06:02",
    status: "ready",
    summary: "9 of 262K stealer-log credentials matched org domains; all 9 force-rotated, sessions invalidated, IdP audit logs updated.",
  },
  {
    id: "RPT-2026-04-015",
    name: "Third-Party Risk — J Trust Bank",
    kind: "Vendor",
    format: "PDF",
    pages: 11,
    sizeKb: 1490,
    owner: "Vendor Risk — Mert Demir",
    recipients: ["CSO", "Procurement", "Legal"],
    cadence: "ad-hoc",
    schedule: "On demand",
    nextRun: null,
    lastRun: "2026-04-25 14:08",
    status: "ready",
    summary: "129,805 J Trust customer KYC records sold on BreachForums for $1,800. 8% data-flow overlap with your identity-verification pipeline. Vendor confirmed scope.",
  },
  {
    id: "RPT-2026-Q2-002",
    name: "Compliance Estimator — Multi-region",
    kind: "Compliance",
    format: "PDF",
    pages: 18,
    sizeKb: 2240,
    owner: "Legal — Aylin Yıldız",
    recipients: ["Legal", "DPO", "CFO"],
    cadence: "scheduled",
    schedule: "Quarterly",
    nextRun: "2026-07-30",
    lastRun: "2026-04-30 12:15",
    status: "ready",
    summary: "GDPR €2.1M–€20M · CCPA $4.4M–$10.2M · UK GDPR £1.8M–£17.5M · KVKK ~$300K. Aggregated across 47,832 exposed customers.",
  },
  {
    id: "RPT-2026-W18-006",
    name: "Coverage Gap Report — Week 18",
    kind: "Operations",
    format: "PDF",
    pages: 5,
    sizeKb: 480,
    owner: "Dogan Akkaya",
    recipients: ["CSO"],
    cadence: "scheduled",
    schedule: "Weekly · Fridays 17:00",
    nextRun: "2026-05-01 17:00",
    lastRun: "2026-04-25 17:01",
    status: "queued",
    summary: "Coverage Score 65% — 3 unmonitored IP ranges, 2 unconfigured VIP accounts, 5 keyword slots free.",
  },
];

const KIND_COLOR = {
  Board:      "#A855F7",
  Compliance: "#6366F1",
  Tactical:   "#F59E0B",
  Executive:  "#FF4562",
  Vendor:     "#3B82F6",
  Operations: "#22C55E",
};
const KIND_BG = (k) => `${KIND_COLOR[k]}10`;

const STATUS_META = {
  ready:    { label: "Ready",    color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  queued:   { label: "Queued",   color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  building: { label: "Building", color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
};

// ═══════════════════════════════════════
export default function Reports() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("scheduled");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [downloads, setDownloads] = useState({});

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const counts = useMemo(() => ({
    scheduled: REPORTS.filter(r => r.cadence === "scheduled").length,
    adhoc: REPORTS.filter(r => r.cadence === "ad-hoc").length,
    total: REPORTS.length,
  }), []);

  const filtered = useMemo(() => REPORTS.filter(r => {
    if (activeTab === "scheduled" && r.cadence !== "scheduled") return false;
    if (activeTab === "adhoc" && r.cadence !== "ad-hoc") return false;
    if (kindFilter !== "all" && r.kind !== kindFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${r.id} ${r.name} ${r.kind} ${r.owner} ${r.summary}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [activeTab, kindFilter, search]);

  const kindOpts = useMemo(() => ["all", ...Array.from(new Set(REPORTS.map(r => r.kind)))], []);

  function downloadReport(id) {
    setDownloads(d => ({ ...d, [id]: { phase: "running", progress: 0 } }));
    let p = 0;
    const ti = setInterval(() => {
      p = Math.min(100, p + Math.round(12 + Math.random() * 18));
      setDownloads(d => ({ ...d, [id]: { phase: p >= 100 ? "done" : "running", progress: p } }));
      if (p >= 100) { clearInterval(ti); setTimeout(() => setDownloads(d => { const c = { ...d }; delete c[id]; return c; }), 2000); }
    }, 200);
  }

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>Operations</div>
          <div className="hfont" style={{ fontSize: 17, fontWeight: 800, marginTop: 2, color: t.text }}>Reports</div>
          <div style={{ fontSize: 10, color: t.text45, marginTop: 2 }}>Board, compliance, tactical, and operational reporting · scheduled and ad-hoc</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { label: "TOTAL", value: counts.total, color: t.text },
            { label: "SCHEDULED", value: counts.scheduled, color: "#A855F7" },
            { label: "AD-HOC", value: counts.adhoc, color: "#F59E0B" },
            { label: "QUEUED", value: REPORTS.filter(r => r.status === "queued").length, color: "#F59E0B" },
            { label: "READY", value: REPORTS.filter(r => r.status === "ready").length, color: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 60 }}>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{
        display: "flex", gap: 2,
        borderBottom: `1px solid ${t.borderSection}`,
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {[
          { id: "scheduled", label: "Scheduled", count: counts.scheduled },
          { id: "adhoc", label: "Ad-hoc", count: counts.adhoc },
          { id: "all", label: "All", count: counts.total },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px", border: "none", background: "transparent",
                color: isActive ? "#A855F7" : t.text40,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                borderBottom: `2px solid ${isActive ? "#A855F7" : "transparent"}`,
                marginBottom: -1, display: "flex", alignItems: "center", gap: 7,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tab.label}
              <span style={{
                padding: "1px 7px", borderRadius: 4,
                background: isActive ? "rgba(168,85,247,0.18)" : t.bgInput,
                color: isActive ? "#A855F7" : t.text35,
                fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              }}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <div style={{
        display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {kindOpts.map(k => {
          const active = kindFilter === k;
          const c = k !== "all" ? KIND_COLOR[k] : "#A855F7";
          return (
            <button key={k} onClick={() => setKindFilter(k)} style={{
              padding: "5px 11px", borderRadius: 6,
              border: `1px solid ${active ? `${c}55` : t.borderLight}`,
              background: active ? `${c}12` : "transparent",
              color: active ? c : t.text40,
              fontSize: 10, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: "'Inter', sans-serif",
            }}>
              {k !== "all" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />}
              {k === "all" ? "All Types" : k}
            </button>
          );
        })}
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports by ID, name, or owner…"
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              background: t.bgInput, border: `1px solid ${t.borderLight}`,
              borderRadius: 7, color: t.text, fontSize: 11,
              fontFamily: "'Inter', sans-serif", outline: "none",
            }} />
        </div>
        <button style={{
          padding: "8px 14px", borderRadius: 7,
          background: "#A855F7", color: "#fff",
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          border: "none", fontFamily: "'Inter', sans-serif",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 4px 12px rgba(168,85,247,0.25)",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New report
        </button>
      </div>

      {/* ═══ REPORTS LIST ═══ */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {filtered.length === 0 ? (
          <div className="glass" style={{ padding: 50, textAlign: "center", color: t.text40, fontSize: 12 }}>
            No reports match the current filters.
          </div>
        ) : (
          filtered.map(r => {
            const stMeta = STATUS_META[r.status];
            const dl = downloads[r.id];
            return (
              <div key={r.id} className="glass" style={{ padding: "14px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "flex-start" }}>
                  {/* Kind icon block */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: KIND_BG(r.kind), color: KIND_COLOR[r.kind],
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  {/* Body */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 10, color: t.text35, fontWeight: 700 }}>{r.id}</span>
                      <span className="hfont" style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{r.name}</span>
                      <span style={{
                        padding: "2px 7px", borderRadius: 4,
                        background: KIND_BG(r.kind), color: KIND_COLOR[r.kind],
                        fontSize: 8, fontWeight: 800, letterSpacing: "0.06em",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{r.kind.toUpperCase()}</span>
                      <span style={{
                        padding: "2px 7px", borderRadius: 4,
                        background: stMeta.bg, color: stMeta.color,
                        fontSize: 8, fontWeight: 800, letterSpacing: "0.06em",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{stMeta.label.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 11, color: t.text50, lineHeight: 1.55, marginBottom: 8 }}>{r.summary}</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 9, color: t.text40 }}>
                      <span><span style={{ color: t.text25 }}>FORMAT</span> · <span className="mono" style={{ fontWeight: 600 }}>{r.format}</span></span>
                      <span><span style={{ color: t.text25 }}>PAGES</span> · {r.pages}</span>
                      <span><span style={{ color: t.text25 }}>SIZE</span> · {(r.sizeKb / 1024).toFixed(2)} MB</span>
                      <span><span style={{ color: t.text25 }}>OWNER</span> · {r.owner}</span>
                      <span><span style={{ color: t.text25 }}>RECIPIENTS</span> · {r.recipients.join(", ")}</span>
                      <span><span style={{ color: t.text25 }}>SCHEDULE</span> · {r.schedule}</span>
                      <span><span style={{ color: t.text25 }}>LAST RUN</span> · <span className="mono">{r.lastRun}</span></span>
                      {r.nextRun && <span><span style={{ color: t.text25 }}>NEXT</span> · <span className="mono">{r.nextRun}</span></span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, minWidth: 180 }}>
                    <button
                      onClick={() => !dl && downloadReport(r.id)}
                      disabled={!!dl}
                      style={{
                        padding: "8px 14px", borderRadius: 7,
                        border: `1px solid ${dl?.phase === "done" ? "rgba(34,197,94,0.45)" : "rgba(168,85,247,0.45)"}`,
                        background: dl?.phase === "done" ? "rgba(34,197,94,0.12)" : "rgba(168,85,247,0.12)",
                        color: dl?.phase === "done" ? "#22C55E" : "#A855F7",
                        fontSize: 10, fontWeight: 700, cursor: dl ? "wait" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                      {!dl && <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Download</>}
                      {dl?.phase === "running" && <>Downloading… {dl.progress}%</>}
                      {dl?.phase === "done" && <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Saved</>}
                    </button>
                    <button style={{
                      padding: "6px 12px", borderRadius: 7,
                      border: `1px solid ${t.borderLight}`, background: "transparent",
                      color: t.text50, fontSize: 10, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.2-8.5" /><polyline points="21 4 21 12 13 12" /></svg>
                      Re-run now
                    </button>
                    <button style={{
                      padding: "6px 12px", borderRadius: 7,
                      border: `1px solid ${t.borderLight}`, background: "transparent",
                      color: t.text50, fontSize: 10, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></svg>
                      Email recipients
                    </button>
                  </div>
                </div>
                {dl?.phase === "running" && (
                  <div style={{ height: 3, background: t.bgInput, borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                    <div style={{ width: `${dl.progress}%`, height: "100%", background: "#A855F7", transition: "width 0.2s ease" }} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
