import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTheme } from "../context/ThemeContext";
import { tooltipStyles } from "../components/chartTheme";

/* ────────────────────────────────────────────────────────────────────────────
   PII Severity tiers + colors
   ──────────────────────────────────────────────────────────────────────────── */

const TIER = {
  critical: { fg: "#DC2626", bg: "rgba(220,38,38,0.10)", strip: "#DC2626", label: "CRITICAL" },
  high:     { fg: "#EA580C", bg: "rgba(234,88,12,0.10)", strip: "#EA580C", label: "HIGH"     },
  medium:   { fg: "#3B82F6", bg: "rgba(59,130,246,0.08)", strip: "#3B82F6", label: "MEDIUM"  },
  low:      { fg: "#94A3B8", bg: "rgba(148,163,184,0.08)", strip: "#475569", label: "LOW"   },
};

const PII_TYPE_COLOR = {
  SSN:     { fg: "#DC2626", bg: "rgba(220,38,38,0.12)" },
  Card:    { fg: "#EA580C", bg: "rgba(234,88,12,0.12)" },
  Address: { fg: "#EA580C", bg: "rgba(234,88,12,0.12)" },
  Phone:   { fg: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Cred:    { fg: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Email:   { fg: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};

/* ────────────────────────────────────────────────────────────────────────────
   ICONS
   ──────────────────────────────────────────────────────────────────────────── */
const Icon = {
  user:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  id:         (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><line x1="14" y1="9" x2="18" y2="9"/><line x1="14" y1="13" x2="18" y2="13"/><path d="M7 16c.6-1.5 2-2.5 4-2.5s3.4 1 4 2.5"/></svg>,
  creditcard: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  home:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z"/></svg>,
  phone:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/></svg>,
  lock:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  envelope:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  alert:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  bell:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  arrowUp:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 14l6-6 6 6"/></svg>,
  arrowDown:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 10l6 6 6-6"/></svg>,
  external:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

const PII_ICONS = { national_id: Icon.id, financial: Icon.creditcard, address: Icon.home, phone: Icon.phone, credential: Icon.lock, email: Icon.envelope };

/* ────────────────────────────────────────────────────────────────────────────
   DATA FIXTURES
   ──────────────────────────────────────────────────────────────────────────── */

const PII_CATEGORIES = [
  { key: "national_id", severity: "critical", count: 23,   name: "National ID / SSN",   desc: "SSNs, passport numbers, driver's licenses. Irreversible identity theft risk.", price: "$20 – $80", trend: "+34%", trendDir: "up" },
  { key: "financial",   severity: "high",     count: 156,  name: "Financial Data",       desc: "Credit cards, bank accounts, transaction data. Direct monetary loss.",          price: "$12 – $65", trend: "+8%",  trendDir: "up" },
  { key: "address",     severity: "high",     count: 342,  name: "Physical Addresses",   desc: "Home/billing addresses. Physical safety risk, doxxing, stalking.",             price: "$5 – $15",  trend: "-2%",  trendDir: "down" },
  { key: "phone",       severity: "medium",   count: 891,  name: "Phone Numbers",        desc: "Mobile numbers enabling SIM swap attacks and 2FA bypass.",                    price: "$5 – $15",  trend: "+12%", trendDir: "up" },
  { key: "credential",  severity: "medium",   count: 712,  name: "Login Credentials",    desc: "Email + password combos. Account takeover and lateral movement.",             price: "$0.05 – $0.10", trend: "+6%", trendDir: "up" },
  { key: "email",       severity: "low",      count: 1204, name: "Email Addresses",      desc: "Exposed emails. Spam and phishing campaign targeting.",                      price: "< $0.01",   trend: "-1%",  trendDir: "down" },
];

const TOTAL_RECORDS = PII_CATEGORIES.reduce((s, c) => s + c.count, 0);

// National ID — critical tier, 4-record list with sub-counts
const NATIONAL_ID_SUBCOUNTS = [
  { label: "SSN / TC KIMLIK",   value: 14, color: "#DC2626" },
  { label: "PASSPORT NO.",      value: 5,  color: "#DC2626" },
  { label: "DRIVER'S LICENSE",  value: 4,  color: "#EA580C" },
];
const NATIONAL_ID_RECORDS = [
  { type: "SSN",     masked: "***-**-4532", source: "Stealer Log",      date: "Oct 19, 2025", color: "#DC2626" },
  { type: "TC KIM",  masked: "234*****89",   source: "Breach DB",        date: "Sep 15, 2025", color: "#DC2626" },
  { type: "PASS",    masked: "U****7821",    source: "Dark Web Market",  date: "Aug 22, 2025", color: "#DC2626" },
  { type: "DL",      masked: "B4****01",     source: "Combo List",       date: "Oct 03, 2025", color: "#EA580C" },
];

const FINANCIAL_BREAKDOWN = [
  { count: 89, label: "Credit/Debit Cards",  meta: "23 verified active (tested <48h)", emphasis: true },
  { count: 42, label: "Bank Account Numbers", meta: "IBAN / routing numbers",            emphasis: true },
  { count: 25, label: "Transaction History",  meta: "Spending patterns & merchant data" },
];

const ADDRESS_BREAKDOWN = [
  { count: 218, label: "Home Addresses",    meta: "Full street address + postal code", emphasis: true },
  { count: 124, label: "Billing Addresses",  meta: "Linked to payment methods" },
];
const ADDRESS_NOTE = "67 records pair name + address + phone — doxxing and stalking risk.";

const PHONE_BREAKDOWN = [
  { count: 612, label: "Mobile Numbers",    meta: "SIM swap & 2FA bypass risk",   emphasis: true },
  { count: 279, label: "Landline / Work",    meta: "Vishing & social engineering" },
];
const PHONE_NOTE = "312 phone numbers paired with credentials — enabling targeted 2FA bypass via SIM swap + password combo.";

const TIMELINE = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2025, 2, 26 + i * 5);
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const spike = i === 3 ? 280 : i === 4 ? 180 : 0;
  return { date: label, count: Math.round(30 + Math.random() * 40 + spike) };
});
let _cum = 0;
TIMELINE.forEach(t => { _cum += t.count; t.cumulative = _cum; });

const RECORD_STATUS = [
  { label: "Open",   count: 2801, color: "#DC2626" },
  { label: "Closed", count: 46,   color: "#3B82F6" },
];

const PW_STRENGTH = [
  { label: "Weak",   count: 487, color: "#DC2626" },
  { label: "Medium", count: 183, color: "#EA580C" },
  { label: "Strong", count: 42,  color: "#16A34A" },
];
const PW_TOTAL = PW_STRENGTH.reduce((s, p) => s + p.count, 0);

const STR_COL = { WEAK: "#DC2626", MEDIUM: "#EA580C", STRONG: "#16A34A" };

const MOST_EXPOSED = [
  { rank: 1, email: "gabriel@gmail.com",         source: "Stealer Log", date: "2025-10-19", strength: "WEAK",   alarms: 277, piiTypes: ["SSN", "Card", "Phone", "Cred"] },
  { rank: 2, email: "kevin.koestoro@jtrust...",   source: "Combo List",  date: "2025-09-15", strength: "WEAK",   alarms: 18,  piiTypes: ["Card", "Address", "Cred"] },
  { rank: 3, email: "edy@jtrustbank.co.id",       source: "Breach DB",   date: "2025-09-09", strength: "MEDIUM", alarms: 9,   piiTypes: ["Phone", "Cred"] },
  { rank: 4, email: "recruit@bm.co.id",           source: "Stealer Log", date: "2025-08-28", strength: "MEDIUM", alarms: 8,   piiTypes: ["Cred", "Email"] },
  { rank: 5, email: "s.admin@jtrustbank.co.id",   source: "Combo List",  date: "2025-08-22", strength: "STRONG", alarms: 7,   piiTypes: ["Cred"] },
];

// Universal records table — all PII types
const ALL_PII_RECORDS = [
  { id: 1,  identity: "gabriel@gmail.com",            piiType: "SSN",     value: "***-**-4532",      source: "Stealer", status: "Open", discovered: "6mo ago", breach: "1y ago",  alarmId: 78012340 },
  { id: 2,  identity: "kevin.k@jtrust.co.id",         piiType: "Card",    value: "4***-****-7821",    source: "Breach",  status: "Open", discovered: "7mo ago", breach: "2y ago",  alarmId: 77945100 },
  { id: 3,  identity: "edy@jtrustbank.co.id",         piiType: "Phone",   value: "+62-812-***-4201",  source: "Combo",   status: "Open", discovered: "7mo ago", breach: "2y ago",  alarmId: 77945098 },
  { id: 4,  identity: "recruit@bm.co.id",             piiType: "Address", value: "Jl. Sudirman ***",   source: "Stealer", status: "Open", discovered: "8mo ago", breach: "1y ago",  alarmId: 77940200 },
  { id: 5,  identity: "s.admin@jtrustbank.co.id",     piiType: "Cred",    value: "V****1",             source: "Combo",   status: "Open", discovered: "8mo ago", breach: "1y ago",  alarmId: 77940195 },
  { id: 6,  identity: "v.walker@greenanimalsbank.com",piiType: "SSN",     value: "***-**-7012",      source: "Breach",  status: "Open", discovered: "8mo ago", breach: "9mo ago", alarmId: 77920100 },
  { id: 7,  identity: "g.barnett@greenanimalsbank.com", piiType: "Email", value: "g.barnett@***",   source: "Combo",   status: "Open", discovered: "8mo ago", breach: "8mo ago", alarmId: 77918050 },
  { id: 8,  identity: "finance@greenanimalsbank.com", piiType: "Card",    value: "5***-****-9123",    source: "Breach",  status: "Open", discovered: "8mo ago", breach: "10mo ago", alarmId: 77915000 },
  { id: 9,  identity: "admin@greenanimalsbank.com",   piiType: "Address", value: "Atatürk Cad. ***",   source: "Stealer", status: "Closed", discovered: "9mo ago", breach: "11mo ago", alarmId: 77910200 },
  { id: 10, identity: "ops@greenanimalsbank.com",     piiType: "Phone",   value: "+90-532-***-1102",  source: "Combo",   status: "Open", discovered: "9mo ago", breach: "1y ago",   alarmId: 77905100 },
  { id: 11, identity: "tibarus@jtrustbank.co.id",     piiType: "Cred",    value: "1****6",             source: "Breach",  status: "Open", discovered: "9mo ago", breach: "1y ago",   alarmId: 77890200 },
  { id: 12, identity: "tri.setiawan@jtrustbank.co.id",piiType: "Address", value: "Mega Kuningan ***",  source: "Combo",   status: "Open", discovered: "9mo ago", breach: "1y ago",   alarmId: 77890195 },
];

const PII_TABS = [
  { key: "all",         label: "All PII Types" },
  { key: "national_id", label: "National ID",   piiType: "SSN" },
  { key: "financial",   label: "Financial",     piiType: "Card" },
  { key: "address",     label: "Addresses",     piiType: "Address" },
  { key: "phone",       label: "Phone",         piiType: "Phone" },
  { key: "credential",  label: "Credentials",   piiType: "Cred" },
  { key: "email",       label: "Email",         piiType: "Email" },
];

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────────────── */

function MiniDonut({ segments, size = 100, t }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke={t?.borderSection || "rgba(255,255,255,0.04)"} strokeWidth="12" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.count / total : 0;
        const offset = cumulative; cumulative += pct;
        return <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="12" strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={-offset * circ} transform="rotate(-90 50 50)" />;
      })}
      <text x="50" y="48" textAnchor="middle" dominantBaseline="central" fill={t?.text || "#E8ECF1"} fontSize="14" fontWeight="800" fontFamily="'Red Hat Display'">{total > 999 ? (total / 1000).toFixed(1) + "K" : total}</text>
    </svg>
  );
}

function PIICategoryCard({ cat, active, onClick, t }) {
  const tier = TIER[cat.severity];
  const I = PII_ICONS[cat.key];
  const TrendArrow = cat.trendDir === "up" ? Icon.arrowUp : Icon.arrowDown;
  const trendColor = cat.trendDir === "up" ? "#DC2626" : "#16A34A";
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, minWidth: 0, position: "relative", overflow: "hidden", cursor: "pointer",
        background: tier.bg,
        border: `1px solid ${active ? `${tier.fg}40` : "transparent"}`,
        borderRadius: 11, padding: "13px 14px",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; if (!active) e.currentTarget.style.borderColor = `${tier.fg}25`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; if (!active) e.currentTarget.style.borderColor = "transparent"; }}
    >
      {/* Top accent strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: tier.strip, borderRadius: "11px 11px 0 0" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: tier.strip }} />
        <span className="mono" style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: "0.10em", color: tier.fg }}>{tier.label}</span>
      </div>

      <div style={{ color: tier.fg, marginBottom: 6, opacity: 0.9 }}><I width="18" height="18" /></div>
      <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: tier.fg, letterSpacing: "-0.02em", lineHeight: 1 }}>{cat.count.toLocaleString()}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text, marginTop: 3 }}>{cat.name}</div>
      <div style={{ fontSize: 9, color: t.text35, marginTop: 3, lineHeight: 1.35 }}>{cat.desc}</div>

      {/* Price + trend footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 7, borderTop: `1px solid ${t.borderRow}` }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 8, color: t.text30 }}>DW price</span>
          <span className="mono" style={{ fontSize: 9.5, color: "#F59E0B", fontWeight: 700 }}>{cat.price}</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, color: trendColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
          <TrendArrow width="9" height="9" />
          {cat.trend}
        </div>
      </div>
    </div>
  );
}

function BreakdownPanel({ title, severity, items, count, note, t }) {
  const tier = TIER[severity];
  return (
    <div className="glass" style={{ padding: "14px 16px", borderLeft: `3px solid ${tier.strip}`, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div className="hfont" style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, color: t.text }}>
          {title}
          <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: tier.bg, color: tier.fg, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{tier.label}</span>
        </div>
        <span className="mono" style={{ fontSize: 10, color: t.text40, fontWeight: 600 }}>{count} records</span>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", borderBottom: i < items.length - 1 ? `1px solid ${t.borderRow}` : "none", fontSize: 11 }}>
          <span className="hfont" style={{ width: 44, fontSize: 14, fontWeight: 800, color: it.emphasis ? tier.fg : t.text60 }}>{it.count}</span>
          <span style={{ flex: 1, color: t.text60, fontWeight: 500 }}>{it.label}</span>
          <span style={{ fontSize: 9, color: t.text35, textAlign: "right" }}>{it.meta}</span>
        </div>
      ))}
      {note && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 10, padding: "8px 10px", borderRadius: 6, background: "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.15)` }}>
          <Icon.alert width="11" height="11" style={{ color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 9.5, color: t.text50, lineHeight: 1.5 }}>{note}</span>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────────── */

export default function PII() {
  const { t } = useTheme();
  const ttS = tooltipStyles(t);
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("national_id");
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Filter the universal records based on tab + filters
  const filteredRecords = useMemo(() => {
    return ALL_PII_RECORDS.filter((r) => {
      const tabRow = PII_TABS.find((x) => x.key === tab);
      if (tab !== "all" && tabRow && r.piiType !== tabRow.piiType) return false;
      if (statusFilter !== "all" && r.status.toLowerCase() !== statusFilter) return false;
      if (severityFilter !== "all") {
        const cat = PII_CATEGORIES.find((c) => {
          if (severityFilter === "critical") return c.severity === "critical" && PII_TABS.find((x) => x.key === c.key)?.piiType === r.piiType;
          if (severityFilter === "high")     return c.severity === "high"     && PII_TABS.find((x) => x.key === c.key)?.piiType === r.piiType;
          if (severityFilter === "medium")   return c.severity === "medium"   && PII_TABS.find((x) => x.key === c.key)?.piiType === r.piiType;
          if (severityFilter === "low")      return c.severity === "low"      && PII_TABS.find((x) => x.key === c.key)?.piiType === r.piiType;
          return true;
        });
        if (!cat) return false;
      }
      return true;
    });
  }, [tab, statusFilter, severityFilter]);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 16,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: "rgba(255,69,98,0.10)", border: "1px solid rgba(255,69,98,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#FF4562", flexShrink: 0,
        }}>
          <Icon.user width="20" height="20" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div className="mono" style={{ fontSize: 9, color: t.text25, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 700 }}>PII — Personally Identifiable Information</div>
            <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(220,38,38,0.14)", color: "#DC2626", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
              {PII_CATEGORIES[0].count} critical (National ID)
            </span>
          </div>
          <div style={{ fontSize: 11, color: t.text50 }}>Tracking PII exposure across stealer logs, combo lists, breach databases, and dark web marketplaces</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { l: "Total Records",   v: TOTAL_RECORDS.toLocaleString(), c: t.text },
            { l: "Open",            v: "2,801",                          c: "#DC2626" },
            { l: "Closed",          v: "46",                              c: "#16A34A" },
            { l: "PII Types",       v: PII_CATEGORIES.length,             c: "#F59E0B" },
            { l: "Weak Passwords",  v: "487",                             c: "#DC2626" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 70 }}>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.10em", fontWeight: 700, marginBottom: 1 }}>{s.l.toUpperCase()}</div>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 700, color: s.c, letterSpacing: "-0.01em" }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PII CATEGORY CARDS ═══ */}
      <div style={{ display: "flex", gap: 8, animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        {PII_CATEGORIES.map((c) => (
          <PIICategoryCard
            key={c.key}
            cat={c}
            active={activeCategory === c.key}
            onClick={() => { setActiveCategory(c.key); setTab(c.key); }}
            t={t}
          />
        ))}
      </div>

      {/* ═══ SEVERITY CONTEXT BAR ═══ */}
      <div style={{
        padding: "12px 18px", borderRadius: 10,
        background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)",
        display: "flex", alignItems: "flex-start", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <Icon.alert width="20" height="20" style={{ color: "#DC2626", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, fontSize: 11.5, color: t.text60, lineHeight: 1.55 }}>
          <strong style={{ color: "#DC2626" }}>23 National ID records</strong> are your highest-priority exposure. A leaked SSN paired with a name and DOB sells for $20–$80 on the dark web and enables irreversible identity theft — fraudulent accounts, tax fraud, and medical identity theft. <strong style={{ color: "#DC2626" }}>69% of all data breaches</strong> in 2024 included SSN exposure.
          <div className="mono" style={{ fontSize: 8.5, color: t.text30, marginTop: 4, letterSpacing: "0.04em" }}>
            Sources: 2025 Dark Web Pricing Index · AT&T breach exposed 70M SSNs (Apr 2024) · National Public Data breach exposed 272M SSNs
          </div>
        </div>
      </div>

      {/* ═══ DETAIL GRID ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 14, animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>

        {/* ─── LEFT: PII Category Detail Panels ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

          {/* National ID — CRITICAL */}
          <div className="glass" style={{ padding: "16px 18px", borderLeft: `4px solid #DC2626` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div className="hfont" style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, color: t.text }}>
                  <span style={{ color: "#DC2626" }}><Icon.id width="15" height="15" /></span>
                  National ID / SSN Exposure
                  <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: "rgba(220,38,38,0.14)", color: "#DC2626", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>CRITICAL</span>
                </div>
                <div style={{ fontSize: 10, color: t.text35, marginTop: 3 }}>Government-issued identification numbers found on the dark web</div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>View All →</span>
            </div>
            {/* Sub-counts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
              {NATIONAL_ID_SUBCOUNTS.map((s, i) => (
                <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 7, padding: "8px 10px", textAlign: "center" }}>
                  <div className="hfont" style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.10em", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Records */}
            <div>
              {NATIONAL_ID_RECORDS.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", fontSize: 10, borderBottom: i < NATIONAL_ID_RECORDS.length - 1 ? `1px solid ${t.borderRow}` : "none" }}>
                  <span style={{ minWidth: 56, fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: `${r.color}18`, color: r.color, textAlign: "center", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{r.type}</span>
                  <span className="mono" style={{ flex: 1, fontSize: 11, color: t.text70, fontWeight: 600 }}>{r.masked}</span>
                  <span className="mono" style={{ fontSize: 8, color: t.text35, padding: "2px 7px", borderRadius: 3, background: t.bgInput }}>{r.source}</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text30, width: 80, textAlign: "right" }}>{r.date}</span>
                </div>
              ))}
            </div>
          </div>

          <BreakdownPanel title={<><span style={{ color: "#EA580C" }}><Icon.creditcard width="14" height="14" /></span> Financial Data</>} severity="high" count={156} items={FINANCIAL_BREAKDOWN} t={t} />
          <BreakdownPanel title={<><span style={{ color: "#EA580C" }}><Icon.home width="14" height="14" /></span> Physical Addresses</>} severity="high" count={342} items={ADDRESS_BREAKDOWN} note={ADDRESS_NOTE} t={t} />
          <BreakdownPanel title={<><span style={{ color: "#3B82F6" }}><Icon.phone width="14" height="14" /></span> Phone Numbers</>} severity="medium" count={891} items={PHONE_BREAKDOWN} note={PHONE_NOTE} t={t} />
        </div>

        {/* ─── RIGHT: Charts + Most Exposed ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

          {/* Exposure Timeline */}
          <div className="glass" style={{ padding: "14px 18px" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>PII Exposure Timeline</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 4 }}>New records over time</span>
            <span style={{ fontSize: 10, color: t.text40 }}>Last 6 months · monthly granularity</span>
            <div style={{ marginTop: 8 }}>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={TIMELINE}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.gridLine} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} interval={3} tick={{ fontSize: 8, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                  <YAxis axisLine={false} tickLine={false} width={32} tick={{ fontSize: 8, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                  <Tooltip {...ttS} />
                  <Area type="monotone" dataKey="count" name="New Records" stroke="#FF4562" fill="#FF4562" fillOpacity={0.10} strokeWidth={1.8} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Record Statuses + Password Strength side-by-side */}
          <div className="glass" style={{ padding: "14px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Record Statuses</div>
                <span className="hfont" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>{TOTAL_RECORDS.toLocaleString()} total records</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <MiniDonut segments={RECORD_STATUS} size={86} t={t} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {RECORD_STATUS.map((s, i) => {
                      const total = RECORD_STATUS.reduce((acc, r) => acc + r.count, 0);
                      const pct = ((s.count / total) * 100).toFixed(1);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                          <span style={{ fontSize: 11, color: t.text60 }}>{s.label}</span>
                          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{s.count.toLocaleString()}</span>
                          <span className="mono" style={{ fontSize: 9, color: t.text30 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Password Strength</div>
                <span className="hfont" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>{PW_TOTAL} credentials analyzed</span>
                <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 6, marginBottom: 8 }}>
                  {PW_STRENGTH.map((p, i) => (
                    <span key={i} style={{ width: `${(p.count / PW_TOTAL) * 100}%`, background: p.color }} />
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {PW_STRENGTH.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                      <span style={{ color: t.text50 }}>{p.label}</span>
                      <span className="mono" style={{ fontWeight: 700, color: t.text, marginLeft: "auto" }}>{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Most Exposed Identities */}
          <div className="glass" style={{ padding: "14px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Most Exposed Identities</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 10 }}>Highest-risk individuals</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {MOST_EXPOSED.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < MOST_EXPOSED.length - 1 ? `1px solid ${t.borderRow}` : "none" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? "rgba(220,38,38,0.14)" : i === 1 ? "rgba(234,88,12,0.14)" : i === 2 ? "rgba(59,130,246,0.14)" : t.bgElevated,
                    color: i === 0 ? "#DC2626" : i === 1 ? "#EA580C" : i === 2 ? "#3B82F6" : t.text40,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  }}>{e.rank}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: t.text70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.email}</div>
                    <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 1 }}>{e.source} · {e.date}</div>
                    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                      {e.piiTypes.map((p) => {
                        const c = PII_TYPE_COLOR[p];
                        return (
                          <span key={p} style={{ fontSize: 7.5, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: c.bg, color: c.fg, letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace" }}>{p}</span>
                        );
                      })}
                    </div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: `${STR_COL[e.strength]}14`, color: STR_COL[e.strength], letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{e.strength}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: t.text60, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                    <Icon.bell width="11" height="11" style={{ color: t.text30 }} />
                    {e.alarms}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ UNIVERSAL DATA TABLE ═══ */}
      <div className="glass" style={{ overflow: "hidden", animation: loaded ? "fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700 }}>All PII Records</div>
              <span className="hfont" style={{ fontSize: 14, fontWeight: 700, marginTop: 2, display: "inline-block" }}>{TOTAL_RECORDS.toLocaleString()} total · showing filtered subset</span>
            </div>
          </div>
          {/* Type tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {PII_TABS.map((tb) => {
              const active = tab === tb.key;
              return (
                <span key={tb.key} onClick={() => setTab(tb.key)} className="mono" style={{
                  fontSize: 9, fontWeight: 700, padding: "5px 11px", borderRadius: 5, cursor: "pointer",
                  border: `1px solid ${active ? "rgba(255,69,98,0.30)" : t.borderLight}`,
                  background: active ? "rgba(255,69,98,0.10)" : "transparent",
                  color: active ? "#FF4562" : t.text40,
                  letterSpacing: "0.06em",
                }}>{tb.label}</span>
              );
            })}
          </div>
          {/* Severity + Status filters */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { key: "all",      label: "All Severity", color: t.text },
              { key: "critical", label: "Critical",      color: "#DC2626" },
              { key: "high",     label: "High",          color: "#EA580C" },
              { key: "medium",   label: "Medium",        color: "#3B82F6" },
              { key: "low",      label: "Low",           color: "#94A3B8" },
            ].map((f) => {
              const active = severityFilter === f.key;
              return (
                <span key={f.key} onClick={() => setSeverityFilter(f.key)} className="mono" style={{
                  fontSize: 8, fontWeight: 700, padding: "3px 9px", borderRadius: 4, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                  border: `1px solid ${active ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                  background: active ? "rgba(59,130,246,0.10)" : "transparent",
                  color: active ? "#3B82F6" : t.text40,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: f.color }} />
                  {f.label}
                </span>
              );
            })}
            <span style={{ width: 1, height: 16, background: t.borderLight, margin: "0 4px" }} />
            {[
              { key: "all", label: "All Status" },
              { key: "open", label: "Open" },
              { key: "closed", label: "Closed" },
            ].map((f) => {
              const active = statusFilter === f.key;
              return (
                <span key={f.key} onClick={() => setStatusFilter(f.key)} className="mono" style={{
                  fontSize: 8, fontWeight: 700, padding: "3px 9px", borderRadius: 4, cursor: "pointer",
                  border: `1px solid ${active ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                  background: active ? "rgba(59,130,246,0.10)" : "transparent",
                  color: active ? "#3B82F6" : t.text40,
                }}>{f.label}</span>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) 80px minmax(0, 1.4fr) 80px 80px 80px 80px 70px",
          gap: 10, padding: "8px 20px",
          fontSize: 7.5, color: t.text25, letterSpacing: "0.10em", fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
          borderBottom: `1px solid ${t.borderSection}`,
        }}>
          <span>Identity</span>
          <span>PII Type</span>
          <span>Value</span>
          <span>Source</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Discovered</span>
          <span style={{ textAlign: "right" }}>Breach</span>
          <span style={{ textAlign: "right" }}>Alarm</span>
        </div>
        {filteredRecords.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", fontSize: 11, color: t.text35 }}>No records match these filters.</div>
        ) : (
          filteredRecords.map((r, i) => {
            const c = PII_TYPE_COLOR[r.piiType] || PII_TYPE_COLOR.Email;
            return (
              <div key={r.id} style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.6fr) 80px minmax(0, 1.4fr) 80px 80px 80px 80px 70px",
                gap: 10, alignItems: "center", padding: "10px 20px",
                fontSize: 11, borderBottom: i < filteredRecords.length - 1 ? `1px solid ${t.borderRow}` : "none",
                cursor: "pointer", transition: "background 0.15s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <span className="mono" style={{ fontSize: 10, color: t.text70, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.identity}</span>
                <span className="mono" style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: c.bg, color: c.fg, letterSpacing: "0.06em", justifySelf: "start" }}>{r.piiType}</span>
                <span className="mono" style={{ fontSize: 10, color: t.text50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text40, padding: "2px 7px", borderRadius: 3, background: t.bgInput, justifySelf: "start" }}>{r.source}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4, justifySelf: "start",
                  background: r.status === "Open" ? "rgba(220,38,38,0.10)" : "rgba(22,163,74,0.10)",
                  color: r.status === "Open" ? "#DC2626" : "#16A34A",
                  letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace",
                }}>{r.status}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text30, textAlign: "right" }}>{r.discovered}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text30, textAlign: "right" }}>{r.breach}</span>
                <span className="mono" style={{ fontSize: 9, color: "#3B82F6", textAlign: "right", fontWeight: 600 }}>Open ↗</span>
              </div>
            );
          })
        )}
        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderTop: `1px solid ${t.borderSection}`, fontSize: 9, color: t.text35 }}>
          <span className="mono">Showing {filteredRecords.length > 0 ? `1–${filteredRecords.length}` : "0"} of {ALL_PII_RECORDS.length} {tab !== "all" ? `(${tab.replace("_", " ")} filtered)` : ""} · ALL · 10/page</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["‹", "1", "2", "3", "…", "285", "›"].map((p, i) => (
              <span key={i} style={{
                minWidth: 22, height: 22, padding: "0 6px", borderRadius: 5, fontSize: 9, fontWeight: 700,
                border: `1px solid ${i === 1 ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                background: i === 1 ? "rgba(59,130,246,0.10)" : "transparent",
                color: i === 1 ? "#3B82F6" : t.text40,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
