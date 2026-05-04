import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

// ═══════════════════════════════════════
// BREACH CATALOG — 12 representative entries
// ═══════════════════════════════════════
const BREACHES = [
  {
    id: 1, company: "Snowflake", domain: "snowflake.com",
    initials: "S", logoBg: "rgba(34,211,238,0.12)", logoColor: "#22D3EE",
    types: ["Email", "Password", "Username", "Phone", "SSN"],
    desc: "Massive cloud data breach affecting 165+ customer organizations including AT&T, Ticketmaster",
    records: "99.7M", recordsTier: "critical",
    breachDate: "Apr 2026", publishedDate: "May 2026",
    verified: true,
    yourMatches: 14, // your customers/employees found in this breach
  },
  {
    id: 2, company: "Ticketmaster", domain: "ticketmaster.com",
    yourMatches: 8,
    initials: "T", logoBg: "rgba(255,69,98,0.10)", logoColor: "#FF4562",
    types: ["Email", "Password", "Financial", "Address"],
    desc: "Data breach exposing customer payment information, event history, and personal details",
    records: "560M", recordsTier: "critical",
    breachDate: "May 2024", publishedDate: "Jul 2024",
    verified: true,
  },
  {
    id: 3, company: "Coinbase", domain: "coinbase.com",
    initials: "CB", logoBg: "rgba(245,158,11,0.10)", logoColor: "#F59E0B",
    types: ["Email", "Phone", "SSN", "Financial", "IP"],
    desc: "Insider-facilitated breach exposing customer PII and financial data. $400M estimated cost.",
    records: "6.9M", recordsTier: "high",
    breachDate: "Jan 2025", publishedDate: "May 2025",
    verified: true,
    yourMatches: 3,
  },
  {
    id: 4, company: "SongTrivia", domain: "songtrivia2.com",
    initials: "ST", logoBg: "rgba(51,65,85,0.18)", logoColor: "#94A3B8",
    types: ["Email", "Password", "Username"],
    desc: "Music trivia platform breach exposing user credentials and gameplay data",
    records: "1.2M", recordsTier: "medium",
    breachDate: "Mar 2026", publishedDate: "Apr 2026",
    verified: false,
  },
  {
    id: 5, company: "Nat'l Public Data", domain: "nationalpublicdata.com",
    initials: "NPD", logoBg: "rgba(99,102,241,0.10)", logoColor: "#6366F1",
    types: ["SSN", "Email", "Address", "DOB", "Phone"],
    desc: "Background check firm breach exposing 272M SSNs. Largest SSN breach in US history.",
    records: "2.9B", recordsTier: "critical",
    breachDate: "Dec 2023", publishedDate: "Aug 2024",
    verified: true,
    yourMatches: 41,
  },
  {
    id: 6, company: "AT&T", domain: "att.com",
    initials: "AT", logoBg: "rgba(0,136,204,0.12)", logoColor: "#22D3EE",
    types: ["Email", "Phone", "Address", "DOB", "SSN"],
    desc: "Customer data leak via Snowflake-related compromise. ~73M historical records exposed.",
    records: "73M", recordsTier: "critical",
    breachDate: "May 2024", publishedDate: "Jul 2024",
    verified: true,
  },
  {
    id: 7, company: "MOVEit Transfer", domain: "progress.com",
    initials: "MT", logoBg: "rgba(255,69,98,0.10)", logoColor: "#FF4562",
    types: ["Email", "Username", "Address", "DOB", "Financial"],
    desc: "Mass exploitation by Cl0p ransomware group. Affected 2,700+ organizations globally.",
    records: "95M", recordsTier: "critical",
    breachDate: "Jun 2023", publishedDate: "Aug 2023",
    verified: true,
  },
  {
    id: 8, company: "23andMe", domain: "23andme.com",
    initials: "23", logoBg: "rgba(168,85,247,0.10)", logoColor: "#A855F7",
    types: ["Email", "Username", "Address", "DOB"],
    desc: "Credential-stuffing attack exposing genetic data and family relationship info.",
    records: "6.9M", recordsTier: "high",
    breachDate: "Apr 2023", publishedDate: "Oct 2023",
    verified: true,
  },
  {
    id: 9, company: "Twitter / X", domain: "x.com",
    initials: "X", logoBg: "rgba(15,23,42,0.55)", logoColor: "#E2E8F0",
    types: ["Email", "Username", "Phone"],
    desc: "API vulnerability scraped 200M+ user emails linked to public profiles.",
    records: "209M", recordsTier: "critical",
    breachDate: "Jun 2021", publishedDate: "Jan 2023",
    verified: true,
  },
  {
    id: 10, company: "Yahoo!", domain: "yahoo.com",
    initials: "Y!", logoBg: "rgba(168,85,247,0.10)", logoColor: "#A855F7",
    types: ["Email", "Password", "Username", "Phone", "DOB"],
    desc: "Historic 2013 breach disclosed in 2016. All Yahoo accounts compromised.",
    records: "3B", recordsTier: "critical",
    breachDate: "Aug 2013", publishedDate: "Sep 2016",
    verified: true,
  },
  {
    id: 11, company: "LinkedIn", domain: "linkedin.com",
    initials: "Li", logoBg: "rgba(0,119,181,0.12)", logoColor: "#22D3EE",
    types: ["Email", "Username", "Phone", "Address"],
    desc: "Scraped data of 700M users posted on hacking forum. Includes professional details.",
    records: "700M", recordsTier: "critical",
    breachDate: "Jun 2021", publishedDate: "Jun 2021",
    verified: true,
    yourMatches: 27,
  },
  {
    id: 12, company: "Adobe", domain: "adobe.com",
    initials: "Ae", logoBg: "rgba(255,69,98,0.10)", logoColor: "#FF4562",
    types: ["Email", "Password", "Username"],
    desc: "Hack exposing encrypted password and customer details. Source code also stolen.",
    records: "153M", recordsTier: "critical",
    breachDate: "Oct 2013", publishedDate: "Nov 2013",
    verified: true,
  },
];

// ═══════════════════════════════════════
// COMBOLISTS — 8 representative entries
// ═══════════════════════════════════════
const COMBOLISTS = [
  {
    id: 1, company: "RockYou2024.txt", domain: "leak compilation",
    initials: "R24", logoBg: "rgba(255,69,98,0.10)", logoColor: "#FF4562",
    types: ["Password"],
    desc: "Largest password compilation ever published. 9.9 billion plaintext passwords aggregated from prior leaks.",
    records: "9.9B", recordsTier: "critical",
    breachDate: "Jul 2024", publishedDate: "Jul 2024",
    verified: true,
    yourMatches: 184,
  },
  {
    id: 2, company: "Collection #1-5", domain: "compilation",
    initials: "C5", logoBg: "rgba(245,158,11,0.10)", logoColor: "#F59E0B",
    types: ["Email", "Password"],
    desc: "Aggregated breach combolist totaling 1B+ unique email/password pairs across thousands of sources.",
    records: "2.7B", recordsTier: "critical",
    breachDate: "Jan 2019", publishedDate: "Jan 2019",
    verified: true,
  },
  {
    id: 3, company: "Naz.API combo dump", domain: "stealer log mix",
    initials: "NZ", logoBg: "rgba(168,85,247,0.10)", logoColor: "#A855F7",
    types: ["Email", "Password", "URL"],
    desc: "Mixed combolist sourced from infostealer logs. Includes URL context for each credential pair.",
    records: "319M", recordsTier: "critical",
    breachDate: "Sep 2023", publishedDate: "Jan 2024",
    verified: true,
  },
  {
    id: 4, company: "Anti-Public combo", domain: "compilation",
    initials: "AP", logoBg: "rgba(99,102,241,0.10)", logoColor: "#6366F1",
    types: ["Email", "Password"],
    desc: "Cracker community-curated combolist updated quarterly. Cleaned for credential-stuffing tools.",
    records: "452M", recordsTier: "critical",
    breachDate: "Apr 2017", publishedDate: "Apr 2017",
    verified: true,
  },
  {
    id: 5, company: "Exploit.in combo", domain: "forum dump",
    initials: "Ex", logoBg: "rgba(255,69,98,0.10)", logoColor: "#FF4562",
    types: ["Email", "Password", "Username"],
    desc: "Compiled dump from Exploit.in forum members. Heavy overlap with Collection #1.",
    records: "805M", recordsTier: "critical",
    breachDate: "Oct 2016", publishedDate: "Dec 2016",
    verified: true,
    yourMatches: 12,
  },
  {
    id: 6, company: "Cit0day megabreach", domain: "compilation",
    initials: "C0", logoBg: "rgba(34,211,238,0.10)", logoColor: "#22D3EE",
    types: ["Email", "Password", "Username"],
    desc: "Aggregator of 23,000 breached databases sold via Cit0day service. Shut down by FBI in 2020.",
    records: "226M", recordsTier: "critical",
    breachDate: "Sep 2020", publishedDate: "Nov 2020",
    verified: true,
  },
  {
    id: 7, company: "Stealer Logs Dec 2025", domain: "rolling dump",
    initials: "SL", logoBg: "rgba(245,158,11,0.10)", logoColor: "#F59E0B",
    types: ["Email", "Password", "URL", "Username"],
    desc: "Monthly redline/raccoon stealer log compilation. Includes browser autofill + cookies.",
    records: "47.3M", recordsTier: "high",
    breachDate: "Dec 2025", publishedDate: "Jan 2026",
    verified: true,
    yourMatches: 9,
  },
  {
    id: 8, company: "Telegram combos 2026-Q1", domain: "rolling dump",
    initials: "TG", logoBg: "rgba(34,211,238,0.10)", logoColor: "#22D3EE",
    types: ["Email", "Password"],
    desc: "Quarterly aggregate from public Telegram leak channels. Heavy duplication with combolists.",
    records: "21.8M", recordsTier: "high",
    breachDate: "Mar 2026", publishedDate: "Apr 2026",
    verified: false,
  },
];

const TYPE_COLORS = {
  Email:     { fg: "#3B82F6", bg: "rgba(59,130,246,0.10)" },
  Password:  { fg: "#FF4562", bg: "rgba(255,69,98,0.10)" },
  Phone:     { fg: "#22D3EE", bg: "rgba(34,211,238,0.10)" },
  SSN:       { fg: "#DC2626", bg: "rgba(220,38,38,0.12)" },
  DOB:       { fg: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
  Address:   { fg: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  Financial: { fg: "#A855F7", bg: "rgba(168,85,247,0.10)" },
  IP:        { fg: "#22D3EE", bg: "rgba(34,211,238,0.08)" },
  Username:  { fg: "#22C55E", bg: "rgba(34,197,94,0.10)" },
  URL:       { fg: "#6366F1", bg: "rgba(99,102,241,0.10)" },
};

const RECORDS_TIER = {
  critical: { fg: "#FF4562", bg: "rgba(255,69,98,0.12)" },
  high:     { fg: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  medium:   { fg: "#6366F1", bg: "rgba(99,102,241,0.10)" },
  low:      { fg: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};

const PER_PAGE = 8;

// ═══════════════════════════════════════
export default function BreachIndex() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("catalog");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [yoursOnly, setYoursOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const dataset = activeTab === "catalog" ? BREACHES : COMBOLISTS;

  const filtered = useMemo(() => {
    return dataset.filter(b => {
      if (yoursOnly && !(b.yourMatches > 0)) return false;
      if (verifiedOnly && !b.verified) return false;
      if (typeFilter !== "All" && !b.types.includes(typeFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${b.company} ${b.domain} ${b.types.join(" ")} ${b.desc}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dataset, yoursOnly, verifiedOnly, typeFilter, search]);

  const totalYourMatches = useMemo(() =>
    dataset.reduce((s, b) => s + (b.yourMatches || 0), 0),
  [dataset]);
  const datasetsWithYou = useMemo(() => dataset.filter(b => b.yourMatches > 0).length, [dataset]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const filterTypes = ["All", "Email", "Password", "Phone", "SSN", "Financial"];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(99,102,241,0.10)",
          border: "1px solid rgba(99,102,241,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>Cyber Threat Intelligence</div>
          <div className="hfont" style={{ fontSize: 17, fontWeight: 800, marginTop: 2, color: t.text }}>Breach Index</div>
          <div style={{ fontSize: 10, color: t.text45, marginTop: 2 }}>SOCRadar's comprehensive catalog of indexed data breaches and combolists</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { label: "BREACHES TRACKED", value: "16.4K", color: t.text },
            { label: "DATASETS INDEXED", value: "406", color: "#6366F1" },
            { label: "COMBOLISTS", value: "9.4K", color: t.text },
            { label: "RECORDS", value: "6.5B+", color: "#FF4562" },
            { label: "ADDED THIS MONTH", value: "+12", color: "#22C55E" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 70 }}>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{
        display: "flex", gap: 2,
        borderBottom: `1px solid ${t.borderSection}`,
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {[
          { id: "catalog", label: "Breach Catalog", count: BREACHES.length, displayCount: "406" },
          { id: "combolists", label: "Combolists", count: COMBOLISTS.length, displayCount: "9.4K" },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              style={{
                padding: "10px 18px", border: "none", background: "transparent",
                color: isActive ? "#6366F1" : t.text40,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                borderBottom: `2px solid ${isActive ? "#6366F1" : "transparent"}`,
                marginBottom: -1, display: "flex", alignItems: "center", gap: 7,
                fontFamily: "'Inter', sans-serif", transition: "all 0.15s ease",
              }}
            >
              {tab.label}
              <span style={{
                padding: "1px 7px", borderRadius: 4,
                background: isActive ? "rgba(99,102,241,0.18)" : t.bgInput,
                color: isActive ? "#6366F1" : t.text35,
                fontSize: 8, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{tab.displayCount}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ SEARCH + FILTERS ═══ */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={activeTab === "catalog" ? "Search breaches by company, domain, or data type..." : "Search combolists by name or content..."}
            style={{
              width: "100%", padding: "9px 14px 9px 34px",
              background: t.bgInput, border: `1px solid ${t.borderLight}`,
              borderRadius: 8, color: t.text, fontSize: 11,
              fontFamily: "'Inter', sans-serif", outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {filterTypes.map(ft => {
            const isActive = typeFilter === ft;
            const dotColor = TYPE_COLORS[ft]?.fg || t.text;
            return (
              <button key={ft} onClick={() => { setTypeFilter(ft); setPage(1); }} style={{
                padding: "5px 10px", borderRadius: 5,
                border: `1px solid ${isActive ? "rgba(99,102,241,0.30)" : t.borderLight}`,
                background: isActive ? "rgba(99,102,241,0.10)" : "transparent",
                color: isActive ? "#6366F1" : t.text40,
                fontSize: 9, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                fontFamily: "'Inter', sans-serif",
              }}>
                {ft !== "All" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor }} />}
                {ft}
              </button>
            );
          })}
          <button onClick={() => { setVerifiedOnly(v => !v); setPage(1); }} style={{
            padding: "5px 10px", borderRadius: 5,
            border: `1px solid ${verifiedOnly ? "rgba(34,197,94,0.30)" : t.borderLight}`,
            background: verifiedOnly ? "rgba(34,197,94,0.10)" : "transparent",
            color: verifiedOnly ? "#22C55E" : t.text40,
            fontSize: 9, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'Inter', sans-serif",
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            Verified
          </button>
          {/* Yours-only filter — primary lens bridge into the global breach catalog */}
          <button onClick={() => { setYoursOnly(v => !v); setPage(1); }} title={`${datasetsWithYou} datasets contain ${totalYourMatches} of your accounts`} style={{
            padding: "5px 10px", borderRadius: 5,
            border: `1px solid ${yoursOnly ? "rgba(255,69,98,0.32)" : t.borderLight}`,
            background: yoursOnly ? "rgba(255,69,98,0.10)" : "transparent",
            color: yoursOnly ? "#FF4562" : t.text40,
            fontSize: 9, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4562" }} />
            YOURS
            <span style={{ color: yoursOnly ? "#FF4562" : t.text35, fontFamily: "'JetBrains Mono', monospace" }}>{datasetsWithYou}</span>
          </button>
        </div>
      </div>

      {/* ═══ BREACH TABLE ═══ */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 90px 90px 90px 80px",
          gap: 12, padding: "9px 16px",
          fontSize: 8, color: t.text25, letterSpacing: "0.14em", fontWeight: 700,
          borderBottom: `1px solid ${t.borderSection}`,
          background: t.bgInput,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>COMPANY</span>
          <span>DATA TYPES & DESCRIPTION</span>
          <span style={{ textAlign: "center" }}>RECORDS</span>
          <span style={{ textAlign: "center" }}>BREACH</span>
          <span style={{ textAlign: "center" }}>PUBLISHED</span>
          <span style={{ textAlign: "center" }}>STATUS</span>
        </div>

        {pageData.length === 0 ? (
          <div style={{
            padding: 50, textAlign: "center", color: t.text40, fontSize: 12,
          }}>
            No {activeTab === "catalog" ? "breaches" : "combolists"} match the current filters.
          </div>
        ) : (
          pageData.map(b => (
            <div key={b.id} style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr 90px 90px 90px 80px",
              gap: 12, padding: "12px 16px",
              alignItems: "center", cursor: "pointer",
              borderBottom: `1px solid ${t.borderRow}`,
              borderLeft: b.yourMatches > 0 ? "3px solid #FF4562" : "3px solid transparent",
              background: b.yourMatches > 0 ? "rgba(255,69,98,0.025)" : "transparent",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = b.yourMatches > 0 ? "rgba(255,69,98,0.06)" : "rgba(99,102,241,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = b.yourMatches > 0 ? "rgba(255,69,98,0.025)" : "transparent"; }}
              className="trow"
            >
              {/* Company */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, position: "relative" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 7,
                  background: b.logoBg, color: b.logoColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 11, fontWeight: 800,
                  fontFamily: "'Red Hat Display', sans-serif",
                  position: "relative",
                }}>
                  {b.initials}
                  {b.yourMatches > 0 && (
                    <span style={{
                      position: "absolute", top: -3, right: -3,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#FF4562",
                      border: `2px solid ${t.bgBase || t.bgCard}`,
                      boxShadow: "0 0 4px rgba(255,69,98,0.6)",
                    }} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.company}</span>
                    {b.yourMatches > 0 && (
                      <span title={`${b.yourMatches} of your accounts found in this dataset`} style={{
                        padding: "1px 6px", borderRadius: 3,
                        background: "rgba(255,69,98,0.14)", color: "#FF4562",
                        fontSize: 7, fontWeight: 800, letterSpacing: "0.06em",
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}>YOU · {b.yourMatches}</span>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.domain}</div>
                </div>
              </div>
              {/* Data types + description */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 3 }}>
                  {b.types.map(tp => {
                    const c = TYPE_COLORS[tp] || TYPE_COLORS.Email;
                    return (
                      <span key={tp} style={{
                        background: c.bg, color: c.fg,
                        padding: "2px 7px", borderRadius: 3,
                        fontSize: 8, fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.04em",
                      }}>{tp}</span>
                    );
                  })}
                </div>
                <div style={{ fontSize: 9, color: t.text40, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.desc}</div>
              </div>
              {/* Records */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  display: "inline-block",
                  background: RECORDS_TIER[b.recordsTier].bg,
                  color: RECORDS_TIER[b.recordsTier].fg,
                  padding: "3px 9px", borderRadius: 4,
                  fontSize: 10, fontWeight: 800,
                  fontFamily: "'Red Hat Display', sans-serif",
                }}>{b.records}</span>
              </div>
              {/* Breach date */}
              <span className="mono" style={{ fontSize: 9, color: t.text40, textAlign: "center" }}>{b.breachDate}</span>
              {/* Published date */}
              <span className="mono" style={{ fontSize: 9, color: t.text40, textAlign: "center" }}>{b.publishedDate}</span>
              {/* Status */}
              <div style={{ textAlign: "center" }}>
                {b.verified ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: "#22C55E", fontWeight: 700 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    Verified
                  </span>
                ) : (
                  <span style={{ fontSize: 9, color: t.text30, fontWeight: 600 }}>Unverified</span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 16px", fontSize: 9, color: t.text40,
          borderTop: `1px solid ${t.borderSection}`,
        }}>
          <span>Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} {activeTab === "catalog" ? "datasets" : "combolists"}</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{
              width: 26, height: 26, borderRadius: 5,
              border: `1px solid ${t.borderLight}`, background: "transparent",
              color: safePage === 1 ? t.text20 : t.text40, fontSize: 11, cursor: safePage === 1 ? "not-allowed" : "pointer",
            }}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => {
              const active = n === safePage;
              return (
                <button key={n} onClick={() => setPage(n)} style={{
                  width: 26, height: 26, borderRadius: 5,
                  border: `1px solid ${active ? "rgba(99,102,241,0.30)" : t.borderLight}`,
                  background: active ? "rgba(99,102,241,0.10)" : "transparent",
                  color: active ? "#6366F1" : t.text40,
                  fontSize: 9, fontWeight: 700, cursor: "pointer",
                }}>{n}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{
              width: 26, height: 26, borderRadius: 5,
              border: `1px solid ${t.borderLight}`, background: "transparent",
              color: safePage === totalPages ? t.text20 : t.text40, fontSize: 11, cursor: safePage === totalPages ? "not-allowed" : "pointer",
            }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
