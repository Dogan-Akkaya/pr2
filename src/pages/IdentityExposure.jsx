import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SortHeader, useSort, usePagination, Pagination, exportCSV, ExportButton, RowChevron, CopyCell, TimeCell, stickyHeaderStyle, useSelection, Checkbox, BulkActionBar, useTimeRange, TimeRangeFilter } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";

// ── Timeline Data ──
const TIMELINE = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2025, 2, 26 + i * 5);
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const spike = i === 3 ? 280 : i === 4 ? 180 : 0;
  const count = Math.round(30 + Math.random() * 40 + spike);
  let cumulative = 0;
  return { date: label, count };
});

// Add cumulative field
let _cum = 0;
TIMELINE.forEach(t => { _cum += t.count; t.cumulative = _cum; });

// ── Record Statuses ──
const RECORD_STATUS = [
  { label: "Open", count: 711, color: "#E8463A" },
  { label: "Closed", count: 1, color: "#3B82F6" },
];

// ── Top Alarm Generated Accounts ──
const TOP_ACCOUNTS = [
  { label: "gabriel@gmail.com", count: 277, color: "#E8463A", strength: "WEAK", source: "Stealer Log", time: "2025-10-19" },
  { label: "kevin.koestoro@jtrust...", count: 18, color: "#A855F7", strength: "WEAK", source: "Combo List", time: "2025-09-15" },
  { label: "edy@jtrustbank.co.id", count: 9, color: "#3B82F6", strength: "MEDIUM", source: "Breach DB", time: "2025-09-09" },
  { label: "recruit@bm.co.id", count: 8, color: "#F59E0B", strength: "MEDIUM", source: "Stealer Log", time: "2025-08-28" },
  { label: "s.admin@jtrustbank.co.id", count: 7, color: "#10B981", strength: "STRONG", source: "Combo List", time: "2025-08-22" },
];

// ── Leaked Credentials (PII Exposure) ──
const LEAKED_CREDS = [
  { id: 1, email: "ali.uzun@socradar.io", source: "https://t.me/-1001467443345/77714", password: "4****l", status: "Open", discoveryDate: "2025-10-19", breachDate: "2024-10-18", alarmId: 78012340 },
  { id: 2, email: "tibarus@jtrustbank.co.id", source: "https://t.me/groupcracked/2202", password: "1****6", status: "Open", discoveryDate: "2025-09-09", breachDate: "2024-04-10", alarmId: 77945100 },
  { id: 3, email: "tri.setiawan@jtrustbank.co.id", source: "https://t.me/groupcracked/2202", password: "J****l", status: "Open", discoveryDate: "2025-09-09", breachDate: "2024-04-10", alarmId: 77945098 },
  { id: 4, email: "s.admin@jtrustbank.co.id", source: "https://t.me/-1002063458789/2447", password: "s****d", status: "Open", discoveryDate: "2025-09-08", breachDate: "2024-10-04", alarmId: 77940200 },
  { id: 5, email: "hidayatullah@jtrustbank.co.id", source: "https://t.me/-1001945647265/2109", password: "J****l", status: "Open", discoveryDate: "2025-09-08", breachDate: "2024-10-16", alarmId: 77940195 },
  { id: 6, email: "v.walker@greenanimalsbank.com", source: "https://t.me/-1001389201445/8823", password: "V****!", status: "Open", discoveryDate: "2025-08-22", breachDate: "2024-09-15", alarmId: 77920100 },
  { id: 7, email: "g.barnett@greenanimalsbank.com", source: "https://t.me/leaked_databases_2024/1102", password: "G****3", status: "Open", discoveryDate: "2025-08-20", breachDate: "2024-08-30", alarmId: 77918050 },
  { id: 8, email: "finance@greenanimalsbank.com", source: "https://t.me/-1001502938475/4521", password: "F****$", status: "Open", discoveryDate: "2025-08-18", breachDate: "2024-07-22", alarmId: 77915000 },
  { id: 9, email: "admin@greenanimalsbank.com", source: "https://t.me/groupcracked/1890", password: "A****9", status: "Closed", discoveryDate: "2025-08-15", breachDate: "2024-06-10", alarmId: 77910200 },
  { id: 10, email: "ops@greenanimalsbank.com", source: "https://t.me/-1001234567890/3312", password: "O****k", status: "Open", discoveryDate: "2025-08-12", breachDate: "2024-05-28", alarmId: 77905100 },
];

// ── Channel Mentions (IM Content) ──
const CHANNEL_MENTIONS = [
  { id: 1, platform: "Telegram", assets: ["socradar"], source: "https://t.me/7804302541/1031598", status: "Open", date: "2025-12-08", alarmId: 78150200 },
  { id: 2, platform: "Telegram", assets: ["socradar"], source: "https://t.me/7795318079/1002211", status: "Open", date: "2025-11-27", alarmId: 78140100 },
  { id: 3, platform: "Telegram", assets: ["socradar.com"], source: "https://t.me/-1003190004766/210", status: "Open", date: "2025-10-29", alarmId: 78120050 },
  { id: 4, platform: "Telegram", assets: ["socradar.io"], source: "https://t.me/-1002498832653/431", status: "Open", date: "2025-10-28", alarmId: 78118000 },
  { id: 5, platform: "Telegram", assets: ["socradar.io"], source: "https://t.me/-1002498832653/431", status: "Open", date: "2025-10-28", alarmId: 78117990 },
  { id: 6, platform: "Telegram", assets: ["greenanimalsbank"], source: "https://t.me/-1001892034567/892", status: "Open", date: "2025-10-25", alarmId: 78112000 },
  { id: 7, platform: "Telegram", assets: ["greenanimalsbank.com"], source: "https://t.me/dark_leaks_2025/4521", status: "Open", date: "2025-10-22", alarmId: 78108500 },
  { id: 8, platform: "Discord", assets: ["socradar", "socradar.com"], source: "https://discord.gg/leaked-data", status: "Open", date: "2025-10-18", alarmId: 78100200 },
];

// ── Mini Donut ──
function MiniDonut({ segments, size = 100 }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.count / total : 0;
        const offset = cumulative; cumulative += pct;
        return <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="12" strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={-offset * circ} transform="rotate(-90 50 50)" />;
      })}
      <text x="50" y="48" textAnchor="middle" dominantBaseline="central" fill="#E8ECF1" fontSize="14" fontWeight="800" fontFamily="'Plus Jakarta Sans'">{total}</text>
    </svg>
  );
}

const LEAKED_CSV = [
  { label: "Email", field: "email" }, { label: "Source", field: "source" }, { label: "Password", field: "password" },
  { label: "Status", field: "status" }, { label: "Discovery Date", field: "discoveryDate" },
  { label: "Breach Date", field: "breachDate" }, { label: "Alarm ID", field: "alarmId" },
];
const MENTION_CSV = [
  { label: "Platform", field: "platform" }, { label: "Source", field: "source" },
  { label: "Status", field: "status" }, { label: "Date", field: "date" }, { label: "Alarm ID", field: "alarmId" },
];

const STR_COL = { WEAK: "#DC2626", MEDIUM: "#CA8A04", STRONG: "#16A34A" };
const PW_STRENGTH = [
  { label: "Weak", count: 487, color: "#DC2626" },
  { label: "Medium", count: 183, color: "#CA8A04" },
  { label: "Strong", count: 42, color: "#16A34A" },
];

// ═══════════════════════════════════════
export default function IdentityExposure() {
  const { t } = useTheme();
  const ttS = {
    contentStyle: { background: "rgba(12,16,28,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", backdropFilter: "blur(20px)", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", padding: "10px 14px" },
    itemStyle: { color: t.text, padding: "2px 0" }, labelStyle: { color: t.text50, marginBottom: 4, fontWeight: 600 },
  };
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("leaked");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeakedId, setSelectedLeakedId] = useState(null);
  const [selectedMentionId, setSelectedMentionId] = useState(null);
  const leakedSort = useSort("discoveryDate", "desc");
  const mentionSort = useSort("date", "desc");
  const leakedSel = useSelection("id");
  const mentionSel = useSelection("id");
  const activeSel = tab === "leaked" ? leakedSel : mentionSel;
  const { range, setRange, filterByRange } = useTimeRange("All");
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filteredLeaked = leakedSort.sortData(filterByRange(LEAKED_CREDS.filter(r => !searchQuery || r.email.toLowerCase().includes(searchQuery.toLowerCase()) || r.source.toLowerCase().includes(searchQuery.toLowerCase())), "discoveryDate"));
  const filteredMentions = mentionSort.sortData(filterByRange(CHANNEL_MENTIONS.filter(r => !searchQuery || r.assets.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) || r.platform.toLowerCase().includes(searchQuery.toLowerCase())), "date"));
  const activeData = tab === "leaked" ? filteredLeaked : filteredMentions;
  const leakedPag = usePagination(filteredLeaked.length, 10);
  const mentionPag = usePagination(filteredMentions.length, 10);
  const activePag = tab === "leaked" ? leakedPag : mentionPag;
  const pageData = activePag.paginate(activeData);
  const selectedLeaked = LEAKED_CREDS.find(r => r.id === selectedLeakedId);
  const selectedMention = CHANNEL_MENTIONS.find(r => r.id === selectedMentionId);

  const bulkActions = [
    { label: "Mark Resolved", icon: "M20 6L9 17l-5-5", primary: true, onClick: () => activeSel.clear() },
    { label: "Export Selected", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", onClick: () => { exportCSV(activeData.filter(r => activeSel.isSelected(r.id)), tab === "leaked" ? LEAKED_CSV : MENTION_CSV, `identity-${tab}-selected.csv`); } },
    { label: "Assign", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", onClick: () => { alert("Assigning " + activeSel.count + " items to analyst..."); activeSel.clear(); } },
  ];

  const totalRecords = RECORD_STATUS.reduce((s, r) => s + r.count, 0);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ SECTION 1: HERO BANNER ═══ */}
      <div className="glass" style={{ overflow: "hidden", animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          {/* Left side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(232,70,58,0.08)", border: "1px solid rgba(232,70,58,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#E8463A", textTransform: "uppercase", fontWeight: 600 }}>Identity Exposure</span>
                <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 9, fontWeight: 700, background: "rgba(232,70,58,0.12)", color: "#E8463A", fontFamily: "'JetBrains Mono',monospace" }}>711 open</span>
              </div>
              <span style={{ fontSize: 12, color: t.text40, lineHeight: 1.4 }}>Credential exposure tracking across stealer logs, combo lists, and breach databases</span>
            </div>
          </div>
          {/* Right side: 4 inline stats */}
          <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
            {[
              { label: "Total Records", value: "712", color: "#E8ECF1" },
              { label: "Open", value: "711", color: "#E8463A" },
              { label: "Closed", value: "1", color: "#3B82F6" },
              { label: "Weak Passwords", value: "487", color: "#DC2626" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                <div className="hfont" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: t.text35, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: CHARTS ROW ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>

        {/* Credential Timeline */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Credential Timeline</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>New exposure records over time</span>
          </div>
          <div style={{ padding: "16px 16px 8px" }}>
            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 12, paddingLeft: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 3, borderRadius: 2, background: "#3B82F6" }} />
                <span style={{ fontSize: 10, color: t.text40 }}>New Records</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 3, borderRadius: 2, background: "#E8463A" }} />
                <span style={{ fontSize: 10, color: t.text40 }}>Cumulative</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={TIMELINE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} interval={3} tick={{ fontSize: 9, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} width={34} tick={{ fontSize: 9, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} width={40} tick={{ fontSize: 9, fill: t.text30, fontFamily: "'JetBrains Mono',monospace" }} />
                <Tooltip {...ttS} />
                <Area yAxisId="left" type="monotone" dataKey="count" name="New Records" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.06} strokeWidth={2} dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative" stroke="#E8463A" fill="#E8463A" fillOpacity={0.04} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Record Statuses */}
        <div className="glass" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Record Statuses</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>{totalRecords} total credential records</span>
          </div>
          <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Donut + percentages */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, justifyContent: "center", marginBottom: 20 }}>
              <MiniDonut segments={RECORD_STATUS} size={130} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {RECORD_STATUS.map((s, i) => {
                  const pct = totalRecords > 0 ? ((s.count / totalRecords) * 100).toFixed(1) : "0";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                      <div>
                        <div style={{ fontSize: 12, color: t.text60, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span className="hfont" style={{ fontSize: 18, fontWeight: 800 }}>{s.count}</span>
                          <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Password Strength Distribution */}
            <div style={{ borderTop: `1px solid ${t.borderSection}`, paddingTop: 16 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Password Strength Distribution</div>
              <div style={{ display: "flex", gap: 16 }}>
                {PW_STRENGTH.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}50` }} />
                    <span style={{ fontSize: 11, color: t.text50 }}>{p.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: t.text60, fontWeight: 600 }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 3: BOTTOM ROW ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>

        {/* Top Alarm Generated Accounts */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Top Alarm Generated Accounts</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Most exposed identities</span>
          </div>
          <div style={{ padding: "4px 0" }}>
            {TOP_ACCOUNTS.map((a, i) => (
              <div key={i} className="trow" style={{ display: "grid", gridTemplateColumns: "28px 1fr auto auto", gap: 10, alignItems: "center", padding: "14px 20px" }}>
                {/* Rank */}
                <div style={{ width: 24, height: 24, borderRadius: 7, background: i === 0 ? "rgba(232,70,58,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? "rgba(232,70,58,0.2)" : "rgba(255,255,255,0.05)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "#E8463A" : t.text40 }}>{i + 1}</span>
                </div>
                {/* Email + meta */}
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.label}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: t.text30 }}>{a.source}</span>
                    <span style={{ fontSize: 10, color: t.text25 }}>{a.time}</span>
                  </div>
                </div>
                {/* Strength badge */}
                <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", background: `${STR_COL[a.strength]}10`, color: STR_COL[a.strength], fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase" }}>{a.strength}</span>
                {/* Alarm count */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: t.text60 }}>{a.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaked Credentials / Channel Mentions */}
        <div className="glass" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Leaked Credentials</span>
                <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{activeData.length} total</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={`tab-btn ${tab === "leaked" ? "on" : ""}`} onClick={() => { setTab("leaked"); setSearchQuery(""); }}>Leaked Credentials</button>
                <button className={`tab-btn ${tab === "mentions" ? "on" : ""}`} onClick={() => { setTab("mentions"); setSearchQuery(""); }}>Channel Mentions</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center", minWidth: 0 }}>
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tab === "leaked" ? "Search by email or source..." : "Search by asset or platform..."} style={{ width: "100%", padding: "8px 12px 8px 34px", fontSize: 11, fontFamily: "'Satoshi',sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 8, color: t.text, outline: "none" }} />
              </div>
              <TimeRangeFilter range={range} onRangeChange={setRange} />
              <ExportButton onClick={() => exportCSV(activeData, tab === "leaked" ? LEAKED_CSV : MENTION_CSV, `identity-${tab}-export.csv`)} />
            </div>
          </div>

          {/* Leaked Credentials Table */}
          {tab === "leaked" && (<>
            <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "28px 1fr 1fr 70px 60px 90px 90px 70px", gap: 6, borderBottom: `1px solid ${t.borderRow}`, ...stickyHeaderStyle, alignItems: "center" }}>
              <Checkbox checked={activeSel.allSelected(pageData)} indeterminate={activeSel.count > 0 && !activeSel.allSelected(pageData)} onChange={() => activeSel.toggleAll(pageData)} />
              <SortHeader label="Email" field="email" sortField={leakedSort.sortField} sortDir={leakedSort.sortDir} onSort={leakedSort.onSort} />
              <SortHeader label="Source" field="source" sortField={leakedSort.sortField} sortDir={leakedSort.sortDir} onSort={leakedSort.onSort} />
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Password</span>
              <SortHeader label="Status" field="status" sortField={leakedSort.sortField} sortDir={leakedSort.sortDir} onSort={leakedSort.onSort} />
              <SortHeader label="Discovery" field="discoveryDate" sortField={leakedSort.sortField} sortDir={leakedSort.sortDir} onSort={leakedSort.onSort} />
              <SortHeader label="Breach" field="breachDate" sortField={leakedSort.sortField} sortDir={leakedSort.sortDir} onSort={leakedSort.onSort} />
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Alarm</span>
            </div>
            {leakedPag.paginate(filteredLeaked).map(r => (
              <div key={r.id} onClick={() => setSelectedLeakedId(r.id)} className="trow" style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 70px 60px 90px 90px 70px", gap: 6, alignItems: "center", padding: "10px 20px", cursor: "pointer", background: activeSel.isSelected(r.id) ? "rgba(232,70,58,0.04)" : selectedLeakedId === r.id ? "rgba(232,70,58,0.04)" : undefined, borderLeft: selectedLeakedId === r.id ? "3px solid #E8463A" : "3px solid transparent" }}>
                <Checkbox checked={activeSel.isSelected(r.id)} onChange={() => activeSel.toggle(r.id)} />
                <CopyCell value={r.email} style={{ fontSize: 11, color: t.text60, overflow: "hidden" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                </CopyCell>
                <CopyCell value={r.source} style={{ overflow: "hidden" }}>
                  <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%" }}>{r.source}</span>
                </CopyCell>
                <span className="mono" style={{ fontSize: 10, color: t.text40 }}>{r.password}</span>
                <span className="tag" style={{ background: r.status === "Open" ? "rgba(22,163,74,0.08)" : "rgba(255,255,255,0.04)", color: r.status === "Open" ? "#16A34A" : "rgba(232,236,241,0.3)", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 3 }}>{r.status} <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
                <TimeCell date={r.discoveryDate} />
                <TimeCell date={r.breachDate} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#E8463A", fontSize: 9, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>Open <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></span>
              </div>
            ))}
          </>)}

          {/* Channel Mentions Table */}
          {tab === "mentions" && (<>
            <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "28px 80px 1fr 1fr 60px 90px 70px", gap: 6, borderBottom: `1px solid ${t.borderRow}`, ...stickyHeaderStyle, alignItems: "center" }}>
              <Checkbox checked={activeSel.allSelected(pageData)} indeterminate={activeSel.count > 0 && !activeSel.allSelected(pageData)} onChange={() => activeSel.toggleAll(pageData)} />
              <SortHeader label="Platform" field="platform" sortField={mentionSort.sortField} sortDir={mentionSort.sortDir} onSort={mentionSort.onSort} />
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Related Assets</span>
              <SortHeader label="Source" field="source" sortField={mentionSort.sortField} sortDir={mentionSort.sortDir} onSort={mentionSort.onSort} />
              <SortHeader label="Status" field="status" sortField={mentionSort.sortField} sortDir={mentionSort.sortDir} onSort={mentionSort.onSort} />
              <SortHeader label="Discovery" field="date" sortField={mentionSort.sortField} sortDir={mentionSort.sortDir} onSort={mentionSort.onSort} />
              <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Alarm</span>
            </div>
            {mentionPag.paginate(filteredMentions).map(r => (
              <div key={r.id} onClick={() => setSelectedMentionId(r.id)} className="trow" style={{ display: "grid", gridTemplateColumns: "28px 80px 1fr 1fr 60px 90px 70px", gap: 6, alignItems: "center", padding: "10px 20px", cursor: "pointer", background: activeSel.isSelected(r.id) ? "rgba(232,70,58,0.04)" : selectedMentionId === r.id ? "rgba(232,70,58,0.04)" : undefined, borderLeft: selectedMentionId === r.id ? "3px solid #E8463A" : "3px solid transparent" }}>
                <Checkbox checked={activeSel.isSelected(r.id)} onChange={() => activeSel.toggle(r.id)} />
                <span style={{ fontSize: 11, color: t.text60 }}>{r.platform}</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {r.assets.map((a, ai) => (
                    <span key={ai} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 500, background: "rgba(21,27,46,0.9)", border: `1px solid ${t.borderStrong}`, color: t.text70, fontFamily: "'JetBrains Mono',monospace" }}>{a}</span>
                  ))}
                </div>
                <CopyCell value={r.source} style={{ overflow: "hidden" }}>
                  <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%" }}>{r.source}</span>
                </CopyCell>
                <span className="tag" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 3 }}>{r.status} <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
                <TimeCell date={r.date} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#E8463A", fontSize: 9, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }}>Open <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></span>
              </div>
            ))}
          </>)}

          {/* Pagination */}
          <Pagination
            page={activePag.page} totalPages={activePag.totalPages} startIdx={activePag.startIdx} endIdx={activePag.endIdx}
            totalItems={activeData.length} onPrev={activePag.prev} onNext={activePag.next} onGoTo={activePag.goTo}
            perPage={activePag.perPage} onPerPageChange={activePag.setPerPage}
          />
          <BulkActionBar count={activeSel.count} onClear={activeSel.clear} actions={bulkActions} />
        </div>
      </div>

      {/* ═══ LEAKED CREDENTIAL DETAIL PANEL ═══ */}
      {selectedLeaked && (
        <>
          <div onClick={() => setSelectedLeakedId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, overflow: "auto", zIndex: 51, background: t.bgPanel, backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`, animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z"/></svg>
                  </div>
                  <div>
                    <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Leaked Credential</span>
                    <div style={{ fontSize: 12, color: "#DC2626", marginTop: 2 }}>PII Exposure</div>
                  </div>
                </div>
                <button onClick={() => setSelectedLeakedId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>
              {[
                { label: "Email", value: selectedLeaked.email, copyable: true },
                { label: "Password", value: selectedLeaked.password },
                { label: "Status", value: selectedLeaked.status },
                { label: "Discovery Date", value: selectedLeaked.discoveryDate },
                { label: "Breach Date", value: selectedLeaked.breachDate },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  {row.copyable ? (
                    <CopyCell value={row.value} style={{ fontSize: 12, color: t.text60 }} />
                  ) : (
                    <span style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                  )}
                </div>
              ))}
              <div style={{ padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55, display: "block", marginBottom: 6 }}>Source</span>
                <CopyCell value={selectedLeaked.source} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#3B82F6", wordBreak: "break-all" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>Related Alarm ID</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{selectedLeaked.alarmId}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ cursor: "pointer" }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ CHANNEL MENTION DETAIL PANEL ═══ */}
      {selectedMention && (
        <>
          <div onClick={() => setSelectedMentionId(null)} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, overflow: "auto", zIndex: 51, background: t.bgPanel, backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`, animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <div>
                    <span className="hfont" style={{ fontSize: 18, fontWeight: 700 }}>Channel Mention</span>
                    <div style={{ fontSize: 12, color: "#A855F7", marginTop: 2 }}>IM Content</div>
                  </div>
                </div>
                <button onClick={() => setSelectedMentionId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>
              {[
                { label: "Platform", value: selectedMention.platform },
                { label: "Status", value: selectedMention.status },
                { label: "Discovery Date", value: selectedMention.date },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55, display: "block", marginBottom: 6 }}>Related Assets</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selectedMention.assets.map((a, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: "rgba(21,27,46,0.9)", border: `1px solid ${t.borderStrong}`, color: t.text70, fontFamily: "'JetBrains Mono',monospace" }}>{a}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55, display: "block", marginBottom: 6 }}>Source</span>
                <CopyCell value={selectedMention.source} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#3B82F6", wordBreak: "break-all" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>Related Alarm ID</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span className="mono" style={{ fontSize: 12, color: t.text60 }}>{selectedMention.alarmId}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ cursor: "pointer" }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
