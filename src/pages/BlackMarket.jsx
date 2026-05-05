import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SortHeader, useSort, usePagination, Pagination, exportCSV, ExportButton, RowChevron, CopyCell, TimeCell, stickyHeaderStyle, useSelection, Checkbox, BulkActionBar, useTimeRange, TimeRangeFilter } from "../components/TableUtils";

// ── Dummy stealer log domains (realistic from screenshots) ──
const STEALER_DOMAINS = "android.instagram.com | androidapp.remitly.com | mi.cps-dom.com | briansclub.ac | es.khanacademy.org | shop.voopoo.com | client.roblox.com | workana.zendesk.com | app-vlc.hotmart.com | login.coinbase.com | roblox.com | sms-man.com | login.blockchain.com | myaccount.nytimes.com | auth.uber.com | signup.live.com | accounts.uber.com | roblox.com | wordpress.com | shopify.com | certificacioninternacionaldema.club.hotmart.com | disneyplus.disney.com | instagram.com | walmart.com | auth3.uber.com | account.protonvpn.com | netflix.com | elementvape.com | domex-online.iplus.com.do | signup.live.com | shopify.com | login.microsoftonline.com | armylegacychk.xyz | identity.walmart.com | auth.services.adobe.com | amazon.com | accounts.google.com | account.ubisoft.com | mediaclient.netflix.com | account.skrill.com | platform.socradar.com | sso.crunchyroll.com | portal.azure.com | auth.openai.com";

// ── Listing data (enriched from screenshots) ──
const LISTINGS = [
  {
    id: 31162210, source: "Russian Market", asset: "platform.socradar.com", price: "$10.00",
    country: "DO", countryName: "Dominican Republic", province: "Santiago Province",
    isp: "Compania Dominicana de Telefonos S. A.", stealer: "rhamadanthys",
    vendor: "d0####ey [platinum]", date: "2025-10-24", alarmId: 77981809,
    relatedAsset: "platform.socradar.com", status: "Open", severity: "high",
    fileSize: "3.78Mb", fileName: "archive.zip",
    domains: STEALER_DOMAINS,
  },
  {
    id: 31162198, source: "Russian Market", asset: "academy.socradar.io", price: "$10.00",
    country: "LK", countryName: "Sri Lanka", province: "Western Province",
    isp: "Hutchison Telecommunications Lanka (Private) Limited", stealer: "acreed",
    vendor: "acreed [Diamond]", date: "2025-10-07", alarmId: 77981745,
    relatedAsset: "academy.socradar.io", status: "Open", severity: "medium",
    fileSize: "0.02Mb", fileName: "archive.zip",
    domains: "accounts.google.com | accountscenter.facebook.com | web.facebook.com | beautiful.ai | facebook.com | instagram.com | userbenchmark.com | facebook.com | web.facebook.com | linkedin.com | github.com | bugcrowd.com | identity.bugcrowd.com | hackerone.com | academy.socradar.io | ctf.cybersecuritychallenge.ie | login.live.com | play.bcactf.com | careerdoor.biz | ctf-spcs.mf.grsu.by | elearning.securityblue.team | linkedin.com | tryhackme.com",
  },
  {
    id: 31148903, source: "Russian Market", asset: "socradar.com", price: "$10.00",
    country: "US", countryName: "United States", province: "California",
    isp: "Comcast Cable Communications LLC", stealer: "lumma",
    vendor: "kr####ev [Gold]", date: "2025-10-03", alarmId: 77945210,
    relatedAsset: "socradar.com", status: "Open", severity: "critical",
    fileSize: "12.4Mb", fileName: "logs_pack.zip",
    domains: "mail.google.com | accounts.google.com | login.microsoftonline.com | portal.azure.com | socradar.com | platform.socradar.com | github.com | slack.com | app.hubspot.com | linkedin.com | auth.openai.com | netflix.com",
  },
  {
    id: 31135501, source: "2easy Shop", asset: "fastpay.co.id", price: "$10.00",
    country: "ID", countryName: "Indonesia", province: "Jakarta",
    isp: "PT Telkom Indonesia", stealer: "redline",
    vendor: "auto_shop [Silver]", date: "2025-10-03", alarmId: 77912330,
    relatedAsset: "fastpay.co.id", status: "Open", severity: "low",
    fileSize: "1.2Mb", fileName: "data.zip",
    domains: "fastpay.co.id | tokopedia.com | shopee.co.id | bukalapak.com | accounts.google.com | facebook.com | instagram.com | mail.yahoo.com",
  },
  {
    id: 31120045, source: "Russian Market", asset: "platform.socradar.com", price: "$15.00",
    country: "TR", countryName: "Turkey", province: "Ankara",
    isp: "Turk Telekom", stealer: "vidar",
    vendor: "t3####st [Diamond]", date: "2025-09-28", alarmId: 77890102,
    relatedAsset: "platform.socradar.com", status: "Closed", severity: "high",
    fileSize: "8.9Mb", fileName: "full_logs.zip",
    domains: "platform.socradar.com | mail.google.com | portal.azure.com | github.com | app.slack.com | linkedin.com | twitter.com | accounts.google.com | auth.openai.com | chat.openai.com | notion.so",
  },
  {
    id: 31098772, source: "Genesis Market", asset: "socradar.com", price: "$25.00",
    country: "DE", countryName: "Germany", province: "Bavaria",
    isp: "Deutsche Telekom AG", stealer: "raccoon",
    vendor: "b1####ck [platinum]", date: "2025-09-22", alarmId: 77856001,
    relatedAsset: "socradar.com", status: "Open", severity: "critical",
    fileSize: "22.1Mb", fileName: "browser_data.zip",
    domains: "socradar.com | platform.socradar.com | mail.google.com | outlook.office365.com | portal.azure.com | aws.amazon.com | console.cloud.google.com | github.com | gitlab.com | app.slack.com | jira.atlassian.com | confluence.atlassian.com",
  },
];

const SEV_COLOR = { critical: "#DC2626", high: "#EA580C", medium: "#CA8A04", low: "#16A34A" };
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// ── Highlight matched domains in stealer log ──
function HighlightedDomains({ text, highlight }) {
  if (!highlight) return <span>{text}</span>;
  const parts = text.split(" | ");
  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = highlight.some(h => part.trim().includes(h));
        return (
          <span key={i}>
            {isMatch ? (
              <span style={{ background: "rgba(245,158,11,0.25)", padding: "1px 2px", borderRadius: 2 }}>{part}</span>
            ) : part}
            {i < parts.length - 1 ? " | " : ""}
          </span>
        );
      })}
    </span>
  );
}

const CSV_COLS = [
  { label: "ID", field: "id" }, { label: "Severity", field: "severity" }, { label: "Asset", field: "asset" },
  { label: "Source", field: "source" }, { label: "Vendor", field: "vendor" }, { label: "Price", field: "price" },
  { label: "Date", field: "date" }, { label: "Status", field: "status" }, { label: "Country", field: "countryName" },
  { label: "Stealer", field: "stealer" }, { label: "ISP", field: "isp" },
];

// ── Dummy timeline data for Active Listings chart ──
const TIMELINE_DATA = [
  { day: "Sep 15", count: 1 }, { day: "Sep 18", count: 1 }, { day: "Sep 20", count: 2 },
  { day: "Sep 22", count: 3 }, { day: "Sep 25", count: 3 }, { day: "Sep 27", count: 2 },
  { day: "Sep 28", count: 3 }, { day: "Oct 01", count: 3 }, { day: "Oct 03", count: 5 },
  { day: "Oct 05", count: 4 }, { day: "Oct 07", count: 5 }, { day: "Oct 10", count: 4 },
  { day: "Oct 15", count: 5 }, { day: "Oct 24", count: 6 },
];

// ═══════════════════════════════════════
export default function BlackMarket() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const { sortField, sortDir, onSort, sortData } = useSort("date", "desc");
  const sel = useSelection("id");
  const { range, setRange, filterByRange } = useTimeRange("All");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filtered = filterByRange(LISTINGS.filter(l => {
    const matchSearch = !searchQuery || l.asset.includes(searchQuery.toLowerCase()) || l.source.toLowerCase().includes(searchQuery.toLowerCase()) || l.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || String(l.id).includes(searchQuery);
    const matchStatus = statusFilter === "all" || l.status.toLowerCase() === statusFilter;
    const matchSev = sevFilter === "all" || l.severity === sevFilter;
    return matchSearch && matchStatus && matchSev;
  }), "date");

  // Custom sort for severity field
  const sorted = sortField === "severity"
    ? [...filtered].sort((a, b) => {
        const diff = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
        return sortDir === "asc" ? diff : -diff;
      })
    : sortData(filtered);

  const pag = usePagination(sorted.length, 10);
  const pageData = pag.paginate(sorted);

  const selected = LISTINGS.find(l => l.id === selectedId);
  const totalValue = LISTINGS.reduce((s, l) => s + parseFloat(l.price.replace("$", "")), 0);
  const criticalCount = LISTINGS.filter(l => l.severity === "critical").length;
  const activeCount = LISTINGS.filter(l => l.status === "Open").length;
  const uniqueAssets = [...new Set(LISTINGS.map(l => l.asset))].length;

  // Listing duration data (days since listing)
  const now = new Date("2025-10-25");
  const durationData = LISTINGS.map(l => {
    const days = Math.max(1, Math.round((now - new Date(l.date)) / (1000 * 60 * 60 * 24)));
    return { asset: l.asset, days, severity: l.severity, id: l.id };
  }).sort((a, b) => b.days - a.days);
  const maxDays = Math.max(...durationData.map(d => d.days));

  // Marketplace counts
  const marketCounts = {};
  LISTINGS.forEach(l => { marketCounts[l.source] = (marketCounts[l.source] || 0) + 1; });
  const marketData = Object.entries(marketCounts).sort((a, b) => b[1] - a[1]);
  const maxMarket = Math.max(...marketData.map(m => m[1]));
  const marketColors = { "Russian Market": "#10B981", "Genesis Market": "#DC2626", "2easy Shop": "#3B82F6" };

  const bulkActions = [
    { label: "Mark Resolved", icon: "M20 6L9 17l-5-5", primary: true, onClick: () => sel.clear() },
    { label: "Export Selected", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", onClick: () => { exportCSV(sorted.filter(l => sel.isSelected(l.id)), CSV_COLS, "black-market-selected.csv"); } },
    { label: "Assign", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", onClick: () => { alert("Assigning " + sel.count + " items to analyst..."); sel.clear(); } },
  ];

  const pillStyle = (active) => ({
    padding: "5px 14px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
    background: active ? "rgba(255,69,98,0.12)" : t.bgHover,
    color: active ? "#FF4562" : t.text40,
  });

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ HERO BANNER ═══ */}
      <div className="glass" style={{
        padding: "18px 24px", overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,69,98,0.08)", border: "1px solid rgba(255,69,98,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase" }}>Data on Sale Monitor</span>
                <span style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 10, fontWeight: 600, color: "#DC2626" }}>
                  {criticalCount} critical listing{criticalCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ fontSize: 12, color: t.text35, marginTop: 3 }}>Tracking your assets across dark web marketplaces and forums</div>
            </div>
          </div>

          {/* Right side: inline stats + export */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {[
              { label: "Active Listings", value: activeCount, icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18", color: "#FF4562" },
              { label: "Total Value", value: `$${totalValue.toFixed(0)}`, icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", color: "#F59E0B" },
              { label: "Critical", value: criticalCount, icon: "M12 9v2m0 4h.01M10.29 3.86l-8.36 14.32A1 1 0 002.78 20h18.44a1 1 0 00.85-1.82L13.71 3.86a1 1 0 00-1.42 0z", color: "#DC2626" },
              { label: "Unique Assets", value: uniqueAssets, icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z", color: "#3B82F6" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${s.color}10`, border: `1px solid ${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><path d={s.icon} /></svg>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: t.text25, textTransform: "uppercase" }}>{s.label}</div>
                  <span className="hfont" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>{s.value}</span>
                </div>
              </div>
            ))}
            <ExportButton onClick={() => exportCSV(filtered, CSV_COLS, "black-market-export.csv")} />
          </div>
        </div>
      </div>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 380px", gap: 18,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>

        {/* ── LEFT: Detected Listings ── */}
        <div className="glass" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Header with filters */}
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Detected Listings</div>
                <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>{filtered.length} Results</span>
              </div>
              <TimeRangeFilter range={range} onRangeChange={setRange} />
            </div>

            {/* Filter pills row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {/* Severity pills */}
              {["all", "critical", "high", "medium", "low"].map(s => (
                <button key={s} onClick={() => setSevFilter(s)} style={{
                  ...pillStyle(sevFilter === s),
                  ...(s !== "all" && sevFilter === s ? { background: `${SEV_COLOR[s]}15`, color: SEV_COLOR[s] } : {}),
                }}>
                  {s === "all" ? "All Severity" : (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: SEV_COLOR[s] }} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  )}
                </button>
              ))}

              <span style={{ width: 1, height: 18, background: t.borderSection, margin: "0 4px" }} />

              {/* Status pills */}
              {["all", "open", "closed"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={pillStyle(statusFilter === s)}>
                  {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginTop: 12 }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by asset, source, vendor, or listing ID..."
                style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 12, fontFamily: "'Inter', sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "rgba(255,69,98,0.3)"}
                onBlur={e => e.target.style.borderColor = t.borderLight}
              />
            </div>
          </div>

          {/* Listing cards */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {pageData.map(listing => (
              <div
                key={listing.id}
                onClick={() => setSelectedId(listing.id)}
                className="trow"
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", cursor: "pointer",
                  background: sel.isSelected(listing.id) ? "rgba(255,69,98,0.04)" : selectedId === listing.id ? "rgba(255,69,98,0.04)" : undefined,
                  borderLeft: selectedId === listing.id ? "3px solid #FF4562" : "3px solid transparent",
                  transition: "background 0.15s",
                }}
              >
                {/* Checkbox */}
                <Checkbox checked={sel.isSelected(listing.id)} onChange={() => sel.toggle(listing.id)} />

                {/* Proof thumbnail placeholder */}
                <div style={{
                  width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                  background: t.bgHover, border: `1px solid ${t.borderLight}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span style={{ fontSize: 7, color: t.text20, fontFamily: "'Inter', sans-serif" }}>Preview</span>
                </div>

                {/* Center content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.asset}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {/* Severity badge */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10,
                      background: `${SEV_COLOR[listing.severity]}12`, fontSize: 9, fontWeight: 600,
                      color: SEV_COLOR[listing.severity], textTransform: "uppercase",
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: SEV_COLOR[listing.severity], boxShadow: `0 0 4px ${SEV_COLOR[listing.severity]}50` }} />
                      {listing.severity}
                    </span>
                    {/* Status */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 9, fontWeight: 500, color: listing.status === "Open" ? "#16A34A" : t.text30,
                      fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: listing.status === "Open" ? "#16A34A" : t.text30 }} />
                      {listing.status}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: t.text30 }}>
                    {listing.source} &middot; {listing.vendor} &middot; {listing.date}
                  </div>
                </div>

                {/* Price + chevron */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span className="mono" style={{ fontSize: 15, color: "#F59E0B", fontWeight: 700 }}>{listing.price}</span>
                  <RowChevron />
                </div>
              </div>
            ))}

            {pageData.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: t.text30, fontSize: 13 }}>
                No listings match your filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            page={pag.page} totalPages={pag.totalPages} startIdx={pag.startIdx} endIdx={pag.endIdx}
            totalItems={sorted.length} onPrev={pag.prev} onNext={pag.next} onGoTo={pag.goTo}
            perPage={pag.perPage} onPerPageChange={pag.setPerPage}
          />

          {/* Bulk Action Bar */}
          <BulkActionBar count={sel.count} onClear={sel.clear} actions={bulkActions} />
        </div>

        {/* ── RIGHT: Charts Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* a) Listing Duration */}
          <div className="glass" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Listing Duration</div>
              <span style={{ fontSize: 11, color: t.text35 }}>How long each listing has been live</span>
            </div>
            <div style={{ padding: "14px 20px" }}>
              {durationData.map((d, i) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < durationData.length - 1 ? 10 : 0 }}>
                  <span className="mono" style={{ fontSize: 10, color: t.text40, width: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{d.asset}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: t.bgHover, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.max(8, (d.days / maxDays) * 100)}%`, height: "100%", borderRadius: 4,
                      background: SEV_COLOR[d.severity],
                      opacity: 0.7,
                    }} />
                  </div>
                  <span className="mono" style={{ fontSize: 9, color: t.text30, width: 30, textAlign: "right", flexShrink: 0 }}>{d.days}d</span>
                </div>
              ))}
            </div>
          </div>

          {/* b) Active Listings Timeline */}
          <div className="glass" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Active Listings Timeline</div>
              <span style={{ fontSize: 11, color: t.text35 }}>Listing count over last 30 days</span>
            </div>
            <div style={{ padding: "14px 16px 10px" }}>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={TIMELINE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.borderLight} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text25, fontFamily: "'JetBrains Mono',monospace" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text25, fontFamily: "'JetBrains Mono',monospace" }} />
                  <Tooltip
                    contentStyle={{
                      background: t.bgTooltip, backdropFilter: "blur(12px)",
                      border: `1px solid ${t.borderMed}`, borderRadius: 10,
                      padding: "8px 12px", fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                    }}
                    labelStyle={{ color: t.text40, fontSize: 10, marginBottom: 4 }}
                    itemStyle={{ color: "#FF4562" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#FF4562" fill="#FF4562" fillOpacity={0.06} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* c) By Marketplace */}
          <div className="glass" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>By Marketplace</div>
              <span style={{ fontSize: 11, color: t.text35 }}>Listings per platform</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {marketData.map(([name, count], i) => (
                <div key={name} style={{ marginBottom: i < marketData.length - 1 ? 14 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: t.text50, fontWeight: 500 }}>{name}</span>
                    <span className="mono" style={{ fontSize: 11, color: t.text40, fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: t.bgHover, overflow: "hidden" }}>
                    <div style={{
                      width: `${(count / maxMarket) * 100}%`, height: "100%", borderRadius: 5,
                      background: marketColors[name] || "#A855F7",
                      opacity: 0.8,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DETAIL PANEL (slide from right) ═══ */}
      {selected && (
        <>
          <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
            overflow: "auto", zIndex: 51, background: t.bgPanel,
            backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`,
            animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {/* Header with severity bar */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}`, background: `linear-gradient(135deg, ${SEV_COLOR[selected.severity]}08 0%, transparent 60%)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEV_COLOR[selected.severity] }} />
                    <span className="mono" style={{ fontSize: 10, color: SEV_COLOR[selected.severity], textTransform: "uppercase", fontWeight: 600 }}>{selected.severity}</span>
                  </div>
                  <span className="hfont" style={{ fontSize: 20, fontWeight: 700 }}>#{selected.id}</span>
                  <div className="mono" style={{ fontSize: 10, color: t.text30, marginTop: 2 }}>Data on Sale Listing</div>
                </div>
                <button onClick={() => setSelectedId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>

            {/* Proof image placeholder */}
            <div style={{ padding: "16px 24px 0" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Proof Image</div>
              <div style={{
                width: "100%", height: 180, borderRadius: 12, overflow: "hidden",
                background: t.bgInput, border: `1px solid ${t.borderLight}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span style={{ fontSize: 11, color: t.text20 }}>Stealer log screenshot</span>
                <span className="mono" style={{ fontSize: 9, color: t.text15 }}>{selected.fileName} — {selected.fileSize}</span>
              </div>
            </div>

            {/* Overview section */}
            <div style={{ padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>

              {[
                { label: "Source", value: selected.source },
                { label: "Related Assets", value: selected.relatedAsset, isAsset: true },
                { label: "Related Alarm ID", value: `#${selected.alarmId}`, isAlarm: true },
                { label: "Country", value: `${selected.countryName} (${selected.country})` },
                { label: "Province", value: selected.province },
                { label: "Date", value: selected.date },
                { label: "Price", value: selected.price, isPrice: true },
                { label: "Stealer", value: selected.stealer },
                { label: "Vendor", value: selected.vendor },
                { label: "ISP", value: selected.isp },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  {row.isAsset ? (
                    <CopyCell value={row.value} style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", fontSize: 12, fontWeight: 500, fontFamily: "'JetBrains Mono',monospace" }}>{row.value}</span>
                    </CopyCell>
                  ) : row.isAlarm ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                      <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></svg>
                    </span>
                  ) : row.isPrice ? (
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>{row.value}</span>
                  ) : (
                    <span style={{ fontSize: 12, color: t.text60, textAlign: "right", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{row.value}</span>
                  )}
                </div>
              ))}

              {/* File info */}
              <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: t.bgCard, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,69,98,0.08)", border: "1px solid rgba(255,69,98,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text70 }}>{selected.fileName}</div>
                  <div className="mono" style={{ fontSize: 10, color: t.text30 }}>{selected.fileSize}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>{selected.price}</span>
              </div>

              {/* Stealer Log Preview */}
              <div style={{ marginTop: 24 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 12 }}>Stealer Log Preview</div>
                <div style={{
                  padding: "16px", borderRadius: 12,
                  background: t.bgCode, border: `1px solid ${t.borderLight}`,
                  maxHeight: 280, overflow: "auto", fontSize: 11, lineHeight: 1.7,
                  fontFamily: "'JetBrains Mono',monospace", color: t.text45,
                  wordBreak: "break-all",
                }}>
                  <HighlightedDomains text={selected.domains} highlight={["socradar.com", "platform.socradar.com", "academy.socradar.io"]} />
                </div>
                {/* Stealer info bar below log */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, padding: "8px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span className="mono" style={{ fontSize: 10, color: t.text40 }}>{selected.stealer}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span className="mono" style={{ fontSize: 10, color: t.text40 }}>{selected.countryName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>
                    <span className="mono" style={{ fontSize: 10, color: t.text40 }}>{selected.isp.split(" ").slice(0, 3).join(" ")}...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
