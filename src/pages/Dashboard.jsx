import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { TL, SEV, STR_COL } from "../data/threat-levels";
import ThreatSmokeLayer from "../components/ThreatSmokeLayer";
import AlertCard from "../components/AlertCard";
import CoverageBar from "../components/CoverageBar";
import { TimeRangeFilter } from "../components/TableUtils";

export default function Dashboard() {
  const { state, dispatch } = useData();
  const {
    threatLevel, heroAlerts, lowerAlarms, coverageBars,
    blackMarket, fqdnData, thirdPartyData, exposedEmp, expData, stats,
  } = state;

  const navigate = useNavigate();
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [domainTab, setDomainTab] = useState("fqdn");
  const [timeRange, setTimeRange] = useState("30d");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const tl = TL[threatLevel] || TL.critical;
  const dismissHero = (id) => dispatch({ type: "DISMISS_HERO_ALERT", payload: id });

  const ttS = {
    contentStyle: {
      background: t.bgTooltip, border: `1px solid ${t.borderMed}`,
      borderRadius: 12, fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
      backdropFilter: "blur(20px)", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", padding: "10px 14px",
    },
    itemStyle: { color: t.text, padding: "2px 0" },
    labelStyle: { color: t.text50, marginBottom: 4, fontWeight: 600 },
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Dynamic pulseGlow keyframe */}
      <style>{`@keyframes pulseGlow{0%,100%{box-shadow:0 0 15px ${tl.glow}}50%{box-shadow:0 0 35px ${tl.glow},0 0 50px ${tl.glow}}}`}</style>

      <ThreatSmokeLayer threatLevel={threatLevel} originY={200} />
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative", zIndex: 2 }}>

        {/* 1. HERO */}
        <div style={{ position: "relative", marginTop: 24 }}>
          <div style={{ position: "absolute", top: -48, left: "50%", transform: "translateX(-50%)", zIndex: 5, filter: `drop-shadow(0 4px 24px rgba(232,70,58,0.3)) drop-shadow(0 0 40px rgba(232,70,58,0.15))` }}>
            <img src="/socradar-half-logo.png" alt="SOCRadar" width={120} style={{ display: "block" }} />
          </div>
          <div className="glass" style={{
            position: "relative", overflow: "hidden",
            animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
            boxShadow: `0 8px 40px rgba(0,0,0,0.25), 0 0 60px ${tl.glow}, 0 0 120px ${tl.glow}`,
            borderTop: `2px solid ${tl.hex}40`,
            borderLeft: `1px solid ${tl.hex}12`,
            borderRight: `1px solid ${tl.hex}12`,
          }}>
            {/* Threat-colored haze behind card content */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, borderRadius: 16,
              background: `
                radial-gradient(ellipse at 25% 30%, ${tl.hex}1A 0%, transparent 50%),
                radial-gradient(ellipse at 75% 60%, ${tl.hex}14 0%, transparent 45%),
                radial-gradient(ellipse at 50% 15%, ${tl.hex}12 0%, transparent 55%),
                radial-gradient(ellipse at 40% 80%, ${tl.hex}0C 0%, transparent 50%),
                radial-gradient(ellipse at 60% 45%, ${tl.hex}0A 0%, transparent 65%)
              `,
            }} />
            {/* Bright edge line — 2px at the very top, brightest */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 3, pointerEvents: "none",
              background: `linear-gradient(90deg, transparent 0%, ${tl.hex}80 10%, ${tl.hex}BB 50%, ${tl.hex}80 90%, transparent 100%)`,
              borderRadius: "16px 16px 0 0",
            }} />
            {/* Glow bleed — bright at edge, fading upward (outside card via negative top) + downward */}
            <div style={{
              position: "absolute", top: -20, left: -8, right: -8, height: 50, zIndex: -1, pointerEvents: "none",
              background: `radial-gradient(ellipse at 50% 100%, ${tl.hex}40 0%, ${tl.hex}18 40%, transparent 75%)`,
              filter: "blur(6px)",
            }} />
            {/* Inner bleed below edge — bright at top, pale going down */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 28, zIndex: 1, pointerEvents: "none",
              background: `linear-gradient(to bottom, ${tl.hex}30 0%, ${tl.hex}10 40%, transparent 100%)`,
              borderRadius: "16px 16px 0 0",
            }} />
            {/* Corner glow accents — tight, bright */}
            <div style={{
              position: "absolute", top: -6, left: -6, width: 50, height: 50, zIndex: -1, pointerEvents: "none",
              background: `radial-gradient(circle at 30% 30%, ${tl.hex}50 0%, transparent 65%)`,
              filter: "blur(4px)",
            }} />
            <div style={{
              position: "absolute", top: -6, right: -6, width: 50, height: 50, zIndex: -1, pointerEvents: "none",
              background: `radial-gradient(circle at 70% 30%, ${tl.hex}50 0%, transparent 65%)`,
              filter: "blur(4px)",
            }} />
            <div style={{ position: "relative", zIndex: 2, padding: "28px 24px 20px" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: t.text35, textTransform: "uppercase" }}>Status:</span>
                    <span className="hfont" style={{ fontSize: 12, fontWeight: 700, color: tl.hex, textTransform: "uppercase", letterSpacing: "0.08em" }}>{tl.label} Exposure</span>
                  </div>
                  <h2 className="hfont" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16, color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}>
                    Immediate attention required
                  </h2>
                  {heroAlerts.map((a) => <AlertCard key={a.id} alert={a} onDismiss={dismissHero} />)}
                  <div
                    onClick={() => navigate("/protection-coverage")}
                    style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4, cursor: "pointer", transition: "all 0.25s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.04)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.text70, lineHeight: 1.4 }}>Under-configured protection</div>
                      <div style={{ fontSize: 12, color: t.text40, lineHeight: 1.5, marginTop: 2 }}>Add additional VIP accounts and IP addresses to maximize coverage.</div>
                    </div>
                  </div>
                </div>
                <div style={{ width: 260, flexShrink: 0 }}>
                  <div className="glass-sm" style={{ padding: "16px 18px", background: "rgba(255,255,255,0.012)" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text30, textTransform: "uppercase", marginBottom: 8 }}>Coverage</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <svg viewBox="0 0 80 44" width={65}>
                        <path d="M8 42 A32 32 0 0 1 72 42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />
                        <path d="M8 42 A32 32 0 0 1 72 42" fill="none" stroke={tl.hex} strokeWidth="6" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset={100.5 * 0.35} opacity="0.8" />
                        <text x="40" y="38" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="Plus Jakarta Sans" fontWeight="800">65%</text>
                      </svg>
                      <div>
                        <div style={{ fontSize: 11, color: t.text50 }}>Config Score</div>
                        <div style={{ fontSize: 10, color: t.text25 }}>Improve below ↓</div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${t.border},transparent)`, marginBottom: 8 }} />
                    {coverageBars.map((item) => <CoverageBar key={item.label} item={item} />)}
                    <div style={{ marginTop: 8, textAlign: "center" }}><span className="mono" style={{ fontSize: 10, color: "#E8463A", cursor: "pointer" }}>Protection Coverage →</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. EXPOSURE TIMELINE */}
        <div className="glass" style={{ padding: "22px 20px 14px", animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, padding: "0 4px" }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Exposure Timeline</div>
              <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Threat activity — last 24 months</span>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <TimeRangeFilter range={timeRange} onRangeChange={setTimeRange} />
              <div style={{ width: 1, height: 16, background: t.borderLight }} />
              {[{ l: "Stealer Logs", c: "#E8463A" }, { l: "Breaches", c: "#F59E0B" }, { l: "Logs on Sale", c: "#A855F7" }, { l: "DW Mentions", c: "#3B82F6" }].map((i) => (
                <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 3, background: i.c, opacity: 0.7 }} />
                  <span className="mono" style={{ fontSize: 9, color: t.text30 }}>{i.l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={expData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} interval={3} />
              <YAxis axisLine={false} tickLine={false} width={30} />
              <Tooltip {...ttS} />
              <Area type="monotone" dataKey="infostealerLogs" stroke="#E8463A" fill="#E8463A" fillOpacity={0.08} strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="dataBreaches" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.05} strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="logsOnSale" stroke="#A855F7" fill="#A855F7" fillOpacity={0.05} strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="darkWebMentions" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.04} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 3. STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
          {stats.map((s, i) => (
            <div key={i} className="glass" style={{ padding: "16px 18px", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(232,70,58,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(232,70,58,0.06)", border: "1px solid rgba(232,70,58,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d={s.icon} /></svg>
                </div>
                <span style={{ fontSize: 11, color: t.text40, fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="hfont" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</span>
                <span className="mono" style={{ fontSize: 10, color: "#DC2626", fontWeight: 500 }}>▲ {s.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* AI THREAT ASSESSMENT */}
        <div className="glass" style={{
          overflow: "hidden", padding: "18px 22px",
          animation: loaded ? "fadeUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both" : "none",
          background: "linear-gradient(135deg, rgba(232,70,58,0.03) 0%, rgba(255,255,255,0.02) 50%, rgba(168,85,247,0.02) 100%)",
          border: "1px solid rgba(232,70,58,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            {/* AI icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(232,70,58,0.12) 0%, rgba(168,85,247,0.12) 100%)",
              border: "1px solid rgba(232,70,58,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="1.5">
                <path d="M12 2L9 8.5 2 9.5l5 5-1 7 6-3.5 6 3.5-1-7 5-5-7-1z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text70 }}>SOCRadar AI Assessment</span>
                <span className="mono" style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(168,85,247,0.1)", color: "#A855F7", letterSpacing: "0.06em", fontWeight: 600 }}>AI</span>
                <span className="mono" style={{ fontSize: 9, color: t.text20, marginLeft: "auto" }}>Updated 2m ago</span>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: t.text55, margin: 0 }}>
                Your exposure increased <span style={{ color: "#DC2626", fontWeight: 600 }}>12% this week</span>, driven by
                <span style={{ color: "#F59E0B", fontWeight: 500 }}> 3 new stealer log batches</span> on Russian Market
                targeting <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: t.text70 }}>socradar.io</span> credentials.
                <span style={{ color: "#DC2626", fontWeight: 500 }}> 2 VIP accounts</span> require immediate password resets.
                Domain <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: t.text70 }}>platform.socradar.com</span> appears
                in <span style={{ color: "#EA580C", fontWeight: 500 }}>4 active marketplace listings</span> with a combined value of $60.
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {[
                  { label: "Credential Exposure", color: "#DC2626" },
                  { label: "Black Market Activity", color: "#F59E0B" },
                  { label: "VIP Risk", color: "#EA580C" },
                ].map((tag, i) => (
                  <span key={i} style={{
                    padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 500,
                    background: `${tag.color}0A`, border: `1px solid ${tag.color}18`,
                    color: tag.color, fontFamily: "'JetBrains Mono',monospace",
                  }}>{tag.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. TWO COLS: Alerts + Identifiers/Black Market */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Your Critical Alerts */}
          <div className="glass" style={{ overflow: "hidden", animation: loaded ? "fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Your Critical Alerts</div>
                <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>{lowerAlarms.length} open alerts</span>
              </div>
              <span className="mono" style={{ fontSize: 11, color: "#E8463A", cursor: "pointer" }} onClick={() => navigate("/incidents")}>View All →</span>
            </div>
            <div style={{ maxHeight: 380, overflow: "auto" }}>
              {lowerAlarms.map((a) => (
                <div key={a.id} className="alarm-row">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: SEV[a.severity], boxShadow: `0 0 6px ${SEV[a.severity]}50`, marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span className="mono" style={{ fontSize: 10, color: t.text25 }}>{a.source}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.text15 }} />
                        <span className="mono" style={{ fontSize: 10, color: t.text20 }}>{a.time}</span>
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: SEV[a.severity], opacity: 0.6, flexShrink: 0 }}>{a.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unique Identifiers + Black Market */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: loaded ? "fadeUp 0.6s 0.25s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
            {/* Unique Identifiers */}
            <div className="glass" style={{ padding: "16px 20px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 14 }}>Data Unique Identifiers</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[{ label: "Unique FQDNs", value: "217", trend: "-6.0%", down: true }, { label: "Unique Passwords", value: "764", trend: "-2.2%", down: true }, { label: "Unique Usernames", value: "1.9K", trend: "-0.8%", down: true }].map((d, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: t.bgCard, border: `1px solid ${t.borderSection}` }}>
                    <div style={{ fontSize: 10, color: t.text30, marginBottom: 6, fontWeight: 500 }}>{d.label}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className="hfont" style={{ fontSize: 20, fontWeight: 800 }}>{d.value}</span>
                      <span className="mono" style={{ fontSize: 9, color: d.down ? "#16A34A" : "#DC2626" }}>{d.down ? "▼" : "▲"} {d.trend}</span>
                    </div>
                    <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ marginTop: 6, display: "block", opacity: 0.4 }}>
                      <polyline points={Array.from({ length: 12 }, (_, j) => `${j * 9},${12 + Math.sin(j * 0.8 + i * 2) * 8 - j * 0.3}`).join(" ")} fill="none" stroke={d.down ? "#16A34A" : "#DC2626"} strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Black Market Activity */}
            <div className="glass" style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Black Market Activity</div>
                  <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>{blackMarket.length} active listings</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "#E8463A", cursor: "pointer" }} onClick={() => navigate("/black-market")}>View All →</span>
              </div>
              <div>
                <div style={{ padding: "6px 20px", display: "flex", justifyContent: "space-between" }}>
                  <span className="mono" style={{ fontSize: 9, color: t.text15, textTransform: "uppercase" }}>Asset</span>
                  <div style={{ display: "flex", gap: 40 }}>
                    <span className="mono" style={{ fontSize: 9, color: t.text15 }}>Price</span>
                    <span className="mono" style={{ fontSize: 9, color: t.text15 }}>Status</span>
                  </div>
                </div>
                {blackMarket.map((bm) => (
                  <div key={bm.id} className="trow">
                    <span className="mono" style={{ fontSize: 11, color: t.text50 }}>{bm.asset}</span>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 11, color: "#F59E0B", fontWeight: 500 }}>{bm.price}</span>
                      <span className="tag" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A", fontSize: 9 }}>{bm.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. DW SEARCH ENGINE — white */}
        <div style={{ background: t.bgWhiteSearch, borderRadius: 18, padding: "28px 32px", display: "flex", alignItems: "center", gap: 20, animation: loaded ? "fadeUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both" : "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 44, height: 44 }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke={t.textInverse} strokeWidth="1.5" /><ellipse cx="22" cy="22" rx="10" ry="18" stroke={t.textInverse} strokeWidth="1" /><line x1="4" y1="22" x2="40" y2="22" stroke={t.textInverse} strokeWidth="0.8" /><line x1="22" y1="4" x2="22" y2="40" stroke={t.textInverse} strokeWidth="0.8" /></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8463A" style={{ position: "absolute", bottom: -2, right: -4 }}><path d="M12 2C9.24 2 7 4.24 7 7c0 1.4.58 2.66 1.5 3.56L12 14l3.5-3.44C16.42 9.66 17 8.4 17 7c0-2.76-2.24-5-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /><path d="M5 18c0-2 3.13-3.5 7-3.5s7 1.5 7 3.5v2H5v-2z" opacity="0.7" /></svg>
            </div>
            <span className="hfont" style={{ fontSize: 20, fontWeight: 800, color: t.textInverse, letterSpacing: "-0.02em" }}>Dark Web <span style={{ color: "#E8463A" }}>Search Engine</span></span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.25 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textInverse} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input placeholder="Search keywords, domains, IPs, emails, hashes..." style={{ width: "100%", padding: "14px 16px 14px 42px", fontSize: 14, fontFamily: "'Satoshi'", background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, color: t.textInverse, outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
          </div>
          <button style={{ padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer", background: "#E8463A", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans'", boxShadow: "0 4px 16px rgba(232,70,58,0.3)", flexShrink: 0 }}>Search</button>
        </div>

        {/* 6. TWO COLS: Exposed Employees + Toggled Domains */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, animation: loaded ? "fadeUp 0.6s 0.35s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
          {/* Exposed Employees */}
          <div className="glass" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Exposed Employees</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="hfont" style={{ fontSize: 22, fontWeight: 800 }}>{exposedEmp.length}</span>
                  <span className="mono" style={{ fontSize: 10, color: "#DC2626" }}>▲ +8%</span>
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: "#E8463A", cursor: "pointer" }} onClick={() => navigate("/identity-exposure")}>View All →</span>
            </div>
            <div style={{ padding: "4px 0" }}>
              <div style={{ padding: "0 20px 4px", display: "grid", gridTemplateColumns: "1fr 80px 70px", gap: 8 }}>
                <span className="mono" style={{ fontSize: 9, color: t.text15, textTransform: "uppercase" }}>Email</span>
                <span className="mono" style={{ fontSize: 9, color: t.text15, textAlign: "center" }}>Strength</span>
                <span className="mono" style={{ fontSize: 9, color: t.text15, textAlign: "right" }}>Date</span>
              </div>
              {exposedEmp.map((r, i) => (
                <div key={i} className="trow" style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px", gap: 8, alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 11, color: t.text50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((b) => (
                        <div key={b} style={{ width: 10, height: 6, borderRadius: 1, background: b <= ({ Weak: 1, Poor: 2, Fair: 3, Strong: 4, Excellent: 5 }[r.strength] || 0) ? STR_COL[r.strength] : t.borderLight }} />
                      ))}
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: t.text20, textAlign: "right" }}>{r.date}</span>
                </div>
              ))}
              <div style={{ padding: "12px 20px" }}><span className="mono" style={{ fontSize: 10, color: "#E8463A", cursor: "pointer" }} onClick={() => navigate("/identity-exposure")}>View Exposed Employees →</span></div>
            </div>
          </div>

          {/* Toggled: Unique FQDNs / Third-Party Risk */}
          <div className="glass" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Exposure Distribution</div>
                  <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>{domainTab === "fqdn" ? "Stealer Exposure by Domain" : "Third-Party Service Risk"}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "#E8463A", cursor: "pointer" }}>Details →</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={`tab-btn ${domainTab === "fqdn" ? "on" : ""}`} onClick={() => setDomainTab("fqdn")}>Unique FQDNs</button>
                <button className={`tab-btn ${domainTab === "thirdparty" ? "on" : ""}`} onClick={() => setDomainTab("thirdparty")}>Third-Party Risk</button>
              </div>
            </div>
            <div style={{ padding: "4px 0" }}>
              {domainTab === "fqdn" ? (<>
                <div style={{ padding: "0 20px 4px", display: "flex", justifyContent: "space-between" }}>
                  <span className="mono" style={{ fontSize: 9, color: t.text15, textTransform: "uppercase" }}>Domain</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text15 }}>Exposures</span>
                </div>
                {fqdnData.map((r, i) => {
                  const max = fqdnData[0].count;
                  return (
                    <div key={i} className="trow">
                      <div style={{ flex: 1, minWidth: 0 }}><span className="mono" style={{ fontSize: 11, color: t.text50 }}>{r.domain}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, width: 160 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.borderLight, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 2, background: "#E8463A", width: `${(r.count / max) * 100}%`, opacity: 0.6 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 10, color: t.text40, minWidth: 40, textAlign: "right" }}>
                          {r.count >= 1000 ? (r.count / 1000).toFixed(1) + "K" : r.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>) : (<>
                <div style={{ padding: "6px 20px 2px" }}>
                  <p style={{ fontSize: 12, color: t.text35, lineHeight: 1.5, marginBottom: 8 }}>Employee credentials found on these third-party services. These accounts may provide lateral access to your organization.</p>
                </div>
                {thirdPartyData.map((r, i) => (
                  <div key={i} className="trow">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(232,70,58,0.06)", border: "1px solid rgba(232,70,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#E8463A" }}>{r.service[0]}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: t.text70 }}>{r.service}</div>
                        <div className="mono" style={{ fontSize: 10, color: t.text25 }}>{r.domain}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="hfont" style={{ fontSize: 16, fontWeight: 700, color: "#E8463A" }}>{r.creds}</span>
                      <span style={{ fontSize: 10, color: t.text25 }}>credentials</span>
                    </div>
                  </div>
                ))}
              </>)}
              <div style={{ padding: "12px 20px" }}>
                <span className="mono" style={{ fontSize: 10, color: "#E8463A", cursor: "pointer" }} onClick={() => navigate("/domain-exposure")}>
                  {domainTab === "fqdn" ? "View All Domains →" : "View All Third-Party Risk →"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. I&A INTELLIGENCE SEARCH — white */}
        <div style={{ background: t.bgWhiteSearch, borderRadius: 18, padding: "28px 32px", display: "flex", alignItems: "center", gap: 20, animation: loaded ? "fadeUp 0.6s 0.4s cubic-bezier(0.16,1,0.3,1) both" : "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: t.textInverse, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2" strokeLinecap="round"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /><path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /></svg>
            </div>
            <span className="hfont" style={{ fontSize: 20, fontWeight: 800, color: t.textInverse, letterSpacing: "-0.02em" }}>Identity & Access <span style={{ color: "#E8463A" }}>Intelligence</span></span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.25 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textInverse} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input placeholder="Search by domain, email, IP address, or username..." style={{ width: "100%", padding: "14px 16px 14px 42px", fontSize: 14, fontFamily: "'Satoshi'", background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, color: t.textInverse, outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
          </div>
          <button style={{ padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer", background: "#E8463A", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans'", boxShadow: "0 4px 16px rgba(232,70,58,0.3)", flexShrink: 0 }}>Search</button>
        </div>

      </div>
    </div>
  );
}
