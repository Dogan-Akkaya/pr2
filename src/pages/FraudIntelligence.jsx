import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useTheme } from "../context/ThemeContext";
import { usePagination, Pagination } from "../components/TableUtils";

// ═══════════════════════════════════════
// LISTINGS — full feed across all tabs
// ═══════════════════════════════════════
const LISTINGS = [
  {
    id: 2, tab: "card", severity: "critical",
    asset: "BIN 4532 65** matched — US Fullz bundle", productType: "FULLZ",
    thumb: "Fullz\nPreview",
    market: "STYX", seller: "Bearss", sellerRating: 4.7, sellerCount: 340,
    detail: "SSN+DOB+CC verified",
    status: "Open", price: "$45", date: "2025-10-03",
    leadFlow: ["SOCRadar Crawl", "STYX Marketplace", "seller \"Bearss\" posted fullz bundle", "matched BIN 4532 65** (Chase Visa)"],
    matchType: "bin",
  },
  {
    id: 3, tab: "crypto", severity: "high",
    asset: "d.jo***@greenanimals.com — Coinbase", productType: "EXCHANGE CRED",
    thumb: "Crypto\nCred",
    market: "Russian Market", seller: "raccoon-bot", sellerRating: null,
    detail: "Stealer log (Raccoon v2) · Includes 2FA backup codes",
    status: "Open", price: "$35", date: "2025-10-14",
    leadFlow: ["Stealer Log Scan", "Russian Market", "Raccoon v2 exfiltrated Coinbase session", "matched email *@greenanimals.com"],
    matchType: "email-pattern",
  },
  {
    id: 5, tab: "crypto", severity: "high",
    asset: "Ledger Wallet 2025 Smart Scampage Inferno Multichain", productType: "PHISHING KIT",
    thumb: "Phish\nKit",
    market: "Dark Forum", seller: "cryptodrainer_pro", sellerRating: 4.5,
    detail: "Seed capture · Anti-bot · Multi-chain",
    status: "Open", price: "$200", date: "2025-09-01",
    leadFlow: ["SOCRadar Crawl", "Dark Forums", "kit advertised by cryptodrainer_pro", "Ledger phishing capability"],
    matchType: "kit",
  },
  {
    id: 6, tab: "card", severity: "high",
    asset: "BIN 4532 65** — 12 cards, US issuer", productType: "CVV",
    thumb: "CVV\nData",
    market: "Russian Market", seller: "d0####ey", sellerRating: 4.3,
    detail: "Verified active · Platinum tier",
    status: "Open", price: "$15/ea", date: "2025-10-24",
    leadFlow: ["SOCRadar Crawl", "Russian Market", "seller d0####ey listed CVV pack", "matched BIN 4532 65**"],
    matchType: "bin",
  },
  {
    id: 7, tab: "markets", severity: "medium",
    asset: "Money mule recruitment — US banking sector", productType: "MULE RECRUIT",
    thumb: "Mule\nRecruit",
    market: "Telegram", seller: "@jobsdark", sellerRating: null,
    detail: "\"Looking for US-based mules, finance/banking preferred...\"",
    status: "Open", price: "N/A", date: "2025-10-08",
    leadFlow: ["Telegram Monitor", "@jobsdark channel", "recruitment post detected", "matches financial sector targeting"],
    matchType: "keyword",
  },
  {
    id: 8, tab: "card", severity: "critical",
    asset: "BIN 5123 44** — 89 cards, EU issuer batch", productType: "DUMPS",
    thumb: "Dumps\nBatch",
    market: "STYX", seller: "Bearss", sellerRating: 4.7, sellerCount: 340,
    detail: "EU-issued · Track 1+2 verified · Enrollment date 2024-2025",
    status: "Open", price: "$8/ea", date: "2025-10-20",
    leadFlow: ["SOCRadar Crawl", "STYX Marketplace", "seller \"Bearss\" listed EU dumps batch", "matched BIN 5123 44**"],
    matchType: "bin",
  },
  {
    id: 9, tab: "card", severity: "high",
    asset: "Bank Login — GreenAnimals corporate account", productType: "BANK LOG",
    thumb: "Bank\nLog",
    market: "FreshTools", seller: "emailpwnz", sellerRating: 4.8,
    detail: "Corporate login · ~$240K balance · OTP bypass tested",
    status: "Open", price: "$650", date: "2025-10-18",
    leadFlow: ["SOCRadar Crawl", "FreshTools", "seller \"emailpwnz\" posted bank log", "matched domain greenanimals.com"],
    matchType: "domain",
  },
];

// Tab counts derived from LISTINGS
const TAB_DEFS = [
  { id: "all", label: "All" },
  { id: "card", label: "Card Data" },
  { id: "crypto", label: "Crypto" },
  { id: "markets", label: "Fraud Markets" },
];

// Card Checker Activity (always-visible widget regardless of active tab)
const CHECKER_ALERTS = [
  { bin: "4532 65** **** ****", service: "Try2Check", time: "14 Oct, 14:32", result: "ACTIVE" },
  { bin: "4532 65** **** ****", service: "STYX Checker", time: "14 Oct, 13:18", result: "DEAD" },
  { bin: "5123 44** **** ****", service: "LuxChecker", time: "13 Oct, 22:05", result: "ACTIVE" },
];
const CHECKER_SPARK = [3, 4, 3, 5, 4, 12, 20];

const TOP_SELLERS = [
  { rank: 1, handle: "Bearss", rating: 4.7, market: "STYX", count: 12, color: "#FF4562" },
  { rank: 2, handle: "emailpwnz", rating: 4.8, market: "FreshTools", count: 7, color: "#F59E0B" },
  { rank: 3, handle: "d0####ey", rating: 4.3, market: "Russian Mkt", count: 5, color: "#A855F7" },
  { rank: 4, handle: "invoiceghost", rating: 4.2, market: "STYX", count: 3, color: "#3B82F6" },
  { rank: 5, handle: "cryptodrainer_pro", rating: 4.5, market: "Forum", count: 2, color: "#22D3EE" },
];

const BY_MARKET = [
  { name: "STYX", count: 8, color: "#FF4562", pct: 75 },
  { name: "Russian Market", count: 5, color: "#F59E0B", pct: 50 },
  { name: "FreshTools", count: 4, color: "#3B82F6", pct: 38 },
  { name: "Telegram", count: 3, color: "#22D3EE", pct: 30 },
  { name: "Genesis Market", count: 2, color: "#A855F7", pct: 18 },
  { name: "Dark Forums", count: 1, color: "#64748B", pct: 8 },
];

const BY_DATA_TYPE = [
  { name: "CVVs / Dumps", count: 6, color: "#FF4562" },
  { name: "Fullz", count: 3, color: "#FF4562" },
  { name: "Crypto Credentials", count: 2, color: "#F59E0B" },
  { name: "Crypto Phishing Kits", count: 2, color: "#F59E0B" },
  { name: "Bank Logs", count: 2, color: "#3B82F6" },
  { name: "Money Mule Indicators", count: 1, color: "#FB923C" },
  { name: "SWIFT / IBAN", count: 1, color: "#64748B" },
];

// Folded from FinancialIntelligence — BIN tracking summary
const TRACKED_BINS = [
  { bin: "4532 65", brand: "VISA", country: "US", issuer: "CHASE", listings: 21, color: "#FF4562" },
  { bin: "5123 44", brand: "MASTERCARD", country: "DE", issuer: "DEUTSCHE BANK", listings: 89, color: "#F59E0B" },
  { bin: "4111 11", brand: "VISA", country: "FI", issuer: "NORDEA", listings: 14, color: "#3B82F6" },
];

// Active listings timeline (last 30d) — for mini area chart
const TIMELINE_DATA = Array.from({ length: 30 }, (_, i) => ({
  d: i,
  v: Math.max(0, 3 + Math.round(Math.sin(i / 4) * 2 + (i > 22 ? (i - 22) * 1.4 : 0) + Math.random() * 1.8)),
}));

// ═══════════════════════════════════════
// KYC Data Sale — dark web news feed
// Modelled on the GlobalThreats news widget but single-topic (no ransomware tab).
// ═══════════════════════════════════════
const KYC_NEWS = [
  { id: 1, title: "Alleged Indian Aadhaar KYC Dataset (12M Records) Listed on Hacker Forum", desc: "A threat actor is selling an alleged Aadhaar-linked KYC dataset claiming verified ID scans, selfies and proof-of-address documents for 12M Indian citizens.", date: "30 Apr 2026", tags: ["India", "Aadhaar", "KYC", "ID Scan"], country: "IN" },
  { id: 2, title: "Crypto Exchange KYC Leak — 400K Verified Users Allegedly on Sale", desc: "A user on a Russian-language forum is offering 400K complete KYC packets (passport scan + selfie) allegedly exfiltrated from a tier-2 crypto exchange.", date: "28 Apr 2026", tags: ["Crypto", "Exchange", "Passport", "Selfie"], country: "RU" },
  { id: 3, title: "UK Fintech KYC Vendor Reportedly Breached — Selfie + Document Bundles Listed", desc: "Threat actor \"kycmaster\" is advertising bundles of selfie + government-ID photos sourced from a UK-based KYC verification vendor. Sample includes 1,200 records.", date: "26 Apr 2026", tags: ["United Kingdom", "Fintech", "Vendor Breach"], country: "GB" },
  { id: 4, title: "Brazilian Bank Onboarding KYC Records Surface on Telegram Channel", desc: "A Telegram channel began drip-leaking onboarding KYC packets from a major Brazilian retail bank, including CPF, full address and signed contract PDFs.", date: "24 Apr 2026", tags: ["Brazil", "Banking", "Telegram", "CPF"], country: "BR" },
  { id: 5, title: "Forged KYC Service Re-emerges — Custom Selfies Holding Any Document on Demand", desc: "A long-running underground service offering custom \"selfie holding ID\" creations for any provided document is back online and now accepts crypto-only payments.", date: "21 Apr 2026", tags: ["Forgery", "Service", "Selfie"], country: "" },
  { id: 6, title: "Turkish e-Government KYC Snippets Posted as \"Sample Pack\" by New Seller", desc: "A first-time seller posted a 5,000-record sample of Turkish citizens' KYC data (TC kimlik no, address, MERNIS verification timestamp) as proof-of-access.", date: "19 Apr 2026", tags: ["Turkey", "Government", "TC Kimlik"], country: "TR" },
];

const SEV = { critical: "#DC2626", high: "#EA580C", medium: "#CA8A04", low: "#3B82F6" };
const SEV_BG = { critical: "rgba(220,38,38,0.12)", high: "rgba(234,88,12,0.12)", medium: "rgba(202,138,4,0.12)", low: "rgba(59,130,246,0.12)" };
const SEV_LABEL = { critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW" };

const NAV_BLUE = "#3B82F6";
const NAV_BLUE_BG = "rgba(59,130,246,0.10)";

// ═══════════════════════════════════════
// Inline helpers
// ═══════════════════════════════════════
function StarSVG({ size = 9, color = "#F59E0B" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5">
      <polygon points="12,2 15,9 22,9.5 17,14 18.5,21 12,17 5.5,21 7,14 2,9.5 9,9" />
    </svg>
  );
}

function ArrowRight({ size = 10, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function TrendUp({ size = 10, color = "#FF4562" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ListingCard({ listing, selected, onClick, t }) {
  const sevColor = SEV[listing.severity];
  return (
    <div
      onClick={onClick}
      style={{
        background: t.bgCard,
        border: `1px solid ${selected ? "rgba(59,130,246,0.4)" : t.borderSection}`,
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
        {/* Severity bar */}
        <div style={{ width: 4, borderRadius: 2, background: sevColor, flexShrink: 0 }} />
        {/* Thumbnail */}
        <div style={{
          width: 46, height: 46, borderRadius: 8,
          background: t.bgInput, border: `1px solid ${t.borderLight}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 8, color: t.text35,
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2,
          textAlign: "center", whiteSpace: "pre-wrap", padding: "0 4px",
        }}>
          {listing.thumb}
        </div>
        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{listing.asset}</span>
            <span style={{
              padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700,
              background: SEV_BG[listing.severity], color: sevColor,
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
            }}>{SEV_LABEL[listing.severity]}</span>
            <span style={{
              padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700,
              background: "rgba(168,85,247,0.10)", color: "#A855F7",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
            }}>{listing.productType}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            <span style={{
              background: t.bgInput, padding: "2px 7px", borderRadius: 4,
              fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, color: t.text50,
            }}>{listing.market}</span>
            {listing.seller && (
              <>
                <span style={{ color: t.text25, fontSize: 9 }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, color: t.text40 }}>
                  {listing.sellerRating && <StarSVG />}
                  {listing.sellerRating && <span style={{ fontWeight: 700, color: "#F59E0B" }}>{listing.sellerRating}</span>}
                  <span className="mono" style={{ color: t.text50 }}>{listing.seller}</span>
                  {listing.sellerCount && <span style={{ color: t.text30 }}>({listing.sellerCount} listings)</span>}
                </span>
              </>
            )}
            {listing.detail && (
              <>
                <span style={{ color: t.text25, fontSize: 9 }}>·</span>
                <span style={{ fontSize: 9, color: t.text40 }}>{listing.detail}</span>
              </>
            )}
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 700,
            background: "rgba(22,163,74,0.10)", color: "#16A34A",
            marginTop: 5, fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A" }} />
            {listing.status.toUpperCase()}
          </span>
        </div>
        {/* Price */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end",
          justifyContent: "center", flexShrink: 0,
        }}>
          <span className="hfont" style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{listing.price}</span>
          <span className="mono" style={{ fontSize: 9, color: t.text30, marginTop: 3 }}>{listing.date}</span>
        </div>
      </div>
      {/* Lead flow breadcrumb */}
      {listing.leadFlow && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          marginTop: 9, paddingTop: 9, borderTop: `1px solid ${t.borderRow}`,
          fontSize: 9, flexWrap: "wrap",
        }}>
          {listing.leadFlow.map((step, i) => {
            const isFirst = i === 0;
            const isLast = i === listing.leadFlow.length - 1;
            const isMatch = isLast;
            const isMarket = i === 1;
            return (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  background: isMatch ? "rgba(255,69,98,0.10)" : t.bgInput,
                  color: isMatch ? "#FF4562" : isFirst ? "#22D3EE" : isMarket ? "#A855F7" : t.text45,
                  padding: "3px 8px", borderRadius: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: isMatch ? 700 : 500, fontSize: 9,
                }}>
                  {isFirst && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}>
                      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  )}
                  {step}
                </span>
                {!isLast && <ArrowRight size={9} color={t.text25} />}
              </span>
            );
          })}
          <ArrowRight size={9} color={t.text25} />
          <span style={{
            padding: "3px 9px", borderRadius: 4,
            background: "rgba(255,69,98,0.12)", color: "#FF4562",
            fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: "0.05em",
          }}>ALERT</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
export default function FraudIntelligence() {
  const { t } = useTheme();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(2);
  const [activeKyc, setActiveKyc] = useState(0);
  const selectedKyc = KYC_NEWS[Math.min(activeKyc, KYC_NEWS.length - 1)] || null;

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Tab counts
  const tabCounts = useMemo(() => {
    return TAB_DEFS.reduce((acc, td) => {
      acc[td.id] = td.id === "all" ? LISTINGS.length : LISTINGS.filter(l => l.tab === td.id).length;
      return acc;
    }, {});
  }, []);

  // Filtered feed
  const feed = useMemo(() => {
    return LISTINGS.filter(l => {
      if (activeTab !== "all" && l.tab !== activeTab) return false;
      if (sevFilter !== "all" && l.severity !== sevFilter) return false;
      if (statusFilter !== "all" && l.status.toLowerCase() !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${l.asset} ${l.market} ${l.seller || ""} ${l.productType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, sevFilter, statusFilter, search]);

  // Pagination — defaults to 10/page; selector exposes 10 / 25 / 100.
  const pag = usePagination(feed.length, 10);
  const pagedFeed = pag.paginate(feed);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(245,158,11,0.10)",
          border: "1px solid rgba(245,158,11,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ fontSize: 9, color: t.text30, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>Fraud Intelligence Monitor</span>
            <span style={{
              padding: "2px 8px", borderRadius: 4, fontSize: 8, fontWeight: 700,
              background: "rgba(255,69,98,0.12)", color: "#FF4562",
              fontFamily: "'JetBrains Mono', monospace",
            }}>4 critical signals</span>
          </div>
          <div style={{ fontSize: 11, color: t.text45, marginTop: 3 }}>
            Tracking financial fraud signals across dark web marketplaces and underground forums
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { label: "Active Alerts", value: "23", color: "#FF4562" },
            { label: "Critical", value: "4", color: "#FF4562" },
            { label: "Sources", value: "8", color: t.text },
            { label: "BINs Tracked", value: "3", color: "#F59E0B" },
            { label: "Total Value", value: "$1,240", color: "#F59E0B" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 56 }}>
              <div className="mono" style={{ fontSize: 7, color: t.text25, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
        <button style={{
          width: 34, height: 34, borderRadius: 8,
          background: t.bgInput, border: `1px solid ${t.borderLight}`,
          color: t.text50, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        </button>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{
        display: "flex", gap: 2,
        borderBottom: `1px solid ${t.borderSection}`,
        animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {TAB_DEFS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px", border: "none", background: "transparent",
                color: isActive ? "#F59E0B" : t.text40,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                borderBottom: `2px solid ${isActive ? "#F59E0B" : "transparent"}`,
                marginBottom: -1, display: "flex", alignItems: "center", gap: 7,
                fontFamily: "'Inter', sans-serif", transition: "all 0.15s ease",
              }}
            >
              {tab.label}
              <span style={{
                padding: "1px 7px", borderRadius: 4,
                background: isActive ? "rgba(245,158,11,0.15)" : t.bgInput,
                color: isActive ? "#F59E0B" : t.text35,
                fontSize: 8, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{tabCounts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ CONTENT: FEED + SIDEBAR ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 320px", gap: 14,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>

        {/* ═══ LEFT: FEED ═══ */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { id: "all", label: "All Severity", color: t.text },
              { id: "critical", label: "Critical", color: "#FF4562" },
              { id: "high", label: "High", color: "#F59E0B" },
              { id: "medium", label: "Medium", color: "#FB923C" },
              { id: "low", label: "Low", color: "#3B82F6" },
            ].map(p => {
              const active = sevFilter === p.id;
              return (
                <button key={p.id} onClick={() => setSevFilter(p.id)} style={{
                  padding: "5px 10px", borderRadius: 5,
                  border: `1px solid ${active ? "rgba(245,158,11,0.30)" : t.borderLight}`,
                  background: active ? "rgba(245,158,11,0.10)" : "transparent",
                  color: active ? "#F59E0B" : t.text40,
                  fontSize: 9, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.color }} />
                  {p.label}
                </button>
              );
            })}
            <span style={{ width: 1, height: 18, background: t.borderLight, margin: "0 4px" }} />
            {[
              { id: "all", label: "All Status" },
              { id: "open", label: "Open" },
              { id: "closed", label: "Closed" },
            ].map(p => {
              const active = statusFilter === p.id;
              return (
                <button key={p.id} onClick={() => setStatusFilter(p.id)} style={{
                  padding: "5px 10px", borderRadius: 5,
                  border: `1px solid ${active ? "rgba(34,197,94,0.30)" : t.borderLight}`,
                  background: active ? "rgba(34,197,94,0.10)" : "transparent",
                  color: active ? "#22C55E" : t.text40,
                  fontSize: 9, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}>{p.label}</button>
              );
            })}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by BIN, domain, email, seller, keyword..."
              style={{
                flex: 1, minWidth: 200, padding: "6px 10px",
                background: t.bgInput, border: `1px solid ${t.borderLight}`,
                borderRadius: 6, color: t.text, fontSize: 10,
                fontFamily: "'Inter', sans-serif", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 3 }}>
              {["24h", "7d", "30d", "90d", "ALL"].map(p => {
                const active = timeFilter === p;
                return (
                  <button key={p} onClick={() => setTimeFilter(p)} style={{
                    padding: "4px 9px", borderRadius: 4,
                    border: `1px solid ${active ? "rgba(59,130,246,0.30)" : t.borderLight}`,
                    background: active ? NAV_BLUE_BG : "transparent",
                    color: active ? NAV_BLUE : t.text35,
                    fontSize: 8, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{p}</button>
                );
              })}
            </div>
          </div>

          {/* Listings — flex:1 so the column stretches down to the sidebar's bottom */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {feed.length === 0 ? (
              <div style={{
                padding: 40, textAlign: "center",
                background: t.bgCard, border: `1px solid ${t.borderSection}`, borderRadius: 10,
              }}>
                <div style={{ fontSize: 12, color: t.text40 }}>No fraud signals match the current filters.</div>
              </div>
            ) : (
              pagedFeed.map(l => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  selected={selectedId === l.id}
                  onClick={() => setSelectedId(l.id)}
                  t={t}
                />
              ))
            )}
          </div>

          {/* Pagination — pinned to the bottom of the feed column */}
          <Pagination
            page={pag.page}
            totalPages={pag.totalPages}
            startIdx={pag.startIdx}
            endIdx={pag.endIdx}
            totalItems={feed.length}
            onPrev={pag.prev}
            onNext={pag.next}
            onGoTo={pag.goTo}
            perPage={pag.perPage}
            onPerPageChange={pag.setPerPage}
          />
        </div>

        {/* ═══ RIGHT: SIDEBAR ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Card Checker Activity — always visible */}
          <div className="glass" style={{
            padding: 14,
            border: "1px solid rgba(255,69,98,0.20)",
          }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Card Checker Activity</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>BIN validation alerts</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, color: "#FF4562", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                <TrendUp /> 340% spike
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div>
                <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: "#FF4562", lineHeight: 1 }}>47</div>
                <div className="mono" style={{ fontSize: 8, color: t.text30, marginTop: 3 }}>checks detected (7d)</div>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 2, height: 26 }}>
                {CHECKER_SPARK.map((v, i) => {
                  const max = Math.max(...CHECKER_SPARK);
                  const h = (v / max) * 24;
                  const isLast = i === CHECKER_SPARK.length - 1;
                  return (
                    <div key={i} style={{
                      flex: 1, height: h, borderRadius: 1.5,
                      background: isLast ? "#FF4562" : `rgba(255,69,98,${0.3 + (v / max) * 0.3})`,
                    }} />
                  );
                })}
              </div>
            </div>
            {CHECKER_ALERTS.map((a, i) => (
              <div key={i} style={{
                background: "rgba(255,69,98,0.04)",
                border: "1px solid rgba(255,69,98,0.10)",
                borderRadius: 6, padding: "7px 10px", marginBottom: 4,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: t.text }}>{a.bin}</span>
                  <span style={{
                    padding: "2px 6px", borderRadius: 3, fontSize: 7, fontWeight: 700,
                    background: a.result === "ACTIVE" ? "rgba(255,69,98,0.12)" : "rgba(59,130,246,0.12)",
                    color: a.result === "ACTIVE" ? "#FF4562" : "#3B82F6",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{a.result}</span>
                </div>
                <div className="mono" style={{ fontSize: 8, color: t.text30, display: "flex", gap: 8 }}>
                  <span>{a.service}</span>
                  <span>{a.time}</span>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 7 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, color: NAV_BLUE, cursor: "pointer", fontWeight: 600 }}>
                View all 47 checks <ArrowRight size={9} color={NAV_BLUE} />
              </span>
            </div>
          </div>

          {/* Tracked BINs (folded from Financial Intelligence) */}
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Tracked BINs</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Your monitored ranges</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {TRACKED_BINS.map((b, i) => (
                <div key={i} style={{
                  padding: "8px 10px", borderRadius: 6,
                  background: t.bgInput, border: `1px solid ${t.borderLight}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: t.text }}>{b.bin}</span>
                      <span className="mono" style={{ fontSize: 8, color: t.text35 }}>· {b.brand}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 8, color: t.text35, marginTop: 1 }}>
                      {b.country} · {b.issuer}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="hfont" style={{ fontSize: 13, fontWeight: 800, color: b.color, lineHeight: 1 }}>{b.listings}</div>
                    <div className="mono" style={{ fontSize: 7, color: t.text30, marginTop: 2 }}>cards seen</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 9 }}>
              <span
                onClick={() => navigate("/financial-intelligence")}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, color: NAV_BLUE, cursor: "pointer", fontWeight: 600 }}
              >
                Open Card Database <ArrowRight size={9} color={NAV_BLUE} />
              </span>
            </div>
          </div>

          {/* Top Sellers */}
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Top Sellers</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Repeat offenders listing your data</span>
            <div style={{ marginTop: 10 }}>
              {TOP_SELLERS.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 0", borderBottom: i < TOP_SELLERS.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span className="mono" style={{ fontSize: 8, color: t.text30, width: 14, fontWeight: 700 }}>{s.rank}</span>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 600, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.handle}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 8, color: "#F59E0B", fontWeight: 700, flexShrink: 0 }}>
                    <StarSVG size={7} /> {s.rating}
                  </span>
                  <span className="mono" style={{ fontSize: 8, color: t.text35, flexShrink: 0 }}>{s.market}</span>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: s.color, width: 22, textAlign: "right", flexShrink: 0 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Marketplace */}
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>By Marketplace</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Listings per platform</span>
            <div style={{ marginTop: 10 }}>
              {BY_MARKET.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: t.text50, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                  <div style={{ width: 70, height: 5, background: t.bgInput, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 3 }} />
                  </div>
                  <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: m.color, width: 22, textAlign: "right", flexShrink: 0 }}>{m.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Data Type */}
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>By Data Type</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Signal breakdown</span>
            <div style={{ marginTop: 10 }}>
              {BY_DATA_TYPE.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 0",
                  borderBottom: i < BY_DATA_TYPE.length - 1 ? `1px solid ${t.borderRow}` : "none",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: t.text50, flex: 1 }}>{d.name}</span>
                  <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: d.color }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Listings Timeline */}
          <div className="glass" style={{ padding: 14 }}>
            <div className="mono" style={{ fontSize: 8, color: t.text30, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Active Listings Timeline</div>
            <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Last 30 days</span>
            <div style={{ marginTop: 10, height: 70 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TIMELINE_DATA} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="fraudTimeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={1.5} fill="url(#fraudTimeline)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 8, color: t.text30 }}>30d ago</span>
              <span className="mono" style={{ fontSize: 8, color: t.text30 }}>Today</span>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ KYC DATA SALE — news widget at the bottom (single-topic, no ransomware tab) ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both" : "none", position: "relative" }}>
        <div className="mono" style={{ fontSize: 8, color: t.text25, letterSpacing: "0.20em", fontWeight: 700, marginBottom: 8 }}>KYC DATA SALE</div>
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="hfont" style={{ fontSize: 14, fontWeight: 700, color: t.text }}>KYC data on sale</span>
              <span className="mono" style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, padding: "2px 7px", background: "rgba(245,158,11,0.12)", borderRadius: 3 }}>{KYC_NEWS.length} listings tracked</span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: "#FF4562", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/ransom-dark-web-news")}>View All →</span>
          </div>
          <div style={{ display: "flex", minHeight: 320 }}>
            <div style={{ width: 380, flexShrink: 0, borderRight: `1px solid ${t.borderSection}`, overflow: "auto", maxHeight: 380 }}>
              {KYC_NEWS.map((item, i) => {
                const isActive = activeKyc === i;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveKyc(i)}
                    style={{
                      padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
                      borderLeft: isActive ? "3px solid #F59E0B" : "3px solid transparent",
                      background: isActive ? t.bgInput : "transparent",
                      borderBottom: `1px solid ${t.borderSection}`,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.bgCard; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{
                        width: 80, height: 56, borderRadius: 6, flexShrink: 0,
                        background: t.bgHover, border: `1px solid ${t.borderLight}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <circle cx="9" cy="11" r="2.5" />
                          <path d="M14 10h4M14 13h4M5 18h14" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 600, background: "rgba(245,158,11,0.18)", color: "#F59E0B", marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>KYC Data Sale</div>
                        <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4, color: t.text70, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</div>
                        <div className="mono" style={{ fontSize: 9, color: t.text25 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedKyc && (
              <div style={{ flex: 1, padding: "18px 22px" }}>
                <h3 className="hfont" style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 6 }}>{selectedKyc.title}</h3>
                <div className="mono" style={{ fontSize: 9, color: t.text30, marginBottom: 10 }}>📅 {selectedKyc.date}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                  {selectedKyc.tags.map((tag, k) => (
                    <span key={k} style={{ padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 500, background: "rgba(245,158,11,0.10)", color: "#F59E0B" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 7, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.14)" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(168,85,247,0.14)", color: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#A855F7"><polygon points="12,2 14.5,9 22,9 16,14 18.5,22 12,17 5.5,22 8,14 2,9 9.5,9" /></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#A855F7", marginBottom: 3 }}>SOCRadar AI Insights</div>
                    <div style={{ fontSize: 9, color: t.text50, lineHeight: 1.55 }}>{selectedKyc.desc}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
