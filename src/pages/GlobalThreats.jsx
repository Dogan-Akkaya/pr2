import { useState, useEffect, useCallback } from "react";
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
  { name: "APT 41", rank: 2, country: "CN" },
  { name: "Stone Panda", rank: 3, country: "CN" },
  { name: "Lazarus Group", rank: 5, country: "KP" },
  { name: "Cleaver", rank: 8, country: "IR" },
  { name: "MuddyWater", rank: 11, country: "IR" },
  { name: "Fancy Bear", rank: 4, country: "RU" },
  { name: "Cozy Bear", rank: 6, country: "RU" },
];

const RANSOM_GROUPS = [
  { name: "Hunters", rank: 2, country: "RU" },
  { name: "el dorado", rank: 4, country: "RU" },
  { name: "bianlian", rank: 5, country: "RU" },
  { name: "Play Ransomware", rank: 7, country: "RU" },
  { name: "lockbit", rank: 8, country: "RU" },
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
function WorldMap({ hoveredCountry, selectedCountry, onHover, onSelect }) {
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
      </defs>

      {/* Country outlines with hover/select */}
      <g>
        {WORLD_PATHS.map(c => {
          const isHovered = hoveredCountry === c.id;
          const isSelected = selectedCountry === c.id;
          return (
            <path
              key={c.id}
              d={c.d}
              fill={isSelected ? "rgba(232,70,58,0.25)" : isHovered ? "rgba(232,70,58,0.12)" : "rgba(255,255,255,0.06)"}
              stroke={isSelected ? "#E8463A" : isHovered ? "rgba(232,70,58,0.5)" : "rgba(255,255,255,0.08)"}
              strokeWidth={isSelected ? 1.2 : isHovered ? 0.8 : 0.5}
              style={{ cursor: "pointer", transition: "fill 0.2s, stroke 0.2s" }}
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
      {[200,400,600,800].map(y => <line key={y} x1="0" y1={y} x2="2000" y2={y} stroke="rgba(255,255,255,0.015)" style={{ pointerEvents: "none" }} />)}
      {[400,800,1200,1600].map(x => <line key={x} x1={x} y1="0" x2={x} y2="1001" stroke="rgba(255,255,255,0.015)" style={{ pointerEvents: "none" }} />)}
    </svg>
  );
}

// ── News Card ──
function NewsCard({ item, isActive, onClick, t }) {
  const typeColor = item.type === "Dark Web News" ? "#E8463A" : "#A855F7";
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 600, background: typeColor + "18", color: typeColor, marginBottom: 5, fontFamily: "'Satoshi',sans-serif" }}>{item.type}</div>
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
  const { t } = useTheme();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [newsTab, setNewsTab] = useState("darkweb");
  const [activeDW, setActiveDW] = useState(0);
  const [activeRansom, setActiveRansom] = useState(0);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Search → select country
  const handleSearch = useCallback((val) => {
    setSearchQuery(val);
    if (!val.trim()) { setSelectedCountry(null); return; }
    const lower = val.trim().toLowerCase();
    // Try exact code match first
    const upperVal = val.trim().toUpperCase();
    if (COUNTRY_NAMES[upperVal]) { setSelectedCountry(upperVal); return; }
    // Try name match
    const match = Object.entries(COUNTRY_NAMES).find(([, name]) => name.toLowerCase().includes(lower));
    if (match) setSelectedCountry(match[0]);
  }, []);

  // When clicking a country on the map, update search bar too
  const handleMapSelect = useCallback((code) => {
    setSelectedCountry(code);
    setSearchQuery(code ? getCountryName(code) : "");
    setActiveDW(0);
    setActiveRansom(0);
  }, []);

  // Clear filter
  const clearFilter = () => { setSelectedCountry(null); setSearchQuery(""); setActiveDW(0); setActiveRansom(0); };

  // Filtered data
  const filteredDW = filterByCountry(DW_NEWS, selectedCountry);
  const filteredRansom = filterByCountry(RANSOM_NEWS, selectedCountry);
  const filteredActors = filterByCountry(THREAT_ACTORS, selectedCountry);
  const filteredVulns = filterByCountry(TOP_VULNS, selectedCountry);
  const filteredVictims = filterByCountry(RECENT_VICTIMS, selectedCountry);

  const activeNews = newsTab === "darkweb" ? filteredDW : filteredRansom;
  const activeIdx = newsTab === "darkweb" ? activeDW : activeRansom;
  const selectedNews = activeNews[Math.min(activeIdx, activeNews.length - 1)] || null;

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ 1. WORLD MAP ═══ */}
      <div className="glass" style={{
        padding: "20px 24px 16px", overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Global Overview</div>
            <span className="hfont" style={{ fontSize: 16, fontWeight: 700 }}>Threat Actor Distribution by Geolocation</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Hovered country tooltip */}
            {hoveredCountry && !selectedCountry && (
              <span className="mono" style={{ fontSize: 11, color: t.text60, transition: "all 0.2s" }}>
                {getCountryName(hoveredCountry)} ({hoveredCountry})
              </span>
            )}
            {/* Legend */}
            <div style={{ display: "flex", gap: 10 }}>
              {[{ label: "0-10", color: "rgba(255,255,255,0.06)" }, { label: "10-15", color: "rgba(220,38,38,0.15)" }, { label: "15-30", color: "rgba(220,38,38,0.25)" }, { label: "30-45", color: "rgba(220,38,38,0.4)" }, { label: "45+", color: "rgba(220,38,38,0.6)" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 12, height: 10, borderRadius: 2, background: l.color }} />
                  <span className="mono" style={{ fontSize: 8, color: t.text30 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: 320, position: "relative" }}>
          <WorldMap
            hoveredCountry={hoveredCountry}
            selectedCountry={selectedCountry}
            onHover={setHoveredCountry}
            onSelect={handleMapSelect}
          />
        </div>

        {/* Search bar below map */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, padding: "0 4px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search country by name or code (e.g. US, Germany, CN)..."
              style={{
                width: "100%", padding: "10px 14px 10px 36px", fontSize: 12,
                fontFamily: "'Satoshi',sans-serif", background: t.bgInput,
                border: `1px solid ${t.borderLight}`, borderRadius: 10,
                color: t.text, outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(232,70,58,0.3)"}
              onBlur={(e) => e.target.style.borderColor = t.borderLight}
            />
          </div>
          {selectedCountry && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "rgba(232,70,58,0.1)", border: "1px solid rgba(232,70,58,0.2)",
                color: "#E8463A", display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                {getCountryName(selectedCountry)}
              </span>
              <button
                onClick={clearFilter}
                style={{
                  padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.borderMed}`,
                  background: t.bgHover, color: t.text50,
                  fontSize: 11, cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ 2. THREE COLUMNS ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Threat Actors */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Top Threat Actors</div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Active Groups {selectedCountry && <span style={{ fontSize: 11, fontWeight: 400, color: t.text35 }}>in {getCountryName(selectedCountry)}</span>}</span>
          </div>
          <div>
            <div style={{ padding: "6px 20px", display: "flex", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 9, color: t.text15, textTransform: "uppercase" }}>Name</span>
              <span className="mono" style={{ fontSize: 9, color: t.text15 }}>Rank</span>
            </div>
            {filteredActors.length > 0 ? filteredActors.map((a, i) => (
              <div key={i} className="trow">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 10, color: t.text25 }}>{a.country}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: t.text70 }}>{a.name}</span>
                </div>
                <RankBadge rank={a.rank} />
              </div>
            )) : (
              <div style={{ padding: "24px 20px", textAlign: "center", color: t.text25, fontSize: 12 }}>No threat actors for this country</div>
            )}
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Most Popular Vulnerability</div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>TA/Ransomware Used</span>
          </div>
          <div>
            <div style={{ padding: "6px 20px", display: "flex", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 9, color: t.text15, textTransform: "uppercase" }}>CVE</span>
              <div style={{ display: "flex", gap: 20 }}>
                <span className="mono" style={{ fontSize: 9, color: t.text15 }}>CVSS</span>
                <span className="mono" style={{ fontSize: 9, color: t.text15 }}>SVRS</span>
              </div>
            </div>
            {filteredVulns.length > 0 ? filteredVulns.map((v, i) => (
              <div key={i} className="trow">
                <span className="mono" style={{ fontSize: 11, color: t.text50 }}>{v.cve}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: v.cvss >= 9 ? "rgba(220,38,38,0.15)" : "rgba(234,88,12,0.12)", color: v.cvss >= 9 ? "#DC2626" : "#EA580C", fontFamily: "'JetBrains Mono',monospace" }}>CVSS: {v.cvss}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace" }}>SVRS: {v.svrs}</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: "24px 20px", textAlign: "center", color: t.text25, fontSize: 12 }}>No vulnerabilities for this country</div>
            )}
          </div>
        </div>

        {/* Recent Victims */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Recent Victims</div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Ransomware Targets</span>
          </div>
          <div>
            <div style={{ padding: "6px 20px", display: "grid", gridTemplateColumns: "1fr 50px 90px", gap: 8 }}>
              <span className="mono" style={{ fontSize: 9, color: t.text15, textTransform: "uppercase" }}>Company</span>
              <span className="mono" style={{ fontSize: 9, color: t.text15, textAlign: "center" }}>Country</span>
              <span className="mono" style={{ fontSize: 9, color: t.text15, textAlign: "right" }}>Date</span>
            </div>
            {filteredVictims.length > 0 ? filteredVictims.map((v, i) => (
              <div key={i} className="trow" style={{ display: "grid", gridTemplateColumns: "1fr 50px 90px", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#E8463A" }}>{v.company}</span>
                <span style={{ fontSize: 12, textAlign: "center" }}>{v.flag} <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{v.country}</span></span>
                <span className="mono" style={{ fontSize: 10, color: t.text30, textAlign: "right" }}>{v.date}</span>
              </div>
            )) : (
              <div style={{ padding: "24px 20px", textAlign: "center", color: t.text25, fontSize: 12 }}>No victims for this country</div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 3. NEWS SECTION ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Latest Activity</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className={`tab-btn ${newsTab === "darkweb" ? "on" : ""}`} onClick={() => { setNewsTab("darkweb"); setActiveDW(0); }}>Dark Web News</button>
              <button className={`tab-btn ${newsTab === "ransomware" ? "on" : ""}`} onClick={() => { setNewsTab("ransomware"); setActiveRansom(0); }}>Ransomware News</button>
            </div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: "#E8463A", cursor: "pointer" }} onClick={() => navigate("/dark-web-news")}>View All →</span>
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
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: "rgba(232,70,58,0.08)", border: "1px solid rgba(232,70,58,0.15)", color: "#E8463A" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.borderSection}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(232,70,58,0.1)", border: "1px solid rgba(232,70,58,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 28 28"><circle cx="14" cy="14" r="6" fill="#E8463A" opacity="0.85" /><circle cx="14" cy="14" r="2.5" fill="#0C1021" /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8463A" }}>SOCRadar</div>
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

      {/* ═══ 4. BOTTOM: Ransomware Groups ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Top Ransomware Groups</div>
          <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Active Ransomware Operations</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
          {RANSOM_GROUPS.map((g, i) => (
            <div key={i} style={{
              padding: "16px 20px", textAlign: "center",
              borderRight: i < 4 ? `1px solid ${t.borderRow}` : "none",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.bgCard}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text70, marginBottom: 6 }}>{g.name}</div>
              <RankBadge rank={g.rank} />
              <div className="mono" style={{ fontSize: 9, color: t.text20, marginTop: 6 }}>{g.country}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
