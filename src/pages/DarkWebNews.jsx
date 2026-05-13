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

// ─── RANSOMWARE MODE ─────────────────────────────────────────────────
// Mirrored from the now-merged RansomwareNews page so this single screen
// can flip its dashboard, stats and feed when the user toggles mode.
const RW_TREND_DATA = [
  { m: "Apr", v: 180 }, { m: "May", v: 210 }, { m: "Jun", v: 245 },
  { m: "Jul", v: 390 }, { m: "Aug", v: 420 }, { m: "Sep", v: 365 },
  { m: "Oct", v: 310 }, { m: "Nov", v: 290 }, { m: "Dec", v: 265 },
  { m: "Jan", v: 285 }, { m: "Feb", v: 298 }, { m: "Mar", v: 312 },
];

const RW_TOP_GROUPS = [
  { name: "LockBit", count: 2100, color: "#DC2626" },
  { name: "BlackCat/ALPHV", count: 1400, color: "#EA580C" },
  { name: "Cl0p", count: 980, color: "#F59E0B" },
  { name: "Play", count: 870, color: "#A855F7" },
  { name: "8Base", count: 650, color: "#3B82F6" },
  { name: "Akira", count: 520, color: "#10B981" },
  { name: "Medusa", count: 410, color: "#06B6D4" },
  { name: "NoEscape", count: 380, color: "#EC4899" },
];

const RW_STATS = [
  { label: "Active Groups",       value: "47",  color: "#DC2626", trend: "+5" },
  { label: "Victims This Month",  value: "312", color: "#A855F7", trend: "+18%" },
  { label: "Countries Affected",  value: "68",  color: "#F59E0B", trend: "+3" },
  { label: "Industries Targeted", value: "23",  color: "#3B82F6", trend: "+2" },
];

const RW_NEWS = [
  { id: 1, title: "Dutch hospitals disconnect systems after patient software cyberattack",
    desc: "Several hospitals across the Netherlands were forced to disconnect critical systems after a ransomware attack targeted their shared patient management software platform.",
    date: "07 Apr 2026", tags: ["Netherlands", "Healthcare", "Ransomware", "Hospitals"],
    victim: "Dutch Hospital Network Consortium", ransomwareGroup: "LockBit", industry: "Healthcare",
    aiAnalysis: "Coordinated attack on shared patient software suggests the threat actors identified a single point of failure in the hospital network's supply chain.",
    keyInsights: [
      { label: "Critical Infrastructure", text: "Healthcare in EU saw a 340% rise in ransomware since 2024." },
      { label: "Supply Chain Risk", text: "Shared platforms create single-point-of-failure across institutions." },
    ],
  },
  { id: 2, title: "Cybersecurity and Data Privacy — Dykema",
    desc: "Law firm Dykema reported a cybersecurity incident affecting client data systems with unauthorized encryption of file servers.",
    date: "06 Apr 2026", tags: ["United States", "Legal", "Law Firm"],
    victim: "Dykema Gossett PLLC", ransomwareGroup: "BlackCat/ALPHV", industry: "Legal",
    aiAnalysis: "Targeting a major law firm presents unique challenges due to attorney-client privilege protections.",
    keyInsights: [
      { label: "Privileged Data", text: "Attorney-client communications create extreme leverage for extortion." },
      { label: "Cascading Impact", text: "One law firm breach can affect hundreds of corporate clients." },
    ],
  },
  { id: 3, title: "Minnesota National Guard Responds to Winona County Cyberattack",
    desc: "The Minnesota National Guard's cyber defense unit was activated to respond to a ransomware attack on Winona County's government systems.",
    date: "06 Apr 2026", tags: ["United States", "Government", "National Guard"],
    victim: "Winona County, Minnesota", ransomwareGroup: "Play", industry: "Government",
    aiAnalysis: "Deployment of National Guard cyber assets to a county-level incident highlights the growing severity of attacks on local government.",
    keyInsights: [
      { label: "Critical Infrastructure", text: "Local government manages essential services that directly impact public safety." },
      { label: "VPN Vulnerability", text: "Remote access infrastructure remains a primary attack vector." },
    ],
  },
  { id: 4, title: "Transport Engineer Firm Discloses Ransomware Incident",
    desc: "A European transportation engineering firm disclosed a ransomware incident that disrupted design systems and project management platforms.",
    date: "05 Apr 2026", tags: ["United Kingdom", "Transportation", "Engineering"],
    victim: "Transport Engineering Corp.", ransomwareGroup: "8Base", industry: "Transportation",
    aiAnalysis: "Ransomware targeting engineering firms creates risks beyond data loss — encrypted design files can delay infrastructure projects.",
    keyInsights: [
      { label: "Infrastructure Delay", text: "Encrypted engineering files can delay multi-year infrastructure projects." },
      { label: "Specialized Data", text: "CAD/BIM files require specialized recovery procedures." },
    ],
  },
  { id: 5, title: "Gulf Region Faces 200,000 Daily Cyber Attack Attempts",
    desc: "SOCRadar intelligence reveals that Gulf region organizations face over 200,000 cyberattack attempts daily, with ransomware comprising a growing percentage.",
    date: "05 Apr 2026", tags: ["Global", "Energy", "Gulf Region"],
    victim: "Gulf Region Organizations (Multiple)", ransomwareGroup: "Multiple Groups", industry: "Energy",
    aiAnalysis: "The Gulf region's rapid digital transformation combined with geopolitical significance makes it an increasingly attractive target.",
    keyInsights: [
      { label: "Attack Volume", text: "200,000+ daily attack attempts indicate industrialized targeting." },
      { label: "Energy Sector", text: "Oil & gas infrastructure attacks carry global economic implications." },
    ],
  },
  { id: 6, title: "Krybit Ransomware Attack on Gerald Zisser GmbH",
    desc: "Austrian manufacturing company Gerald Zisser GmbH has been listed as a victim by the emerging Krybit ransomware group with 45GB allegedly exfiltrated.",
    date: "04 Apr 2026", tags: ["Germany", "Manufacturing", "SMB"],
    victim: "Gerald Zisser GmbH", ransomwareGroup: "Krybit", industry: "Manufacturing",
    aiAnalysis: "Krybit is an emerging ransomware group rapidly expanding operations targeting European SMBs in manufacturing.",
    keyInsights: [
      { label: "Emerging Threat", text: "New ransomware operation with aggressive tactics targeting European manufacturing." },
      { label: "Double Extortion", text: "45GB exfiltration combined with encryption maximizes pressure." },
    ],
  },
  { id: 7, title: "LockBit Claims Attack on Major European Manufacturing Firm",
    desc: "The LockBit ransomware group has claimed responsibility for an attack on a major European manufacturing conglomerate operating across 12 countries.",
    date: "03 Apr 2026", tags: ["Europe", "Manufacturing", "Large Enterprise"],
    victim: "European Manufacturing Conglomerate", ransomwareGroup: "LockBit", industry: "Manufacturing",
    aiAnalysis: "Despite law enforcement disruptions, LockBit continues to target high-value manufacturing enterprises.",
    keyInsights: [
      { label: "Persistence", text: "LockBit remains operational despite multiple law enforcement actions." },
      { label: "Strategic Data", text: "Strategic plans and client contracts represent high-value intelligence." },
    ],
  },
  { id: 8, title: "Cl0p Exploits MOVEit Vulnerability to Target Financial Sector",
    desc: "The Cl0p ransomware group has launched a new wave of attacks exploiting a recently disclosed vulnerability in MOVEit file transfer software.",
    date: "02 Apr 2026", tags: ["Global", "Finance", "Zero-Day"],
    victim: "Multiple Financial Institutions", ransomwareGroup: "Cl0p", industry: "Finance",
    aiAnalysis: "Cl0p's continued exploitation of file transfer vulnerabilities demonstrates a refined operational model focused on supply chain compromise.",
    keyInsights: [
      { label: "Supply Chain Attack", text: "File transfer software compromise enables mass exploitation." },
      { label: "Speed of Exploitation", text: "Automated tools outpace most organizations' patching capabilities." },
    ],
  },
];

const RW_ALL_INDUSTRIES = [...new Set(RW_NEWS.map(n => n.industry).filter(Boolean))];
const RW_ALL_GROUPS     = [...new Set(RW_NEWS.map(n => n.ransomwareGroup).filter(Boolean))];

// ─── Mini donut (ransomware groups) ──────────────────────────────────
function MiniDonut({ groups, size = 130, t }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 12;
  const total = groups.reduce((s, g) => s + g.count, 0);
  let cumAngle = -90;
  const arcs = groups.map((g) => {
    const angle = (g.count / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad   = ((cumAngle + angle) * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    cumAngle += angle;
    return { ...g, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });
  const innerR = r * 0.58;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} opacity={0.85} />)}
      <circle cx={cx} cy={cy} r={innerR} fill={t.bgBase} />
      <text x={cx} y={cy - 2} textAnchor="middle" fill={t.text} fontSize="13" fontWeight="800" fontFamily="'Red Hat Display', sans-serif">{(total / 1000).toFixed(1)}K</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={t.text35} fontSize="8" fontFamily="'JetBrains Mono',monospace">TOTAL</text>
    </svg>
  );
}

// ─── Apple-style toggle ──────────────────────────────────────────────
// Two labels flank a sliding-pill switch. Tap either label OR the pill itself.
function AppleToggle({ mode, onChange, t }) {
  const isRansom = mode === "ransomware";
  const leftActive  = !isRansom;
  const rightActive =  isRansom;
  const trackColor  = isRansom ? "#A855F7" : "#FF4562";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        onClick={() => onChange("darkweb")}
        style={{
          fontSize: 11, fontWeight: 700, cursor: "pointer", userSelect: "none",
          color: leftActive ? "#FF4562" : t.text30, transition: "color 0.2s",
        }}
      >Dark Web</span>
      <div
        onClick={() => onChange(isRansom ? "darkweb" : "ransomware")}
        role="switch"
        aria-checked={isRansom}
        style={{
          width: 42, height: 24, borderRadius: 14,
          background: trackColor, position: "relative", cursor: "pointer",
          transition: "background 0.25s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 1px 2px rgba(0,0,0,0.18), 0 0 0 1px ${trackColor}55`,
        }}
      >
        <div style={{
          position: "absolute", top: 2,
          left: isRansom ? 20 : 2,
          width: 20, height: 20, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.04)",
          transition: "left 0.25s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
      <span
        onClick={() => onChange("ransomware")}
        style={{
          fontSize: 11, fontWeight: 700, cursor: "pointer", userSelect: "none",
          color: rightActive ? "#A855F7" : t.text30, transition: "color 0.2s",
        }}
      >Ransomware</span>
    </div>
  );
}

// ── Tag colors by type (moved into component, see getTagColor) ──

export default function DarkWebNews() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  // Mode: "darkweb" (default) | "ransomware" — controls dashboard, stats, filter chips and feed.
  const [mode, setMode] = useState("darkweb");
  const [selectedId, setSelectedId] = useState(1);
  const [rwSelectedId, setRwSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selCategories, setSelCategories] = useState(new Set());
  const [selCountries, setSelCountries] = useState(new Set());
  const [selTags, setSelTags] = useState(new Set());
  const [selIndustries, setSelIndustries] = useState(new Set());
  const [selGroups, setSelGroups] = useState(new Set());
  const [showAll, setShowAll] = useState(true);
  const [aiExpanded, setAiExpanded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const isRansom = mode === "ransomware";

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
    if (countries.includes(tag)) return { bg: "rgba(255,69,98,0.08)", color: "#FF4562" };
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

      {/* ── 1. TOP DASHBOARD ROW (swaps with mode) ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* LEFT: Trend chart */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>
              {isRansom ? "12-MONTH OVERVIEW" : "THREAT PULSE"}
            </div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
              {isRansom ? "Ransomware Attack Trend" : "Dark Web Activity Trend"}
            </span>
          </div>
          <div style={{ padding: "16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={isRansom ? RW_TREND_DATA : CHART_DATA}>
                <defs>
                  <linearGradient id="dwn-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4562" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#FF4562" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="rwn-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.30} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30 }} width={30} />
                <Tooltip {...ttS} />
                <Area type="monotone" dataKey="v" stroke={isRansom ? "#A855F7" : "#FF4562"} strokeWidth={2} fill={`url(#${isRansom ? "rwn-fill" : "dwn-fill"})`} dot={false} name={isRansom ? "Attacks" : "Posts"} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: "0 20px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isRansom ? "#A855F7" : "#FF4562", boxShadow: `0 0 6px ${isRansom ? "rgba(168,85,247,0.5)" : "rgba(255,69,98,0.5)"}` }} />
            <span style={{ fontSize: 12, color: t.text50 }}>{isRansom ? "Attacks This Month:" : "Dark Web Posts This Month:"}</span>
            <span className="hfont" style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{isRansom ? "312" : "847"}</span>
          </div>
        </div>

        {/* RIGHT: Countries (DW) or Top Groups donut (Ransom) */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>
              {isRansom ? "THREAT LANDSCAPE" : "AFFECTED REGIONS"}
            </div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
              {isRansom ? "Top Ransomware Groups" : "Top 10 Countries by Posts"}
            </span>
          </div>
          {isRansom ? (
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 24 }}>
              <MiniDonut groups={RW_TOP_GROUPS} size={130} t={t} />
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
                {RW_TOP_GROUPS.map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: g.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: t.text60, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: t.text30, marginLeft: "auto", flexShrink: 0 }}>
                      {g.count >= 1000 ? (g.count / 1000).toFixed(1) + "K" : g.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* ── 2. STAT CARDS ROW (swaps with mode) ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {(isRansom ? RW_STATS : STATS).map(s => (
          <div key={s.label} className="glass" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${s.color}10`, border: `1px solid ${s.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isRansom ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ) : (
                  <StatIcon type={s.icon} color={s.color} />
                )}
              </div>
              <span style={{ fontSize: 11, color: t.text40 }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="hfont" style={{ fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>{s.value}</span>
              <span className="mono" style={{ fontSize: 10, color: s.color }}>{s.trend}{isRansom ? "" : " this week"}</span>
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
          {/* Apple-style mode toggle (replaces the old Dark Web News dropdown) */}
          <AppleToggle mode={mode} onChange={setMode} t={t} />

          {/* Spacer — pushes the rest of the filters a little further right so the toggle has room */}
          <div style={{ width: 18 }} />

          {/* Vertical separator after the toggle */}
          <div style={{ width: 1, height: 24, background: t.bgElevated }} />

          {/* Show All toggle */}
          <button onClick={() => setShowAll(!showAll)} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 500,
            background: showAll ? (isRansom ? "rgba(168,85,247,0.08)" : "rgba(255,69,98,0.08)") : t.bgHover,
            border: showAll ? `1px solid ${isRansom ? "rgba(168,85,247,0.2)" : "rgba(255,69,98,0.2)"}` : `1px solid ${t.borderLight}`,
            color: showAll ? (isRansom ? "#A855F7" : "#FF4562") : t.text50, cursor: "pointer", fontFamily: "'Inter', sans-serif",
          }}>{showAll ? "Show All" : "Show Top 4"}</button>

          {/* Separator */}
          <div style={{ width: 1, height: 24, background: t.bgElevated }} />

          {isRansom ? (
            <>
              <FilterDropdown label="Industries"        options={RW_ALL_INDUSTRIES} selected={selIndustries} onSelectionChange={setSelIndustries} accentColor="#A855F7" />
              <FilterDropdown label="Countries"         options={ALL_COUNTRIES}    selected={selCountries}  onSelectionChange={setSelCountries}  accentColor="#A855F7" />
              <FilterDropdown label="Ransomware Groups" options={RW_ALL_GROUPS}    selected={selGroups}     onSelectionChange={setSelGroups}     accentColor="#A855F7" />
            </>
          ) : (
            <>
              <FilterDropdown label="Category"  options={ALL_CATEGORIES} selected={selCategories} onSelectionChange={setSelCategories} accentColor="#FF4562" />
              <FilterDropdown label="Countries" options={ALL_COUNTRIES}  selected={selCountries}  onSelectionChange={setSelCountries}  accentColor="#FF4562" />
              <FilterDropdown label="Tags"      options={ALL_TAGS}       selected={selTags}       onSelectionChange={setSelTags}       accentColor="#3B82F6" />
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
            </>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: "relative", width: 200 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search news..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{
              width: "100%", padding: "8px 12px 8px 36px", fontSize: 12,
              fontFamily: "'Inter', sans-serif", background: t.bgInput,
              border: `1px solid ${t.borderLight}`, borderRadius: 8,
              color: t.text, outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(255,69,98,0.3)"}
            onBlur={e => e.target.style.borderColor = t.borderLight}
            />
          </div>
        </div>

        {/* Master-Detail Layout — Dark Web mode */}
        {!isRansom && (
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
                  background: isActive ? "rgba(255,69,98,0.04)" : "transparent",
                  borderLeft: isActive ? "2px solid #FF4562" : "2px solid transparent",
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
              <h2 className="hfont" style={{ fontSize: 18, fontWeight: 700, color: t.text, lineHeight: 1.4, margin: 0, letterSpacing: "-0.02em" }}>
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
              background: "linear-gradient(135deg, rgba(255,69,98,0.06) 0%, rgba(168,85,247,0.04) 100%)",
              border: "1px solid rgba(255,69,98,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(255,69,98,0.1)", border: "1px solid rgba(255,69,98,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4562" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>SOCRadar AI Insights</span>
                </div>
                <span onClick={() => setAiExpanded(!aiExpanded)} style={{ fontSize: 11, color: "#FF4562", cursor: "pointer", fontWeight: 600 }}>{aiExpanded ? "Show Less" : "Read More"}</span>
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
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF4562", marginTop: 6, flexShrink: 0, boxShadow: "0 0 4px rgba(255,69,98,0.4)" }} />
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
        )}

        {/* Master-Detail Layout — Ransomware mode */}
        {isRansom && (() => {
          // Filter ransom news by search + chips
          const filteredRw = RW_NEWS.filter(n => {
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              if (!n.title.toLowerCase().includes(q) && !n.desc.toLowerCase().includes(q) && !n.ransomwareGroup.toLowerCase().includes(q)) return false;
            }
            if (selIndustries.size > 0 && !selIndustries.has(n.industry)) return false;
            if (selGroups.size > 0     && !selGroups.has(n.ransomwareGroup)) return false;
            return true;
          });
          const displayedRw = showAll ? filteredRw : filteredRw.slice(0, 4);
          const selectedRw = displayedRw.find(n => n.id === rwSelectedId) || displayedRw[0] || RW_NEWS[0];
          return (
            <div style={{ display: "flex", minHeight: 600 }}>
              {/* Left list */}
              <div style={{ width: 380, borderRight: `1px solid ${t.borderSection}`, overflowY: "auto", maxHeight: 700 }}>
                {displayedRw.length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: t.text25, fontSize: 12 }}>
                    No ransomware news matches your filters
                  </div>
                )}
                {displayedRw.map(n => {
                  const isActive = n.id === rwSelectedId;
                  return (
                    <div key={n.id} onClick={() => setRwSelectedId(n.id)} style={{
                      padding: "16px 20px", cursor: "pointer",
                      borderBottom: `1px solid ${t.borderSection}`,
                      background: isActive ? "rgba(168,85,247,0.04)" : "transparent",
                      borderLeft: isActive ? "2px solid #A855F7" : "2px solid transparent",
                      transition: "all 0.2s",
                    }}>
                      <div style={{
                        width: "100%", height: 90, borderRadius: 8, marginBottom: 10,
                        background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <span style={{
                        display: "inline-block", fontSize: 9, fontWeight: 600, padding: "3px 7px",
                        borderRadius: 4, background: "rgba(168,85,247,0.12)", color: "#A855F7", marginBottom: 6,
                      }}>Ransomware</span>
                      <div className="hfont" style={{
                        fontSize: 13, fontWeight: 700, color: isActive ? t.text : t.text70,
                        lineHeight: 1.4, marginBottom: 4,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{n.title}</div>
                      <div style={{
                        fontSize: 11, color: t.text35, lineHeight: 1.4, marginBottom: 8,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{n.desc}</div>
                      <div className="mono" style={{ fontSize: 10, color: t.text30, display: "flex", alignItems: "center", gap: 10 }}>
                        <span>📅 {n.date}</span>
                        <span style={{ color: "rgba(168,85,247,0.65)", fontWeight: 600 }}>{n.ransomwareGroup}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right detail */}
              <div style={{ flex: 1, overflowY: "auto", maxHeight: 700, padding: "24px 28px" }}>
                <h2 className="hfont" style={{ fontSize: 18, fontWeight: 700, color: t.text, lineHeight: 1.35, margin: 0, letterSpacing: "-0.02em", marginBottom: 10 }}>
                  {selectedRw.title}
                </h2>
                <div className="mono" style={{ fontSize: 10, color: t.text30, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <span>📅 {selectedRw.date}</span>
                  <span style={{ color: "#A855F7", fontWeight: 600 }}>{selectedRw.ransomwareGroup}</span>
                  <span style={{ color: t.text40 }}>· {selectedRw.industry}</span>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                  {selectedRw.tags.map((tag, i) => (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: "rgba(168,85,247,0.10)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.20)",
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Article image */}
                <div style={{
                  width: "100%", height: 200, borderRadius: 12, marginBottom: 18,
                  background: t.bgInput, border: `1px solid ${t.borderLight}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span style={{ fontSize: 11, color: t.text15 }}>Article image</span>
                </div>

                {/* AI Insights */}
                <div style={{
                  borderRadius: 12, padding: "16px 18px", marginBottom: 18,
                  background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(168,85,247,0.02) 100%)",
                  border: "1px solid rgba(168,85,247,0.14)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="hfont" style={{ fontSize: 13, fontWeight: 700, color: t.text }}>SOCRadar AI Insights</span>
                  </div>
                  <p style={{ fontSize: 12, color: t.text55, lineHeight: 1.65, marginBottom: 10 }}>{selectedRw.aiAnalysis}</p>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.06em", color: "rgba(168,85,247,0.5)", textTransform: "uppercase", marginBottom: 8 }}>Key Insights</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedRw.keyInsights.map((ins, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, lineHeight: 1.5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#A855F7", marginTop: 6, flexShrink: 0, boxShadow: "0 0 4px rgba(168,85,247,0.5)" }} />
                        <span style={{ color: t.text50 }}>
                          <strong style={{ color: t.text70, fontWeight: 600 }}>{ins.label}:</strong> {ins.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <p style={{ fontSize: 12, lineHeight: 1.7, color: t.text45, marginBottom: 16 }}>{selectedRw.desc}</p>

                {/* Victim summary card */}
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: t.bgCard, border: `1px solid ${t.borderSection}`,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div>
                    <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase", letterSpacing: "0.06em" }}>Victim</span>
                    <div style={{ fontSize: 12, fontWeight: 500, color: t.text60 }}>{selectedRw.victim}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase", letterSpacing: "0.06em" }}>Group</span>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#A855F7" }}>{selectedRw.ransomwareGroup}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
