import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import DemoNotice from "../components/DemoNotice";

// ═══════════════════════════════════════
// Settings — Notifications · Integrations · Account
// ═══════════════════════════════════════
const TABS = [
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "integrations", label: "Integrations", icon: "plug" },
  { id: "account", label: "Account", icon: "user" },
];

const INTEGRATIONS = [
  {
    id: "splunk", name: "Splunk Enterprise", category: "SIEM",
    color: "#F59E0B", letter: "S",
    desc: "Forward dark-web findings as CIM-compliant events to your Splunk index.",
    status: "connected", endpoint: "splunk-prod.greenanimals.internal:8088",
    lastEvent: "37s ago", eventsToday: 1284,
  },
  {
    id: "servicenow", name: "ServiceNow", category: "ITSM",
    color: "#22C55E", letter: "SN",
    desc: "Auto-open incident tickets from critical findings. Map severity to priority.",
    status: "connected", endpoint: "greenanimals.service-now.com",
    lastEvent: "12m ago", eventsToday: 47,
  },
  {
    id: "slack", name: "Slack", category: "Chat",
    color: "#A855F7", letter: "Sl",
    desc: "Stream alerts to channels by severity. Mention oncall on critical.",
    status: "connected", endpoint: "#ciso-soc-alerts · #soc-priority",
    lastEvent: "8m ago", eventsToday: 312,
  },
  {
    id: "soar", name: "Cortex XSOAR", category: "SOAR",
    color: "#3B82F6", letter: "X",
    desc: "Trigger automation playbooks (force-reset, session-revoke, vendor-notify) from findings.",
    status: "connected", endpoint: "xsoar.greenanimals.internal/v3",
    lastEvent: "2h ago", eventsToday: 9,
  },
  {
    id: "jira", name: "Jira", category: "Tracking",
    color: "#22D3EE", letter: "J",
    desc: "Open vendor-risk and remediation tickets in the SEC project.",
    status: "disconnected", endpoint: "—",
    lastEvent: "—", eventsToday: 0,
  },
  {
    id: "webhook", name: "Generic Webhook", category: "Custom",
    color: "#94A3B8", letter: "{}",
    desc: "POST findings as JSON to any HTTPS endpoint. Custom headers + HMAC supported.",
    status: "available", endpoint: "—",
    lastEvent: "—", eventsToday: 0,
  },
];

const NOTIFY_RULES = [
  { id: "critical", label: "Critical findings", desc: "Stealer logs / Customer leaks / Executive risk score >70 / Active session sale", default: ["email", "slack", "sms"] },
  { id: "high", label: "High severity", desc: "BEC credentials / Brand impersonation / Typosquat / Tracked-BIN matches", default: ["email", "slack"] },
  { id: "medium", label: "Medium severity", desc: "Forum mentions / Recruitment ads / Combolist matches", default: ["email"] },
  { id: "low", label: "Informational", desc: "Coverage changes / New IOC ingest / Source health drift", default: [] },
];

const PROFILE_SECTORS = ["Finance", "Healthcare", "Energy", "Retail", "Technology", "Government", "Manufacturing", "Telecom", "Education", "Transportation"];
const PROFILE_REGIONS = ["EU", "UK", "US", "Turkey", "APAC", "MENA", "LATAM"];

// ═══════════════════════════════════════
export default function Settings() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  // Notifications state
  const [rules, setRules] = useState(() =>
    Object.fromEntries(NOTIFY_RULES.map(r => [r.id, new Set(r.default)]))
  );
  const [thresholds, setThresholds] = useState({ severity: 50, frequency: 30, dwell: 24 });

  // Integrations state
  const [integrationStates, setIntegrationStates] = useState(() =>
    Object.fromEntries(INTEGRATIONS.map(i => [i.id, i.status]))
  );

  // Account state
  const [profile, setProfile] = useState({
    org: "GreenAnimals Bank",
    primarySector: "Finance",
    primaryRegion: "Turkey",
    secondaryRegions: new Set(["EU", "UK"]),
    employees: "~5,000",
    customers: "~1,200,000",
  });

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  function toggleChannel(ruleId, channel) {
    setRules(s => {
      const next = new Set(s[ruleId]);
      next.has(channel) ? next.delete(channel) : next.add(channel);
      return { ...s, [ruleId]: next };
    });
  }

  function toggleIntegration(id) {
    setIntegrationStates(s => ({
      ...s,
      [id]: s[id] === "connected" ? "disconnected" : "connected",
    }));
  }

  function toggleSecondaryRegion(r) {
    setProfile(p => {
      const next = new Set(p.secondaryRegions);
      next.has(r) ? next.delete(r) : next.add(r);
      return { ...p, secondaryRegions: next };
    });
  }

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
      <DemoNotice />

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>Operations</div>
          <div className="hfont" style={{ fontSize: 17, fontWeight: 800, marginTop: 2, color: t.text }}>Settings</div>
          <div style={{ fontSize: 10, color: t.text45, marginTop: 2 }}>Notification rules, SOAR/SIEM integrations, and your organisation profile</div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{
        display: "flex", gap: 2,
        borderBottom: `1px solid ${t.borderSection}`,
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px", border: "none", background: "transparent",
                color: isActive ? "#3B82F6" : t.text40,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                borderBottom: `2px solid ${isActive ? "#3B82F6" : "transparent"}`,
                marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ NOTIFICATIONS TAB ═══ */}
      {activeTab === "notifications" && (
        <div style={{
          display: "flex", flexDirection: "column", gap: 14,
          animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>
          {/* Channel matrix */}
          <div className="glass" style={{ padding: "16px 20px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Channels per severity</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: t.text }}>Where alerts go, by severity</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 80px 80px 80px",
              gap: 8, alignItems: "center",
              padding: "8px 0", borderBottom: `1px solid ${t.borderRow}`,
              fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
            }}>
              <span>RULE</span>
              <span style={{ textAlign: "center" }}>EMAIL</span>
              <span style={{ textAlign: "center" }}>SLACK</span>
              <span style={{ textAlign: "center" }}>SMS</span>
              <span style={{ textAlign: "center" }}>WEBHOOK</span>
            </div>
            {NOTIFY_RULES.map(r => (
              <div key={r.id} style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 80px 80px",
                gap: 8, alignItems: "center",
                padding: "12px 0", borderBottom: `1px solid ${t.borderRow}`,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: t.text40, marginTop: 2 }}>{r.desc}</div>
                </div>
                {["email", "slack", "sms", "webhook"].map(ch => {
                  const on = rules[r.id].has(ch);
                  return (
                    <button key={ch} onClick={() => toggleChannel(r.id, ch)} style={{
                      width: 36, height: 20, borderRadius: 10,
                      border: `1px solid ${on ? "rgba(34,197,94,0.45)" : t.borderLight}`,
                      background: on ? "#22C55E" : t.bgInput,
                      cursor: "pointer", padding: 0,
                      position: "relative",
                      justifySelf: "center",
                      transition: "all 0.18s ease",
                    }}>
                      <span style={{
                        position: "absolute", top: 2, left: on ? 18 : 2,
                        width: 14, height: 14, borderRadius: "50%",
                        background: "#fff",
                        transition: "left 0.18s ease",
                      }} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Threshold sliders */}
          <div className="glass" style={{ padding: "16px 20px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Alert thresholds</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: t.text }}>Tune signal vs noise</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
              {[
                { id: "severity", label: "Severity floor", desc: "Suppress alerts below this score (0–100)", value: thresholds.severity, suffix: "", color: "#FF4562" },
                { id: "frequency", label: "Frequency cap", desc: "Max alerts per recipient per hour", value: thresholds.frequency, suffix: "/hr", color: "#F59E0B" },
                { id: "dwell", label: "Re-alert dwell", desc: "Hours before re-alerting on same finding", value: thresholds.dwell, suffix: "h", color: "#3B82F6" },
              ].map(s => (
                <div key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{s.label}</span>
                    <span className="hfont" style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}{s.suffix}</span>
                  </div>
                  <div style={{ fontSize: 9, color: t.text40, marginBottom: 8 }}>{s.desc}</div>
                  <input
                    type="range" min={0} max={s.id === "severity" ? 100 : s.id === "frequency" ? 100 : 72}
                    value={s.value}
                    onChange={e => setThresholds(th => ({ ...th, [s.id]: parseInt(e.target.value, 10) }))}
                    style={{
                      width: "100%", accentColor: s.color, cursor: "pointer",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ INTEGRATIONS TAB ═══ */}
      {activeTab === "integrations" && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
          animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>
          {INTEGRATIONS.map(it => {
            const status = integrationStates[it.id];
            const statusMeta = status === "connected"
              ? { color: "#22C55E", bg: "rgba(34,197,94,0.10)", label: "CONNECTED" }
              : status === "available"
              ? { color: "#94A3B8", bg: "rgba(148,163,184,0.12)", label: "AVAILABLE" }
              : { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", label: "DISCONNECTED" };
            return (
              <div key={it.id} className="glass" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${it.color}15`, color: it.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 14, fontWeight: 800,
                    fontFamily: "'Red Hat Display', sans-serif",
                  }}>{it.letter}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span className="hfont" style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{it.name}</span>
                      <span style={{
                        padding: "2px 7px", borderRadius: 4,
                        background: t.bgInput, color: t.text45,
                        fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{it.category.toUpperCase()}</span>
                      <span style={{
                        padding: "2px 7px", borderRadius: 4,
                        background: statusMeta.bg, color: statusMeta.color,
                        fontSize: 8, fontWeight: 800, letterSpacing: "0.08em",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{statusMeta.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: t.text45, lineHeight: 1.55, marginBottom: 8 }}>{it.desc}</div>
                    {status === "connected" && (
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 9, color: t.text40, marginBottom: 10 }}>
                        <span><span style={{ color: t.text25 }}>ENDPOINT</span> · <span className="mono" style={{ fontWeight: 600 }}>{it.endpoint}</span></span>
                        <span><span style={{ color: t.text25 }}>LAST EVENT</span> · {it.lastEvent}</span>
                        <span><span style={{ color: t.text25 }}>EVENTS TODAY</span> · <span className="mono" style={{ fontWeight: 600, color: t.text }}>{it.eventsToday.toLocaleString()}</span></span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleIntegration(it.id)} style={{
                        padding: "5px 12px", borderRadius: 6,
                        border: `1px solid ${status === "connected" ? "rgba(245,158,11,0.45)" : "rgba(34,197,94,0.45)"}`,
                        background: status === "connected" ? "rgba(245,158,11,0.10)" : "rgba(34,197,94,0.10)",
                        color: status === "connected" ? "#F59E0B" : "#22C55E",
                        fontSize: 10, fontWeight: 700, cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {status === "connected" ? "Disconnect" : "Connect"}
                      </button>
                      {status === "connected" && (
                        <button style={{
                          padding: "5px 12px", borderRadius: 6,
                          border: `1px solid ${t.borderLight}`, background: "transparent",
                          color: t.text50, fontSize: 10, fontWeight: 600, cursor: "pointer",
                        }}>Configure</button>
                      )}
                      {status === "connected" && (
                        <button style={{
                          padding: "5px 12px", borderRadius: 6,
                          border: `1px solid ${t.borderLight}`, background: "transparent",
                          color: t.text50, fontSize: 10, fontWeight: 600, cursor: "pointer",
                        }}>Test event</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ ACCOUNT TAB ═══ */}
      {activeTab === "account" && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
          animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>
          {/* Org profile */}
          <div className="glass" style={{ padding: "16px 20px" }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Organisation profile</div>
            <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: t.text }}>Used by Yours-lens filtering across the app</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field t={t} label="Organisation name">
                <input value={profile.org} onChange={e => setProfile(p => ({ ...p, org: e.target.value }))} style={inputStyle(t)} />
              </Field>

              <Field t={t} label="Primary sector" hint="Drives Ransom & Dark Web News default + GlobalThreats actor TARGETS YOU badge">
                <select value={profile.primarySector} onChange={e => setProfile(p => ({ ...p, primarySector: e.target.value }))} style={inputStyle(t)}>
                  {PROFILE_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field t={t} label="Primary region" hint="Drives Customer Leaks compliance estimator default">
                <select value={profile.primaryRegion} onChange={e => setProfile(p => ({ ...p, primaryRegion: e.target.value }))} style={inputStyle(t)}>
                  {PROFILE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>

              <Field t={t} label="Secondary regions" hint="Used for cross-border breach exposure">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {PROFILE_REGIONS.filter(r => r !== profile.primaryRegion).map(r => {
                    const on = profile.secondaryRegions.has(r);
                    return (
                      <button key={r} onClick={() => toggleSecondaryRegion(r)} style={{
                        padding: "5px 11px", borderRadius: 6,
                        border: `1px solid ${on ? "rgba(59,130,246,0.45)" : t.borderLight}`,
                        background: on ? "rgba(59,130,246,0.10)" : "transparent",
                        color: on ? "#3B82F6" : t.text40,
                        fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}>{r}</button>
                    );
                  })}
                </div>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field t={t} label="Employees">
                  <input value={profile.employees} onChange={e => setProfile(p => ({ ...p, employees: e.target.value }))} style={inputStyle(t)} />
                </Field>
                <Field t={t} label="Customers">
                  <input value={profile.customers} onChange={e => setProfile(p => ({ ...p, customers: e.target.value }))} style={inputStyle(t)} />
                </Field>
              </div>
            </div>
          </div>

          {/* User profile + retention */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="glass" style={{ padding: "16px 20px" }}>
              <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>You</div>
              <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: t.text }}>Account details</div>
              <Field t={t} label="Display name"><input value="Dogan Akkaya" readOnly style={inputStyle(t)} /></Field>
              <Field t={t} label="Email"><input value="dogan.akkaya@socradar.io" readOnly style={inputStyle(t)} /></Field>
              <Field t={t} label="Role"><input value="CISO (delegate)" readOnly style={inputStyle(t)} /></Field>
              <Field t={t} label="Two-factor authentication">
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 10px", borderRadius: 5,
                  background: "rgba(34,197,94,0.10)", color: "#22C55E",
                  fontSize: 10, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  ENROLLED · TOTP + WebAuthn
                </span>
              </Field>
            </div>

            <div className="glass" style={{ padding: "16px 20px" }}>
              <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Data retention</div>
              <div className="hfont" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: t.text }}>Findings older than this are archived</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["30 days", "90 days", "180 days", "1 year", "2 years"].map((p, i) => {
                  const active = i === 3;
                  return (
                    <button key={p} style={{
                      padding: "6px 12px", borderRadius: 6,
                      border: `1px solid ${active ? "rgba(59,130,246,0.45)" : t.borderLight}`,
                      background: active ? "rgba(59,130,246,0.10)" : "transparent",
                      color: active ? "#3B82F6" : t.text40,
                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}>{p}</button>
                  );
                })}
              </div>
              <div style={{ fontSize: 9, color: t.text35, marginTop: 10, lineHeight: 1.55 }}>
                Resolved incidents and exported reports are retained on cold storage for 7 years to satisfy KVKK Art 7 / GDPR Art 17 record-keeping requirements.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ t, label, hint, children }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ fontSize: 10, color: t.text45, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 9, color: t.text30, marginTop: 4, fontStyle: "italic" }}>{hint}</div>}
    </div>
  );
}

function inputStyle(t) {
  return {
    width: "100%",
    padding: "8px 12px",
    background: t.bgInput,
    border: `1px solid ${t.borderLight}`,
    borderRadius: 7,
    color: t.text,
    fontSize: 11,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
  };
}
