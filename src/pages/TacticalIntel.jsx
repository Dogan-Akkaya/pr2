import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";

// ═══════════════════════════════════════
// IOCs — tactical indicators across types
// ═══════════════════════════════════════
const IOCS = [
  { id: 1, type: "hash", value: "a4f8b...e92c", fullValue: "a4f8b9c2d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8e92c", actor: "LockBit 4.0", campaign: "Spring loaders", firstSeen: "2026-04-22", lastSeen: "2026-04-29", confidence: "high", severity: "critical", source: "Malware Bazaar", note: "Loader binary signed with stolen cert; drops Cobalt beacon." },
  { id: 2, type: "ip", value: "185.243.115.84", fullValue: "185.243.115.84", actor: "Cl0p", campaign: "MOVEit follow-on", firstSeen: "2026-04-19", lastSeen: "2026-04-30", confidence: "high", severity: "critical", source: "Abuse IPDB", note: "C2 server. 41 hits in last 24h. NL hosting." },
  { id: 3, type: "domain", value: "secure-greenanimals[.]xyz", fullValue: "secure-greenanimals.xyz", actor: "FIN8 spinoff", campaign: "Banking phish wave", firstSeen: "2026-04-27", lastSeen: "2026-04-30", confidence: "medium", severity: "high", source: "PhishTank", note: "Typosquat targeting GreenAnimals customers. NameCheap-registered." },
  { id: 4, type: "url", value: "hxxps://login.fakeauth[.]top/oauth", fullValue: "hxxps://login.fakeauth.top/oauth", actor: "Storm-2050", campaign: "OAuth phish kit v3", firstSeen: "2026-04-15", lastSeen: "2026-04-29", confidence: "high", severity: "critical", source: "URLScan", note: "Mimics Microsoft consent screen; harvests refresh tokens." },
  { id: 5, type: "email", value: "treasury@vendoraudit-inc[.]com", fullValue: "treasury@vendoraudit-inc.com", actor: "Lazarus subgroup", campaign: "Slow Pisces", firstSeen: "2026-04-08", lastSeen: "2026-04-26", confidence: "medium", severity: "high", source: "PhishTank", note: "BEC sender targeting fintech CFOs. Spoofs vendor invoice." },
  { id: 6, type: "hash", value: "8c3e2...f1a7", fullValue: "8c3e2d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2f1a7", actor: "8Base", campaign: "Phobos rebrand", firstSeen: "2026-04-12", lastSeen: "2026-04-28", confidence: "high", severity: "critical", source: "Malware Bazaar", note: "Ransomware payload variant. Excludes EU domains in config." },
  { id: 7, type: "ip", value: "45.155.205.211", fullValue: "45.155.205.211", actor: "Akira", campaign: "Healthcare hits", firstSeen: "2026-04-21", lastSeen: "2026-04-29", confidence: "high", severity: "critical", source: "AbuseCH ThreatFox", note: "C2 + exfil staging. Tor exit overlap." },
  { id: 8, type: "domain", value: "api-update[.]live", fullValue: "api-update.live", actor: "APT41", campaign: "Supply-chain water hole", firstSeen: "2026-04-04", lastSeen: "2026-04-30", confidence: "medium", severity: "high", source: "URLHaus", note: "Trojanised SDK update server. Targets dev environments." },
  { id: 9, type: "url", value: "hxxp://203.0.113.42/wp-admin/admin-ajax.php", fullValue: "hxxp://203.0.113.42/wp-admin/admin-ajax.php", actor: "Unknown", campaign: "WP RCE 2026", firstSeen: "2026-04-25", lastSeen: "2026-04-30", confidence: "medium", severity: "medium", source: "URLHaus", note: "Mass-scanning for vulnerable WordPress plugins." },
  { id: 10, type: "email", value: "noreply@portal-onboarding[.]net", fullValue: "noreply@portal-onboarding.net", actor: "Storm-2050", campaign: "OAuth phish kit v3", firstSeen: "2026-04-18", lastSeen: "2026-04-29", confidence: "high", severity: "high", source: "PhishTank", note: "Sender for OAuth consent phish. ~2,300 hits/week." },
  { id: 11, type: "hash", value: "f1c7a...3b8e", fullValue: "f1c7a9d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b13b8e", actor: "RansomHub", campaign: "Affiliate ramp 2026", firstSeen: "2026-04-09", lastSeen: "2026-04-30", confidence: "high", severity: "critical", source: "MalShare", note: "RansomHub affiliate payload. Custom packer." },
  { id: 12, type: "ip", value: "91.219.236.14", fullValue: "91.219.236.14", actor: "FIN8 spinoff", campaign: "Banking phish wave", firstSeen: "2026-04-23", lastSeen: "2026-04-30", confidence: "high", severity: "high", source: "Abuse IPDB", note: "Phish-kit hosting. RU-bulletproof provider." },
];

// Active campaigns sidebar — aggregated from IOCs above
const CAMPAIGNS = [
  { name: "OAuth phish kit v3", actor: "Storm-2050", iocCount: 2, severity: "critical", trend: "+18%", lastActive: "5h ago", description: "Microsoft-mimic consent harvester. Token replay against M365 tenants." },
  { name: "Banking phish wave", actor: "FIN8 spinoff", iocCount: 2, severity: "high", trend: "+24%", lastActive: "2h ago", description: "Typosquat domains + RU-hosted phish kits targeting EU bank customers." },
  { name: "MOVEit follow-on", actor: "Cl0p", iocCount: 1, severity: "critical", trend: "+5%", lastActive: "37m ago", description: "Latent victims from 2023 MOVEit campaign monetised in 2026." },
  { name: "Spring loaders", actor: "LockBit 4.0", iocCount: 1, severity: "critical", trend: "stable", lastActive: "1d ago", description: "Signed loader binaries dropping Cobalt Strike beacons." },
  { name: "Healthcare hits", actor: "Akira", iocCount: 1, severity: "critical", trend: "+11%", lastActive: "12h ago", description: "Targeted ransomware against US/EU healthcare. ESXi-aware." },
  { name: "Slow Pisces", actor: "Lazarus subgroup", iocCount: 1, severity: "high", trend: "stable", lastActive: "4d ago", description: "BEC against fintech CFOs. Multi-month dwell." },
];

// AI summary insights — 3 key takeaways
const AI_INSIGHTS = [
  {
    title: "OAuth phishing is the campaign to watch",
    body: "Storm-2050's OAuth consent kit (v3) generated 2 high-confidence IOCs in the last 7 days and is trending +18%. Refresh-token harvesting bypasses MFA, so detection has to shift from credential-based alerts to OAuth grant audits.",
    color: "#FF4562",
  },
  {
    title: "FIN8 spinoff is targeting your sector",
    body: "Two of the 12 active IOCs (\"secure-greenanimals[.]xyz\", IP 91.219.236.14) belong to a banking-phish wave correlated with FIN8 tradecraft. Your typosquat monitor already caught one. Expect a second round within 7 days.",
    color: "#F59E0B",
  },
  {
    title: "Ransomware payloads are converging on signed loaders",
    body: "LockBit 4.0 and RansomHub samples this month both used valid code-signing certs (one stolen, one rented). Reliance on cert-chain trust as a detection signal is degraded — pivot to behavioural execution policies.",
    color: "#A855F7",
  },
];

const TYPE_META = {
  hash:   { label: "HASH",   color: "#A855F7", bg: "rgba(168,85,247,0.10)" },
  ip:     { label: "IP",     color: "#22D3EE", bg: "rgba(34,211,238,0.10)" },
  domain: { label: "DOMAIN", color: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  url:    { label: "URL",    color: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  email:  { label: "EMAIL",  color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
};

const SEV = { critical: "#FF4562", high: "#EA580C", medium: "#CA8A04", low: "#3B82F6" };
const SEV_BG = { critical: "rgba(255,69,98,0.12)", high: "rgba(234,88,12,0.12)", medium: "rgba(202,138,4,0.12)", low: "rgba(59,130,246,0.12)" };

const CONF_META = {
  high:   { label: "High",   color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  medium: { label: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  low:    { label: "Low",    color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};

function relTime(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr + "T00:00:00").getTime()) / (24 * 3600 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

// ═══════════════════════════════════════
export default function TacticalIntel() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filtered = useMemo(() => IOCS.filter(i => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (sevFilter !== "all" && i.severity !== sevFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${i.value} ${i.actor} ${i.campaign} ${i.note}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [typeFilter, sevFilter, search]);

  const counts = useMemo(() => {
    const c = { all: IOCS.length };
    Object.keys(TYPE_META).forEach(k => c[k] = IOCS.filter(i => i.type === k).length);
    return c;
  }, []);

  function copy(value, id) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M1 12h6m6 0h6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M18.4 5.6l-4.2 4.2m-4.2 4.2l-4.2 4.2" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>Threat Intelligence</div>
          <div className="hfont" style={{ fontSize: 17, fontWeight: 800, marginTop: 2, color: t.text }}>Tactical Intelligence</div>
          <div style={{ fontSize: 10, color: t.text45, marginTop: 2 }}>IOC feed and active campaign tracking · curated by SOCRadar Threat Research</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { label: "ACTIVE IOCS", value: IOCS.length, color: t.text },
            { label: "CRITICAL", value: IOCS.filter(i => i.severity === "critical").length, color: "#FF4562" },
            { label: "CAMPAIGNS", value: CAMPAIGNS.length, color: "#6366F1" },
            { label: "ADDED 7D", value: "+47", color: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 60 }}>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ AI INSIGHTS ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {AI_INSIGHTS.map((ai, i) => (
          <div key={i} className="glass" style={{
            padding: "14px 16px", borderTop: `2px solid ${ai.color}`,
          }}>
            <div className="mono" style={{ fontSize: 8, color: ai.color, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ai.color} strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
              AI Insight {i + 1}
            </div>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6, lineHeight: 1.3 }}>{ai.title}</div>
            <div style={{ fontSize: 10, color: t.text45, lineHeight: 1.6 }}>{ai.body}</div>
          </div>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 320px", gap: 14,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Left: IOC table */}
        <div style={{ minWidth: 0 }}>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => setTypeFilter("all")} style={{
              padding: "5px 11px", borderRadius: 6,
              border: `1px solid ${typeFilter === "all" ? "rgba(99,102,241,0.32)" : t.borderLight}`,
              background: typeFilter === "all" ? "rgba(99,102,241,0.10)" : "transparent",
              color: typeFilter === "all" ? "#6366F1" : t.text40,
              fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}>All <span style={{ color: t.text35 }}>{counts.all}</span></button>
            {Object.entries(TYPE_META).map(([k, m]) => {
              const active = typeFilter === k;
              return (
                <button key={k} onClick={() => setTypeFilter(k)} style={{
                  padding: "5px 11px", borderRadius: 6,
                  border: `1px solid ${active ? `${m.color}55` : t.borderLight}`,
                  background: active ? m.bg : "transparent",
                  color: active ? m.color : t.text40,
                  fontSize: 10, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color }} />
                  {m.label} <span style={{ color: active ? m.color : t.text35 }}>{counts[k]}</span>
                </button>
              );
            })}
            <span style={{ width: 1, height: 18, background: t.borderLight, margin: "0 4px" }} />
            {[
              { id: "all", label: "All Sev" },
              { id: "critical", label: "Critical", color: "#FF4562" },
              { id: "high", label: "High", color: "#EA580C" },
              { id: "medium", label: "Medium", color: "#CA8A04" },
            ].map(p => {
              const active = sevFilter === p.id;
              return (
                <button key={p.id} onClick={() => setSevFilter(p.id)} style={{
                  padding: "5px 11px", borderRadius: 6,
                  border: `1px solid ${active && p.color ? `${p.color}55` : active ? "rgba(99,102,241,0.32)" : t.borderLight}`,
                  background: active && p.color ? `${p.color}12` : active ? "rgba(99,102,241,0.10)" : "transparent",
                  color: active && p.color ? p.color : active ? "#6366F1" : t.text40,
                  fontSize: 10, fontWeight: 600, cursor: "pointer",
                }}>{p.label}</button>
              );
            })}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search IOC, actor, campaign…"
                style={{
                  width: "100%", padding: "7px 12px 7px 32px",
                  background: t.bgInput, border: `1px solid ${t.borderLight}`,
                  borderRadius: 6, color: t.text, fontSize: 10,
                  fontFamily: "'Inter', sans-serif", outline: "none",
                }}
              />
            </div>
          </div>

          {/* IOC table */}
          <div className="glass" style={{ overflow: "hidden" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr 130px 130px 80px 72px",
              gap: 10, padding: "8px 14px",
              fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700,
              borderBottom: `1px solid ${t.borderSection}`,
              background: t.bgInput,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>TYPE</span>
              <span>VALUE / NOTE</span>
              <span>ACTOR / CAMPAIGN</span>
              <span>FIRST → LAST</span>
              <span style={{ textAlign: "center" }}>CONF</span>
              <span style={{ textAlign: "right" }}>SEV</span>
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: t.text40, fontSize: 12 }}>No IOCs match the current filters.</div>
            ) : (
              filtered.map(ioc => {
                const tm = TYPE_META[ioc.type];
                const cm = CONF_META[ioc.confidence];
                return (
                  <div key={ioc.id} style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr 130px 130px 80px 72px",
                    gap: 10, padding: "10px 14px",
                    alignItems: "center",
                    borderBottom: `1px solid ${t.borderRow}`,
                  }}>
                    <span style={{
                      padding: "2px 7px", borderRadius: 4,
                      background: tm.bg, color: tm.color,
                      fontSize: 8, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
                      textAlign: "center", justifySelf: "start",
                    }}>{tm.label}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="mono" style={{
                          fontSize: 11, fontWeight: 600, color: t.text,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{ioc.value}</span>
                        <button onClick={() => copy(ioc.fullValue, ioc.id)} title="Copy full value" style={{
                          background: copiedId === ioc.id ? "rgba(34,197,94,0.12)" : t.bgInput,
                          border: `1px solid ${copiedId === ioc.id ? "rgba(34,197,94,0.30)" : t.borderLight}`,
                          color: copiedId === ioc.id ? "#22C55E" : t.text40,
                          width: 22, height: 22, borderRadius: 4, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {copiedId === ioc.id ? (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                          )}
                        </button>
                      </div>
                      <div style={{ fontSize: 9, color: t.text40, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ioc.note}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: t.text50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ioc.actor}</div>
                      <div className="mono" style={{ fontSize: 9, color: t.text35, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ioc.campaign}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 9, color: t.text40, lineHeight: 1.4 }}>
                      <div>{ioc.firstSeen}</div>
                      <div style={{ color: t.text30 }}>→ {relTime(ioc.lastSeen)}</div>
                    </div>
                    <span style={{
                      padding: "2px 7px", borderRadius: 4,
                      background: cm.bg, color: cm.color,
                      fontSize: 8, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                      textAlign: "center", justifySelf: "center",
                    }}>{cm.label}</span>
                    <span style={{
                      padding: "2px 7px", borderRadius: 4,
                      background: SEV_BG[ioc.severity], color: SEV[ioc.severity],
                      fontSize: 8, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                      textAlign: "center", justifySelf: "end",
                    }}>{ioc.severity.toUpperCase()}</span>
                  </div>
                );
              })
            )}
            <div style={{
              padding: "8px 14px", fontSize: 9, color: t.text35,
              borderTop: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>Showing {filtered.length} of {IOCS.length} IOCs</span>
              <span>Updated · 2 min ago</span>
            </div>
          </div>
        </div>

        {/* Right: Active campaigns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Active Campaigns</div>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>Currently tracked</div>
            {CAMPAIGNS.map((c, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < CAMPAIGNS.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: SEV[c.severity], boxShadow: `0 0 5px ${SEV[c.severity]}80`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <span className="mono" style={{
                    fontSize: 8, color: c.trend.startsWith("+") ? "#FF4562" : t.text35,
                    fontWeight: 700,
                  }}>{c.trend}</span>
                </div>
                <div className="mono" style={{ fontSize: 9, color: t.text40, marginBottom: 5 }}>{c.actor} · {c.iocCount} IOC{c.iocCount > 1 ? "s" : ""} · {c.lastActive}</div>
                <div style={{ fontSize: 9, color: t.text40, lineHeight: 1.5 }}>{c.description}</div>
              </div>
            ))}
          </div>

          {/* IOC type breakdown */}
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>By Type</div>
            <div className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 10 }}>IOC distribution</div>
            {Object.entries(TYPE_META).map(([k, m]) => {
              const n = counts[k];
              const pct = (n / IOCS.length) * 100;
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                  <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: t.text50, flex: 1 }}>{m.label}</span>
                  <div style={{ width: 60, height: 4, background: t.bgInput, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 2 }} />
                  </div>
                  <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: m.color, width: 22, textAlign: "right", flexShrink: 0 }}>{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
