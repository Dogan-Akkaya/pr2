import { useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { GENERAL_COMMENTS, PAGE_COMMENTS, routeLabel } from "../data/comments";

// Splits a multi-line comment string into paragraph-sized chunks for rendering.
function paragraphsOf(text) {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CommentsPanel() {
  const { dispatch } = useData();
  const { t } = useTheme();
  const location = useLocation();
  const pathname = location.pathname || "/dashboard";
  const pageComment = PAGE_COMMENTS[pathname] || null;
  const paragraphs = paragraphsOf(pageComment);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dispatch({ type: "TOGGLE_COMMENTS" })}
        style={{
          position: "fixed", inset: 0, background: t.bgOverlay,
          zIndex: 39, cursor: "pointer",
        }}
      />
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: t.bgPanel, backdropFilter: "blur(20px)",
        borderLeft: `1px solid ${t.borderLight}`,
        zIndex: 40, overflow: "auto", padding: "20px 24px 32px",
        animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(99,102,241,0.10)",
              border: "1px solid rgba(99,102,241,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="hfont" style={{ fontSize: 16, fontWeight: 700 }}>Comments</span>
          </div>
          <button
            onClick={() => dispatch({ type: "TOGGLE_COMMENTS" })}
            style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: t.bgElevated, color: t.text50,
              fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* Route chip */}
        <div className="mono" style={{
          marginTop: 14, marginBottom: 18,
          fontSize: 9, letterSpacing: "0.14em", fontWeight: 700,
          color: "#6366F1",
          padding: "4px 10px", borderRadius: 5,
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.20)",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          {routeLabel(pathname)}
          <span style={{ color: t.text25, fontWeight: 500 }}>·</span>
          <span style={{ color: t.text40, fontWeight: 600, letterSpacing: "0.04em" }}>{pathname}</span>
        </div>

        {/* General Comments preamble */}
        <div style={{
          padding: "12px 14px", borderRadius: 10,
          background: "rgba(99,102,241,0.05)",
          border: "1px solid rgba(99,102,241,0.18)",
          marginBottom: 18,
        }}>
          <div className="mono" style={{
            fontSize: 8, letterSpacing: "0.14em", fontWeight: 700,
            color: "#6366F1", marginBottom: 8, textTransform: "uppercase",
          }}>General Comments</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: t.text50, fontSize: 11.5, lineHeight: 1.6 }}>
            {GENERAL_COMMENTS.map((g, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{g}</li>
            ))}
          </ul>
        </div>

        {/* Page commentary */}
        <div className="mono" style={{
          fontSize: 8, letterSpacing: "0.14em", fontWeight: 700,
          color: t.text25, marginBottom: 8, textTransform: "uppercase",
        }}>Page commentary</div>

        {paragraphs.length > 0 ? (
          <div style={{
            background: t.bgCard, border: `1px solid ${t.borderLight}`,
            borderRadius: 10, padding: "14px 16px",
          }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{
                fontSize: 12, lineHeight: 1.7, color: t.text60,
                marginBottom: i < paragraphs.length - 1 ? 10 : 0,
              }}>{p}</p>
            ))}
          </div>
        ) : (
          <div style={{
            background: t.bgCard, border: `1px dashed ${t.borderLight}`,
            borderRadius: 10, padding: "20px 16px",
            color: t.text35, fontSize: 11, textAlign: "center", fontStyle: "italic",
          }}>
            No commentary for this page.
          </div>
        )}

        {/* Footer note */}
        <div className="mono" style={{
          marginTop: 18, fontSize: 9, color: t.text25, lineHeight: 1.55,
          padding: "10px 12px", borderRadius: 7,
          background: t.bgCard, border: `1px solid ${t.borderRow}`,
        }}>
          <span style={{ color: t.text40, fontWeight: 700 }}>Source:</span>{" "}
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Imported_HTMLs/comments.md</span>
          <br />
          <span style={{ color: t.text25 }}>Static demo content · keyed by route</span>
        </div>
      </div>
    </>
  );
}
