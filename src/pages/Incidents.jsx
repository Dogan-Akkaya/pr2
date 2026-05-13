import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import DemoNotice from "../components/DemoNotice";

// ═══════════════════════════════════════
// INCIDENT FIXTURES — synthesised from cross-page critical findings.
// Each incident pivots back to its origin page so the CISO can see context.
// ═══════════════════════════════════════
const INCIDENTS = [
  {
    id: "INC-2026-1842",
    title: "Stealer log auction targeting platform.socradar.com",
    severity: "critical",
    status: "open",
    sourcePage: "Data on Sale",
    sourceRoute: "/data-on-sale",
    sourceColor: "#FF4562",
    assignee: "—",
    opened: Date.now() - 22 * 60 * 1000,
    updated: Date.now() - 8 * 60 * 1000,
    summary: "Russian Market listing #31162210 includes browser cookies + autofill for 1 SOCRadar admin from Dominican Republic infection (rhamadanthys stealer family).",
    evidence: [
      { kind: "listing", label: "Russian Market #31162210", meta: "$10.00 · platinum vendor" },
      { kind: "file", label: "archive.zip", meta: "3.78 MB · stealer log bundle" },
      { kind: "alarm", label: "Alarm #77981809", meta: "MTTD 4.2 min" },
    ],
    timeline: [
      { at: "22 min ago", event: "Detected — Russian Market crawler match" },
      { at: "21 min ago", event: "Alert dispatched to security@" },
      { at: "8 min ago", event: "Triage status set: open" },
    ],
  },
  {
    id: "INC-2026-1841",
    title: "47,832 customer records exposed across 14 sources",
    severity: "critical",
    status: "triaging",
    sourcePage: "Customer Leaks",
    sourceRoute: "/customer-leaks",
    sourceColor: "#FF4562",
    assignee: "Elena Marchetti",
    opened: Date.now() - 4 * 3600 * 1000,
    updated: Date.now() - 35 * 60 * 1000,
    summary: "Aggregated exposure: 31,205 credentials, 18,442 PII records, 8,891 financial records, 4,127 active sessions. Estimated breach cost $8.27M (IBM 2025 baseline). KVKK fine exposure ~$300K.",
    evidence: [
      { kind: "metric", label: "47,832 unique customers", meta: "across all sources" },
      { kind: "metric", label: "31,205 credentials", meta: "Stealer Logs + Breach DBs" },
      { kind: "compliance", label: "KVKK estimator", meta: "Turkey-active region" },
    ],
    timeline: [
      { at: "4h ago", event: "Detected — combined feed update" },
      { at: "3h 45m ago", event: "Severity upgraded to critical" },
      { at: "1h 12m ago", event: "Assigned to Elena Marchetti" },
      { at: "35m ago", event: "Notice template drafted (KVKK)" },
    ],
  },
  {
    id: "INC-2026-1840",
    title: "VIP Simon Johnsson — VERY HIGH risk score (72/100)",
    severity: "critical",
    status: "open",
    sourcePage: "VIP Monitoring",
    sourceRoute: "/vip-monitoring",
    sourceColor: "#A855F7",
    assignee: "—",
    opened: Date.now() - 6 * 3600 * 1000,
    updated: Date.now() - 2 * 3600 * 1000,
    summary: "CFO Simon Johnsson exposed across 8 breaches, 6 passwords, 9 data classes. Identity Theft VERY HIGH (National ID exposed Mar 2025). Spear Phishing VERY HIGH.",
    evidence: [
      { kind: "alarm", label: "8 breach data alarms", meta: "Aug 2025 → Sep 2024" },
      { kind: "credential", label: "6 password exposures", meta: "1 raw, 5 hashed" },
      { kind: "identity", label: "National ID + DOB", meta: "Mar 2025 breach" },
    ],
    timeline: [
      { at: "6h ago", event: "Risk score crossed VERY HIGH threshold" },
      { at: "4h ago", event: "Auto-escalated to executive protection queue" },
      { at: "2h ago", event: "Notification sent to CSO" },
    ],
  },
  {
    id: "INC-2026-1839",
    title: "Brand impersonation in Telegram channel /darkleaks",
    severity: "high",
    status: "open",
    sourcePage: "Telegram",
    sourceRoute: "/telegram",
    sourceColor: "#22D3EE",
    assignee: "—",
    opened: Date.now() - 95 * 60 * 1000,
    updated: Date.now() - 95 * 60 * 1000,
    summary: "Channel @darkleaks (4,238 members) posted forwarded message claiming \"GreenAnimals breach 482K records — DM for sample\". Matched brand keyword + channel-type tag: leak-broker.",
    evidence: [
      { kind: "message", label: "Telegram message id #5521", meta: "@darkleaks · 4,238 members" },
      { kind: "match", label: "Brand match: GreenAnimalsBank", meta: "matched on full name" },
    ],
    timeline: [
      { at: "1h 35m ago", event: "Detected — Telegram forward chain" },
      { at: "1h 35m ago", event: "Alert created" },
    ],
  },
  {
    id: "INC-2026-1838",
    title: "BEC credential listing for *@greenanimals.com on FreshTools",
    severity: "critical",
    status: "open",
    sourcePage: "Fraud Intelligence",
    sourceRoute: "/fraud-intelligence",
    sourceColor: "#F59E0B",
    assignee: "—",
    opened: Date.now() - 3 * 3600 * 1000,
    updated: Date.now() - 90 * 60 * 1000,
    summary: "Seller \"emailpwnz\" (4.8★) listed OWA / Exchange access credential matching email pattern *@greenanimals.com. Pre-fraud signal: BEC toolkit may follow.",
    evidence: [
      { kind: "listing", label: "FreshTools listing", meta: "$25.00 · seller emailpwnz" },
      { kind: "match", label: "Email pattern match", meta: "*@greenanimals.com" },
      { kind: "lead-flow", label: "SOCRadar Crawl → FreshTools → posted OWA login → ALERT", meta: "5-step lead flow" },
    ],
    timeline: [
      { at: "3h ago", event: "Detected — FreshTools listing crawl" },
      { at: "2h 50m ago", event: "Lead-flow correlated to BEC pattern" },
      { at: "1h 30m ago", event: "Card Checker spike detected (+340%)" },
    ],
  },
  {
    id: "INC-2026-1837",
    title: "BIN 4532 65** — 12 cards verified active on Russian Market",
    severity: "high",
    status: "triaging",
    sourcePage: "Fraud Intelligence",
    sourceRoute: "/fraud-intelligence",
    sourceColor: "#F59E0B",
    assignee: "Ahmet Kara",
    opened: Date.now() - 5 * 3600 * 1000,
    updated: Date.now() - 1 * 3600 * 1000,
    summary: "Tracked BIN 4532 65 (Chase Visa, US issuer) — 12 cards listed, $15/each, verified active by Try2Check service. Card Checker activity +340% over 7 days.",
    evidence: [
      { kind: "bin", label: "BIN 4532 65", meta: "VISA · US · CHASE · 21 listings tracked" },
      { kind: "checker", label: "Try2Check ACTIVE", meta: "14 Oct 14:32" },
    ],
    timeline: [
      { at: "5h ago", event: "12 cards listed by d0####ey" },
      { at: "4h 45m ago", event: "Try2Check confirmed ACTIVE status" },
      { at: "1h ago", event: "Issuer notification sent (Chase fraud team)" },
    ],
  },
  {
    id: "INC-2026-1836",
    title: "Insider recruitment ad targeting fintech engineers",
    severity: "high",
    status: "open",
    sourcePage: "Insider Threat",
    sourceRoute: "/insider-threat",
    sourceColor: "#A855F7",
    assignee: "—",
    opened: Date.now() - 2 * 24 * 3600 * 1000,
    updated: Date.now() - 6 * 3600 * 1000,
    summary: "Telegram channel /jobsdark posted recruitment for \"US-based fintech engineers with privileged access\". Pattern matches sector + role overlap with 14 of your employees.",
    evidence: [
      { kind: "channel", label: "Telegram /jobsdark", meta: "recruitment broker" },
      { kind: "correlation", label: "14 employees match profile", meta: "fintech / engineering / privileged-access" },
    ],
    timeline: [
      { at: "2d ago", event: "Detected — Telegram monitor" },
      { at: "1d 18h ago", event: "HR + IR loop opened" },
      { at: "6h ago", event: "Awaiting employee review" },
    ],
  },
  {
    id: "INC-2026-1835",
    title: "Third-party breach: J Trust Bank — KYC dump on BreachForums",
    severity: "critical",
    status: "triaging",
    sourcePage: "Third Party",
    sourceRoute: "/third-party",
    sourceColor: "#3B82F6",
    assignee: "Elena Marchetti",
    opened: Date.now() - 11 * 24 * 3600 * 1000,
    updated: Date.now() - 18 * 3600 * 1000,
    summary: "129,805 J Trust Bank customer KYC records (Indonesian) sold on BreachForums for $1,800. J Trust is Tier-2 partner — 8% data-flow overlap with our identity verification pipeline.",
    evidence: [
      { kind: "listing", label: "BreachForums listing", meta: "$1,800 · Indonesian KYC dump" },
      { kind: "partner", label: "J Trust Bank", meta: "Tier-2 partner · 8% data-flow overlap" },
    ],
    timeline: [
      { at: "11d ago", event: "Detected — BreachForums crawl" },
      { at: "11d ago", event: "Vendor notified (legal channel)" },
      { at: "18h ago", event: "Vendor confirmed breach scope, remediation in progress" },
    ],
  },
  {
    id: "INC-2026-1834",
    title: "9 SOCRadar credentials surfaced in stealer-log batch",
    severity: "high",
    status: "resolved",
    sourcePage: "IAB Monitor",
    sourceRoute: "/iab-monitor",
    sourceColor: "#22C55E",
    assignee: "Ahmet Kara",
    opened: Date.now() - 5 * 24 * 3600 * 1000,
    updated: Date.now() - 18 * 3600 * 1000,
    summary: "Batch of 262K stealer logs ingested; 9 credentials matched socradar.com / academy.socradar.io / platform.socradar.com. All 9 forced through password rotation; sessions invalidated.",
    evidence: [
      { kind: "credential", label: "9 matched credentials", meta: "socradar.com domain set" },
      { kind: "remediation", label: "Force reset complete", meta: "9/9 rotated · all sessions killed" },
    ],
    timeline: [
      { at: "5d ago", event: "Detected — stealer log batch" },
      { at: "5d ago", event: "Auto-rotation triggered for all 9 accounts" },
      { at: "18h ago", event: "Resolved · IdP audit log updated" },
    ],
  },
  {
    id: "INC-2026-1833",
    title: "Domain typosquat registered: greenanimalsbank-secure.com",
    severity: "medium",
    status: "triaging",
    sourcePage: "Domain Exposure",
    sourceRoute: "/domain-exposure",
    sourceColor: "#3B82F6",
    assignee: "—",
    opened: Date.now() - 3 * 24 * 3600 * 1000,
    updated: Date.now() - 1 * 24 * 3600 * 1000,
    summary: "Whois drift detected new typosquat domain on Apr 27. Currently parked. Risk: phishing prep. Takedown notice queued via brand-protection vendor.",
    evidence: [
      { kind: "domain", label: "greenanimalsbank-secure.com", meta: "registered 2026-04-27 · NameCheap" },
      { kind: "risk", label: "Parked · no MX records yet", meta: "phishing prep risk" },
    ],
    timeline: [
      { at: "3d ago", event: "Detected — Whois drift monitor" },
      { at: "1d ago", event: "Takedown notice queued" },
    ],
  },
  {
    id: "INC-2026-1832",
    title: "PII exposure batch — 1,847 employee records",
    severity: "high",
    status: "resolved",
    sourcePage: "PII & Stealer Exposure",
    sourceRoute: "/pii-stealer-exposure",
    sourceColor: "#3B82F6",
    assignee: "Elena Marchetti",
    opened: Date.now() - 9 * 24 * 3600 * 1000,
    updated: Date.now() - 4 * 24 * 3600 * 1000,
    summary: "Combo list \"Anti-Public Q1\" cross-referenced 1,847 employee email/password pairs across 3 historical breaches. All accounts force-rotated; MFA mandate confirmed.",
    evidence: [
      { kind: "credential", label: "1,847 emp credentials", meta: "Anti-Public Q1 combolist" },
      { kind: "remediation", label: "Rotation + MFA", meta: "100% complete" },
    ],
    timeline: [
      { at: "9d ago", event: "Detected — Anti-Public combolist scan" },
      { at: "8d ago", event: "Bulk rotation pushed" },
      { at: "4d ago", event: "Resolved" },
    ],
  },
  {
    id: "INC-2026-1831",
    title: "Cyber Resistance hacktivist channel mentions our IP range",
    severity: "medium",
    status: "open",
    sourcePage: "Telegram",
    sourceRoute: "/telegram",
    sourceColor: "#22D3EE",
    assignee: "—",
    opened: Date.now() - 14 * 60 * 1000,
    updated: Date.now() - 14 * 60 * 1000,
    summary: "Telegram channel \"Cyber Resistance\" (12,891 members) shared screenshot of port-scan results including 3 of our public-facing IP addresses. No exploitation claim yet.",
    evidence: [
      { kind: "channel", label: "Telegram Cyber Resistance", meta: "hacktivist · 12,891 members" },
      { kind: "match", label: "3 IP matches", meta: "public-facing range" },
    ],
    timeline: [
      { at: "14m ago", event: "Detected — Telegram monitor" },
    ],
  },
];

const SEV = { critical: "#FF4562", high: "#EA580C", medium: "#CA8A04", low: "#3B82F6" };
const SEV_BG = { critical: "rgba(255,69,98,0.12)", high: "rgba(234,88,12,0.12)", medium: "rgba(202,138,4,0.12)", low: "rgba(59,130,246,0.12)" };
const SEV_LABEL = { critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW" };

const STATUS_META = {
  open:      { label: "Open",     color: "#FF4562", bg: "rgba(255,69,98,0.10)" },
  triaging:  { label: "Triaging", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  resolved:  { label: "Resolved", color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
};

function relTime(ms) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ═══════════════════════════════════════
export default function Incidents() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  // Local override for status changes (Acknowledge/Assign/Resolve from drawer)
  const [statusOverrides, setStatusOverrides] = useState({});
  const [assigneeOverrides, setAssigneeOverrides] = useState({});

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const incidents = useMemo(() => INCIDENTS.map(inc => ({
    ...inc,
    status: statusOverrides[inc.id] || inc.status,
    assignee: assigneeOverrides[inc.id] || inc.assignee,
  })), [statusOverrides, assigneeOverrides]);

  const filtered = useMemo(() => incidents.filter(inc => {
    if (statusFilter !== "all" && inc.status !== statusFilter) return false;
    if (sevFilter !== "all" && inc.severity !== sevFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${inc.id} ${inc.title} ${inc.sourcePage} ${inc.summary}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [incidents, statusFilter, sevFilter, search]);

  const counts = useMemo(() => ({
    open: incidents.filter(i => i.status === "open").length,
    triaging: incidents.filter(i => i.status === "triaging").length,
    resolved: incidents.filter(i => i.status === "resolved").length,
    critical: incidents.filter(i => i.severity === "critical").length,
    total: incidents.length,
  }), [incidents]);

  const selected = incidents.find(i => i.id === selectedId);

  function setStatus(id, status) { setStatusOverrides(s => ({ ...s, [id]: status })); }
  function setAssignee(id, who) { setAssigneeOverrides(s => ({ ...s, [id]: who })); }

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
      <DemoNotice />

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(255,69,98,0.10)", border: "1px solid rgba(255,69,98,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>Operations</div>
          <div className="hfont" style={{ fontSize: 17, fontWeight: 800, marginTop: 2, color: t.text }}>Incidents</div>
          <div style={{ fontSize: 10, color: t.text45, marginTop: 2 }}>Active dark-web findings escalated to triage queue · cross-page correlation</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { label: "TOTAL", value: counts.total, color: t.text },
            { label: "OPEN", value: counts.open, color: "#FF4562" },
            { label: "TRIAGING", value: counts.triaging, color: "#F59E0B" },
            { label: "CRITICAL", value: counts.critical, color: "#FF4562" },
            { label: "RESOLVED", value: counts.resolved, color: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 60 }}>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FILTERS ═══ */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open" },
            { id: "triaging", label: "Triaging" },
            { id: "resolved", label: "Resolved" },
          ].map(p => {
            const active = statusFilter === p.id;
            const meta = p.id !== "all" ? STATUS_META[p.id] : null;
            return (
              <button key={p.id} onClick={() => setStatusFilter(p.id)} style={{
                padding: "5px 11px", borderRadius: 6,
                border: `1px solid ${active && meta ? `${meta.color}55` : active ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                background: active && meta ? meta.bg : active ? "rgba(59,130,246,0.10)" : "transparent",
                color: active && meta ? meta.color : active ? "#3B82F6" : t.text40,
                fontSize: 10, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}>{p.label}</button>
            );
          })}
        </div>
        <span style={{ width: 1, height: 18, background: t.borderLight }} />
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "all", label: "All Severity", color: t.text },
            { id: "critical", label: "Critical", color: "#FF4562" },
            { id: "high", label: "High", color: "#EA580C" },
            { id: "medium", label: "Medium", color: "#CA8A04" },
          ].map(p => {
            const active = sevFilter === p.id;
            return (
              <button key={p.id} onClick={() => setSevFilter(p.id)} style={{
                padding: "5px 11px", borderRadius: 6,
                border: `1px solid ${active ? `${p.color}55` : t.borderLight}`,
                background: active ? `${p.color}12` : "transparent",
                color: active ? p.color : t.text40,
                fontSize: 10, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color }} />
                {p.label}
              </button>
            );
          })}
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search incidents by ID, title, or source…"
            style={{
              width: "100%", padding: "8px 14px 8px 34px",
              background: t.bgInput, border: `1px solid ${t.borderLight}`,
              borderRadius: 7, color: t.text, fontSize: 11,
              fontFamily: "'Inter', sans-serif", outline: "none",
            }}
          />
        </div>
      </div>

      {/* ═══ INCIDENT LIST ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "100px 70px 1fr 130px 110px 100px 90px",
          gap: 10, padding: "9px 16px",
          fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700,
          borderBottom: `1px solid ${t.borderSection}`,
          background: t.bgInput,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>ID</span>
          <span>SEV</span>
          <span>TITLE</span>
          <span>SOURCE</span>
          <span>ASSIGNEE</span>
          <span>UPDATED</span>
          <span style={{ textAlign: "right" }}>STATUS</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 50, textAlign: "center", color: t.text40, fontSize: 12 }}>
            No incidents match the current filters.
          </div>
        ) : (
          filtered.map(inc => {
            const stMeta = STATUS_META[inc.status];
            const sevColor = SEV[inc.severity];
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedId(inc.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 70px 1fr 130px 110px 100px 90px",
                  gap: 10, padding: "12px 16px",
                  alignItems: "center", cursor: "pointer",
                  borderBottom: `1px solid ${t.borderRow}`,
                  background: selectedId === inc.id ? "rgba(59,130,246,0.06)" : "transparent",
                  borderLeft: `3px solid ${selectedId === inc.id ? "#3B82F6" : "transparent"}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (selectedId !== inc.id) e.currentTarget.style.background = "rgba(59,130,246,0.03)"; }}
                onMouseLeave={e => { if (selectedId !== inc.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: t.text50 }}>{inc.id}</span>
                <span style={{
                  padding: "2px 7px", borderRadius: 4,
                  background: SEV_BG[inc.severity], color: sevColor,
                  fontSize: 8, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                  display: "inline-block", textAlign: "center", width: "fit-content",
                }}>{SEV_LABEL[inc.severity]}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.title}</div>
                  <div style={{ fontSize: 9, color: t.text35, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.summary}</div>
                </div>
                <span className="mono" style={{
                  fontSize: 9, color: inc.sourceColor, fontWeight: 600,
                  background: `${inc.sourceColor}10`, padding: "3px 7px", borderRadius: 4,
                  textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{inc.sourcePage}</span>
                <span style={{ fontSize: 10, color: inc.assignee === "—" ? t.text25 : t.text50, fontWeight: 500 }}>{inc.assignee}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text35 }}>{relTime(inc.updated)}</span>
                <span style={{
                  padding: "3px 9px", borderRadius: 5,
                  background: stMeta.bg, color: stMeta.color,
                  fontSize: 9, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                  textAlign: "center", justifySelf: "end",
                }}>{stMeta.label}</span>
              </div>
            );
          })
        )}
      </div>

      {/* ═══ DETAIL DRAWER ═══ */}
      {selected && (
        <>
          <div onClick={() => setSelectedId(null)} style={{
            position: "fixed", inset: 0, background: t.bgOverlay,
            zIndex: 50, cursor: "pointer",
          }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 520,
            overflow: "auto", zIndex: 51,
            background: t.bgPanel, backdropFilter: "blur(20px)",
            borderLeft: `1px solid ${t.borderLight}`,
            animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {/* Drawer header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    padding: "3px 9px", borderRadius: 5,
                    background: SEV_BG[selected.severity], color: SEV[selected.severity],
                    fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
                  }}>{SEV_LABEL[selected.severity]}</span>
                  <span className="mono" style={{ fontSize: 11, color: t.text50, fontWeight: 700 }}>{selected.id}</span>
                </div>
                <button onClick={() => setSelectedId(null)} style={{
                  width: 28, height: 28, borderRadius: 8, border: "none",
                  background: t.borderLight, color: t.text50, fontSize: 14,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              </div>
              <div className="hfont" style={{ fontSize: 17, fontWeight: 700, color: t.text, marginBottom: 6 }}>
                {selected.title}
              </div>
              <div style={{ fontSize: 11, color: t.text50, lineHeight: 1.55 }}>{selected.summary}</div>
              {/* Source pivot */}
              <a href={selected.sourceRoute} style={{
                display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10,
                fontSize: 10, fontWeight: 700, color: selected.sourceColor,
                fontFamily: "'JetBrains Mono', monospace",
                background: `${selected.sourceColor}10`, padding: "4px 10px", borderRadius: 5,
                textDecoration: "none",
              }}>
                Open in {selected.sourcePage}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            </div>

            {/* Quick actions */}
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <ActionButton t={t} disabled={selected.status === "triaging"} icon="ack" label={selected.status === "triaging" ? "Acknowledged" : "Acknowledge"}
                  onClick={() => setStatus(selected.id, "triaging")} color="#F59E0B" />
                <ActionButton t={t} icon="user" label={selected.assignee === "—" ? "Assign to me" : "Reassign"}
                  onClick={() => setAssignee(selected.id, "Dogan Akkaya")} color="#A855F7" />
                <ActionButton t={t} disabled={selected.status === "resolved"} icon="check" label="Resolve"
                  onClick={() => setStatus(selected.id, "resolved")} color="#22C55E" />
                <ActionButton t={t} icon="escalate" label="Escalate to CSO"
                  onClick={() => alert(`Escalation requested for ${selected.id}`)} color="#FF4562" />
              </div>
            </div>

            {/* Evidence */}
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Evidence</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selected.evidence.map((ev, i) => (
                  <div key={i} style={{
                    background: t.bgCard, border: `1px solid ${t.borderLight}`,
                    borderRadius: 7, padding: "9px 12px",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{
                      padding: "2px 7px", borderRadius: 4,
                      background: `${selected.sourceColor}15`, color: selected.sourceColor,
                      fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0,
                    }}>{ev.kind}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{ev.label}</div>
                      <div className="mono" style={{ fontSize: 9, color: t.text35, marginTop: 1 }}>{ev.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ padding: "16px 24px" }}>
              <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Timeline</div>
              <div style={{ position: "relative", paddingLeft: 16 }}>
                <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: 1, background: t.borderSection }} />
                {selected.timeline.map((tl, i) => (
                  <div key={i} style={{ position: "relative", marginBottom: i < selected.timeline.length - 1 ? 14 : 0 }}>
                    <div style={{
                      position: "absolute", left: -16, top: 4,
                      width: 9, height: 9, borderRadius: "50%",
                      background: i === selected.timeline.length - 1 ? selected.sourceColor : t.text25,
                      border: `2px solid ${t.bgPanel}`,
                      boxShadow: i === selected.timeline.length - 1 ? `0 0 6px ${selected.sourceColor}80` : "none",
                    }} />
                    <div className="mono" style={{ fontSize: 9, color: t.text35, fontWeight: 600 }}>{tl.at}</div>
                    <div style={{ fontSize: 11, color: t.text60, marginTop: 1 }}>{tl.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ActionButton({ t, icon, label, onClick, color, disabled }) {
  const ICONS = {
    ack: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 11l3 3 8-8" /><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h11" /></svg>,
    user: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /></svg>,
    check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    escalate: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      padding: "8px 12px", borderRadius: 7,
      background: disabled ? t.bgInput : `${color}10`,
      border: `1px solid ${disabled ? t.borderLight : `${color}45`}`,
      color: disabled ? t.text25 : color,
      fontSize: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      fontFamily: "'Inter', sans-serif",
      transition: "all 0.15s ease",
    }}>
      {ICONS[icon]}
      {label}
    </button>
  );
}
