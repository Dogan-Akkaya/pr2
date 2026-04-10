import { useState, useEffect } from "react";
import { SortHeader, useSort, usePagination, Pagination, exportCSV, ExportButton, RowChevron, CopyCell, TimeCell, stickyHeaderStyle, useSelection, Checkbox, BulkActionBar, useTimeRange, TimeRangeFilter } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";

// ── Leaked Card Data ──
const CARD_LEAKS = [
  { id: 2393200, cardNumber: "1111111000111111", cvv: "-", expireDate: "-", status: "Open", discoveryDate: "2025-11-26", alarmId: 79944870, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "CENTRAL BANK OF INDIA", txType: "DEBIT", category: "CLASSIC", source: "https://gist.githubusercontent.com/LeavingLeaves/66ef78ea24f954871feeae8c660a0878/raw/edd142f5cfa0fa97e7", expired: false },
  { id: 2393199, cardNumber: "1111110111011111", cvv: "-", expireDate: "-", status: "Open", discoveryDate: "2025-11-26", alarmId: 79944869, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "CENTRAL BANK OF INDIA", txType: "DEBIT", category: "CLASSIC", source: "https://gist.githubusercontent.com/LeavingLeaves/66ef78ea24f954871feeae8c660a0878/raw/edd142f5cfa0fa97e7", expired: false },
  { id: 2393198, cardNumber: "1111110015555555555", cvv: "-", expireDate: "-", status: "Open", discoveryDate: "2025-11-13", alarmId: 79920145, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "STATE BANK OF INDIA", txType: "CREDIT", category: "GOLD", source: "https://darkforums.st/thread/leaked-cards-nov-2025", expired: false },
  { id: 2393197, cardNumber: "1111111102010111", cvv: "-", expireDate: "-", status: "Open", discoveryDate: "2025-11-13", alarmId: 79920140, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "CENTRAL BANK OF INDIA", txType: "DEBIT", category: "CLASSIC", source: "https://breachforums.bf/topic/card-dump-india", expired: true },
  { id: 2393196, cardNumber: "1111115555555555555", cvv: "-", expireDate: "-", status: "Open", discoveryDate: "2025-11-13", alarmId: 79920135, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "PUNJAB NATIONAL BANK", txType: "DEBIT", category: "PLATINUM", source: "https://cracked.sh/financial-leaks", expired: true },
  { id: 2393195, cardNumber: "1111141000110101", cvv: "-", expireDate: "-", status: "Open", discoveryDate: "2025-11-13", alarmId: 79920130, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "CENTRAL BANK OF INDIA", txType: "DEBIT", category: "CLASSIC", source: "https://dark-time.life/dumps/2025-11", expired: false },
  { id: 2393120, cardNumber: "2222221045678901", cvv: "432", expireDate: "03/27", status: "Open", discoveryDate: "2025-10-28", alarmId: 79890200, country: "FI", bin: "222222", brand: "MASTERCARD", issuer: "NORDEA BANK ABP", txType: "CREDIT", category: "WORLD", source: "https://xreactor.org/thread/cc-finland-batch", expired: false },
  { id: 2393119, cardNumber: "2222220198765432", cvv: "781", expireDate: "09/26", status: "Open", discoveryDate: "2025-10-28", alarmId: 79890195, country: "FI", bin: "222222", brand: "MASTERCARD", issuer: "OP FINANCIAL GROUP", txType: "DEBIT", category: "STANDARD", source: "https://leakbase.la/cc-dumps-oct-2025", expired: false },
  { id: 2393050, cardNumber: "1111113387654321", cvv: "-", expireDate: "-", status: "Closed", discoveryDate: "2025-10-15", alarmId: 79850100, country: "IN", bin: "111111", brand: "LOCAL BRAND", issuer: "CENTRAL BANK OF INDIA", txType: "DEBIT", category: "CLASSIC", source: "https://darkforums.io/old-dump", expired: true },
  { id: 2393049, cardNumber: "2222225567890123", cvv: "290", expireDate: "12/26", status: "Open", discoveryDate: "2025-10-12", alarmId: 79845050, country: "FI", bin: "222222", brand: "MASTERCARD", issuer: "NORDEA BANK ABP", txType: "CREDIT", category: "WORLD ELITE", source: "https://exploit.in/cc-thread-premium", expired: false },
];

// ── Top Leaks by Country ──
const TOP_LEAKS_COUNTRY = [
  { code: "IN", count: 78 },
  { code: "FI", count: 25 },
  { code: "US", count: 12 },
  { code: "BR", count: 5 },
  { code: "TR", count: 3 },
];

// ── Record Statuses ──
const RECORD_STATUS = [
  { label: "Open", count: 123, color: "#E8463A" },
  { label: "On Hold", count: 0, color: "#F59E0B" },
  { label: "Closed", count: 0, color: "#3B82F6" },
];

// ── Expiration Status ──
const EXPIRY_STATUS = [
  { label: "Expired", count: 64, color: "#E8463A" },
  { label: "Not Expired", count: 59, color: "#3B82F6" },
];

// ── CSV Export Columns ──
const CSV_COLS = [
  { label: "ID", field: "id" }, { label: "Card Number", field: "cardNumber" },
  { label: "CVV", field: "cvv" }, { label: "Expire Date", field: "expireDate" },
  { label: "Status", field: "status" }, { label: "Discovery Date", field: "discoveryDate" },
  { label: "Country", field: "country" }, { label: "Brand", field: "brand" },
  { label: "Issuer", field: "issuer" },
];

// ── Mini Donut ──
function MiniDonut({ segments, size = 110 }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.count / total : 0;
        const offset = cumulative; cumulative += pct;
        return <circle key={i} cx="55" cy="55" r={r} fill="none" stroke={seg.color} strokeWidth="14" strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={-offset * circ} transform="rotate(-90 55 55)" />;
      })}
      <text x="55" y="53" textAnchor="middle" dominantBaseline="central" fill="#E8ECF1" fontSize="16" fontWeight="800" fontFamily="'Plus Jakarta Sans'">{total}</text>
    </svg>
  );
}

// ═══════════════════════════════════════
export default function FinancialIntelligence() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { sortField, sortDir, onSort, sortData } = useSort("discoveryDate", "desc");
  const sel = useSelection("id");
  const { range, setRange, filterByRange } = useTimeRange("All");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filtered = filterByRange(CARD_LEAKS.filter(c => {
    const matchSearch = !searchQuery || c.cardNumber.includes(searchQuery) || c.country.toLowerCase().includes(searchQuery.toLowerCase()) || c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) || String(c.id).includes(searchQuery);
    const matchStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  }), "discoveryDate");
  const sorted = sortData(filtered);
  const pag = usePagination(sorted.length, 10);
  const pageData = pag.paginate(sorted);
  const selected = CARD_LEAKS.find(c => c.id === selectedId);
  const maxCountry = Math.max(...TOP_LEAKS_COUNTRY.map(c => c.count));

  const bulkActions = [
    { label: "Mark Resolved", icon: "M20 6L9 17l-5-5", primary: true, onClick: () => sel.clear() },
    { label: "Export Selected", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", onClick: () => { exportCSV(sorted.filter(c => sel.isSelected(c.id)), CSV_COLS, "financial-selected.csv"); } },
    { label: "Assign", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", onClick: () => { alert("Assigning " + sel.count + " items to analyst..."); sel.clear(); } },
  ];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ TOP STATS ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        {/* Top Leaks by Country — horizontal bar chart */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase" }}>Top Leaks</div>
            <span className="tab-btn on" style={{ padding: "3px 10px", fontSize: 10 }}>Country</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TOP_LEAKS_COUNTRY.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mono" style={{ fontSize: 11, color: t.text40, width: 22 }}>{c.code}</span>
                <div style={{ flex: 1, height: 18, borderRadius: 4, background: t.bgInput, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: "rgba(59,130,246,0.5)", width: `${(c.count / maxCountry) * 100}%`, transition: "width 0.5s" }} />
                </div>
                <span className="mono" style={{ fontSize: 10, color: t.text35, width: 24, textAlign: "right" }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Record Statuses */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 14 }}>Record Statuses</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <MiniDonut segments={RECORD_STATUS} />
            <div style={{ flex: 1 }}>
              {RECORD_STATUS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ fontSize: 12, color: t.text50, flex: 1 }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: t.text60, fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expiration Status */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 14 }}>Expiration Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <MiniDonut segments={EXPIRY_STATUS} />
            <div style={{ flex: 1 }}>
              {EXPIRY_STATUS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  <span style={{ fontSize: 12, color: t.text50, flex: 1 }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: t.text60, fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CARD LEAKS TABLE ═══ */}
      <div className="glass" style={{ overflow: "hidden", animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>{sorted.length} Total Leaks</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Compromised Cards</span>
          </div>
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by card number, country, or issuer..." style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 12, fontFamily: "'Satoshi',sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "open", "closed"].map(s => (
              <button key={s} className={`tab-btn ${statusFilter === s ? "on" : ""}`} onClick={() => setStatusFilter(s)} style={{ textTransform: "capitalize" }}>{s}</button>
            ))}
          </div>
          <TimeRangeFilter range={range} onRangeChange={setRange} />
          <ExportButton onClick={() => exportCSV(sorted, CSV_COLS, "compromised-cards.csv")} />
        </div>

        {/* Table header */}
        <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "28px 1fr 60px 80px 70px 100px 80px 40px", gap: 8, borderBottom: `1px solid ${t.borderRow}`, ...stickyHeaderStyle }}>
          <Checkbox checked={sel.allSelected(pageData)} indeterminate={sel.count > 0 && !sel.allSelected(pageData)} onChange={() => sel.toggleAll(pageData)} />
          <SortHeader label="Card Number" field="cardNumber" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="CVV" field="cvv" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Expire Date" field="expireDate" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Discovery" field="discoveryDate" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Alarm</span>
          <span></span>
        </div>

        {/* Rows */}
        {pageData.map(card => (
          <div
            key={card.id}
            onClick={() => setSelectedId(card.id)}
            className="trow"
            style={{
              display: "grid", gridTemplateColumns: "28px 1fr 60px 80px 70px 100px 80px 40px",
              gap: 8, alignItems: "center", padding: "12px 20px", cursor: "pointer",
              background: sel.isSelected(card.id) ? "rgba(232,70,58,0.06)" : selectedId === card.id ? "rgba(232,70,58,0.04)" : undefined,
              borderLeft: selectedId === card.id ? "3px solid #E8463A" : "3px solid transparent",
            }}
          >
            <Checkbox checked={sel.isSelected(card.id)} onChange={() => sel.toggle(card.id)} />
            <CopyCell value={card.cardNumber} style={{ fontSize: 12, color: t.text60, letterSpacing: "0.02em", fontFamily: "'JetBrains Mono',monospace" }} />
            <span className="mono" style={{ fontSize: 11, color: t.text35 }}>{card.cvv}</span>
            <span className="mono" style={{ fontSize: 11, color: t.text35 }}>{card.expireDate}</span>
            <span className="tag" style={{ background: card.status === "Open" ? "rgba(22,163,74,0.08)" : "rgba(255,255,255,0.04)", color: card.status === "Open" ? "#16A34A" : "rgba(232,236,241,0.3)", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 3 }}>{card.status} <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
            <TimeCell date={card.discoveryDate} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#E8463A", fontSize: 9, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>Open <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></span>
            <RowChevron />
          </div>
        ))}

        <Pagination
          page={pag.page} totalPages={pag.totalPages} startIdx={pag.startIdx} endIdx={pag.endIdx}
          totalItems={sorted.length} onPrev={pag.prev} onNext={pag.next} onGoTo={pag.goTo}
          perPage={pag.perPage} onPerPageChange={pag.setPerPage}
        />

        <BulkActionBar count={sel.count} onClear={sel.clear} actions={bulkActions} />
      </div>

      {/* ═══ DETAIL PANEL ═══ */}
      {selected && (
        <>
          <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 460,
            overflow: "auto", zIndex: 51, background: t.bgPanel,
            backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`,
            animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                  </div>
                  <div>
                    <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Card-{selected.id}</span>
                    <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 2 }}>Credit Card Leak</div>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>

            {/* Overview */}
            <div style={{ padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>

              {[
                { label: "Card Number", value: selected.cardNumber, isCopy: true },
                { label: "CVV", value: selected.cvv },
                { label: "Expire Date", value: selected.expireDate },
                { label: "Related BIN Number", value: selected.bin, isLink: true },
                { label: "Country Code", value: selected.country },
                { label: "Brand", value: selected.brand, isMono: true },
                { label: "Issuer", value: selected.issuer, isMono: true },
                { label: "Transaction Type", value: selected.txType, isMono: true },
                { label: "Category", value: selected.category, isMono: true },
                { label: "Discovery Date", value: selected.discoveryDate },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  {row.isCopy ? (
                    <CopyCell value={row.value} style={{ fontSize: 12, color: t.text60, fontFamily: "'JetBrains Mono',monospace" }} />
                  ) : row.isLink ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#3B82F6", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", cursor: "pointer" }}>
                      {row.value} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                    </span>
                  ) : row.isMono ? (
                    <span className="mono" style={{ fontSize: 12, color: t.text60, letterSpacing: "0.02em" }}>{row.value}</span>
                  ) : (
                    <span style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                  )}
                </div>
              ))}

              {/* Source */}
              <div style={{ padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55, display: "block", marginBottom: 6 }}>Source</span>
                <CopyCell value={selected.source} style={{ fontSize: 10, color: "#3B82F6", wordBreak: "break-all", lineHeight: 1.5, fontFamily: "'JetBrains Mono',monospace" }} />
              </div>

              {/* Related Alarm */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>Related Alarm ID</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{selected.alarmId}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ cursor: "pointer" }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></svg>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
