import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// ── Sortable Column Header ──
export function SortHeader({ label, field, sortField, sortDir, onSort, style }) {
  const { t } = useTheme();
  const isActive = sortField === field;
  return (
    <span
      className="mono"
      onClick={() => onSort(field)}
      style={{
        fontSize: 9, color: isActive ? (t.text50) : (t.text20),
        textTransform: "uppercase", cursor: "pointer", userSelect: "none",
        display: "inline-flex", alignItems: "center", gap: 3,
        transition: "color 0.15s", ...style,
      }}
    >
      {label}
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ opacity: isActive ? 1 : 0.3 }}>
        <path d="M5 1L8 4H2L5 1Z" fill={isActive && sortDir === "asc" ? "#E8463A" : (t.text20)} />
        <path d="M5 9L2 6H8L5 9Z" fill={isActive && sortDir === "desc" ? "#E8463A" : (t.text20)} />
      </svg>
    </span>
  );
}

// ── Sort hook ──
export function useSort(defaultField = null, defaultDir = "desc") {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDir, setSortDir] = useState(defaultDir);

  const onSort = useCallback((field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }, [sortField]);

  const sortData = useCallback((data) => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortField, sortDir]);

  return { sortField, sortDir, onSort, sortData };
}

// ── Pagination hook ──
export function usePagination(totalItems, defaultPerPage = 10) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safeP = Math.min(page, totalPages);
  const startIdx = (safeP - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, totalItems);

  const paginate = useCallback((data) => data.slice(startIdx, endIdx), [startIdx, endIdx]);

  const goTo = useCallback((p) => setPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
  const next = useCallback(() => goTo(safeP + 1), [goTo, safeP]);
  const prev = useCallback(() => goTo(safeP - 1), [goTo, safeP]);

  // Reset to page 1 when total changes (e.g. filter applied)
  useEffect(() => { setPage(1); }, [totalItems]);

  return { page: safeP, perPage, totalPages, startIdx, endIdx, paginate, goTo, next, prev, setPerPage };
}

// ── Pagination UI ──
export function Pagination({ page, totalPages, startIdx, endIdx, totalItems, onPrev, onNext, onGoTo, perPage, onPerPageChange }) {
  const { t } = useTheme();

  const pageNums = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <div style={{ padding: "10px 20px", borderTop: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: t.text30 }}>
          Showing {startIdx + 1}–{endIdx} of {totalItems}
        </span>
        {onPerPageChange && (
          <select
            value={perPage}
            onChange={e => onPerPageChange(Number(e.target.value))}
            style={{
              background: t.bgHover, border: `1px solid ${t.borderMed}`,
              borderRadius: 6, color: t.text50, fontSize: 10, padding: "3px 6px",
              fontFamily: "'JetBrains Mono',monospace", cursor: "pointer", outline: "none",
            }}
          >
            {[10, 25, 50].map(n => <option key={n} value={n} style={{ background: t.bgSidebar }}>{n}/page</option>)}
          </select>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <PaginationBtn onClick={onPrev} disabled={page <= 1} t={t}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </PaginationBtn>
        {start > 1 && <><PaginationBtn onClick={() => onGoTo(1)} t={t}>1</PaginationBtn><span style={{ color: t.text15, fontSize: 10 }}>..</span></>}
        {pageNums.map(n => (
          <PaginationBtn key={n} active={n === page} onClick={() => onGoTo(n)} t={t}>{n}</PaginationBtn>
        ))}
        {end < totalPages && <><span style={{ color: t.text15, fontSize: 10 }}>..</span><PaginationBtn onClick={() => onGoTo(totalPages)} t={t}>{totalPages}</PaginationBtn></>}
        <PaginationBtn onClick={onNext} disabled={page >= totalPages} t={t}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </PaginationBtn>
      </div>
    </div>
  );
}

function PaginationBtn({ children, active, disabled, onClick, t }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        minWidth: 28, height: 28, borderRadius: 6, border: "none",
        background: active ? "rgba(232,70,58,0.12)" : "transparent",
        color: active ? "#E8463A" : disabled ? (t.text15) : (t.text35),
        fontSize: 11, fontWeight: active ? 600 : 400, cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono',monospace", transition: "all 0.15s",
        padding: "0 4px",
      }}
      onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.background = t.bgHover; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "rgba(232,70,58,0.12)" : "transparent"; }}
    >
      {children}
    </button>
  );
}

// ── Copy Cell (click icon to copy — clicking text passes through to row) ──
export function CopyCell({ value, children, style: extraStyle }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const { t } = useTheme();

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        position: "relative", ...extraStyle,
      }}
    >
      {children || <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>}
      <svg
        onClick={handleCopy}
        width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke={copied ? "#16A34A" : (t.text20)}
        strokeWidth="2"
        style={{ flexShrink: 0, transition: "stroke 0.2s", cursor: "pointer" }}
        title={copied ? "Copied!" : "Copy"}
      >
        {copied
          ? <path d="M20 6L9 17l-5-5" />
          : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>
        }
      </svg>
    </span>
  );
}

// ── Export CSV ──
export function exportCSV(data, columns, filename = "export.csv") {
  const header = columns.map(c => c.label).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      let val = row[c.field];
      if (val == null) val = "";
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export Button ──
export function ExportButton({ onClick }) {
  const { t } = useTheme();
  return (
    <button
      onClick={onClick}
      title="Export CSV"
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: `1px solid ${t.borderMed}`,
        background: t.bgHover,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.background = t.bgElevated}
      onMouseLeave={e => e.currentTarget.style.background = t.bgHover}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text50} strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}

// ── Row Chevron (detail panel affordance) ──
export function RowChevron() {
  const { t } = useTheme();
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="2" style={{ justifySelf: "end", flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// ── Relative Time ──
export function relativeTime(dateStr) {
  if (!dateStr || dateStr === "-" || dateStr === "—") return dateStr;
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

// ── Timestamp cell with relative time + absolute tooltip ──
export function TimeCell({ date }) {
  const { t } = useTheme();
  return (
    <span className="mono" style={{ fontSize: 10, color: t.text30 }} title={date}>
      {relativeTime(date)}
    </span>
  );
}

// ── Sticky table header style (function version for theme support) ──
export const stickyHeaderStyle = {
  position: "sticky",
  top: 0,
  zIndex: 5,
  background: "rgba(12,16,33,0.98)",
  backdropFilter: "blur(12px)",
};

export function getStickyHeaderStyle(t) {
  return {
    position: "sticky",
    top: 0,
    zIndex: 5,
    background: t.bgPanel,
    backdropFilter: "blur(12px)",
  };
}

// ── Selection hook (for bulk actions) ──
export function useSelection(idField = "id") {
  const [selected, setSelected] = useState(new Set());

  const toggle = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((data) => {
    setSelected(prev => {
      const ids = data.map(d => d[idField]);
      const allSelected = ids.length > 0 && ids.every(id => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }, [idField]);

  const clear = useCallback(() => setSelected(new Set()), []);
  const isSelected = useCallback((id) => selected.has(id), [selected]);
  const allSelected = useCallback((data) => data.length > 0 && data.every(d => selected.has(d[idField])), [selected, idField]);

  return { selected, toggle, toggleAll, clear, isSelected, allSelected, count: selected.size };
}

// ── Checkbox (row or header) ──
export function Checkbox({ checked, indeterminate, onChange }) {
  const { t } = useTheme();
  return (
    <span
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 16, height: 16, borderRadius: 4, cursor: "pointer", flexShrink: 0,
        border: checked || indeterminate ? "1.5px solid #E8463A" : `1.5px solid ${t.borderStrong}`,
        background: checked ? "rgba(232,70,58,0.15)" : indeterminate ? "rgba(232,70,58,0.08)" : "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {indeterminate && !checked && (
        <div style={{ width: 8, height: 2, borderRadius: 1, background: "#E8463A" }} />
      )}
    </span>
  );
}

// ── Bulk Action Bar (floating bottom bar) ──
export function BulkActionBar({ count, onClear, actions }) {
  const { t } = useTheme();
  if (count === 0) return null;
  return (
    <div style={{
      position: "sticky", bottom: 0, zIndex: 10,
      padding: "10px 20px",
      background: t.bgPanel, backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(232,70,58,0.15)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) both",
    }}>
      <span style={{
        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        background: "rgba(232,70,58,0.12)", color: "#E8463A",
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        {count} selected
      </span>
      {actions.map((a, i) => (
        <button
          key={i}
          onClick={a.onClick}
          style={{
            padding: "6px 14px", borderRadius: 7, border: "none",
            background: a.primary ? "#E8463A" : (t.bgElevated),
            color: a.primary ? "#fff" : (t.text60),
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Satoshi',sans-serif", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 5,
          }}
          onMouseEnter={e => { if (!a.primary) e.currentTarget.style.background = t.borderStrong; }}
          onMouseLeave={e => { if (!a.primary) e.currentTarget.style.background = t.bgElevated; }}
        >
          {a.icon && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={a.icon} /></svg>}
          {a.label}
        </button>
      ))}
      <button
        onClick={onClear}
        style={{
          marginLeft: "auto", padding: "6px 12px", borderRadius: 7, border: "none",
          background: "transparent", color: t.text35,
          fontSize: 11, cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
        }}
      >
        Clear
      </button>
    </div>
  );
}

// ── Time Range Filter ──
const TIME_RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: null },
];

export function useTimeRange(defaultRange = "All") {
  const [range, setRange] = useState(defaultRange);

  const filterByRange = useCallback((data, dateField = "date") => {
    const preset = TIME_RANGES.find(r => r.label === range);
    if (!preset || preset.days === null) return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - preset.days);
    return data.filter(d => {
      const val = d[dateField];
      if (!val || val === "-" || val === "—") return true;
      return new Date(val) >= cutoff;
    });
  }, [range]);

  return { range, setRange, filterByRange, ranges: TIME_RANGES };
}

export function TimeRangeFilter({ range, onRangeChange, ranges = TIME_RANGES }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", gap: 2, background: t.bgCard, borderRadius: 8, padding: 2 }}>
      {ranges.map(r => (
        <button
          key={r.label}
          onClick={() => onRangeChange(r.label)}
          style={{
            padding: "5px 10px", borderRadius: 6, border: "none",
            background: range === r.label ? "rgba(232,70,58,0.12)" : "transparent",
            color: range === r.label ? "#E8463A" : (t.text30),
            fontSize: 10, fontWeight: range === r.label ? 600 : 400,
            cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
            transition: "all 0.15s",
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ── Filter Dropdown (multi-select with search) ──
export function FilterDropdown({ label, options, selected, onSelectionChange, accentColor = "#3B82F6", total }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const { t } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const count = selected.size;
  const displayTotal = total || options.length;

  const toggleItem = (item) => {
    const next = new Set(selected);
    if (next.has(item)) next.delete(item); else next.add(item);
    onSelectionChange(next);
  };

  const selectAll = () => onSelectionChange(new Set(filtered));
  const clearAll = () => onSelectionChange(new Set());

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "7px 10px", borderRadius: 8, cursor: "pointer",
          border: count > 0 ? `1px solid ${accentColor}30` : `1px solid ${t.borderLight}`,
          background: count > 0 ? `${accentColor}0C` : (t.bgCard),
          color: count > 0 ? accentColor : (t.text40),
          fontSize: 11, fontFamily: "'Satoshi',sans-serif",
          display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
      >
        {label}
        <span className="mono" style={{ fontSize: 9, opacity: 0.6 }}>{count}/{displayTotal}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 60,
          width: 260, maxHeight: 340, borderRadius: 12,
          background: t.bgPanel, backdropFilter: "blur(20px)",
          border: `1px solid ${t.borderMed}`,
          boxShadow: t?.name === "light" ? "0 12px 48px rgba(0,0,0,0.15)" : "0 12px 48px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
          animation: "fadeUp 0.15s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          {/* Search */}
          <div style={{ padding: "10px 12px 8px" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                autoFocus
                style={{
                  width: "100%", padding: "7px 10px 7px 28px", fontSize: 11,
                  fontFamily: "'Satoshi',sans-serif", background: t.bgInput,
                  border: `1px solid ${t.borderLight}`, borderRadius: 8,
                  color: t.text, outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = `${accentColor}40`}
                onBlur={e => e.target.style.borderColor = t.borderLight}
              />
            </div>
          </div>

          {/* Options list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 6px", maxHeight: 240 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "16px 8px", textAlign: "center", fontSize: 11, color: t.text20 }}>No matches</div>
            )}
            {filtered.map(option => (
              <div
                key={option}
                onClick={() => toggleItem(option)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                  borderRadius: 6, cursor: "pointer", transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: selected.has(option) ? `1.5px solid ${accentColor}` : `1.5px solid ${t.borderStrong}`,
                  background: selected.has(option) ? `${accentColor}20` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected.has(option) && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </span>
                <span style={{ fontSize: 11, color: selected.has(option) ? (t.text70) : (t.text45), flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option}</span>
              </div>
            ))}
          </div>

          {/* Footer: Select All / Clear */}
          <div style={{ padding: "8px 12px", borderTop: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between" }}>
            <span onClick={selectAll} style={{ fontSize: 10, color: accentColor, cursor: "pointer", fontWeight: 500 }}>Select All</span>
            <span onClick={clearAll} style={{ fontSize: 10, color: t.text30, cursor: "pointer" }}>Clear</span>
          </div>
        </div>
      )}
    </div>
  );
}
