import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { type: "section", label: "Dashboards" },
  { type: "item", label: "Dashboard", path: "/dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-4 19.5"/></svg> },
  { type: "item", label: "Global Threats", path: "/global-threats", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { type: "section", label: "Dark Web Radar" },
  { type: "item", label: "Protection Coverage", path: "/protection-coverage", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z"/></svg> },
  { type: "item", label: "Black Market", path: "/black-market", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { type: "item", label: "Customer Leaks", path: "/customer-leaks", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 11h-6m3-3v6"/></svg> },
  { type: "item", label: "Domain Exposure", path: "/domain-exposure", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10"/></svg> },
  { type: "item", label: "PII", path: "/pii", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { type: "item", label: "Executive Protection", path: "/executive-protection", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6m3-3h-6"/></svg> },
  { type: "item", label: "Third Party", path: "/third-party", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  { type: "item", label: "Telegram", path: "/telegram", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> },
  { type: "item", label: "Fraud Intelligence", path: "/fraud-intelligence", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { type: "item", label: "Insider Threat", path: "/insider-threat", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="2"/></svg> },
  { type: "section", label: "Threat Intelligence" },
  { type: "item", label: "Tactical Intelligence", path: "/tactical-intel", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M1 12h6m6 0h6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M18.4 5.6l-4.2 4.2m-4.2 4.2l-4.2 4.2"/></svg> },
  { type: "item", label: "IAB Monitor", path: "/iab-monitor", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg> },
  { type: "item", label: "Dark Web Search", path: "/dark-web-search", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { type: "section", label: "Tactical Intelligence" },
  { type: "item", label: "Dark Web News", path: "/dark-web-news", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" /></svg> },
  { type: "item", label: "Ransomware News", path: "/ransomware-news", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg> },
  { type: "section", label: "Data & Services" },
  { type: "item", label: "RFI", path: "/rfi", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { type: "item", label: "Coverage", path: "/coverage", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
  { type: "item", label: "Breach Index", path: "/breach-index", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { type: "section", label: "Operations" },
  { type: "item", label: "Incidents", path: "/incidents", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { type: "item", label: "Reports", path: "/reports", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> },
];

export default function Sidebar() {
  const location = useLocation();
  const { t, mode } = useTheme();

  return (
    <aside style={{
      width: 220, background: t.bgSidebar,
      borderRight: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
      overflow: "auto", zIndex: 30,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 20px", borderBottom: `1px solid ${t.border}` }}>
        <img
          src="/socradar-logo-white.png"
          alt="SOCRadar"
          style={{
            display: "block",
            width: 150,
            height: "auto",
            filter: mode === "light" ? "brightness(0)" : "none",
          }}
        />
      </div>

      {/* Nav */}
      <div style={{ padding: "12px 8px", flex: 1 }}>
        {NAV.map((item, i) => {
          if (item.type === "section") {
            return <div key={i} className="nav-section">{item.label}</div>;
          }
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`nav-item${isActive ? " active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Settings */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${t.border}` }}>
        <Link
          to="/settings"
          className={`nav-item${location.pathname === "/settings" ? " active" : ""}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.6-6.4l-1.4 1.4M6 6L4.6 4.6m0 14.8L6 18m12 0l1.4 1.4" />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  );
}
