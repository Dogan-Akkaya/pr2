import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
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

// ═══════════════════════════════════════
export default function BlackMarket() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { sortField, sortDir, onSort, sortData } = useSort("date", "desc");
  const sel = useSelection("id");
  const { range, setRange, filterByRange } = useTimeRange("All");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filtered = filterByRange(LISTINGS.filter(l => {
    const matchSearch = !searchQuery || l.asset.includes(searchQuery.toLowerCase()) || l.source.toLowerCase().includes(searchQuery.toLowerCase()) || l.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || String(l.id).includes(searchQuery);
    const matchStatus = statusFilter === "all" || l.status.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
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

  const bulkActions = [
    { label: "Mark Resolved", icon: "M20 6L9 17l-5-5", primary: true, onClick: () => sel.clear() },
    { label: "Export Selected", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", onClick: () => { exportCSV(sorted.filter(l => sel.isSelected(l.id)), CSV_COLS, "black-market-selected.csv"); } },
    { label: "Assign", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", onClick: () => { alert("Assigning " + sel.count + " items to analyst..."); sel.clear(); } },
  ];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ STATS ROW ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {[
          { label: "Active Listings", value: LISTINGS.filter(l => l.status === "Open").length, icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18", color: "#E8463A" },
          { label: "Total Value", value: `$${totalValue.toFixed(0)}`, icon: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6", color: "#F59E0B" },
          { label: "Unique Sources", value: [...new Set(LISTINGS.map(l => l.source))].length, icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#A855F7" },
          { label: "Affected Assets", value: [...new Set(LISTINGS.map(l => l.asset))].length, icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z", color: "#3B82F6" },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}10`, border: `1px solid ${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><path d={s.icon} /></svg>
              </div>
              <span style={{ fontSize: 11, color: t.text40, fontWeight: 500 }}>{s.label}</span>
            </div>
            <span className="hfont" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ═══ LISTINGS TABLE ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Black Market</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>{filtered.length} Listings</span>
          </div>
          {/* Search */}
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by asset, source, vendor, or listing ID..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 12, fontFamily: "'Satoshi',sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, outline: "none", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(232,70,58,0.3)"}
              onBlur={e => e.target.style.borderColor = t.borderLight}
            />
          </div>
          {/* Time range */}
          <TimeRangeFilter range={range} onRangeChange={setRange} />
          {/* Status filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "open", "closed"].map(s => (
              <button key={s} className={`tab-btn ${statusFilter === s ? "on" : ""}`} onClick={() => setStatusFilter(s)} style={{ textTransform: "capitalize" }}>{s}</button>
            ))}
          </div>
          <ExportButton onClick={() => exportCSV(filtered, CSV_COLS, "black-market-export.csv")} />
        </div>

        {/* Table header — sticky */}
        <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "28px 60px 188px 1fr 120px 100px 80px 80px 70px 72px 40px", gap: 8, borderBottom: `1px solid ${t.borderRow}`, ...stickyHeaderStyle }}>
          <Checkbox checked={sel.allSelected(pageData)} indeterminate={sel.count > 0 && !sel.allSelected(pageData)} onChange={() => sel.toggleAll(pageData)} />
          <SortHeader label="Sev" field="severity" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Proof</span>
          <SortHeader label="Asset" field="asset" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Source" field="source" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Vendor" field="vendor" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Price" field="price" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <span />
          <span />
        </div>

        {/* Rows */}
        {pageData.map(listing => (
          <div
            key={listing.id}
            onClick={() => setSelectedId(listing.id)}
            className="trow"
            style={{
              display: "grid", gridTemplateColumns: "28px 60px 188px 1fr 120px 100px 80px 80px 70px 72px 40px",
              gap: 8, alignItems: "center", padding: "10px 20px", cursor: "pointer",
              background: sel.isSelected(listing.id) ? "rgba(232,70,58,0.04)" : selectedId === listing.id ? "rgba(232,70,58,0.04)" : undefined,
              borderLeft: selectedId === listing.id ? "3px solid #E8463A" : "3px solid transparent",
            }}
          >
            <Checkbox checked={sel.isSelected(listing.id)} onChange={() => sel.toggle(listing.id)} />
            {/* Severity */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: SEV_COLOR[listing.severity], boxShadow: `0 0 6px ${SEV_COLOR[listing.severity]}50` }} />
              <span className="mono" style={{ fontSize: 9, color: SEV_COLOR[listing.severity], textTransform: "uppercase" }}>{listing.severity}</span>
            </div>
            {/* Proof thumbnail */}
            <div style={{
              width: 180, height: 44, borderRadius: 6, overflow: "hidden",
              background: t.bgHover, border: `1px solid ${t.borderLight}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            {/* Asset — copyable */}
            <CopyCell value={listing.asset} style={{ fontSize: 12, color: t.text60, fontFamily: "'JetBrains Mono',monospace", overflow: "hidden" }} />
            {/* Source */}
            <span style={{ fontSize: 11, color: t.text45 }}>{listing.source}</span>
            {/* Vendor */}
            <span className="mono" style={{ fontSize: 10, color: t.text35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.vendor}</span>
            {/* Price */}
            <span className="mono" style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>{listing.price}</span>
            {/* Date */}
            <TimeCell date={listing.date} />
            {/* Status */}
            <span className="tag" style={{
              background: listing.status === "Open" ? "rgba(22,163,74,0.08)" : t.bgHover,
              color: listing.status === "Open" ? "#16A34A" : t.text30, fontSize: 9,
              display: "inline-flex", alignItems: "center", gap: 3,
            }}>{listing.status} <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
            {/* Obtain button — only for Open listings */}
            {listing.status === "Open" ? (
              <button
                onClick={(e) => { e.stopPropagation(); }}
                style={{
                  padding: "4px 12px", borderRadius: 6, border: "none",
                  background: "#E8463A", color: "#fff", fontSize: 10, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                Obtain
              </button>
            ) : <span />}
            {/* Arrow */}
            <RowChevron />
          </div>
        ))}

        {/* Pagination */}
        <Pagination
          page={pag.page} totalPages={pag.totalPages} startIdx={pag.startIdx} endIdx={pag.endIdx}
          totalItems={sorted.length} onPrev={pag.prev} onNext={pag.next} onGoTo={pag.goTo}
          perPage={pag.perPage} onPerPageChange={pag.setPerPage}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar count={sel.count} onClear={sel.clear} actions={bulkActions} />
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
                  <div className="mono" style={{ fontSize: 10, color: t.text30, marginTop: 2 }}>Black Market Listing</div>
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
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
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(232,70,58,0.08)", border: "1px solid rgba(232,70,58,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
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
