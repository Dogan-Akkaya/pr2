import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// ── Asset Types with their limits, icons, and descriptions ──
const ASSET_TYPES = [
  { key: "domain", label: "Domain", used: 1, total: 3, color: "#E8463A", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", desc: "Your company domains to monitor for dark web exposure", format: "companydomain.com" },
  { key: "ip_range", label: "IP Range", used: 1, total: 3, color: "#EA580C", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", desc: "IP address ranges to track for unauthorized access listings", format: "10.0.0.0/24" },
  { key: "company_name", label: "Company Name", used: 0, total: 1, color: "#F59E0B", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9", desc: "Brand and company names to detect dark web mentions", format: "Company Name" },
  { key: "brand_keyword", label: "Brand Keyword", used: 2, total: 5, color: "#E8463A", icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14", desc: "Keywords related to your brand to scan across dark web sources", format: "keyword" },
  { key: "vip_account", label: "VIP Account", used: 1, total: 5, color: "#A855F7", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 0112 0H6z", desc: "Executive and high-value accounts to monitor for credential leaks", format: "executive@company.com" },
  { key: "third_party", label: "Third Party Employee", used: 0, total: 3, color: "#3B82F6", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", desc: "Vendor and contractor accounts to track for supply chain risks", format: "vendor@partner.com" },
  { key: "bin_number", label: "BIN Number", used: 2, total: 5, color: "#10B981", icon: "M3 10h18V6a2 2 0 00-2-2H5a2 2 0 00-2 2v4zm0 2v4a2 2 0 002 2h14a2 2 0 002-2v-4H3z", desc: "Bank Identification Numbers to detect compromised payment cards", format: "123456" },
  { key: "swift_code", label: "SWIFT Code", used: 0, total: 2, color: "#06B6D4", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", desc: "SWIFT/BIC codes to monitor for financial fraud targeting your institution", format: "ABCDUS33" },
];

// ── Dummy Assets ──
const ASSETS = [
  { id: 1, name: "socradar.com", type: "domain", group: "Brand Keyword", createdBy: "SOCRadar", date: "2025-10-03", active: true },
  { id: 2, name: "10.253.3.13", type: "ip_range", group: "IP Range", createdBy: "dogan.akkaya@socradar.io", date: "2025-01-31", active: true },
  { id: 3, name: "simon.johnsson@greenanimals.com", type: "vip_account", group: "VIP Account", createdBy: "dogan.akkaya@socradar.io", date: "2025-01-31", active: true },
  { id: 4, name: "222222", type: "bin_number", group: "BIN Number", createdBy: "sener.molla@socradar.io", date: "2024-12-26", active: true },
  { id: 5, name: "111111", type: "bin_number", group: "BIN Number", createdBy: "sener.molla@socradar.io", date: "2024-12-26", active: true },
  { id: 6, name: "greenanimalsbank", type: "brand_keyword", group: "Brand Keyword", createdBy: "dogan.akkaya@socradar.io", date: "2024-12-02", active: true },
  { id: 7, name: "socradar", type: "brand_keyword", group: "Brand Keyword", createdBy: "SOCRadar", date: "2025-10-03", active: true },
];

// ── Top Alarms dummy ──
const TOP_ALARMS = [
  { label: "VIP Credential", count: 802, color: "#E8463A" },
  { label: "Dark Web Suspicious", count: 460, color: "#A855F7" },
  { label: "Black Market Botnet", count: 348, color: "#3B82F6" },
  { label: "PII Exposure", count: 306, color: "#F59E0B" },
  { label: "Stolen Credentials", count: 127, color: "#10B981" },
];

const TOP_SOURCES = [
  { label: "Hacker Forums", count: 7 },
  { label: "Telegram", count: 6 },
  { label: "Breach Data Check", count: 6 },
  { label: "Discord", count: 5 },
  { label: "IRC", count: 5 },
];

// ── Mini Donut Chart ──
function MiniDonut({ segments, size = 100 }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.count / total : 0;
        const offset = cumulative;
        cumulative += pct;
        return (
          <circle
            key={i} cx="50" cy="50" r={radius} fill="none"
            stroke={seg.color || "#E8463A"} strokeWidth="12"
            strokeDasharray={`${pct * circumference} ${circumference}`}
            strokeDashoffset={-offset * circumference}
            transform="rotate(-90 50 50)"
            style={{ transition: "all 0.5s" }}
          />
        );
      })}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#E8ECF1" fontSize="16" fontWeight="800" fontFamily="'Plus Jakarta Sans',sans-serif">
        {total}
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════
export default function ProtectionCoverage() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState("domain");
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [assets, setAssets] = useState(ASSETS);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const totalUsed = ASSET_TYPES.reduce((s, a) => s + a.used, 0);
  const totalAvailable = ASSET_TYPES.reduce((s, a) => s + a.total, 0);
  const overallPct = totalAvailable > 0 ? Math.round((totalUsed / totalAvailable) * 100) : 0;
  const unconfigured = ASSET_TYPES.filter(a => a.used === 0);

  const filteredAssets = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ UNCONFIGURED ALERTS ═══ */}
      {unconfigured.filter(a => !dismissedAlerts.includes(a.key)).length > 0 && (
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap",
          animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>
          {unconfigured.filter(a => !dismissedAlerts.includes(a.key)).map(asset => (
            <div key={asset.key} style={{
              flex: "1 1 280px", padding: "14px 16px", borderRadius: 12,
              background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${asset.color}12`, border: `1px solid ${asset.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={asset.color} strokeWidth="2"><path d={asset.icon} /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text70, marginBottom: 2 }}>
                  No {asset.label} configured
                </div>
                <div style={{ fontSize: 11, color: t.text35, lineHeight: 1.4 }}>
                  {asset.desc}
                </div>
              </div>
              <button
                onClick={() => { setAddModalType(asset.key); setAddModalOpen(true); }}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: asset.color, color: "#fff", fontSize: 11, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Satoshi',sans-serif", whiteSpace: "nowrap",
                  boxShadow: `0 2px 8px ${asset.color}30`,
                }}
              >
                Add Now
              </button>
              <button
                onClick={() => setDismissedAlerts(prev => [...prev, asset.key])}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: "none",
                  background: t.bgHover, color: t.text25,
                  fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ OVERALL COVERAGE SCORE ═══ */}
      <div className="glass" style={{
        padding: "24px 28px", overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Score ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={overallPct < 40 ? "#DC2626" : overallPct < 70 ? "#F59E0B" : "#16A34A"} strokeWidth="10"
                strokeDasharray={`${(overallPct / 100) * 314.16} 314.16`} strokeLinecap="round"
                transform="rotate(-90 60 60)" style={{ transition: "all 0.6s" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span className="hfont" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{overallPct}%</span>
              <span className="mono" style={{ fontSize: 8, color: t.text30, textTransform: "uppercase", letterSpacing: "0.08em" }}>Coverage</span>
            </div>
          </div>
          {/* Info */}
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 6 }}>Protection Score</div>
            <h2 className="hfont" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {overallPct < 40 ? "Your coverage needs attention" : overallPct < 70 ? "Good start — keep adding assets" : "Strong protection coverage"}
            </h2>
            <p style={{ fontSize: 13, color: t.text45, lineHeight: 1.6, marginBottom: 12 }}>
              You're monitoring <span style={{ color: t.text, fontWeight: 600 }}>{totalUsed}</span> of <span style={{ color: t.text, fontWeight: 600 }}>{totalAvailable}</span> available asset slots.
              {unconfigured.length > 0 && <> You have <span style={{ color: "#F59E0B", fontWeight: 600 }}>{unconfigured.length} asset type{unconfigured.length > 1 ? "s" : ""}</span> with no assets configured.</>}
            </p>
            <button
              onClick={() => setAddModalOpen(true)}
              style={{
                padding: "10px 22px", borderRadius: 10, border: "none",
                background: "#E8463A", color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(232,70,58,0.3)",
              }}
            >
              + Add New Asset
            </button>
          </div>
          {/* Asset type grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: 340, flexShrink: 0 }}>
            {ASSET_TYPES.map(asset => {
              const pct = asset.total > 0 ? (asset.used / asset.total) * 100 : 0;
              const isEmpty = asset.used === 0;
              return (
                <div key={asset.key} style={{
                  padding: "8px 12px", borderRadius: 10,
                  background: isEmpty ? "rgba(245,158,11,0.04)" : t.bgCard,
                  border: `1px solid ${isEmpty ? "rgba(245,158,11,0.12)" : t.borderSection}`,
                  display: "flex", alignItems: "center", gap: 8,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                  onClick={() => { setAddModalType(asset.key); setAddModalOpen(true); }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${asset.color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isEmpty ? "rgba(245,158,11,0.12)" : t.borderSection}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: `${asset.color}12`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={asset.color} strokeWidth="2"><path d={asset.icon} /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: t.text60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.label}</div>
                    <div style={{ height: 3, borderRadius: 1.5, background: t.bgElevated, marginTop: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 1.5, background: asset.color, width: `${pct}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: isEmpty ? "#F59E0B" : t.text35, fontWeight: 600 }}>
                    {asset.used}/{asset.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW: Alarms + Sources ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Top Generated Alarms */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 14 }}>Top Generated Alarms</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <MiniDonut segments={TOP_ALARMS} />
            <div style={{ flex: 1 }}>
              {TOP_ALARMS.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: t.text50, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Sources */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 14 }}>Top 5 Most Used Sources</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <MiniDonut segments={TOP_SOURCES.map((s, i) => ({ ...s, color: ["#E8463A", "#A855F7", "#3B82F6", "#F59E0B", "#10B981"][i] }))} />
            <div style={{ flex: 1 }}>
              {TOP_SOURCES.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: ["#E8463A", "#A855F7", "#3B82F6", "#F59E0B", "#10B981"][i], flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: t.text50, flex: 1 }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ASSET TABLE ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Your Assets</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Main Assets <span style={{ fontSize: 11, fontWeight: 400, color: t.text35 }}>({assets.length})</span></span>
          </div>
          {/* Search — full width */}
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assets by name, type, or creator..."
              style={{
                width: "100%", padding: "10px 14px 10px 36px", fontSize: 12,
                fontFamily: "'Satoshi',sans-serif", background: t.bgInput,
                border: `1px solid ${t.borderLight}`, borderRadius: 10,
                color: t.text, outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(232,70,58,0.3)"}
              onBlur={e => e.target.style.borderColor = t.borderLight}
            />
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: "#E8463A", color: "#fff", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 2px 8px rgba(232,70,58,0.25)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add New Asset
          </button>
        </div>

        {/* Asset type filter pills */}
        <div style={{ padding: "8px 20px 10px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setTypeFilter("all")}
            style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              background: typeFilter === "all" ? "rgba(232,70,58,0.1)" : t.bgCard,
              color: typeFilter === "all" ? "#E8463A" : t.text30,
              fontSize: 10, fontWeight: typeFilter === "all" ? 600 : 400,
              fontFamily: "'JetBrains Mono',monospace", transition: "all 0.15s",
            }}
          >
            All ({assets.length})
          </button>
          {ASSET_TYPES.filter(at => at.used > 0).map(at => {
            const count = assets.filter(a => a.type === at.key).length;
            const active = typeFilter === at.key;
            return (
              <button
                key={at.key}
                onClick={() => setTypeFilter(active ? "all" : at.key)}
                style={{
                  padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                  border: active ? `1px solid ${at.color}30` : `1px solid ${t.borderSection}`,
                  background: active ? `${at.color}0C` : t.bgCard,
                  color: active ? at.color : t.text30,
                  fontSize: 10, fontWeight: active ? 600 : 400,
                  fontFamily: "'JetBrains Mono',monospace", transition: "all 0.15s",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={active ? at.color : t.text20} strokeWidth="2" style={{ flexShrink: 0 }}><path d={at.icon} /></svg>
                {at.label}
                <span style={{ opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Table header */}
        <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "1fr 140px 180px 110px 80px", gap: 8, borderBottom: `1px solid ${t.borderSection}` }}>
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Asset</span>
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Asset Group</span>
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Created By</span>
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Date</span>
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase", textAlign: "center" }}>Status</span>
        </div>

        {/* Table rows */}
        {filteredAssets.map(asset => (
          <div key={asset.id} className="trow" style={{ display: "grid", gridTemplateColumns: "1fr 140px 180px 110px 80px", gap: 8, alignItems: "center", padding: "12px 20px" }}>
            <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{asset.name}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: t.text50 }}>{asset.group}</span>
            <span style={{ fontSize: 11, color: t.text35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.createdBy}</span>
            <span className="mono" style={{ fontSize: 10, color: t.text30 }}>{asset.date}</span>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                onClick={() => setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, active: !a.active } : a))}
                style={{
                width: 36, height: 20, borderRadius: 10, padding: 2, cursor: "pointer",
                background: asset.active ? "rgba(232,70,58,0.3)" : t.borderMed,
                transition: "all 0.2s", position: "relative",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: asset.active ? "#E8463A" : t.text30,
                  transform: asset.active ? "translateX(16px)" : "translateX(0)",
                  transition: "all 0.2s",
                }} />
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: t.text30 }}>Showing 1 to {filteredAssets.length} of {filteredAssets.length} entries</span>
          <div className="mono" style={{ fontSize: 10, color: t.text25 }}>Page 1</div>
        </div>
      </div>

      {/* ═══ ADD ASSET PANEL (slide from right) ═══ */}
      {addModalOpen && (
        <>
          <div onClick={() => setAddModalOpen(false)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0,
            width: 440, overflow: "auto", zIndex: 51,
            background: t.bgPanel, backdropFilter: "blur(20px)",
            borderLeft: `1px solid ${t.borderLight}`,
            padding: "28px 28px", animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(232,70,58,0.1)", border: "1px solid rgba(232,70,58,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Add New Asset</span>
              </div>
              <button onClick={() => setAddModalOpen(false)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.bgElevated, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Steps indicator */}
            <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#E8463A", marginBottom: 4 }}>Asset Type</div>
                <div className="mono" style={{ fontSize: 9, color: t.text30 }}>STEP 1</div>
                <div style={{ height: 2, background: "#E8463A", borderRadius: 1, marginTop: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: t.text30, marginBottom: 4 }}>Asset Details</div>
                <div className="mono" style={{ fontSize: 9, color: t.text20 }}>STEP 2</div>
                <div style={{ height: 2, background: t.bgElevated, borderRadius: 1, marginTop: 8 }} />
              </div>
            </div>

            {/* Asset type selection */}
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: t.text30, textTransform: "uppercase", marginBottom: 12 }}>Select Asset Group</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {ASSET_TYPES.map(asset => {
                const isSelected = addModalType === asset.key;
                const isFull = asset.used >= asset.total;
                return (
                  <div
                    key={asset.key}
                    onClick={() => !isFull && setAddModalType(asset.key)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, cursor: isFull ? "not-allowed" : "pointer",
                      background: isSelected ? `${asset.color}12` : t.bgCard,
                      border: `1px solid ${isSelected ? asset.color + "40" : t.border}`,
                      opacity: isFull ? 0.4 : 1, transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isSelected ? asset.color : t.text15}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: asset.color }} />}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400, color: isSelected ? t.text : t.text50 }}>{asset.label}</span>
                    <span className="mono" style={{ marginLeft: "auto", fontSize: 9, color: isFull ? "#DC2626" : t.text25 }}>
                      {asset.used}/{asset.total}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input area */}
            {(() => {
              const selected = ASSET_TYPES.find(a => a.key === addModalType);
              const available = selected ? selected.total - selected.used : 0;
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text70 }}>Add {selected?.label} Asset</div>
                      <div style={{ fontSize: 11, color: t.text35, marginTop: 2 }}>Enter your asset(s) using the correct format.</div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: t.text40, padding: "4px 10px", borderRadius: 6, background: t.bgInput, border: `1px solid ${t.borderLight}` }}>
                      Available Credits: <span style={{ fontWeight: 700, color: t.text }}>{available}</span>
                    </div>
                  </div>
                  <textarea
                    placeholder={`Enter your asset text.\n${selected?.format || ""}`}
                    style={{
                      width: "100%", height: 100, padding: "12px 14px", borderRadius: 10,
                      background: t.bgInput, border: `1px solid ${t.borderMed}`,
                      color: t.text, fontSize: 13, fontFamily: "'Satoshi',sans-serif",
                      outline: "none", resize: "none",
                    }}
                  />
                  <div className="mono" style={{ fontSize: 10, color: t.text20, marginTop: 6 }}>
                    Input data format: <span style={{ color: t.text35 }}>{selected?.format}</span>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setAddModalOpen(false)} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${t.borderMed}`,
                background: "transparent", color: t.text60, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
              }}>
                Cancel
              </button>
              <button style={{
                flex: 2, padding: "12px", borderRadius: 10, border: "none",
                background: "#E8463A", color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(232,70,58,0.3)",
              }}>
                Continue
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
