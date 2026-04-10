import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// ── Trending Insights (dummy) ──
const TRENDING = [
  { domain: "socradar.io", desc: "Search result for company domain exposure across dark web forums" },
  { domain: "socradar.io", desc: "Infected Device related to Company credentials on stealer markets" },
  { domain: "socradar.io", desc: "Company Related Information on paste sites and leak databases" },
  { domain: "socradar.io", desc: "Search for domain in Code Repositories and public gists" },
];

// ── Dummy search results ──
const RESULTS = [
  {
    id: 1, title: '"socradar.io" has been detected in the Github Gist',
    source: "Github Gist", type: "code", date: "2026 Apr 07 19:06 UTC",
    tags: ["agent", "website", "https", "tools", "linux"],
    highlight: "socradar.io",
    snippet: 'Optional:\n.ssweb https://socradar.io |1280|720|true|1\n\nFormat:\nurl|width|height|fullpage|scale\n\nlet [url, width, height, full, scale] = text.split("|")',
  },
  {
    id: 2, title: '"socradar.io" has been detected in the Github Gist',
    source: "Github Gist", type: "code", date: "2026 Apr 07 19:02 UTC",
    tags: ["github gist"],
    highlight: "socradar.io",
    snippet: 'socradar.io/mcp\\n102 | tool_call_timeout: 180000,\\n103 | };\\n104 | \\n105 | const result = Config.McpRemote.safeParse(validConfig);\\n',
  },
  {
    id: 3, title: '"socradar.io" has been detected in the Github Gist',
    source: "Github Gist", type: "code", date: "2026 Apr 07 18:45 UTC",
    tags: ["java", "code", "https", "page"],
    highlight: "socradar.io",
    snippet: 'package benchmark;\n\nimport java.net.URI;\nimport java.net.URISyntaxException;\nimport java.util.concurrent.TimeUnit;\nimport org.openjdk.jmh.annotations.Benchmark;',
  },
  {
    id: 4, title: '"socradar.io" mentioned in Telegram Channel',
    source: "Telegram", type: "stealer", date: "2026 Apr 06 14:22 UTC",
    tags: ["telegram", "credentials", "leak"],
    highlight: "socradar.io",
    snippet: 'New combo list uploaded — includes entries matching *socradar.io* domain.\nTotal records: 12,430 | Format: email:pass\nSource: Unknown stealer dump',
  },
  {
    id: 5, title: '"socradar.io" found in Breach Dataset',
    source: "Breach Dataset", type: "breach", date: "2026 Apr 05 09:15 UTC",
    tags: ["breach", "credentials", "database"],
    highlight: "socradar.io",
    snippet: 'Breach: CloudServiceX 2025\nRecords containing socradar.io: 3\nData classes: Email addresses, Passwords (hashed), IP addresses\nDate of breach: 2025-11-14',
  },
  {
    id: 6, title: '"socradar.io" credentials found in Stealer Log Collection',
    source: "Telegram", type: "stealer", date: "2026 Apr 04 11:38 UTC",
    tags: ["stealer", "redline", "credentials", "bot"],
    highlight: "socradar.io",
    snippet: 'Machine ID: DESKTOP-R7KL3M2 | OS: Windows 10 Pro\nStealer: RedLine v21.2\nURL: https://app.socradar.io/login\nSaved credentials: admin@socradar.io : ********\nCookies: 4 entries | Autofill: 2 entries',
  },
  {
    id: 7, title: '"socradar.io" detected in Raccoon Stealer Logs',
    source: "Telegram", type: "stealer", date: "2026 Apr 03 08:55 UTC",
    tags: ["raccoon", "stealer", "infected-device"],
    highlight: "socradar.io",
    snippet: 'Bot: 185.92.XX.XX | Country: TR\nStealer: Raccoon v2\nMatched URL: https://socradar.io/platform\nUsername: user@socradar.io\nBrowser: Chrome 120 | Cookies: 12 | Cards: 0',
  },
  {
    id: 8, title: '"socradar.io" found in CompanyLeaks 2026 Breach',
    source: "Breach Dataset", type: "breach", date: "2026 Apr 02 16:40 UTC",
    tags: ["breach", "database", "email", "password"],
    highlight: "socradar.io",
    snippet: 'Breach: CompanyLeaks Collection 2026\nRecords containing socradar.io: 7\nData classes: Email addresses, Passwords (plaintext), Phone numbers\nDate of breach: 2026-01-22\nTotal breach size: 4.2M records',
  },
  {
    id: 9, title: '"socradar.io" found in SaaS Provider Breach',
    source: "Breach Dataset", type: "breach", date: "2026 Mar 28 10:12 UTC",
    tags: ["breach", "saas", "api-keys"],
    highlight: "socradar.io",
    snippet: 'Breach: SaaSConnect Platform 2025\nRecords containing socradar.io: 2\nData classes: Email addresses, API keys, OAuth tokens\nDate of breach: 2025-09-03',
  },
  {
    id: 10, title: '"socradar.io" API key exposed in Pastebin',
    source: "Pastebin", type: "exposed", date: "2026 Apr 06 22:10 UTC",
    tags: ["paste", "api-key", "exposed"],
    highlight: "socradar.io",
    snippet: '# Internal Config (DO NOT SHARE)\nAPI_BASE=https://api.socradar.io/v2\nAPI_KEY=sk-socr-xxxxxxxxxxxxxxxxxxxx\nENV=production\nDEBUG=false\n\nPosted by anonymous | Views: 342',
  },
  {
    id: 11, title: '"socradar.io" internal config found on Ghostbin',
    source: "Ghostbin", type: "exposed", date: "2026 Apr 01 05:33 UTC",
    tags: ["paste", "config", "raw-data", "exposed"],
    highlight: "socradar.io",
    snippet: 'server {\n  listen 443 ssl;\n  server_name internal.socradar.io;\n  ssl_certificate /etc/ssl/socradar.io.crt;\n  proxy_pass http://10.0.1.45:8080;\n}\n# Uploaded 2026-03-30',
  },
  {
    id: 12, title: '"socradar.io" data found in public S3 bucket',
    source: "Public Bucket", type: "buckets", date: "2026 Mar 25 14:20 UTC",
    tags: ["s3", "aws", "bucket", "misconfiguration"],
    highlight: "socradar.io",
    snippet: 'Bucket: s3://client-exports-2025/\nPermission: Public Read\nFiles matching socradar.io:\n  - exports/socradar_report_2025Q4.csv (12MB)\n  - exports/socradar_assets_backup.json (3.4MB)\nRegion: eu-west-1',
  },
  {
    id: 13, title: '"socradar.io" found in open Azure Blob storage',
    source: "Public Bucket", type: "buckets", date: "2026 Mar 20 09:45 UTC",
    tags: ["azure", "blob", "bucket", "open-storage"],
    highlight: "socradar.io",
    snippet: 'Container: https://partnerstorage.blob.core.windows.net/shared/\nAccess Level: Container (anonymous read)\nMatched files:\n  - integrations/socradar_webhook_config.json\n  - logs/socradar_api_calls_2025.log (890KB)',
  },
  {
    id: 14, title: '"socradar.io" exposed raw data on dark web paste',
    source: "Dark Web Paste", type: "exposed", date: "2026 Mar 30 17:58 UTC",
    tags: ["onion", "paste", "raw-data", "dark-web"],
    highlight: "socradar.io",
    snippet: 'Title: Corporate Email Dumps - March 2026\nFormat: email|name|department|phone\nadmin@socradar.io|Admin User|IT|+90-XXX-XXXX\nsupport@socradar.io|Support Team|CS|+90-XXX-XXXX\n3 more entries ...',
  },
];

// ── Tab key to type mapping ──
const TAB_TYPE_MAP = {
  all: null,
  stealer: "stealer",
  breach: "breach",
  exposed: "exposed",
  buckets: "buckets",
  code: "code",
};

// ── Category tabs ──
const TABS = [
  { key: "all", label: "All Results", count: null, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" },
  { key: "stealer", label: "Stealer Logs", count: null, color: "#E8463A" },
  { key: "breach", label: "Breach Datasets", count: null, color: "#A855F7" },
  { key: "exposed", label: "Exposed Raw Data", count: null, color: "#F59E0B" },
  { key: "buckets", label: "Public Buckets", count: null, color: "#3B82F6" },
  { key: "code", label: "Public Code Repos", count: null, color: "#10B981" },
];

// ── Source colors ──
const SRC_DOT = {
  "Github Gist": "#E8463A",
  "Telegram": "#3B82F6",
  "Breach Dataset": "#A855F7",
  "Pastebin": "#F59E0B",
  "Ghostbin": "#F59E0B",
  "Dark Web Paste": "#CA8A04",
  "Public Bucket": "#3B82F6",
};

// ── Unique sources for cycling ──
const ALL_SOURCES = ["all", ...Array.from(new Set(RESULTS.map(r => r.source)))];

// ═══════════════════════════════════════
export default function DarkWebSearch() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeSource, setActiveSource] = useState("all");
  const [selectedResult, setSelectedResult] = useState(null);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const doSearch = () => { if (query.trim()) setSearched(true); };

  // Compute tab counts dynamically
  const tabCounts = {};
  for (const tab of TABS) {
    if (tab.key === "all") {
      tabCounts[tab.key] = RESULTS.length;
    } else {
      tabCounts[tab.key] = RESULTS.filter(r => r.type === TAB_TYPE_MAP[tab.key]).length;
    }
  }

  // Filter results based on activeTab + activeSource
  const filteredResults = RESULTS.filter(r => {
    const matchesTab = activeTab === "all" || r.type === TAB_TYPE_MAP[activeTab];
    const matchesSource = activeSource === "all" || r.source === activeSource;
    return matchesTab && matchesSource;
  });

  // Cycle source filter
  const cycleSource = () => {
    const idx = ALL_SOURCES.indexOf(activeSource);
    setActiveSource(ALL_SOURCES[(idx + 1) % ALL_SOURCES.length]);
  };

  // Source filter display value
  const sourceDisplayValue = activeSource === "all"
    ? `${ALL_SOURCES.length - 1} / ${ALL_SOURCES.length - 1}`
    : activeSource;

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative", minHeight: "calc(100vh - 60px)" }}>

      {!searched ? (
        /* ═══ LANDING STATE ═══ */
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
          gap: 32, paddingBottom: 80,
        }}>
          {/* Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="22" stroke={t.text15} strokeWidth="1.5" />
              <ellipse cx="26" cy="26" rx="12" ry="22" stroke={t.text15} strokeWidth="1" />
              <line x1="4" y1="26" x2="48" y2="26" stroke={t.borderMed} strokeWidth="0.8" />
              <line x1="26" y1="4" x2="26" y2="48" stroke={t.borderMed} strokeWidth="0.8" />
              <circle cx="26" cy="26" r="4" fill="none" stroke="#E8463A" strokeWidth="1.5" opacity="0.6" />
            </svg>
            <span className="hfont" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>
              Dark Web <span style={{ color: "#E8463A" }}>Search Engine</span>
            </span>
          </div>

          {/* Search bar — white */}
          <div style={{
            width: "100%", maxWidth: 720,
            background: t.bgWhiteSearch, borderRadius: 16,
            padding: "6px 6px 6px 20px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Search for Keywords, IP Addresses, Email Addresses, Domains, Hashes, URLs ..."
              style={{
                flex: 1, padding: "12px 0", fontSize: 14, fontFamily: "'Satoshi',sans-serif",
                background: "transparent", border: "none", color: t.textInverse, outline: "none",
              }}
            />
            {query && (
              <svg onClick={() => setQuery("")} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ cursor: "pointer", flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            )}
            <button
              onClick={doSearch}
              style={{
                width: 44, height: 44, borderRadius: 12, border: "none",
                background: "#E8463A", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(232,70,58,0.3)", flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Trending Insights */}
          <div style={{ width: "100%", maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
              <span style={{ fontSize: 12, color: t.text40, fontWeight: 500 }}>Trending Insights</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {TRENDING.map((item, i) => (
                <div
                  key={i}
                  onClick={() => { setQuery(item.domain); setSearched(true); }}
                  style={{
                    padding: "14px 16px", borderRadius: 12,
                    background: t.bgInput, border: `1px solid ${t.border}`,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,70,58,0.15)"; e.currentTarget.style.background = t.border; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.bgInput; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg width="22" height="22" viewBox="0 0 28 28">
                      <circle cx="14" cy="14" r="10" fill="none" stroke="#E8463A" strokeWidth="1.2" opacity="0.5" />
                      <circle cx="14" cy="14" r="4.5" fill="#E8463A" opacity="0.7" />
                      <circle cx="14" cy="14" r="1.5" fill="#0C1021" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text70 }}>{item.domain}</span>
                  </div>
                  <div style={{ fontSize: 11, color: t.text30, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Add shortcut */}
            <div style={{ marginTop: 10 }}>
              <div style={{
                width: "calc(25% - 8px)", padding: "14px 16px", borderRadius: 12,
                border: `1px dashed ${t.borderMed}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.borderStrong}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.borderMed}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text20} strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span style={{ fontSize: 11, color: t.text20 }}>Add shortcut</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══ RESULTS STATE ═══ */
        <>
          {/* Top bar: home + search + credits */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
          }}>
            <button
              onClick={() => { setSearched(false); setQuery(""); setSelectedResult(null); setActiveTab("all"); setActiveSource("all"); }}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none",
                background: t.bgHover, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.text40} strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
              </svg>
            </button>
            {/* Search bar */}
            <div style={{
              flex: 1, background: t.bgHover, borderRadius: 12,
              border: `1px solid ${t.borderLight}`,
              padding: "4px 4px 4px 14px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch()}
                style={{
                  flex: 1, padding: "8px 0", fontSize: 13, fontFamily: "'Satoshi',sans-serif",
                  background: "transparent", border: "none", color: t.text, outline: "none",
                }}
              />
              {query && (
                <svg onClick={() => setQuery("")} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text20} strokeWidth="2" style={{ cursor: "pointer" }}>
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              )}
              <button onClick={doSearch} style={{
                width: 34, height: 34, borderRadius: 8, border: "none",
                background: "#E8463A", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
            {/* Credits */}
            <div style={{
              display: "flex", gap: 8, flexShrink: 0,
            }}>
              <div style={{ padding: "8px 16px", borderRadius: 10, background: t.bgInput, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M2 8h20" /></svg>
                <div>
                  <div className="hfont" style={{ fontSize: 14, fontWeight: 800, color: t.text }}>8</div>
                  <div style={{ fontSize: 9, color: t.text30 }}>Remaining Decks</div>
                </div>
              </div>
              <div style={{ padding: "8px 16px", borderRadius: 10, background: t.bgInput, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="1.5"><path d="M18.178 8c5.096 0 5.096 8 0 8M5.822 8c-5.096 0-5.096 8 0 8" /><path d="M18 8c-5 0-5 8 0 8M6 8c5 0 5 8 0 8" /></svg>
                <div>
                  <div className="hfont" style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Remaining Credit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div style={{
            display: "flex", gap: 0, borderBottom: `1px solid ${t.borderSection}`, paddingBottom: 0,
            animation: loaded ? "fadeUp 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both" : "none",
          }}>
            {TABS.map(tab => {
              const count = tabCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "10px 16px", border: "none", cursor: "pointer",
                    background: "transparent",
                    borderBottom: activeTab === tab.key ? "2px solid #E8463A" : "2px solid transparent",
                    color: activeTab === tab.key ? t.text : t.text35,
                    fontSize: 12, fontWeight: activeTab === tab.key ? 600 : 400,
                    fontFamily: "'Satoshi',sans-serif", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {tab.key === "all" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={tab.icon} /></svg>}
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                      background: tab.color ? `${tab.color}18` : "rgba(232,70,58,0.12)",
                      color: tab.color || "#E8463A",
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
          }}>
            {/* Source filter — functional */}
            <button
              onClick={cycleSource}
              style={{
                padding: "7px 14px", borderRadius: 8,
                border: activeSource !== "all" ? "1px solid rgba(232,70,58,0.25)" : `1px solid ${t.borderLight}`,
                background: activeSource !== "all" ? "rgba(232,70,58,0.06)" : t.bgCard,
                color: activeSource !== "all" ? t.text70 : t.text40,
                fontSize: 11, cursor: "pointer",
                fontFamily: "'Satoshi',sans-serif", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Source
              <span className="mono" style={{ fontSize: 9, color: activeSource !== "all" ? t.text50 : t.text25 }}>
                ({sourceDisplayValue})
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {/* Remaining filters — UI only */}
            {[
              { label: "Country", value: "250 / 250" },
              { label: "Sector", value: "41 / 41" },
              { label: "Date Range", value: "" },
            ].map((f, i) => (
              <button key={i} style={{
                padding: "7px 14px", borderRadius: 8,
                border: `1px solid ${t.borderLight}`, background: t.bgCard,
                color: t.text40, fontSize: 11, cursor: "pointer",
                fontFamily: "'Satoshi',sans-serif", display: "flex", alignItems: "center", gap: 6,
              }}>
                {f.label}
                {f.value && <span className="mono" style={{ fontSize: 9, color: t.text25 }}>({f.value})</span>}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            ))}
            <span className="mono" style={{ fontSize: 10, color: t.text20, marginLeft: 8 }}>
              {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} — searched from 2025-04-07 to 2026-04-07
            </span>
          </div>

          {/* Results + Detail panel */}
          <div style={{
            display: "flex", gap: 18,
            animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none",
          }}>
            {/* Results list */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredResults.length === 0 ? (
                <div className="glass" style={{ padding: "40px 20px", textAlign: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.text15} strokeWidth="1.5" style={{ marginBottom: 12 }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="8" x2="14" y2="14" /><line x1="14" y1="8" x2="8" y2="14" />
                  </svg>
                  <div style={{ fontSize: 13, color: t.text35, marginBottom: 6 }}>No results match current filters</div>
                  <div style={{ fontSize: 11, color: t.text20 }}>Try adjusting the category tab or source filter</div>
                </div>
              ) : filteredResults.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedResult(r)}
                  className="glass"
                  style={{
                    padding: "18px 20px", cursor: "pointer", transition: "all 0.2s",
                    borderLeft: selectedResult?.id === r.id ? "3px solid #E8463A" : "3px solid transparent",
                    background: selectedResult?.id === r.id ? "rgba(232,70,58,0.03)" : undefined,
                  }}
                  onMouseEnter={e => { if (selectedResult?.id !== r.id) e.currentTarget.style.borderColor = "rgba(232,70,58,0.15)"; }}
                  onMouseLeave={e => { if (selectedResult?.id !== r.id) e.currentTarget.style.borderColor = "transparent"; }}
                >
                  {/* Title */}
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#3B82F6", marginBottom: 6, cursor: "pointer" }}>
                    {r.title}
                  </div>
                  {/* Source + Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: SRC_DOT[r.source] || "#E8463A" }} />
                    <span style={{ fontSize: 11, color: t.text40 }}>{r.source}</span>
                    <span style={{ fontSize: 11, color: t.text25 }}>-</span>
                    <span className="mono" style={{ fontSize: 10, color: t.text25 }}>{r.date}</span>
                  </div>
                  {/* Tags */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
                    {r.tags.map((tag, j) => (
                      <span key={j} style={{
                        padding: "3px 8px", borderRadius: 4, fontSize: 10,
                        background: "rgba(59,130,246,0.08)", color: "#3B82F6",
                        fontFamily: "'JetBrains Mono',monospace", fontWeight: 500,
                      }}>{tag}</span>
                    ))}
                  </div>
                  {/* Highlighted domain */}
                  <div style={{ fontSize: 11, color: "#E8463A", marginBottom: 8 }}>{r.highlight}</div>
                  {/* Snippet */}
                  <pre style={{
                    fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                    color: t.text35, lineHeight: 1.6,
                    whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0,
                    maxHeight: 100, overflow: "hidden",
                  }}>
                    {r.snippet}
                  </pre>
                </div>
              ))}
            </div>

            {/* Domain Intel Card — right panel (inline, not overlay) */}
            <div style={{
              width: 320, flexShrink: 0,
              background: t.bgCard, borderRadius: 16,
              border: `1px solid ${t.border}`, overflow: "hidden",
              position: "sticky", top: 20, alignSelf: "flex-start",
            }}>
              {/* Header */}
              <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Domain Intel Card</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><path d="M6 9l6-6 6 6M6 15l6 6 6-6" /></svg>
              </div>

              <div style={{ padding: "18px" }}>
                {/* Summary */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M2 8h20" /></svg>
                  <span style={{ fontSize: 12, color: t.text50, fontWeight: 500 }}>Summary</span>
                </div>

                {/* Domain Score Ring */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke={t.borderSection} strokeWidth="8" />
                      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill={t.text} fontSize="22" fontWeight="800" fontFamily="'Plus Jakarta Sans'">0</text>
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 13, color: "#E8463A", fontWeight: 600 }}>{query || "socradar.io"}</span>
                    <span style={{ fontSize: 11, color: t.text30, marginLeft: 6 }}>(Whitelisted)</span>
                  </div>
                  <button style={{
                    marginTop: 12, padding: "8px 18px", borderRadius: 8, border: "none",
                    background: "#E8463A", color: "#fff", fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
                    boxShadow: "0 2px 8px rgba(232,70,58,0.3)",
                  }}>Investigate on IoC Enrichment</button>
                </div>

                {/* Key-value rows */}
                {[
                  { label: "Risk Score", value: "0/100" },
                  { label: "Abuse Report", value: "0" },
                  { label: "Domain Rank", value: "230" },
                  { label: "IP Addresses", value: "2" },
                  { label: "Related Domains", value: "14" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.borderSection}` }}>
                    <span style={{ fontSize: 12, color: t.text45 }}>{row.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: t.text60 }}>{row.value}</span>
                  </div>
                ))}

                {/* Whitelist Sources */}
                <div style={{ marginTop: 14 }}>
                  <span style={{ fontSize: 11, color: t.text35, fontWeight: 500 }}>Whitelist Sources</span>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    {["Tranco Top 1m Domain", "Cisco Umbrella Top 1m", "Top 500k Domain", "Majestic Top 1m Domain", "Moz Top 500 Domain", "Statvoo Top 1m Domain", "Public DNS Resolvers"].map((s, i) => (
                      <span key={i} className="mono" style={{ fontSize: 9, color: t.text20 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
