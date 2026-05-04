import { useState } from "react";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { TL, SEV } from "../data/threat-levels";

function makeStyles(t) {
  const inputStyle = {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    border: `1px solid ${t.borderMed}`,
    background: t.bgHover, color: t.text,
    fontSize: 12, fontFamily: "'Inter', sans-serif", outline: "none",
  };
  const selectStyle = {
    ...inputStyle, cursor: "pointer", appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
    paddingRight: 28,
  };
  return { inputStyle, selectStyle };
}

function SectionLabel({ children, t }) {
  return (
    <div className="mono" style={{
      fontSize: 10, letterSpacing: "0.08em", color: t.text25,
      textTransform: "uppercase", marginBottom: 8, marginTop: 20,
    }}>
      {children}
    </div>
  );
}

export default function AdminPanel() {
  const { state, dispatch } = useData();
  const { t } = useTheme();
  const { inputStyle, selectStyle } = makeStyles(t);
  const [editSection, setEditSection] = useState(null);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dispatch({ type: "TOGGLE_ADMIN" })}
        style={{
          position: "fixed", inset: 0, background: t.bgOverlay,
          zIndex: 39, cursor: "pointer",
        }}
      />
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 380,
        background: t.bgPanel, backdropFilter: "blur(20px)",
        borderLeft: `1px solid ${t.borderLight}`,
        zIndex: 40, overflow: "auto", padding: "20px 24px",
        animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span className="hfont" style={{ fontSize: 16, fontWeight: 700 }}>Admin Panel</span>
          <button
            onClick={() => dispatch({ type: "TOGGLE_ADMIN" })}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: t.bgElevated, color: t.text50,
              fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: 12, color: t.text35, lineHeight: 1.5, marginBottom: 12 }}>
          Change data and alarm states to preview different UI scenarios.
        </p>

        {/* ── Threat Level ── */}
        <SectionLabel t={t}>Threat Level</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {Object.entries(TL).map(([key, val]) => (
            <button
              key={key}
              onClick={() => dispatch({ type: "SET_THREAT_LEVEL", payload: key })}
              style={{
                padding: "8px 4px", borderRadius: 8, border: "1px solid",
                borderColor: state.threatLevel === key ? val.hex + "60" : t.borderLight,
                background: state.threatLevel === key ? val.hex + "15" : t.bgCard,
                color: state.threatLevel === key ? val.hex : t.text40,
                fontSize: 11, fontWeight: state.threatLevel === key ? 600 : 400,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: val.hex,
                margin: "0 auto 4px", opacity: state.threatLevel === key ? 1 : 0.4,
              }} />
              {val.label}
            </button>
          ))}
        </div>

        {/* ── Hero Alerts ── */}
        <SectionLabel t={t}>Hero Alerts ({state.heroAlerts.length})</SectionLabel>
        {state.heroAlerts.map((alert, i) => (
          <div key={alert.id} style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 6,
            background: t.bgCard, border: `1px solid ${t.border}`,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <select
                value={alert.sev}
                onChange={(e) => {
                  const updated = [...state.heroAlerts];
                  updated[i] = { ...updated[i], sev: e.target.value };
                  dispatch({ type: "SET_HERO_ALERTS", payload: updated });
                }}
                style={{ ...selectStyle, width: 90, padding: "4px 24px 4px 8px", fontSize: 11 }}
              >
                {Object.keys(SEV).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                value={alert.source}
                onChange={(e) => {
                  const updated = [...state.heroAlerts];
                  updated[i] = { ...updated[i], source: e.target.value };
                  dispatch({ type: "SET_HERO_ALERTS", payload: updated });
                }}
                style={{ ...inputStyle, flex: 1, padding: "4px 8px", fontSize: 11 }}
                placeholder="Source"
              />
              <button
                onClick={() => dispatch({ type: "DISMISS_HERO_ALERT", payload: alert.id })}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: "none",
                  background: "rgba(220,38,38,0.1)", color: "#DC2626",
                  fontSize: 12, cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <input
              value={alert.text}
              onChange={(e) => {
                const updated = [...state.heroAlerts];
                updated[i] = { ...updated[i], text: e.target.value };
                dispatch({ type: "SET_HERO_ALERTS", payload: updated });
              }}
              style={{ ...inputStyle, fontSize: 11 }}
              placeholder="Alert text"
            />
          </div>
        ))}
        <button
          onClick={() => {
            const newAlert = {
              id: Date.now(), sev: "medium",
              text: "New alert", source: "Custom", time: "Just now",
            };
            dispatch({ type: "SET_HERO_ALERTS", payload: [...state.heroAlerts, newAlert] });
          }}
          style={{
            width: "100%", padding: "8px", borderRadius: 8,
            border: `1px dashed ${t.borderMed}`,
            background: "transparent", color: t.text30,
            fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif",
          }}
        >
          + Add Alert
        </button>

        {/* ── Lower Alarms ── */}
        <SectionLabel t={t}>Critical Alerts ({state.lowerAlarms.length})</SectionLabel>
        {state.lowerAlarms.map((alarm, i) => (
          <div key={alarm.id} style={{
            padding: "8px 12px", borderRadius: 10, marginBottom: 4,
            background: t.bgCard, border: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: SEV[alarm.severity], flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: t.text60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {alarm.title}
              </div>
            </div>
            <select
              value={alarm.severity}
              onChange={(e) => {
                const updated = [...state.lowerAlarms];
                updated[i] = { ...updated[i], severity: e.target.value };
                dispatch({ type: "SET_LOWER_ALARMS", payload: updated });
              }}
              style={{ ...selectStyle, width: 80, padding: "3px 22px 3px 6px", fontSize: 10 }}
            >
              {Object.keys(SEV).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}

        {/* ── Coverage ── */}
        <SectionLabel t={t}>Coverage Bars</SectionLabel>
        {state.coverageBars.map((bar, i) => (
          <div key={bar.label} style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
          }}>
            <span style={{ fontSize: 11, color: t.text50, width: 90, flexShrink: 0 }}>{bar.label}</span>
            <input
              type="number" min="0" max={bar.total}
              value={bar.used}
              onChange={(e) => {
                const updated = [...state.coverageBars];
                updated[i] = { ...updated[i], used: parseInt(e.target.value) || 0 };
                dispatch({ type: "SET_COVERAGE_BARS", payload: updated });
              }}
              style={{ ...inputStyle, width: 50, padding: "4px 6px", textAlign: "center", fontSize: 11 }}
            />
            <span style={{ fontSize: 10, color: t.text25 }}>/ {bar.total}</span>
          </div>
        ))}

        {/* ── Reset ── */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
          <button
            onClick={() => dispatch({ type: "RESET_ALL" })}
            style={{
              width: "100%", padding: "10px", borderRadius: 10,
              border: "1px solid rgba(220,38,38,0.2)",
              background: "rgba(220,38,38,0.06)", color: "#DC2626",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
          >
            Reset All to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
