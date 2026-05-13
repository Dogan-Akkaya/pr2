import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTheme } from "../context/ThemeContext";
import { tooltipStyles } from "../components/chartTheme";
import HoverComment from "../components/HoverComment";

// ═══════════════════════════════════════
// DATA FIXTURES
// ═══════════════════════════════════════
const HERO = {
  exposedCustomers: 47832,
  totalRecords: 124891,
  newThisMonth: 3241,
  newPct: 12,
  sources: 14,
  estimatedBreachCost: "$8.27M",
  acquisitionCost: "$2,384",
};

const SHOPPING_CARDS = [
  {
    id: "cred", label: "STOLEN CREDENTIALS", color: "#FF4562",
    count: 31205, sub: "email + password combos",
    detail: "Including 4,821 with plaintext passwords, 12,340 from stealer logs with cookies & autofill data",
    priceLabel: "Avg. price per log", price: "$0.05",
  },
  {
    id: "pii", label: "PERSONAL INFORMATION (PII)", color: "#F59E0B",
    count: 18442, sub: "records with identity data",
    detail: "Full names, phone numbers, physical addresses, national IDs. 2,100 records include passport or driver's license numbers",
    priceLabel: "Avg. price per record", price: "$0.10",
  },
  {
    id: "fin", label: "FINANCIAL DATA", color: "#A855F7",
    count: 8891, sub: "payment & banking records",
    detail: "Credit card numbers, bank account details, transaction history. 1,203 cards are verified active (tested within 48h)",
    priceLabel: "Avg. price per card", price: "$0.50 – $15",
  },
  {
    id: "session", label: "ACTIVE SESSIONS", color: "#22D3EE",
    count: 4127, sub: "live session tokens & cookies",
    detail: "Bypass 2FA entirely. Attacker gains instant access to customer accounts without needing credentials",
    priceLabel: "Avg. price per session", price: "$0.30",
  },
];

const REGIONS = [
  {
    id: "tr", label: "Turkey", flag: "TR",
    name: "Turkey (KVKK)", regulation: "Kişisel Verilerin Korunması Kanunu",
    fineValue: "~$300K", fineColor: "#F59E0B",
    detail: "Max: TRY 9,834,998 per violation. KVKK Board can also order data deletion and processing suspension.",
    formula: "47,832 records × notification + remediation",
  },
  {
    id: "eu", label: "EU", flag: "EU",
    name: "EU (GDPR)", regulation: "General Data Protection Regulation",
    fineValue: "$2.1M – $20M", fineColor: "#FF4562",
    detail: "Up to €20M or 4% of global annual revenue. 72h mandatory breach notification. Avg. fine: €2.8M (2024).",
    formula: "Art 83(5) · €1.2B issued in 2025 alone",
  },
  {
    id: "us", label: "US", flag: "US",
    name: "United States", regulation: "CCPA / CPRA + State Laws",
    fineValue: "$4.4M – $10.2M", fineColor: "#FF4562",
    detail: "$2,500–$7,500 per violation under CCPA. US avg breach cost: $10.22M (highest globally). 19 states with privacy laws.",
    formula: "IBM 2025: $10.22M avg US breach cost",
  },
  {
    id: "uk", label: "UK", flag: "UK",
    name: "United Kingdom", regulation: "UK GDPR + Data Protection Act 2018",
    fineValue: "$1.8M – $17.5M", fineColor: "#F59E0B",
    detail: "Up to £17.5M or 4% global annual turnover. ICO enforcement increasing. UK avg: £3.29M per breach.",
    formula: "UK Data Protection Act 2018 · s.157",
  },
  {
    id: "apac", label: "APAC", flag: "AP",
    name: "Asia-Pacific", regulation: "PDPA (Singapore) · APP (Australia) · PIPL (China)",
    fineValue: "$1.0M – $7.4M", fineColor: "#A855F7",
    detail: "Singapore: up to S$1M or 10% turnover. Australia: AU$50M / 30% turnover. China PIPL: up to ¥50M or 5%.",
    formula: "Cross-region average · IBM APAC 2025",
  },
];

const EXPOSURE_TYPES = [
  { name: "Login Credentials", desc: "Email + password combinations from breaches & stealer logs", count: 31205, pct: 42, color: "#FF4562" },
  { name: "Email Addresses", desc: "Customer emails found in paste sites & combo lists", count: 28103, pct: 38, color: "#F59E0B" },
  { name: "Phone Numbers", desc: "Mobile/landline numbers linked to customer accounts", count: 12847, pct: 17, color: "#A855F7" },
  { name: "National IDs / Passport", desc: "Government-issued identification documents", count: 2100, pct: 3, color: "#22D3EE" },
  { name: "Physical Addresses", desc: "Home/billing addresses from breach databases", count: 8234, pct: 11, color: "#22C55E" },
];

const SOURCES = [
  { name: "Stealer Logs", count: 52340, pct: 80, color: "#FF4562", iconKey: "square" },
  { name: "Breach Databases", count: 34201, pct: 55, color: "#F59E0B", iconKey: "diamond" },
  { name: "Combo Lists", count: 18923, pct: 30, color: "#3B82F6", iconKey: "rhombus" },
  { name: "Telegram Channels", count: 11204, pct: 18, color: "#22D3EE", iconKey: "send" },
  { name: "Dark Web Marketplaces", count: 6102, pct: 10, color: "#A855F7", iconKey: "star" },
  { name: "Paste Sites", count: 2121, pct: 5, color: "#64748B", iconKey: "edit" },
];

// Quick-range presets for the customer-leak CSV export.
// Dates are inline strings; today's reference is 2026-05-13.
const EXPORT_PRESETS = [
  { id: "last-month", label: "Last Month", start: "2026-04-01", end: "2026-04-30" },
  { id: "this-year",  label: "This Year",  start: "2026-01-01", end: "2026-05-13" },
  { id: "last-year",  label: "Last Year",  start: "2025-01-01", end: "2025-12-31" },
];

const ACTIONS = [
  {
    name: "Force Password Reset", iconKey: "key",
    desc: "Export the list of 31,205 compromised credentials and trigger mandatory password resets for affected customer accounts.",
  },
  {
    name: "Notify Affected Customers", iconKey: "megaphone",
    desc: "Generate a compliance-ready notification template for the 47,832 exposed customers, customized to your regulatory region.",
  },
  {
    name: "Generate Board Report", iconKey: "chart",
    desc: "Export a presentation-ready executive summary with exposure stats, compliance estimates, and trend analysis for board briefing.",
  },
  {
    name: "Invalidate Sessions", iconKey: "shield",
    desc: "Identify and revoke the 4,127 active session tokens currently for sale to prevent immediate account takeover attacks.",
  },
];

// 12-month exposure trend (stacked area)
const TREND_DATA = (() => {
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => {
    const base = 2400 + i * 280;
    return {
      month: m,
      credentials: Math.round(base * 0.42 + Math.random() * 200),
      pii: Math.round(base * 0.30 + Math.random() * 180),
      financial: Math.round(base * 0.18 + Math.random() * 80),
      sessions: Math.round(base * 0.10 + Math.random() * 60),
    };
  });
})();

// ═══════════════════════════════════════
// Inline SVG icon components
// ═══════════════════════════════════════
function Icon({ name, size = 16, color = "currentColor" }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "warning":
      return <svg {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "eye":
      return <svg {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "scale":
      return <svg {...props}><path d="M12 3v18M5 8h14M5 8l-3 6a4 4 0 0 0 6 0Zm14 0-3 6a4 4 0 0 0 6 0Z" /></svg>;
    case "trend-up":
      return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    case "lock":
      return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
    case "card":
      return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
    case "user":
      return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "star":
      return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "key":
      return <svg {...props}><circle cx="8" cy="15" r="4" /><path d="M10.85 12.15 19 4" /><path d="m18 5 3 3" /><path d="m15 8 3 3" /></svg>;
    case "megaphone":
      return <svg {...props}><path d="M3 11v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z" /><path d="M7 11h2.5l8.5-5v13l-8.5-5H7" /></svg>;
    case "chart":
      return <svg {...props}><path d="M3 3v18h18" /><path d="m18 9-5 5-4-4-3 3" /></svg>;
    case "shield":
      return <svg {...props}><path d="M12 2 4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "square":
      return <svg {...props}><rect x="4" y="4" width="16" height="16" /></svg>;
    case "diamond":
      return <svg {...props}><path d="M12 3 21 12 12 21 3 12Z" /></svg>;
    case "rhombus":
      return <svg {...props}><path d="M12 2 22 12 12 22 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "send":
      return <svg {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
    case "edit":
      return <svg {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
    default:
      return null;
  }
}

function FlagSVG({ code, size = 22 }) {
  const flags = {
    TR: { bg: "#E30A17", el: <><circle cx="11" cy="12" r="4" fill="#fff" /><circle cx="12.2" cy="12" r="3" fill="#E30A17" /><polygon points="14.6,12 17,11.2 15.5,13 17,14.8 14.6,14" fill="#fff" /></> },
    EU: { bg: "#003399", el: Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = 12 + Math.cos(a) * 5;
      const y = 12 + Math.sin(a) * 5;
      return <circle key={i} cx={x} cy={y} r="0.6" fill="#FFCC00" />;
    }) },
    US: { bg: "#FFFFFF", el: <>
      {[0, 2, 4, 6, 8, 10, 12].map((y, i) => i % 2 === 0 ? <rect key={i} x="0" y={y * 1.4} width="24" height="1.4" fill="#B22234" /> : null)}
      <rect x="0" y="0" width="11" height="9" fill="#3C3B6E" />
    </> },
    UK: { bg: "#012169", el: <>
      <line x1="0" y1="0" x2="24" y2="24" stroke="#fff" strokeWidth="3" />
      <line x1="24" y1="0" x2="0" y2="24" stroke="#fff" strokeWidth="3" />
      <line x1="12" y1="0" x2="12" y2="24" stroke="#fff" strokeWidth="4" />
      <line x1="0" y1="12" x2="24" y2="12" stroke="#fff" strokeWidth="4" />
      <line x1="12" y1="0" x2="12" y2="24" stroke="#C8102E" strokeWidth="2" />
      <line x1="0" y1="12" x2="24" y2="12" stroke="#C8102E" strokeWidth="2" />
    </> },
    AP: { bg: "#1B1B3C", el: <>
      <circle cx="12" cy="12" r="6" fill="none" stroke="#22D3EE" strokeWidth="1" />
      <circle cx="12" cy="12" r="2.5" fill="#FF4562" />
    </> },
  };
  const f = flags[code] || flags.AP;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ borderRadius: 4, overflow: "hidden" }}>
      <rect x="0" y="0" width="24" height="24" fill={f.bg} />
      {f.el}
    </svg>
  );
}

// ═══════════════════════════════════════
export default function CustomerLeaks() {
  const { t, mode } = useTheme();
  const isDark = mode === "dark";
  const ttS = tooltipStyles(t);
  const [loaded, setLoaded] = useState(false);
  const [activeRegion, setActiveRegion] = useState("tr");
  // Export panel state — quick-range preset + manual date overrides.
  const [exportPreset, setExportPreset] = useState("last-month");
  const [exportStart, setExportStart] = useState(EXPORT_PRESETS[0].start);
  const [exportEnd, setExportEnd] = useState(EXPORT_PRESETS[0].end);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const reorderedRegions = useMemo(() => {
    // Active region first, others after
    const active = REGIONS.find(r => r.id === activeRegion);
    const others = REGIONS.filter(r => r.id !== activeRegion);
    return active ? [active, ...others.slice(0, 3)] : REGIONS.slice(0, 4);
  }, [activeRegion]);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(255,69,98,0.15) 0%, rgba(168,85,247,0.10) 50%, rgba(11,15,26,0) 100%)"
          : "linear-gradient(135deg, rgba(255,69,98,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(255,255,255,0) 100%)",
        border: "1px solid rgba(255,69,98,0.20)",
        borderRadius: 14, padding: "26px 30px",
        position: "relative", overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: 4, height: "100%",
          background: "linear-gradient(180deg, #FF4562, #A855F7)", borderRadius: "14px 0 0 14px",
        }} />
        <HoverComment anchorKey="customer-leaks.infocard" top={14} right={16} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,69,98,0.15)", color: "#FF4562",
              padding: "5px 14px", borderRadius: 10,
              fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <Icon name="warning" size={11} color="#FF4562" />
              CUSTOMER DATA EXPOSED
            </span>
            <h1 className="hfont" style={{
              fontSize: 28, fontWeight: 800, margin: "12px 0 6px",
              letterSpacing: "-0.02em", lineHeight: 1.2, color: t.text,
            }}>
              <span style={{ color: "#FF4562" }}>{HERO.exposedCustomers.toLocaleString()}</span> of your customers<br />
              are exposed on the dark web
            </h1>
            <div style={{ color: t.text50, fontSize: 12, lineHeight: 1.6, maxWidth: 600 }}>
              Their credentials, personal information, and session data are available for purchase across {HERO.sources} dark web marketplaces and stealer log repositories. A threat actor could compile a targeted attack list for under <strong style={{ color: "#F59E0B" }}>{HERO.acquisitionCost}</strong>.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              {[
                { label: "EXPOSED RECORDS", val: HERO.totalRecords.toLocaleString(), sub: "across all sources", color: "#FF4562" },
                { label: "UNIQUE CUSTOMERS", val: HERO.exposedCustomers.toLocaleString(), sub: "with account on your platform", color: t.text },
                { label: "NEW THIS MONTH", val: `+${HERO.newThisMonth.toLocaleString()}`, sub: `▲ ${HERO.newPct}% vs last month`, color: "#F59E0B" },
                { label: "SOURCES", val: String(HERO.sources), sub: "marketplaces & repositories", color: t.text },
              ].map((s, i) => (
                <div key={i} style={{
                  background: t.bgCard, border: `1px solid ${t.borderLight}`,
                  borderRadius: 10, padding: "12px 18px", textAlign: "center", minWidth: 130,
                }}>
                  <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700 }}>{s.label}</div>
                  <div className="hfont" style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 3 }}>{s.val}</div>
                  <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{
              background: "rgba(255,69,98,0.10)",
              border: "1px solid rgba(255,69,98,0.22)",
              borderRadius: 12, padding: "18px 24px", textAlign: "center",
            }}>
              <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.14em", fontWeight: 700 }}>ESTIMATED BREACH COST</div>
              <div className="hfont" style={{ fontSize: 36, fontWeight: 800, color: "#FF4562", marginTop: 4 }}>{HERO.estimatedBreachCost}</div>
              <div style={{ fontSize: 10, color: t.text45, marginTop: 3 }}>if this data is weaponized</div>
              <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 6 }}>Based on IBM 2025 · $173/record</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ATTACKER VIEW ═══ */}
      <div className="glass" style={{
        border: "1px solid rgba(255,69,98,0.14)",
        padding: "20px 22px",
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="hfont" style={{ fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 9, color: t.text }}>
              <Icon name="eye" size={17} color="#FF4562" />
              What a Threat Actor Sees
            </div>
            <div style={{ fontSize: 10, color: t.text40, marginTop: 3 }}>If someone wanted to target your customers, here's what's available right now</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.12em", fontWeight: 700 }}>TOTAL ACQUISITION COST</div>
            <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: "#F59E0B", marginTop: 2 }}>{HERO.acquisitionCost}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {SHOPPING_CARDS.map((s) => (
            <div key={s.id} style={{
              background: t.bgCard, border: `1px solid ${t.borderLight}`,
              borderRadius: 9, padding: "16px 14px 14px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: s.color,
              }} />
              <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
              <div className="hfont" style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: t.text45, marginTop: 3 }}>{s.sub}</div>
              <div style={{ fontSize: 9, color: t.text35, marginTop: 8, lineHeight: 1.45 }}>{s.detail}</div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 10, paddingTop: 8, borderTop: `1px solid ${t.borderRow}`,
              }}>
                <span style={{ fontSize: 8, color: t.text30 }}>{s.priceLabel}</span>
                <span className="hfont" style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B" }}>{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ COMPLIANCE COST ESTIMATOR ═══ */}
      <div className="glass" style={{
        padding: "20px 22px",
        border: "1px solid rgba(168,85,247,0.16)",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hfont" style={{ fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 9, color: t.text }}>
              <Icon name="scale" size={17} color="#A855F7" />
              Compliance Cost Estimator
            </div>
            <div style={{ fontSize: 10, color: t.text40, marginTop: 3 }}>What this exposure could cost you under data protection regulations</div>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            {REGIONS.map(r => {
              const active = activeRegion === r.id;
              return (
                <button key={r.id} onClick={() => setActiveRegion(r.id)} style={{
                  padding: "5px 13px", borderRadius: 6,
                  border: `1px solid ${active ? "rgba(168,85,247,0.32)" : t.borderLight}`,
                  background: active ? "rgba(168,85,247,0.12)" : "transparent",
                  color: active ? "#A855F7" : t.text40,
                  fontSize: 9, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em",
                }}>{r.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {reorderedRegions.map((r) => {
            const isActive = r.id === activeRegion;
            return (
              <div key={r.id} style={{
                background: isActive ? "rgba(168,85,247,0.06)" : t.bgCard,
                border: `1px solid ${isActive ? "rgba(168,85,247,0.32)" : t.borderLight}`,
                borderRadius: 9, padding: "14px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <FlagSVG code={r.flag} size={20} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{r.name}</div>
                    <div className="mono" style={{ fontSize: 7, color: "#A855F7", fontWeight: 600, marginTop: 1, lineHeight: 1.3 }}>{r.regulation}</div>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.10em", fontWeight: 700 }}>ESTIMATED FINE EXPOSURE</div>
                <div className="hfont" style={{ fontSize: 20, fontWeight: 800, color: r.fineColor, marginTop: 2 }}>{r.fineValue}</div>
                <div style={{ fontSize: 9, color: t.text40, marginTop: 6, lineHeight: 1.45 }}>{r.detail}</div>
                <div className="mono" style={{
                  fontSize: 8, color: t.text30, marginTop: 8, paddingTop: 7,
                  borderTop: `1px solid ${t.borderRow}`,
                }}>{r.formula}</div>
              </div>
            );
          })}
        </div>
        <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 14, textAlign: "center", lineHeight: 1.5 }}>
          Estimates for informational purposes only. Based on IBM Cost of a Data Breach Report 2025, GDPR enforcement data (DLA Piper 2026), and regional regulatory frameworks. Actual fines depend on specifics of each incident.
        </div>
      </div>

      {/* ═══ TWO COLUMN: EXPOSURE / SOURCES ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* LEFT COL: Exposure by Data Type + Trend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="glass" style={{ padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Exposure by Data Type</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text }}>What data is compromised</div>
            {EXPOSURE_TYPES.map((e, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
                borderBottom: i < EXPOSURE_TYPES.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{e.name}</div>
                  <div style={{ fontSize: 9, color: t.text35, marginTop: 1 }}>{e.desc}</div>
                </div>
                <div className="hfont" style={{ fontSize: 16, fontWeight: 800, color: e.color, flexShrink: 0 }}>{e.count.toLocaleString()}</div>
                <div className="mono" style={{ fontSize: 9, color: t.text35, width: 38, textAlign: "right", flexShrink: 0 }}>{e.pct}%</div>
              </div>
            ))}
          </div>

          {/* Exposure Trend chart */}
          <div className="glass" style={{ padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Exposure Trend</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text }}>Customer records exposed over time</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="leakCred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4562" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF4562" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="leakPii" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="leakFin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="leakSes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.gridLine} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} />
                <YAxis axisLine={false} tickLine={false} width={32} tick={{ fontSize: 9, fill: t.text30 }} />
                <Tooltip {...ttS} />
                <Area type="monotone" dataKey="credentials" stackId="1" stroke="#FF4562" fill="url(#leakCred)" strokeWidth={1.5} name="Credentials" />
                <Area type="monotone" dataKey="pii" stackId="1" stroke="#F59E0B" fill="url(#leakPii)" strokeWidth={1.5} name="PII" />
                <Area type="monotone" dataKey="financial" stackId="1" stroke="#A855F7" fill="url(#leakFin)" strokeWidth={1.5} name="Financial" />
                <Area type="monotone" dataKey="sessions" stackId="1" stroke="#22D3EE" fill="url(#leakSes)" strokeWidth={1.5} name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
              {[
                { l: "Credentials", c: "#FF4562" },
                { l: "PII", c: "#F59E0B" },
                { l: "Financial", c: "#A855F7" },
                { l: "Sessions", c: "#22D3EE" },
              ].map(i => (
                <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: i.c }} />
                  <span className="mono" style={{ fontSize: 9, color: t.text40 }}>{i.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COL: Sources + Risk Segments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="glass" style={{ padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Exposure by Source</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text }}>Where the data was found</div>
            {SOURCES.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                borderBottom: i < SOURCES.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: `${s.color}1F`, color: s.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon name={s.iconKey} size={11} color={s.color} />
                </div>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: t.text50 }}>{s.name}</span>
                <div style={{ width: 80, height: 5, background: t.bgInput, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: 3 }} />
                </div>
                <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: s.color, width: 50, textAlign: "right", flexShrink: 0 }}>{s.count.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="glass" style={{ padding: "16px 18px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Data Export</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: t.text }}>Export leaked customers</div>
            <div style={{ fontSize: 10, color: t.text40, lineHeight: 1.5, marginBottom: 12 }}>
              Pick a quick range or set custom start &amp; end dates. Export delivers a CSV of all exposed customer records in that window.
            </div>
            {/* Quick range chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {EXPORT_PRESETS.map(p => {
                const active = exportPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setExportPreset(p.id); setExportStart(p.start); setExportEnd(p.end); }}
                    style={{
                      padding: "5px 11px", borderRadius: 5,
                      border: `1px solid ${active ? "rgba(255,69,98,0.32)" : t.borderLight}`,
                      background: active ? "rgba(255,69,98,0.10)" : "transparent",
                      color: active ? "#FF4562" : t.text50,
                      fontSize: 10, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >{p.label}</button>
                );
              })}
            </div>
            {/* Start / End date inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase" }}>From</span>
                <input
                  type="date"
                  value={exportStart}
                  onChange={e => { setExportStart(e.target.value); setExportPreset("custom"); }}
                  style={{
                    padding: "7px 10px", fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: t.bgInput, border: `1px solid ${t.borderLight}`,
                    borderRadius: 7, color: t.text, outline: "none",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase" }}>To</span>
                <input
                  type="date"
                  value={exportEnd}
                  onChange={e => { setExportEnd(e.target.value); setExportPreset("custom"); }}
                  style={{
                    padding: "7px 10px", fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: t.bgInput, border: `1px solid ${t.borderLight}`,
                    borderRadius: 7, color: t.text, outline: "none",
                  }}
                />
              </label>
            </div>
            <button
              style={{
                width: "100%",
                padding: "9px 14px", borderRadius: 8, border: "none",
                background: "#FF4562", color: "#fff",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                boxShadow: "0 4px 16px rgba(255,69,98,0.25)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ═══ ACTION CARDS ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.25s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 9 }}>Recommended Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {ACTIONS.map((a) => {
            const accent = "#3B82F6";
            const accentBg = "rgba(59,130,246,0.10)";
            return (
              <div key={a.iconKey} style={{
                background: t.bgCard, border: `1px solid ${t.borderSection}`,
                borderRadius: 9, padding: "14px 16px",
                display: "flex", flexDirection: "column",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: accentBg, color: accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={a.iconKey} size={16} color={accent} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text, flex: 1, lineHeight: 1.25 }}>{a.name}</div>
                </div>
                <div style={{ fontSize: 9, color: t.text40, lineHeight: 1.5, flex: 1 }}>{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
