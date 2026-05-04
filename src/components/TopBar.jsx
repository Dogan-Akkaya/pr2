import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

function formatRelative(ts) {
  const diffMs = Math.max(0, Date.now() - ts);
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TopBar({ title = "Dark Web Dashboard", subtitle = "Advanced Dark Web Monitoring" }) {
  const { state, dispatch } = useData();
  const { mode, toggle, t } = useTheme();
  const [, tick] = useState(0);

  // Re-render every 30s so "Last scan" stays accurate without re-fetching.
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const alertCount = state.heroAlerts?.length || 0;
  const lastScanLabel = formatRelative(state.lastScanAt);

  return (
    <div style={{
      padding: "12px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: `1px solid ${t.borderSection}`,
      background: t.bgTopbar,
      backdropFilter: "blur(16px)",
      position: "sticky", top: 0, zIndex: 25,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div>
        <span className="hfont" style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
        <span className="mono" style={{ fontSize: 10, color: t.text25, marginLeft: 12 }}>{subtitle}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span title="This is a redesign prototype — all data is synthesised" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 5,
          background: "rgba(168,85,247,0.10)",
          border: "1px solid rgba(168,85,247,0.22)",
          color: "#A855F7",
          fontSize: 8.5, fontWeight: 800, letterSpacing: "0.14em",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#A855F7" }} />
          PROTOTYPE · DUMMY DATA
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }} title={`Last successful crawler ingest: ${new Date(state.lastScanAt).toLocaleString()}`}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.5)",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          <span className="mono" style={{ fontSize: 10, color: t.text40 }}>Last scan: {lastScanLabel}</span>
        </div>

        {/* Theme toggle */}
        <div
          onClick={toggle}
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: t.bgHover, border: `1px solid ${t.borderMed}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = t.bgElevated}
          onMouseLeave={e => e.currentTarget.style.background = t.bgHover}
        >
          {mode === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.text50} strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.text50} strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </div>

        {/* Notification bell with count badge */}
        <div title={`${alertCount} open critical findings`} style={{
          width: 32, height: 32, borderRadius: 10,
          background: "rgba(255,69,98,0.1)", border: "1px solid rgba(255,69,98,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", cursor: "pointer",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {alertCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              minWidth: 16, height: 16, padding: "0 4px",
              borderRadius: 8,
              background: "#FF4562", color: "#fff",
              fontSize: 9, fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${t.bgTopbar.replace(/[\d.]+\)$/, "1)")}`,
              boxShadow: "0 0 8px rgba(255,69,98,0.5)",
            }}>{alertCount > 99 ? "99+" : alertCount}</span>
          )}
        </div>
        {/* Admin gear */}
        <div
          onClick={() => dispatch({ type: "TOGGLE_ADMIN" })}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: t.bgHover, border: `1px solid ${t.borderMed}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.bgElevated; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.bgHover; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.text50} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
