import { useState } from "react";

export default function CoverageBar({ item }) {
  const [hov, setHov] = useState(false);
  const pct = item.total > 0 ? (item.used / item.total) * 100 : 0;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 10px", borderRadius: 9, cursor: "pointer",
        transition: "all 0.2s",
        background: hov ? "rgba(255,255,255,0.03)" : "transparent",
        marginBottom: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: hov ? "#E8ECF1" : "rgba(232,236,241,0.5)", transition: "color 0.2s" }}>
          {item.label}
        </span>
        <span className="mono" style={{ fontSize: 10, color: hov ? item.color : "rgba(232,236,241,0.3)", transition: "color 0.2s" }}>
          {item.used}/{item.total}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%", borderRadius: 2, background: item.color,
            width: `${pct}%`, opacity: hov ? 1 : 0.65,
            transition: "all 0.3s",
            boxShadow: hov ? `0 0 8px ${item.color}40` : "none",
          }}
        />
      </div>
    </div>
  );
}
