export default function PlaceholderPage({ title, subtitle }) {
  return (
    <div style={{ padding: "40px 24px", animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div
        className="glass"
        style={{
          maxWidth: 520, margin: "80px auto", padding: "48px 40px",
          textAlign: "center",
        }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
          background: "rgba(232,70,58,0.06)", border: "1px solid rgba(232,70,58,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <h2 className="hfont" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 14, color: "rgba(232,236,241,0.4)", lineHeight: 1.6, marginBottom: 16 }}>
            {subtitle}
          </p>
        )}
        <span className="mono" style={{ fontSize: 11, color: "rgba(232,236,241,0.2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Under Development
        </span>
      </div>
    </div>
  );
}
