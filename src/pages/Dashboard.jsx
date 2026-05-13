import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { TL, SEV, STR_COL } from "../data/threat-levels";
import { TimeRangeFilter } from "../components/TableUtils";
import HoverComment from "../components/HoverComment";

// ═══════════════════════════════════════
// Page-local fixtures (kept simple — wireframe-faithful)
// ═══════════════════════════════════════

// Severity banner — coverage strip pairs + 3 inline alerts
const COVERAGE_PAIRS = [
  { label: "Domains",         done: 2, total: 3,  incomplete: false },
  { label: "Keywords",        done: 5, total: 19, incomplete: true  },
  { label: "VIP Accounts",    done: 1, total: 5,  incomplete: true  },
  { label: "Financial Assets",done: 8, total: 12, incomplete: false },
];
const COVERAGE_PCT = 65;

// Banner copy + accent per threat level (driven by AdminPanel → DataContext.threatLevel)
const BANNER_BY_LEVEL = {
  critical: {
    badge: "CRITICAL EXPOSURE",
    headline: "Immediate attention required",
    subline: "3 critical findings in the last 24h · Exposure increased 12% this week",
    accent: "#FF4562", // coral — also used for gradient + badge tint
  },
  high: {
    badge: "HIGH EXPOSURE",
    headline: "Elevated risk — review your exposure",
    subline: "Multiple high-severity findings detected · Exposure trending up",
    accent: "#EA580C",
  },
  medium: {
    badge: "MEDIUM EXPOSURE",
    headline: "Moderate exposure detected",
    subline: "Review monitored alerts and triage at convenience",
    accent: "#CA8A04",
  },
  low: {
    badge: "LOW EXPOSURE",
    headline: "Your environment looks secure",
    subline: "No critical exposures detected · Continue monitoring",
    accent: "#16A34A",
  },
};

// B1 — KPIs
const KPI_TILES = [
  { label: "TOTAL DW FINDINGS",   value: "1,345", trend: "+12%", trendColor: "#22C55E", valueColor: null },
  { label: "EXPOSED EMPLOYEES",   value: "712",   trend: "+45",  trendColor: "#FF4562", valueColor: null },
  { label: "INFECTED EMPLOYEES",  value: "2,552", trend: null,   trendColor: null,      valueColor: "#FF4562" },
  { label: "PASSWORD REUSE",      value: "31.8%", trend: "+2%",  trendColor: "#FF4562", valueColor: "#F59E0B" },
];

// B3 — Exposed Employees / VIPs (employees rendered with bar weights)
const EXPOSED_EMP = [
  { email: "v.walker@greenanimalbank.com",  weight: 55, color: "rgba(255,69,98,0.55)" },
  { email: "g.barnett@greenanimalbank.com", weight: 40, color: "rgba(255,69,98,0.45)" },
  { email: "m.white@greenanimalbank.com",   weight: 30, color: "rgba(245,158,11,0.50)" },
  { email: "bird@greenanimalbank.com",      weight: 20, color: "rgba(34,197,94,0.40)" },
];

// B4 — VIP Protection table
const VIP_PROTECTION = [
  { name: "John Mitchell", role: "CEO", exposures: 3, status: "Exposed", dot: "#FF4562" },
  { name: "Sarah Chen",    role: "CFO", exposures: 1, status: "Exposed", dot: "#F59E0B" },
  { name: "David Park",    role: "CTO", exposures: 0, status: "Clear",   dot: "#22C55E" },
];

// B5 — Stealer Exposure by Domain + Black Market
const STEALER_EXPOSURE = [
  { domain: "gateway.example.com", count: "28.7K" },
  { domain: "example.com",          count: "14.1K" },
  { domain: "openam.example.com",   count: "460"   },
  { domain: "www.example.com",      count: "1.1K"  },
];
const BLACK_MARKET_LISTINGS = [
  { asset: "platform.socradar.com", price: "$10", status: "Open" },
  { asset: "academy.socradar.io",   price: "$10", status: "Open" },
  { asset: "socradar.com",          price: "$10", status: "Open" },
  { asset: "fastpay.co.id",         price: "$10", status: "Open" },
];

// B6 — PII Exposure (5 stat boxes)
const PII_EXPOSURE = [
  { label: "EMAIL ADDRESSES", value: "1,204", color: "#FF4562" },
  { label: "PHONE NUMBERS",   value: "342",   color: "#F59E0B" },
  { label: "PHYSICAL ADDR.",  value: "89",    color: "#F59E0B" },
  { label: "NATIONAL IDs",    value: "23",    color: "#FF4562" },
  { label: "TOTAL PII",       value: "4,821", color: null },
];

// B7 — Fraud Indicators
const FRAUD_INDICATORS = [
  { label: "Phishing domains targeting your brand", value: 7,   color: "#FF4562", iconKey: "warning" },
  { label: "Stolen credit cards (your BINs)",       value: 156, color: "#F59E0B", iconKey: "card" },
  { label: "Brand impersonation attempts",          value: 3,   color: "#A855F7", iconKey: "user" },
  { label: "Suspicious domain registrations",       value: 12,  color: "#22C55E", iconKey: "lock" },
];

// B8 — Underground Mentions
const UNDERGROUND_MENTIONS = [
  { source: "XSS Forum", lang: "English", time: "6h ago", relevance: "High", relevanceColor: "#FF4562",
    excerpt: "...greenanimalbank.com access for sale, RDP + VPN combo, verified yesterday..." },
  { source: "Telegram: DarkMarket_Chat", lang: "Russian", time: "1d ago", relevance: "Medium", relevanceColor: "#F59E0B",
    excerpt: "New batch includes records from banking sector, [em]greenanimalbank[/em] among targets..." },
];

// B9 — Data Unique Identifiers
const UNIQUE_IDS = [
  { label: "UNIQUE FQDNs",     value: "217"  },
  { label: "UNIQUE PASSWORDS", value: "764"  },
  { label: "UNIQUE USERNAMES", value: "1.9K" },
];

// C1 — Threat Actor Spotlight
const THREAT_SPOTLIGHT = {
  name: "IntelBroker",
  badge: "Trending · 48h",
  description: "Claimed access to 3 Fortune 500 companies this week. Known for database leaks & corporate access sales. Active across BreachForums.",
};

// C2 — Dark Web News (3 cards)
const DW_NEWS = [
  { tag: "RANSOM",  tagColor: "#FF4562", time: "3h ago", headline: "ALPHV claims 2.4M-record breach at US healthcare" },
  { tag: "DW FORUM",tagColor: "#6366F1", time: "5h ago", headline: "0-day for Citrix NetScaler — $80K BTC" },
  { tag: "CISA",    tagColor: "#F59E0B", time: "1d ago", headline: "Cisco IOS XE exploit chain across 40K devices" },
];

// C3 — Ransomware Activity
const RANSOM_ACTIVITY = {
  victims: 312,
  context: "ransomware victims worldwide",
  trend: "+28% vs 7d",
  stats: [
    { label: "New victims today",    value: 7,  color: "#FF4562" },
    { label: "Negotiations active",  value: 12, color: "#F59E0B" },
    { label: "Data leaks published", value: 3,  color: "#FF4562" },
  ],
};

// C4 — Industry Attack Heatmap
const INDUSTRY_HEAT = [
  { sector: "Healthcare",     count: 312, color: "rgba(255,69,98,0.60)" },
  { sector: "Finance",         count: 287, color: "rgba(255,69,98,0.50)" },
  { sector: "Manufacturing",   count: 243, color: "rgba(245,158,11,0.40)" },
  { sector: "Government",      count: 198, color: "rgba(245,158,11,0.30)" },
  { sector: "Education",       count: 142, color: "rgba(34,197,94,0.30)"  },
];

// C5 — Most Active Groups
const ACTIVE_GROUPS = [
  { name: "LockBit 4.0",      region: "RU",    hits: 127, dot: "#FF4562", countColor: "#FF4562" },
  { name: "BlackCat / ALPHV", region: "RU",    hits: 98,  dot: "#F59E0B", countColor: "#F59E0B" },
  { name: "Akira",            region: "RU/CA", hits: 87,  dot: "#F59E0B", countColor: "#F59E0B" },
  { name: "Cl0p",             region: "RU",    hits: 64,  dot: "#22C55E", countColor: "#22C55E" },
];

// C6 — Telegram Chatter
const TG_CHATTER = [
  { channel: "DarkForums_chat",  time: "2h ago", text: "New batch of banking sector SSO credentials ready — 12K records, fresh from stealer campaign...", tags: ["Banking", "Credentials", "SSO"] },
  { channel: "RansomWatch",      time: "3h ago", text: "ALPHV posted proof-of-data for the US healthcare breach. Sample includes patient records...",   tags: ["Ransomware", "Healthcare"] },
  { channel: "IntelBroker_Feed", time: "5h ago", text: "Selling RDP access to Turkish bank infrastructure. Verified yesterday. Starting at $800...",     tags: ["IAB", "Turkey", "Banking"] },
];

// C7 — IAB Activity
const IAB_ACTIVITY = {
  context: "Banking sector · Last 30 days",
  stats: [
    { label: "Active listings (your industry)", value: 23,      color: "#FF4562" },
    { label: "Avg. price VPN access",            value: "$1,328", color: "#F59E0B" },
  ],
};

// Exposure Timeline data — generated 24-month series
const EXPOSURE_TIMELINE = (() => {
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => ({
    month: m,
    stealerLogs:    240 + Math.round(Math.sin(i / 2) * 80 + i * 14 + Math.random() * 40),
    breaches:       110 + Math.round(Math.cos(i / 3) * 50 + i * 8  + Math.random() * 30),
    logsOnSale:     60  + Math.round(Math.sin(i / 4) * 25 + i * 5  + Math.random() * 20),
    dwMentions:     140 + Math.round(Math.cos(i / 2) * 40 + i * 6  + Math.random() * 25),
  }));
})();

// ═══════════════════════════════════════
// Inline icon helper for fraud indicators
// ═══════════════════════════════════════
function FraudIcon({ name, color }) {
  const props = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "warning": return <svg {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "card":    return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
    case "user":    return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "lock":    return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
    default: return null;
  }
}

// ═══════════════════════════════════════
export default function Dashboard() {
  const { state, dispatch } = useData();
  const { threatLevel, heroAlerts, blackMarket, exposedEmp } = state;
  // Banner copy + colour comes from threatLevel (set by AdminPanel)
  const banner = BANNER_BY_LEVEL[threatLevel] || BANNER_BY_LEVEL.critical;
  const accent = banner.accent;
  // Hero alerts are dispatched by the AdminPanel — show all but in "low" mode collapse to a single all-clear row
  const dismissHeroAlert = (id) => dispatch({ type: "DISMISS_HERO_ALERT", payload: id });
  const navigate = useNavigate();
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [empVipTab, setEmpVipTab] = useState("employees");
  const [timeRange, setTimeRange] = useState("30d");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const ttS = {
    contentStyle: { background: t.bgPanel, border: `1px solid ${t.borderLight}`, borderRadius: 8, fontSize: 11, color: t.text },
    itemStyle: { color: t.text50 }, labelStyle: { color: t.text },
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══════════════════════════════════════
          SEVERITY BANNER (full-width, top) — driven by AdminPanel
          ═══════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(135deg, ${accent}22 0%, ${accent}06 100%)`,
        border: `1px solid ${accent}38`,
        borderRadius: 14, padding: "20px 24px 16px",
        position: "relative", overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: 4, height: "100%",
          background: `linear-gradient(180deg, ${accent}, ${accent}33)`,
          borderRadius: "14px 0 0 14px",
          transition: "background 0.4s ease",
        }} />
        <HoverComment anchorKey="dashboard.info-card" top={12} right={14} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 14px", borderRadius: 10,
          background: `${accent}2E`, color: accent,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          fontFamily: "'JetBrains Mono', monospace",
          transition: "background 0.4s ease, color 0.4s ease",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 6px ${accent}80` }} />
          {banner.badge}
        </span>
        <h2 className="hfont" style={{ fontSize: 22, fontWeight: 800, margin: "10px 0 4px", color: t.text, letterSpacing: "-0.02em" }}>{banner.headline}</h2>
        <div style={{ color: t.text45, fontSize: 11 }}>{banner.subline}</div>

        {/* Coverage strip */}
        <div style={{ display: "flex", gap: 18, marginTop: 8, fontSize: 10, color: t.text45, alignItems: "center", flexWrap: "wrap" }}>
          {COVERAGE_PAIRS.map((p, i) => (
            <span key={i}>
              {p.label}{" "}
              <strong style={{ color: p.incomplete ? "#F59E0B" : t.text }}>{p.done}</strong>
              <span style={{ color: t.text25 }}>/{p.total}</span>
            </span>
          ))}
          <span style={{ marginLeft: "auto", color: "#3B82F6", cursor: "pointer", fontSize: 10, fontWeight: 600 }} onClick={() => navigate("/protection-coverage")}>
            Coverage: <strong style={{ color: "#F59E0B" }}>{COVERAGE_PCT}%</strong> · Improve →
          </span>
        </div>

        {/* Inline alerts (dispatched from AdminPanel; dismissable) */}
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
          {threatLevel === "low" || heroAlerts.length === 0 ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 6,
              background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.16)",
              fontSize: 11, color: "#16A34A",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              All clear — no critical exposures detected. Continue monitoring.
            </div>
          ) : heroAlerts.map((a) => {
            const sevColor = SEV[a.sev] || accent;
            const sevBg = `${sevColor}10`;
            return (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 14px", borderRadius: 6,
                background: sevBg, border: `1px solid ${sevColor}28`,
                fontSize: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.text }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor, boxShadow: `0 0 4px ${sevColor}80` }} />
                  {a.text}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ color: t.text30, fontSize: 9 }}>{a.source} · {a.time}</span>
                  <button
                    onClick={() => dismissHeroAlert(a.id)}
                    title="Dismiss"
                    style={{
                      width: 18, height: 18, borderRadius: 4, border: "none",
                      background: "transparent", color: t.text30,
                      cursor: "pointer", fontSize: 12, lineHeight: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.bgHover; e.currentTarget.style.color = t.text50; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.text30; }}
                  >×</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TWO COLUMNS — YOURS (60%) | GLOBAL (40%)
          ═══════════════════════════════════════ */}
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 20,
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* ───────────────────────────────────────
             LEFT COLUMN — YOURS (B1–B9)
             ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {/* Column header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              padding: "4px 11px", borderRadius: 7,
              background: "rgba(255,69,98,0.12)", color: "#FF4562",
              fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
              fontFamily: "'JetBrains Mono', monospace",
            }}>YOURS</span>
            <span style={{ color: t.text45, fontSize: 11 }}>Your Dark Web Exposure</span>
          </div>

          {/* B1 — KPI tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
            {KPI_TILES.map((k, i) => (
              <div key={i} className="glass" style={{ padding: "11px 13px" }}>
                <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.12em", fontWeight: 700 }}>{k.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 3 }}>
                  <span className="hfont" style={{ fontSize: 19, fontWeight: 800, color: k.valueColor || t.text }}>{k.value}</span>
                  {k.trend && <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: k.trendColor }}>{k.trend}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* B2 — Exposure Timeline */}
          <div className="glass" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Exposure Timeline</span>
              <TimeRangeFilter range={timeRange} onRangeChange={setTimeRange} />
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 6 }}>
              {[
                { l: "Stealer Logs",  c: "#FF4562" },
                { l: "Breaches",      c: "#F59E0B" },
                { l: "Logs on Sale",  c: "#A855F7" },
                { l: "DW Mentions",   c: "#3B82F6" },
              ].map(i => (
                <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: i.c, opacity: 0.75 }} />
                  <span className="mono" style={{ fontSize: 9, color: t.text40 }}>{i.l}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={EXPOSURE_TIMELINE} margin={{ top: 4, right: 6, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.gridLine} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} width={32} />
                <Tooltip {...ttS} />
                <Area type="monotone" dataKey="stealerLogs" stackId="1" stroke="#FF4562" fill="#FF4562" fillOpacity={0.18} strokeWidth={1.5} name="Stealer Logs" />
                <Area type="monotone" dataKey="breaches"    stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.18} strokeWidth={1.5} name="Breaches" />
                <Area type="monotone" dataKey="logsOnSale"  stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.18} strokeWidth={1.5} name="Logs on Sale" />
                <Area type="monotone" dataKey="dwMentions"  stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={1.5} name="DW Mentions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* B3 — Exposed Employees / VIPs (with tab) */}
          <div className="glass" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Exposed Employees</span>
              <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                {[
                  { id: "employees", label: "Employees", color: "#3B82F6" },
                  { id: "vips",      label: "VIPs",      color: "#A855F7" },
                ].map(tab => {
                  const active = empVipTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setEmpVipTab(tab.id)} style={{
                      padding: "3px 10px", borderRadius: 5,
                      border: `1px solid ${active ? `${tab.color}55` : t.borderLight}`,
                      background: active ? `${tab.color}14` : "transparent",
                      color: active ? tab.color : t.text40,
                      fontSize: 9, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}>{tab.label}</button>
                  );
                })}
              </div>
            </div>
            {empVipTab === "employees" ? (
              EXPOSED_EMP.map((e, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", padding: "5px 0", fontSize: 10,
                  color: t.text50, borderBottom: i < EXPOSED_EMP.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span className="mono">{e.email}</span>
                  <span style={{
                    marginLeft: "auto", display: "inline-block",
                    width: e.weight, height: 4, borderRadius: 2, background: e.color,
                  }} />
                </div>
              ))
            ) : (
              VIP_DATA.map((v, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", padding: "6px 0", fontSize: 10, gap: 8,
                  borderBottom: i < VIP_DATA.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span style={{ fontWeight: 600, color: t.text }}>{v.name}</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text30, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.email}</span>
                  <span style={{
                    padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700,
                    background: v.riskLevel === "VERY HIGH" ? "rgba(220,38,38,0.12)" : v.riskLevel === "HIGH" ? "rgba(234,88,12,0.12)" : "rgba(202,138,4,0.10)",
                    color: v.riskLevel === "VERY HIGH" ? "#DC2626" : v.riskLevel === "HIGH" ? "#EA580C" : "#CA8A04",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{v.riskLevel}</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text35 }}>{v.breaches}</span>
                </div>
              ))
            )}
            <div style={{ textAlign: "right", marginTop: 6 }}>
              <span className="mono" style={{ fontSize: 9, color: "#3B82F6", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate(empVipTab === "employees" ? "/pii-stealer-exposure" : "/vip-monitoring")}>View All →</span>
            </div>
          </div>

          {/* B4 — VIP Protection */}
          <div className="glass" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 9 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>VIP Protection</span>
              <span className="mono" style={{ fontSize: 9, color: "#FF4562", fontWeight: 700, marginLeft: 8 }}>2 at risk</span>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/vip-monitoring")}>Manage VIPs →</span>
            </div>
            {VIP_PROTECTION.map((v, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", padding: "6px 0", fontSize: 10,
                borderBottom: i < VIP_PROTECTION.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.dot, marginRight: 8, boxShadow: `0 0 5px ${v.dot}55` }} />
                <span style={{ fontWeight: 600, color: t.text, width: 120, flexShrink: 0 }}>{v.name}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text35, width: 44, flexShrink: 0 }}>{v.role}</span>
                <span style={{ fontSize: 9, color: t.text40, flex: 1 }}>{v.exposures} exposure{v.exposures !== 1 ? "s" : ""}</span>
                <span style={{
                  padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700,
                  background: v.status === "Exposed" ? "rgba(255,69,98,0.10)" : "rgba(34,197,94,0.10)",
                  color: v.status === "Exposed" ? "#FF4562" : "#22C55E",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{v.status}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: t.text30, marginTop: 8, textAlign: "center" }}>
              Monitoring <strong style={{ color: t.text }}>3</strong> / <strong style={{ color: "#F59E0B" }}>5</strong> VIP slots ·{" "}
              <span style={{ color: "#3B82F6", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/vip-monitoring")}>Add VIPs →</span>
            </div>
          </div>

          {/* B5 — Stealer Exposure | Black Market */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="glass" style={{ padding: "12px 14px" }}>
              <div className="hfont" style={{ fontSize: 12, fontWeight: 700, marginBottom: 7 }}>Stealer Exposure by Domain</div>
              {STEALER_EXPOSURE.map((s, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 9, color: t.text45,
                  borderBottom: i < STEALER_EXPOSURE.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span className="mono">{s.domain}</span>
                  <span className="mono" style={{ fontWeight: 700, color: t.text }}>{s.count}</span>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <span className="mono" style={{ fontSize: 9, color: "#3B82F6", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/domain-exposure")}>View All Domains →</span>
              </div>
            </div>
            <div className="glass" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
                <span className="hfont" style={{ fontSize: 12, fontWeight: 700 }}>Data on Sale Activity</span>
                <span className="mono" style={{ fontSize: 9, color: "#FF4562", fontWeight: 700, marginLeft: 8 }}>4 listings</span>
              </div>
              {BLACK_MARKET_LISTINGS.map((b, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", padding: "4px 0", fontSize: 9, color: t.text45, gap: 6,
                  borderBottom: i < BLACK_MARKET_LISTINGS.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span className="mono" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.asset}</span>
                  <span className="mono" style={{ fontWeight: 700, color: "#F59E0B" }}>{b.price}</span>
                  <span style={{
                    padding: "1px 6px", borderRadius: 3,
                    background: "rgba(34,197,94,0.10)", color: "#22C55E",
                    fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  }}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* B6 — PII Exposure */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>PII Exposure</span>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/pii-stealer-exposure")}>Details →</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {PII_EXPOSURE.map((p, i) => (
                <div key={i} className="glass" style={{ padding: "10px 6px", textAlign: "center" }}>
                  <div className="hfont" style={{ fontSize: 17, fontWeight: 800, color: p.color || t.text }}>{p.value}</div>
                  <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.10em", fontWeight: 700, marginTop: 3 }}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* B7 — Fraud Indicators */}
          <div className="glass" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Fraud Indicators</span>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/fraud-intelligence")}>View All →</span>
            </div>
            {FRAUD_INDICATORS.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 10,
                borderBottom: i < FRAUD_INDICATORS.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 5,
                  background: `${f.color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <FraudIcon name={f.iconKey} color={f.color} />
                </div>
                <span style={{ flex: 1, color: t.text50 }}>{f.label}</span>
                <span className="hfont" style={{ fontWeight: 800, color: f.color }}>{f.value}</span>
              </div>
            ))}
          </div>

          {/* B8 — Underground Mentions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Underground Mentions</span>
              <span className="mono" style={{ fontSize: 9, color: "#FF4562", fontWeight: 700, marginLeft: 8 }}>4 this week</span>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/telegram")}>All Mentions →</span>
            </div>
            {UNDERGROUND_MENTIONS.map((m, i) => (
              <div key={i} className="glass" style={{ padding: "9px 12px", marginBottom: 5 }}>
                <div className="mono" style={{ fontSize: 9, fontWeight: 700, color: "#3B82F6", marginBottom: 3 }}>
                  {m.source} · <span style={{ color: t.text35, fontWeight: 500 }}>{m.lang}</span>
                </div>
                <div style={{ fontSize: 10, color: t.text50, lineHeight: 1.5, marginBottom: 4 }}>
                  {m.excerpt.split(/\[em\]|\[\/em\]/).map((part, j) => j % 2 === 1
                    ? <em key={j} style={{ color: "#FF4562", fontStyle: "normal", fontWeight: 600 }}>{part}</em>
                    : <span key={j}>{part}</span>
                  )}
                </div>
                <div className="mono" style={{ fontSize: 9, color: t.text30 }}>
                  {m.time} · <span style={{ color: m.relevanceColor, fontWeight: 700 }}>{m.relevance} relevance</span>
                </div>
              </div>
            ))}
          </div>

          {/* B9 — Data Unique Identifiers */}
          <div>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Data Unique Identifiers</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {UNIQUE_IDS.map((u, i) => (
                <div key={i} className="glass" style={{ padding: "11px 6px", textAlign: "center" }}>
                  <div className="hfont" style={{ fontSize: 18, fontWeight: 800 }}>{u.value}</div>
                  <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.10em", fontWeight: 700, marginTop: 3 }}>{u.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────
             RIGHT COLUMN — GLOBAL (C1–C7)
             ─────────────────────────────────────── */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12, minWidth: 0,
          paddingLeft: 16, position: "relative",
        }}>
          {/* Vertical gradient divider */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 1,
            background: "linear-gradient(180deg, rgba(99,102,241,0.32), rgba(99,102,241,0.06), transparent)",
          }} />
          <HoverComment anchorKey="dashboard.global-intel" top={0} right={4} />
          {/* Column header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              padding: "4px 11px", borderRadius: 7,
              background: "rgba(99,102,241,0.12)", color: "#6366F1",
              fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
              fontFamily: "'JetBrains Mono', monospace",
            }}>GLOBAL</span>
            <span style={{ color: t.text45, fontSize: 11 }}>Dark Web Intelligence</span>
          </div>

          {/* C1 — Threat Actor Spotlight */}
          <div>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Threat Actor Spotlight</div>
            <div className="glass" style={{ padding: "12px 14px", border: "1px solid rgba(255,69,98,0.18)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="hfont" style={{ fontSize: 13, fontWeight: 800, color: "#FF4562" }}>{THREAT_SPOTLIGHT.name}</span>
                <span style={{
                  fontSize: 8, padding: "2px 7px", borderRadius: 3,
                  background: "rgba(51,65,85,0.25)", color: t.text40,
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                }}>{THREAT_SPOTLIGHT.badge}</span>
              </div>
              <div style={{ fontSize: 10, color: t.text50, lineHeight: 1.5, marginTop: 5 }}>{THREAT_SPOTLIGHT.description}</div>
              <div style={{ textAlign: "right", marginTop: 5 }}>
                <span className="mono" style={{ fontSize: 9, color: "#3B82F6", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/global-threats")}>Full Profile →</span>
              </div>
            </div>
          </div>

          {/* C2 — Dark Web News (3 cards) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Dark Web News</span>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/ransom-dark-web-news")}>Open Feed →</span>
            </div>
            {DW_NEWS.map((n, i) => (
              <div key={i} className="glass" style={{ padding: "8px 12px", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 3,
                    background: `${n.tagColor}1F`, color: n.tagColor,
                    fontSize: 8, fontWeight: 800, letterSpacing: "0.06em",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{n.tag}</span>
                  <span className="mono" style={{ fontSize: 8, color: t.text30 }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 500, color: t.text50, marginTop: 4, lineHeight: 1.4 }}>{n.headline}</div>
              </div>
            ))}
          </div>

          {/* C3 — Ransomware Activity */}
          <div className="glass" style={{ padding: "12px 14px" }}>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 7 }}>Ransomware Activity</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span className="hfont" style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{RANSOM_ACTIVITY.victims}</span>
              <span style={{ fontSize: 9, color: t.text40 }}>{RANSOM_ACTIVITY.context}</span>
              <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: "#22C55E", marginLeft: "auto" }}>{RANSOM_ACTIVITY.trend}</span>
            </div>
            {RANSOM_ACTIVITY.stats.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 10,
                borderBottom: i < RANSOM_ACTIVITY.stats.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <span style={{ color: t.text50 }}>{s.label}</span>
                <span className="mono" style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* C4 — Industry Attack Heatmap */}
          <div>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Industry Attack Heatmap</div>
            <div className="glass" style={{ padding: "12px 14px" }}>
              {INDUSTRY_HEAT.map((r, i) => {
                const max = INDUSTRY_HEAT[0].count;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 9, color: t.text50 }}>
                    <span style={{ width: 86, flexShrink: 0 }}>{r.sector}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden", background: t.bgInput }}>
                      <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: r.color, borderRadius: 3 }} />
                    </div>
                    <span className="mono" style={{ width: 28, textAlign: "right", fontWeight: 700, color: t.text }}>{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C5 — Most Active Groups */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Most Active Groups</span>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/global-threats")}>All →</span>
            </div>
            <div className="glass" style={{ padding: "12px 14px" }}>
              {ACTIVE_GROUPS.map((g, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", padding: "5px 0", fontSize: 10, gap: 8,
                  borderBottom: i < ACTIVE_GROUPS.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.dot, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: t.text }}>{g.name}</span>
                  <span className="mono" style={{ fontSize: 8, color: t.text30 }}>{g.region}</span>
                  <span className="mono" style={{ fontWeight: 800, color: g.countColor }}>{g.hits}</span>
                </div>
              ))}
            </div>
          </div>

          {/* C6 — Telegram Chatter */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Telegram Chatter</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" style={{ marginLeft: 5 }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/telegram")}>Open →</span>
            </div>
            {TG_CHATTER.map((m, i) => (
              <div key={i} className="glass" style={{ padding: "8px 11px", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: "#22D3EE" }}>{m.channel}</span>
                  <span className="mono" style={{ fontSize: 8, color: t.text30 }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 9, color: t.text50, lineHeight: 1.45, marginTop: 3 }}>{m.text}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                  {m.tags.map((tag, j) => (
                    <span key={j} style={{
                      padding: "1px 6px", borderRadius: 3,
                      background: "rgba(255,255,255,0.04)", color: t.text40,
                      fontSize: 7, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* C7 — IAB Activity */}
          <div className="glass" style={{ padding: "12px 14px" }}>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 7 }}>Initial Access Broker Activity</div>
            {IAB_ACTIVITY.stats.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 10,
                borderBottom: i < IAB_ACTIVITY.stats.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <span style={{ color: t.text50 }}>{s.label}</span>
                <span className="mono" style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
            <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 5 }}>{IAB_ACTIVITY.context}</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DARK WEB SEARCH ENGINE (full-width, bottom)
          ═══════════════════════════════════════ */}
      <div className="glass" style={{
        padding: "16px 22px",
        display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(255,69,98,0.10)", border: "1px solid rgba(255,69,98,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <span className="hfont" style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
            Dark Web <span style={{ color: "#FF4562", fontStyle: "italic" }}>Search Engine</span>
          </span>
        </div>
        <input
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search keywords, domains, IPs, emails, hashes..."
          style={{
            flex: 1, padding: "11px 14px",
            background: t.bgInput, border: `1px solid ${t.borderLight}`,
            borderRadius: 8, color: t.text, fontSize: 11,
            fontFamily: "'Inter', sans-serif", outline: "none",
          }}
          onKeyDown={e => { if (e.key === "Enter" && searchValue.trim()) navigate("/dark-web-search"); }}
        />
        <button
          onClick={() => navigate("/dark-web-search")}
          style={{
            padding: "11px 24px", borderRadius: 8, border: "none",
            background: "#FF4562", color: "#fff",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 12px rgba(255,69,98,0.25)",
          }}
        >Search</button>
      </div>
    </div>
  );
}
