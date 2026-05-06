import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import HoverComment from "../components/HoverComment";

// ── Asset Types with their limits, icons, and descriptions ──
const ASSET_TYPES = [
  { key: "domain", label: "Domain", used: 1, total: 3, color: "#FF4562", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", desc: "Your company domains to monitor for dark web exposure", format: "companydomain.com" },
  { key: "ip_range", label: "IP Range", used: 1, total: 3, color: "#EA580C", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", desc: "IP address ranges to track for unauthorized access listings", format: "10.0.0.0/24" },
  { key: "company_name", label: "Company Name", used: 0, total: 1, color: "#F59E0B", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9", desc: "Brand and company names to detect dark web mentions", format: "Company Name" },
  { key: "brand_keyword", label: "Brand Keyword", used: 2, total: 5, color: "#FF4562", icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14", desc: "Keywords related to your brand to scan across dark web sources", format: "keyword" },
  { key: "vip_account", label: "VIP Account", used: 3, total: 5, color: "#A855F7", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 0112 0H6z", desc: "Executive and high-value accounts to monitor for credential leaks", format: "executive@company.com" },
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
  { id: 8, name: "elena.marchetti@socradar.io", type: "vip_account", group: "VIP Account", createdBy: "dogan.akkaya@socradar.io", date: "2025-04-15", active: true },
  { id: 9, name: "james.chen@greenanimalsbank.com", type: "vip_account", group: "VIP Account", createdBy: "dogan.akkaya@socradar.io", date: "2025-03-20", active: true },
];

// ── Top Alarms dummy ──
const TOP_ALARMS = [
  { label: "VIP Credential", count: 802, color: "#FF4562" },
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

// ── Alarm counts per asset (dummy) ──
const ASSET_ALARMS = { 1: 312, 2: 45, 3: 89, 4: 204, 5: 178, 6: 56, 7: 83 };

// ── Findings by Asset Type (with source asset attribution) ──
const FINDINGS_BY_TYPE = [
  { name: "VIP Credential Leaks", source: "simon.johnsson@greenanimals.com + 2 VIPs",   count: 882, trend: "+14%", trendDir: "up",   color: "#FF4562" },
  { name: "Dark Web Suspicious",  source: "socradar.com, greenanimalsbank keywords",     count: 468, trend: "+8%",  trendDir: "up",   color: "#F59E0B" },
  { name: "Black Market / Botnet",source: "BIN 222222, BIN 111111",                      count: 348, trend: "-3%",  trendDir: "down", color: "#3B82F6" },
  { name: "PII Exposure",         source: "socradar.com domain monitoring",              count: 306, trend: "+22%", trendDir: "up",   color: "#A855F7" },
  { name: "Stolen Credentials",   source: "IP range 10.253.3.13",                        count: 127, trend: "+5%",  trendDir: "up",   color: "#06B6D4" },
];

// ── Top Alarm-Generating Assets (which specific assets fire most) ──
const TOP_ALARM_ASSETS = [
  { rank: 1, name: "socradar.com",                    type: "Domain",  count: 312, color: "#FF4562" },
  { rank: 2, name: "BIN: 222222",                     type: "BIN",     count: 204, color: "#10B981" },
  { rank: 3, name: "BIN: 111111",                     type: "BIN",     count: 178, color: "#10B981" },
  { rank: 4, name: "simon.johnsson@greenanimals.com", type: "VIP",     count: 89,  color: "#A855F7" },
  { rank: 5, name: "socradar",                        type: "Keyword", count: 83,  color: "#FF4562" },
  { rank: 6, name: "greenanimalsbank",                type: "Keyword", count: 56,  color: "#FF4562" },
  { rank: 7, name: "10.253.3.13",                     type: "IP",      count: 45,  color: "#EA580C" },
];

// ── Recent Scan Activity ──
const RECENT_SCANS = [
  { asset: "socradar.com",                    newFindings: 3, status: "new",   time: "2m ago" },
  { asset: "BIN: 222222",                     newFindings: 1, status: "new",   time: "3m ago" },
  { asset: "greenanimalsbank",                newFindings: 0, status: "clean", time: "4m ago" },
  { asset: "simon.johnsson@greenanimals.com", newFindings: 0, status: "clean", time: "4m ago" },
  { asset: "socradar",                        newFindings: 2, status: "new",   time: "5m ago" },
  { asset: "10.253.3.13",                     newFindings: 0, status: "clean", time: "5m ago" },
  { asset: "BIN: 111111",                     newFindings: 0, status: "clean", time: "5m ago" },
];

// ── Radar chart labels ──
const RADAR_LABELS = [
  "Stealer Logs", "Dark Forums", "Telegram", "Marketplaces",
  "Ransomware", "Paste Sites", "Data Brokers", "Code Repos",
];
const RADAR_VALUES = [0.92, 0.78, 0.85, 0.65, 0.48, 0.72, 0.55, 0.80];

// ── Mini Donut Chart ──
function MiniDonut({ segments, size = 100, t }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke={t?.borderSection || "rgba(255,255,255,0.04)"} strokeWidth="12" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.count / total : 0;
        const offset = cumulative;
        cumulative += pct;
        return (
          <circle
            key={i} cx="50" cy="50" r={radius} fill="none"
            stroke={seg.color || "#FF4562"} strokeWidth="12"
            strokeDasharray={`${pct * circumference} ${circumference}`}
            strokeDashoffset={-offset * circumference}
            transform="rotate(-90 50 50)"
            style={{ transition: "all 0.5s" }}
          />
        );
      })}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill={t?.text || "#E8ECF1"} fontSize="16" fontWeight="800" fontFamily="'Red Hat Display', sans-serif">
        {total}
      </text>
    </svg>
  );
}

// ── Radar Chart (SVG) ──
function RadarChart({ t }) {
  const cx = 130, cy = 130, maxR = 100;
  const n = RADAR_LABELS.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (i, r) => {
    const angle = angleStep * i - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };

  const rings = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = RADAR_VALUES.map((v, i) => getPoint(i, v * maxR));
  const polygon = dataPoints.map(p => p.join(",")).join(" ");

  return (
    <svg width="260" height="260" viewBox="0 0 260 260" style={{ display: "block", margin: "0 auto" }}>
      {/* Grid rings */}
      {rings.map((r, i) => (
        <polygon key={i} points={Array.from({ length: n }, (_, j) => getPoint(j, r * maxR).join(",")).join(" ")}
          fill="none" stroke={t.border} strokeWidth="1" />
      ))}
      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const [ex, ey] = getPoint(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke={t.border} strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(255,69,98,0.08)" stroke="#FF4562" strokeWidth="1.5" />
      {/* Data dots */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#FF4562" />
      ))}
      {/* Labels */}
      {RADAR_LABELS.map((label, i) => {
        const [x, y] = getPoint(i, maxR + 20);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fill={t.text35} fontSize="8" fontFamily="'JetBrains Mono',monospace"
            style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {label}
          </text>
        );
      })}
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
  const [expandedType, setExpandedType] = useState("domain");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const totalUsed = ASSET_TYPES.reduce((s, a) => s + a.used, 0);
  const totalAvailable = ASSET_TYPES.reduce((s, a) => s + a.total, 0);
  const overallPct = totalAvailable > 0 ? Math.round((totalUsed / totalAvailable) * 100) : 0;
  const unconfigured = ASSET_TYPES.filter(a => a.used === 0);
  const configuredTypes = ASSET_TYPES.filter(a => a.used > 0);

  const filteredAssets = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  // Recommendations: asset types with room to grow
  const recommendations = ASSET_TYPES
    .filter(a => a.used < a.total)
    .map(a => {
      const remaining = a.total - a.used;
      if (a.used === 0) {
        return { ...a, title: `Add ${a.label}`, description: a.desc, remaining };
      }
      return { ...a, title: `Add ${remaining} more ${a.label}${remaining > 1 ? "s" : ""}`, description: `${a.used} of ${a.total} slots used. ${a.desc}`, remaining };
    })
    .slice(0, 5);

  const ringColor = overallPct < 40 ? "#DC2626" : overallPct < 70 ? "#F59E0B" : "#16A34A";
  const ringCircumference = 2 * Math.PI * 24;
  const totalFindings = 967;
  const activeGroups = configuredTypes.length;
  const totalGroups = ASSET_TYPES.length;

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ SECTION 1: HERO BANNER ═══ */}
      <div className="glass" style={{
        padding: "16px 20px", overflow: "visible", position: "relative",
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <HoverComment anchorKey="protection-coverage.attention" top={10} right={12} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Coverage ring — 60px */}
          <div style={{ position: "relative", flexShrink: 0, width: 60, height: 60 }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" fill="none" stroke={t.bgElevated} strokeWidth="6" />
              <circle cx="30" cy="30" r="24" fill="none" stroke={ringColor} strokeWidth="6"
                strokeDasharray={`${(overallPct / 100) * ringCircumference} ${ringCircumference}`}
                strokeLinecap="round" transform="rotate(-90 30 30)" style={{ transition: "all 0.6s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="hfont" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>{overallPct}%</span>
            </div>
          </div>

          {/* Status label + description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{
              fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
              color: "#DC2626", marginBottom: 4,
            }}>
              Needs Attention
            </div>
            <div style={{ fontSize: 13, color: t.text50, lineHeight: 1.5 }}>
              <span style={{ color: t.text, fontWeight: 600 }}>{totalUsed}</span> of <span style={{ color: t.text, fontWeight: 600 }}>{totalAvailable}</span> asset slots configured across <span style={{ color: t.text, fontWeight: 600 }}>{activeGroups}</span> categories
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 36, background: t.borderSection, flexShrink: 0 }} />

          {/* 4 inline compact stats */}
          <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
            {[
              { label: "Asset Groups", value: `${activeGroups}/${totalGroups}`, color: "#3B82F6" },
              { label: "Active Assets", value: `${totalUsed}`, color: "#10B981" },
              { label: "Total Findings", value: totalFindings.toLocaleString(), color: "#A855F7" },
              { label: "Last Full Scan", value: "5m ago", color: "#06B6D4" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase", color: t.text25, marginBottom: 4 }}>{stat.label}</div>
                <span className="hfont" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: TWO-COLUMN LAYOUT (Asset Management | Coverage Data) ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)", gap: 18, alignItems: "start",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>

        {/* ─── LEFT COLUMN: Monitored Assets ─── */}
        <div className="glass" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Monitored Assets</div>
                <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Expand to view & manage</span>
              </div>
              <button
                onClick={() => setAddModalOpen(true)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: "#FF4562", color: "#fff", fontSize: 11, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  display: "flex", alignItems: "center", gap: 5,
                  boxShadow: "0 2px 8px rgba(255,69,98,0.25)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Asset
              </button>
            </div>
            {/* Search bar */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                style={{
                  width: "100%", padding: "8px 12px 8px 32px", fontSize: 11,
                  fontFamily: "'Inter', sans-serif", background: t.bgInput,
                  border: `1px solid ${t.borderLight}`, borderRadius: 8,
                  color: t.text, outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(255,69,98,0.3)"}
                onBlur={e => e.target.style.borderColor = t.borderLight}
              />
            </div>
          </div>

          {/* All asset types — flat list, always expanded */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {ASSET_TYPES.map(assetType => {
              const typeAssets = filteredAssets.filter(a => a.type === assetType.key);
              const pct = assetType.total > 0 ? (assetType.used / assetType.total) * 100 : 0;
              const remaining = assetType.total - assetType.used;

              return (
                <div key={assetType.key} style={{ borderBottom: `1px solid ${t.borderSection}` }}>
                  {/* Section header — always visible, subtle */}
                  <div style={{
                    padding: "10px 20px", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: `${assetType.color}12`, border: `1px solid ${assetType.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={assetType.color} strokeWidth="2"><path d={assetType.icon} /></svg>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text70, flex: 1 }}>{assetType.label}</span>
                    <span className="mono" style={{ fontSize: 10, color: t.text35, marginRight: 8 }}>{assetType.used}/{assetType.total}</span>
                    <div style={{ width: 48, height: 3, borderRadius: 1.5, background: t.bgElevated, overflow: "hidden", flexShrink: 0 }}>
                      <div style={{ height: "100%", borderRadius: 1.5, background: assetType.color, width: `${pct}%`, opacity: 0.7 }} />
                    </div>
                  </div>

                  {/* Content — always shown */}
                  <div style={{ padding: "0 20px 10px" }}>
                    {/* Remaining slots notice */}
                    {remaining > 0 && remaining < assetType.total && (
                      <div style={{
                        padding: "5px 10px", borderRadius: 6, marginBottom: 6,
                        background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.12)",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span style={{ fontSize: 9, color: "#16A34A" }}>{remaining} of {assetType.total} slots remaining — maximize coverage</span>
                      </div>
                    )}
                    {/* Description — subtle */}
                    <div style={{ fontSize: 10, color: t.text25, lineHeight: 1.5, marginBottom: 6 }}>{assetType.desc}</div>
                    {/* Asset list */}
                    {typeAssets.length > 0 ? typeAssets.map(asset => (
                      <div key={asset.id} style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                        borderRadius: 6, marginBottom: 2, background: t.bgCard,
                        border: `1px solid ${t.border}`,
                      }}>
                        <span className="mono" style={{ fontSize: 11, color: t.text60, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.name}</span>
                        <span className="tag" style={{ background: asset.active ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)", color: asset.active ? "#16A34A" : "#DC2626", fontSize: 8, padding: "2px 6px", borderRadius: 4 }}>
                          {asset.active ? "ACTIVE" : "PAUSED"}
                        </span>
                        <span className="mono" style={{ fontSize: 9, color: t.text25 }}>5m ago</span>
                        <span className="mono" style={{ fontSize: 10, color: t.text40, minWidth: 24, textAlign: "right" }}>{ASSET_ALARMS[asset.id] || 0}</span>
                      </div>
                    )) : (
                      <button onClick={() => { setAddModalType(assetType.key); setAddModalOpen(true); }} style={{
                        width: "100%", padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                        border: `1px dashed ${assetType.color}30`, background: "transparent",
                        color: assetType.color, fontSize: 10, fontWeight: 500,
                        fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add {assetType.label}
                      </button>
                    )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Coverage Data Stack ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 1. SLOT UTILIZATION */}
          <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase" }}>Slot Utilization</div>
              <span className="mono" style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>{totalUsed}/{totalAvailable} slots used</span>
            </div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, display: "block", marginBottom: 12 }}>Are you using your coverage?</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {ASSET_TYPES.map((a) => {
                const pct = a.total > 0 ? (a.used / a.total) * 100 : 0;
                const remaining = a.total - a.used;
                const fillColor = a.used === 0 ? "#DC2626" : pct < 50 ? "#F59E0B" : pct < 100 ? "#16A34A" : "#10B981";
                const status = a.used === 0 ? { label: "EMPTY", color: "#DC2626" }
                  : remaining === 0 ? { label: "FULL", color: "#16A34A" }
                  : { label: `+${remaining} AVAIL`, color: "#F59E0B" };
                return (
                  <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: `${a.color}12`, border: `1px solid ${a.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2"><path d={a.icon} /></svg>
                    </div>
                    <span style={{ width: 124, fontWeight: 600, color: t.text60, flexShrink: 0 }}>{a.label}</span>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: t.bgElevated, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: fillColor, opacity: 0.85, transition: "width 0.4s" }} />
                    </div>
                    <span className="mono" style={{ width: 36, textAlign: "right", fontWeight: 700, fontSize: 11, color: t.text }}>{a.used}/{a.total}</span>
                    <span className="mono" style={{ width: 70, textAlign: "right", fontSize: 9, fontWeight: 700, color: status.color, letterSpacing: "0.04em" }}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. SOURCE COVERAGE RADAR — radar + legend side by side */}
          <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Source Coverage</div>
                <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Detection depth by channel</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.06em", textTransform: "uppercase" }}>AVG</div>
                <span className="hfont" style={{ fontSize: 18, fontWeight: 700, color: "#16A34A" }}>72%</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><RadarChart t={t} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {RADAR_LABELS.map((label, i) => {
                  const pct = Math.round(RADAR_VALUES[i] * 100);
                  const color = pct >= 75 ? "#16A34A" : pct >= 55 ? "#F59E0B" : "#DC2626";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < RADAR_LABELS.length - 1 ? `1px solid ${t.borderRow}` : "none" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 1.5, background: color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, color: t.text60 }}>{label}</span>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. FINDINGS BY ASSET TYPE */}
          <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase" }}>Findings by Asset Type</div>
              <span className="mono" style={{ fontSize: 11, color: "#FF4562", fontWeight: 700 }}>{FINDINGS_BY_TYPE.reduce((s, f) => s + f.count, 0).toLocaleString()} total</span>
            </div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, display: "block", marginBottom: 12 }}>What your assets are catching</span>
            <div>
              {FINDINGS_BY_TYPE.map((f, i) => {
                const trendColor = f.trendDir === "up" ? "#FF4562" : "#16A34A";
                const ArrowIcon = f.trendDir === "up"
                  ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 14l6-6 6 6" /></svg>
                  : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 10l6 6 6-6" /></svg>;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderBottom: i < FINDINGS_BY_TYPE.length - 1 ? `1px solid ${t.borderRow}` : "none",
                  }}>
                    <div style={{ width: 4, height: 32, borderRadius: 2, background: f.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text70 }}>{f.name}</div>
                      <div className="mono" style={{ fontSize: 10, color: t.text35, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>From: {f.source}</div>
                    </div>
                    <span className="hfont" style={{ fontSize: 16, fontWeight: 700, color: f.color, minWidth: 50, textAlign: "right" }}>{f.count}</span>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 3, color: trendColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, minWidth: 48, justifyContent: "flex-end" }}>
                      {ArrowIcon}{f.trend}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. TOP ALARM-GENERATING ASSETS */}
          <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase" }}>Top Alarm-Generating Assets</div>
              <span className="mono" style={{ fontSize: 11, color: t.text50, fontWeight: 600 }}>{TOP_ALARM_ASSETS.reduce((s, a) => s + a.count, 0).toLocaleString()} total</span>
            </div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, display: "block", marginBottom: 12 }}>Which assets trigger the most alarms</span>
            <div>
              {TOP_ALARM_ASSETS.map((a, i) => {
                const max = TOP_ALARM_ASSETS[0].count;
                const barPct = (a.count / max) * 100;
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "16px minmax(0,1fr) 70px 60px 36px",
                    alignItems: "center", gap: 10, padding: "8px 0",
                    borderBottom: i < TOP_ALARM_ASSETS.length - 1 ? `1px solid ${t.borderRow}` : "none",
                  }}>
                    <span className="mono" style={{ fontSize: 9, color: t.text25, fontWeight: 700 }}>{a.rank}</span>
                    <span className="mono" style={{ fontSize: 11, color: t.text70, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                    <span className="tag" style={{ background: `${a.color}14`, color: a.color, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, justifySelf: "start", letterSpacing: "0.04em" }}>{a.type}</span>
                    <div style={{ height: 5, borderRadius: 3, background: t.bgElevated, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barPct}%`, background: a.color, opacity: 0.75 }} />
                    </div>
                    <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: a.color, textAlign: "right" }}>{a.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. RECENT SCAN ACTIVITY */}
          <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase" }}>Recent Scan Activity</div>
              <span className="mono" style={{ fontSize: 11, color: "#16A34A", fontWeight: 700 }}>All scanned &lt;5m ago</span>
            </div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, display: "block", marginBottom: 12 }}>Latest scans across your assets</span>
            <div>
              {RECENT_SCANS.map((s, i) => {
                const isNew = s.status === "new";
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "minmax(0,1fr) auto 80px 70px",
                    alignItems: "center", gap: 12, padding: "7px 0", fontSize: 11,
                    borderBottom: i < RECENT_SCANS.length - 1 ? `1px solid ${t.borderRow}` : "none",
                  }}>
                    <span className="mono" style={{ fontSize: 11, color: t.text60, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.asset}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: isNew ? "#F59E0B" : "transparent" }}>{isNew ? `+${s.newFindings} new finding${s.newFindings > 1 ? "s" : ""}` : "—"}</span>
                    <span className="tag" style={{
                      background: isNew ? "rgba(255,69,98,0.10)" : "rgba(22,163,74,0.10)",
                      color: isNew ? "#FF4562" : "#16A34A",
                      fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                      letterSpacing: "0.04em", justifySelf: "end",
                    }}>{isNew ? "NEW HITS" : "CLEAN"}</span>
                    <span className="mono" style={{ fontSize: 9, color: t.text30, textAlign: "right" }}>{s.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. COVERAGE GAPS */}
          {unconfigured.length > 0 && (
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4, paddingLeft: 2 }}>Coverage Gaps</div>
              <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, paddingLeft: 2 }}>Unconfigured asset types leaving blind spots</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {unconfigured.map((g) => (
                  <div key={g.key}
                    onClick={() => { setAddModalType(g.key); setAddModalOpen(true); }}
                    style={{
                      padding: "11px 14px", borderRadius: 10, cursor: "pointer",
                      background: "rgba(255,69,98,0.05)", border: "1px solid rgba(255,69,98,0.18)",
                      display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,69,98,0.08)"; e.currentTarget.style.borderColor = "rgba(255,69,98,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,69,98,0.05)"; e.currentTarget.style.borderColor = "rgba(255,69,98,0.18)"; }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: "rgba(255,69,98,0.10)", border: "1px solid rgba(255,69,98,0.20)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><path d={g.icon} /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{g.label} — 0/{g.total} configured</div>
                      <div style={{ fontSize: 10.5, color: t.text40, marginTop: 2, lineHeight: 1.4 }}>{g.desc}. Dark web mentions targeting this category will be missed.</div>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: "#FF4562", fontWeight: 700, flexShrink: 0, letterSpacing: "0.04em" }}>+ Add Now</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. RECOMMENDATIONS */}
          <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Recommendations</div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, display: "block", marginBottom: 12 }}>Improve your coverage</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recommendations.map((rec) => (
                <div key={rec.key} style={{
                  padding: "10px 12px", borderRadius: 9,
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${rec.color}`,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                  onClick={() => { setAddModalType(rec.key); setAddModalOpen(true); }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${rec.color}40`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: `${rec.color}12`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={rec.color} strokeWidth="2"><path d={rec.icon} /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text70 }}>{rec.title}</div>
                    <div style={{ fontSize: 10.5, color: t.text35, lineHeight: 1.4, marginTop: 1 }}>{rec.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TOP 5 SOURCES — full width below grid ═══ */}
      <div className="glass" style={{
        padding: "18px 24px", overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 14 }}>Top 5 Most Used Sources</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {TOP_SOURCES.map((source, i) => {
            const colors = ["#FF4562", "#A855F7", "#3B82F6", "#F59E0B", "#10B981"];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: `${colors[i]}15`, border: `1px solid ${colors[i]}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="hfont" style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: t.text60 }}>{source.label}</span>
                  <div className="mono" style={{ fontSize: 9, color: t.text25, marginTop: 2 }}>{source.count} sources</div>
                </div>
              </div>
            );
          })}
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
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,69,98,0.1)", border: "1px solid rgba(255,69,98,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Add New Asset</span>
              </div>
              <button onClick={() => setAddModalOpen(false)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.bgElevated, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Steps indicator */}
            <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#FF4562", marginBottom: 4 }}>Asset Type</div>
                <div className="mono" style={{ fontSize: 9, color: t.text30 }}>STEP 1</div>
                <div style={{ height: 2, background: "#FF4562", borderRadius: 1, marginTop: 8 }} />
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
                      color: t.text, fontSize: 13, fontFamily: "'Inter', sans-serif",
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
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
              }}>
                Cancel
              </button>
              <button style={{
                flex: 2, padding: "12px", borderRadius: 10, border: "none",
                background: "#FF4562", color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Red Hat Display', sans-serif",
                boxShadow: "0 4px 16px rgba(255,69,98,0.3)",
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
