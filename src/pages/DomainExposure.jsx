import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import { SortHeader, useSort, usePagination, Pagination, exportCSV, ExportButton, RowChevron, TimeCell, useSelection, Checkbox, BulkActionBar, useTimeRange, TimeRangeFilter } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";
import { tooltipStyles } from "../components/chartTheme";

// ── Password Strength ──
const STR_COL = { Weak: "#DC2626", Poor: "#EA580C", Fair: "#CA8A04", Strong: "#16A34A", Excellent: "#059669" };
const STR_VAL = { Weak: 1, Poor: 2, Fair: 3, Strong: 4, Excellent: 5 };

// ── Timeline Data ──
const TIMELINE = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2025, 7, 1 + i * 5);
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    date: label,
    stealerLogs: Math.round(300 + Math.sin(i * 0.8) * 200 + Math.random() * 150),
    breaches: Math.round(50 + Math.random() * 80),
    mentions: Math.round(20 + Math.random() * 60),
  };
});

// ── Record Statuses ──
const RECORD_STATUS = [
  { label: "Open", count: 2700, color: "#FF4562" },
  { label: "On Hold", count: 0, color: "#F59E0B" },
  { label: "Closed", count: 1, color: "#3B82F6" },
];

// ── Top Exposed Domains ──
const TOP_DOMAINS = [
  { label: "3000", count: 12, color: "#FF4562" },
  { label: "mail@mail.com", count: 109, color: "#A855F7" },
  { label: "kevin.koestoro@jtrust...", count: 22, color: "#3B82F6" },
  { label: "admin", count: 14, color: "#F59E0B" },
  { label: "fa57720", count: 14, color: "#10B981" },
];

// ── Monitored Domains ──
const MONITORED_DOMAINS = [
  { domain: "socradar.io", severity: "critical", findings: 147, stealerLogs: 89, lastSeen: "2h ago", trend: "+12%", subs: ["platform.socradar.com", "api.socradar.io", "app.socradar.com"], stats: { stealerLogs: 89, breaches: 32, mentions: 26 } },
  { domain: "jtrustbank.co.id", severity: "high", findings: 312, stealerLogs: 201, lastSeen: "1h ago", trend: "+8%", subs: ["ibank.jtrustbank.co.id", "hr.jtrustbank.co.id"], stats: { stealerLogs: 201, breaches: 74, mentions: 37 } },
  { domain: "fastpay.co.id", severity: "high", findings: 142, stealerLogs: 95, lastSeen: "3h ago", trend: "+23%", subs: ["admin.fastpay.co.id"], stats: { stealerLogs: 95, breaches: 30, mentions: 17 } },
  { domain: "brn.co.id", severity: "medium", findings: 68, stealerLogs: 41, lastSeen: "6h ago", trend: "~-2%", subs: [], stats: { stealerLogs: 41, breaches: 18, mentions: 9 } },
  { domain: "greenanimalsbank.com", severity: "medium", findings: 48, stealerLogs: 28, lastSeen: "1d ago", trend: "+4%", subs: ["portal.greenanimalsbank.com"], stats: { stealerLogs: 28, breaches: 12, mentions: 8 } },
];

// ── Unique FQDNs ──
const FQDN_DATA = [
  { fqdn: "platform.socradar.com", hits: 89, source: "Stealer Logs", severity: "critical" },
  { fqdn: "ibank.jtrustbank.co.id", hits: 76, source: "Stealer Logs", severity: "critical" },
  { fqdn: "socradar.io", hits: 58, source: "Breach Forums", severity: "high" },
  { fqdn: "admin.fastpay.co.id", hits: 45, source: "Russian Market", severity: "high" },
  { fqdn: "hr.jtrustbank.co.id", hits: 38, source: "Stealer Logs", severity: "high" },
  { fqdn: "api.socradar.io", hits: 34, source: "Telegram", severity: "medium" },
  { fqdn: "portal.greenanimalsbank.com", hits: 28, source: "Stealer Logs", severity: "medium" },
  { fqdn: "app.socradar.com", hits: 24, source: "Paste Sites", severity: "medium" },
  { fqdn: "academy.socradar.is", hits: 19, source: "Dark Web Forum", severity: "low" },
  { fqdn: "recruit.brn.co.id", hits: 12, source: "Stealer Logs", severity: "low" },
];

// ── Third-Party Risk ──
const THIRD_PARTY = [
  { name: "JTrust Bank", domain: "jtrustbank.co.id", industry: "Banking Partner", severity: "high", exposures: 312 },
  { name: "FastPay", domain: "fastpay.co.id", industry: "Payment Processor", severity: "high", exposures: 142 },
  { name: "BRN Group", domain: "brn.co.id", industry: "Business Partner", severity: "medium", exposures: 68 },
  { name: "Green Animals Bank", domain: "greenanimalsbank.com", industry: "Financial Services", severity: "medium", exposures: 48 },
];

// ── Stealer Exposure by Domain (chart data) ──
const DOMAIN_EXPOSURE_CHART = [
  { domain: "socradar.io", stealerLogs: 89, breaches: 32, mentions: 26 },
  { domain: "jtrustbank.co.id", stealerLogs: 201, breaches: 74, mentions: 37 },
  { domain: "fastpay.co.id", stealerLogs: 95, breaches: 30, mentions: 17 },
  { domain: "brn.co.id", stealerLogs: 41, breaches: 18, mentions: 9 },
  { domain: "greenanimalsbank.com", stealerLogs: 28, breaches: 12, mentions: 8 },
];

// ── Credential Findings (Botnet Data) ──
const CREDENTIAL_FINDINGS = [
  { id: 1, url: "https://academy.socradar.io", user: "money", password: "n****r", strength: "Excellent", type: "Employee", status: "Open", date: "2025-10-19", alarmId: 78012340 },
  { id: 2, url: "https://app.clockify.me", user: "ali.uzun@socradar.io", password: "4****L", strength: "Weak", type: "Employee", status: "Open", date: "2025-10-19", alarmId: 78012338 },
  { id: 3, url: "https://login.microsoftonline.com", user: "ali.uzun@socradar.io", password: "E****9", strength: "Strong", type: "Employee", status: "Open", date: "2025-10-19", alarmId: 78012335 },
  { id: 4, url: "https://platform.socradar.com", user: "ali.uzun@socradar.io", password: "1****j", strength: "Strong", type: "Employee", status: "Open", date: "2025-10-19", alarmId: 78012330 },
  { id: 5, url: "https://github.com", user: "dogan.akkaya@socradar.io", password: "G****2", strength: "Fair", type: "Employee", status: "Open", date: "2025-10-18", alarmId: 78009870 },
  { id: 6, url: "https://portal.azure.com", user: "sener.molla@socradar.io", password: "A****!", strength: "Excellent", type: "Employee", status: "Open", date: "2025-10-17", alarmId: 78005120 },
  { id: 7, url: "https://app.hubspot.com", user: "marketing@greenanimalsbank.com", password: "H****3", strength: "Fair", type: "Employee", status: "Open", date: "2025-10-16", alarmId: 78001200 },
  { id: 8, url: "https://slack.com", user: "v.walker@greenanimalsbank.com", password: "S****k", strength: "Weak", type: "Employee", status: "Closed", date: "2025-10-15", alarmId: 77998100 },
  { id: 9, url: "https://accounts.google.com", user: "finance@greenanimalsbank.com", password: "F****$", strength: "Poor", type: "Employee", status: "Open", date: "2025-10-14", alarmId: 77994500 },
  { id: 10, url: "https://login.coinbase.com", user: "g.barnett@greenanimalsbank.com", password: "C****7", strength: "Weak", type: "Customer", status: "Open", date: "2025-10-13", alarmId: 77990200 },
];

// ── Dark Web Mentions (Suspicious Content) ──
const DW_MENTIONS = [
  { id: 1, platform: "dark-time.life", source: "https://dark-time.life", status: "Open", date: "2025-12-31", alarmId: 78112340 },
  { id: 2, platform: "xreactor.org", source: "https://xreactor.org", status: "Open", date: "2025-12-31", alarmId: 78112330 },
  { id: 3, platform: "darkforums.st", source: "https://darkforums.st", status: "Open", date: "2025-12-30", alarmId: 78110200 },
  { id: 4, platform: "cracked.sh", source: "https://cracked.sh", status: "Open", date: "2025-12-29", alarmId: 78108100 },
  { id: 5, platform: "leakbase.la", source: "https://leakbase.la", status: "Open", date: "2025-12-28", alarmId: 78105000 },
  { id: 6, platform: "breachforums.bf", source: "https://breachforums.bf", status: "Open", date: "2025-12-30", alarmId: 78109900 },
  { id: 7, platform: "darkforums.io", source: "https://darkforums.io", status: "Open", date: "2025-12-29", alarmId: 78107800 },
  { id: 8, platform: "exploit.in", source: "https://exploit.in", status: "Open", date: "2025-12-28", alarmId: 78104500 },
];

// ── Mini Donut ──
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
      <text x="50" y="48" textAnchor="middle" dominantBaseline="central" fill={t?.text || "#E8ECF1"} fontSize="14" fontWeight="800" fontFamily="'Red Hat Display'">{total > 1000 ? (total / 1000).toFixed(1) + "K" : total}</text>
    </svg>
  );
}

// ── Severity helpers ──
const SEV_HEX = { critical: "#DC2626", high: "#EA580C", medium: "#CA8A04", low: "#16A34A" };
const SEV_LABEL = { critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW" };

// ── Bulk Actions ──
const bulkActions = [
  { label: "Mark Resolved", icon: "M20 6L9 17l-5-5", primary: true, onClick: () => alert("Mark resolved (demo)") },
  { label: "Export Selected", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3", onClick: () => alert("Export selected (demo)") },
  { label: "Assign", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M12 7a4 4 0 100-8 4 4 0 000 8z", onClick: () => alert("Assign (demo)") },
];

// ═══════════════════════════════════════
export default function DomainExposure() {
  const { t } = useTheme();
  const ttS = tooltipStyles(t);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("credentials");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCredId, setSelectedCredId] = useState(null);
  const [selectedMentionId, setSelectedMentionId] = useState(null);
  const [domainTab, setDomainTab] = useState("domains");
  const [expandedDomain, setExpandedDomain] = useState(0);
  const [domainSearch, setDomainSearch] = useState("");
  const { sortField, sortDir, onSort, sortData } = useSort("date", "desc");
  const credSel = useSelection("id");
  const mentionSel = useSelection("id");
  const activeSel = tab === "credentials" ? credSel : mentionSel;
  const { range, setRange, filterByRange } = useTimeRange("All");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const credExportCols = [
    { label: "URL", field: "url" }, { label: "User", field: "user" }, { label: "Password", field: "password" },
    { label: "Strength", field: "strength" }, { label: "Type", field: "type" }, { label: "Status", field: "status" }, { label: "Date", field: "date" },
  ];
  const mentionExportCols = [
    { label: "Platform", field: "platform" }, { label: "Source", field: "source" }, { label: "Status", field: "status" }, { label: "Date", field: "date" },
  ];

  const filteredCreds = filterByRange(CREDENTIAL_FINDINGS.filter(r => !searchQuery || r.url.toLowerCase().includes(searchQuery.toLowerCase()) || r.user.toLowerCase().includes(searchQuery.toLowerCase())), "date");
  const filteredMentions = filterByRange(DW_MENTIONS.filter(r => !searchQuery || r.platform.toLowerCase().includes(searchQuery.toLowerCase())), "date");
  const activeData = tab === "credentials" ? filteredCreds : filteredMentions;

  // Pagination — shared instance keyed to the active tab's total. usePagination
  // already resets to page 1 when total changes, which covers tab swaps and search.
  const pag = usePagination(activeData.length, 10);
  const pagedCreds = pag.paginate(sortData(filteredCreds));
  const pagedMentions = pag.paginate(filteredMentions);
  const selectedCred = CREDENTIAL_FINDINGS.find(r => r.id === selectedCredId);
  const selectedMention = DW_MENTIONS.find(r => r.id === selectedMentionId);

  const filteredDomains = MONITORED_DOMAINS.filter(d => !domainSearch || d.domain.toLowerCase().includes(domainSearch.toLowerCase()));
  const filteredFQDNs = FQDN_DATA.filter(f => !domainSearch || f.fqdn.toLowerCase().includes(domainSearch.toLowerCase()));

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ SECTION 1: HERO BANNER ═══ */}
      <div className="glass" style={{ padding: "20px 24px", animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left: Icon + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,69,98,0.08)", border: "1px solid rgba(255,69,98,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#FF4562", textTransform: "uppercase", marginBottom: 3 }}>Domain Exposure</div>
              <span style={{ fontSize: 13, color: t.text50 }}>Stealer log exposure across <span style={{ color: t.text, fontWeight: 600 }}>5</span> monitored domains and their subdomains</span>
            </div>
          </div>
          {/* Right: 4 inline stats */}
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[
              { label: "Unique FQDNs", value: "217", color: "#A855F7" },
              { label: "Unique Passwords", value: "764", color: "#3B82F6" },
              { label: "Unique Usernames", value: "1.9K", color: "#10B981" },
              { label: "Record Statuses", value: "2.7K Open", color: "#FF4562" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.06em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <span className="hfont" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: TWO-COLUMN LAYOUT (findings left, domain browser right) ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>

        {/* ── Domain Browser (visually rendered on the right via grid order) ── */}
        <div className="glass" style={{ overflow: "hidden", display: "flex", flexDirection: "column", order: 2 }}>
          {/* Tab row + search */}
          <div style={{ padding: "12px 16px 0", borderBottom: `1px solid ${t.borderSection}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["domains", "fqdns", "third-party"].map(tb => (
                  <button key={tb} className={`tab-btn ${domainTab === tb ? "on" : ""}`} onClick={() => setDomainTab(tb)} style={{ fontSize: 10, padding: "5px 10px" }}>
                    {tb === "domains" ? "Domains" : tb === "fqdns" ? "Unique FQDNs" : "Third-Party Risk"}
                  </button>
                ))}
              </div>
              <div style={{ position: "relative", width: 120 }}>
                <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input value={domainSearch} onChange={e => setDomainSearch(e.target.value)} placeholder="Filter..." style={{ width: "100%", padding: "6px 8px 6px 26px", fontSize: 10, fontFamily: "'Inter', sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 8, color: t.text, outline: "none" }} />
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 520 }}>
            {/* ── Domains Tab ── */}
            {domainTab === "domains" && filteredDomains.map((d, i) => {
              const isExpanded = expandedDomain === i;
              const sevColor = SEV_HEX[d.severity];
              const subCount = d.subs ? d.subs.length : 0;
              return (
                <div key={d.domain} style={{ borderBottom: `1px solid ${t.borderRow}` }}>
                  <div onClick={() => setExpandedDomain(isExpanded ? -1 : i)} style={{ padding: "14px 16px", cursor: "pointer", background: isExpanded ? t.bgCard : "transparent", transition: "background 0.15s" }}>
                    {/* Row 1: domain + badges + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: sevColor, boxShadow: `0 0 6px ${sevColor}50`, flexShrink: 0 }} />
                      <span className="hfont" style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{d.domain}</span>
                      <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: `${sevColor}15`, color: sevColor, letterSpacing: "0.04em" }}>{SEV_LABEL[d.severity]}</span>
                      {subCount > 0 && <span className="mono" style={{ fontSize: 9, color: t.text30 }}>+{subCount} subs</span>}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                    {/* Row 2: meta */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 15 }}>
                      <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{d.findings} findings</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.text20 }} />
                      <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{d.stealerLogs} stealer logs</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.text20 }} />
                      <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{d.lastSeen}</span>
                      <span style={{ flex: 1 }} />
                      <span className="mono" style={{ fontSize: 10, color: d.trend.startsWith("+") ? "#16A34A" : d.trend.startsWith("~") ? t.text30 : "#DC2626" }}>
                        {d.trend.startsWith("+") ? "\u2191" : d.trend.startsWith("~") ? "" : "\u2193"} {d.trend}
                      </span>
                    </div>
                  </div>
                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: "0 16px 14px", background: t.bgCard }}>
                      {/* Stat boxes */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {[
                          { label: "Stealer Logs", value: d.stats?.stealerLogs || d.stealerLogs, color: "#FF4562" },
                          { label: "Breaches", value: d.stats?.breaches || 0, color: "#EA580C" },
                          { label: "Mentions", value: d.stats?.mentions || 0, color: "#3B82F6" },
                        ].map((st, si) => (
                          <div key={si} style={{ padding: "10px 12px", borderRadius: 8, background: t.bgCard, border: `1px solid ${t.borderLight}` }}>
                            <div className="mono" style={{ fontSize: 8, color: t.text25, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{st.label}</div>
                            <span className="hfont" style={{ fontSize: 16, fontWeight: 700, color: st.color }}>{st.value}</span>
                          </div>
                        ))}
                      </div>
                      {/* Subdomains */}
                      {subCount > 0 && (
                        <div>
                          <div className="mono" style={{ fontSize: 9, color: t.text25, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Subdomains</div>
                          {d.subs.map((sub, si) => (
                            <div key={si} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.text20 }} />
                              <span className="mono" style={{ fontSize: 11, color: t.text50 }}>{sub}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── FQDNs Tab ── */}
            {domainTab === "fqdns" && (
              <div>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 100px 70px", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${t.borderRow}`, alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>FQDN</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Hits</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Source</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Severity</span>
                </div>
                {filteredFQDNs.map((f, i) => {
                  const sevColor = SEV_HEX[f.severity];
                  return (
                    <div key={i} className="trow" style={{ display: "grid", gridTemplateColumns: "1fr 50px 100px 70px", gap: 8, padding: "10px 16px", alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 11, color: "#3B82F6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.fqdn}</span>
                      <span className="mono" style={{ fontSize: 11, color: t.text50 }}>{f.hits}</span>
                      <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{f.source}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: sevColor }} />
                        <span style={{ fontSize: 9, fontWeight: 600, color: sevColor, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.04em" }}>{SEV_LABEL[f.severity]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Third-Party Risk Tab ── */}
            {domainTab === "third-party" && THIRD_PARTY.map((tp, i) => {
              const sevColor = SEV_HEX[tp.severity];
              return (
                <div key={i} className="trow" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>{tp.name}</span>
                      <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: `${sevColor}15`, color: sevColor, letterSpacing: "0.04em" }}>{SEV_LABEL[tp.severity]}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontSize: 10, color: "#3B82F6" }}>{tp.domain}</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.text20 }} />
                      <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{tp.industry}</span>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.text20 }} />
                      <span className="mono" style={{ fontSize: 10, color: t.text40 }}>{tp.exposures} exposures</span>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text25} strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Findings Panel (visually rendered on the left via grid order) ── */}
        <div className="glass" style={{ overflow: "hidden", display: "flex", flexDirection: "column", order: 1 }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flexShrink: 0 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>
                {tab === "credentials" ? `${filteredCreds.length} Total Findings` : `${filteredMentions.length} Total Findings`}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={`tab-btn ${tab === "credentials" ? "on" : ""}`} onClick={() => { setTab("credentials"); setSearchQuery(""); }}>Credential Findings</button>
                <button className={`tab-btn ${tab === "mentions" ? "on" : ""}`} onClick={() => { setTab("mentions"); setSearchQuery(""); }}>Dark Web Mentions</button>
              </div>
            </div>
            <div style={{ position: "relative", flex: 1 }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tab === "credentials" ? "Search by URL or user..." : "Search by platform..."} style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 12, fontFamily: "'Inter', sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, outline: "none" }} />
            </div>
            <TimeRangeFilter range={range} onRangeChange={setRange} />
            <ExportButton onClick={() => exportCSV(tab === "credentials" ? filteredCreds : filteredMentions, tab === "credentials" ? credExportCols : mentionExportCols, tab === "credentials" ? "credential_findings.csv" : "dark_web_mentions.csv")} />
          </div>

          {/* Scrollable table area */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 520 }}>
            {/* Credential Findings Table */}
            {tab === "credentials" && (<>
              <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "24px 1fr 1fr 80px 80px 64px 60px 90px 64px 24px", gap: 6, borderBottom: `1px solid ${t.borderRow}`, alignItems: "center" }}>
                <Checkbox checked={activeSel.allSelected(filteredCreds)} indeterminate={activeSel.count > 0 && !activeSel.allSelected(filteredCreds)} onChange={() => activeSel.toggleAll(filteredCreds)} />
                <SortHeader label="URL" field="url" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <SortHeader label="User" field="user" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <SortHeader label="Password" field="password" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <SortHeader label="Strength" field="strength" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <SortHeader label="Type" field="type" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <SortHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <SortHeader label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Alarm</span>
                <span />
              </div>
              {pagedCreds.map((r, i) => (
                <div key={r.id} onClick={() => setSelectedCredId(r.id)} className="trow" style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 80px 80px 64px 60px 90px 64px 24px", gap: 6, alignItems: "center", padding: "10px 16px", cursor: "pointer", background: activeSel.isSelected(r.id) ? "rgba(255,69,98,0.06)" : selectedCredId === r.id ? "rgba(255,69,98,0.04)" : i % 2 === 0 ? t.bgCard : "transparent", borderLeft: selectedCredId === r.id ? "3px solid #FF4562" : "3px solid transparent" }}>
                  <Checkbox checked={activeSel.isSelected(r.id)} onChange={() => activeSel.toggle(r.id)} />
                  <span className="mono" style={{ fontSize: 10, color: "#3B82F6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</span>
                  <span style={{ fontSize: 10, color: t.text50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.user}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text40 }}>{r.password}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(b => <div key={b} style={{ width: 8, height: 5, borderRadius: 1, background: b <= STR_VAL[r.strength] ? STR_COL[r.strength] : t.borderLight }} />)}
                    </div>
                  </div>
                  <span style={{ padding: "2px 6px", borderRadius: 5, fontSize: 8, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace" }}>{r.type}</span>
                  <span className="tag" style={{ background: r.status === "Open" ? "rgba(22,163,74,0.08)" : t.bgHover, color: r.status === "Open" ? "#16A34A" : t.text30, fontSize: 8, display: "inline-flex", alignItems: "center", gap: 2 }}>{r.status} <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
                  <TimeCell date={r.date} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#FF4562", fontSize: 8, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>Open <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></span>
                  <RowChevron />
                </div>
              ))}
            </>)}

            {/* Dark Web Mentions Table */}
            {tab === "mentions" && (<>
              <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "24px 1fr 1fr 70px 100px 64px", gap: 6, borderBottom: `1px solid ${t.borderRow}`, alignItems: "center" }}>
                <Checkbox checked={activeSel.allSelected(filteredMentions)} indeterminate={activeSel.count > 0 && !activeSel.allSelected(filteredMentions)} onChange={() => activeSel.toggleAll(filteredMentions)} />
                {["Platform", "Source", "Status", "Discovery Date", "Alarm"].map(h => (
                  <span key={h} className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {pagedMentions.map(r => (
                <div key={r.id} onClick={() => setSelectedMentionId(r.id)} className="trow" style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 70px 100px 64px", gap: 6, alignItems: "center", padding: "10px 16px", cursor: "pointer", background: activeSel.isSelected(r.id) ? "rgba(255,69,98,0.06)" : selectedMentionId === r.id ? "rgba(255,69,98,0.04)" : undefined, borderLeft: selectedMentionId === r.id ? "3px solid #FF4562" : "3px solid transparent" }}>
                  <Checkbox checked={activeSel.isSelected(r.id)} onChange={() => activeSel.toggle(r.id)} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: t.text60 }}>{r.platform}</span>
                  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%" }}>{r.source}</span>
                  <span className="tag" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A", fontSize: 8, display: "inline-flex", alignItems: "center", gap: 2 }}>{r.status} <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
                  <span className="mono" style={{ fontSize: 10, color: t.text30 }}>{r.date}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#FF4562", fontSize: 8, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>Open <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></span>
                </div>
              ))}
            </>)}
          </div>

          <Pagination
            page={pag.page}
            totalPages={pag.totalPages}
            startIdx={pag.startIdx}
            endIdx={pag.endIdx}
            totalItems={activeData.length}
            onPrev={pag.prev}
            onNext={pag.next}
            onGoTo={pag.goTo}
            perPage={pag.perPage}
            onPerPageChange={pag.setPerPage}
          />

          <BulkActionBar count={activeSel.count} onClear={activeSel.clear} actions={bulkActions} />
        </div>
      </div>

      {/* ═══ SECTION 3: BOTTOM CHARTS — Stealer Exposure on top, Exposure Timeline below ═══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>

        {/* Exposure Timeline (rendered after Stealer Exposure via flex order) */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden", order: 2 }}>
          <div style={{ marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Exposure Timeline</div>
            <span style={{ fontSize: 12, color: t.text35 }}>Domain threat activity over time</span>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            {[
              { label: "Stealer Logs", color: "#FF4562" },
              { label: "Breaches", color: "#EA580C" },
              { label: "Mentions", color: "#3B82F6" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color }} />
                <span className="mono" style={{ fontSize: 9, color: t.text35 }}>{l.label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.gridLine} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} interval={3} tick={{ fontSize: 9, fill: t.text25, fontFamily: "'JetBrains Mono',monospace" }} />
              <YAxis axisLine={false} tickLine={false} width={30} tick={{ fontSize: 9, fill: t.text25, fontFamily: "'JetBrains Mono',monospace" }} />
              <Tooltip {...ttS} />
              <Area type="monotone" dataKey="stealerLogs" stroke="#FF4562" fill="#FF4562" fillOpacity={0.06} strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="breaches" stroke="#EA580C" fill="#EA580C" fillOpacity={0.04} strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="mentions" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.04} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stealer Exposure by Domain (rendered first via flex order) */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden", order: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Stealer Exposure by Domain</div>
            <span style={{ fontSize: 12, color: t.text35 }}>Exposure breakdown per domain</span>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            {[
              { label: "Stealer Logs", color: "#FF4562" },
              { label: "Breaches", color: "#EA580C" },
              { label: "Mentions", color: "#3B82F6" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color }} />
                <span className="mono" style={{ fontSize: 9, color: t.text35 }}>{l.label}</span>
              </div>
            ))}
          </div>
          {/* Horizontal stacked bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DOMAIN_EXPOSURE_CHART.map((d, i) => {
              const total = d.stealerLogs + d.breaches + d.mentions;
              const maxTotal = Math.max(...DOMAIN_EXPOSURE_CHART.map(x => x.stealerLogs + x.breaches + x.mentions));
              const barWidth = (total / maxTotal) * 100;
              const slPct = (d.stealerLogs / total) * 100;
              const brPct = (d.breaches / total) * 100;
              return (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 10, color: t.text50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{d.domain}</span>
                    <span className="mono" style={{ fontSize: 10, color: t.text30 }}>{total}</span>
                  </div>
                  <div style={{ width: "100%", height: 14, borderRadius: 4, background: t.bgInput, overflow: "hidden" }}>
                    <div style={{ width: `${barWidth}%`, height: "100%", display: "flex", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${slPct}%`, height: "100%", background: "#FF4562" }} />
                      <div style={{ width: `${brPct}%`, height: "100%", background: "#EA580C" }} />
                      <div style={{ flex: 1, height: "100%", background: "#3B82F6" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ CREDENTIAL DETAIL PANEL ═══ */}
      {selectedCred && (
        <>
          <div onClick={() => setSelectedCredId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, overflow: "auto", zIndex: 51, background: t.bgPanel, backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`, animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,69,98,0.1)", border: "1px solid rgba(255,69,98,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                  </div>
                  <div>
                    <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Credential Finding</span>
                    <div style={{ fontSize: 12, color: "#FF4562", marginTop: 2 }}>Botnet Data</div>
                  </div>
                </div>
                <button onClick={() => setSelectedCredId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#10005;</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>
              {[
                { label: "URL", value: selectedCred.url },
                { label: "User", value: selectedCred.user },
                { label: "Password", value: selectedCred.password },
                { label: "Password Strength", value: selectedCred.strength },
                { label: "Credential Type", value: selectedCred.type },
                { label: "Status", value: selectedCred.status },
                { label: "Discovery Date", value: selectedCred.date },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  {row.label === "Password Strength" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map(b => <div key={b} style={{ width: 10, height: 6, borderRadius: 1, background: b <= STR_VAL[row.value] ? STR_COL[row.value] : t.borderLight }} />)}</div>
                      <span style={{ fontSize: 11, color: STR_COL[row.value] }}>{row.value}</span>
                    </div>
                  ) : row.label === "URL" ? (
                    <span className="mono" style={{ fontSize: 11, color: "#3B82F6", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</span>
                  ) : row.label === "Credential Type" ? (
                    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace" }}>{row.value}</span>
                  ) : (
                    <span style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>Related Alarm ID</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{selectedCred.alarmId}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ cursor: "pointer" }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ MENTION DETAIL PANEL ═══ */}
      {selectedMention && (
        <>
          <div onClick={() => setSelectedMentionId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, overflow: "auto", zIndex: 51, background: t.bgPanel, backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`, animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Dark Web Mention</span>
                    <div style={{ fontSize: 12, color: "#F59E0B", marginTop: 2 }}>Suspicious Content</div>
                  </div>
                </div>
                <button onClick={() => setSelectedMentionId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#10005;</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>
              {[
                { label: "Platform", value: selectedMention.platform },
                { label: "Status", value: selectedMention.status },
                { label: "Discovery Date", value: selectedMention.date },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55, display: "block", marginBottom: 6 }}>Source</span>
                <span className="mono" style={{ fontSize: 11, color: "#3B82F6", wordBreak: "break-all" }}>{selectedMention.source}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>Related Alarm ID</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{selectedMention.alarmId}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ cursor: "pointer" }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
