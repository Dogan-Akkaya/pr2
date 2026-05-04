import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const FEED = [
  { id: 1, source: "Russian Market", kind: "Stealer Logs", count: "412,098", lag: "1m", date: "2026-04-27 16:42", yourHits: 4 },
  { id: 2, source: "BreachForums", kind: "Forum Post", count: "1 thread, 23 replies", lag: "3m", date: "2026-04-27 16:40", yourHits: 0 },
  { id: 3, source: "Telegram /darkleaks", kind: "Channel Mention", count: "47 messages", lag: "8m", date: "2026-04-27 16:34", yourHits: 2 },
  { id: 4, source: "Pastebin / scraping", kind: "Paste", count: "118 pastes parsed", lag: "12m", date: "2026-04-27 16:30", yourHits: 0 },
  { id: 5, source: "Github + Gist", kind: "Code Leak", count: "9 secrets detected", lag: "21m", date: "2026-04-27 16:21", yourHits: 1 },
  { id: 6, source: "Cracked.sh", kind: "Combo List", count: "3.1M lines", lag: "34m", date: "2026-04-27 16:08", yourHits: 12 },
  { id: 7, source: "Tor onion crawl", kind: "Marketplace Crawl", count: "284 listings", lag: "49m", date: "2026-04-27 15:53", yourHits: 0 },
  { id: 8, source: "I2P leak forum", kind: "Forum Post", count: "12 threads", lag: "1h", date: "2026-04-27 15:42", yourHits: 0 },
];

const TOTAL_YOUR_HITS = FEED.reduce((s, f) => s + (f.yourHits || 0), 0);

const KIND_COLOR = {
  "Stealer Logs": "#FF4562", "Forum Post": "#A855F7", "Channel Mention": "#3B82F6",
  "Paste": "#06B6D4", "Code Leak": "#F59E0B", "Combo List": "#EA580C",
  "Marketplace Crawl": "#10B981", "Forum Thread": "#A855F7",
};

export default function LatestDataAdded() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
      <div className="glass" style={{ padding: "20px 22px", animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Data & Services</div>
        <div className="hfont" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Latest Data Added</div>
        <div style={{ fontSize: 13, color: t.text50, marginTop: 6 }}>Live ingestion stream — what SOCRadar has crawled, parsed, and indexed in the last 24 hours.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        {/* "Yours" hero stat — primary lens bridge into a global feed */}
        <div className="glass" style={{
          padding: "16px 18px",
          background: "rgba(255,69,98,0.06)",
          border: "1px solid rgba(255,69,98,0.22)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <span style={{
              fontSize: 7, fontWeight: 800, letterSpacing: "0.14em",
              color: "#FF4562",
              background: "rgba(255,69,98,0.14)",
              padding: "2px 6px", borderRadius: 3,
              fontFamily: "'JetBrains Mono', monospace",
            }}>YOURS</span>
            <div style={{ fontSize: 10, color: t.text40 }}>Your domains in last 24h</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="hfont" style={{ fontSize: 24, fontWeight: 800, color: "#FF4562" }}>{TOTAL_YOUR_HITS}</span>
            <span className="mono" style={{ fontSize: 9, color: t.text40 }}>hits across {FEED.filter(f => f.yourHits > 0).length} sources</span>
          </div>
        </div>
        {[
          { label: "Records (24h)", value: "4.2M", color: "#FF4562" },
          { label: "Sources Active", value: "248", color: "#3B82F6" },
          { label: "Avg Ingest Lag", value: "8.4 min", color: "#10B981" },
          { label: "Failed Crawls", value: "3", color: "#CA8A04" },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: t.text40, marginBottom: 8 }}>{s.label}</div>
            <span className="hfont" style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="glass" style={{ overflow: "hidden", animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Live Stream</div>
          <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Most recent ingest events</span>
        </div>
        {FEED.map((f) => (
          <div key={f.id} style={{
            padding: "12px 20px", borderBottom: `1px solid ${t.borderRow}`,
            display: "grid", gridTemplateColumns: "180px 130px 1fr 100px 90px", gap: 12, alignItems: "center",
            background: f.yourHits > 0 ? "rgba(255,69,98,0.04)" : "transparent",
            borderLeft: f.yourHits > 0 ? "3px solid #FF4562" : "3px solid transparent",
          }}>
            <span className="mono" style={{ fontSize: 11, color: t.text50 }}>{f.source}</span>
            <span className="tag" style={{ background: `${KIND_COLOR[f.kind] || "#666"}15`, color: KIND_COLOR[f.kind] || t.text50, fontSize: 9, justifySelf: "start" }}>{f.kind}</span>
            <span className="mono" style={{ fontSize: 11, color: t.text }}>{f.count}</span>
            <div style={{ textAlign: "center" }}>
              {f.yourHits > 0 ? (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 8px", borderRadius: 5,
                  background: "rgba(255,69,98,0.12)", color: "#FF4562",
                  fontSize: 9, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4562" }} />
                  {f.yourHits} {f.yourHits === 1 ? "MATCH" : "MATCHES"}
                </span>
              ) : (
                <span className="mono" style={{ fontSize: 9, color: t.text25 }}>—</span>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 10, color: "#10B981" }}>+{f.lag}</div>
              <div className="mono" style={{ fontSize: 9, color: t.text25 }}>{f.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
