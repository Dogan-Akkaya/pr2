import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

export default function TopBar({ title = "Dark Web Dashboard", subtitle = "Advanced Dark Web Monitoring" }) {
  const { dispatch } = useData();
  const { mode, toggle, t } = useTheme();

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
        <div className="mono" style={{ fontSize: 10, color: t.text30 }}>Last scan: 12 min ago</div>

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

        {/* Notification bell */}
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "rgba(232,70,58,0.1)", border: "1px solid rgba(232,70,58,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
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
