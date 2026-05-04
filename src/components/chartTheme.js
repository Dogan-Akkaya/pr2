export function tooltipStyles(t) {
  return {
    contentStyle: {
      background: t.bgTooltip,
      border: `1px solid ${t.borderMed}`,
      borderRadius: 12,
      fontSize: 11,
      fontFamily: "'JetBrains Mono',monospace",
      backdropFilter: "blur(20px)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
      padding: "10px 14px",
    },
    itemStyle: { color: t.text, padding: "2px 0" },
    labelStyle: { color: t.text50, marginBottom: 4, fontWeight: 600 },
  };
}
