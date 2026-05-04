import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

/* ────────────────────────────────────────────────────────────────────────────
   COLOR MAPS
   ──────────────────────────────────────────────────────────────────────────── */

const RISK = {
  critical: { fg: "#DC2626", bg: "rgba(220,38,38,0.14)", label: "CRITICAL" },
  high:     { fg: "#EA580C", bg: "rgba(234,88,12,0.14)",  label: "HIGH"     },
  medium:   { fg: "#FB923C", bg: "rgba(251,146,60,0.14)", label: "MEDIUM"   },
  low:      { fg: "#16A34A", bg: "rgba(22,163,74,0.12)",  label: "LOW"      },
  clean:    { fg: "#94A3B8", bg: "rgba(51,65,85,0.18)",   label: "CLEAN"    },
};

const SIG = {
  RANSOM:   { fg: "#DC2626", bg: "rgba(220,38,38,0.12)",  label: "RANSOM"   },
  IAB:      { fg: "#FF4562", bg: "rgba(255,69,98,0.12)",  label: "IAB"      },
  CREDS:    { fg: "#EA580C", bg: "rgba(234,88,12,0.12)",  label: "CREDS"    },
  BREACH:   { fg: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "BREACH"   },
  FORUM:    { fg: "#3B82F6", bg: "rgba(59,130,246,0.10)", label: "FORUM"    },
  EXPOSURE: { fg: "#A855F7", bg: "rgba(168,85,247,0.10)", label: "EXPOSURE" },
};

const TRUST_GRADE_COLOR = { A: "#16A34A", B: "#16A34A", C: "#F59E0B", D: "#EA580C", F: "#DC2626" };

const SELECT_BLUE = "#3B82F6";  // selection / navigation accent (neutral, not brand)
const SELECT_BLUE_BG = "rgba(59,130,246,0.06)";
const SELECT_BLUE_BG_STRONG = "rgba(59,130,246,0.12)";

/* ────────────────────────────────────────────────────────────────────────────
   DATA FIXTURES
   ──────────────────────────────────────────────────────────────────────────── */

const VENDORS = [
  {
    id: 1, name: "Hitachi Ltd", domain: "hitachi.com", initial: "H",
    logo: { bg: "rgba(220,38,38,0.14)", fg: "#DC2626" },
    industry: "Computer Systems Design Services · Japan",
    riskLevel: "critical", findings: 164, cybercriminal: 38, underAttack: 25, confidentialExp: 45,
    trustGrade: "D", trustScore: 62,
    latestSignal: { type: "RANSOM", summary: "Listed on LockBit leak site — 72h deadline" },
    date: "2h ago", spike: { pct: "+340%" }, sparks: null,
    onRansomLeakSite: true, leakSite: "LockBit",
    recentlyAffected: true,
    activeSignals: [
      { type: "RANSOM", title: "Ransomware Leak Site", severity: "critical", summary: "Listed on LockBit 4.0 leak site. Data publication deadline: 72 hours. Proof-of-data published including internal directories.", source: "LockBit Leak Site", time: "2 hours ago" },
      { type: "CREDS",  title: "Credentials Found",    severity: "critical", summary: "47 employee credentials detected across Russian Market and Genesis Market stealer logs in the last 30 days.", source: "Russian Market, Genesis", time: "3 days ago" },
      { type: "IAB",    title: "IAB Listing",          severity: "high",     summary: "RDP access to Hitachi subsidiary being sold on BreachForums for $1,800. Seller has 4.3★ rating.", source: "BreachForums", time: "1 week ago" },
      { type: "FORUM",  title: "Forum Mention",        severity: "medium",   summary: "Company name mentioned in XSS Forum thread discussing potential targets in Japanese manufacturing sector.", source: "XSS Forum", time: "2 weeks ago" },
    ],
    detailNews: [
      { headline: "LockBit claims breach of Hitachi subsidiary, threatens data release within 72 hours", type: "RANSOMWARE", time: "2h ago" },
      { headline: "Hitachi employee data appears in massive stealer log dump on Russian Market", type: "DARK WEB", time: "3d ago" },
    ],
  },
  {
    id: 2, name: "SalesForce Inc", domain: "salesforce.com", initial: "SF",
    logo: { bg: "rgba(34,211,238,0.15)", fg: "#22D3EE" },
    industry: "SaaS · Cloud Software · United States",
    riskLevel: "critical", findings: 89, cybercriminal: 42, underAttack: 31, confidentialExp: 22,
    trustGrade: "D", trustScore: 64,
    latestSignal: { type: "RANSOM", summary: "Listed on ALPHV leak site" },
    date: "1d ago", spike: { pct: "+180%" }, sparks: null,
    onRansomLeakSite: true, leakSite: "ALPHV",
    recentlyAffected: true,
    activeSignals: [
      { type: "RANSOM",   title: "Ransomware Leak Site",  severity: "critical", summary: "ALPHV/BlackCat lists SalesForce on leak site with sample data and ransom demand of 4.2 BTC.", source: "ALPHV Leak Site", time: "1 day ago" },
      { type: "CREDS",    title: "Credentials Found",     severity: "high",     summary: "32 employee credentials in stealer logs collected from infected developer endpoints.", source: "Genesis Market", time: "5 days ago" },
      { type: "EXPOSURE", title: "Confidential Exposure", severity: "medium",   summary: "Internal Confluence pages indexed by paste site crawler — 14 pages cached, 3 contain sensitive customer references.", source: "Pastebin / Ghostbin", time: "2 weeks ago" },
    ],
    detailNews: [
      { headline: "ALPHV/BlackCat lists SalesForce on leak site with sample data", type: "RANSOMWARE", time: "1d ago" },
    ],
  },
  {
    id: 3, name: "Accenture PLC", domain: "accenture.com", initial: "AC",
    logo: { bg: "rgba(168,85,247,0.15)", fg: "#A855F7" },
    industry: "Professional Services · Ireland",
    riskLevel: "critical", findings: 112, cybercriminal: 44, underAttack: 36, confidentialExp: 31,
    trustGrade: "D", trustScore: 68,
    latestSignal: { type: "IAB", summary: "VPN access for sale on BreachForums — $2,500" },
    date: "3d ago", spike: null, sparks: [6, 8, 5, 10, 14],
    onRansomLeakSite: false,
    recentlyAffected: true,
    activeSignals: [
      { type: "IAB",   title: "IAB Listing",       severity: "critical", summary: "Verified VPN access to Accenture's North American network on BreachForums. Listed at $2,500. Seller reputation: 4.7★ across 23 transactions.", source: "BreachForums", time: "3 days ago" },
      { type: "CREDS", title: "Credentials Found", severity: "high",     summary: "28 contractor credentials surfaced in combined stealer log feeds.", source: "Russian Market", time: "1 week ago" },
      { type: "FORUM", title: "Forum Mention",     severity: "medium",   summary: "Three threads on Exploit.in discussing Accenture infrastructure mapping for prospective intrusion.", source: "Exploit.in", time: "2 weeks ago" },
    ],
    detailNews: [
      { headline: "Access broker offers VPN credentials to Accenture network", type: "DARK WEB", time: "3d ago" },
    ],
  },
  {
    id: 4, name: "Amazon Web Services", domain: "aws.amazon.com", initial: "AW",
    logo: { bg: "rgba(245,158,11,0.15)", fg: "#F59E0B" },
    industry: "Cloud Infrastructure · United States",
    riskLevel: "high", findings: 67, cybercriminal: 62, underAttack: 58, confidentialExp: 12,
    trustGrade: "C", trustScore: 78,
    latestSignal: { type: "CREDS", summary: "AWS credentials detected — 3 companies affected" },
    date: "Yesterday", spike: null, sparks: [8, 7, 9, 8, 10],
    onRansomLeakSite: false,
    recentlyAffected: true,
    activeSignals: [
      { type: "CREDS",  title: "Credentials Found",  severity: "high",   summary: "Customer-facing AWS access keys leaked in Github gists (3 distinct customers affected). Keys revoked at root after detection.", source: "Github + Gist crawl", time: "1 day ago" },
      { type: "BREACH", title: "Data Breach Mention", severity: "medium", summary: "AWS root cause identified in 2 minor customer breach announcements over last 30 days.", source: "BreachForums", time: "1 week ago" },
    ],
    detailNews: [
      { headline: "Three AWS customer access keys exposed in public Github gists", type: "DARK WEB", time: "1d ago" },
    ],
  },
  {
    id: 5, name: "Microsoft Corp", domain: "microsoft.com", initial: "MS",
    logo: { bg: "rgba(59,130,246,0.15)", fg: "#3B82F6" },
    industry: "Software · United States",
    riskLevel: "high", findings: 43, cybercriminal: 65, underAttack: 64, confidentialExp: 8,
    trustGrade: "C", trustScore: 81,
    latestSignal: { type: "CREDS", summary: "Employee credentials in stealer logs" },
    date: "2d ago", spike: null, sparks: [6, 7, 6, 7, 8],
    onRansomLeakSite: false,
    recentlyAffected: true,
    activeSignals: [
      { type: "CREDS", title: "Credentials Found", severity: "high",   summary: "18 corporate credentials detected in combined stealer log harvest, mostly from Asia-Pacific support staff endpoints.", source: "Moon Cloud + Russian Market", time: "2 days ago" },
      { type: "FORUM", title: "Forum Mention",     severity: "medium", summary: "Sustained chatter in 3 underground Russian forums about Microsoft 365 attack tooling.", source: "XSS Forum, Exploit.in", time: "1 week ago" },
    ],
    detailNews: [
      { headline: "Microsoft credentials surface in latest Moon Cloud daily drop", type: "DARK WEB", time: "2d ago" },
    ],
  },
  {
    id: 6, name: "ServiceNow", domain: "servicenow.com", initial: "SN",
    logo: { bg: "rgba(51,65,85,0.30)", fg: "#94A3B8" },
    industry: "SaaS · United States",
    riskLevel: "medium", findings: 28, cybercriminal: 76, underAttack: 78, confidentialExp: 4,
    trustGrade: "C", trustScore: 84,
    latestSignal: { type: "FORUM", summary: "Domain mentioned in XSS forum discussion" },
    date: "5d ago", spike: null, sparks: [5, 4, 6, 5, 5],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "FORUM", title: "Forum Mention", severity: "medium", summary: "Single XSS thread referencing ServiceNow custom-app vulnerabilities. No proof of compromise.", source: "XSS Forum", time: "5 days ago" },
    ],
    detailNews: [],
  },
  {
    id: 7, name: "Cloudflare Inc", domain: "cloudflare.com", initial: "CF",
    logo: { bg: "rgba(245,158,11,0.10)", fg: "#F59E0B" },
    industry: "CDN · Edge Security · United States",
    riskLevel: "medium", findings: 19, cybercriminal: 80, underAttack: 76, confidentialExp: 6,
    trustGrade: "B", trustScore: 86,
    latestSignal: { type: "BREACH", summary: "Confidential docs surfaced on paste site" },
    date: "1w ago", spike: null, sparks: [4, 3, 5, 4, 4],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "BREACH",   title: "Data Breach",          severity: "medium", summary: "Three confidential support transcripts cached on Pastebin — likely leaked from a third-party vendor's workstation.", source: "Pastebin", time: "1 week ago" },
      { type: "EXPOSURE", title: "Confidential Exposure", severity: "low",    summary: "One internal architecture document indexed by Google before being removed.", source: "Public Bucket / Cache", time: "2 weeks ago" },
    ],
    detailNews: [],
  },
  {
    id: 8, name: "Okta Inc", domain: "okta.com", initial: "OK",
    logo: { bg: "rgba(34,211,238,0.10)", fg: "#22D3EE" },
    industry: "Identity Provider · United States",
    riskLevel: "high", findings: 54, cybercriminal: 58, underAttack: 61, confidentialExp: 19,
    trustGrade: "C", trustScore: 76,
    latestSignal: { type: "CREDS", summary: "Operator console credentials in stealer dump" },
    date: "2d ago", spike: null, sparks: [7, 9, 8, 11, 12],
    onRansomLeakSite: false,
    recentlyAffected: true,
    activeSignals: [
      { type: "CREDS", title: "Credentials Found", severity: "high", summary: "Two Okta operator console credentials surfaced in a regional stealer log batch.", source: "Russian Market", time: "2 days ago" },
      { type: "IAB",   title: "IAB Listing",       severity: "medium", summary: "Generic 'IDP access' listing with vague Okta references — vendor verification pending.", source: "BreachForums", time: "5 days ago" },
    ],
    detailNews: [],
  },
  {
    id: 9, name: "Twilio Inc", domain: "twilio.com", initial: "TW",
    logo: { bg: "rgba(220,38,38,0.10)", fg: "#DC2626" },
    industry: "Communications API · United States",
    riskLevel: "medium", findings: 22, cybercriminal: 71, underAttack: 74, confidentialExp: 5,
    trustGrade: "C", trustScore: 80,
    latestSignal: { type: "EXPOSURE", summary: "Internal API key cached on a paste site" },
    date: "1w ago", spike: null, sparks: [4, 5, 5, 6, 5],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "EXPOSURE", title: "Confidential Exposure", severity: "medium", summary: "One Twilio test API key cached on Pastebin (revoked within 4h).", source: "Pastebin", time: "1 week ago" },
    ],
    detailNews: [],
  },
  {
    id: 10, name: "Snowflake Inc", domain: "snowflake.com", initial: "SF",
    logo: { bg: "rgba(34,211,238,0.10)", fg: "#22D3EE" },
    industry: "Data Cloud · United States",
    riskLevel: "high", findings: 78, cybercriminal: 56, underAttack: 60, confidentialExp: 28,
    trustGrade: "C", trustScore: 73,
    latestSignal: { type: "BREACH", summary: "165 customer environments confirmed exposed via leaked tokens" },
    date: "23m ago", spike: { pct: "+260%" }, sparks: null,
    onRansomLeakSite: false,
    recentlyAffected: true,
    activeSignals: [
      { type: "BREACH", title: "Data Breach",     severity: "critical", summary: "165 Snowflake customer environments confirmed exposed via authentication bypass using leaked tokens. Active investigation.", source: "BreachForums", time: "23 minutes ago" },
      { type: "CREDS",  title: "Credentials Found", severity: "high",     summary: "412 valid Snowflake authentication tokens identified across stealer datasets, 3× the baseline.", source: "Moon Cloud", time: "3 hours ago" },
    ],
    detailNews: [
      { headline: "Snowflake breach impact widens — 165 customers confirmed exposed", type: "DARK WEB", time: "23m ago" },
    ],
  },
  {
    id: 11, name: "Atlassian Pty Ltd", domain: "atlassian.com", initial: "AT",
    logo: { bg: "rgba(59,130,246,0.10)", fg: "#3B82F6" },
    industry: "DevOps · Australia",
    riskLevel: "medium", findings: 16, cybercriminal: 79, underAttack: 75, confidentialExp: 3,
    trustGrade: "B", trustScore: 85,
    latestSignal: { type: "FORUM", summary: "Recent Confluence CVE chatter in underground forums" },
    date: "1w ago", spike: null, sparks: [3, 4, 4, 5, 4],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "FORUM", title: "Forum Mention", severity: "medium", summary: "Three underground forum threads discussing exploitation paths for recent Confluence CVEs.", source: "Exploit.in", time: "1 week ago" },
    ],
    detailNews: [],
  },
  {
    id: 12, name: "GitLab Inc", domain: "gitlab.com", initial: "GL",
    logo: { bg: "rgba(251,146,60,0.12)", fg: "#FB923C" },
    industry: "DevOps · United States",
    riskLevel: "low", findings: 8, cybercriminal: 88, underAttack: 89, confidentialExp: 1,
    trustGrade: "B", trustScore: 92,
    latestSignal: { type: "EXPOSURE", summary: "One private repo URL referenced in a Telegram channel" },
    date: "2w ago", spike: null, sparks: [2, 3, 2, 2, 3],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "EXPOSURE", title: "Confidential Exposure", severity: "low", summary: "Single private repo URL referenced in a Telegram channel — repository access intact, no leaked content confirmed.", source: "Telegram", time: "2 weeks ago" },
    ],
    detailNews: [],
  },
  {
    id: 13, name: "Datadog Inc", domain: "datadoghq.com", initial: "DD",
    logo: { bg: "rgba(168,85,247,0.10)", fg: "#A855F7" },
    industry: "Observability · United States",
    riskLevel: "low", findings: 4, cybercriminal: 91, underAttack: 92, confidentialExp: 0,
    trustGrade: "A", trustScore: 94,
    latestSignal: { type: "FORUM", summary: "Generic mention in monitoring-tools recon thread" },
    date: "3w ago", spike: null, sparks: [1, 2, 1, 2, 2],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "FORUM", title: "Forum Mention", severity: "low", summary: "Datadog mentioned in a generic 'monitoring tools' thread for reconnaissance enumeration. No specific exploitation chatter.", source: "XSS Forum", time: "3 weeks ago" },
    ],
    detailNews: [],
  },
  {
    id: 14, name: "Stripe Inc", domain: "stripe.com", initial: "ST",
    logo: { bg: "rgba(168,85,247,0.10)", fg: "#A855F7" },
    industry: "Payments · United States",
    riskLevel: "low", findings: 6, cybercriminal: 90, underAttack: 89, confidentialExp: 1,
    trustGrade: "A", trustScore: 93,
    latestSignal: { type: "FORUM", summary: "Restricted-section discussion of payment fraud tooling" },
    date: "1m ago", spike: null, sparks: [1, 2, 2, 2, 3],
    onRansomLeakSite: false,
    recentlyAffected: false,
    activeSignals: [
      { type: "FORUM", title: "Forum Mention", severity: "low", summary: "Discussion in a restricted-access carding forum about payment processor fraud detection — no specific Stripe exploitation.", source: "BidenCash", time: "1 month ago" },
    ],
    detailNews: [],
  },
];

const SIGNAL_TYPE_BREAKDOWN = [
  { name: "Credentials found",     count: 312, color: "#DC2626", barPct: 75 },
  { name: "Ransomware leak site",  count: 4,   color: "#FF4562", barPct: 18 },
  { name: "Forum mentions",        count: 89,  color: "#F59E0B", barPct: 45 },
  { name: "Data breach",           count: 34,  color: "#EA580C", barPct: 30 },
  { name: "IAB listings",          count: 8,   color: "#3B82F6", barPct: 12 },
  { name: "Confidential exposure", count: 21,  color: "#A855F7", barPct: 22 },
];

const VENDOR_NEWS = [
  { vendor: "Hitachi",    headline: "LockBit claims breach of Hitachi subsidiary, threatens data release", type: "RANSOMWARE", typeColor: "#DC2626", time: "2h ago" },
  { vendor: "SalesForce", headline: "ALPHV/BlackCat lists SalesForce on leak site with sample data",       type: "RANSOMWARE", typeColor: "#DC2626", time: "1d ago" },
  { vendor: "Accenture",  headline: "Access broker offers VPN credentials to Accenture network",          type: "DARK WEB",   typeColor: "#F59E0B", time: "3d ago" },
  { vendor: "AWS",        headline: "Three AWS customer access keys exposed in public Github gists",      type: "DARK WEB",   typeColor: "#F59E0B", time: "4d ago" },
  { vendor: "Snowflake",  headline: "Snowflake breach impact widens — 165 customers confirmed exposed",   type: "DARK WEB",   typeColor: "#F59E0B", time: "23m ago" },
];

const TRENDING_CHIPS = ["Snowflake Inc", "Change Healthcare", "MOVEit (Progress)"];
const RECENT_CHIPS = ["Hitachi Ltd", "SalesForce Inc"];

// 30-day activity (daily counts) for the area chart widget
const ACTIVITY_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 8 + Math.sin(i * 0.4) * 4 + Math.cos(i * 0.7) * 3;
  const spike = i === 22 ? 18 : i === 27 ? 22 : i === 28 ? 12 : 0;
  return Math.max(2, Math.round(base + spike + Math.random() * 3));
});

/* ────────────────────────────────────────────────────────────────────────────
   ICONS
   ──────────────────────────────────────────────────────────────────────────── */
const Icon = {
  link:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  siren:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 13v8"/><path d="M5 21h14"/><path d="M5 13h14a2 2 0 0 0 0-4h-1.7a6 6 0 0 0-10.6 0H5a2 2 0 0 0 0 4z"/></svg>,
  search:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  globe:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/></svg>,
  bell:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  newspaper: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>,
  chart:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  arrowUp:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 14l6-6 6 6"/></svg>,
  arrowRight:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevronDown:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  chevronRight:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  // Signal-type icons
  ransom:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 13v8"/><path d="M5 21h14"/><path d="M5 13h14a2 2 0 0 0 0-4h-1.7a6 6 0 0 0-10.6 0H5a2 2 0 0 0 0 4z"/></svg>,
  iab:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  creds:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  forum:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  breach:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  exposure:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
};

const SIG_ICON = { RANSOM: Icon.ransom, IAB: Icon.iab, CREDS: Icon.creds, FORUM: Icon.forum, BREACH: Icon.breach, EXPOSURE: Icon.exposure };

/* ────────────────────────────────────────────────────────────────────────────
   HELPER COMPONENTS
   ──────────────────────────────────────────────────────────────────────────── */

function CompanyLogo({ vendor, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: vendor.logo.bg, color: vendor.logo.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size <= 28 ? 10 : 14, fontWeight: 700, fontFamily: "'Red Hat Display', sans-serif",
      letterSpacing: "-0.02em",
    }}>{vendor.initial}</div>
  );
}

function RiskBadge({ level, size = "md" }) {
  const r = RISK[level] || RISK.clean;
  const fontSize = size === "sm" ? 7 : 8;
  const padding = size === "sm" ? "2px 6px" : "3px 8px";
  return (
    <span style={{
      fontSize, fontWeight: 800, padding, borderRadius: 4,
      background: r.bg, color: r.fg, letterSpacing: "0.06em",
      fontFamily: "'JetBrains Mono', monospace", display: "inline-block",
    }}>{r.label}</span>
  );
}

function SignalBadge({ type }) {
  const s = SIG[type];
  if (!s) return null;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      background: s.bg, color: s.fg, letterSpacing: "0.06em",
      fontFamily: "'JetBrains Mono', monospace",
    }}>{s.label}</span>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16, justifyContent: "center" }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 3, height: `${Math.max(3, (v / max) * 16)}px`, borderRadius: 1,
          background: i === data.length - 1 ? color : `${color}55`,
        }} />
      ))}
    </div>
  );
}

function Spike({ pct, color = "#FF4562" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 8, fontWeight: 800, color,
      background: `${color}14`, padding: "2px 7px", borderRadius: 4,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <Icon.arrowUp width="9" height="9" />
      {pct}
    </span>
  );
}

function VendorRow({ vendor, selected, onClick, t }) {
  const r = RISK[vendor.riskLevel];
  const sparkColor = vendor.riskLevel === "critical" ? "#DC2626" : vendor.riskLevel === "high" ? "#EA580C" : t.text40;
  return (
    <div onClick={onClick} style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 92px 80px minmax(0, 1.6fr) 90px 72px",
      alignItems: "center", gap: 12,
      padding: "11px 16px",
      cursor: "pointer", transition: "background 0.15s",
      background: selected ? SELECT_BLUE_BG_STRONG : "transparent",
      borderBottom: `1px solid ${t.borderRow}`,
      borderLeft: `3px solid ${vendor.riskLevel === "critical" ? "#DC2626" : vendor.riskLevel === "high" ? "#EA580C" : "transparent"}`,
      position: "relative",
    }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = SELECT_BLUE_BG; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {selected && (
        <div style={{
          position: "absolute", right: 0, top: 8, bottom: 8, width: 3,
          background: SELECT_BLUE, borderRadius: "3px 0 0 3px",
        }} />
      )}
      {/* Company */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <CompanyLogo vendor={vendor} size={28} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.name}</div>
          <div className="mono" style={{ fontSize: 9, color: t.text35, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.domain}</div>
        </div>
      </div>
      {/* Risk */}
      <div style={{ textAlign: "center" }}><RiskBadge level={vendor.riskLevel} /></div>
      {/* Findings */}
      <div className="hfont" style={{
        textAlign: "center", fontSize: 16, fontWeight: 700,
        color: vendor.riskLevel === "critical" ? "#DC2626" : vendor.riskLevel === "high" ? "#EA580C" : t.text50,
      }}>{vendor.findings}</div>
      {/* Latest signal */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <SignalBadge type={vendor.latestSignal.type} />
        <span style={{ fontSize: 11, color: t.text50, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vendor.latestSignal.summary}</span>
      </div>
      {/* Date */}
      <div className="mono" style={{ fontSize: 10, color: t.text35, textAlign: "right" }}>{vendor.date}</div>
      {/* Trend */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {vendor.spike ? <Spike pct={vendor.spike.pct} color={r.fg} /> : <Sparkline data={vendor.sparks} color={sparkColor} />}
      </div>
    </div>
  );
}

/* ── Detail Panel ── */
function DetailPanel({ vendor, onClose, t }) {
  const [showNews, setShowNews] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const trustColor = TRUST_GRADE_COLOR[vendor.trustGrade] || "#94A3B8";
  const kpis = [
    { label: "DW FINDINGS",         value: vendor.findings,        color: vendor.findings > 100 ? "#DC2626" : vendor.findings > 40 ? "#EA580C" : t.text },
    { label: "CYBERCRIMINAL SCORE", value: vendor.cybercriminal,   color: vendor.cybercriminal < 50 ? "#DC2626" : vendor.cybercriminal < 70 ? "#EA580C" : "#16A34A" },
    { label: "UNDER ATTACK SCORE",  value: vendor.underAttack,     color: vendor.underAttack < 50 ? "#DC2626" : vendor.underAttack < 70 ? "#EA580C" : "#16A34A" },
    { label: "CONFIDENTIAL EXP.",   value: vendor.confidentialExp, color: vendor.confidentialExp > 30 ? "#EA580C" : vendor.confidentialExp > 10 ? "#F59E0B" : t.text50 },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
        background: t.bgPanel, backdropFilter: "blur(20px)",
        borderLeft: `1px solid ${t.borderLight}`,
        zIndex: 51, overflow: "auto", padding: "20px 22px",
        animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${t.borderSection}` }}>
          <CompanyLogo vendor={vendor} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hfont" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>{vendor.name}</div>
            <div className="mono" style={{ fontSize: 10, color: t.text35, marginTop: 2 }}>{vendor.domain}</div>
            <div style={{ fontSize: 10, color: t.text40, marginTop: 1 }}>{vendor.industry}</div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `${trustColor}18`, border: `2px solid ${trustColor}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800, color: trustColor,
              fontFamily: "'Red Hat Display', sans-serif",
            }}>{vendor.trustGrade}</div>
            <div className="mono" style={{ fontSize: 8, color: t.text35, marginTop: 4 }}>{vendor.trustScore} / 100</div>
          </div>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            width: 26, height: 26, borderRadius: 7, border: "none",
            background: t.bgElevated, color: t.text50,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon.close width="14" height="14" />
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 7,
              padding: "10px 8px", textAlign: "center",
            }}>
              <div className="hfont" style={{ fontSize: 17, fontWeight: 800, color: k.color, letterSpacing: "-0.02em" }}>{k.value}</div>
              <div className="mono" style={{ fontSize: 7, color: t.text30, letterSpacing: "0.08em", fontWeight: 700, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Active Signals */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Icon.bell width="13" height="13" style={{ color: t.text50 }} />
          <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>Active Dark Web Signals</span>
          <span className="mono" style={{ fontSize: 9, color: t.text35, marginLeft: "auto" }}>{vendor.activeSignals.length} active</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
          {vendor.activeSignals.map((sig, i) => {
            const sevColor = sig.severity === "critical" ? "#DC2626" : sig.severity === "high" ? "#EA580C" : sig.severity === "medium" ? "#F59E0B" : "#16A34A";
            const SigIcon = SIG_ICON[sig.type] || Icon.bell;
            return (
              <div key={i} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: 7, padding: "10px 12px",
                display: "flex", alignItems: "flex-start", gap: 9,
              }}>
                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: sevColor, flexShrink: 0 }} />
                <div style={{ flexShrink: 0, color: sevColor, marginTop: 1 }}><SigIcon width="14" height="14" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{sig.title}</span>
                    <span style={{ fontSize: 7.5, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: `${sevColor}18`, color: sevColor, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{sig.severity.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: t.text50, lineHeight: 1.5 }}>{sig.summary}</div>
                  <div className="mono" style={{ fontSize: 8.5, color: t.text30, marginTop: 5, display: "flex", gap: 10 }}>
                    <span>{sig.source}</span>
                    <span>{sig.time}</span>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 9, color: SELECT_BLUE, fontWeight: 600, flexShrink: 0, cursor: "pointer", alignSelf: "center" }}>View →</span>
              </div>
            );
          })}
        </div>

        {/* Dark Web News (collapsible) */}
        {vendor.detailNews.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div onClick={() => setShowNews(!showNews)} style={{
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              padding: "8px 0", borderTop: `1px solid ${t.borderSection}`,
            }}>
              <Icon.newspaper width="13" height="13" style={{ color: t.text50 }} />
              <span className="hfont" style={{ fontSize: 12, fontWeight: 700 }}>Dark Web News</span>
              <span className="mono" style={{ fontSize: 9, color: t.text35 }}>{vendor.detailNews.length} articles</span>
              <span style={{ marginLeft: "auto", color: t.text35 }}>
                {showNews ? <Icon.chevronDown width="12" height="12" /> : <Icon.chevronRight width="12" height="12" />}
              </span>
            </div>
            {showNews && vendor.detailNews.map((n, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: i < vendor.detailNews.length - 1 ? `1px solid ${t.borderRow}` : "none" }}>
                <div style={{ fontSize: 11, color: t.text70, lineHeight: 1.4 }}>{n.headline}</div>
                <div className="mono" style={{ fontSize: 8, color: t.text35, marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ padding: "1px 6px", borderRadius: 3, background: n.type === "RANSOMWARE" ? "rgba(220,38,38,0.12)" : "rgba(245,158,11,0.12)", color: n.type === "RANSOMWARE" ? "#DC2626" : "#F59E0B", fontWeight: 700 }}>{n.type}</span>
                  <span>{n.time}</span>
                  <span style={{ color: SELECT_BLUE, marginLeft: "auto", cursor: "pointer" }}>Read →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Score Trend (collapsible) */}
        <div>
          <div onClick={() => setShowTrend(!showTrend)} style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            padding: "8px 0", borderTop: `1px solid ${t.borderSection}`,
          }}>
            <Icon.chart width="13" height="13" style={{ color: t.text50 }} />
            <span className="hfont" style={{ fontSize: 12, fontWeight: 700 }}>Score Trend (6 months)</span>
            <span style={{ marginLeft: "auto", color: t.text35 }}>
              {showTrend ? <Icon.chevronDown width="12" height="12" /> : <Icon.chevronRight width="12" height="12" />}
            </span>
          </div>
          {showTrend && (
            <div style={{ fontSize: 10, color: t.text40, padding: "6px 0", lineHeight: 1.5 }}>
              Cybercriminal Ecosystem & Organization Under Attack trend lines for the last 6 months. Both scores trended <strong style={{ color: "#DC2626" }}>downward by 12 points</strong> after the recent ransomware activity.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sidebar Widgets ── */

function SidebarWidget({ label, title, valueRight, children, t }) {
  return (
    <div className="glass" style={{ padding: "14px 16px" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 10 }}>
        <span className="hfont" style={{ fontSize: 13, fontWeight: 700 }}>{title}</span>
        {valueRight && <span className="mono" style={{ fontSize: 9, color: t.text35, marginLeft: "auto" }}>{valueRight}</span>}
      </div>
      {children}
    </div>
  );
}

function ActivityChart({ data, t }) {
  // Tiny SVG area chart for the 30-day activity widget
  const max = Math.max(...data);
  const w = 260, h = 70;
  const xStep = w / (data.length - 1);
  const points = data.map((v, i) => `${i * xStep},${h - (v / max) * (h - 8) - 4}`).join(" ");
  const area = `M0,${h} L${points.split(" ").map((p) => p).join(" L")} L${w},${h} Z`;
  return (
    <div style={{ width: "100%" }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4562" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#FF4562" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#actGrad)" />
        <polyline points={points} fill="none" stroke="#FF4562" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div className="mono" style={{ fontSize: 8, color: t.text30, display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span>30 DAYS AGO</span>
        <span>TODAY</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────────── */

export default function ThirdParty() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("at-risk");
  const [riskFilter, setRiskFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Tab counts
  const counts = useMemo(() => {
    const atRisk = VENDORS.filter((v) => v.riskLevel === "critical" || v.riskLevel === "high" || v.riskLevel === "medium").length;
    const critical = VENDORS.filter((v) => v.riskLevel === "critical").length;
    const recent = VENDORS.filter((v) => v.recentlyAffected).length;
    return { all: 188, atRisk, critical, recent };
  }, []);

  // Visible vendors
  const visible = useMemo(() => {
    let list = VENDORS;
    if (tab === "at-risk")    list = list.filter((v) => v.riskLevel === "critical" || v.riskLevel === "high" || v.riskLevel === "medium");
    if (tab === "critical")   list = list.filter((v) => v.riskLevel === "critical");
    if (tab === "recent")     list = list.filter((v) => v.recentlyAffected);
    if (riskFilter !== "all") list = list.filter((v) => v.riskLevel === riskFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) => v.name.toLowerCase().includes(q) || v.domain.toLowerCase().includes(q));
    }
    return list;
  }, [tab, riskFilter, search]);

  const ransomVendors = VENDORS.filter((v) => v.onRansomLeakSite);
  const mostAtRisk = [...VENDORS].sort((a, b) => b.findings - a.findings).slice(0, 5);
  const selectedVendor = selectedVendorId ? VENDORS.find((v) => v.id === selectedVendorId) : null;

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 16,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: SELECT_BLUE_BG_STRONG, border: `1px solid ${SELECT_BLUE}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: SELECT_BLUE, flexShrink: 0,
        }}>
          <Icon.link width="20" height="20" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div className="mono" style={{ fontSize: 9, color: t.text25, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 700 }}>Third-Party Dark Web Threats</div>
            <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(255,69,98,0.14)", color: "#FF4562", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
              {counts.atRisk} vendors at risk
            </span>
          </div>
          <div style={{ fontSize: 11, color: t.text50 }}>Dark web exposure across your monitored supply chain</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { l: "Monitored Vendors", v: counts.all, c: t.text },
            { l: "Vendors at Risk",   v: counts.atRisk, c: "#FF4562" },
            { l: "Critical Signals",  v: counts.critical * 2 + 1, c: "#DC2626" },
            { l: "New This Week",     v: counts.recent + 9, c: "#F59E0B" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 70 }}>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.10em", fontWeight: 700, marginBottom: 1 }}>{s.l.toUpperCase()}</div>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 700, color: s.c, letterSpacing: "-0.01em" }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ RANSOMWARE ALERT STRIP (conditional) ═══ */}
      {ransomVendors.length > 0 && (
        <div style={{
          padding: "11px 16px", borderRadius: 9,
          background: "rgba(255,69,98,0.06)", border: "1px solid rgba(255,69,98,0.20)",
          display: "flex", alignItems: "center", gap: 10,
          animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,69,98,0.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF4562", flexShrink: 0 }}>
            <Icon.siren width="16" height="16" />
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: t.text60, lineHeight: 1.55 }}>
            {ransomVendors.map((v, i) => (
              <span key={v.id}>
                <strong style={{ color: "#FF4562" }}>{v.name}</strong> appeared on {v.leakSite}'s ransomware leak site {i === 0 ? "2 hours ago. Data publication deadline: 72 hours." : "yesterday."}
                {i < ransomVendors.length - 1 ? " " : ""}
              </span>
            ))}
          </div>
          <span className="mono" style={{ fontSize: 9, color: t.text35, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>Updated 2h ago</span>
          <span className="mono" style={{ fontSize: 10, color: SELECT_BLUE, fontWeight: 600, flexShrink: 0, cursor: "pointer" }}>View Details →</span>
        </div>
      )}

      {/* ═══ COMPANY SEARCH HERO (50M+ DB) ═══ */}
      <div style={{
        padding: "20px 22px", borderRadius: 14, position: "relative", overflow: "hidden",
        background: t.bgWhiteSearch,
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #FF4562, #A855F7, transparent)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Icon.search width="18" height="18" style={{ color: "#1A1A2E" }} />
              <span className="hfont" style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em" }}>Search Any Company</span>
              <span style={{ fontSize: 9, padding: "3px 9px", borderRadius: 5, background: "rgba(168,85,247,0.12)", color: "#A855F7", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>50M+ companies</span>
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(26,26,46,0.65)", maxWidth: 600, lineHeight: 1.5 }}>
              Look up any organization worldwide and get an instant dark web security report — credential exposure, ransomware associations, IAB listings, forum mentions, and overall risk assessment.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {[
              { v: "50M+", l: "COMPANIES" },
              { v: "195",  l: "COUNTRIES" },
              { v: "24/7", l: "MONITORING" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "6px 12px", background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.08)", borderRadius: 7 }}>
                <div className="hfont" style={{ fontSize: 14, fontWeight: 800, color: "#FF4562" }}>{s.v}</div>
                <div className="mono" style={{ fontSize: 6.5, color: "rgba(26,26,46,0.50)", letterSpacing: "0.10em", fontWeight: 700, marginTop: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            placeholder="Search by company name, domain, or industry... (e.g., Hitachi, salesforce.com, healthcare providers)"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 9,
              background: "#fff", border: "1px solid rgba(26,26,46,0.12)",
              fontSize: 12, color: "#1A1A2E", fontFamily: "'Inter', sans-serif", outline: "none",
            }}
          />
          <button style={{
            padding: "12px 22px", borderRadius: 9, border: "none", cursor: "pointer",
            background: "#FF4562", color: "#fff",
            fontSize: 12, fontWeight: 700, fontFamily: "'Red Hat Display', sans-serif",
            boxShadow: "0 4px 16px rgba(255,69,98,0.3)", whiteSpace: "nowrap",
          }}>Generate Report</button>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 7, color: "rgba(26,26,46,0.50)", fontWeight: 700, letterSpacing: "0.10em" }}>TRENDING:</span>
          {TRENDING_CHIPS.map((c, i) => (
            <span key={i} onClick={() => setCompanySearch(c)} style={{
              fontSize: 9, padding: "3px 9px", borderRadius: 5, cursor: "pointer",
              background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.10)",
              color: "rgba(26,26,46,0.65)",
            }}>{c}</span>
          ))}
          <span className="mono" style={{ fontSize: 7, color: "rgba(26,26,46,0.50)", fontWeight: 700, letterSpacing: "0.10em", marginLeft: 8 }}>RECENT:</span>
          {RECENT_CHIPS.map((c, i) => (
            <span key={i} onClick={() => setCompanySearch(c)} style={{
              fontSize: 9, padding: "3px 9px", borderRadius: 5, cursor: "pointer",
              background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.20)",
              color: "#A855F7",
            }}>{c}</span>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT (table + sidebar) ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 14,
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>

        {/* ─── MAIN: Tabs + Filters + Table ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[
              { key: "all",      label: "All Vendors",        n: counts.all },
              { key: "at-risk",  label: "At Risk",            n: counts.atRisk },
              { key: "critical", label: "Critical",           n: counts.critical },
              { key: "recent",   label: "Recently Affected",  n: counts.recent },
            ].map((tb) => {
              const active = tab === tb.key;
              return (
                <span key={tb.key} onClick={() => setTab(tb.key)} style={{
                  fontSize: 10, fontWeight: 700, padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  border: `1px solid ${active ? `${SELECT_BLUE}40` : t.borderLight}`,
                  background: active ? SELECT_BLUE_BG_STRONG : "transparent",
                  color: active ? SELECT_BLUE : t.text50,
                  transition: "all 0.15s",
                  letterSpacing: "0.04em",
                }}>
                  {tb.label}
                  <span style={{
                    fontSize: 8, padding: "1px 6px", borderRadius: 3, fontWeight: 700,
                    background: active ? `${SELECT_BLUE}20` : t.bgElevated,
                    color: active ? SELECT_BLUE : t.text40,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{tb.n}</span>
                </span>
              );
            })}
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { key: "all",      label: "All Risk", color: t.text },
              { key: "critical", label: "Critical", color: "#DC2626" },
              { key: "high",     label: "High",     color: "#EA580C" },
              { key: "medium",   label: "Medium",   color: "#FB923C" },
              { key: "low",      label: "Low",      color: "#16A34A" },
            ].map((f) => {
              const active = riskFilter === f.key;
              return (
                <span key={f.key} onClick={() => setRiskFilter(f.key)} style={{
                  fontSize: 9, fontWeight: 700, padding: "5px 11px", borderRadius: 5, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                  border: `1px solid ${active ? `${SELECT_BLUE}40` : t.borderLight}`,
                  background: active ? SELECT_BLUE_BG_STRONG : "transparent",
                  color: active ? SELECT_BLUE : t.text50,
                  letterSpacing: "0.04em",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }} />
                  {f.label}
                </span>
              );
            })}
            <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
              <Icon.search width="12" height="12" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.text35 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor name or domain..."
                style={{
                  width: "100%", padding: "6px 12px 6px 28px", fontSize: 10,
                  background: t.bgInput, color: t.text,
                  border: `1px solid ${t.borderLight}`, borderRadius: 6,
                  fontFamily: "'Inter', sans-serif", outline: "none",
                }}
              />
            </div>
          </div>

          {/* Watchlist Table */}
          <div className="glass" style={{ overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 92px 80px minmax(0, 1.6fr) 90px 72px",
              gap: 12, padding: "10px 16px",
              fontSize: 7.5, color: t.text25, letterSpacing: "0.10em", fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
              borderBottom: `1px solid ${t.borderSection}`, background: t.bgInput,
            }}>
              <span>Company</span>
              <span style={{ textAlign: "center" }}>DW Risk</span>
              <span style={{ textAlign: "center" }}>Findings</span>
              <span>Latest Signal</span>
              <span style={{ textAlign: "right" }}>Date</span>
              <span style={{ textAlign: "center" }}>Trend</span>
            </div>

            {visible.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", fontSize: 11, color: t.text35 }}>No vendors match these filters.</div>
            ) : (
              visible.map((v) => (
                <VendorRow key={v.id} vendor={v} selected={selectedVendorId === v.id} onClick={() => setSelectedVendorId(v.id)} t={t} />
              ))
            )}

            {/* Pagination */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 16px", borderTop: `1px solid ${t.borderSection}`,
              fontSize: 9, color: t.text35,
            }}>
              <span className="mono">Showing 1–{visible.length} of {visible.length} vendors</span>
              <div style={{ display: "flex", gap: 4 }}>
                {["‹", "1", "2", "›"].map((p, i) => (
                  <span key={i} style={{
                    width: 22, height: 22, borderRadius: 5, fontSize: 9, fontWeight: 700,
                    border: `1px solid ${i === 1 ? `${SELECT_BLUE}40` : t.borderLight}`,
                    background: i === 1 ? SELECT_BLUE_BG_STRONG : "transparent",
                    color: i === 1 ? SELECT_BLUE : t.text40,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── SIDEBAR ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Signal Type Breakdown */}
          <SidebarWidget label="Signal Type Breakdown" title="Finding distribution" t={t}>
            {SIGNAL_TYPE_BREAKDOWN.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", fontSize: 10, borderBottom: i < SIGNAL_TYPE_BREAKDOWN.length - 1 ? `1px solid ${t.borderRow}` : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: 1.5, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: t.text60 }}>{s.name}</span>
                <div style={{ width: 60, height: 4, borderRadius: 2, background: t.bgElevated, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.barPct}%`, background: s.color, opacity: 0.85 }} />
                </div>
                <span className="mono" style={{ width: 28, textAlign: "right", fontSize: 10, fontWeight: 700, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </SidebarWidget>

          {/* Most At-Risk Vendors */}
          <SidebarWidget label="Most At-Risk Vendors" title="Top 5 by exposure" t={t}>
            {mostAtRisk.map((v, i) => (
              <div key={v.id} onClick={() => setSelectedVendorId(v.id)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 10,
                borderBottom: i < mostAtRisk.length - 1 ? `1px solid ${t.borderRow}` : "none",
                cursor: "pointer",
              }}>
                <span className="mono" style={{ width: 12, fontSize: 9, color: t.text25, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 600, color: t.text70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                <RiskBadge level={v.riskLevel} size="sm" />
                <span className="hfont" style={{ width: 32, textAlign: "right", fontSize: 12, fontWeight: 800, color: RISK[v.riskLevel].fg }}>{v.findings}</span>
              </div>
            ))}
          </SidebarWidget>

          {/* Recent Third-Party News */}
          <SidebarWidget label="Recent Third-Party News" title="Dark web & ransomware" valueRight={`${VENDOR_NEWS.length} articles`} t={t}>
            {VENDOR_NEWS.slice(0, 3).map((n, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? `1px solid ${t.borderRow}` : "none" }}>
                <span style={{
                  display: "inline-block", fontSize: 7.5, padding: "1px 6px", borderRadius: 3,
                  background: SELECT_BLUE_BG_STRONG, color: SELECT_BLUE, fontWeight: 700, marginBottom: 3,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                }}>{n.vendor}</span>
                <div style={{ fontSize: 10.5, color: t.text70, lineHeight: 1.4 }}>{n.headline}</div>
                <div className="mono" style={{ fontSize: 7.5, color: t.text30, marginTop: 3, display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ padding: "1px 5px", borderRadius: 3, background: `${n.typeColor}18`, color: n.typeColor, fontWeight: 700, letterSpacing: "0.04em" }}>{n.type}</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 6 }}>
              <span className="mono" style={{ fontSize: 9, color: SELECT_BLUE, fontWeight: 600, cursor: "pointer" }}>View All News →</span>
            </div>
          </SidebarWidget>

          {/* Activity Timeline */}
          <SidebarWidget label="Supply Chain Activity" title="Findings volume (30d)" t={t}>
            <ActivityChart data={ACTIVITY_30D} t={t} />
          </SidebarWidget>
        </div>
      </div>

      {/* Detail panel */}
      {selectedVendor && <DetailPanel vendor={selectedVendor} onClose={() => setSelectedVendorId(null)} t={t} />}
    </div>
  );
}
