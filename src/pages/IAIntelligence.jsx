import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SortHeader, useSort, usePagination, Pagination, ExportButton, exportCSV, CopyCell, Checkbox, useSelection, BulkActionBar, stickyHeaderStyle } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";

// ── Top Stealer Countries ──
const TOP_COUNTRIES = [
  { code: "IN", flag: "\u{1F1EE}\u{1F1F3}", count: "2.5M" },
  { code: "BR", flag: "\u{1F1E7}\u{1F1F7}", count: "2.4M" },
  { code: "ID", flag: "\u{1F1EE}\u{1F1E9}", count: "1.5M" },
  { code: "US", flag: "\u{1F1FA}\u{1F1F8}", count: "1.1M" },
  { code: "EG", flag: "\u{1F1EA}\u{1F1EC}", count: "1M" },
  { code: "PK", flag: "\u{1F1F5}\u{1F1F0}", count: "897K" },
  { code: "PH", flag: "\u{1F1F5}\u{1F1ED}", count: "786K" },
  { code: "AR", flag: "\u{1F1E6}\u{1F1F7}", count: "785.9K" },
  { code: "TR", flag: "\u{1F1F9}\u{1F1F7}", count: "701.5K" },
  { code: "MX", flag: "\u{1F1F2}\u{1F1FD}", count: "673.6K" },
];

// ── Top Leaks by Stealer Family ──
const STEALER_FAMILIES = [
  { name: "redline", count: "8.6M", color: "#DC2626" },
  { name: "raccoon", count: "2.3M", color: "#EA580C" },
  { name: "lumma", count: "2.3M", color: "#F59E0B" },
  { name: "RedLine", count: "2M", color: "#A855F7" },
  { name: "stealC", count: "1.6M", color: "#3B82F6" },
  { name: "meta", count: "1.1M", color: "#6366F1" },
  { name: "Lumma", count: "346.2K", color: "#10B981" },
  { name: "Raccoon", count: "285.8K", color: "#06B6D4" },
  { name: "Meta", count: "131.7K", color: "#EC4899" },
  { name: "Stealc", count: "128.7K", color: "#8B5CF6" },
];

// ── Summary stats ──
const SUMMARY_STATS = [
  { label: "Compromised Employee", value: "262K", color: "#E8463A", searchQuery: "socradar.com" },
  { label: "Compromised Users", value: "49.9K", color: "#A855F7", searchQuery: "socradar" },
  { label: "Compromised 3rd Party", value: "3.1K", color: "#3B82F6", searchQuery: "gateway" },
];

// ── Timeline data ──
const TIMELINE = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, i, 1);
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const spike = i === 14 ? 18000 : i === 15 ? 12000 : 0;
  return { month: label, count: Math.round(2000 + Math.random() * 3000 + spike) };
});

// ── Filter dropdowns (UI only) ──
const FILTERS = [
  { label: "Log Date", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

// ── Country filter cycle ──
const COUNTRY_CYCLE = ["all", "US", "BR", "TR", "IN", "DE"];

// ── Password strength helpers ──
const STR = { Strong: 5, Fair: 4, Poor: 2, Weak: 1, "No Password Exposed": 0 };
const STR_COL = { 5: "#16A34A", 4: "#CA8A04", 3: "#EA580C", 2: "#DC2626", 1: "#DC2626", 0: "rgba(255,255,255,0.08)" };
const STR_LBL = { 5: "Strong", 4: "Fair", 3: "Fair", 2: "Poor", 1: "Weak", 0: "-" };

// ── Dummy stealer log records (with type field) ──
const STEALER_LOGS = [
  { id: 1, type: "stealer", url: "https://platform.socradar.com", user: "7****e", password: "r****p", strength: "Strong", country: "US", flag: "\u{1F1FA}\u{1F1F8}", logDate: "2026-04-08", insertDate: "2024-11-28", stealer: "lumma", machineUser: "john_pc", os: "Windows 11 Pro", ip: "203.45.67.89", stealerId: "189234567", credFile: "passwords.txt", tags: ["Cookie", "Autofill"] },
  { id: 2, type: "stealer", url: "http://gateway.socradar.com/loginpag...", user: "462****m", password: "n****q", strength: "Weak", country: "IE", flag: "\u{1F1EE}\u{1F1EA}", logDate: "2026-04-07", insertDate: "2025-07-11", stealer: "redline", machineUser: "admin_ie", os: "Windows 10 Enterprise", ip: "85.12.34.56", stealerId: "176543210", credFile: "logins.json", tags: ["Cookie"] },
  { id: 3, type: "stealer", url: "android://admin@socradar.com:123456", user: "htt****s", password: "/****n", strength: "Fair", country: "FR", flag: "\u{1F1EB}\u{1F1F7}", logDate: "2026-04-07", insertDate: "2024-10-08", stealer: "raccoon", machineUser: "utilisateur", os: "Windows 11 Home", ip: "91.23.45.67", stealerId: "198765432", credFile: "credentials.db", tags: ["Autofill"] },
  { id: 4, type: "breach", url: "http://gateway.socradar.com", user: "bri****i@swissonline.ch", password: "P****0", strength: "Fair", country: "BR", flag: "\u{1F1E7}\u{1F1F7}", logDate: "2026-04-05", insertDate: "2025-06-12", stealer: "lumma", machineUser: "roble", os: "Windows 11 Home Single Language", ip: "170.83.155.159", stealerId: "163873738", credFile: "passwords.txt", tags: ["Cookie"] },
  { id: 5, type: "stealer", url: "https://socradar.com", user: "1b7****3", password: "r****t", strength: "Fair", country: "IN", flag: "\u{1F1EE}\u{1F1F3}", logDate: "2026-04-04", insertDate: "2025-06-18", stealer: "meta", machineUser: "desktop_user", os: "Windows 10 Home", ip: "49.36.78.90", stealerId: "145678901", credFile: "logins.json", tags: [] },
  { id: 6, type: "stealer", url: "http://socradar.com", user: "ros****i", password: "z****y", strength: "Poor", country: "US", flag: "\u{1F1FA}\u{1F1F8}", logDate: "2026-04-04", insertDate: "2025-06-08", stealer: "stealc", machineUser: "mike_home", os: "Windows 11 Home", ip: "72.45.123.45", stealerId: "156789012", credFile: "passwords.txt", tags: ["Cookie", "Autofill"] },
  { id: 7, type: "breach", url: "https://socradar.com", user: "mlg****1", password: "8****9", strength: "Poor", country: "TR", flag: "\u{1F1F9}\u{1F1F7}", logDate: "2026-04-03", insertDate: "2025-03-28", stealer: "redline", machineUser: "ahmet_pc", os: "Windows 10 Pro", ip: "78.45.67.89", stealerId: "134567890", credFile: "logins.json", tags: [] },
  { id: 8, type: "sale", url: "http://x.socradar.com/install/user", user: "ado****g", password: "x****2", strength: "Weak", country: "MX", flag: "\u{1F1F2}\u{1F1FD}", logDate: "2026-03-27", insertDate: "2025-02-17", stealer: "raccoon", machineUser: "carlos_lap", os: "Windows 11 Home", ip: "189.34.56.78", stealerId: "123456789", credFile: "credentials.db", tags: ["Cookie"] },
  { id: 9, type: "stealer", url: "https://socradar.com", user: "mos****a", password: "d****n", strength: "Fair", country: "PK", flag: "\u{1F1F5}\u{1F1F0}", logDate: "2026-03-27", insertDate: "2025-08-05", stealer: "lumma", machineUser: "hassan_pc", os: "Windows 10 Home", ip: "39.45.67.89", stealerId: "187654321", credFile: "passwords.txt", tags: [] },
  { id: 10, type: "sale", url: "https://gateway.socradar.com", user: "m98****s", password: "8****5", strength: "Weak", country: "DE", flag: "\u{1F1E9}\u{1F1EA}", logDate: "2026-03-25", insertDate: "2025-10-14", stealer: "meta", machineUser: "mueller_desk", os: "Windows 11 Pro", ip: "87.12.34.56", stealerId: "176543210", credFile: "logins.json", tags: ["Cookie"] },
  { id: 11, type: "breach", url: "https://socradar.com/loginpages/logi...", user: "apo****i", password: "q****n", strength: "Poor", country: "EG", flag: "\u{1F1EA}\u{1F1EC}", logDate: "2026-03-25", insertDate: "2025-11-23", stealer: "redline", machineUser: "ahmed_work", os: "Windows 10 Home", ip: "102.45.67.89", stealerId: "165432109", credFile: "credentials.db", tags: [] },
  { id: 12, type: "sale", url: "android://jar@socradar.com", user: "08****x", password: "No Password Exposed", strength: "No Password Exposed", country: "PH", flag: "\u{1F1F5}\u{1F1ED}", logDate: "2026-03-25", insertDate: "2024-04-08", stealer: "stealc", machineUser: "phone_user", os: "Android 13", ip: "112.34.56.78", stealerId: "154321098", credFile: "N/A", tags: [] },
];

const CSV_COLS = [
  { label: "URL", field: "url" }, { label: "User", field: "user" }, { label: "Password", field: "password" },
  { label: "Strength", field: "strength" }, { label: "Country", field: "country" },
  { label: "Log Date", field: "logDate" }, { label: "Insert Date", field: "insertDate" },
];

// ── Helper: extract domain from URL ──
function extractDomain(url) {
  try {
    // Handle android:// and other non-standard protocols
    const cleaned = url.replace(/^(android|ios):\/\//, "https://").replace(/^([^:]+)@/, "https://");
    const hostname = new URL(cleaned).hostname;
    return hostname;
  } catch {
    // Fallback: try to find domain pattern
    const match = url.match(/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/);
    return match ? match[0] : "";
  }
}

function isExactDomainMatch(url, baseDomain) {
  const hostname = extractDomain(url);
  // Exact match: hostname IS the base domain (no subdomains)
  return hostname === baseDomain || hostname === "www." + baseDomain;
}

// ── Mini Donut ──
function MiniDonut({ segments, size = 140, t }) {
  const total = segments.length;
  let cumulative = 0;
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 150 150">
      <circle cx="75" cy="75" r={r} fill="none" stroke={t.borderSection} strokeWidth="20" />
      {segments.map((seg, i) => {
        const pct = 1 / total;
        const offset = cumulative; cumulative += pct;
        return <circle key={i} cx="75" cy="75" r={r} fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={-offset * circ} transform="rotate(-90 75 75)" />;
      })}
    </svg>
  );
}

// ═══════════════════════════════════════
export default function IAIntelligence() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("stealer");
  const [selectedId, setSelectedId] = useState(null);
  const [showMachineInfo, setShowMachineInfo] = useState(false);
  const [includeSubdomains, setIncludeSubdomains] = useState(true);
  const [countryFilter, setCountryFilter] = useState("all");
  const { sortField, sortDir, onSort, sortData } = useSort("logDate", "desc");
  const sel = useSelection("id");
  const tableRef = useRef(null);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const ttS = {
    contentStyle: { background: t.bgTooltip, border: `1px solid ${t.borderMed}`, borderRadius: 12, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", backdropFilter: "blur(20px)", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", padding: "10px 14px" },
    itemStyle: { color: t.text, padding: "2px 0" }, labelStyle: { color: t.text50, marginBottom: 4, fontWeight: 600 },
  };

  const doSearch = () => { if (query.trim()) setSearched(true); };

  // ── Combined filtering pipeline ──
  const applyAllFilters = (data) => {
    let result = data;

    // 1. Type tab filter (stealer / breach / sale)
    if (activeTab !== "insights") {
      result = result.filter(r => r.type === activeTab);
    }

    // 2. Search query filter
    if (query) {
      result = result.filter(r =>
        r.url.toLowerCase().includes(query.toLowerCase()) || r.user.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 3. Include subdomains filter
    if (!includeSubdomains) {
      const baseDomain = "socradar.com";
      result = result.filter(r => isExactDomainMatch(r.url, baseDomain));
    }

    // 4. Show only credentials with machine info
    if (showMachineInfo) {
      result = result.filter(r => (r.tags && r.tags.length > 0) || (r.machineUser && r.machineUser.trim() !== ""));
    }

    // 5. Country filter
    if (countryFilter !== "all") {
      result = result.filter(r => r.country === countryFilter);
    }

    return result;
  };

  // Compute tab counts (apply all filters EXCEPT the tab filter itself)
  const getTabCount = (tabKey) => {
    let result = STEALER_LOGS;

    // Apply search query
    if (query) {
      result = result.filter(r =>
        r.url.toLowerCase().includes(query.toLowerCase()) || r.user.toLowerCase().includes(query.toLowerCase())
      );
    }
    // Apply subdomain filter
    if (!includeSubdomains) {
      const baseDomain = "socradar.com";
      result = result.filter(r => isExactDomainMatch(r.url, baseDomain));
    }
    // Apply machine info filter
    if (showMachineInfo) {
      result = result.filter(r => (r.tags && r.tags.length > 0) || (r.machineUser && r.machineUser.trim() !== ""));
    }
    // Apply country filter
    if (countryFilter !== "all") {
      result = result.filter(r => r.country === countryFilter);
    }
    // Apply type filter
    return result.filter(r => r.type === tabKey).length;
  };

  const filtered = sortData(applyAllFilters(STEALER_LOGS));
  const pag = usePagination(filtered.length, 25);
  const pageData = pag.paginate(filtered);
  const selected = STEALER_LOGS.find(r => r.id === selectedId);

  // Dynamic tab data with live counts
  const DATA_TABS = [
    { key: "stealer", label: "InfoStealer Logs", count: String(getTabCount("stealer")), color: "#E8463A" },
    { key: "breach", label: "Data Breaches", count: String(getTabCount("breach")), color: "#A855F7" },
    { key: "sale", label: "Stealer Logs on Sale", count: String(getTabCount("sale")), color: "#F59E0B" },
    { key: "insights", label: "Insights", count: null, color: "#10B981" },
  ];

  // Country filter cycle handler
  const cycleCountryFilter = () => {
    const currentIdx = COUNTRY_CYCLE.indexOf(countryFilter);
    const nextIdx = (currentIdx + 1) % COUNTRY_CYCLE.length;
    setCountryFilter(COUNTRY_CYCLE[nextIdx]);
  };

  const activeCountryCount = countryFilter !== "all" ? 1 : 0;

  const bulkActions = [
    { label: "Mark Resolved", icon: "M20 6L9 17l-5-5", primary: true, onClick: () => sel.clear() },
    { label: "Export Selected", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", onClick: () => exportCSV(filtered.filter(r => sel.isSelected(r.id)), CSV_COLS, "ia-intel-selected.csv") },
  ];

  // View details handler — sets query and scrolls to table
  const handleViewDetails = (searchQuery) => {
    setQuery(searchQuery);
    setSearched(true);
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ TOP ROW: Timeline + Stealer Donut ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Top Stealer Countries + Timeline */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <span className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "block" }}>Top Stealer Countries</span>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} interval={5} />
              <YAxis axisLine={false} tickLine={false} width={40} />
              <Tooltip {...ttS} />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.06} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 12 }}>
            {TOP_COUNTRIES.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                <span className="mono" style={{ fontSize: 11, color: t.text50, width: 24 }}>{c.code}</span>
                <span className="mono" style={{ fontSize: 11, color: t.text60, fontWeight: 600 }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Leaks by Stealer Family */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <span className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "block" }}>Top Leaks by Stealer Family</span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <MiniDonut segments={STEALER_FAMILIES} t={t} />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {STEALER_FAMILIES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: t.text50, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SUMMARY STAT CARDS ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {SUMMARY_STATS.map((s, i) => (
          <div key={i} className="glass" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 12, color: t.text40, marginBottom: 6 }}>{s.label}</div>
            <span className="hfont" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</span>
            <div style={{ marginTop: 6 }}>
              <span
                onClick={() => handleViewDetails(s.searchQuery)}
                style={{ fontSize: 11, color: s.color, cursor: "pointer" }}
              >View details</span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ SEARCH + FILTERS BAR ═══ */}
      <div ref={tableRef} className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Search bar row */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            padding: "7px 14px", borderRadius: 8, border: `1px solid ${t.borderLight}`,
            background: t.bgCard, display: "flex", alignItems: "center", gap: 6,
            color: t.text50, fontSize: 12, cursor: "pointer",
          }}>
            Domain
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          {searched && (
            <button onClick={() => { setSearched(false); setQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.text30, fontSize: 14, display: "flex", padding: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Search..."
              style={{ width: "100%", padding: "9px 14px 9px 36px", fontSize: 12, fontFamily: "'Satoshi',sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, outline: "none" }}
            />
          </div>
          {FILTERS.map((f, i) => (
            <button key={i} style={{
              padding: "7px 14px", borderRadius: 8, border: `1px solid ${t.borderLight}`,
              background: t.bgCard, color: t.text40,
              fontSize: 11, cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
              {f.icon && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={f.icon} /></svg>}
              {f.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          ))}
          {/* Other Filters button with country cycle */}
          <button
            onClick={cycleCountryFilter}
            style={{
              padding: "7px 14px", borderRadius: 8,
              border: countryFilter !== "all" ? "1px solid rgba(232,70,58,0.3)" : `1px solid ${t.borderLight}`,
              background: countryFilter !== "all" ? "rgba(232,70,58,0.06)" : t.bgCard,
              color: countryFilter !== "all" ? t.text60 : t.text40,
              fontSize: 11, cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            {countryFilter !== "all" ? `Country: ${countryFilter}` : "Other Filters"}
            <span className="mono" style={{ fontSize: 9, color: countryFilter !== "all" ? "#E8463A" : t.text25 }}>({activeCountryCount})</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>

        {/* Data tabs + toggles row */}
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 8 }}>
          {DATA_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                background: activeTab === tab.key ? `${tab.color}18` : t.bgInput,
                color: activeTab === tab.key ? tab.color : t.text35,
                fontSize: 11, fontWeight: activeTab === tab.key ? 600 : 400,
                fontFamily: "'Satoshi',sans-serif", display: "flex", alignItems: "center", gap: 6,
                border: activeTab === tab.key ? `1px solid ${tab.color}30` : `1px solid ${t.borderSection}`,
              }}
            >
              {tab.label}
              {tab.count !== null && <span className="mono" style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: activeTab === tab.key ? `${tab.color}25` : t.borderLight, fontWeight: 600 }}>{tab.count}</span>}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            {/* Toggle: machine info */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div onClick={() => setShowMachineInfo(!showMachineInfo)} style={{
                width: 32, height: 18, borderRadius: 9, padding: 2, cursor: "pointer",
                background: showMachineInfo ? "rgba(232,70,58,0.35)" : t.borderMed,
                transition: "all 0.2s", position: "relative",
              }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: showMachineInfo ? "#E8463A" : "rgba(255,255,255,0.3)", transform: showMachineInfo ? "translateX(14px)" : "translateX(0)", transition: "all 0.2s" }} />
              </div>
              <span style={{ fontSize: 10, color: t.text30 }}>Show only credentials with machine info</span>
            </div>
            {/* Toggle: subdomains */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div onClick={() => setIncludeSubdomains(!includeSubdomains)} style={{
                width: 32, height: 18, borderRadius: 9, padding: 2, cursor: "pointer",
                background: includeSubdomains ? "rgba(232,70,58,0.35)" : t.borderMed,
                transition: "all 0.2s", position: "relative",
              }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: includeSubdomains ? "#E8463A" : "rgba(255,255,255,0.3)", transform: includeSubdomains ? "translateX(14px)" : "translateX(0)", transition: "all 0.2s" }} />
              </div>
              <span style={{ fontSize: 10, color: t.text30 }}>Include subdomains</span>
            </div>
            <ExportButton onClick={() => exportCSV(filtered, CSV_COLS, "ia-intelligence-export.csv")} />
          </div>
        </div>

        {!searched ? (
          /* Empty state */
          <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hfont" style={{ fontSize: 18, fontWeight: 700, color: t.text50 }}>Find a Needle in the Haystack</span>
            <span style={{ fontSize: 13, color: t.text25, textAlign: "center" }}>Enter a search keyword, domain, or email to uncover data</span>
            <button onClick={() => { setQuery("socradar.io"); setSearched(true); }} style={{
              marginTop: 8, padding: "10px 24px", borderRadius: 8, border: `1px solid ${t.borderStrong}`,
              background: t.bgHover, color: t.text, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
            }}>Search for socradar.io</button>
          </div>
        ) : activeTab === "insights" ? (
          /* Insights empty state */
          <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
                <path d="M10 21h4" />
              </svg>
            </div>
            <span className="hfont" style={{ fontSize: 18, fontWeight: 700, color: t.text50 }}>AI Insights Are Being Generated</span>
            <span style={{ fontSize: 13, color: t.text25, textAlign: "center", maxWidth: 400 }}>
              Our AI engine is analyzing your stealer log data to identify patterns, correlations, and actionable recommendations. Check back shortly.
            </span>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#10B981",
                  opacity: 0.4, animation: `pulse 1.4s ${i * 0.2}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* No results state */
          <div style={{ padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="hfont" style={{ fontSize: 18, fontWeight: 700, color: t.text50 }}>No Results Found</span>
            <span style={{ fontSize: 13, color: t.text25, textAlign: "center" }}>Try adjusting your filters or search query</span>
          </div>
        ) : (
          /* Table */
          <>
            <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "28px 1fr 1fr 90px 110px 60px 110px 110px 40px", gap: 8, borderBottom: `1px solid ${t.borderSection}`, ...stickyHeaderStyle }}>
              <Checkbox checked={sel.allSelected(pageData)} indeterminate={sel.count > 0 && !sel.allSelected(pageData)} onChange={() => sel.toggleAll(pageData)} />
              <SortHeader label="URL" field="url" sortField={sortField} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="User" field="user" sortField={sortField} sortDir={sortDir} onSort={onSort} />
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Password</span>
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Password Strength</span>
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Country</span>
              <SortHeader label="Log Date" field="logDate" sortField={sortField} sortDir={sortDir} onSort={onSort} />
              <SortHeader label="Insert Date" field="insertDate" sortField={sortField} sortDir={sortDir} onSort={onSort} />
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Actions</span>
            </div>

            {pageData.map(r => {
              const strVal = STR[r.strength] || 0;
              return (
                <div key={r.id} onClick={() => setSelectedId(r.id)} className="trow" style={{
                  display: "grid", gridTemplateColumns: "28px 1fr 1fr 90px 110px 60px 110px 110px 40px",
                  gap: 8, alignItems: "center", padding: "10px 20px", cursor: "pointer",
                  background: sel.isSelected(r.id) ? "rgba(232,70,58,0.04)" : selectedId === r.id ? "rgba(232,70,58,0.04)" : undefined,
                  borderLeft: selectedId === r.id ? "3px solid #E8463A" : "3px solid transparent",
                }}>
                  <Checkbox checked={sel.isSelected(r.id)} onChange={() => sel.toggle(r.id)} />
                  <CopyCell value={r.url} style={{ fontSize: 11, color: t.text55, fontFamily: "'JetBrains Mono',monospace", overflow: "hidden" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</span>
                  </CopyCell>
                  <CopyCell value={r.user} style={{ fontSize: 11, color: t.text45, fontFamily: "'JetBrains Mono',monospace", overflow: "hidden" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.user}</span>
                  </CopyCell>
                  <span className="mono" style={{ fontSize: 11, color: t.text35 }}>{r.password === "No Password Exposed" ? "-" : r.password}</span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(b => (
                        <div key={b} style={{ width: 14, height: 10, borderRadius: 2, background: b <= strVal ? STR_COL[strVal] : t.borderLight }} />
                      ))}
                    </div>
                    <span className="mono" style={{ fontSize: 8, color: t.text25 }}>{STR_LBL[strVal]}</span>
                  </div>
                  <span style={{ fontSize: 16 }}>{r.flag}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text30 }}>{r.logDate}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text30 }}>{r.insertDate}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text20} strokeWidth="2" style={{ cursor: "pointer" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
              );
            })}

            <Pagination
              page={pag.page} totalPages={pag.totalPages} startIdx={pag.startIdx} endIdx={pag.endIdx}
              totalItems={filtered.length} onPrev={pag.prev} onNext={pag.next} onGoTo={pag.goTo}
              perPage={pag.perPage} onPerPageChange={pag.setPerPage}
            />
            <BulkActionBar count={sel.count} onClear={sel.clear} actions={bulkActions} />
          </>
        )}
      </div>

      {/* ═══ DETAIL PANEL: Info Stealer ═══ */}
      {selected && (
        <>
          <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 520, overflow: "auto", zIndex: 51,
            background: t.bgPanel, backdropFilter: "blur(20px)",
            borderLeft: `1px solid ${t.borderLight}`,
            animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                </div>
                <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Info Stealer</span>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.bgElevated, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Description */}
              <div style={{ padding: "18px", borderRadius: 12, background: t.bgCard, border: `1px solid ${t.borderSection}`, marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text70, marginBottom: 8 }}>Description</div>
                <p style={{ fontSize: 12, color: t.text45, lineHeight: 1.7, margin: 0 }}>
                  A malware infection was detected on a <strong style={{ color: t.text70 }}>{selected.os}</strong> system.
                  The malware successfully compromised credential data with information associated
                  with <strong style={{ color: t.text70 }}>{selected.country}</strong>. A system information file containing details about the compromised
                  system's configuration, installed software, and potentially visited URLs. This incident
                  represents a credential theft attack that exposed sensitive authentication data.
                </p>
              </div>

              {/* Key-value overview */}
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 12 }}>Overview</div>
              {[
                { label: "Machine Username", value: selected.machineUser },
                { label: "Country", value: `${selected.country} ${selected.flag}` },
                { label: "Stealer ID", value: selected.stealerId },
                { label: "Data Compromised", value: selected.logDate },
                { label: "Credential File", value: selected.credFile },
                { label: "Tags", value: null, tags: selected.tags },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderSection}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  {row.tags !== undefined ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      {row.tags.length > 0 ? row.tags.map((tag, j) => (
                        <span key={j} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 10, background: "rgba(21,27,46,0.9)", border: `1px solid ${t.borderStrong}`, color: t.text70, fontFamily: "'JetBrains Mono',monospace" }}>{tag}</span>
                      )) : <span style={{ fontSize: 11, color: t.text25 }}>—</span>}
                    </div>
                  ) : (
                    <CopyCell value={String(row.value)} style={{ fontSize: 12, color: t.text60 }} />
                  )}
                </div>
              ))}

              {/* Identity & Access Artifact promo */}
              <div style={{ marginTop: 24, padding: "20px", borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(232,70,58,0.1)", border: "1px solid rgba(232,70,58,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></svg>
                  </div>
                  <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Identity & Access Artifact</span>
                </div>
                <p style={{ fontSize: 11, color: t.text40, lineHeight: 1.6, margin: "0 0 14px 0" }}>
                  Identity & Access Artifact combines <strong style={{ color: t.text60 }}>AI-powered analysis</strong> with <strong style={{ color: t.text60 }}>Attack Flow visualization</strong> and <strong style={{ color: t.text60 }}>File Insight</strong> to help you understand how an endpoint was compromised, what identity and access artifacts were exposed, and where to take action.
                </p>
                <button style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #E8463A 0%, #A855F7 100%)",
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: "0 4px 16px rgba(232,70,58,0.3)",
                }}>Explore Insights</button>
              </div>

              {/* User Credentials section */}
              <div style={{ marginTop: 24, padding: "18px", borderRadius: 12, background: t.bgCard, border: `1px solid ${t.borderSection}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text70 }}>User Credentials</span>
                </div>
                {[
                  { label: "Identity Type", value: "Possible Employee" },
                  { label: "URL", value: selected.url },
                  { label: "Username", value: selected.user },
                  { label: "Password", value: selected.password },
                  { label: "Password SHA-256", value: "1E651A1B52A47668438..." },
                  { label: "Password NTLM Hash", value: "0370B01E9D494D87E..." },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.borderSection}` }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: t.text50 }}>{row.label}</span>
                    <CopyCell value={row.value} style={{ fontSize: 11, color: t.text55, fontFamily: "'JetBrains Mono',monospace", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }} />
                  </div>
                ))}
              </div>

              {/* Compromised Machine section */}
              <div style={{ marginTop: 16, padding: "18px", borderRadius: 12, background: t.bgCard, border: `1px solid ${t.borderSection}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.text70 }}>Compromised Machine</span>
                </div>
                {[
                  { label: "Machine Username", value: selected.machineUser },
                  { label: "Operating System", value: selected.os },
                  { label: "HWID", value: "-" },
                  { label: "IP", value: selected.ip },
                  { label: "Country", value: `${selected.country} ${selected.flag}` },
                  { label: "Antivirus", value: "Windows Defender" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.borderSection}` }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: t.text50 }}>{row.label}</span>
                    <CopyCell value={row.value} style={{ fontSize: 11, color: t.text55, fontFamily: "'JetBrains Mono',monospace" }} />
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
