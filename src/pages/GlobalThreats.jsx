import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { WORLD_PATHS } from "../data/worldMapPaths";

// ── Country code → name mapping ──
const COUNTRY_NAMES = {
  US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France", NL: "Netherlands",
  CH: "Switzerland", CZ: "Czech Republic", CN: "China", RU: "Russia", KP: "North Korea",
  IR: "Iran", IN: "India", TH: "Thailand", AR: "Argentina", UY: "Uruguay", BR: "Brazil",
  JP: "Japan", KR: "South Korea", AU: "Australia", CA: "Canada", MX: "Mexico", TR: "Turkey",
  SA: "Saudi Arabia", AE: "UAE", IL: "Israel", PK: "Pakistan", PH: "Philippines", ID: "Indonesia",
  NG: "Nigeria", ZA: "South Africa", EG: "Egypt", KE: "Kenya", SE: "Sweden", NO: "Norway",
  FI: "Finland", PL: "Poland", UA: "Ukraine", RO: "Romania", ES: "Spain", IT: "Italy",
  PT: "Portugal", GR: "Greece", AT: "Austria", BE: "Belgium", DK: "Denmark", IE: "Ireland",
  CO: "Colombia", PE: "Peru", CL: "Chile", VE: "Venezuela", EC: "Ecuador", MY: "Malaysia",
  SG: "Singapore", VN: "Vietnam", BD: "Bangladesh", LK: "Sri Lanka", MM: "Myanmar",
  TW: "Taiwan", HK: "Hong Kong", NZ: "New Zealand",
};

// Build reverse lookup: name → code
const NAME_TO_CODE = {};
Object.entries(COUNTRY_NAMES).forEach(([code, name]) => { NAME_TO_CODE[name.toLowerCase()] = code; });

function getCountryName(code) { return COUNTRY_NAMES[code] || code; }

// ── Dummy Data (with country codes for filtering) ──

const DW_NEWS = [
  { id: 1, title: "The Alleged Database of JPMorgan Securities is on Sale", desc: "In a hacker forum monitored by SOCRadar, a new alleged database sale is detected for JPMorgan Securities.", date: "03 Apr 2026", tags: ["Thailand", "South-eastern Asia", "Finance", "Banking"], type: "Dark Web News", countries: ["TH"] },
  { id: 2, title: "The Alleged Database of the Provincial Department of Education is on Sale", desc: "In a hacker forum monitored by SOCRadar, a new alleged database sale is detected for the Provincial Department of Education.", date: "03 Apr 2026", tags: ["Argentina", "Education", "Government"], type: "Dark Web News", countries: ["AR"] },
  { id: 3, title: "The Alleged Database of Páginas Amarillas Uruguay is on Sale", desc: "In a hacker forum monitored by SOCRadar, a new alleged database sale is detected for Páginas Amarillas Uruguay.", date: "03 Apr 2026", tags: ["Uruguay", "South America", "Directory"], type: "Dark Web News", countries: ["UY"] },
  { id: 4, title: "Alleged Unauthorized Access Sale for a Dutch Software Company", desc: "An unauthorized network access sale is detected allegedly belonging to a software solutions company in the Netherlands.", date: "03 Apr 2026", tags: ["Netherlands", "Europe", "Software"], type: "Dark Web News", countries: ["NL"] },
  { id: 5, title: "Alleged Database of a Major Telecom Provider Listed on Dark Web", desc: "A database allegedly containing customer records of a telecommunications provider has been listed for sale.", date: "02 Apr 2026", tags: ["India", "Telecom", "Asia"], type: "Dark Web News", countries: ["IN"] },
  { id: 6, title: "US Federal Agency Employee Data Leaked on Hacking Forum", desc: "A dataset containing employee records from a US federal agency has appeared on a prominent hacking forum.", date: "02 Apr 2026", tags: ["United States", "Government", "Data Leak"], type: "Dark Web News", countries: ["US"] },
  { id: 7, title: "German Manufacturing Firm Access Credentials for Sale", desc: "Network access credentials for a German manufacturing company are being offered on a dark web marketplace.", date: "01 Apr 2026", tags: ["Germany", "Manufacturing", "Access Sale"], type: "Dark Web News", countries: ["DE"] },
];

const RANSOM_NEWS = [
  { id: 1, title: "The New Ransomware Victim of AiLock: Berning & Söhne GmbH", desc: "In the AiLock ransomware group website monitored by SOCRadar, a new ransomware victim allegedly announced.", date: "03 Apr 2026", tags: ["United States", "Germany", "Manufacturing"], type: "Ransomware News", countries: ["US", "DE"] },
  { id: 2, title: "The New Ransomware Victim of AiLock: Piet Vijverberg", desc: "In the AiLock ransomware group website monitored by SOCRadar, a new ransomware victim allegedly announced.", date: "03 Apr 2026", tags: ["Netherlands", "Services"], type: "Ransomware News", countries: ["NL"] },
  { id: 3, title: "The New Ransomware Victim of ALP-001: artmotion.net", desc: "In the ALP-001 ransomware group website monitored by SOCRadar, a new ransomware victim allegedly announced.", date: "03 Apr 2026", tags: ["Switzerland", "Technology"], type: "Ransomware News", countries: ["CH"] },
  { id: 4, title: "Phorpiex Botnet Fuels Ransomware, Sextortion, and Crypto-Theft Attacks", desc: "Hackers are abusing the long-running Phorpiex botnet to distribute ransomware payloads across multiple sectors.", date: "03 Apr 2026", tags: ["Global", "Botnet", "Crypto"], type: "Ransomware News", countries: [] },
  { id: 5, title: "The New Ransomware Victim of ALP-001: asseco-ce.com", desc: "In the ALP-001 ransomware group website monitored by SOCRadar, a new ransomware victim allegedly announced.", date: "03 Apr 2026", tags: ["Czech Republic", "Technology"], type: "Ransomware News", countries: ["CZ"] },
  { id: 6, title: "UK Retail Chain Hit by Play Ransomware Group", desc: "A major UK retail chain has been listed as a victim on the Play ransomware group's leak site.", date: "02 Apr 2026", tags: ["United Kingdom", "Retail"], type: "Ransomware News", countries: ["GB"] },
];

const THREAT_ACTORS = [
  { name: "APT 41", rank: 2, country: "CN", targetsYou: false },
  { name: "Stone Panda", rank: 3, country: "CN", targetsYou: false },
  { name: "Lazarus Group", rank: 5, country: "KP", targetsYou: true, targetReason: "Targets fintech" },
  { name: "Cleaver", rank: 8, country: "IR", targetsYou: false },
  { name: "MuddyWater", rank: 11, country: "IR", targetsYou: false },
  { name: "Fancy Bear", rank: 4, country: "RU", targetsYou: false },
  { name: "Cozy Bear", rank: 6, country: "RU", targetsYou: true, targetReason: "Active in your region" },
];

const RANSOM_GROUPS = [
  { name: "Hunters", rank: 2, country: "RU", targetsYou: false },
  { name: "el dorado", rank: 4, country: "RU", targetsYou: false },
  { name: "bianlian", rank: 5, country: "RU", targetsYou: true, targetReason: "Targets finance" },
  { name: "Play Ransomware", rank: 7, country: "RU", targetsYou: false },
  { name: "lockbit", rank: 8, country: "RU", targetsYou: true, targetReason: "Targets finance · your region" },
];

const RECENT_VICTIMS = [
  { company: "Axions", country: "US", flag: "\u{1F1FA}\u{1F1F8}", date: "01 Apr 2026" },
  { company: "AstraZeneca", country: "GB", flag: "\u{1F1EC}\u{1F1E7}", date: "31 Mar 2026" },
  { company: "Microsoft", country: "US", flag: "\u{1F1FA}\u{1F1F8}", date: "31 Mar 2026" },
  { company: "The Co-operative", country: "GB", flag: "\u{1F1EC}\u{1F1E7}", date: "31 Mar 2026" },
  { company: "Aqua Security", country: "US", flag: "\u{1F1FA}\u{1F1F8}", date: "27 Mar 2026" },
  { company: "Berning GmbH", country: "DE", flag: "\u{1F1E9}\u{1F1EA}", date: "03 Apr 2026" },
  { company: "artmotion.net", country: "CH", flag: "\u{1F1E8}\u{1F1ED}", date: "03 Apr 2026" },
];

const TOP_VULNS = [
  { cve: "CVE-2026-34159", cvss: 9.8, svrs: 84, countries: ["US", "CN"] },
  { cve: "CVE-2026-20093", cvss: 9.8, svrs: 87, countries: ["RU", "IR"] },
  { cve: "CVE-2026-29014", cvss: 9.5, svrs: 86, countries: ["DE", "NL"] },
  { cve: "CVE-2026-4370", cvss: 10, svrs: 87, countries: ["CN", "KP"] },
  { cve: "CVE-2026-5281", cvss: 8.8, svrs: 82, countries: ["US", "GB"] },
];

// ── User profile (would normally come from Settings → Account) ──
const USER_PROFILE = {
  country: { code: "TR", label: "Turkey" },
  industry: { value: "finance", label: "Finance" },
  region: { value: "europe-mena", label: "Europe / MENA" },
};

// ── Search-bar suggestions (grouped, click to add as chip) ──
const SUGGESTIONS = {
  Country: [
    "US", "GB", "DE", "FR", "IT", "ES", "NL", "CH", "TR", "RU",
    "CN", "KP", "IR", "IL", "IN", "BR", "AR", "MX", "CA", "AU",
    "JP", "KR", "SG", "AE", "SA", "ZA", "NG", "EG",
  ].map(code => ({ type: "country", value: code, label: COUNTRY_NAMES[code] || code })),
  Industry: ["Finance", "Healthcare", "Manufacturing", "Government", "Retail", "Education", "Energy", "Telecom", "Technology", "Defense", "Transportation", "Banking"].map(n => ({ type: "industry", value: n.toLowerCase(), label: n })),
  Region: [
    { value: "europe-mena", label: "Europe / MENA" },
    { value: "europe", label: "Europe" },
    { value: "north-america", label: "North America" },
    { value: "apac", label: "Asia-Pacific" },
    { value: "mena", label: "Middle East & N. Africa" },
    { value: "latam", label: "Latin America" },
    { value: "sub-saharan", label: "Sub-Saharan Africa" },
  ].map(r => ({ type: "region", value: r.value, label: r.label })),
  Actor: ["APT 41", "Stone Panda", "Lazarus Group", "Cleaver", "MuddyWater", "Fancy Bear", "Cozy Bear", "LockBit 4.0", "Akira", "BlackCat/ALPHV", "Cl0p", "Play", "Hunters", "el dorado", "bianlian", "FIN8 spinoff", "Storm-2050"].map(n => ({ type: "actor", value: n.toLowerCase().replace(/\s+/g, "-"), label: n })),
  CVE: ["CVE-2026-34159", "CVE-2026-20093", "CVE-2026-29014", "CVE-2026-4370", "CVE-2026-5281"].map(c => ({ type: "cve", value: c, label: c })),
  Source: ["Telegram", "BreachForums", "XSS Forum", "Russian Market", "Dark Forums", "Pastebin", "Genesis Market", "FreshTools"].map(s => ({ type: "source", value: s.toLowerCase().replace(/\s+/g, "-"), label: s })),
};
const SUGGESTION_GROUPS = ["Country", "Industry", "Region", "Actor", "CVE", "Source"];

const CHIP_COLOR = {
  country: "#FF4562",
  industry: "#F59E0B",
  region: "#22D3EE",
  actor: "#A855F7",
  cve: "#3B82F6",
  source: "#22C55E",
  keyword: "#94A3B8",
};

// ── Layer 5 fixtures: Telegram Intelligence ──
const TG_MESSAGES = [
  { id: 1, channel: "DarkForums_chat", time: "2h ago", text: 'New batch of [em]banking sector SSO credentials[/em] ready — 12K records, fresh from stealer campaign targeting European financial institutions...', tags: [["Banking", "red"], ["Credentials", "amber"], ["SSO", "indigo"], ["Europe", "cyan"]] },
  { id: 2, channel: "RansomWatch", time: "3h ago", text: '"ALPHV/BlackCat has posted proof-of-data for the US healthcare breach. Sample includes [em]patient records[/em], insurance details, SSNs. Deadline set for 72h..."', tags: [["Ransomware", "red"], ["Healthcare", "amber"], ["PII", "green"]] },
  { id: 3, channel: "IntelBroker_Feed", time: "5h ago", text: '"Selling [em]RDP access to Turkish bank[/em] infrastructure. Verified yesterday. Citrix + VPN combo. Starting at $800..."', tags: [["IAB", "red"], ["Turkey", "cyan"], ["Banking", "amber"]] },
  { id: 4, channel: "CyberUnderground", time: "6h ago", text: '"Iran-linked group claiming new [em]zero-day in Fortinet[/em] products. PoC demo shared in private channel. Asking 15 BTC..."', tags: [["Zero-Day", "red"], ["Iran", "indigo"], ["Vulnerability", "amber"]] },
  { id: 5, channel: "DarkForums_chat", time: "8h ago", text: '"[em]Insider offering access[/em] to Fortune 500 manufacturing company. Claims admin-level credentials. Payment in Monero only..."', tags: [["Insider Threat", "red"], ["Manufacturing", "amber"]] },
];

const TG_TRENDING = [
  { name: "Iran-Israel War", count: 342, delta: 67, spark: [4, 6, 5, 8, 7, 11, 14], active: true, isPreset: true },
  { name: "Operation: EpicFury", count: 128, delta: 340, spark: [2, 2, 3, 4, 8, 12, 14], isPreset: true },
  { name: "Ransomware", count: 2891, delta: 12, spark: [10, 11, 9, 12, 11, 12, 13], isPreset: true },
  { name: "Insider Threat", count: 87, delta: 23, spark: [6, 5, 7, 6, 8, 9, 10], isPreset: true },
  { name: "Zero-Day Market", count: 56, delta: 8, spark: [8, 7, 9, 8, 8, 9, 9], isPreset: true },
  { name: "Fortinet CVE", count: 34, delta: 890, spark: [1, 1, 2, 2, 3, 8, 14], isPreset: false },
];

// ── Layer 6 fixtures: Industry attack heatmap + correlation flows ──
const HEATMAP = {
  industries: ["FINANCE", "HEALTH", "MANUFACT.", "GOV", "RETAIL", "EDUCATION"],
  attackTypes: ["Ransomware", "Data Breach", "Access Sale", "DDoS", "Phishing"],
  matrix: [
    [287, 312, 243, 198, 145, 89],
    [345, 189, 156, 134, 201, 67],
    [198, 112, 187, 78, 56, 23],
    [134, 45, 67, 178, 34, 112],
    [412, 234, 123, 89, 267, 156],
  ],
};
function heatmapTier(v) { if (v >= 280) return "hot"; if (v >= 180) return "warm"; if (v >= 100) return "med"; if (v >= 50) return "cool"; return "cold"; }

// Correlation flows (Actor → CVE → Industry) — simplified canvas-friendly model
const CORRELATION = {
  actors: [
    { id: "lockbit", label: "LockBit 4.0", color: "#FF4562" },
    { id: "akira", label: "Akira", color: "#EA580C" },
    { id: "fancy", label: "Fancy Bear", color: "#A855F7" },
    { id: "apt41", label: "APT 41", color: "#3B82F6" },
  ],
  cves: [
    { id: "cve-34159", label: "CVE-2026-34159", color: "#F59E0B" },
    { id: "cve-29014", label: "CVE-2026-29014", color: "#F59E0B" },
    { id: "cve-4370", label: "CVE-2026-4370", color: "#F59E0B" },
    { id: "cve-5281", label: "CVE-2026-5281", color: "#F59E0B" },
  ],
  industries: [
    { id: "finance", label: "Finance", color: "#22C55E" },
    { id: "health", label: "Healthcare", color: "#22D3EE" },
    { id: "manuf", label: "Manufacturing", color: "#3B82F6" },
    { id: "gov", label: "Government", color: "#A855F7" },
  ],
  links: [
    { source: "lockbit", target: "cve-34159", value: 45 },
    { source: "lockbit", target: "cve-29014", value: 28 },
    { source: "akira", target: "cve-29014", value: 22 },
    { source: "akira", target: "cve-4370", value: 18 },
    { source: "fancy", target: "cve-5281", value: 31 },
    { source: "apt41", target: "cve-34159", value: 14 },
    { source: "apt41", target: "cve-4370", value: 19 },
    { source: "cve-34159", target: "finance", value: 38 },
    { source: "cve-34159", target: "manuf", value: 21 },
    { source: "cve-29014", target: "finance", value: 28 },
    { source: "cve-29014", target: "health", value: 22 },
    { source: "cve-4370", target: "gov", value: 25 },
    { source: "cve-4370", target: "manuf", value: 12 },
    { source: "cve-5281", target: "finance", value: 18 },
    { source: "cve-5281", target: "health", value: 13 },
  ],
};

// ── Layer 7 fixtures ──
const IAB_STATS = [
  { label: "RDP Access", count: 89, color: "#FF4562" },
  { label: "VPN Access", count: 67, color: "#F59E0B" },
  { label: "Citrix / RD Gateway", count: 43, color: "#F59E0B" },
  { label: "Web Shell", count: 28, color: "#3B82F6" },
  { label: "SSH Access", count: 20, color: "#3B82F6" },
];
const STEALER_FAMILIES = [
  { name: "RedLine", share: 34, count: "12.4K", color: "#FF4562" },
  { name: "Raccoon v2", share: 21, count: "7.8K", color: "#F59E0B" },
  { name: "Vidar", share: 18, count: "6.5K", color: "#F59E0B" },
  { name: "Lumma", share: 12, count: "4.3K", color: "#3B82F6" },
  { name: "Stealc", share: 8, count: "2.9K", color: "#22C55E" },
];
const INSIDER_POSTS = [
  { title: '"Admin access to F500 manufacturer"', source: "BreachForums", time: "2d ago", price: "$5,000", industry: "Manufacturing", color: "#FF4562" },
  { title: '"Bank employee selling customer DB"', source: "Telegram", time: "3d ago", price: "$12,000", industry: "Finance", color: "#F59E0B" },
  { title: '"Healthcare system creds, admin level"', source: "XSS Forum", time: "5d ago", price: "$3,500", industry: "Healthcare", color: "#3B82F6" },
  { title: '"Gov contractor offering classified docs"', source: "DarkForums", time: "1w ago", price: "$25,000", industry: "Government", color: "#FF4562" },
];

// ── Hotspots & pulse dots ──
const HOTSPOTS = [
  { cx: 420, cy: 310, r: 50, grad: "hotspot1" },
  { cx: 990, cy: 220, r: 40, grad: "hotspot2" },
  { cx: 1300, cy: 340, r: 35, grad: "hotspot1" },
  { cx: 1550, cy: 230, r: 55, grad: "hotspot1" },
  { cx: 1050, cy: 570, r: 30, grad: "hotspot3" },
  { cx: 520, cy: 700, r: 28, grad: "hotspot2" },
];
const PULSE_DOTS = [[420,310],[990,220],[1550,230],[1300,340],[520,700]];

// ── World Map ──
function WorldMap({ hoveredCountry, selectedCountry, onHover, onSelect, t }) {
  return (
    <svg viewBox="0 0 2000 1001" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="hotspot1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hotspot2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hotspot3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CA8A04" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Ocean/water background */}
      <rect width="2000" height="1001" fill="rgba(59,130,246,0.015)" rx="8" />

      {/* Country outlines with hover/select */}
      <g>
        {WORLD_PATHS.map(c => {
          const isHovered = hoveredCountry === c.id;
          const isSelected = selectedCountry === c.id;
          return (
            <path
              key={c.id}
              d={c.d}
              fill={isSelected ? "rgba(255,69,98,0.25)" : isHovered ? "rgba(255,69,98,0.12)" : (t?.bgHover || "rgba(255,255,255,0.04)")}
              stroke={isSelected ? "#FF4562" : isHovered ? "rgba(255,69,98,0.5)" : (t?.borderMed || "rgba(255,255,255,0.08)")}
              strokeWidth={isSelected ? 1.5 : isHovered ? 0.8 : 0.6}
              style={{ cursor: "pointer", transition: "fill 0.2s, stroke 0.2s", filter: isSelected ? "url(#glow)" : "none" }}
              onMouseEnter={() => onHover(c.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(c.id === selectedCountry ? null : c.id)}
            />
          );
        })}
      </g>

      {/* Threat hotspots */}
      {HOTSPOTS.map((h, i) => (
        <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={`url(#${h.grad})`} style={{ pointerEvents: "none" }} />
      ))}

      {/* Pulsing dots */}
      {PULSE_DOTS.map(([cx, cy], i) => (
        <g key={i} style={{ pointerEvents: "none" }}>
          <circle cx={cx} cy={cy} r="5" fill="#DC2626" opacity="0.9">
            <animate attributeName="r" values="5;12;5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r="3" fill="#fff" opacity="0.8" />
        </g>
      ))}

      {/* Grid lines */}
      {[200,400,600,800].map(y => <line key={y} x1="0" y1={y} x2="2000" y2={y} stroke={t?.borderRow || "rgba(255,255,255,0.025)"} style={{ pointerEvents: "none" }} />)}
      {[400,800,1200,1600].map(x => <line key={x} x1={x} y1="0" x2={x} y2="1001" stroke={t?.borderRow || "rgba(255,255,255,0.025)"} style={{ pointerEvents: "none" }} />)}

      {/* Equator line */}
      <line x1="0" y1="500" x2="2000" y2="500" stroke={t?.borderSection || "rgba(255,255,255,0.04)"} strokeDasharray="8 4" style={{ pointerEvents: "none" }} />
    </svg>
  );
}

// ── News Card ──
function NewsCard({ item, isActive, onClick, t }) {
  const typeColor = item.type === "Dark Web News" ? "#FF4562" : "#A855F7";
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
        borderLeft: isActive ? `3px solid ${typeColor}` : "3px solid transparent",
        background: isActive ? t.bgInput : "transparent",
        borderBottom: `1px solid ${t.borderSection}`,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.bgCard; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{
          width: 80, height: 56, borderRadius: 6, flexShrink: 0,
          background: t.bgHover, border: `1px solid ${t.borderLight}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 600, background: typeColor + "18", color: typeColor, marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>{item.type}</div>
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4, color: t.text70, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</div>
          <div className="mono" style={{ fontSize: 9, color: t.text25 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {item.date}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rank Badge ──
function RankBadge({ rank }) {
  const bg = rank <= 3 ? "rgba(220,38,38,0.15)" : rank <= 6 ? "rgba(234,88,12,0.12)" : "rgba(59,130,246,0.1)";
  const color = rank <= 3 ? "#DC2626" : rank <= 6 ? "#EA580C" : "#3B82F6";
  return (
    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: bg, color, fontFamily: "'JetBrains Mono',monospace" }}>
      Rank: {rank}
    </span>
  );
}

// ── Filter helper ──
function filterByCountry(items, code, key = "country") {
  if (!code) return items;
  return items.filter(item => {
    if (Array.isArray(item.countries)) return item.countries.includes(code);
    if (item[key]) return item[key] === code;
    return true;
  });
}

// ═══════════════════════════════════════
export default function GlobalThreats() {
  const { t, mode } = useTheme();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [newsTab, setNewsTab] = useState("darkweb");
  const [activeDW, setActiveDW] = useState(0);
  const [activeRansom, setActiveRansom] = useState(0);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedActor, setExpandedActor] = useState("APT 41"); // first actor expanded by default per wireframe
  // Layer 1 — Sticky Filter Bar
  const [contextPill, setContextPill] = useState("all"); // all | mycountry | myindustry | myregion
  const [timePreset, setTimePreset] = useState("ytd"); // ytd | quarter | month | year
  const [savedSlots, setSavedSlots] = useState([
    { id: 1, name: "Save 1", filled: true },
    { id: 2, name: "Save 2", filled: true },
  ]);
  // Layer 2 — Advanced search chips (single source of truth for filters)
  const [chips, setChips] = useState([]);
  // Search dropdown — ref + document listener for reliable click-outside
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef(null);
  useEffect(() => {
    if (!searchOpen) return;
    function onDocPointerDown(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
    };
  }, [searchOpen]);

  // Derive filter values from chips so chips are the single source of truth
  const selectedCountry = chips.find(c => c.type === "country")?.value || null;
  const selectedIndustry = chips.find(c => c.type === "industry")?.label || null;
  // Layer 5 — Telegram Intelligence
  const [tgKeyword, setTgKeyword] = useState("");
  const [tgChannel, setTgChannel] = useState("All Channels");
  const [tgLanguage, setTgLanguage] = useState("All Languages");
  const [tgChips, setTgChips] = useState(["Banking", "Credentials"]);
  const [activeTrend, setActiveTrend] = useState("Iran-Israel War");
  // Layer 6 — Correlation hover
  const [hoveredActor, setHoveredActor] = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  function removeChip(idx) { setChips(s => s.filter((_, i) => i !== idx)); }
  function removeTgChip(idx) { setTgChips(s => s.filter((_, i) => i !== idx)); }

  function addChip(chip) {
    setChips(s => {
      // Country / industry / region are single-select to keep filters coherent
      if (chip.type === "country" || chip.type === "industry" || chip.type === "region") {
        return [...s.filter(c => c.type !== chip.type), chip];
      }
      // Other types are multi-select but no exact dupes
      if (s.some(c => c.type === chip.type && c.value === chip.value)) return s;
      return [...s, chip];
    });
    setSearchQuery("");
    setSearchOpen(false);
    setActiveDW(0); setActiveRansom(0);
  }

  // Context pill → resync chips to user-profile defaults + on-screen filters
  function applyContext(id) {
    setContextPill(id);
    if (id === "all") {
      setChips([]);
    } else if (id === "mycountry") {
      setChips([{ type: "country", value: USER_PROFILE.country.code, label: USER_PROFILE.country.label }]);
    } else if (id === "myindustry") {
      setChips([{ type: "industry", value: USER_PROFILE.industry.value, label: USER_PROFILE.industry.label }]);
    } else if (id === "myregion") {
      setChips([{ type: "region", value: USER_PROFILE.region.value, label: USER_PROFILE.region.label }]);
    }
    setActiveDW(0); setActiveRansom(0);
  }

  // Filter suggestions by current input text
  const suggestionResults = SUGGESTION_GROUPS.map(group => {
    const items = SUGGESTIONS[group];
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? items.filter(it => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q))
      : items.slice(0, 6);
    return { group, items: filtered };
  }).filter(g => g.items.length > 0);

  const TIME_PRESETS = {
    ytd:     { label: "YTD",          start: "Jan 1, 2026",  end: "Apr 29, 2026" },
    quarter: { label: "Last Quarter", start: "Jan 29, 2026", end: "Apr 29, 2026" },
    month:   { label: "Last Month",   start: "Mar 29, 2026", end: "Apr 29, 2026" },
    year:    { label: "Last Year",    start: "Apr 29, 2025", end: "Apr 29, 2026" },
  };
  const currentRange = TIME_PRESETS[timePreset];

  // Map click toggles a country chip (so the map's selection IS the chip)
  const handleMapSelect = useCallback((code) => {
    if (!code) {
      setChips(s => s.filter(c => c.type !== "country"));
    } else {
      setChips(s => {
        const existing = s.find(c => c.type === "country");
        if (existing && existing.value === code) {
          return s.filter(c => c.type !== "country");
        }
        return [...s.filter(c => c.type !== "country"), { type: "country", value: code, label: getCountryName(code) }];
      });
    }
    setActiveDW(0); setActiveRansom(0);
  }, []);

  // Filtered data
  const filteredDW = filterByCountry(DW_NEWS, selectedCountry).filter(item => !selectedIndustry || item.tags.some(tag => tag.toLowerCase().includes(selectedIndustry.toLowerCase())));
  const filteredRansom = filterByCountry(RANSOM_NEWS, selectedCountry).filter(item => !selectedIndustry || item.tags.some(tag => tag.toLowerCase().includes(selectedIndustry.toLowerCase())));
  const filteredActors = filterByCountry(THREAT_ACTORS, selectedCountry);
  const filteredVulns = filterByCountry(TOP_VULNS, selectedCountry);
  const filteredVictims = filterByCountry(RECENT_VICTIMS, selectedCountry);

  const activeNews = newsTab === "darkweb" ? filteredDW : filteredRansom;
  const activeIdx = newsTab === "darkweb" ? activeDW : activeRansom;
  const selectedNews = activeNews[Math.min(activeIdx, activeNews.length - 1)] || null;

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ LAYER 2: ADVANCED SEARCH (chips + freetext + autocomplete dropdown) ═══ */}
      <div ref={searchWrapRef} style={{
        position: "relative",
        zIndex: searchOpen ? 60 : "auto",
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div className="glass" style={{
          padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          border: searchOpen ? "1px solid rgba(255,69,98,0.32)" : undefined,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          {chips.map((ch, i) => {
            const chipColor = CHIP_COLOR[ch.type] || CHIP_COLOR.keyword;
            return (
              <span key={i} style={{
                padding: "3px 9px", borderRadius: 5,
                background: `${chipColor}14`, color: chipColor,
                border: `1px solid ${chipColor}38`,
                fontSize: 10, fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <span className="mono" style={{ fontSize: 7, opacity: 0.7, letterSpacing: "0.10em" }}>{ch.type.toUpperCase()}</span>
                {ch.label}
                <span onClick={() => removeChip(i)} style={{ cursor: "pointer", fontSize: 12, opacity: 0.7 }}>×</span>
              </span>
            );
          })}
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={e => {
              if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); e.currentTarget.blur(); }
              if (e.key === "Backspace" && !searchQuery && chips.length > 0) {
                setChips(s => s.slice(0, -1));
              }
            }}
            placeholder={chips.length === 0 ? "Click to add a country, industry, region, actor, CVE…" : "Add another filter…"}
            style={{
              flex: 1, minWidth: 220, padding: "5px 6px",
              background: "transparent", border: "none",
              color: t.text, fontSize: 11, fontFamily: "'Inter', sans-serif", outline: "none",
            }}
          />
          {chips.length > 0 && (
            <button onClick={() => { setChips([]); setContextPill("all"); }} style={{
              padding: "4px 10px", borderRadius: 5,
              border: `1px solid ${t.borderLight}`, background: "transparent",
              color: t.text45, fontSize: 9, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", flexShrink: 0,
            }}>Clear all</button>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {searchOpen && suggestionResults.length > 0 && (
          <div
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              // Solid opaque background — was bleeding through to heatmap below
              background: mode === "dark" ? "#0F1729" : "#FFFFFF",
              border: `1px solid ${t.borderMed}`, borderRadius: 10,
              maxHeight: 360, overflow: "auto",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)",
              zIndex: 80,
            }}
          >
            {suggestionResults.map(({ group, items }) => {
              const groupColor = CHIP_COLOR[group.toLowerCase()] || CHIP_COLOR.keyword;
              return (
                <div key={group} style={{ padding: "8px 12px", borderBottom: `1px solid ${t.borderRow}` }}>
                  <div className="mono" style={{
                    fontSize: 8, color: groupColor, letterSpacing: "0.14em", fontWeight: 700,
                    textTransform: "uppercase", marginBottom: 6,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: groupColor }} />
                    {group}
                    <span style={{ color: t.text25, marginLeft: 4 }}>· {items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {items.map(it => {
                      const isActive = chips.some(c => c.type === it.type && c.value === it.value);
                      return (
                        <button
                          key={it.value}
                          onClick={() => addChip(it)}
                          disabled={isActive}
                          style={{
                            padding: "4px 10px", borderRadius: 5,
                            border: `1px solid ${isActive ? `${groupColor}55` : t.borderLight}`,
                            background: isActive ? `${groupColor}12` : t.bgCard,
                            color: isActive ? groupColor : t.text60,
                            fontSize: 10, fontWeight: 600,
                            cursor: isActive ? "default" : "pointer",
                            fontFamily: "'Inter', sans-serif",
                            opacity: isActive ? 0.65 : 1,
                            display: "inline-flex", alignItems: "center", gap: 5,
                          }}
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = `${groupColor}10`; e.currentTarget.style.borderColor = `${groupColor}45`; e.currentTarget.style.color = groupColor; } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = t.bgCard; e.currentTarget.style.borderColor = t.borderLight; e.currentTarget.style.color = t.text60; } }}
                        >
                          {isActive && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                          {it.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "8px 12px", fontSize: 9, color: t.text35, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
              Click to add as filter chip · Esc to close · Backspace to remove last chip
            </div>
          </div>
        )}
      </div>

      {/* ═══ LAYER 1: STICKY FILTER BAR (Context + Time + Save slots) ═══ */}
      <div className="glass" style={{
        padding: "8px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        position: "sticky", top: 60, zIndex: 20,
        animation: loaded ? "fadeUp 0.6s 0.02s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginRight: 6 }}>CONTEXT</span>
          {[
            { id: "all", label: "All" },
            { id: "mycountry", label: `My Country (${USER_PROFILE.country.label})` },
            { id: "myindustry", label: `My Industry (${USER_PROFILE.industry.label})` },
            { id: "myregion", label: `My Region (${USER_PROFILE.region.label})` },
          ].map(p => {
            const active = contextPill === p.id;
            return (
              <button key={p.id} onClick={() => applyContext(p.id)} style={{
                padding: "5px 11px", borderRadius: 5,
                border: `1px solid ${active ? "rgba(255,69,98,0.32)" : t.borderLight}`,
                background: active ? "rgba(255,69,98,0.10)" : "transparent",
                color: active ? "#FF4562" : t.text45,
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}>{p.label}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 9, color: t.text45, padding: "4px 10px", background: t.bgInput, borderRadius: 5, border: `1px solid ${t.borderLight}`, fontWeight: 700 }}>
            <strong style={{ color: t.text }}>{currentRange.start}</strong>
            <span style={{ color: t.text25, margin: "0 6px" }}>—</span>
            <strong style={{ color: t.text }}>{currentRange.end}</strong>
          </span>
          {Object.entries(TIME_PRESETS).map(([id, p]) => {
            const active = timePreset === id;
            return (
              <button key={id} onClick={() => setTimePreset(id)} style={{
                padding: "5px 11px", borderRadius: 5,
                border: `1px solid ${active ? "rgba(255,69,98,0.32)" : t.borderLight}`,
                background: active ? "rgba(255,69,98,0.10)" : "transparent",
                color: active ? "#FF4562" : t.text45,
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}>{p.label}</button>
            );
          })}
          <span style={{ width: 1, height: 18, background: t.borderLight, margin: "0 4px" }} />
          {savedSlots.map(s => (
            <button key={s.id} style={{
              padding: "5px 11px", borderRadius: 5,
              border: `1px solid ${t.borderLight}`,
              background: s.filled ? "rgba(99,102,241,0.10)" : "transparent",
              color: s.filled ? "#6366F1" : t.text40,
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}>{s.name}</button>
          ))}
          <button style={{
            padding: "5px 11px", borderRadius: 5,
            border: `1px dashed ${t.borderLight}`, background: "transparent",
            color: t.text40, fontSize: 10, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}>+ Save</button>
        </div>
      </div>

      {/* ═══ v2 §3 — HEATMAP HERO + LIVE PULSE ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.08s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.20em", fontWeight: 700, marginBottom: 8 }}>GLOBAL THREAT TEMPERATURE</div>
        <div className="glass" style={{ padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Attack Distribution by Sector & Type</span>
            <span style={{ fontSize: 9, color: t.text30 }}>Click any cell to filter the page</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "100px repeat(6, 1fr)", gap: 3 }}>
            <div></div>
            {HEATMAP.industries.map(ind => (
              <div key={ind} className="mono" style={{
                fontSize: 7, color: t.text30, textAlign: "center", padding: 4,
                letterSpacing: "0.10em", fontWeight: 700,
              }}>{ind}</div>
            ))}
            {HEATMAP.attackTypes.map((at, ri) => (
              <Fragment key={at}>
                <div className="mono" style={{ fontSize: 9, color: t.text50, fontWeight: 600, display: "flex", alignItems: "center" }}>{at}</div>
                {HEATMAP.matrix[ri].map((v, ci) => {
                  const tier = heatmapTier(v);
                  const tierBg = {
                    hot:  "rgba(255,69,98,0.55)",
                    warm: "rgba(255,69,98,0.32)",
                    med:  "rgba(245,158,11,0.28)",
                    cool: "rgba(99,102,241,0.18)",
                    cold: "rgba(51,65,85,0.18)",
                  }[tier];
                  const tierColor = tier === "cool" || tier === "cold" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.95)";
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      title={`${HEATMAP.attackTypes[ri]} · ${HEATMAP.industries[ci]} · ${v}`}
                      onClick={() => addChip({ type: "industry", value: HEATMAP.industries[ci].toLowerCase().replace(/[^\w]/g, "-"), label: HEATMAP.industries[ci] })}
                      style={{
                        borderRadius: 4, height: 32,
                        background: tierBg, color: tierColor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700,
                        cursor: "pointer", transition: "transform 0.12s ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >{v}</div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        {/* Live Pulse stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { num: "312",   label: "Ransomware\nVictims",  trend: "▲ +28%", color: "#FF4562", trendColor: "#FF4562" },
            { num: "1,092", label: "Data\nBreaches",        trend: "▲ +15%", color: "#F59E0B", trendColor: "#F59E0B" },
            { num: "647",   label: "DDoS\nCampaigns",       trend: "▼ -8%",  color: t.text,   trendColor: "#22C55E" },
            { num: "247",   label: "IAB\nListings",         trend: "▲ +34%", color: "#F59E0B", trendColor: "#FF4562" },
          ].map((p, i) => (
            <div key={i} className="glass" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{p.num}</div>
              <div style={{ fontSize: 9, color: t.text45, lineHeight: 1.35, whiteSpace: "pre-line" }}>
                {p.label}
                <div className="mono" style={{ fontSize: 8, color: p.trendColor, fontWeight: 700, marginTop: 2 }}>{p.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ v2 §4 — GEO TARGETING (compact) + RANSOMWARE GROUPS (compact) ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.10s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Geographic Targeting</span>
            <span className="mono" style={{ fontSize: 10, color: "#3B82F6", marginLeft: "auto", cursor: "pointer", fontWeight: 600 }}>Full Map →</span>
          </div>
          {[
            { rank: "01", code: "US", name: "United States",  pct: "19.91%", width: "90%", color: "#FF4562" },
            { rank: "02", code: "FR", name: "France",          pct: "8.45%",  width: "45%", color: "#F59E0B" },
            { rank: "03", code: "IN", name: "India",           pct: "7.82%",  width: "40%", color: "#F59E0B" },
            { rank: "04", code: "DE", name: "Germany",         pct: "6.33%",  width: "32%", color: "#3B82F6" },
            { rank: "05", code: "UK", name: "United Kingdom",  pct: "5.98%",  width: "30%", color: "#3B82F6" },
          ].map((c, i) => (
            <div
              key={i}
              onClick={() => addChip({ type: "country", value: c.code, label: c.name })}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "5px 0",
                fontSize: 10, color: t.text50, cursor: "pointer",
                borderBottom: i < 4 ? `1px solid ${t.borderRow}` : "none",
              }}
            >
              <span className="mono" style={{ fontSize: 8, color: t.text25, width: 18 }}>{c.rank}</span>
              <span className="mono" style={{ fontSize: 9, color: t.text35, width: 22, fontWeight: 600 }}>{c.code}</span>
              <span style={{ flex: 1, fontWeight: 600, color: t.text }}>{c.name}</span>
              <div style={{ width: 60, height: 4, background: t.bgInput, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                <div style={{ width: c.width, height: "100%", background: c.color, borderRadius: 2 }} />
              </div>
              <span className="hfont" style={{ fontWeight: 700, width: 50, textAlign: "right" }}>{c.pct}</span>
            </div>
          ))}
        </div>
        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Ransomware Groups</span>
            <span className="mono" style={{
              fontSize: 8, padding: "2px 7px", borderRadius: 4,
              background: "rgba(34,197,94,0.10)", color: "#22C55E",
              fontWeight: 700, marginLeft: "auto",
            }}>7 active</span>
          </div>
          {[
            { rank: 1, name: "Akira",          pct: "8.35%", color: "#FF4562", bg: "rgba(255,69,98,0.10)" },
            { rank: 2, name: "LockBit 4.0",    pct: "7.91%", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
            { rank: 3, name: "BlackCat/ALPHV", pct: "6.44%", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
            { rank: 4, name: "Cl0p",           pct: "5.88%", color: t.text40,  bg: "rgba(51,65,85,0.18)"  },
            { rank: 5, name: "Play",           pct: "5.12%", color: t.text40,  bg: "rgba(51,65,85,0.18)"  },
          ].map((g, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "5px 0",
              fontSize: 10, borderBottom: i < 4 ? `1px solid ${t.borderRow}` : "none",
            }}>
              <span style={{
                width: 20, height: 16, borderRadius: 3,
                background: g.bg, color: g.color, fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{g.rank}</span>
              <span style={{ flex: 1, fontWeight: 600, color: t.text }}>{g.name}</span>
              <span className="hfont" style={{ fontWeight: 700, color: g.color, width: 50, textAlign: "right" }}>{g.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ v2 §5 — THREAT ACTORS (merged CVE chain) + RANSOMWARE TARGETS ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.12s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Threat Actors</span>
            <span style={{ fontSize: 9, color: t.text35, marginLeft: 8 }}>Click to expand CVE chain</span>
          </div>
          {filteredActors.map((a, i) => {
            const isOpen = expandedActor === a.name;
            const rankClass = a.rank <= 3 ? "hot" : a.rank <= 6 ? "warm" : "cool";
            const rankColor = rankClass === "hot" ? "#FF4562" : rankClass === "warm" ? "#F59E0B" : "#3B82F6";
            const rankBg = rankClass === "hot" ? "rgba(255,69,98,0.12)" : rankClass === "warm" ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.10)";
            // Pull this actor's CVE chain from CORRELATION (best-effort name match)
            const actorKey = a.name.toLowerCase().split(" ")[0];
            const cveLinks = CORRELATION.links
              .filter(l => CORRELATION.actors.some(ac => ac.id.toLowerCase().includes(actorKey) && ac.id === l.source))
              .slice(0, 3);
            return (
              <div
                key={i}
                onClick={() => setExpandedActor(isOpen ? null : a.name)}
                style={{
                  background: t.bgCard,
                  border: `1px solid ${isOpen ? "rgba(99,102,241,0.30)" : a.targetsYou ? "rgba(255,69,98,0.20)" : t.borderLight}`,
                  borderLeft: a.targetsYou ? "3px solid #FF4562" : `1px solid ${isOpen ? "rgba(99,102,241,0.30)" : t.borderLight}`,
                  borderRadius: 7, padding: "9px 14px", marginBottom: 4,
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                  <span className="mono" style={{ fontSize: 8, color: t.text30, width: 22 }}>{a.country}</span>
                  <span style={{ fontWeight: 700, flex: 1, color: t.text }}>{a.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 8, fontWeight: 700,
                    background: rankBg, color: rankColor,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>Rank: {a.rank}</span>
                  {a.targetsYou && (
                    <span title={a.targetReason} style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 8, fontWeight: 700,
                      background: "rgba(255,69,98,0.10)", color: "#FF4562",
                      border: "1px solid rgba(255,69,98,0.20)",
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
                    }}>TARGETS YOU</span>
                  )}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.18s ease" }}><path d="M9 18l6-6-6-6" /></svg>
                </div>
                {isOpen && (
                  <div style={{ paddingTop: 8, marginTop: 8, paddingLeft: 32, borderTop: `1px solid ${t.borderRow}` }}>
                    {cveLinks.length > 0 ? cveLinks.map((l, j) => {
                      const cve = CORRELATION.cves.find(c => c.id === l.target);
                      const indLinks = CORRELATION.links.filter(ll => ll.source === l.target).slice(0, 2);
                      const cvss = j === 0 ? "9.8" : j === 1 ? "10.0" : "8.5";
                      const cvssCrit = parseFloat(cvss) >= 9;
                      return (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", fontSize: 9, borderBottom: j < cveLinks.length - 1 ? `1px solid ${t.borderRow}` : "none" }}>
                          <span className="mono" style={{ fontWeight: 600, color: t.text }}>{cve?.label || l.target}</span>
                          <span style={{ color: t.text25 }}>→</span>
                          <span style={{
                            padding: "2px 6px", borderRadius: 3, fontSize: 7, fontWeight: 700,
                            background: cvssCrit ? "rgba(255,69,98,0.12)" : "rgba(245,158,11,0.12)",
                            color: cvssCrit ? "#FF4562" : "#F59E0B",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>CVSS {cvss}</span>
                          <span style={{ color: t.text25 }}>→</span>
                          {indLinks.map((il, k) => {
                            const ind = CORRELATION.industries.find(in_ => in_.id === il.target);
                            return (
                              <span key={k} style={{
                                padding: "2px 6px", borderRadius: 3, fontSize: 7, fontWeight: 700,
                                background: "rgba(99,102,241,0.10)", color: "#6366F1",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}>{ind?.label || il.target}</span>
                            );
                          })}
                        </div>
                      );
                    }) : (
                      <div style={{ fontSize: 9, color: t.text35, fontStyle: "italic" }}>No CVE chain data for this actor in current dataset.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Ransomware Targets</span>
            <span style={{ fontSize: 9, color: t.text35, marginLeft: 8 }}>Recent victims</span>
          </div>
          <div className="glass" style={{ padding: "12px 14px" }}>
            {filteredVictims.map((v, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", padding: "6px 0", fontSize: 10,
                borderBottom: i < filteredVictims.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <span style={{ flex: 1, fontWeight: 600, color: "#6366F1" }}>{v.company}</span>
                <span style={{ fontSize: 11, marginRight: 6 }}>{v.flag}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text30, marginRight: 12 }}>{v.country}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text35, width: 76, textAlign: "right" }}>{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ LAYER 5: TELEGRAM INTELLIGENCE (3-panel: filters / messages / trending) ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ padding: "14px 20px 10px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "#22D3EE", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>Telegram Intelligence</div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Live underground chatter</span>
          </div>
          <span className="mono" style={{ fontSize: 11, color: "#22D3EE", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/telegram")}>Open Telegram →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", minHeight: 380 }}>
          {/* LEFT — Filters */}
          <div style={{ padding: "14px 16px", borderRight: `1px solid ${t.borderSection}` }}>
            <div style={{ fontSize: 10, color: "#22D3EE", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              Filters
            </div>
            <input
              value={tgKeyword}
              onChange={e => setTgKeyword(e.target.value)}
              placeholder="Search keywords (AND, OR, NOT)…"
              style={{
                width: "100%", padding: "7px 10px",
                background: t.bgInput, border: `1px solid ${t.borderLight}`,
                borderRadius: 6, color: t.text, fontSize: 10,
                fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
              {tgChips.map((c, i) => (
                <span key={i} style={{
                  padding: "3px 8px", borderRadius: 4,
                  background: "rgba(34,211,238,0.12)", color: "#22D3EE",
                  fontSize: 9, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  {c}
                  <span onClick={() => removeTgChip(i)} style={{ cursor: "pointer", opacity: 0.7 }}>×</span>
                </span>
              ))}
            </div>
            {[
              { label: "CHANNEL", value: tgChannel, options: ["All Channels", "DarkForums_chat", "RansomWatch", "IntelBroker_Feed", "CyberUnderground"], set: setTgChannel },
              { label: "LANGUAGE", value: tgLanguage, options: ["All Languages", "English", "Russian", "Chinese", "Arabic", "Farsi"], set: setTgLanguage },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 4 }}>{f.label}</div>
                <select
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    width: "100%", padding: "6px 10px",
                    background: t.bgInput, border: `1px solid ${t.borderLight}`,
                    borderRadius: 6, color: t.text, fontSize: 10,
                    fontFamily: "'Inter', sans-serif", outline: "none", cursor: "pointer",
                  }}
                >
                  {f.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "8px 10px", borderRadius: 6, background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.18)", fontSize: 9, color: t.text50 }}>
              Showing <strong style={{ color: "#22D3EE" }}>1,247</strong> messages matching filters
            </div>
          </div>

          {/* MIDDLE — Message flow */}
          <div style={{ padding: "12px 16px", overflow: "auto", maxHeight: 450 }}>
            {TG_MESSAGES.map(m => (
              <div key={m.id} style={{
                background: t.bgCard, border: `1px solid ${t.borderLight}`,
                borderRadius: 7, padding: "10px 12px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: "#22D3EE" }}>{m.channel}</span>
                  <span className="mono" style={{ fontSize: 8, color: t.text35 }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 11, color: t.text60, lineHeight: 1.55, marginBottom: 6 }}>
                  {m.text.split(/\[em\]|\[\/em\]/).map((part, i) => i % 2 === 1
                    ? <em key={i} style={{ color: "#FF4562", fontStyle: "normal", fontWeight: 600 }}>{part}</em>
                    : <span key={i}>{part}</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {m.tags.map(([label, color], i) => {
                    const c = { red: "#FF4562", amber: "#F59E0B", indigo: "#6366F1", cyan: "#22D3EE", green: "#22C55E" }[color];
                    return (
                      <span key={i} style={{
                        padding: "1px 6px", borderRadius: 3,
                        background: `${c}14`, color: c,
                        fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      }}>{label}</span>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", padding: 8, color: t.text25, fontSize: 9 }}>Load more messages ↓</div>
          </div>

          {/* RIGHT — Trending topics */}
          <div style={{ padding: "12px 14px", borderLeft: `1px solid ${t.borderSection}`, overflow: "auto", maxHeight: 450 }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 5, color: t.text }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF4562" stroke="none"><path d="M13.5 0a4 4 0 0 1 4 4c0 1.5-.5 3-1.5 4 .5-2 0-4-1-5l-1.5-3zM12 8c2 0 4 2 4 4 0 3-3 5-3 8 0 1 .5 2 1 2.5-2 0-5-2-5-5 0-2 1-3.5 2-5 .5-1 1-2 1-4.5z" /></svg>
              Trending Topics
            </div>
            {TG_TRENDING.filter(tr => tr.isPreset).map(tr => {
              const active = activeTrend === tr.name;
              return (
                <div key={tr.name} onClick={() => setActiveTrend(active ? null : tr.name)} style={{
                  padding: "8px 10px", borderRadius: 6, marginBottom: 5,
                  background: active ? "rgba(255,69,98,0.06)" : t.bgCard,
                  border: `1px solid ${active ? "rgba(255,69,98,0.32)" : t.borderLight}`,
                  cursor: "pointer",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: active ? "#FF4562" : t.text, marginBottom: 4 }}>{tr.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 8, color: t.text40 }}>{tr.count.toLocaleString()} · ▲ {tr.delta}%</span>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 14 }}>
                      {tr.spark.map((v, i) => (
                        <span key={i} style={{
                          width: 3, height: v, borderRadius: 1,
                          background: i === tr.spark.length - 1 ? "#FF4562" : `rgba(255,69,98,${0.3 + (v / 14) * 0.4})`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${t.borderSection}` }}>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 5 }}>AUTO-DETECTED</div>
              {TG_TRENDING.filter(tr => !tr.isPreset).map(tr => (
                <div key={tr.name} style={{
                  padding: "8px 10px", borderRadius: 6, marginBottom: 5,
                  background: t.bgCard, border: `1px dashed ${t.borderLight}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 3 }}>{tr.name}</div>
                  <span className="mono" style={{ fontSize: 8, color: t.text40 }}>{tr.count} · ▲ {tr.delta}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* (v2: Layer 6 Heatmap+Correlation removed — heatmap is now hero, CVE chain merged into Threat Actors expandable rows) */}
      <div style={{ display: "none" }}>
        {/* HEATMAP */}
        <div className="glass" style={{ padding: "16px 18px" }}>
          <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Industry Attack Heatmap</div>
          <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: t.text }}>Attack Distribution by Sector & Type</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "100px repeat(6, 1fr)",
            gap: 3,
          }}>
            <div></div>
            {HEATMAP.industries.map(ind => (
              <div key={ind} className="mono" style={{
                fontSize: 7, color: t.text30, textAlign: "center", padding: 4,
                letterSpacing: "0.10em", fontWeight: 700,
              }}>{ind}</div>
            ))}
            {HEATMAP.attackTypes.map((at, ri) => (
              <Fragment key={at}>
                <div className="mono" style={{
                  fontSize: 9, color: t.text50, fontWeight: 600,
                  display: "flex", alignItems: "center",
                }}>{at}</div>
                {HEATMAP.matrix[ri].map((v, ci) => {
                  const tier = heatmapTier(v);
                  const tierBg = {
                    hot:  "rgba(255,69,98,0.50)",
                    warm: "rgba(255,69,98,0.30)",
                    med:  "rgba(245,158,11,0.25)",
                    cool: "rgba(99,102,241,0.15)",
                    cold: "rgba(51,65,85,0.15)",
                  }[tier];
                  const tierColor = tier === "cool" || tier === "cold" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.95)";
                  return (
                    <div key={`${ri}-${ci}`} title={`${HEATMAP.attackTypes[ri]} · ${HEATMAP.industries[ci]} · ${v}`} style={{
                      borderRadius: 4, height: 30,
                      background: tierBg, color: tierColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                      cursor: "pointer", transition: "transform 0.15s ease",
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >{v}</div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        {/* CORRELATION FLOW (Actor → CVE → Industry, simplified column-flow) */}
        <div className="glass" style={{ padding: "16px 18px" }}>
          <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Threat-Vulnerability Correlation</div>
          <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: t.text }}>Actor → CVE → Industry</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[
              { title: "Threat Actors", nodes: CORRELATION.actors, group: "actor" },
              { title: "CVEs", nodes: CORRELATION.cves, group: "cve" },
              { title: "Industries", nodes: CORRELATION.industries, group: "industry" },
            ].map(col => (
              <div key={col.group}>
                <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>{col.title.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {col.nodes.map(n => {
                    const isHovered = hoveredActor === n.id;
                    const isLinked = hoveredActor && CORRELATION.links.some(l =>
                      (l.source === hoveredActor && l.target === n.id) ||
                      (l.target === hoveredActor && l.source === n.id) ||
                      // 2-step: actor→cve→industry
                      CORRELATION.links.some(l2 => l2.source === hoveredActor && l2.target === l.source && l.target === n.id)
                    );
                    const dimmed = hoveredActor && !isHovered && !isLinked;
                    return (
                      <div
                        key={n.id}
                        onMouseEnter={() => setHoveredActor(n.id)}
                        onMouseLeave={() => setHoveredActor(null)}
                        style={{
                          padding: "7px 9px", borderRadius: 5,
                          background: isHovered ? `${n.color}25` : `${n.color}10`,
                          border: `1px solid ${isHovered ? n.color : `${n.color}30`}`,
                          color: n.color,
                          fontSize: 10, fontWeight: 700,
                          opacity: dimmed ? 0.25 : 1,
                          cursor: "pointer", textAlign: "center",
                          fontFamily: "'JetBrains Mono', monospace",
                          transition: "all 0.18s ease",
                        }}
                      >{n.label}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: t.text35, marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>
            Hover any node to highlight its full chain · {CORRELATION.links.length} connections tracked
          </div>
        </div>
      </div>

      {/* ═══ v2 §7 — LATEST ACTIVITY (moved up, was at end) ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.20em", fontWeight: 700, marginBottom: 8 }}>LATEST ACTIVITY</div>
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button className={`tab-btn ${newsTab === "darkweb" ? "on" : ""}`} onClick={() => { setNewsTab("darkweb"); setActiveDW(0); }}>Dark Web News</button>
              <button className={`tab-btn ${newsTab === "ransomware" ? "on" : ""}`} onClick={() => { setNewsTab("ransomware"); setActiveRansom(0); }}>Ransomware News</button>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "#FF4562", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/dark-web-news")}>View All →</span>
          </div>
          {activeNews.length > 0 ? (
            <div style={{ display: "flex", minHeight: 320 }}>
              <div style={{ width: 380, flexShrink: 0, borderRight: `1px solid ${t.borderSection}`, overflow: "auto", maxHeight: 380 }}>
                {activeNews.map((item, i) => (
                  <NewsCard key={item.id} item={item} isActive={activeIdx === i} onClick={() => newsTab === "darkweb" ? setActiveDW(i) : setActiveRansom(i)} t={t} />
                ))}
              </div>
              {selectedNews && (
                <div style={{ flex: 1, padding: "18px 22px" }}>
                  <h3 className="hfont" style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 6 }}>{selectedNews.title}</h3>
                  <div className="mono" style={{ fontSize: 9, color: t.text30, marginBottom: 10 }}>📅 {selectedNews.date}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                    {selectedNews.tags.map((tag, k) => (
                      <span key={k} style={{ padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 500, background: "rgba(99,102,241,0.10)", color: "#6366F1" }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 7, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.14)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(168,85,247,0.14)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#A855F7"><polygon points="12,2 14.5,9 22,9 16,14 18.5,22 12,17 5.5,22 8,14 2,9 9.5,9" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#A855F7", marginBottom: 3 }}>SOCRadar AI Insights</div>
                      <div style={{ fontSize: 9, color: t.text50, lineHeight: 1.55 }}>{selectedNews.desc}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "40px 20px", textAlign: "center", color: t.text25, fontSize: 13 }}>
              No {newsTab === "darkweb" ? "dark web" : "ransomware"} news for {getCountryName(selectedCountry)}
            </div>
          )}
        </div>
      </div>

      {/* ═══ v2 §8 — UNDERGROUND MARKET ACTIVITY (shared header) ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.20s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.20em", fontWeight: 700, marginBottom: 4 }}>UNDERGROUND MARKET ACTIVITY</div>
        <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text }}>Three facets of the underground economy</div>
      </div>

      {/* ═══ LAYER 7: DATA TRIO — IAB / Stealer / Insider ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.22s cubic-bezier(0.16,1,0.3,1) both" : "none",
        marginTop: -8,
      }}>
        {/* IAB Monitor */}
        <div className="glass" style={{ padding: "16px 18px" }}>
          <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Initial Access Broker Monitor</div>
          <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text, display: "flex", alignItems: "center", gap: 8 }}>
            IAB Listings <span className="mono" style={{ fontSize: 9, color: "#FF4562", fontWeight: 700, padding: "2px 7px", background: "rgba(255,69,98,0.10)", borderRadius: 3 }}>247 active</span>
          </div>
          {IAB_STATS.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 10, borderBottom: `1px solid ${t.borderRow}` }}>
              <span style={{ color: t.text50 }}>{s.label}</span>
              <span className="mono" style={{ fontWeight: 700, color: s.color }}>{s.count}</span>
            </div>
          ))}
          <div style={{ height: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 10, borderTop: `1px solid ${t.borderSection}` }}>
            <span style={{ color: t.text50 }}>Avg. listing price</span>
            <span className="mono" style={{ fontWeight: 700, color: "#F59E0B" }}>$1,328</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 10 }}>
            <span style={{ color: t.text50 }}>Highest price (Finance)</span>
            <span className="mono" style={{ fontWeight: 700, color: "#FF4562" }}>$15,000</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 10 }}>
            <span style={{ color: t.text50 }}>Most targeted industry</span>
            <span className="mono" style={{ fontWeight: 700, color: "#3B82F6" }}>Finance</span>
          </div>
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <span onClick={() => navigate("/iab-monitor")} style={{ fontSize: 10, color: "#FF4562", cursor: "pointer", fontWeight: 600 }}>View All Listings →</span>
          </div>
        </div>

        {/* Stealer Log Trends */}
        <div className="glass" style={{ padding: "16px 18px" }}>
          <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Stealer Log Trends</div>
          <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text, display: "flex", alignItems: "center", gap: 8 }}>
            Infections by Family <span className="mono" style={{ fontSize: 9, color: "#FF4562", fontWeight: 700 }}>+18% this month</span>
          </div>
          {STEALER_FAMILIES.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "6px 0", fontSize: 10, borderBottom: i < STEALER_FAMILIES.length - 1 ? `1px solid ${t.borderRow}` : "none", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 600, color: t.text }}>{f.name}</span>
              <span className="mono" style={{ fontSize: 8, color: t.text35 }}>{f.share}% share</span>
              <span className="mono" style={{ fontWeight: 700, color: f.color, width: 50, textAlign: "right" }}>{f.count}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 10, marginTop: 8, borderTop: `1px solid ${t.borderSection}` }}>
            <span style={{ color: t.text50 }}>Top targeted platform</span>
            <span className="mono" style={{ fontWeight: 700, color: t.text }}>Google (OAuth)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 10 }}>
            <span style={{ color: t.text50 }}>Top geo (infections)</span>
            <span className="mono" style={{ fontWeight: 700, color: t.text }}>India, Brazil, US</span>
          </div>
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <span onClick={() => navigate("/iab-monitor")} style={{ fontSize: 10, color: "#FF4562", cursor: "pointer", fontWeight: 600 }}>Full Report →</span>
          </div>
        </div>

        {/* Insider Threat */}
        <div className="glass" style={{ padding: "16px 18px" }}>
          <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Insider Threat Activity</div>
          <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: t.text, display: "flex", alignItems: "center", gap: 8 }}>
            Access Offers <span className="mono" style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700 }}>34 this month</span>
          </div>
          {INSIDER_POSTS.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < INSIDER_POSTS.length - 1 ? `1px solid ${t.borderRow}` : "none", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div className="mono" style={{ fontSize: 8, color: t.text35, marginTop: 2 }}>{p.source} · {p.time} · {p.price}</div>
              </div>
              <span style={{
                padding: "2px 7px", borderRadius: 3, fontSize: 8, fontWeight: 700,
                background: `${p.color}14`, color: p.color,
                fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
              }}>{p.industry}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 10, marginTop: 8, borderTop: `1px solid ${t.borderSection}` }}>
            <span style={{ color: t.text50 }}>Avg. asking price</span>
            <span className="mono" style={{ fontWeight: 700, color: "#F59E0B" }}>$8,200</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 10 }}>
            <span style={{ color: t.text50 }}>Most targeted sector</span>
            <span className="mono" style={{ fontWeight: 700, color: "#FF4562" }}>Finance</span>
          </div>
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <span onClick={() => navigate("/insider-threat")} style={{ fontSize: 10, color: "#FF4562", cursor: "pointer", fontWeight: 600 }}>View All Threats →</span>
          </div>
        </div>
      </div>

      {/* (v2: original News section moved up to v2 §7 above) */}
      <div style={{ display: "none" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Latest Activity</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className={`tab-btn ${newsTab === "darkweb" ? "on" : ""}`} onClick={() => { setNewsTab("darkweb"); setActiveDW(0); }}>Dark Web News</button>
              <button className={`tab-btn ${newsTab === "ransomware" ? "on" : ""}`} onClick={() => { setNewsTab("ransomware"); setActiveRansom(0); }}>Ransomware News</button>
            </div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: "#FF4562", cursor: "pointer" }} onClick={() => navigate("/dark-web-news")}>View All →</span>
        </div>
        {activeNews.length > 0 ? (
          <div style={{ display: "flex", minHeight: 360 }}>
            <div style={{ width: 380, flexShrink: 0, borderRight: `1px solid ${t.borderSection}`, overflow: "auto", maxHeight: 400 }}>
              {activeNews.map((item, i) => (
                <NewsCard key={item.id} item={item} isActive={activeIdx === i} onClick={() => newsTab === "darkweb" ? setActiveDW(i) : setActiveRansom(i)} t={t} />
              ))}
            </div>
            {selectedNews && (
              <div style={{ flex: 1, padding: "20px 24px" }}>
                <h3 className="hfont" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 8 }}>{selectedNews.title}</h3>
                <div className="mono" style={{ fontSize: 10, color: t.text30, marginBottom: 14 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {selectedNews.date}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                  {selectedNews.tags.map((tag, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: "rgba(255,69,98,0.08)", border: "1px solid rgba(255,69,98,0.15)", color: "#FF4562" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.borderSection}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,69,98,0.1)", border: "1px solid rgba(255,69,98,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 28 28"><circle cx="14" cy="14" r="6" fill="#FF4562" opacity="0.85" /><circle cx="14" cy="14" r="2.5" fill={t.bgBase} /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#FF4562" }}>SOCRadar</div>
                    <div style={{ fontSize: 11, color: t.text35 }}>AI Insights</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}><span style={{ fontSize: 12, color: t.text50, cursor: "pointer" }}>+ Read More</span></div>
                </div>
                <p style={{ fontSize: 13, color: t.text55, lineHeight: 1.7 }}>{selectedNews.desc}</p>
                <p style={{ fontSize: 13, color: t.text45, lineHeight: 1.7, marginTop: 12 }}>Key Cybersecurity Implications: Direct Exposure of Sensitive PII including mobile numbers, ID numbers, gender, and specific data holdings are allegedly compromised and available on the dark web.</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center", color: t.text25, fontSize: 13 }}>
            No {newsTab === "darkweb" ? "dark web" : "ransomware"} news for {getCountryName(selectedCountry)}
          </div>
        )}
      </div>

      {/* ═══ v2 §9 — ACTIVE RANSOMWARE OPERATIONS (proper table) ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.28s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Active Ransomware Operations</span>
          <span className="mono" style={{
            fontSize: 8, padding: "2px 7px", borderRadius: 4,
            background: "rgba(34,197,94,0.10)", color: "#22C55E",
            fontWeight: 700, marginLeft: 8,
          }}>12 active</span>
          <span className="mono" style={{ fontSize: 11, color: "#3B82F6", cursor: "pointer", marginLeft: "auto", fontWeight: 600 }}>View All →</span>
        </div>
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 80px 60px 110px 100px 1.6fr 80px",
            gap: 12, padding: "9px 16px",
            fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700,
            borderBottom: `1px solid ${t.borderSection}`,
            background: t.bgInput,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span>GROUP</span>
            <span>RANK</span>
            <span>ORIGIN</span>
            <span>VICTIMS (YTD)</span>
            <span>LAST ATTACK</span>
            <span>PRIMARY TARGETS</span>
            <span style={{ textAlign: "right" }}>FLAGS</span>
          </div>
          {[
            { group: "Hunters",         rank: 2, origin: "RU", victims: 127, victimColor: "#FF4562", last: "2h ago", targets: "Healthcare, Finance",         targetsYou: false, targetReason: "" },
            { group: "el dorado",        rank: 4, origin: "RU", victims: 89,  victimColor: "#F59E0B", last: "1d ago", targets: "Manufacturing, Retail",      targetsYou: false, targetReason: "" },
            { group: "bianlian",         rank: 5, origin: "RU", victims: 76,  victimColor: t.text,   last: "3d ago", targets: "Government, Education",      targetsYou: true,  targetReason: "Targets finance" },
            { group: "Play Ransomware",  rank: 7, origin: "RU", victims: 64,  victimColor: t.text,   last: "5d ago", targets: "Finance, Technology",        targetsYou: false, targetReason: "" },
            { group: "lockbit",          rank: 8, origin: "RU", victims: 52,  victimColor: t.text,   last: "1w ago", targets: "Healthcare, Manufacturing",  targetsYou: true,  targetReason: "Targets finance · your region" },
          ].map((r, i, arr) => {
            const rankColor = r.rank <= 3 ? "#FF4562" : r.rank <= 6 ? "#F59E0B" : "#3B82F6";
            const rankBg = r.rank <= 3 ? "rgba(255,69,98,0.12)" : r.rank <= 6 ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.10)";
            return (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 80px 60px 110px 100px 1.6fr 80px",
                gap: 12, padding: "10px 16px",
                alignItems: "center", fontSize: 10,
                borderBottom: i < arr.length - 1 ? `1px solid ${t.borderRow}` : "none",
                borderLeft: r.targetsYou ? "3px solid #FF4562" : "3px solid transparent",
                background: r.targetsYou ? "rgba(255,69,98,0.025)" : "transparent",
                cursor: "pointer", transition: "background 0.15s",
              }}>
                <span style={{ fontWeight: 700, color: t.text }}>{r.group}</span>
                <span style={{
                  padding: "2px 8px", borderRadius: 3,
                  background: rankBg, color: rankColor,
                  fontSize: 8, fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  justifySelf: "start",
                }}>Rank: {r.rank}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text40 }}>{r.origin}</span>
                <span className="hfont" style={{ fontWeight: 800, color: r.victimColor }}>{r.victims}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text40 }}>{r.last}</span>
                <span style={{ fontSize: 9, color: t.text40 }}>{r.targets}</span>
                <span style={{ textAlign: "right" }}>
                  {r.targetsYou && (
                    <span title={r.targetReason} style={{
                      padding: "2px 7px", borderRadius: 4,
                      background: "rgba(255,69,98,0.14)", color: "#FF4562",
                      fontSize: 7, fontWeight: 800, letterSpacing: "0.10em",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>TARGETS YOU</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
