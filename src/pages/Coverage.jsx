import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// ═══════════════════════════════════════
// CATEGORIES — 6 disclosed groups + an undisclosed footer
// ═══════════════════════════════════════
// activity tier: "active" (green) · "moderate" (amber) · "high" (red)
const CATEGORIES = [
  {
    id: "messaging", label: "Messaging Platforms",
    color: "#22D3EE", iconKey: "chat",
    sources: [
      { name: "Discord", tier: "active" },
      { name: "IRC", tier: "active" },
      { name: "ICQ", tier: "active" },
      { name: "Telegram", tier: "high" },
    ],
    redacted: ["undisclosed_msg_01", "undisclosed_platform", "classified_src"],
  },
  {
    id: "social", label: "Social Media Platforms",
    color: "#6366F1", iconKey: "globe",
    sources: [
      { name: "Twitter / X", tier: "active" },
      { name: "Bluesky", tier: "active" },
      { name: "Reddit", tier: "active" },
    ],
    redacted: ["undisclosed_social", "classified_platform_02"],
  },
  {
    id: "dwm", label: "Dark Web Markets",
    color: "#FF4562", iconKey: "mask",
    sources: [
      { name: "Amigos BOT", tier: "active" },
      { name: "Amigos CC", tier: "active" },
      { name: "Breached Forum", tier: "high" },
      { name: "Easy Shop", tier: "active" },
      { name: "Epicmarket", tier: "active" },
      { name: "GenesisMarket", tier: "moderate" },
      { name: "Illegal Forums", tier: "active" },
      { name: "Onion Ransomware", tier: "high" },
      { name: "Ransomware Leak Files", tier: "high" },
      { name: "Russian Market Bot", tier: "high" },
      { name: "Russian Market CC", tier: "high" },
      { name: "XSS Forum", tier: "high" },
      { name: "Exploit.in Forum", tier: "high" },
      { name: "Deep Diver Finding", tier: "active" },
      { name: "Exodus Market Bot", tier: "active" },
      { name: "Brian's Club", tier: "moderate" },
      { name: "Rescator Market", tier: "active" },
      { name: "Botnet Info Stealer", tier: "active" },
    ],
    redacted: [
      "undisclosed_market_01", "classified_onion_src", "undisclosed_mkt",
      "partner_honeypot_feed", "undisclosed_market_03", "classified_forum",
    ],
  },
  {
    id: "feeds", label: "Threat Feed & Share Resources",
    color: "#F59E0B", iconKey: "antenna",
    sources: [
      { name: "AlienVault", tier: "active" },
      { name: "AnyRun", tier: "active" },
      { name: "APD AlterVista", tier: "active" },
      { name: "AbuseCH SSLBL", tier: "active" },
      { name: "AbuseCH Threatfox", tier: "active" },
      { name: "TG Check Host DDoS", tier: "moderate" },
      { name: "DDOS Watch", tier: "active" },
      { name: "DeHashed", tier: "high" },
      { name: "Enforcement Tracker", tier: "active" },
      { name: "Malware Bazaar", tier: "active" },
      { name: "Malpedia", tier: "active" },
      { name: "MalShare", tier: "active" },
      { name: "MalDatabase", tier: "active" },
      { name: "News", tier: "active" },
      { name: "PhishTank", tier: "active" },
      { name: "Secure Reload", tier: "active" },
      { name: "SOCRadar DarkWebTeam", tier: "high" },
      { name: "URLHaus", tier: "active" },
      { name: "URLScan", tier: "active" },
      { name: "VirusShare", tier: "active" },
      { name: "VMRay", tier: "active" },
      { name: "Ransomware Victims", tier: "high" },
      { name: "Cyber Attack", tier: "moderate" },
      { name: "Abuse IPDB", tier: "active" },
      { name: "CISA", tier: "active" },
      { name: "APK Markets", tier: "active" },
      { name: "DDoSia (NoName057)", tier: "high" },
    ],
    redacted: [
      "undisclosed_feed_01", "classified_threat_intel", "partner_feed_02",
      "undisclosed_ioc", "classified_humint", "undisclosed_feed_03",
      "partner_sigint", "classified_04", "undisclosed_src", "partner_feed_05",
    ],
  },
  {
    id: "api", label: "API Collection Platforms",
    color: "#A855F7", iconKey: "terminal",
    sources: [
      { name: "Postman", tier: "active" },
      { name: "Swagger", tier: "active" },
    ],
    redacted: ["undisclosed_api", "classified_api_src"],
  },
  {
    id: "repos", label: "Code Repository & Paste Sites",
    color: "#22C55E", iconKey: "doc",
    sources: [
      { name: "BitBin", tier: "active" },
      { name: "Github", tier: "active" },
      { name: "Github Gist", tier: "active" },
      { name: "Pastebin", tier: "moderate" },
      { name: "Repo Activity", tier: "active" },
      { name: "Huggingface", tier: "active" },
      { name: "Scribd", tier: "active" },
    ],
    redacted: ["undisclosed_repo", "classified_paste", "partner_repo_src", "undisclosed_02"],
  },
];

// Footer redacted-pill widths (for blurred decorative background)
const FOOTER_WIDTHS = [110, 85, 130, 95, 145, 80, 120, 100, 140, 90, 115, 135, 88, 125, 105, 95, 142, 78, 118, 132, 92, 148, 86, 122];

const TIER_COLOR = {
  active: "#22C55E",
  moderate: "#F59E0B",
  high: "#FF4562",
};

// ═══════════════════════════════════════
// Inline icon helper
// ═══════════════════════════════════════
function CatIcon({ name, color, size = 14 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "chat":
      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "globe":
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    case "mask":
      return <svg {...props}><path d="M3 12c0-4 4-7 9-7s9 3 9 7c0 3-2 5-3 6s-3 1-6 1-5 0-6-1-3-3-3-6z" /><circle cx="9" cy="11" r="1.5" fill={color} /><circle cx="15" cy="11" r="1.5" fill={color} /></svg>;
    case "antenna":
      return <svg {...props}><path d="M5 3a17 17 0 0 0 0 18M19 3a17 17 0 0 1 0 18" /><path d="M9 7a8 8 0 0 0 0 10M15 7a8 8 0 0 1 0 10" /><circle cx="12" cy="12" r="2" fill={color} /></svg>;
    case "terminal":
      return <svg {...props}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>;
    case "doc":
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>;
    default:
      return null;
  }
}

function Check({ size = 11, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Lock({ size = 9, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// ═══════════════════════════════════════
export default function Coverage() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const totalDisclosed = CATEGORIES.reduce((s, c) => s + c.sources.length, 0);

  return (
    <div style={{
      padding: "28px 24px",
      display: "flex", flexDirection: "column", gap: 18,
      maxWidth: 980, margin: "0 auto", width: "100%",
    }}>
      {/* ═══ HEADER ═══ */}
      <div style={{
        textAlign: "center", marginBottom: 8,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div className="mono" style={{
          fontSize: 9, color: t.text25, letterSpacing: "0.24em",
          fontWeight: 700, marginBottom: 8, textTransform: "uppercase",
        }}>Advanced Dark Web Monitoring</div>
        <h1 className="hfont" style={{
          fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em",
          marginBottom: 8, color: t.text,
        }}>Coverage</h1>
        <div style={{ fontSize: 12, color: t.text45, marginBottom: 22 }}>
          Sources actively monitored by SOCRadar's intelligence platform
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { val: String(totalDisclosed), extra: "+ undisclosed", label: "DISCLOSED SOURCES", color: t.text },
            { val: "250", label: "COUNTRIES", color: t.text },
            { val: "41", label: "SECTORS", color: t.text },
            { val: "24/7", label: "CONTINUOUS SCANNING", color: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              {s.extra && <div className="mono" style={{ fontSize: 9, color: t.text30, fontWeight: 500, marginTop: 1 }}>{s.extra}</div>}
              <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.15em", fontWeight: 700, marginTop: s.extra ? 1 : 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CATEGORY SECTIONS ═══ */}
      {CATEGORIES.map((cat, idx) => (
        <div key={cat.id} style={{
          animation: loaded ? `fadeUp 0.6s ${0.05 * (idx + 1)}s cubic-bezier(0.16,1,0.3,1) both` : "none",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0",
            borderBottom: `1px solid ${t.borderRow}`,
            marginBottom: 12,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `${cat.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <CatIcon name={cat.iconKey} color={cat.color} size={14} />
            </div>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700, flex: 1, color: t.text }}>{cat.label}</span>
            <span className="mono" style={{
              fontSize: 9, color: t.text45,
              background: t.bgInput, padding: "2px 9px", borderRadius: 4, fontWeight: 600,
            }}>{cat.sources.length} disclosed</span>
            <span className="mono" style={{ fontSize: 8, color: t.text25, fontStyle: "italic" }}>+ undisclosed</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {/* Disclosed pills */}
            {cat.sources.map(src => (
              <div key={src.name} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: t.bgCard,
                border: `1px solid ${t.borderLight}`,
                borderRadius: 7, padding: "7px 12px",
                fontSize: 10, fontWeight: 500,
              }}>
                <Check size={11} color="#22C55E" />
                <span style={{ whiteSpace: "nowrap", color: t.text }}>{src.name}</span>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: TIER_COLOR[src.tier], flexShrink: 0,
                  boxShadow: `0 0 5px ${TIER_COLOR[src.tier]}80`,
                }} />
              </div>
            ))}
            {/* Redacted pills */}
            {cat.redacted.map((label, i) => (
              <div key={i} aria-hidden="true" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: t.bgInput,
                border: `1px solid ${t.borderLight}`,
                borderRadius: 7, padding: "7px 12px",
                fontSize: 10, userSelect: "none", pointerEvents: "none",
                position: "relative", overflow: "hidden",
              }}>
                <Lock size={9} color={t.text25} />
                <span style={{
                  filter: "blur(5px)",
                  color: t.text25,
                  fontWeight: 500, whiteSpace: "nowrap",
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ═══ UNDISCLOSED FOOTER ═══ */}
      <div className="glass" style={{
        padding: "30px 24px", marginTop: 20,
        position: "relative", overflow: "hidden", textAlign: "center",
        animation: loaded ? "fadeUp 0.6s 0.45s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Blurred decorative pill background */}
        <div aria-hidden="true" style={{
          display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
          marginBottom: 18, opacity: 0.45,
        }}>
          {FOOTER_WIDTHS.map((w, i) => (
            <span key={i} style={{
              display: "inline-block", height: 28, width: w, borderRadius: 7,
              background: t.bgInput, border: `1px solid ${t.borderLight}`,
              filter: "blur(5px)",
            }} />
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 className="hfont" style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: t.text }}>
            The full picture extends beyond what's shown here
          </h3>
          <p style={{
            fontSize: 11, color: t.text45, maxWidth: 540,
            margin: "0 auto", lineHeight: 1.7,
          }}>
            SOCRadar monitors additional sources through automated crawlers, analyst networks, proprietary honeypots, and classified partnerships that cannot be publicly disclosed.
          </p>
          <div style={{
            display: "inline-block",
            background: "rgba(99,102,241,0.10)",
            border: "1px solid rgba(99,102,241,0.22)",
            padding: "5px 16px", borderRadius: 7,
            fontSize: 10, fontWeight: 700, color: "#6366F1",
            marginTop: 14, fontFamily: "'JetBrains Mono', monospace",
          }}>
            + approximately 40 additional undisclosed sources
          </div>
        </div>
      </div>

      {/* ═══ LEGEND ═══ */}
      <div style={{
        background: t.bgInput, borderRadius: 8, padding: "12px 18px",
        textAlign: "center", marginTop: 4,
        animation: loaded ? "fadeUp 0.6s 0.5s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.16em", fontWeight: 600, marginBottom: 6 }}>STATUS INDICATORS</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, fontSize: 9, color: t.text40, flexWrap: "wrap" }}>
          {[
            { c: "#22C55E", l: "Active" },
            { c: "#F59E0B", l: "Moderate activity" },
            { c: "#FF4562", l: "High activity" },
          ].map((i) => (
            <span key={i.l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: i.c }} />
              {i.l}
            </span>
          ))}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: t.bgInput, border: `1px solid ${t.borderLight}`, filter: "blur(1.5px)" }} />
            Undisclosed / Classified
          </span>
        </div>
      </div>
    </div>
  );
}
