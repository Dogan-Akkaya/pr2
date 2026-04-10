import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FilterDropdown } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";

// ── Chart data: 24 data points over 12 months ──
const CHART_DATA = [
  { m: "May", v: 310 }, { m: "", v: 340 }, { m: "Jun", v: 290 }, { m: "", v: 380 },
  { m: "Jul", v: 420 }, { m: "", v: 390 }, { m: "Aug", v: 510 }, { m: "", v: 620 },
  { m: "Sep", v: 780 }, { m: "", v: 847 }, { m: "Oct", v: 720 }, { m: "", v: 650 },
  { m: "Nov", v: 580 }, { m: "", v: 540 }, { m: "Dec", v: 490 }, { m: "", v: 460 },
  { m: "Jan", v: 430 }, { m: "", v: 470 }, { m: "Feb", v: 510 }, { m: "", v: 490 },
  { m: "Mar", v: 530 }, { m: "", v: 560 }, { m: "Apr", v: 590 }, { m: "", v: 610 },
];

// ── Top affected countries ──
const COUNTRIES = [
  { flag: "\u{1F1E8}\u{1F1F3}", code: "CN", name: "China", count: "2.1K" },
  { flag: "\u{1F1FA}\u{1F1F8}", code: "US", name: "United States", count: "1.8K" },
  { flag: "\u{1F1EE}\u{1F1F3}", code: "IN", name: "India", count: "1.4K" },
  { flag: "\u{1F1E7}\u{1F1F7}", code: "BR", name: "Brazil", count: "1.1K" },
  { flag: "\u{1F1F9}\u{1F1F7}", code: "TR", name: "Turkey", count: "987" },
  { flag: "\u{1F1F7}\u{1F1FA}", code: "RU", name: "Russia", count: "923" },
  { flag: "\u{1F1E9}\u{1F1EA}", code: "DE", name: "Germany", count: "814" },
  { flag: "\u{1F1EE}\u{1F1E9}", code: "ID", name: "Indonesia", count: "756" },
  { flag: "\u{1F1F5}\u{1F1ED}", code: "PH", name: "Philippines", count: "692" },
  { flag: "\u{1F1EC}\u{1F1E7}", code: "GB", name: "United Kingdom", count: "641" },
];

// ── Stat cards ──
const STATS = [
  { label: "Database Leaks", value: "142", color: "#DC2626", trend: "+12%", icon: "db" },
  { label: "Access Sales", value: "89", color: "#EA580C", trend: "+8%", icon: "key" },
  { label: "Data Exposures", value: "234", color: "#F59E0B", trend: "+15%", icon: "eye" },
  { label: "Forum Posts", value: "1.2K", color: "#3B82F6", trend: "+5%", icon: "msg" },
];

// ── Static filter labels (non-interactive) ──
const STATIC_FILTERS = [
  { label: "Industries", count: "0/90" },
  { label: "Regions", count: "0/28" },
  { label: "Post Owners", count: "0/23172" },
];

// ── News articles ──
const ARTICLES = [
  {
    id: 1,
    title: "The Alleged Database of Famouscase.net is Leaked",
    desc: "A threat actor claims to have leaked the full database of Famouscase.net, a legal case management platform used by attorneys across North America.",
    date: "08 Apr 2026",
    tags: ["Database Leak", "Legal", "North America"],
    countries: ["US", "CA"],
    category: "Database Leak",
    ai: "SOCRadar's AI analysis indicates this leak contains approximately 2.3 million records including attorney profiles, case metadata, and client contact information. The data was posted on BreachForums by a known threat actor with a history of targeting SaaS platforms.",
    insights: [
      { lead: "Volume:", text: "Approximately 2.3M records including PII, case files, and internal communications" },
      { lead: "Threat Actor:", text: "\"xDataLeaker\" — active since 2024, 47 prior leaks attributed" },
      { lead: "Exposure Risk:", text: "Attorney-client privileged information may be compromised" },
      { lead: "Recommended Action:", text: "Notify affected clients and initiate credential rotation for all platform users" },
    ],
    body: "The threat actor posted a sample containing 50,000 rows of user data including full names, email addresses, phone numbers, bar association IDs, and hashed passwords. The actor claims the full database contains over 2.3 million records extracted via an SQL injection vulnerability in the platform's search API endpoint. The listing appeared on BreachForums at 14:23 UTC on April 8, 2026, with a price tag of $5,000 for the complete dataset.",
    codePreview: "TABLE: users (2,341,892 rows)\n├─ id, full_name, email, phone\n├─ bar_id, firm_name, state\n├─ password_hash (bcrypt)\n└─ last_login, created_at\n\nTABLE: cases (8,912,340 rows)\n├─ case_id, attorney_id, client_name\n├─ case_type, status, filing_date\n└─ court, jurisdiction, notes",
  },
  {
    id: 2,
    title: "The Alleged Database of Kysan Electronics is Leaked",
    desc: "A database allegedly belonging to Kysan Electronics, a semiconductor manufacturer based in Shenzhen, has been listed for sale on a dark web marketplace.",
    date: "08 Apr 2026",
    tags: ["Database Leak", "Manufacturing", "Asia"],
    countries: ["CN"],
    category: "Database Leak",
    ai: "This leak appears to contain proprietary manufacturing data including chip design schematics and supply chain records. The threat actor is offering the data in exchange for cryptocurrency, suggesting financially motivated espionage.",
    insights: [
      { lead: "Volume:", text: "890K records including employee data and proprietary schematics" },
      { lead: "Threat Actor:", text: "\"SilkRoadVendor\" — first observed in Chinese-language forums" },
      { lead: "Impact:", text: "Intellectual property theft affecting semiconductor supply chain" },
    ],
    body: "The listing includes sample data showing employee records, internal project codenames, and what appears to be partial chip design documentation. The threat actor claims access was obtained through a compromised VPN endpoint used by remote engineering staff.",
    codePreview: "TABLE: employees (12,450 rows)\n├─ emp_id, name, department, role\n├─ email, access_level\n└─ badge_id, facility_code\n\nTABLE: projects (340 rows)\n├─ project_code, codename, status\n├─ lead_engineer, budget_usd\n└─ target_date, classification",
  },
  {
    id: 3,
    title: "The Alleged Unauthorized Access Sale is Detected for an American Construction Management Company",
    desc: "An unauthorized RDP access to an American construction management company's internal network is being offered for sale on a Russian-language dark web forum.",
    date: "07 Apr 2026",
    tags: ["Access Sale", "Construction", "RDP"],
    countries: ["US"],
    category: "Access Sale",
    ai: "The access being sold appears to grant domain administrator privileges to the target company's Active Directory environment. The seller claims annual revenue of the target exceeds $500M, which increases the potential ransomware attack value.",
    insights: [
      { lead: "Access Type:", text: "RDP with Domain Admin privileges via compromised VPN" },
      { lead: "Price:", text: "$3,500 — consistent with high-value corporate access pricing" },
      { lead: "Risk Level:", text: "Critical — domain admin access enables full network compromise" },
    ],
    body: "The forum post, written in Russian, advertises RDP access to a U.S.-based construction management firm with over 2,000 employees. The seller provides screenshots showing Active Directory console access and claims to have maintained persistence for over 3 weeks without detection.",
    codePreview: "ACCESS DETAILS:\n├─ Type: RDP (Remote Desktop Protocol)\n├─ Privileges: Domain Administrator\n├─ Network: 10.0.0.0/8 (approx. 4,200 hosts)\n├─ OS: Windows Server 2019\n├─ AV: CrowdStrike (disabled)\n└─ Persistence: 23 days undetected",
  },
  {
    id: 4,
    title: "The Alleged Database of Thai Society of Gastroenterology is Leaked",
    desc: "Patient and member records from the Thai Society of Gastroenterology have appeared on a data leak forum, containing sensitive medical and personal information.",
    date: "07 Apr 2026",
    tags: ["Database Leak", "Healthcare", "Asia"],
    countries: ["TH"],
    category: "Database Leak",
    ai: "This healthcare data breach is particularly sensitive due to the medical nature of the records. The dataset includes patient diagnoses and treatment histories which fall under strict data protection regulations in Thailand.",
    insights: [
      { lead: "Volume:", text: "156K patient records with medical histories" },
      { lead: "Sensitivity:", text: "Contains PHI including diagnoses, treatments, and insurance data" },
      { lead: "Regulatory:", text: "Violates Thailand PDPA and international healthcare data standards" },
    ],
    body: "The leak contains member registration data, conference attendance records, and most critically, a linked patient referral database with diagnostic codes and treatment plans. The data appears to span from 2019 to early 2026.",
    codePreview: "TABLE: members (8,920 rows)\n├─ member_id, name, hospital\n├─ specialty, license_no\n└─ email, phone, region\n\nTABLE: patient_referrals (156,340 rows)\n├─ patient_id, referring_md\n├─ icd10_code, diagnosis_text\n└─ treatment_plan, insurance_id",
  },
  {
    id: 5,
    title: "The Alleged Database of Indonesian National Police is Leaked",
    desc: "A massive data breach allegedly affecting the Indonesian National Police (Polri) has surfaced, with the threat actor claiming access to internal law enforcement databases.",
    date: "06 Apr 2026",
    tags: ["Database Leak", "Government", "Law Enforcement"],
    countries: ["ID"],
    category: "Database Leak",
    ai: "This is a high-impact government data breach with potential national security implications. The leaked data reportedly includes officer personal details, case files, and intelligence reports.",
    insights: [
      { lead: "Volume:", text: "4.7M records across multiple internal databases" },
      { lead: "Severity:", text: "Critical — law enforcement and intelligence data exposed" },
      { lead: "National Security:", text: "Active investigation details and officer identities at risk" },
    ],
    body: "The threat actor posted on BreachForums claiming to have exfiltrated data from multiple Polri internal systems. Sample data shows officer ranks, assignments, criminal case records, and what appears to be informant management data. Indonesian cybersecurity authorities have been notified.",
    codePreview: "TABLE: officers (342,100 rows)\n├─ nrp, rank, name, unit\n├─ assignment, station_code\n└─ phone, address, photo_url\n\nTABLE: cases (1,890,000 rows)\n├─ case_no, type, status\n├─ lead_officer, district\n└─ suspects, evidence_log",
  },
  {
    id: 6,
    title: "The Alleged Database of Fudan Microelectronics is Leaked",
    desc: "Proprietary data from Fudan Microelectronics Group, a major Chinese semiconductor company, has been listed on a dark web marketplace targeting industrial espionage buyers.",
    date: "06 Apr 2026",
    tags: ["Database Leak", "Semiconductor", "IP Theft"],
    countries: ["CN"],
    category: "Database Leak",
    ai: "This leak targets one of China's leading semiconductor firms and may contain export-controlled technology data. The listing specifically mentions FPGA design files and customer contracts.",
    insights: [
      { lead: "Data Type:", text: "Proprietary chip designs, FPGA schematics, customer contracts" },
      { lead: "Threat Actor:", text: "\"ChipBroker\" — specializes in semiconductor IP theft" },
      { lead: "Geopolitical:", text: "May have implications for semiconductor trade restrictions" },
    ],
    body: "The listing advertises access to internal R&D repositories containing FPGA design files, test vectors, and customer integration documentation. The threat actor claims the data was obtained through a supply chain compromise affecting a third-party EDA tool vendor.",
    codePreview: "REPOSITORY: /rd/fpga_designs/\n├─ XC7K325T_custom_v3.2.vhd\n├─ test_vectors/regression_suite/\n├─ customer_integrations/\n│   ├─ huawei_proj_alpha/\n│   └─ zte_modem_v4/\n└─ docs/internal_specs/",
  },
  {
    id: 7,
    title: "New RDP Access Sale Detected for a European Financial Institution",
    desc: "A threat actor is advertising RDP access to the internal network of a major European bank with operations across 12 countries.",
    date: "05 Apr 2026",
    tags: ["Access Sale", "Finance", "Europe", "RDP"],
    countries: ["DE", "FR", "NL"],
    category: "Access Sale",
    ai: "Financial sector access sales carry extreme risk due to the potential for direct monetary theft, ransomware deployment, or regulatory data exfiltration. The claimed revenue of the target suggests a systemically important institution.",
    insights: [
      { lead: "Access Type:", text: "RDP + Citrix VDI with local admin privileges" },
      { lead: "Price:", text: "$12,000 — premium pricing indicates high-value target" },
      { lead: "Banking Risk:", text: "SWIFT terminal proximity and customer PII exposure" },
    ],
    body: "The dark web listing, posted on Exploit.in, advertises dual-path access to a European financial institution through both RDP and Citrix virtual desktop infrastructure. The seller claims the institution processes over EUR 50B annually and has SWIFT terminal access from compromised segments.",
    codePreview: "ACCESS DETAILS:\n├─ Type: RDP + Citrix VDI\n├─ Privileges: Local Admin (2 hosts)\n├─ Network Segments: 3 VLANs accessible\n├─ SWIFT: Adjacent segment (1 hop)\n├─ Revenue: >EUR 50B annually\n└─ Employees: ~18,000 across 12 countries",
  },
  {
    id: 8,
    title: "Customer Database of Major Asian E-Commerce Platform Listed on Dark Web",
    desc: "A massive customer database from one of Southeast Asia's largest e-commerce platforms has surfaced on multiple dark web forums simultaneously.",
    date: "05 Apr 2026",
    tags: ["Database Leak", "E-Commerce", "Southeast Asia"],
    countries: ["SG", "MY", "TH", "PH", "ID"],
    category: "Database Leak",
    ai: "This multi-country data breach affects millions of consumers across Southeast Asia. The dataset includes payment card tokens and purchase histories, making it particularly valuable for fraud operations.",
    insights: [
      { lead: "Volume:", text: "18.6M customer records across 5 countries" },
      { lead: "Payment Data:", text: "Tokenized card data and e-wallet balances included" },
      { lead: "Fraud Risk:", text: "Purchase history enables targeted phishing campaigns" },
    ],
    body: "The dataset appeared simultaneously on BreachForums and XSS.is, suggesting a coordinated release. Sample data shows customer names, addresses, phone numbers, email addresses, tokenized payment methods, and detailed purchase histories dating back to 2021. The threat actor is selling the complete dataset for 2.5 BTC.",
    codePreview: "TABLE: customers (18,641,200 rows)\n├─ user_id, name, email, phone\n├─ country, city, postal_code\n├─ payment_token, wallet_balance\n└─ created_at, last_purchase\n\nTABLE: orders (124,500,000 rows)\n├─ order_id, user_id, total_usd\n├─ items_json, shipping_addr\n└─ payment_method, status",
  },
];

// ── Derive option lists from ARTICLES ──
const ALL_CATEGORIES = [...new Set(ARTICLES.map(a => a.category))];
const ALL_COUNTRIES = [...new Set(ARTICLES.flatMap(a => a.countries))];
const ALL_TAGS = [...new Set(ARTICLES.flatMap(a => a.tags))];

// ── Stat icon SVGs ──
function StatIcon({ type, color }) {
  const s = { width: 14, height: 14, strokeWidth: 1.5, fill: "none", stroke: color };
  if (type === "db") return (
    <svg {...s} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
  );
  if (type === "key") return (
    <svg {...s} viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
  );
  if (type === "eye") return (
    <svg {...s} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  );
  return (
    <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  );
}

// ── Tooltip style (moved into component, see getTtS) ──

// ── Category badge colors ──
const CAT_COLORS = {
  "Database Leak": { bg: "rgba(220,38,38,0.08)", color: "#DC2626" },
  "Access Sale": { bg: "rgba(234,88,12,0.08)", color: "#EA580C" },
  "Data Exposure": { bg: "rgba(245,158,11,0.08)", color: "#F59E0B" },
  "Forum Post": { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" },
};

// ── Tag colors by type (moved into component, see getTagColor) ──

export default function DarkWebNews() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selCategories, setSelCategories] = useState(new Set());
  const [selCountries, setSelCountries] = useState(new Set());
  const [selTags, setSelTags] = useState(new Set());
  const [showAll, setShowAll] = useState(true);
  const [aiExpanded, setAiExpanded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // ── Tooltip style ──
  const ttS = {
    contentStyle: {
      background: t.bgTooltip, border: `1px solid ${t.borderMed}`,
      borderRadius: 12, fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
      backdropFilter: "blur(20px)", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", padding: "10px 14px",
    },
    itemStyle: { color: t.text, padding: "2px 0" },
    labelStyle: { color: t.text50, marginBottom: 4, fontWeight: 600 },
  };

  // ── Tag colors by type ──
  function tagColor(tag) {
    const countries = ["US", "CA", "CN", "TH", "ID", "DE", "FR", "NL", "SG", "MY", "PH", "North America", "Asia", "Europe", "Southeast Asia"];
    if (countries.includes(tag)) return { bg: "rgba(232,70,58,0.08)", color: "#E8463A" };
    const categories = ["Database Leak", "Access Sale", "RDP", "IP Theft"];
    if (categories.includes(tag)) return { bg: "rgba(59,130,246,0.08)", color: "#3B82F6" };
    const sectors = ["Legal", "Manufacturing", "Construction", "Healthcare", "Government", "Law Enforcement", "Semiconductor", "Finance", "E-Commerce"];
    if (sectors.includes(tag)) return { bg: "rgba(168,85,247,0.08)", color: "#A855F7" };
    return { bg: t.bgHover, color: t.text40 };
  }

  // ── Filter articles ──
  const filteredArticles = ARTICLES.filter(a => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.desc.toLowerCase().includes(q) && !a.tags.some(tg => tg.toLowerCase().includes(q))) return false;
    }
    // Category filter
    if (selCategories.size > 0 && !selCategories.has(a.category)) return false;
    // Country filter
    if (selCountries.size > 0 && !a.countries.some(c => selCountries.has(c))) return false;
    // Tags filter
    if (selTags.size > 0 && !a.tags.some(tg => selTags.has(tg))) return false;
    return true;
  });

  // Show All toggle — show first 4 or all
  const displayedArticles = showAll ? filteredArticles : filteredArticles.slice(0, 4);

  // If selected article is not in displayed list, auto-select the first displayed one
  useEffect(() => {
    if (displayedArticles.length > 0 && !displayedArticles.find(a => a.id === selectedId)) {
      setSelectedId(displayedArticles[0].id);
    }
  }, [searchQuery, selCategories, selCountries, selTags, showAll, displayedArticles, selectedId]);

  // Reset AI expanded when switching articles
  useEffect(() => { setAiExpanded(false); }, [selectedId]);

  const selected = displayedArticles.find(a => a.id === selectedId) || displayedArticles[0] || ARTICLES[0];
  const catColor = CAT_COLORS[selected.category] || CAT_COLORS["Database Leak"];

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ── 1. TOP DASHBOARD ROW ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Threat Pulse Chart */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>
              THREAT PULSE
            </div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Dark Web Activity Trend</span>
          </div>
          <div style={{ padding: "16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="dwn-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8463A" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#E8463A" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} width={30} />
                <Tooltip {...ttS} />
                <Area type="monotone" dataKey="v" stroke="#E8463A" strokeWidth={2} fill="url(#dwn-fill)" dot={false} name="Posts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8463A", boxShadow: "0 0 6px rgba(232,70,58,0.5)" }} />
            <span style={{ fontSize: 12, color: t.text50 }}>Dark Web Posts This Month:</span>
            <span className="hfont" style={{ fontSize: 16, fontWeight: 800, color: t.text }}>847</span>
          </div>
        </div>

        {/* Affected Regions */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>
              AFFECTED REGIONS
            </div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Top 10 Countries by Posts</span>
          </div>
          <div style={{ padding: "12px 20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {COUNTRIES.map((c, i) => (
              <div key={c.code} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 12px 7px 0",
                borderBottom: i < 8 ? `1px solid ${t.borderRow}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{c.flag}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text50, width: 24 }}>{c.code}</span>
                  <span style={{ fontSize: 11, color: t.text40 }}>{c.name}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: t.text }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. STAT CARDS ROW ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {STATS.map(s => (
          <div key={s.label} className="glass" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${s.color}10`, border: `1px solid ${s.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <StatIcon type={s.icon} color={s.color} />
              </div>
              <span style={{ fontSize: 11, color: t.text40 }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="hfont" style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>{s.value}</span>
              <span className="mono" style={{ fontSize: 10, color: s.color }}>{s.trend} this week</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. FILTER BAR + 4. NEWS FEED ── */}
      <div className="glass" style={{
        overflow: "hidden", flex: 1,
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Filter Bar */}
        <div style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${t.borderSection}`,
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        }}>
          {/* Type dropdown */}
          <div style={{
            padding: "7px 12px", borderRadius: 8,
            background: "rgba(232,70,58,0.08)", border: "1px solid rgba(232,70,58,0.2)",
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#E8463A" }}>Dark Web News</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>

          {/* Show All toggle */}
          <button onClick={() => setShowAll(!showAll)} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 500,
            background: showAll ? "rgba(232,70,58,0.08)" : t.bgHover,
            border: showAll ? "1px solid rgba(232,70,58,0.2)" : `1px solid ${t.borderLight}`,
            color: showAll ? "#E8463A" : t.text50, cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
          }}>{showAll ? "Show All" : "Show Top 4"}</button>

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: t.bgElevated }} />

          {/* FilterDropdown: Category */}
          <FilterDropdown label="Category" options={ALL_CATEGORIES} selected={selCategories} onSelectionChange={setSelCategories} accentColor="#E8463A" />

          {/* FilterDropdown: Countries */}
          <FilterDropdown label="Countries" options={ALL_COUNTRIES} selected={selCountries} onSelectionChange={setSelCountries} accentColor="#E8463A" />

          {/* FilterDropdown: Tags */}
          <FilterDropdown label="Tags" options={ALL_TAGS} selected={selTags} onSelectionChange={setSelTags} accentColor="#3B82F6" />

          {/* Static filters (non-interactive labels) */}
          {STATIC_FILTERS.map(f => (
            <div key={f.label} style={{
              padding: "7px 10px", borderRadius: 8,
              background: t.bgInput, border: `1px solid ${t.borderLight}`,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 11, color: t.text40 }}>{f.label}</span>
              <span className="mono" style={{ fontSize: 9, color: t.text25 }}>{f.count}</span>
            </div>
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: "relative", width: 200 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search news..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{
              width: "100%", padding: "8px 12px 8px 36px", fontSize: 12,
              fontFamily: "'Satoshi',sans-serif", background: t.bgInput,
              border: `1px solid ${t.borderLight}`, borderRadius: 8,
              color: t.text, outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(232,70,58,0.3)"}
            onBlur={e => e.target.style.borderColor = t.borderLight}
            />
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div style={{ display: "flex", minHeight: 600 }}>
          {/* Left: Article List */}
          <div style={{
            width: 380, borderRight: `1px solid ${t.borderSection}`,
            overflowY: "auto", maxHeight: 700,
          }}>
            {displayedArticles.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5" style={{ marginBottom: 12 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <div style={{ fontSize: 12, color: t.text30, marginBottom: 4 }}>No articles match your filters</div>
                <div style={{ fontSize: 11, color: t.text20 }}>Try adjusting your search or category filter</div>
              </div>
            )}
            {displayedArticles.map(a => {
              const isActive = a.id === selectedId;
              const cc = CAT_COLORS[a.category] || CAT_COLORS["Database Leak"];
              return (
                <div key={a.id} onClick={() => setSelectedId(a.id)} style={{
                  padding: "16px 20px", cursor: "pointer",
                  borderBottom: `1px solid ${t.borderSection}`,
                  background: isActive ? "rgba(232,70,58,0.04)" : "transparent",
                  borderLeft: isActive ? "2px solid #E8463A" : "2px solid transparent",
                  transition: "all 0.2s",
                }}>
                  {/* Thumbnail placeholder */}
                  <div style={{
                    width: "100%", height: 90, borderRadius: 8, marginBottom: 10,
                    background: t.bgInput, border: `1px solid ${t.borderSection}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  {/* Badge */}
                  <span style={{
                    display: "inline-block", fontSize: 9, fontWeight: 600, padding: "3px 7px",
                    borderRadius: 4, background: cc.bg, color: cc.color, marginBottom: 6,
                  }}>{a.category}</span>
                  {/* Title */}
                  <div className="hfont" style={{
                    fontSize: 13, fontWeight: 700, color: isActive ? t.text : t.text70,
                    lineHeight: 1.4, marginBottom: 4,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{a.title}</div>
                  {/* Desc snippet */}
                  <div style={{
                    fontSize: 11, color: t.text35, lineHeight: 1.4, marginBottom: 8,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{a.desc}</div>
                  {/* Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="mono" style={{ fontSize: 10, color: t.text30 }}>{a.date}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Article Detail */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 700, padding: "24px 28px" }}>
            {/* Title + Close button */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <h2 className="hfont" style={{ fontSize: 18, fontWeight: 800, color: t.text, lineHeight: 1.4, margin: 0, letterSpacing: "-0.02em" }}>
                {selected.title}
              </h2>
              <button onClick={() => setSelectedId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.bgElevated, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
            </div>

            {/* Date */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="mono" style={{ fontSize: 11, color: t.text40 }}>{selected.date}</span>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {selected.tags.map(tag => {
                const tc = tagColor(tag);
                return (
                  <span key={tag} style={{
                    display: "inline-flex", padding: "4px 10px", borderRadius: 6,
                    fontSize: 10, fontWeight: 500, background: tc.bg, color: tc.color,
                  }}>{tag}</span>
                );
              })}
              {selected.countries.map(c => {
                const tc = tagColor(c);
                return (
                  <span key={c} style={{
                    display: "inline-flex", padding: "4px 10px", borderRadius: 6,
                    fontSize: 10, fontWeight: 500, background: tc.bg, color: tc.color,
                  }}>{c}</span>
                );
              })}
            </div>

            {/* Article Image Placeholder */}
            <div style={{
              width: "100%", height: 220, borderRadius: 12, marginBottom: 20,
              background: t.bgInput, border: `1px solid ${t.borderLight}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              overflow: "hidden",
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span style={{ fontSize: 11, color: t.text15 }}>Article image</span>
            </div>

            {/* AI Insights Card */}
            <div style={{
              borderRadius: 12, padding: "18px 20px", marginBottom: 20,
              background: "linear-gradient(135deg, rgba(232,70,58,0.06) 0%, rgba(168,85,247,0.04) 100%)",
              border: "1px solid rgba(232,70,58,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(232,70,58,0.1)", border: "1px solid rgba(232,70,58,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>SOCRadar AI Insights</span>
                </div>
                <span onClick={() => setAiExpanded(!aiExpanded)} style={{ fontSize: 11, color: "#E8463A", cursor: "pointer", fontWeight: 600 }}>{aiExpanded ? "Show Less" : "Read More"}</span>
              </div>
              <p style={{
                fontSize: 12, lineHeight: 1.65, color: t.text55, marginBottom: 14,
                ...(!aiExpanded ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}),
              }}>
                {selected.ai}
              </p>
              {/* Key Insights */}
              {aiExpanded && (
                <>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: t.text25, textTransform: "uppercase", marginBottom: 8 }}>
                    KEY INSIGHTS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.insights.map((ins, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, lineHeight: 1.5 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#E8463A", marginTop: 6, flexShrink: 0, boxShadow: "0 0 4px rgba(232,70,58,0.4)" }} />
                        <span style={{ color: t.text50 }}>
                          <strong style={{ color: t.text70, fontWeight: 600 }}>{ins.lead}</strong> {ins.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Article body */}
            <p style={{ fontSize: 12, lineHeight: 1.7, color: t.text45, marginBottom: 20 }}>
              {selected.body}
            </p>

            {/* Placeholder image */}
            <div style={{
              width: "100%", height: 180, borderRadius: 10, marginBottom: 20,
              background: t.bgCard, border: `1px solid ${t.borderSection}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>

            {/* Code preview */}
            <div style={{
              borderRadius: 10, overflow: "hidden",
              border: `1px solid ${t.borderSection}`,
            }}>
              <div style={{
                padding: "8px 14px",
                background: t.bgInput,
                borderBottom: `1px solid ${t.borderSection}`,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
                <span className="mono" style={{ fontSize: 10, color: t.text30, textTransform: "uppercase", letterSpacing: "0.06em" }}>Data Preview</span>
              </div>
              <pre className="mono" style={{
                padding: "14px 16px", margin: 0,
                fontSize: 11, lineHeight: 1.6, color: t.text45,
                background: t.bgCode, whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>
                {selected.codePreview}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
