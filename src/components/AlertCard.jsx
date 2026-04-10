import { useState } from "react";
import { SEV } from "../data/threat-levels";

export default function AlertCard({ alert, onDismiss }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${SEV[alert.sev]}18`,
        transition: "all 0.25s",
        marginBottom: 8,
        ...(hov && { borderColor: `${SEV[alert.sev]}30` }),
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: SEV[alert.sev],
            boxShadow: `0 0 6px ${SEV[alert.sev]}60`,
            marginTop: 5, flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 3 }}>{alert.text}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 10, color: "rgba(232,236,241,0.25)" }}>{alert.source}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <span className="mono" style={{ fontSize: 10, color: "rgba(232,236,241,0.2)" }}>{alert.time}</span>
          </div>
        </div>
      </div>
      {/* Hover overlay — always has blur, opacity controls visibility */}
      <div
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: "55%",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 6, padding: "0 12px",
          background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.02) 20%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.07) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: hov ? 1 : 0,
          pointerEvents: hov ? "auto" : "none",
          transform: hov ? "translateX(0)" : "translateX(8px)",
          transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)",
          borderRadius: "0 12px 12px 0",
        }}
      >
        <button
          style={{
            padding: "6px 14px", borderRadius: 8, border: "none",
            background: SEV[alert.sev], color: "#fff", fontSize: 11,
            fontWeight: 600, cursor: "pointer", fontFamily: "'Satoshi'",
            boxShadow: `0 2px 8px ${SEV[alert.sev]}30`, whiteSpace: "nowrap",
          }}
        >
          Go to Alert
        </button>
        <button
          style={{
            padding: "6px 12px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(232,236,241,0.65)", fontSize: 11,
            fontWeight: 500, cursor: "pointer", fontFamily: "'Satoshi'",
            whiteSpace: "nowrap",
          }}
        >
          Close
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss?.(alert.id); }}
          style={{
            width: 24, height: 24, borderRadius: 6, border: "none",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(232,236,241,0.35)", fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
