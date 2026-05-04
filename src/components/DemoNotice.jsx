export default function DemoNotice() {
  return (
    <div
      role="alert"
      style={{
        background: "#FFEB3B",
        color: "#000",
        padding: "12px 20px",
        margin: "-20px -24px 18px",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.04em",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderTop: "3px solid #000",
        borderBottom: "3px solid #000",
        textTransform: "uppercase",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <span
        style={{
          background: "#000",
          color: "#FFEB3B",
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.08em",
          flexShrink: 0,
        }}
      >
        ⚠ DEMO
      </span>
      <span style={{ flex: 1 }}>
        This page will be kept as it is — what you are seeing here is for the demo
      </span>
    </div>
  );
}
