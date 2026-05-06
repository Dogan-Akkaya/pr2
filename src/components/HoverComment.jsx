import { useState, useId } from "react";
import { useTheme } from "../context/ThemeContext";
import { HOVER_COMMENTS } from "../data/comments";

/**
 * <HoverComment anchorKey="dashboard.info-card" />
 *
 * Drop inside any container with `position: relative`. Renders a `?`-in-circle
 * icon at the top-right; on hover or focus it reveals a tooltip popover with
 * the matching entry from HOVER_COMMENTS.
 *
 * Renders nothing if anchorKey isn't in the dictionary, so anchors can be
 * placed proactively even before content is authored for them.
 */
export default function HoverComment({
  anchorKey,
  // optional positioning overrides
  top = 8,
  right = 8,
  // open the panel direction; "below" (default) or "above"
  side = "below",
}) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const text = HOVER_COMMENTS[anchorKey];
  if (!text) return null;

  const showTip = () => setOpen(true);
  const hideTip = () => setOpen(false);

  return (
    <div
      style={{
        position: "absolute", top, right,
        zIndex: 5, // above sibling content but below modal/dropdown layers
      }}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      <button
        type="button"
        aria-describedby={open ? tipId : undefined}
        aria-label="Show note for this section"
        onFocus={showTip}
        onBlur={hideTip}
        style={{
          width: 18, height: 18, borderRadius: "50%",
          border: `1px solid ${open ? "rgba(99,102,241,0.55)" : "rgba(99,102,241,0.30)"}`,
          background: open ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.08)",
          color: "#6366F1",
          fontSize: 10, fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          cursor: "help",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: open ? 1 : 0.7,
          transition: "all 0.15s ease",
          padding: 0, lineHeight: 1,
        }}
      >?</button>
      {open && (
        <div
          id={tipId}
          role="tooltip"
          style={{
            position: "absolute",
            top: side === "below" ? "calc(100% + 6px)" : "auto",
            bottom: side === "above" ? "calc(100% + 6px)" : "auto",
            right: 0,
            width: 280,
            background: t.bgPanel,
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11, lineHeight: 1.55, color: t.text50,
            boxShadow: "0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.2)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          <div className="mono" style={{
            fontSize: 7, letterSpacing: "0.14em", fontWeight: 700,
            color: "#6366F1", marginBottom: 6, textTransform: "uppercase",
          }}>Demo note</div>
          {text}
        </div>
      )}
    </div>
  );
}
