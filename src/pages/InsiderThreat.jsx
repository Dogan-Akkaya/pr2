import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

/* ────────────────────────────────────────────────────────────────────────────
   ICONS
   ──────────────────────────────────────────────────────────────────────────── */
const Icon = {
  shield:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  shieldOk:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  alert:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  siren:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 13v8"/><path d="M5 21h14"/><path d="M5 13h14a2 2 0 0 0 0-4h-1.7a6 6 0 0 0-10.6 0H5a2 2 0 0 0 0 4z"/></svg>,
  clock:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  search:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  chart:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  download:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  fileText:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  message:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  star:      (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>,
  camera:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
};

const SOURCE_COLOR = {
  "EXPLOIT FORUM":   { bg: "rgba(168,85,247,0.14)", fg: "#A855F7" },
  "XSS FORUM":       { bg: "rgba(220,38,38,0.14)",  fg: "#DC2626" },
  "RAMP FORUM":      { bg: "rgba(245,158,11,0.14)", fg: "#F59E0B" },
  "TELEGRAM":        { bg: "rgba(34,211,238,0.14)", fg: "#22D3EE" },
};

const NAV_BLUE = "#3B82F6";
const NAV_BLUE_BG = "rgba(59,130,246,0.10)";

/* ────────────────────────────────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────────────────────────────────── */

const COMPANY = "GreenAnimals Bank";
const INDUSTRY = "Finance";

const STATS = [
  { value: "1,847",  label: "Recruitment Posts (12mo)",  color: null },
  { value: "23",     label: "Industries Targeted",        color: null },
  { value: "65+",    label: "Countries Mentioned",        color: null },
  { value: "$4,200", label: "Avg. Payment Offered",       color: "#F59E0B" },
  { value: "127",    label: "Posts Targeting Finance",     color: "#FF4562", highlight: true, sub: "YOUR INDUSTRY" },
];

const POSTS = [
  {
    id: 1, source: "EXPLOIT FORUM",
    actor: "sim_kingz", actorMeta: "Rep: 47 · 2yr",
    date: "Apr 27, 2026",
    text: 'Need insider at [redact]US Telecom[/redact] who can perform SIM swaps. Paying [redact]$1,500 per swap[/redact]. Must provide proof of employment first (badge photo or system screenshot). Weekly volume: 5–10 swaps. Serious inquiries only. Contact via Telegram @[redacted]',
    hasScreenshot: true,
    tags: [
      { label: "Telecom",         color: "#FF4562" },
      { label: "SIM Swap",         color: "#3B82F6" },
      { label: "United States",    color: "#22D3EE" },
      { label: "$1K–$5K",          color: "#F59E0B" },
    ],
    replies: 23, demandSignal: "High demand signal",
    isYourIndustry: false,
  },
  {
    id: 2, source: "TELEGRAM",
    actor: "bank_insider_recruiter", actorMeta: "New account",
    date: "Apr 25, 2026",
    text: 'Looking for employees at [redact]European Bank[/redact] willing to install software on internal workstation. One-time job, [redact]$8,000 payment via Monero[/redact]. No traces — our tool is FUD (fully undetectable). You just plug in a USB drive during lunch. Contact @[redacted]',
    hasScreenshot: false,
    tags: [
      { label: "Banking",          color: "#FF4562" },
      { label: "Malware Deploy",    color: "#A855F7" },
      { label: "Europe",            color: "#22D3EE" },
      { label: "$5K–$10K",          color: "#F59E0B" },
    ],
    replies: 8,
    isYourIndustry: true,
  },
  {
    id: 3, source: "RAMP FORUM",
    actor: "crypto_whale_99", actorMeta: "Rep: 82 · 3yr",
    date: "Apr 22, 2026",
    text: 'Hiring insider at [redact]Crypto Exchange[/redact]. Need someone with customer support or compliance access. Will pay [redact]$10,000 + 5% of proceeds[/redact]. Target: customer data export for specific high-value accounts. Long-term partnership preferred.',
    hasScreenshot: true,
    tags: [
      { label: "Crypto",           color: "#F59E0B" },
      { label: "Data Theft",        color: "#3B82F6" },
      { label: "Global",            color: "#94A3B8" },
      { label: "$10K+",             color: "#FF4562" },
    ],
    replies: 31, demandSignal: "Very high demand",
    isYourIndustry: false,
  },
  {
    id: 4, source: "XSS FORUM",
    actor: "anon_gov_worker", actorMeta: "Rep: 3 · 1mo",
    date: "Apr 20, 2026",
    text: 'Government contractor, [redact]US Defense[/redact] subcontractor. Have access to classified project management system and internal SharePoint. Willing to provide documents on request. Payment via Monero or BTC. Serious buyers only.',
    hasScreenshot: false,
    tags: [
      { label: "Government",       color: "#FF4562" },
      { label: "Classified Docs",   color: "#A855F7" },
      { label: "United States",     color: "#22D3EE" },
      { label: "Price TBD",         color: "#94A3B8" },
    ],
    replies: 5,
    insiderOffering: true,
    isYourIndustry: false,
  },
];

const INDUSTRIES = [
  { name: "Telecommunications",  count: 412, color: "#DC2626", barPct: 90,  yours: false },
  { name: "Banking & Finance",   count: 289, color: "#DC2626", barPct: 65,  yours: true  },
  { name: "Crypto Exchanges",    count: 223, color: "#EA580C", barPct: 50 },
  { name: "Cloud / SaaS",        count: 156, color: "#F59E0B", barPct: 35 },
  { name: "Government / Defense",count: 134, color: "#3B82F6", barPct: 30 },
  { name: "Retail / E-commerce", count: 98,  color: "#3B82F6", barPct: 22 },
  { name: "Manufacturing",       count: 81,  color: "#94A3B8", barPct: 18 },
  { name: "Pharmaceuticals",     count: 54,  color: "#94A3B8", barPct: 12 },
];

const PAYMENT_RANGES = [
  { label: "SIM Swap",              range: "$1,200 – $2,000",   color: "#F59E0B" },
  { label: "Database Access",        range: "$3,000 – $15,000",  color: "#F59E0B" },
  { label: "Malware Deployment",     range: "$5,000 – $10,000",  color: "#FF4562" },
  { label: "VPN / RDP Creds",        range: "$500 – $5,000",     color: "#F59E0B" },
  { label: "Physical Badge",         range: "$2,000 – $8,000",   color: null },
  { label: "Cloud Platform Insider", range: "$10,000+",          color: "#FF4562" },
  { label: "Classified Documents",   range: "$25,000+",          color: "#FF4562" },
];

const RECRUITERS = [
  { handle: "sim_kingz",            risk: "high",   meta: "Exploit, XSS · 230 posts · Active 1d ago · Rep: 47",       spec: "Specializes in telecom SIM swap recruitment. Active across 3 forums.",                tags: ["Telecom", "SIM Swap", "US"] },
  { handle: "crypto_whale_99",      risk: "high",   meta: "RAMP, BreachForums · 89 posts · Active 4d ago · Rep: 82",  spec: "Targets crypto exchange employees. Offers profit-sharing arrangements.",              tags: ["Crypto", "Data Theft", "Global"] },
  { handle: "bank_insider_recruiter",risk: "medium", meta: "Telegram · 45 posts · Active 2d ago · New account",       spec: "Focuses on European banking sector. Recruits for malware deployment.",                tags: ["Banking", "Europe", "Malware"] },
];

const MONITORING_STATS = [
  { value: "340",   label: "FORUMS MONITORED" },
  { value: "2,100", label: "TELEGRAM CHANNELS" },
  { value: "45",    label: "MARKETPLACES" },
  { value: "Every 2h", label: "SCAN FREQUENCY" },
];

const FORUMS_LIST = ["Exploit", "XSS", "BreachForums", "RAMP", "Verified", "Dread", "CrdClub", "BlackHatWorld", "+ 332 more"];

const ALERT_DEMO = {
  source: "EXPLOIT FORUM",
  actor: "darkrecruiter_99",
  date: "Apr 28, 2026",
  text: `Looking for employee at [redact]${COMPANY}[/redact] with access to customer database. Paying $5,000 per dump. Must verify employment (screenshot of internal portal). Long-term arrangement possible — $2,000/week retainer. Contact via TOX: [redacted]`,
  pills: [
    { label: "company name match", color: "#DC2626" },
    { label: "database access",     color: "#F59E0B" },
    { label: "$5,000/dump",         color: "#3B82F6" },
    { label: "TOX contact",         color: "#A855F7" },
    { label: "12 replies",          color: "#94A3B8" },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────────────────── */

function RedactedText({ text }) {
  const parts = String(text).split(/(\[redact\][^[]+\[\/redact\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[redact\](.+)\[\/redact\]$/);
        if (m) return (
          <span key={i} style={{
            color: "#DC2626", fontWeight: 700,
            background: "rgba(220,38,38,0.10)",
            padding: "1px 4px", borderRadius: 3,
          }}>{m[1]}</span>
        );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function PostCard({ post, t }) {
  const src = SOURCE_COLOR[post.source] || SOURCE_COLOR["EXPLOIT FORUM"];
  return (
    <div className="glass" style={{
      padding: "13px 16px", marginBottom: 8,
      border: post.isYourIndustry ? `1px solid rgba(255,69,98,0.20)` : undefined,
      background: post.isYourIndustry ? "rgba(255,69,98,0.03)" : undefined,
    }}>
      {post.isYourIndustry && (
        <div className="mono" style={{
          fontSize: 7.5, color: "#FF4562", fontWeight: 800, letterSpacing: "0.10em",
          marginBottom: 7, display: "flex", alignItems: "center", gap: 5,
        }}>
          <Icon.star width="9" height="9" />
          YOUR INDUSTRY — {INDUSTRY.toUpperCase()}
        </div>
      )}

      {post.insiderOffering && (
        <div style={{
          display: "inline-block", fontSize: 7.5, padding: "2px 7px", borderRadius: 4,
          background: "rgba(245,158,11,0.10)", color: "#F59E0B",
          fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}>INSIDER OFFERING ACCESS</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 7.5, padding: "2px 8px", borderRadius: 4,
            background: src.bg, color: src.fg, fontWeight: 800, letterSpacing: "0.06em",
            fontFamily: "'JetBrains Mono', monospace",
          }}>{post.source}</span>
          <span className="mono" style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>{post.actor}</span>
          <span className="mono" style={{ fontSize: 7.5, color: t.text35, padding: "1px 6px", borderRadius: 3, background: t.bgInput, letterSpacing: "0.04em" }}>{post.actorMeta}</span>
        </div>
        <span className="mono" style={{ fontSize: 9, color: t.text30, flexShrink: 0 }}>{post.date}</span>
      </div>

      <div className="mono" style={{
        fontSize: 10, lineHeight: 1.65, padding: "10px 12px", marginBottom: 8,
        background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 7,
        color: t.text60,
      }}>"<RedactedText text={post.text} />"</div>

      {post.hasScreenshot && (
        <div style={{
          width: "100%", height: 64, marginBottom: 8,
          background: t.bgCard, border: `1px dashed ${t.borderMed}`, borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          color: t.text35, fontSize: 9, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.04em",
        }}>
          <Icon.camera width="11" height="11" />
          Forum post screenshot — click to view (PII blurred)
        </div>
      )}

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {post.tags.map((tag, i) => (
          <span key={i} style={{
            fontSize: 7.5, padding: "2px 7px", borderRadius: 4,
            background: `${tag.color}14`, color: tag.color, fontWeight: 700,
            letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace",
          }}>{tag.label}</span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, color: t.text35 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon.message width="10" height="10" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <strong style={{ color: post.replies >= 20 ? "#DC2626" : post.replies >= 10 ? "#F59E0B" : t.text50 }}>{post.replies}</strong> replies
            {post.demandSignal && <span style={{ color: t.text30 }}> · {post.demandSignal}</span>}
          </span>
        </div>
        <span className="mono" style={{ fontSize: 9, color: NAV_BLUE, fontWeight: 600, cursor: "pointer" }}>View Details →</span>
      </div>
    </div>
  );
}

function SidebarWidget({ label, title, children, t }) {
  return (
    <div className="glass" style={{ padding: "14px 16px", marginBottom: 10 }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div className="hfont" style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────────── */

export default function InsiderThreat() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [alertMode, setAlertMode] = useState(false); // demo toggle
  const [industryFilter, setIndustryFilter] = useState("all");
  const [geoFilter, setGeoFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const visiblePosts = useMemo(() => {
    return POSTS.filter((p) => {
      if (industryFilter !== "all") {
        const tagLabels = p.tags.map((tg) => tg.label.toLowerCase());
        if (industryFilter === "finance" && !tagLabels.some((l) => l.includes("banking") || l.includes("finance"))) return false;
        if (industryFilter === "telecom" && !tagLabels.some((l) => l.includes("telecom"))) return false;
        if (industryFilter === "crypto"  && !tagLabels.some((l) => l.includes("crypto"))) return false;
        if (industryFilter === "cloud"   && !tagLabels.some((l) => l.includes("cloud") || l.includes("saas"))) return false;
        if (industryFilter === "gov"     && !tagLabels.some((l) => l.includes("government"))) return false;
      }
      if (accessFilter !== "all") {
        const tagLabels = p.tags.map((tg) => tg.label.toLowerCase());
        if (accessFilter === "sim" && !tagLabels.some((l) => l.includes("sim"))) return false;
        if (accessFilter === "db"  && !tagLabels.some((l) => l.includes("data") || l.includes("database"))) return false;
        if (accessFilter === "vpn" && !tagLabels.some((l) => l.includes("vpn") || l.includes("rdp"))) return false;
        if (accessFilter === "mal" && !tagLabels.some((l) => l.includes("malware"))) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${p.actor} ${p.text} ${p.tags.map((tg) => tg.label).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [industryFilter, accessFilter, searchQuery]);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ ZONE A: STATUS BANNER ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        {alertMode ? (
          <>
            <div style={{
              padding: "18px 22px", borderRadius: 14, position: "relative", overflow: "hidden",
              background: "linear-gradient(135deg, rgba(255,69,98,0.10), rgba(255,69,98,0.03))",
              border: "1px solid rgba(255,69,98,0.30)",
              display: "flex", alignItems: "center", gap: 16, marginBottom: 8,
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#DC2626", borderRadius: "14px 0 0 14px" }} />
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "rgba(220,38,38,0.10)", border: "2px solid rgba(220,38,38,0.30)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626", flexShrink: 0,
              }}>
                <Icon.siren width="22" height="22" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hfont" style={{ fontSize: 16, fontWeight: 800, color: "#DC2626", letterSpacing: "-0.01em" }}>
                  ALERT: Insider recruitment activity detected targeting {COMPANY}
                </div>
                <div style={{ fontSize: 11, color: t.text50, marginTop: 3 }}>1 recruitment post mentioning your organization was detected on Exploit Forum 2 days ago.</div>
              </div>
              <span style={{
                fontSize: 8, fontWeight: 800, padding: "4px 11px", borderRadius: 5,
                background: "rgba(220,38,38,0.14)", color: "#DC2626", letterSpacing: "0.10em",
                fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
              }}>CRITICAL</span>
              <button onClick={() => setAlertMode(false)} className="mono" style={{
                fontSize: 9, padding: "5px 11px", borderRadius: 5, cursor: "pointer",
                border: `1px solid ${t.borderMed}`, background: t.bgHover, color: t.text50,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
              }}>← Switch to clean</button>
            </div>

            <div style={{
              padding: "13px 16px", borderRadius: 10, position: "relative",
              background: "rgba(255,69,98,0.04)", border: "1px solid rgba(255,69,98,0.18)",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#DC2626", borderRadius: "10px 0 0 10px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 7.5, padding: "2px 8px", borderRadius: 4, background: SOURCE_COLOR[ALERT_DEMO.source].bg, color: SOURCE_COLOR[ALERT_DEMO.source].fg, fontWeight: 800, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{ALERT_DEMO.source}</span>
                  <span className="mono" style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>{ALERT_DEMO.actor}</span>
                  <span className="mono" style={{ fontSize: 9, color: t.text30 }}>{ALERT_DEMO.date}</span>
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, padding: "3px 10px", borderRadius: 4, background: "rgba(220,38,38,0.14)", color: "#DC2626", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>CRITICAL</span>
              </div>
              <div className="mono" style={{
                fontSize: 10, lineHeight: 1.65, padding: "10px 12px", marginBottom: 8,
                background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 7, color: t.text60,
              }}>"<RedactedText text={ALERT_DEMO.text} />"</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                {ALERT_DEMO.pills.map((pill, i) => (
                  <span key={i} style={{ fontSize: 7.5, padding: "2px 7px", borderRadius: 4, background: `${pill.color}14`, color: pill.color, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "'JetBrains Mono', monospace" }}>{pill.label}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {[
                  { label: "Mark as Reviewed", primary: true },
                  { label: "Export for Incident Report" },
                  { label: "View Full Post" },
                  { label: "Track Threat Actor" },
                ].map((a, i) => (
                  <span key={i} className="mono" style={{
                    fontSize: 8, fontWeight: 700, padding: "5px 11px", borderRadius: 5, cursor: "pointer",
                    border: `1px solid ${a.primary ? "rgba(59,130,246,0.30)" : t.borderMed}`,
                    background: a.primary ? NAV_BLUE_BG : "transparent",
                    color: a.primary ? NAV_BLUE : t.text50,
                    letterSpacing: "0.04em",
                  }}>{a.label}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            padding: "18px 22px", borderRadius: 14, position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02))",
            border: "1px solid rgba(22,163,74,0.20)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#16A34A", borderRadius: "14px 0 0 14px" }} />
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(22,163,74,0.10)", border: "2px solid rgba(22,163,74,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A", flexShrink: 0,
            }}>
              <Icon.shieldOk width="24" height="24" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hfont" style={{ fontSize: 15, fontWeight: 800, color: "#16A34A", letterSpacing: "-0.01em" }}>
                No insider recruitment targeting {COMPANY} detected
              </div>
              <div style={{ fontSize: 11, color: t.text50, marginTop: 3, lineHeight: 1.55, maxWidth: 720 }}>
                SOCRadar is actively monitoring 340 dark web forums, 2,100 Telegram channels, and 45 underground marketplaces for recruitment posts mentioning your organization, industry, and geography.
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 7, fontSize: 9, color: t.text40, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.clock width="10" height="10" /> Last scanned: <strong style={{ color: t.text }}>2 hours ago</strong></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.search width="10" height="10" /> Posts analyzed this month: <strong style={{ color: t.text }}>12,400</strong></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.chart width="10" height="10" /> Your industry ({INDUSTRY}): <strong style={{ color: t.text }}>127 posts tracked</strong></span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end", flexShrink: 0 }}>
              <button className="mono" style={{
                fontSize: 9, padding: "6px 12px", borderRadius: 6, cursor: "pointer",
                border: `1px solid rgba(59,130,246,0.30)`, background: NAV_BLUE_BG, color: NAV_BLUE,
                fontWeight: 700, letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <Icon.fileText width="11" height="11" />
                Export Board Report
              </button>
              <button className="mono" style={{
                fontSize: 9, padding: "6px 12px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${t.borderMed}`, background: t.bgHover, color: t.text50,
                fontWeight: 700, letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <Icon.download width="11" height="11" />
                Download Assessment
              </button>
              <button onClick={() => setAlertMode(true)} className="mono" style={{
                fontSize: 8.5, padding: "5px 11px", borderRadius: 5, cursor: "pointer",
                border: `1px dashed ${t.borderMed}`, background: "transparent", color: t.text35,
                fontWeight: 600, letterSpacing: "0.06em", marginTop: 2,
              }}>Demo: switch to alert state →</button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ZONE B1: LANDSCAPE STATS ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 7 }}>Insider Threat Landscape</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {STATS.map((s, i) => (
            <div key={i} className="glass" style={{
              padding: "12px 14px", textAlign: "center",
              border: s.highlight ? "1px solid rgba(255,69,98,0.20)" : undefined,
              background: s.highlight ? "rgba(255,69,98,0.03)" : undefined,
            }}>
              <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: s.color || t.text, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.10em", fontWeight: 700, marginTop: 2 }}>{s.label.toUpperCase()}</div>
              {s.sub && (
                <div className="mono" style={{ fontSize: 7, color: "#FF4562", letterSpacing: "0.10em", fontWeight: 800, marginTop: 3 }}>{s.sub}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ZONE B2 + B3: CONTENT LAYOUT ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 14,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>

        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Recent Recruitment Posts From The Wild</div>
          <div style={{ fontSize: 10.5, color: t.text40, marginBottom: 8, lineHeight: 1.5 }}>
            Real posts from dark web forums and Telegram, anonymized. Company names redacted. Threat actor handles shown.
          </div>

          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
            {[
              { key: "all",     label: "All Industries", active: industryFilter === "all" },
              { key: "finance", label: "★ Finance", active: industryFilter === "finance", yours: true },
              { key: "telecom", label: "Telecom", active: industryFilter === "telecom" },
              { key: "crypto",  label: "Crypto",  active: industryFilter === "crypto" },
              { key: "cloud",   label: "Cloud",   active: industryFilter === "cloud" },
              { key: "gov",     label: "Government", active: industryFilter === "gov" },
            ].map((p) => (
              <span key={p.key} onClick={() => setIndustryFilter(p.key)} className="mono" style={{
                fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 4, cursor: "pointer",
                border: `1px solid ${p.active ? "rgba(59,130,246,0.30)" : (p.yours ? "rgba(255,69,98,0.25)" : t.borderLight)}`,
                background: p.active ? NAV_BLUE_BG : "transparent",
                color: p.active ? NAV_BLUE : (p.yours ? "#FF4562" : t.text40),
                letterSpacing: "0.04em",
              }}>{p.label}</span>
            ))}
            <span style={{ width: 1, height: 16, background: t.borderLight, margin: "0 3px" }} />
            {[
              { key: "all", label: "All Geo" },
              { key: "us",  label: "US" },
              { key: "eu",  label: "EU" },
              { key: "me",  label: "ME" },
            ].map((p) => (
              <span key={p.key} onClick={() => setGeoFilter(p.key)} className="mono" style={{
                fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 4, cursor: "pointer",
                border: `1px solid ${geoFilter === p.key ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                background: geoFilter === p.key ? NAV_BLUE_BG : "transparent",
                color: geoFilter === p.key ? NAV_BLUE : t.text40,
                letterSpacing: "0.04em",
              }}>{p.label}</span>
            ))}
            <span style={{ width: 1, height: 16, background: t.borderLight, margin: "0 3px" }} />
            {[
              { key: "all", label: "All Access" },
              { key: "sim", label: "SIM Swap" },
              { key: "db",  label: "Database" },
              { key: "vpn", label: "VPN/RDP" },
              { key: "mal", label: "Malware" },
            ].map((p) => (
              <span key={p.key} onClick={() => setAccessFilter(p.key)} className="mono" style={{
                fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 4, cursor: "pointer",
                border: `1px solid ${accessFilter === p.key ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                background: accessFilter === p.key ? NAV_BLUE_BG : "transparent",
                color: accessFilter === p.key ? NAV_BLUE : t.text40,
                letterSpacing: "0.04em",
              }}>{p.label}</span>
            ))}
            <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
              <Icon.search width="11" height="11" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: t.text35 }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, actors, keywords..."
                style={{
                  width: "100%", padding: "5px 10px 5px 26px", fontSize: 9,
                  background: t.bgInput, color: t.text,
                  border: `1px solid ${t.borderLight}`, borderRadius: 5,
                  fontFamily: "'Inter', sans-serif", outline: "none",
                }}
              />
            </div>
          </div>

          {visiblePosts.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", fontSize: 11, color: t.text35, border: `1px dashed ${t.borderLight}`, borderRadius: 8 }}>
              No posts match these filters.
            </div>
          ) : (
            visiblePosts.map((p) => <PostCard key={p.id} post={p} t={t} />)
          )}

          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <span className="mono" style={{ fontSize: 9, color: t.text40, cursor: "pointer", letterSpacing: "0.06em" }}>Load more posts ↓</span>
          </div>
        </div>

        <div>
          <SidebarWidget label="Most Targeted Industries" title="Recruitment volume (12 months)" t={t}>
            {INDUSTRIES.map((ind, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 0",
                fontSize: 9.5,
                borderBottom: i < INDUSTRIES.length - 1 ? `1px solid ${t.borderRow}` : "none",
                background: ind.yours ? "rgba(255,69,98,0.04)" : "transparent",
                marginLeft: ind.yours ? -16 : 0,
                marginRight: ind.yours ? -16 : 0,
                paddingLeft: ind.yours ? 14 : 0,
                paddingRight: ind.yours ? 16 : 0,
                borderLeft: ind.yours ? "2px solid #FF4562" : undefined,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: t.text60 }}>{ind.name}</span>
                  {ind.yours && <span className="mono" style={{ fontSize: 6.5, color: "#FF4562", fontWeight: 800, marginLeft: 5, letterSpacing: "0.10em" }}>YOUR INDUSTRY</span>}
                </div>
                <div style={{ width: 70, height: 4, borderRadius: 2, background: t.bgElevated, overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ height: "100%", width: `${ind.barPct}%`, background: ind.color, opacity: 0.85 }} />
                </div>
                <span className="mono" style={{ width: 30, textAlign: "right", fontWeight: 700, fontSize: 9.5, color: ind.color }}>{ind.count}</span>
              </div>
            ))}
          </SidebarWidget>

          <SidebarWidget label="Typical Payment Ranges" title="By access type" t={t}>
            {PAYMENT_RANGES.map((p, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 9.5,
                borderBottom: i < PAYMENT_RANGES.length - 1 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <span style={{ color: t.text50 }}>{p.label}</span>
                <span className="mono" style={{ fontWeight: 700, color: p.color || t.text }}>{p.range}</span>
              </div>
            ))}
          </SidebarWidget>

          <SidebarWidget label="Top Insider Recruiters" title="Most active threat actors" t={t}>
            {RECRUITERS.map((r, i) => (
              <div key={i} style={{
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 6,
                padding: 10, marginBottom: i < RECRUITERS.length - 1 ? 5 : 0,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "#F59E0B" }}>{r.handle}</span>
                  <span className="mono" style={{
                    fontSize: 7, fontWeight: 700, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.06em",
                    background: r.risk === "high" ? "rgba(220,38,38,0.12)" : "rgba(245,158,11,0.12)",
                    color: r.risk === "high" ? "#DC2626" : "#F59E0B",
                  }}>{r.risk === "high" ? "HIGH RISK" : "MEDIUM"}</span>
                </div>
                <div className="mono" style={{ fontSize: 8, color: t.text35, marginBottom: 4 }}>{r.meta}</div>
                <div style={{ fontSize: 9.5, color: t.text60, marginBottom: 5, lineHeight: 1.5 }}>{r.spec}</div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {r.tags.map((tag, j) => (
                    <span key={j} className="mono" style={{ fontSize: 7, padding: "2px 6px", borderRadius: 3, background: t.bgInput, color: t.text40, fontWeight: 600, letterSpacing: "0.04em" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 6 }}>
              <span className="mono" style={{ fontSize: 9, color: NAV_BLUE, fontWeight: 600, cursor: "pointer" }}>View All 47 Actors →</span>
            </div>
          </SidebarWidget>
        </div>
      </div>

      {/* ═══ ZONE D: MONITORING SCOPE FOOTER ═══ */}
      <div className="glass" style={{
        padding: "18px 22px",
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Monitoring Scope — What SOCRadar Tracks</div>
        <div style={{ fontSize: 11, color: t.text50, marginBottom: 12 }}>Transparency: every forum, channel, and marketplace we cover for your insider threat detection.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
          {MONITORING_STATS.map((s, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 7,
              padding: "10px", textAlign: "center",
            }}>
              <div className="hfont" style={{ fontSize: 17, fontWeight: 800, color: NAV_BLUE, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.10em", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.10em", fontWeight: 700, marginBottom: 8 }}>FORUMS SCANNED</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {FORUMS_LIST.map((f, i) => (
            <span key={i} className="mono" style={{
              fontSize: 8, padding: "3px 9px", borderRadius: 4,
              background: "rgba(168,85,247,0.08)", color: "#A855F7",
              fontWeight: 700, letterSpacing: "0.04em",
            }}>{f}</span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: t.text40, lineHeight: 1.6 }}>
          <strong style={{ color: t.text60 }}>Detection methodology:</strong> SOCRadar monitors for posts containing your organization's name, domain, executive names, and industry-specific keywords in known recruitment contexts. Posts are analyzed for recruitment intent using NLP classification and manual analyst review. Keywords tracked for {COMPANY}: <em style={{ color: t.text50, fontStyle: "normal", fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>"greenanimalsbank", "greenanimals.com", "GreenAnimals Bank"</em>, executive names (3), banking + Turkey combinations.
        </div>
      </div>
    </div>
  );
}
