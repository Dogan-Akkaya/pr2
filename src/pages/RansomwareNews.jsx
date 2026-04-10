import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FilterDropdown } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";

// ── Trend data (12 months) ──
const TREND_DATA = [
  { month: "Apr", attacks: 180 },
  { month: "May", attacks: 210 },
  { month: "Jun", attacks: 245 },
  { month: "Jul", attacks: 390 },
  { month: "Aug", attacks: 420 },
  { month: "Sep", attacks: 365 },
  { month: "Oct", attacks: 310 },
  { month: "Nov", attacks: 290 },
  { month: "Dec", attacks: 265 },
  { month: "Jan", attacks: 285 },
  { month: "Feb", attacks: 298 },
  { month: "Mar", attacks: 312 },
];

// ── Top groups (donut) ──
const TOP_GROUPS = [
  { name: "LockBit", count: 2100, color: "#DC2626" },
  { name: "BlackCat/ALPHV", count: 1400, color: "#EA580C" },
  { name: "Cl0p", count: 980, color: "#F59E0B" },
  { name: "Play", count: 870, color: "#A855F7" },
  { name: "8Base", count: 650, color: "#3B82F6" },
  { name: "Akira", count: 520, color: "#10B981" },
  { name: "Medusa", count: 410, color: "#06B6D4" },
  { name: "NoEscape", count: 380, color: "#EC4899" },
];

const TOTAL_VICTIMS = TOP_GROUPS.reduce((s, g) => s + g.count, 0);

// ── Stat cards ──
const STATS = [
  { label: "Active Groups", value: "47", color: "#DC2626", trend: "+5", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 8v4l3 3" },
  { label: "Victims This Month", value: "312", color: "#A855F7", trend: "+18%", icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 7a4 4 0 108 0 4 4 0 00-8 0M22 21v-2a4 4 0 00-3-3.87" },
  { label: "Countries Affected", value: "68", color: "#F59E0B", trend: "+3", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" },
  { label: "Industries Targeted", value: "23", color: "#3B82F6", trend: "+2", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
];

// ── News items ──
const NEWS = [
  {
    id: 1,
    title: "Dutch hospitals disconnect systems after patient software cyberattack - Cybernews",
    desc: "Several hospitals across the Netherlands were forced to disconnect critical systems after a ransomware attack targeted their shared patient management software platform. The attack, attributed to a sophisticated ransomware group, affected scheduling, electronic health records, and laboratory result systems. Emergency services were temporarily redirected to nearby unaffected facilities while incident response teams worked to contain the breach.",
    date: "07 Apr 2026",
    tags: ["Netherlands", "Healthcare", "Ransomware", "Cyberattack", "Hospitals"],
    tagColors: { "Netherlands": "#DC2626", "Healthcare": "#3B82F6", "Ransomware": "#A855F7", "Cyberattack": "#EA580C", "Hospitals": "#3B82F6" },
    victim: "Dutch Hospital Network Consortium",
    ransomwareGroup: "LockBit",
    country: "NL",
    industry: "Healthcare",
    aiAnalysis: "This incident represents a significant escalation in ransomware targeting of healthcare critical infrastructure in Western Europe. The coordinated attack on shared patient software suggests the threat actors identified a single point of failure in the hospital network's supply chain. The forced disconnection of systems during active patient care creates immediate life-safety risks.",
    keyInsights: [
      { label: "Critical Infrastructure", text: "Healthcare systems in EU face increasing ransomware targeting, with 340% increase in attacks on medical facilities since 2024." },
      { label: "Supply Chain Risk", text: "Shared software platforms create single-point-of-failure vulnerabilities across multiple healthcare institutions." },
      { label: "Operational Disruption", text: "System disconnection during active operations creates patient safety risks and forces manual fallback procedures." },
      { label: "Data Integrity", text: "Electronic health records and lab systems may have been compromised, raising GDPR Article 34 notification obligations." },
    ],
    mitigations: [
      "Implement network segmentation between shared software platforms and critical care systems",
      "Deploy immutable backup solutions with offline recovery capabilities",
      "Establish mutual aid agreements with neighboring facilities for patient diversion protocols",
      "Conduct tabletop exercises specifically modeling ransomware scenarios in healthcare environments",
    ],
  },
  {
    id: 2,
    title: "Cybersecurity and Data Privacy - Dykema",
    desc: "Law firm Dykema reported a cybersecurity incident affecting their client data systems. The firm, which handles sensitive corporate litigation and regulatory matters, discovered unauthorized encryption of file servers containing privileged attorney-client communications. The ransomware operators are demanding payment in cryptocurrency and threatening to publish sensitive legal documents.",
    date: "06 Apr 2026",
    tags: ["United States", "Legal", "Data Privacy", "Law Firm"],
    tagColors: { "United States": "#DC2626", "Legal": "#3B82F6", "Data Privacy": "#A855F7", "Law Firm": "#3B82F6" },
    victim: "Dykema Gossett PLLC",
    ransomwareGroup: "BlackCat/ALPHV",
    country: "US",
    industry: "Legal",
    aiAnalysis: "The targeting of a major law firm presents unique challenges due to attorney-client privilege protections. Exfiltrated legal documents could have cascading impacts across multiple corporate clients and ongoing litigation matters. This attack follows a trend of ransomware operators specifically targeting professional services firms for their high-value client data.",
    keyInsights: [
      { label: "Privileged Data", text: "Attorney-client communications are among the most sensitive data categories, creating extreme leverage for extortion." },
      { label: "Cascading Impact", text: "A single law firm breach can affect hundreds of corporate clients and active litigation matters." },
      { label: "Regulatory Exposure", text: "Multiple state bar associations and data protection regulations may apply depending on client jurisdictions." },
      { label: "Reputational Risk", text: "Professional services firms face existential reputational damage from client data exposure." },
    ],
    mitigations: [
      "Implement zero-trust architecture for document management systems",
      "Deploy endpoint detection and response (EDR) across all endpoints with legal hold capabilities",
      "Establish encrypted communication channels separate from primary email systems",
      "Engage specialized legal-sector incident response retainer",
    ],
  },
  {
    id: 3,
    title: "Minnesota National Guard Responds to Winona County Cyberattack - National Today",
    desc: "The Minnesota National Guard's cyber defense unit was activated to respond to a ransomware attack on Winona County's government systems. County services including property records, court scheduling, and public health databases were encrypted. The attack is believed to have originated through a compromised VPN endpoint used by remote county employees.",
    date: "06 Apr 2026",
    tags: ["United States", "Government", "National Guard", "County Systems"],
    tagColors: { "United States": "#DC2626", "Government": "#3B82F6", "National Guard": "#F59E0B", "County Systems": "#3B82F6" },
    victim: "Winona County, Minnesota",
    ransomwareGroup: "Play",
    country: "US",
    industry: "Government",
    aiAnalysis: "The deployment of National Guard cyber assets to a county-level ransomware incident highlights the growing severity of attacks on local government infrastructure. Municipal and county systems often lack the security budgets of federal agencies, making them prime targets for ransomware operators seeking easier victims with critical public service obligations.",
    keyInsights: [
      { label: "Critical Infrastructure", text: "Local government systems manage essential services that directly impact public safety and civil operations." },
      { label: "Defense Escalation", text: "National Guard cyber unit activation indicates severity beyond normal incident response capabilities." },
      { label: "VPN Vulnerability", text: "Remote access infrastructure remains a primary attack vector for government systems." },
      { label: "Public Impact", text: "Property records, courts, and public health systems offline creates immediate civic disruption." },
    ],
    mitigations: [
      "Replace legacy VPN with zero-trust network access (ZTNA) solutions",
      "Implement multi-factor authentication on all remote access points",
      "Establish state-level cyber mutual aid compacts for rapid response",
      "Deploy automated backup verification and disaster recovery testing",
    ],
  },
  {
    id: 4,
    title: "The risk is real - Transport Engineer",
    desc: "A major European transportation engineering firm disclosed a ransomware incident that disrupted design systems and project management platforms. The attack affected active infrastructure projects across multiple countries, with encrypted CAD files and engineering specifications potentially delaying critical transportation construction timelines by months.",
    date: "05 Apr 2026",
    tags: ["United Kingdom", "Transportation", "Engineering", "Infrastructure"],
    tagColors: { "United Kingdom": "#DC2626", "Transportation": "#3B82F6", "Engineering": "#F59E0B", "Infrastructure": "#3B82F6" },
    victim: "Transport Engineering Corp.",
    ransomwareGroup: "8Base",
    country: "GB",
    industry: "Transportation",
    aiAnalysis: "Ransomware targeting engineering and infrastructure firms creates risks beyond data loss — encrypted design files and project specifications can cause significant delays in public infrastructure projects with cascading economic impact. The specialized nature of CAD and BIM files makes recovery particularly challenging.",
    keyInsights: [
      { label: "Infrastructure Delay", text: "Encrypted engineering files can delay multi-year infrastructure projects, multiplying economic impact." },
      { label: "Specialized Data", text: "CAD/BIM files require specialized recovery procedures and may not be fully recoverable from backups." },
      { label: "Multi-Country Impact", text: "International engineering projects mean single-firm attacks affect multiple national infrastructure programs." },
      { label: "Safety Concerns", text: "Compromised engineering specifications could introduce safety risks if integrity is not verified post-recovery." },
    ],
    mitigations: [
      "Implement air-gapped backup solutions for critical engineering files",
      "Deploy file integrity monitoring on CAD/BIM repositories",
      "Establish cross-project recovery priorities based on construction timeline criticality",
      "Conduct security assessments of engineering software supply chains",
    ],
  },
  {
    id: 5,
    title: "The Frontline of Cyber Warfare: 200,000 Attacks Daily in the Gulf Region",
    desc: "SOCRadar intelligence reveals that Gulf region organizations face over 200,000 cyberattack attempts daily, with ransomware comprising a growing percentage. Critical energy infrastructure, financial services, and government entities are the primary targets. Multiple ransomware groups have established dedicated operations targeting Middle Eastern organizations, exploiting rapid digitization initiatives.",
    date: "05 Apr 2026",
    tags: ["Global", "Energy", "Gulf Region", "Critical Infrastructure"],
    tagColors: { "Global": "#F59E0B", "Energy": "#EA580C", "Gulf Region": "#DC2626", "Critical Infrastructure": "#3B82F6" },
    victim: "Gulf Region Organizations (Multiple)",
    ransomwareGroup: "Multiple Groups",
    country: "AE",
    industry: "Energy",
    aiAnalysis: "The Gulf region's rapid digital transformation combined with geopolitical significance makes it an increasingly attractive target for ransomware operators. The intersection of critical energy infrastructure with advanced IT systems creates unique attack surfaces. State-affiliated and financially motivated groups are both active in this theater.",
    keyInsights: [
      { label: "Attack Volume", text: "200,000+ daily attack attempts indicate sustained, industrialized targeting of Gulf organizations." },
      { label: "Energy Sector Risk", text: "Oil and gas infrastructure attacks carry global economic implications beyond the immediate victims." },
      { label: "Rapid Digitization", text: "Fast-paced digital transformation initiatives may outpace security controls deployment." },
      { label: "Geopolitical Dimension", text: "State-affiliated actors increasingly use ransomware as cover for espionage and disruption operations." },
    ],
    mitigations: [
      "Implement OT/IT network segmentation for critical energy infrastructure",
      "Deploy regional threat intelligence sharing through sector-specific ISACs",
      "Establish ransomware-specific incident response playbooks for energy sector",
      "Conduct red team exercises simulating multi-vector attacks on critical systems",
    ],
  },
  {
    id: 6,
    title: "Krybit Ransomware Attack on Gerald Zisser GmbH - DeXpose",
    desc: "Austrian manufacturing company Gerald Zisser GmbH has been listed as a victim by the emerging Krybit ransomware group. The attackers claim to have exfiltrated 45GB of corporate data including financial records, employee information, and proprietary manufacturing processes. A 7-day deadline has been set for ransom payment before data publication on the group's leak site.",
    date: "04 Apr 2026",
    tags: ["Germany", "Manufacturing", "Data Exfiltration", "SMB"],
    tagColors: { "Germany": "#DC2626", "Manufacturing": "#3B82F6", "Data Exfiltration": "#A855F7", "SMB": "#F59E0B" },
    victim: "Gerald Zisser GmbH",
    ransomwareGroup: "Krybit",
    country: "DE",
    industry: "Manufacturing",
    aiAnalysis: "Krybit is an emerging ransomware group that has rapidly expanded operations targeting European SMBs in the manufacturing sector. Their use of double extortion tactics and relatively short payment deadlines indicates an aggressive operational tempo. Small and medium manufacturers often lack dedicated security teams, making them vulnerable to sophisticated attacks.",
    keyInsights: [
      { label: "Emerging Threat", text: "Krybit is a new ransomware operation with aggressive tactics targeting European manufacturing SMBs." },
      { label: "Double Extortion", text: "45GB data exfiltration combined with encryption maximizes pressure on victims to pay." },
      { label: "IP Theft Risk", text: "Proprietary manufacturing processes, if leaked, could cause permanent competitive damage." },
      { label: "SMB Targeting", text: "Small manufacturers lack security resources but hold valuable intellectual property." },
    ],
    mitigations: [
      "Implement data loss prevention (DLP) controls on sensitive manufacturing IP",
      "Deploy network detection and response (NDR) to identify large-scale data exfiltration",
      "Establish incident response relationships before an attack occurs",
      "Participate in manufacturing sector threat intelligence sharing programs",
    ],
  },
  {
    id: 7,
    title: "LockBit Claims Attack on Major European Manufacturing Firm",
    desc: "The LockBit ransomware group has claimed responsibility for a significant attack on a major European manufacturing conglomerate with operations in 12 countries. The group alleges access to 120GB of corporate data including strategic plans, client contracts, and employee records. This represents one of the largest claimed LockBit attacks in the manufacturing sector this quarter.",
    date: "03 Apr 2026",
    tags: ["Europe", "Manufacturing", "LockBit", "Large Enterprise"],
    tagColors: { "Europe": "#DC2626", "Manufacturing": "#3B82F6", "LockBit": "#A855F7", "Large Enterprise": "#F59E0B" },
    victim: "European Manufacturing Conglomerate",
    ransomwareGroup: "LockBit",
    country: "DE",
    industry: "Manufacturing",
    aiAnalysis: "Despite law enforcement disruptions, LockBit continues to target high-value manufacturing enterprises. The 120GB claimed exfiltration from a 12-country operation represents a significant intelligence windfall. Strategic plans and client contracts from a major conglomerate could affect competitive dynamics across multiple industries.",
    keyInsights: [
      { label: "Persistence", text: "LockBit remains operational despite multiple law enforcement actions, demonstrating resilience." },
      { label: "Scale of Impact", text: "12-country operations affected means regulatory notifications required across multiple jurisdictions." },
      { label: "Strategic Data", text: "Corporate strategic plans and client contracts represent high-value intelligence for competitors." },
      { label: "Supply Chain", text: "Major manufacturer disruption creates ripple effects across downstream supply chains." },
    ],
    mitigations: [
      "Implement privileged access management (PAM) across all administrative accounts",
      "Deploy microsegmentation to limit lateral movement in multinational networks",
      "Establish coordinated incident response across all country operations",
      "Conduct LockBit-specific threat hunting using published IOCs",
    ],
  },
  {
    id: 8,
    title: "Cl0p Exploits MOVEit Vulnerability to Target Financial Sector",
    desc: "The Cl0p ransomware group has launched a new wave of attacks exploiting a recently disclosed vulnerability in MOVEit file transfer software. Multiple financial institutions across North America and Europe are confirmed affected. The group is leveraging automated exploitation tools to rapidly compromise exposed instances before patches can be applied.",
    date: "02 Apr 2026",
    tags: ["Global", "Finance", "Cl0p", "MOVEit", "Zero-Day"],
    tagColors: { "Global": "#F59E0B", "Finance": "#3B82F6", "Cl0p": "#A855F7", "MOVEit": "#EA580C", "Zero-Day": "#DC2626" },
    victim: "Multiple Financial Institutions",
    ransomwareGroup: "Cl0p",
    country: "US",
    industry: "Finance",
    aiAnalysis: "Cl0p's continued exploitation of file transfer vulnerabilities demonstrates a refined operational model focused on supply chain compromise. The financial sector targeting maximizes both ransom leverage and data value. Automated exploitation tooling allows the group to compromise hundreds of targets within days of vulnerability disclosure.",
    keyInsights: [
      { label: "Supply Chain Attack", text: "File transfer software compromise enables mass exploitation across the entire customer base." },
      { label: "Speed of Exploitation", text: "Automated tools allow Cl0p to outpace most organizations' patching capabilities." },
      { label: "Financial Data", text: "Banking and financial data commands premium prices on dark web markets." },
      { label: "Regulatory Impact", text: "Financial sector breaches trigger multiple regulatory frameworks (GLBA, PCI-DSS, DORA)." },
    ],
    mitigations: [
      "Immediately patch MOVEit installations or apply vendor-provided workarounds",
      "Audit file transfer solutions for exposure and implement network-level access controls",
      "Monitor for indicators of compromise specific to Cl0p exploitation patterns",
      "Implement web application firewalls (WAF) rules for known exploit signatures",
    ],
  },
];

// ── Derive filter option lists from data ──
const COUNTRY_NAMES = ["Netherlands", "United States", "United Kingdom", "Germany", "Global", "Europe"];
const ALL_INDUSTRIES = [...new Set(NEWS.map(n => n.industry).filter(Boolean))];
const ALL_COUNTRIES = [...new Set(NEWS.flatMap(n => n.tags.filter(t => COUNTRY_NAMES.includes(t))))];
const ALL_GROUPS = [...new Set(NEWS.map(n => n.ransomwareGroup).filter(Boolean))];

// ── MiniDonut SVG ──
function MiniDonut({ groups, size = 140, t }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 12;
  const total = groups.reduce((s, g) => s + g.count, 0);
  let cumAngle = -90;
  const arcs = groups.map((g) => {
    const angle = (g.count / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
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
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} opacity={0.85} style={{ transition: "opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.85"}
        />
      ))}
      <circle cx={cx} cy={cy} r={innerR} fill="#0C1021" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={t.text} fontSize="14" fontWeight="800" fontFamily="'Plus Jakarta Sans',sans-serif">{(total / 1000).toFixed(1)}K</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={t.text35} fontSize="8" fontFamily="'JetBrains Mono',monospace" textTransform="uppercase">TOTAL</text>
    </svg>
  );
}

// ── NewsCard ──
function NewsCard({ item, isActive, onClick, t }) {
  const typeColor = "#A855F7";
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
        borderLeft: isActive ? `3px solid ${typeColor}` : "3px solid transparent",
        background: isActive ? "rgba(168,85,247,0.04)" : "transparent",
        borderBottom: `1px solid ${t.borderSection}`,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.bgCard; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? "rgba(168,85,247,0.04)" : "transparent"; }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{
          width: 80, height: 56, borderRadius: 6, flexShrink: 0,
          background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 600, background: "rgba(168,85,247,0.12)", color: "#A855F7", marginBottom: 5, fontFamily: "'Satoshi',sans-serif" }}>Ransomware News</div>
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4, color: t.text70, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</div>
          <div className="mono" style={{ fontSize: 9, color: t.text25 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {item.date}
            {item.ransomwareGroup && (
              <span style={{ marginLeft: 8, color: "rgba(168,85,247,0.5)" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 3, verticalAlign: "middle" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {item.ransomwareGroup}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tooltip (moved into component) ──

// ═══════════════════════════════════════
export default function RansomwareNews() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [selIndustries, setSelIndustries] = useState(new Set());
  const [selCountries, setSelCountries] = useState(new Set());
  const [selGroups, setSelGroups] = useState(new Set());
  const [insightsExpanded, setInsightsExpanded] = useState(true);

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

  const filteredNews = NEWS.filter(n => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.desc.toLowerCase().includes(q) && !n.ransomwareGroup.toLowerCase().includes(q)) return false;
    }
    // Industry filter (multi-select)
    if (selIndustries.size > 0 && !selIndustries.has(n.industry)) return false;
    // Country filter (multi-select, match against tags)
    if (selCountries.size > 0 && !n.tags.some(tg => selCountries.has(tg))) return false;
    // Group filter (multi-select)
    if (selGroups.size > 0 && !selGroups.has(n.ransomwareGroup)) return false;
    return true;
  }).slice(0, showAll ? undefined : 4);

  // Keep selected article in sync with filtered list
  const selectedArticle = filteredNews.find(n => n.id === selectedId) || filteredNews[0] || NEWS[0];
  useEffect(() => {
    if (filteredNews.length > 0 && !filteredNews.find(n => n.id === selectedId)) {
      setSelectedId(filteredNews[0].id);
    }
  }, [filteredNews, selectedId]);

  // Reset insights expanded state when article changes
  useEffect(() => {
    setInsightsExpanded(true);
  }, [selectedArticle?.id]);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* 1. TOP DASHBOARD ROW */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Left: Ransomware Trend */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>12-Month Overview</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Ransomware Attack Trend</span>
          </div>
          <div style={{ padding: "12px 12px 0" }}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={TREND_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                <Tooltip {...ttS} />
                <Area type="monotone" dataKey="attacks" stroke="#A855F7" strokeWidth={2} fill="url(#purpleGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: "10px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: t.text50 }}>Attacks This Month:</span>
            <span className="hfont" style={{ fontSize: 20, fontWeight: 800, color: "#A855F7" }}>312</span>
          </div>
        </div>

        {/* Right: Top Ransomware Groups Donut */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Threat Landscape</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Top Ransomware Groups</span>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 24 }}>
            <MiniDonut groups={TOP_GROUPS} size={140} t={t} />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {TOP_GROUPS.map((g, i) => (
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
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {STATS.map((s, i) => (
          <div key={i} className="glass" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${s.color}10`, border: `1px solid ${s.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </div>
              <span style={{ fontSize: 11, color: t.text40 }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="hfont" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</span>
              <span className="mono" style={{ fontSize: 10, color: "#10B981" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: "middle", marginRight: 2 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
                {s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. FILTER BAR + NEWS FEED */}
      <div className="glass" style={{
        overflow: "hidden",
        animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        {/* Filter bar */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Type badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
            background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#A855F7" }}>Ransomware News</span>
          </div>

          {/* Show All toggle */}
          <div
            onClick={() => setShowAll(!showAll)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
              background: showAll ? "rgba(168,85,247,0.06)" : t.bgInput,
              border: `1px solid ${showAll ? "rgba(168,85,247,0.15)" : t.borderLight}`,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${showAll ? "#A855F7" : t.text25}`,
              background: showAll ? "#A855F7" : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {showAll && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span style={{ fontSize: 11, color: showAll ? t.text70 : t.text40 }}>Show All</span>
          </div>

          {/* Filter dropdowns */}
          <FilterDropdown label="Industries" options={ALL_INDUSTRIES} selected={selIndustries} onSelectionChange={setSelIndustries} accentColor="#A855F7" />
          <FilterDropdown label="Countries" options={ALL_COUNTRIES} selected={selCountries} onSelectionChange={setSelCountries} accentColor="#A855F7" />
          <FilterDropdown label="Ransomware Groups" options={ALL_GROUPS} selected={selGroups} onSelectionChange={setSelGroups} accentColor="#A855F7" total={126} />

          {/* Share Type label (static, no dropdown) */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
            background: t.bgInput, border: `1px solid ${t.borderLight}`,
            fontSize: 11, color: t.text45,
          }}>
            Share Type
            <span className="mono" style={{ fontSize: 9, color: t.text25 }}>0/2</span>
          </div>

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search ransomware news..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "7px 12px 7px 30px", fontSize: 11,
                fontFamily: "'Satoshi',sans-serif", background: t.bgInput,
                border: `1px solid ${t.borderLight}`, borderRadius: 8,
                color: t.text, outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(168,85,247,0.3)"}
              onBlur={e => e.target.style.borderColor = t.borderLight}
            />
          </div>
        </div>

        {/* 4. MASTER-DETAIL NEWS FEED */}
        <div style={{ display: "flex", minHeight: 520 }}>
          {/* Left: news list */}
          <div style={{ width: 400, flexShrink: 0, borderRight: `1px solid ${t.borderSection}`, overflow: "auto", maxHeight: 620 }}>
            {filteredNews.length > 0 ? filteredNews.map((item) => (
              <NewsCard key={item.id} item={item} isActive={selectedId === item.id} onClick={() => setSelectedId(item.id)} t={t} />
            )) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: t.text25, fontSize: 12 }}>
                No results found{searchQuery ? ` for "${searchQuery}"` : ""}{selIndustries.size > 0 ? ` in selected industries` : ""}{selGroups.size > 0 ? ` by selected groups` : ""}
              </div>
            )}
          </div>

          {/* Right: detail */}
          <div style={{ flex: 1, padding: "20px 24px", overflow: "auto", maxHeight: 620, position: "relative" }}>
            {/* Close button */}
            <button
              onClick={() => setSelectedId(null)}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 28, height: 28, borderRadius: 7, border: `1px solid ${t.borderLight}`,
                background: t.bgHover, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.borderMed}
              onMouseLeave={e => e.currentTarget.style.background = t.bgHover}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="hfont" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.35, marginBottom: 8, paddingRight: 36 }}>
              {selectedArticle.title}
            </h3>

            {/* Date */}
            <div className="mono" style={{ fontSize: 10, color: t.text30, marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {selectedArticle.date}
              </span>
              <span style={{ color: "rgba(168,85,247,0.5)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: "middle" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {selectedArticle.ransomwareGroup}
              </span>
            </div>

            {/* Tag pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
              {selectedArticle.tags.map((tag, i) => {
                const tc = selectedArticle.tagColors?.[tag] || "#A855F7";
                return (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                    background: `${tc}12`, border: `1px solid ${tc}25`, color: tc,
                  }}>{tag}</span>
                );
              })}
            </div>

            {/* Article Image Placeholder */}
            <div style={{
              width: "100%", height: 220, borderRadius: 12, marginBottom: 18,
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

            {/* SOCRadar AI Insights Card */}
            <div style={{
              marginBottom: 18, borderRadius: 12, overflow: "hidden",
              background: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(168,85,247,0.02) 100%)",
              border: "1px solid rgba(168,85,247,0.12)",
            }}>
              {/* Header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: insightsExpanded ? "1px solid rgba(168,85,247,0.08)" : "none" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 28 28"><circle cx="14" cy="14" r="6" fill="#A855F7" opacity="0.85" /><circle cx="14" cy="14" r="2.5" fill="#0C1021" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#A855F7" }}>SOCRadar</div>
                  <div style={{ fontSize: 11, color: t.text35 }}>AI Insights</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>AI GENERATED</span>
                  <button
                    onClick={() => setInsightsExpanded(!insightsExpanded)}
                    style={{
                      padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(168,85,247,0.15)",
                      background: "rgba(168,85,247,0.06)", cursor: "pointer",
                      fontSize: 10, fontWeight: 500, color: "#A855F7",
                      fontFamily: "'Satoshi',sans-serif", display: "flex", alignItems: "center", gap: 4,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,0.12)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(168,85,247,0.06)"}
                  >
                    {insightsExpanded ? "Collapse" : "Read More"}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: insightsExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* AI Analysis (collapsible) */}
              <div style={{
                maxHeight: insightsExpanded ? 600 : 0,
                overflow: "hidden",
                transition: "max-height 0.35s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: 12.5, color: t.text55, lineHeight: 1.7, marginBottom: 14 }}>
                    {selectedArticle.aiAnalysis}
                  </p>

                  {/* Key Insights */}
                  <div className="mono" style={{ fontSize: 9, letterSpacing: "0.06em", color: "rgba(168,85,247,0.5)", textTransform: "uppercase", marginBottom: 8 }}>Key Insights</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedArticle.keyInsights.map((insight, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                          background: "#A855F7", boxShadow: "0 0 6px rgba(168,85,247,0.5)",
                        }} />
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: t.text70 }}>{insight.label}: </span>
                          <span style={{ fontSize: 11, color: t.text45, lineHeight: 1.5 }}>{insight.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mitigation Strategies */}
            <div style={{ marginBottom: 18 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Mitigation Strategies</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedArticle.mitigations.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ fontSize: 12, color: t.text50, lineHeight: 1.5 }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full article body */}
            <div style={{ borderTop: `1px solid ${t.borderSection}`, paddingTop: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: t.text50, lineHeight: 1.75 }}>
                {selectedArticle.desc}
              </p>
            </div>

            {/* Victim info line */}
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: t.bgCard, border: `1px solid ${t.borderSection}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <div>
                <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase", letterSpacing: "0.06em" }}>Victim</span>
                <div style={{ fontSize: 12, fontWeight: 500, color: t.text60 }}>{selectedArticle.victim}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase", letterSpacing: "0.06em" }}>Group</span>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#A855F7" }}>{selectedArticle.ransomwareGroup}</div>
              </div>
              <div style={{ marginLeft: 16, textAlign: "right" }}>
                <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase", letterSpacing: "0.06em" }}>Industry</span>
                <div style={{ fontSize: 12, fontWeight: 500, color: t.text50 }}>{selectedArticle.industry}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
