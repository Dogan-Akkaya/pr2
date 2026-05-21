import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

// SHA-256 hex digest of the demo access code.
// To rotate: `printf '%s' 'newpassword' | shasum -a 256` and replace the constant.
// Never commit the plain text — only this digest lives in the repo.
const ACCESS_HASH = "dd1473eecff6094fec56dff7cc50bce1095328685e56217839845f42fd6b2795";

// sessionStorage (not localStorage) so a new browser session re-prompts —
// matches "one time each time they access".
const UNLOCK_KEY = "dw_unlocked";

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PasswordGate({ children }) {
  const { t } = useTheme();
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(UNLOCK_KEY) === "1"; } catch { return false; }
  });
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (!unlocked) inputRef.current?.focus(); }, [unlocked]);

  if (unlocked) return children;

  async function submit(e) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const hash = await sha256Hex(value);
    if (hash === ACCESS_HASH) {
      try { sessionStorage.setItem(UNLOCK_KEY, "1"); } catch { /* sessionStorage unavailable — accept this session anyway */ }
      setUnlocked(true);
    } else {
      setError("Incorrect access code.");
      setValue("");
      inputRef.current?.focus();
    }
    setPending(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: t.bgBase,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <form onSubmit={submit} style={{
        width: "100%", maxWidth: 420,
        padding: "28px 30px 24px",
        borderRadius: 16,
        background: t.bgCard,
        border: `1px solid ${t.borderLight}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.2)",
      }}>
        {/* Coral accent strip — matches the rest of the brand */}
        <div style={{
          width: 36, height: 3, borderRadius: 2,
          background: "#FF4562", marginBottom: 18,
        }} />

        <div className="mono" style={{
          fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "rgba(255,69,98,0.85)", fontWeight: 700, marginBottom: 8,
        }}>SOCRadar Demo</div>

        <h1 className="hfont" style={{
          fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
          color: t.text, margin: "0 0 6px",
        }}>Enter access code</h1>

        <p style={{ fontSize: 12, color: t.text50, lineHeight: 1.55, margin: "0 0 18px" }}>
          This prototype is gated. Enter the access code to view the dark web monitoring demo. The code is required each time you open a new browser session.
        </p>

        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); if (error) setError(""); }}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="Access code"
          style={{
            width: "100%", padding: "11px 14px", fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            background: t.bgInput,
            border: `1px solid ${error ? "rgba(220,38,38,0.45)" : t.borderLight}`,
            borderRadius: 10,
            color: t.text, outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={e => { if (!error) e.target.style.borderColor = "rgba(255,69,98,0.45)"; }}
          onBlur={e => { if (!error) e.target.style.borderColor = t.borderLight; }}
        />

        {error && (
          <div style={{
            marginTop: 8, fontSize: 11, color: "#DC2626",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || !value}
          style={{
            width: "100%", marginTop: 16, padding: "11px 14px",
            borderRadius: 10, border: "none",
            background: "#FF4562", color: "#fff",
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            cursor: pending || !value ? "not-allowed" : "pointer",
            opacity: pending || !value ? 0.55 : 1,
            boxShadow: "0 4px 16px rgba(255,69,98,0.30)",
            transition: "opacity 0.15s",
          }}
        >{pending ? "Verifying…" : "Unlock demo"}</button>

        <div className="mono" style={{
          marginTop: 18, fontSize: 9, color: t.text30,
          letterSpacing: "0.08em", textAlign: "center",
        }}>
          Prototype · synthesised data
        </div>
      </form>
    </div>
  );
}
