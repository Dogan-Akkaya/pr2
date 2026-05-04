import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

/* ────────────────────────────────────────────────────────────────────────────
   TELEGRAM INTERIOR PALETTE
   The phone viewer is an embedded "screen showing Telegram" — like the
   white-search-bar pattern, it stays in its own theme regardless of app theme.
   ──────────────────────────────────────────────────────────────────────────── */
const TG = {
  bg:           "#0e1621",
  bgHeader:     "rgba(15,23,42,0.85)",
  bgBottom:     "rgba(15,23,42,0.6)",
  bubble:       "rgba(23,33,48,0.92)",
  bubbleHi:     "rgba(34,158,238,0.08)",
  bubbleHiBd:   "rgba(34,158,238,0.32)",
  bubbleText:   "#d4d4d8",
  meta:         "rgba(148,163,184,0.55)",
  metaDim:      "rgba(148,163,184,0.4)",
  border:       "rgba(51,65,85,0.4)",
  borderSoft:   "rgba(51,65,85,0.2)",
  cyan:         "#22D3EE",
  blue:         "#6ab3f3",
};

/* ── Channel-type tag colors ── */
const CT = {
  stealer:    { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B", label: "Stealer Logs" },
  hacktivist: { bg: "rgba(255,69,98,0.12)",  fg: "#FF4562", label: "Hacktivist"   },
  carding:    { bg: "rgba(251,146,60,0.12)", fg: "#FB923C", label: "Carding"      },
  ransom:     { bg: "rgba(220,38,38,0.14)",  fg: "#DC2626", label: "Ransomware"   },
  breach:     { bg: "rgba(168,85,247,0.12)", fg: "#A855F7", label: "Breach"       },
};

/* ── Match-type chips on Mention cards ── */
const MT = {
  domain: { bg: "rgba(34,211,238,0.12)", fg: "#22D3EE", label: "domain match" },
  brand:  { bg: "rgba(168,85,247,0.12)", fg: "#A855F7", label: "brand mention" },
  exec:   { bg: "rgba(255,69,98,0.12)",  fg: "#FF4562", label: "executive name" },
  bin:    { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B", label: "BIN match" },
  cred:   { bg: "rgba(255,69,98,0.14)",  fg: "#FF4562", label: "credential leak" },
};

const SEV = { critical: "#DC2626", high: "#EA580C", medium: "#CA8A04" };

/* ── Trending category badges ── */
const CAT = {
  HACK:   { bg: "rgba(255,69,98,0.10)",  fg: "#FF4562" },
  GEO:    { bg: "rgba(245,158,11,0.10)", fg: "#F59E0B" },
  RANSOM: { bg: "rgba(220,38,38,0.12)",  fg: "#DC2626" },
  MALW:   { bg: "rgba(245,158,11,0.10)", fg: "#F59E0B" },
  VULN:   { bg: "rgba(168,85,247,0.10)", fg: "#A855F7" },
};

/* ────────────────────────────────────────────────────────────────────────────
   DATA FIXTURES
   ──────────────────────────────────────────────────────────────────────────── */

const CHANNELS = {
  "moon-cloud": {
    name: "Moon Cloud",
    initial: "M",
    accent: TG.cyan,
    accentBg: "rgba(34,211,238,0.15)",
    members: "45,200",
    typeKey: "stealer",
    typeLabel: "Stealer Log Aggregator",
    lastActive: "12m ago",
    messages: [
      { kind: "date", text: "April 30, 2026" },
      { id: "m1", sender: "MoonCloud Bot", senderColor: "#e8a855",
        text: "Daily stealer statistics update:\nTotal logs processed: 142,801\nNew unique domains: 8,204\nTop stealer: Raccoon v2 (34% share)",
        time: "08:01" },
      { id: "m2", sender: "log_seller_23", senderColor: "#6ab3f3",
        text: "Selling fresh batch — US banking sector. 450 entries, all tested <6h. Includes autofill, cookies, saved passwords. $15/batch.",
        tags: ["#banking", "#us", "#fresh"], time: "08:42" },
      { id: "m3", sender: "raccoon_admin", senderColor: "#a78bfa",
        forwardedFrom: "RaccoonLogs",
        text: "Infrastructure update: new C2 servers deployed. Panel v3.2 with improved cookie capture. Update your builders.",
        time: "09:03" },
      { id: "m4", sender: "fresh_logs_daily", senderColor: "#f87171",
        isHighlighted: true, matchedKeyword: "greenanimalsbank.com",
        text: "Fresh logs today: [match]greenanimalsbank.com[/match] — 23 entries, includes VPN access, SSO tokens, browser saved passwords. All verified within 12h. DM for pricing. Bulk discount for 50+ logs.",
        tags: ["#banking", "#turkey", "#vpn", "#sso"], time: "09:15" },
      { id: "m5", sender: "buyer_42", senderColor: "#34d399",
        text: "@fresh_logs_daily interested in the banking set. DM sent.", time: "09:18" },
      { id: "m6", sender: "MoonCloud Bot", senderColor: "#e8a855", isClaim: true,
        text: "New batch uploaded: EU financial sector, 1,200 entries. Includes MFA tokens for 340 accounts. Stealer: LummaC2.",
        file: { name: "eu_financial_batch_apr30.zip", size: "2.4 MB · encrypted" }, time: "09:34" },
      { id: "m7", sender: "log_seller_23", senderColor: "#6ab3f3",
        text: "Flash sale: healthcare sector logs, verified active sessions with browser fingerprints. 200 entries @ $0.08/each. Gone in 1h.",
        tags: ["#healthcare", "#sessions", "#flash"], time: "09:51" },
    ],
  },
  "darkforums-chat": {
    name: "DarkForums_chat",
    initial: "D",
    accent: "#FF4562",
    accentBg: "rgba(255,69,98,0.15)",
    members: "12,800",
    typeKey: "carding",
    typeLabel: "Carding Discussion",
    lastActive: "5h ago",
    messages: [
      { kind: "date", text: "April 30, 2026" },
      { id: "d1", sender: "card_master", senderColor: "#fb923c",
        text: "Looking for buyers: banking sector combo list, includes [match]greenanimalsbank[/match] domain entries, 4,200 records. CC details + emails. $200 negotiable.",
        isHighlighted: true, matchedKeyword: "greenanimalsbank",
        tags: ["#combo", "#banking", "#tr"], time: "04:12" },
      { id: "d2", sender: "anon_buyer", senderColor: "#6ab3f3",
        text: "What's the BIN coverage? Any verified live cards in the dump?", time: "04:18" },
      { id: "d3", sender: "card_master", senderColor: "#fb923c",
        text: "BINs across Turkish banks. ~800 verified live as of yesterday. Sample: 11 cards, DM for proof.", time: "04:24" },
      { id: "d4", sender: "DF Mod", senderColor: "#a78bfa",
        text: "Reminder: vendor verification required before any deals. Use escrow.", time: "06:01" },
      { id: "d5", sender: "card_master", senderColor: "#fb923c",
        text: "Vendor since 2023. Escrow OK. Reputation: 47 successful deals.", time: "06:08" },
    ],
  },
  "breachforums-alerts": {
    name: "BreachForums Alerts",
    initial: "B",
    accent: "#A855F7",
    accentBg: "rgba(168,85,247,0.15)",
    members: "89,400",
    typeKey: "breach",
    typeLabel: "Breach Announcements",
    lastActive: "1d ago",
    messages: [
      { kind: "date", text: "April 29, 2026" },
      { id: "b1", sender: "BF Admin", senderColor: "#a78bfa",
        text: "New DB dump: Turkish banking sector — includes [match]Simon Johnsson[/match] (CFO) credentials with plaintext password. Full dump 14k records.",
        isHighlighted: true, matchedKeyword: "Simon Johnsson",
        tags: ["#turkey", "#banking", "#cred"], time: "11:42",
        file: { name: "tr_banking_apr29.7z", size: "8.1 MB · password-protected" } },
      { id: "b2", sender: "leakhound", senderColor: "#f87171", isClaim: true,
        text: "I can confirm the dump validity. 5 of my test accounts authenticate.", time: "12:03" },
      { id: "b3", sender: "researcher_tr", senderColor: "#34d399",
        text: "Cross-referenced 200 entries with HaveIBeenPwned — 96% are net-new exposures.", time: "13:48" },
      { id: "b4", sender: "BF Admin", senderColor: "#a78bfa",
        text: "Pricing: $400 for the full dump, $50 for samples. Verified buyers only.", time: "14:22" },
    ],
  },
  "cyber-resistance": {
    name: "Cyber Islamic Resistance",
    initial: "C",
    accent: "#FF4562",
    accentBg: "rgba(255,69,98,0.15)",
    members: "32,100",
    typeKey: "hacktivist",
    typeLabel: "Hacktivist Collective",
    lastActive: "2h ago",
    messages: [
      { kind: "date", text: "April 30, 2026" },
      { id: "c1", sender: "CIR Spokesperson", senderColor: "#f87171", isClaim: true,
        text: "Successful DDoS on 14 Israeli government targets in last 6 hours. Coordinated with #OpIsrael.",
        tags: ["#OpIsrael", "#DDoS"], time: "06:30" },
      { id: "c2", sender: "ops_leader", senderColor: "#fb923c",
        text: "Next wave: 12:00 UTC. Targets shared in private channel. Please share resources.", time: "07:15" },
      { id: "c3", sender: "tech_support", senderColor: "#6ab3f3",
        text: "DDoSia updated. New target list pushed. Average RPS: 18k per node.", time: "08:42" },
      { id: "c4", sender: "CIR Spokesperson", senderColor: "#f87171",
        text: "We achieved sustained outage on 3 banking sites. 11 minutes peak downtime. Operation continues.",
        tags: ["#OpIsrael", "#banking", "#success"], time: "10:50" },
    ],
  },
  "crypto-drainer-hub": {
    name: "Crypto_Drainer_Hub",
    initial: "C",
    accent: "#FB923C",
    accentBg: "rgba(251,146,60,0.15)",
    members: "8,140",
    typeKey: "carding",
    typeLabel: "Wallet Drainers · Carding",
    lastActive: "47m ago",
    messages: [
      { kind: "date", text: "April 30, 2026" },
      { id: "cd1", sender: "drain_master", senderColor: "#fb923c",
        text: "Inferno Drainer v4 is live. Improved wallet signature flows for Phantom + Metamask. Affiliate cut: 70%.",
        tags: ["#drainer", "#metamask", "#phantom"], time: "02:14" },
      { id: "cd2", sender: "card_runner", senderColor: "#f87171",
        text: "[match]BIN 411111[/match] live for 4 hours — 23 charged transactions, $14k routed before bank flagged. Selling new live BIN list, $0.50/each min 50.",
        isHighlighted: true, matchedKeyword: "BIN 411111",
        tags: ["#bin", "#fresh", "#live"], time: "06:33" },
      { id: "cd3", sender: "anon_buyer", senderColor: "#6ab3f3",
        text: "How fast is the burn rate on these? Need >2h window.", time: "06:41" },
      { id: "cd4", sender: "card_runner", senderColor: "#f87171",
        text: "Avg 45min before fraud detection on EU banks, 3-6h for SEA. Use rotators.", time: "06:58" },
      { id: "cd5", sender: "drain_master", senderColor: "#fb923c", isClaim: true,
        text: "Recovered $84k from a single Phantom drain last night. Updated tutorials in the pinned channel.",
        tags: ["#success", "#phantom"], time: "08:22" },
      { id: "cd6", sender: "wallet_eth", senderColor: "#a78bfa",
        text: "Looking for 0xfa7 prefixed addresses, willing to pay 0.4 ETH per active wallet w/ >1 ETH balance.",
        time: "09:47" },
    ],
  },
  "opisrael-official": {
    name: "OpIsrael Official",
    initial: "O",
    accent: "#FF4562",
    accentBg: "rgba(255,69,98,0.15)",
    members: "21,340",
    typeKey: "hacktivist",
    typeLabel: "Hacktivist Coordination",
    lastActive: "2d ago",
    messages: [
      { kind: "date", text: "April 28, 2026" },
      { id: "op1", sender: "OpIsrael Admin", senderColor: "#f87171", isClaim: true,
        text: "Targets confirmed for next operation. [match]greenanimalsbank.com[/match] is on the secondary list. Primary: 14 IL government domains.",
        isHighlighted: true, matchedKeyword: "greenanimalsbank.com",
        tags: ["#OpIsrael", "#targets"], time: "10:15" },
      { id: "op2", sender: "ddosia_relay", senderColor: "#6ab3f3",
        text: "Botnet ready. 47k nodes online. Coordinating with @cyber-resistance for synchronized hits.",
        tags: ["#DDoS", "#coordination"], time: "10:32" },
      { id: "op3", sender: "anon_volunteer", senderColor: "#34d399",
        text: "Confirming participation. Bringing 2.4k node capacity from Iran cluster.", time: "11:05" },
      { id: "op4", sender: "OpIsrael Admin", senderColor: "#f87171",
        text: "Comms OPSEC reminder: no real names, no operational details outside private channel. Use the bridge.",
        time: "12:48" },
      { id: "op5", sender: "leak_team", senderColor: "#a78bfa",
        text: "Pre-op recon dump: 312 IPs, 47 admin panels confirmed exposed. File in pinned.",
        file: { name: "ilgov_recon_apr28.zip", size: "1.8 MB · password: standard" }, time: "14:22" },
    ],
  },
  "redline-kombo": {
    name: "RedlineKombo",
    initial: "R",
    accent: "#F59E0B",
    accentBg: "rgba(245,158,11,0.15)",
    members: "5,420",
    typeKey: "stealer",
    typeLabel: "RedLine Stealer Combo Lists",
    lastActive: "4d ago",
    messages: [
      { kind: "date", text: "April 26, 2026" },
      { id: "rl1", sender: "redline_dist", senderColor: "#e8a855",
        text: "Daily combo drop: 34k entries, mixed regions. RedLine v22.1, fresh checked, MFA tokens included where present.",
        tags: ["#combo", "#redline", "#daily"], time: "07:00" },
      { id: "rl2", sender: "logs_buyer_19", senderColor: "#6ab3f3",
        text: "Mixed combo dump — [match]fastpay.co.id[/match] sessions x12, no MFA tokens but live cookies. $40 for the lot.",
        isHighlighted: true, matchedKeyword: "fastpay.co.id",
        tags: ["#sea", "#fintech", "#cookies"], time: "09:28" },
      { id: "rl3", sender: "redline_dist", senderColor: "#e8a855",
        text: "RedLine v22.2 dropping next week. New AV evasion + extended browser support (Brave, Vivaldi, Wave).",
        time: "11:45" },
      { id: "rl4", sender: "anon", senderColor: "#a78bfa",
        text: "Anyone tested the Wave browser harvester? Reports of false positives.", time: "13:12" },
      { id: "rl5", sender: "qa_redline", senderColor: "#34d399",
        text: "Wave harvester confirmed working in 91% of test runs. Failures correlate with antivirus EDR endpoints.", time: "14:50" },
    ],
  },
  "bidencash-carders": {
    name: "BidenCash Carders",
    initial: "B",
    accent: "#FB923C",
    accentBg: "rgba(251,146,60,0.15)",
    members: "67,200",
    typeKey: "carding",
    typeLabel: "Premium Card Marketplace",
    lastActive: "1h ago",
    messages: [
      { kind: "date", text: "April 30, 2026" },
      { id: "bc1", sender: "BidenCash Bot", senderColor: "#e8a855",
        text: "Daily marketplace digest:\nNew listings: 12,840\nFresh CVVs: 4,201\nBINs added: 47\nTotal active vendors: 2,103",
        time: "00:00" },
      { id: "bc2", sender: "vendor_42", senderColor: "#fb923c", isClaim: true,
        text: "Premium drop: 800 freshly-checked Indonesian bank cards, includes [match]jtrustbank.co.id[/match] employee SSO leak — 312 records with role + department metadata included.",
        isHighlighted: true, matchedKeyword: "jtrustbank.co.id",
        tags: ["#sea", "#banking", "#fresh"], time: "03:18",
        file: { name: "id_premium_apr30.csv", size: "4.2 MB · password-protected" } },
      { id: "bc3", sender: "anon_buyer", senderColor: "#6ab3f3",
        text: "BIN distribution? Need 5xxxxx for the cashout chain.", time: "03:45" },
      { id: "bc4", sender: "vendor_42", senderColor: "#fb923c",
        text: "5xxx range: 320 cards in the dump. Visa Premium 480, Mastercard World 200. All checked <8h.",
        time: "04:02" },
      { id: "bc5", sender: "BidenCash Bot", senderColor: "#e8a855",
        text: "Reminder: BidenCash escrow now mandatory for transactions >$500. Use the bot to initiate.",
        time: "08:30" },
      { id: "bc6", sender: "high_roller", senderColor: "#a78bfa",
        text: "Need bulk pricing for 5k+ EU cards. DM with portfolio.", time: "10:14" },
    ],
  },
  "raccoon-daily": {
    name: "RaccoonLogs Daily",
    initial: "R",
    accent: "#A855F7",
    accentBg: "rgba(168,85,247,0.15)",
    members: "18,750",
    typeKey: "stealer",
    typeLabel: "Raccoon v2 Distribution",
    lastActive: "3h ago",
    messages: [
      { kind: "date", text: "April 30, 2026" },
      { id: "rc1", sender: "raccoon_admin", senderColor: "#a78bfa",
        text: "Daily Raccoon v2 stats:\nTotal logs: 28,440\nNew bots: 1,203\nUnique cookies: 412k\nCrypto wallets: 89 (avg balance $1.2k)",
        time: "07:00" },
      { id: "rc2", sender: "raccoon_admin", senderColor: "#a78bfa",
        text: "Russian Market upload includes [match]platform.socradar.com[/match] sessions — 4 entries, browser cookies + autofill saved.",
        isHighlighted: true, matchedKeyword: "platform.socradar.com",
        tags: ["#sessions", "#cookies"], time: "09:42" },
      { id: "rc3", sender: "redline_dist", senderColor: "#fb923c", forwardedFrom: "RedlineKombo",
        text: "Daily RedLine drop integrated. Combined feed available via the Russian Market mirror.",
        time: "10:18" },
      { id: "rc4", sender: "buyer_lurker", senderColor: "#6ab3f3",
        text: "Looking for crypto-rich logs only — willing to pay 3x premium for wallets >$5k balance.",
        time: "11:33" },
      { id: "rc5", sender: "raccoon_admin", senderColor: "#a78bfa", isClaim: true,
        text: "Raccoon v2.6 builder leaked. Free copy in pinned. Includes the new exfil channel for Cloudflare Workers proxying.",
        file: { name: "raccoon_v2.6_builder.7z", size: "12.4 MB · encrypted" }, time: "13:45" },
    ],
  },
};

/* ── Your Mentions (personalized alerts) ── */
const MY_MENTIONS = [
  { id: 1, channelId: "moon-cloud", channel: "Moon Cloud", members: "45.2K members", severity: "high",
    time: "2h ago", matchTypes: ["domain", "cred"], channelType: "stealer",
    excerpt: 'Fresh logs today: [match]greenanimalsbank.com[/match] — 23 entries, includes VPN access, SSO tokens, browser saved passwords. All verified within 12h…' },
  { id: 2, channelId: "darkforums-chat", channel: "DarkForums_chat", members: "12.8K members", severity: "medium",
    time: "5h ago", matchTypes: ["brand"], channelType: "carding",
    excerpt: 'Looking for buyers: banking sector combo list, includes [match]greenanimalsbank[/match] domain entries, 4,200 records…' },
  { id: 3, channelId: "breachforums-alerts", channel: "BreachForums Alerts", members: "89.4K members", severity: "critical",
    time: "Yesterday", matchTypes: ["exec", "cred"], channelType: "breach",
    excerpt: 'New DB dump: Turkish banking sector — includes [match]Simon Johnsson[/match] (CFO) credentials with plaintext password…' },
  { id: 4, channelId: "raccoon-daily", channel: "RaccoonLogs Daily", members: "18.7K members", severity: "medium",
    time: "Yesterday", matchTypes: ["domain"], channelType: "stealer",
    excerpt: 'Russian Market upload includes [match]platform.socradar.com[/match] sessions — 4 entries, browser cookies + autofill saved.' },
  { id: 5, channelId: "crypto-drainer-hub", channel: "Crypto_Drainer_Hub", members: "8.1K members", severity: "medium",
    time: "2d ago", matchTypes: ["bin"], channelType: "carding",
    excerpt: '[match]BIN 411111[/match] live for 4 hours — 23 charged transactions, $14k routed before bank flagged.' },
  { id: 6, channelId: "opisrael-official", channel: "OpIsrael Official", members: "21.3K members", severity: "high",
    time: "2d ago", matchTypes: ["brand"], channelType: "hacktivist",
    excerpt: 'Targets confirmed for next operation. [match]greenanimalsbank.com[/match] is on the secondary list.' },
  { id: 7, channelId: "bidencash-carders", channel: "BidenCash Carders", members: "67.2K members", severity: "high",
    time: "3d ago", matchTypes: ["cred", "domain"], channelType: "carding",
    excerpt: '[match]jtrustbank.co.id[/match] employee SSO leak — 312 records with role + department metadata included.' },
  { id: 8, channelId: "redline-kombo", channel: "RedlineKombo", members: "5.4K members", severity: "medium",
    time: "4d ago", matchTypes: ["domain"], channelType: "stealer",
    excerpt: 'Mixed combo dump — [match]fastpay.co.id[/match] sessions x12, no MFA tokens but live cookies.' },
  { id: 9, channelId: "bidencash-carders", channel: "BidenCash Carders", members: "67.2K members", severity: "critical",
    time: "5h ago", matchTypes: ["bin"], channelType: "carding",
    excerpt: '800 freshly-checked Indonesian bank cards — includes [match]BIN 222222[/match] x320 + Visa Premium 480 verified <8h…' },
  { id: 10, channelId: "opisrael-official", channel: "OpIsrael Official", members: "21.3K members", severity: "medium",
    time: "2d ago", matchTypes: ["domain"], channelType: "hacktivist",
    excerpt: 'Pre-op recon dump: 312 IPs across IL gov + financial. [match]platform.socradar.com[/match] flagged in adjacent infrastructure.' },
  { id: 11, channelId: "moon-cloud", channel: "Moon Cloud", members: "45.2K members", severity: "high",
    time: "3d ago", matchTypes: ["cred", "domain"], channelType: "stealer",
    excerpt: 'EU financial sector batch — 1,200 entries with MFA tokens for 340 accounts. Domain hits include [match]academy.socradar.io[/match]…' },
  { id: 12, channelId: "raccoon-daily", channel: "RaccoonLogs Daily", members: "18.7K members", severity: "medium",
    time: "4d ago", matchTypes: ["brand"], channelType: "stealer",
    excerpt: 'Daily Raccoon stats include [match]socradar[/match] keyword in 47 distinct logs — most from .io and .com TLDs in EU/SEA.' },
];

const TRENDING_CATEGORIES = ["ALL", "LEAKS", "CLAIMS", "DDOS", "ICS/OT", "RECON", "RANSOMWARE", "CARDING", "CREDENTIALS"];

const TOPIC_PILLS = [
  { label: "#OpIsrael",       kind: "preset", hot: true,  category: "DDOS" },
  { label: "Iran-Israel War", kind: "preset", hot: true,  category: "DDOS" },
  { label: "Russia-Ukraine",  kind: "preset",            category: "DDOS" },
  { label: "NoName057(16)",   kind: "preset",            category: "DDOS" },
  { label: "LockBit",         kind: "preset",            category: "RANSOMWARE" },
  { label: "Stealer Logs",    kind: "preset",            category: "CREDENTIALS" },
  { label: "Dark Storm Team", kind: "preset",            category: "DDOS" },
  { label: "Handala Hack",    kind: "preset",            category: "CLAIMS" },
  { label: "RipperSec",       kind: "preset",            category: "DDOS" },
  { label: "BidenCash",       kind: "preset",            category: "CARDING" },
  { label: "DDoSia",          kind: "preset",            category: "DDOS" },
  { label: "313 Team",        kind: "preset",            category: "CLAIMS" },
  { label: "Credential Dumps",kind: "preset",            category: "CREDENTIALS" },
  { label: "SCADA / ICS",     kind: "preset",            category: "ICS/OT" },
  { label: "Moon Cloud",      kind: "preset",            category: "CREDENTIALS" },
  { label: "BreachForums",    kind: "preset",            category: "LEAKS" },
  { label: "Fortinet CVE",    kind: "dynamic",           category: "RECON" },
  { label: "Snowflake Breach",kind: "dynamic",           category: "LEAKS" },
];

const TRENDING_ROWS = [
  { keyword: "#OpIsrael",       category: "HACK",   volume: 1247, deltaPct: 340, deltaDir: "up",   topChannel: "OpIsrael Official",       sparks: [4, 6, 8, 7, 14], topicCategory: "DDOS" },
  { keyword: "Iran-Israel War", category: "GEO",    volume: 3891, deltaPct: 67,  deltaDir: "up",   topChannel: "Cyber Islamic Resistance", sparks: [8, 10, 9, 11, 13], topicCategory: "DDOS" },
  { keyword: "LockBit",         category: "RANSOM", volume: 892,  deltaPct: 12,  deltaDir: "up",   topChannel: "LockBit Official",         sparks: [10, 9, 11, 10, 12], topicCategory: "RANSOMWARE" },
  { keyword: "Stealer Logs",    category: "MALW",   volume: 2103, deltaPct: 0,   deltaDir: "flat", topChannel: "Moon Cloud",               sparks: [9, 10, 9, 11, 11], topicCategory: "CREDENTIALS" },
  { keyword: "Fortinet CVE",    category: "VULN",   volume: 456,  deltaPct: 890, deltaDir: "up",   topChannel: "CyberUnderground",         sparks: [2, 3, 4, 8, 14], topicCategory: "RECON", dynamic: true },
  { keyword: "NoName057(16)",   category: "HACK",   volume: 734,  deltaPct: 5,   deltaDir: "up",   topChannel: "DDoSia Project",           sparks: [8, 7, 9, 8, 10], topicCategory: "DDOS" },
];

/* ── Digest content per topic — multi-channel cluster preview ── */
const DIGEST_FOR_TOPIC = {
  "Fortinet CVE": [
    { channelId: "moon-cloud",          channel: "Moon Cloud",          sender: "vuln_research", senderColor: "#a78bfa",
      snippet: "Fortinet FortiGate CVE-2026-0817: PoC released. Pre-auth RCE on management interface. ~40k vulnerable instances on Shodan.",
      time: "11m ago", tags: ["#fortinet", "#rce", "#poc"] },
    { channelId: "breachforums-alerts", channel: "BreachForums Alerts", sender: "exploit_dealer", senderColor: "#f87171",
      snippet: "Selling weaponized Fortinet exploit. Reliable RCE chain. $15k. Negotiable for bulk.",
      time: "47m ago", tags: ["#exploit", "#0day", "#sale"] },
    { channelId: "darkforums-chat",     channel: "DarkForums_chat",     sender: "scanner_op",     senderColor: "#fb923c",
      snippet: "Scanned 12k Fortinet appliances over the weekend, 3.2k confirmed vulnerable, 80% in EU. List for sale.",
      time: "2h ago", tags: ["#recon", "#shodan"] },
    { channelId: "cyber-resistance",    channel: "Cyber Islamic Resistance", sender: "ops_leader", senderColor: "#fb923c",
      snippet: "Fortinet CVE adopted into our toolkit. 3 successful intrusions on Israeli targets last 24h.",
      time: "5h ago", tags: ["#OpIsrael", "#exploit"] },
  ],
  "Stealer Logs": [
    { channelId: "moon-cloud",          channel: "Moon Cloud",      sender: "MoonCloud Bot",  senderColor: "#e8a855",
      snippet: "Daily stealer statistics: 142,801 logs processed. Top stealer: Raccoon v2 (34% share).",
      time: "1h ago", tags: ["#stats", "#raccoon"] },
    { channelId: "moon-cloud",          channel: "Moon Cloud",      sender: "fresh_logs_daily", senderColor: "#f87171",
      snippet: "Fresh logs: greenanimalsbank.com — 23 entries, VPN + SSO + saved passwords. Verified <12h.",
      time: "2h ago", tags: ["#banking", "#vpn"] },
    { channelId: "darkforums-chat",     channel: "DarkForums_chat", sender: "card_master",      senderColor: "#fb923c",
      snippet: "Combo list — banking + crypto, 4,200 records, mixed regions. $200.",
      time: "5h ago", tags: ["#combo", "#banking"] },
  ],
  "#OpIsrael": [
    { channelId: "cyber-resistance", channel: "Cyber Islamic Resistance", sender: "CIR Spokesperson", senderColor: "#f87171",
      snippet: "Successful DDoS on 14 Israeli government targets in last 6 hours.",
      time: "30m ago", tags: ["#OpIsrael", "#DDoS"] },
    { channelId: "cyber-resistance", channel: "Cyber Islamic Resistance", sender: "ops_leader",      senderColor: "#fb923c",
      snippet: "Next wave: 12:00 UTC. Targets shared in private channel.",
      time: "1h ago",  tags: ["#OpIsrael"] },
    { channelId: "opisrael-official", channel: "OpIsrael Official", sender: "OpIsrael Admin", senderColor: "#f87171",
      snippet: "Targets confirmed for next operation. greenanimalsbank.com on the secondary list. Primary: 14 IL government domains.",
      time: "2d ago", tags: ["#OpIsrael", "#targets"] },
    { channelId: "opisrael-official", channel: "OpIsrael Official", sender: "ddosia_relay", senderColor: "#6ab3f3",
      snippet: "Botnet ready. 47k nodes online. Coordinating with @cyber-resistance for synchronized hits.",
      time: "2d ago", tags: ["#DDoS", "#coordination"] },
  ],
  "Snowflake Breach": [
    { channelId: "breachforums-alerts", channel: "BreachForums Alerts", sender: "snowflake_ops", senderColor: "#a78bfa",
      snippet: "165 Snowflake customer environments confirmed exposed. Authentication bypass via leaked tokens. Full list under bid.",
      time: "23m ago", tags: ["#snowflake", "#cloud", "#bid"] },
    { channelId: "darkforums-chat", channel: "DarkForums_chat", sender: "data_broker", senderColor: "#fb923c",
      snippet: "Selling extracted data from 3 Snowflake breaches. AT&T, TicketBay, Pure Storage clients. $30k each.",
      time: "1h ago", tags: ["#snowflake", "#data", "#sale"] },
    { channelId: "moon-cloud", channel: "Moon Cloud", sender: "log_analyst", senderColor: "#e8a855",
      snippet: "Snowflake authentication tokens in our dataset increased 3x this week. ~412 valid tokens identified.",
      time: "3h ago", tags: ["#tokens", "#snowflake"] },
    { channelId: "bidencash-carders", channel: "BidenCash Carders", sender: "vendor_42", senderColor: "#fb923c",
      snippet: "Snowflake-derived customer PII batch — 47k records, US healthcare. Verified <24h, $8k for the lot.",
      time: "5h ago", tags: ["#pii", "#healthcare"] },
  ],
  "BidenCash": [
    { channelId: "bidencash-carders", channel: "BidenCash Carders", sender: "BidenCash Bot", senderColor: "#e8a855",
      snippet: "Daily marketplace digest: 12,840 new listings, 4,201 fresh CVVs, 47 BINs added. 2,103 active vendors.",
      time: "1h ago", tags: ["#stats", "#marketplace"] },
    { channelId: "bidencash-carders", channel: "BidenCash Carders", sender: "vendor_42", senderColor: "#fb923c",
      snippet: "Premium drop: 800 freshly-checked Indonesian bank cards. BIN 222222 x320 + Visa Premium 480 verified <8h.",
      time: "5h ago", tags: ["#sea", "#banking"] },
    { channelId: "darkforums-chat", channel: "DarkForums_chat", sender: "card_master", senderColor: "#fb923c",
      snippet: "BidenCash escrow now mandatory for >$500. Quality dropped 18% over last quarter per buyer reviews.",
      time: "8h ago", tags: ["#bidencash", "#escrow"] },
  ],
  "LockBit": [
    { channelId: "breachforums-alerts", channel: "BreachForums Alerts", sender: "BF Admin", senderColor: "#a78bfa", isClaim: true,
      snippet: "LockBit 4.0 victim list updated: 12 new entries. Healthcare and manufacturing dominate this week.",
      time: "1h ago", tags: ["#lockbit", "#victims"] },
    { channelId: "darkforums-chat", channel: "DarkForums_chat", sender: "ransom_ops", senderColor: "#f87171",
      snippet: "LockBit affiliate program updated: 80/20 split for new affiliates with 3+ confirmed payouts.",
      time: "4h ago", tags: ["#lockbit", "#affiliate"] },
    { channelId: "moon-cloud", channel: "Moon Cloud", sender: "log_seller_23", senderColor: "#6ab3f3",
      snippet: "Stealer logs include 14 valid LockBit panel credentials. Selling separately, $2k each, escrow only.",
      time: "11h ago", tags: ["#lockbit", "#panel"] },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
   ICONS — inline SVG strokes (no emoji per project rules)
   ──────────────────────────────────────────────────────────────────────────── */
const Icon = {
  paperPlane: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  bell:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  search:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:       (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>,
  arrowUp:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 14l6-6 6 6"/></svg>,
  arrowDown:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 10l6 6 6-6"/></svg>,
  arrowFlat:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><path d="M5 12h14"/></svg>,
  back:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  more:       (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><circle cx="12" cy="6" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18" r="1.6"/></svg>,
  forward:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>,
  file:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  pin:        (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  lock:       (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  enter:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

/* ────────────────────────────────────────────────────────────────────────────
   HELPER COMPONENTS
   ──────────────────────────────────────────────────────────────────────────── */

function YoursTag() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 5,
      background: "rgba(255,69,98,0.12)", border: "1px solid rgba(255,69,98,0.25)",
      color: "#FF4562", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
      fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF4562", boxShadow: "0 0 6px rgba(255,69,98,0.7)" }} />
      Yours
    </span>
  );
}

/** Renders text with [match]…[/match] runs highlighted. */
function HighlightedText({ text, color = "#FF4562", bg = "rgba(255,69,98,0.16)", inheritColor = false }) {
  const parts = String(text).split(/(\[match\][^[]+\[\/match\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[match\](.+)\[\/match\]$/);
        if (m) return (
          <em key={i} style={{
            fontStyle: "normal", fontWeight: 700,
            color, background: bg,
            padding: "0 3px", borderRadius: 2,
          }}>{m[1]}</em>
        );
        return <span key={i} style={{ color: inheritColor ? "inherit" : undefined }}>{p}</span>;
      })}
    </>
  );
}

function MentionCard({ m, active, onClick }) {
  const sevColor = SEV[m.severity];
  const ct = CT[m.channelType];
  return (
    <div onClick={onClick} style={{
      position: "relative", padding: "11px 13px", borderRadius: 10,
      background: active ? "rgba(34,211,238,0.04)" : "var(--bg-card, rgba(255,255,255,0.02))",
      border: `1px solid ${active ? "rgba(34,211,238,0.3)" : "var(--border, rgba(255,255,255,0.05))"}`,
      cursor: "pointer", transition: "all 0.15s",
      marginBottom: 6,
    }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "rgba(34,211,238,0.18)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--border, rgba(255,255,255,0.05))"; }}
    >
      {active && (
        <div style={{
          position: "absolute", right: -1, top: 8, bottom: 8, width: 3,
          background: TG.cyan, borderRadius: "3px 0 0 3px",
        }} />
      )}
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: ct.bg, color: ct.fg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}>{m.channel[0]}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", flexShrink: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.channel}</span>
        <span style={{ fontSize: 8, color: "var(--text-25)", fontFamily: "'JetBrains Mono', monospace" }}>{m.members}</span>
        <span style={{
          fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 3, marginLeft: "auto",
          background: `${sevColor}20`, color: sevColor, letterSpacing: "0.06em",
          fontFamily: "'JetBrains Mono', monospace",
        }}>{m.severity.toUpperCase()}</span>
        <span style={{ fontSize: 8, color: "var(--text-25)", fontFamily: "'JetBrains Mono', monospace" }}>{m.time}</span>
      </div>
      {/* Excerpt */}
      <div style={{ fontSize: 10.5, color: "var(--text-50)", lineHeight: 1.5, marginBottom: 6 }}>
        <HighlightedText text={`"${m.excerpt}"`} />
      </div>
      {/* Footer pills */}
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        {m.matchTypes.map((mt) => {
          const c = MT[mt];
          return (
            <span key={mt} style={{
              fontSize: 7.5, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
              background: c.bg, color: c.fg, letterSpacing: "0.04em",
              fontFamily: "'JetBrains Mono', monospace",
            }}>{c.label}</span>
          );
        })}
        <span style={{
          marginLeft: "auto", fontSize: 7, fontWeight: 600, padding: "1px 6px", borderRadius: 3,
          background: ct.bg, color: ct.fg, letterSpacing: "0.04em",
          fontFamily: "'JetBrains Mono', monospace",
        }}>{ct.label}</span>
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <span onClick={onClick} style={{
      fontSize: 9, fontWeight: 700, padding: "4px 10px", borderRadius: 5,
      letterSpacing: "0.06em",
      border: `1px solid ${active ? "rgba(34,211,238,0.3)" : "var(--border, rgba(255,255,255,0.05))"}`,
      background: active ? "rgba(34,211,238,0.10)" : "transparent",
      color: active ? TG.cyan : "var(--text-35)",
      cursor: "pointer", transition: "all 0.15s",
      fontFamily: "'JetBrains Mono', monospace",
    }}>{label}</span>
  );
}

function TopicPill({ pill, active, onClick }) {
  const isDyn = pill.kind === "dynamic";
  const isHot = pill.hot;
  let bg = "rgba(80,80,100,0.10)", color = "var(--text-50)", border = "1px solid var(--border-light, rgba(255,255,255,0.05))";
  if (isHot) {
    bg = "rgba(255,69,98,0.10)"; color = "#FF4562"; border = "1px solid rgba(255,69,98,0.25)";
  } else if (isDyn) {
    bg = "transparent"; color = "#F59E0B"; border = "1px dashed rgba(245,158,11,0.4)";
  }
  if (active) {
    bg = "rgba(34,211,238,0.14)"; color = TG.cyan; border = "1px solid rgba(34,211,238,0.4)";
  }
  return (
    <span onClick={onClick} style={{
      fontSize: 9.5, fontWeight: 700, padding: "5px 11px", borderRadius: 5,
      whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,
      letterSpacing: "0.04em",
      background: bg, color, border,
      transition: "all 0.15s",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {isDyn && <Icon.star width="9" height="9" />}
      {pill.label}
    </span>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14, width: 36, flexShrink: 0 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${Math.max(2, (v / max) * 14)}px`, borderRadius: 1,
          background: i === data.length - 1 ? color : `${color}55`,
          transition: "height 0.4s",
        }} />
      ))}
    </div>
  );
}

function TrendingRow({ row, onClick }) {
  const c = CAT[row.category];
  const arrowColor = row.deltaDir === "up" ? "#FF4562" : row.deltaDir === "down" ? "#16A34A" : "var(--text-30)";
  const ArrowIcon = row.deltaDir === "up" ? Icon.arrowUp : row.deltaDir === "down" ? Icon.arrowDown : Icon.arrowFlat;
  const sparkColor = row.deltaPct >= 100 ? "#FF4562" : row.deltaPct >= 30 ? "#F59E0B" : "var(--text-50)";
  return (
    <div onClick={onClick} style={{
      display: "grid", gridTemplateColumns: "minmax(0,1fr) 40px 60px 70px 130px",
      alignItems: "center", gap: 10,
      padding: "9px 14px", fontSize: 10.5,
      borderBottom: "1px solid var(--border-row, rgba(255,255,255,0.02))",
      cursor: "pointer", transition: "background 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,211,238,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--text)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <span style={{
          fontSize: 7.5, fontWeight: 700, padding: "2px 5px", borderRadius: 3,
          background: c.bg, color: c.fg, letterSpacing: "0.05em",
          fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
        }}>{row.category}</span>
        {row.dynamic && <Icon.star width="9" height="9" style={{ color: "#F59E0B", flexShrink: 0 }} />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.keyword}</span>
      </div>
      <Sparkline data={row.sparks} color={sparkColor} />
      <div style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: row.deltaPct >= 100 ? "#FF4562" : row.deltaPct >= 30 ? "#F59E0B" : "var(--text)", textAlign: "right" }}>
        {row.volume.toLocaleString()}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 3, color: arrowColor, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", justifyContent: "flex-end" }}>
        <ArrowIcon width="9" height="9" />
        <span>{row.deltaDir === "flat" ? "0%" : `${row.deltaPct}%`}</span>
      </div>
      <div style={{ fontSize: 9, color: "var(--text-30)", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>{row.topChannel}</div>
    </div>
  );
}

/* ── Phone subcomponents ── */

function PhoneFrame({ children }) {
  return (
    <div style={{
      flex: 1, minHeight: 540,
      background: TG.bg,
      border: `2px solid ${TG.border}`,
      borderRadius: 28,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: "0 10px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(80,90,110,0.08)",
      position: "relative",
    }}>
      {/* Notch */}
      <div style={{ width: 100, height: 4, background: "rgba(20,28,40,0.9)", borderRadius: "0 0 8px 8px", margin: "0 auto", flexShrink: 0 }} />
      {children}
    </div>
  );
}

function PhoneHeader({ channel, mode, onBack }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      background: TG.bgHeader,
      borderBottom: `1px solid ${TG.borderSoft}`,
      flexShrink: 0,
    }}>
      {mode !== "empty" && (
        <button onClick={onBack} style={{
          background: "none", border: "none", color: TG.cyan, cursor: "pointer",
          padding: 0, display: "flex", alignItems: "center",
        }}>
          <Icon.back width="14" height="14" />
        </button>
      )}
      {channel ? (
        <>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: channel.accentBg, color: channel.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            flexShrink: 0,
          }}>{channel.initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>{channel.name}</div>
            <div style={{ fontSize: 8, color: TG.metaDim, fontFamily: "'JetBrains Mono', monospace" }}>
              {channel.members} members · {channel.typeLabel} · Last active: {channel.lastActive}
            </div>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>Telegram Intelligence Viewer</div>
      )}
      <div style={{ display: "flex", gap: 8, color: TG.metaDim }}>
        <Icon.search width="13" height="13" />
        <Icon.more width="13" height="13" />
      </div>
    </div>
  );
}

function TgBubble({ msg }) {
  if (msg.kind === "date") {
    return (
      <div style={{ textAlign: "center", fontSize: 7.5, color: TG.metaDim, padding: "8px 0", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
        — {msg.text} —
      </div>
    );
  }
  return (
    <div style={{
      background: msg.isHighlighted ? TG.bubbleHi : TG.bubble,
      border: msg.isHighlighted ? `1px solid ${TG.bubbleHiBd}` : "1px solid transparent",
      borderRadius: "12px 12px 12px 4px",
      padding: "8px 11px", maxWidth: "88%", alignSelf: "flex-start",
      position: "relative",
    }}>
      {msg.forwardedFrom && (
        <div style={{ fontSize: 7.5, color: TG.cyan, marginBottom: 4, paddingLeft: 6, borderLeft: `2px solid ${TG.cyan}55` }}>
          <Icon.forward width="8" height="8" style={{ display: "inline", marginRight: 3, verticalAlign: "middle" }} />
          Forwarded from <strong style={{ color: TG.cyan }}>{msg.forwardedFrom}</strong>
        </div>
      )}
      {msg.isClaim && (
        <div style={{
          display: "inline-block", fontSize: 7.5, padding: "2px 6px", borderRadius: 3,
          background: "rgba(255,69,98,0.18)", color: "#FF4562", fontWeight: 700,
          letterSpacing: "0.08em", marginBottom: 4,
          fontFamily: "'JetBrains Mono', monospace",
        }}>⚠ CLAIM</div>
      )}
      <div style={{ fontSize: 8.5, fontWeight: 700, marginBottom: 4, color: msg.senderColor }}>{msg.sender}</div>
      <div style={{ fontSize: 9.5, color: TG.bubbleText, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
        <HighlightedText text={msg.text} color="#FF7A8E" bg="rgba(255,69,98,0.18)" />
      </div>
      {msg.tags && (
        <div style={{ display: "flex", gap: 3, marginTop: 5, flexWrap: "wrap" }}>
          {msg.tags.map((t, i) => (
            <span key={i} style={{
              fontSize: 6.5, padding: "1px 5px", borderRadius: 3,
              background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.7)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>{t}</span>
          ))}
        </div>
      )}
      {msg.file && (
        <div style={{
          display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 6,
          background: "rgba(15,23,42,0.5)", border: `1px solid ${TG.borderSoft}`,
          marginTop: 5,
        }}>
          <Icon.file width="14" height="14" style={{ color: TG.cyan, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8, fontWeight: 600, color: TG.bubbleText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.file.name}</div>
            <div style={{ fontSize: 7, color: TG.metaDim, fontFamily: "'JetBrains Mono', monospace" }}>{msg.file.size}</div>
          </div>
        </div>
      )}
      <div style={{ fontSize: 7, color: TG.metaDim, textAlign: "right", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
        {msg.matchedKeyword && (
          <>
            <Icon.pin width="8" height="8" style={{ color: "#FF4562" }} />
            <span style={{ color: "#FF4562" }}>matched: {msg.matchedKeyword}</span>
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: TG.metaDim, margin: "0 2px" }} />
          </>
        )}
        {msg.time}
      </div>
    </div>
  );
}

function PhoneMessages({ children }) {
  return (
    <div style={{
      flex: 1, overflowY: "auto", padding: "12px 14px",
      display: "flex", flexDirection: "column", gap: 6,
      position: "relative",
    }}>
      {children}
    </div>
  );
}

function PhoneBottom() {
  return (
    <div style={{
      padding: "9px 14px",
      background: TG.bgBottom,
      borderTop: `1px solid ${TG.borderSoft}`,
      fontSize: 8, color: TG.metaDim,
      textAlign: "center", flexShrink: 0,
      fontFamily: "'JetBrains Mono', monospace",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon.lock width="9" height="9" />
        Read-only intelligence viewer
      </span>
      <span style={{ width: 2, height: 2, borderRadius: "50%", background: TG.metaDim }} />
      <span style={{ color: TG.cyan, cursor: "pointer" }}>Export</span>
      <span style={{ width: 2, height: 2, borderRadius: "50%", background: TG.metaDim }} />
      <span style={{ color: TG.cyan, cursor: "pointer" }}>Create Incident</span>
    </div>
  );
}

function DigestBody({ topic, onEnter }) {
  const entries = DIGEST_FOR_TOPIC[topic] || [];
  if (!entries.length) {
    return (
      <PhoneMessages>
        <div style={{ textAlign: "center", padding: "40px 20px", color: TG.metaDim, fontSize: 10 }}>
          No matching messages for "<span style={{ color: TG.bubbleText }}>{topic}</span>" yet.
        </div>
      </PhoneMessages>
    );
  }
  // Group by channel
  const byChannel = entries.reduce((acc, e) => {
    (acc[e.channelId] = acc[e.channelId] || { channel: e.channel, channelId: e.channelId, items: [] }).items.push(e);
    return acc;
  }, {});
  return (
    <PhoneMessages>
      {Object.values(byChannel).map((g, i) => (
        <div key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 6px" }}>
            <div style={{ flex: 1, height: 1, background: TG.borderSoft }} />
            <span style={{ fontSize: 8, color: TG.cyan, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>{g.channel}</span>
            <div style={{ flex: 1, height: 1, background: TG.borderSoft }} />
          </div>
          {g.items.map((e, j) => (
            <TgBubble key={j} msg={{
              id: `dg-${i}-${j}`, sender: e.sender, senderColor: e.senderColor,
              text: e.snippet, tags: e.tags, time: e.time,
            }} />
          ))}
          <div onClick={() => onEnter(g.channelId)} style={{
            fontSize: 8, color: TG.cyan, cursor: "pointer",
            padding: "5px 8px", border: `1px solid rgba(34,211,238,0.25)`, borderRadius: 5,
            margin: "6px auto", display: "inline-flex", alignItems: "center", gap: 5,
            alignSelf: "center", fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
          }}>
            Enter channel <Icon.enter width="9" height="9" />
          </div>
        </div>
      ))}
    </PhoneMessages>
  );
}

function EmptyPhone() {
  return (
    <PhoneMessages>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px", gap: 10 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(34,211,238,0.10)", border: `1px solid ${TG.bubbleHiBd}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: TG.cyan,
        }}>
          <Icon.paperPlane width="22" height="22" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: TG.bubbleText }}>No channel selected</div>
        <div style={{ fontSize: 9.5, color: TG.metaDim, lineHeight: 1.5, maxWidth: 260 }}>
          Pick a mention from your alerts, search a keyword, or click a trending topic to load its messages here.
        </div>
      </div>
    </PhoneMessages>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────────────────────── */

export default function Telegram() {
  const { t } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [viewer, setViewer] = useState({ kind: "channel", channelId: "moon-cloud" });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [showAllMentions, setShowAllMentions] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Filters
  const visibleMentions = showAllMentions ? MY_MENTIONS : MY_MENTIONS.slice(0, 3);
  const filteredTrending = useMemo(() => {
    return TRENDING_ROWS.filter((r) => {
      if (category !== "ALL" && r.topicCategory !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return r.keyword.toLowerCase().includes(q) || r.topChannel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, query]);

  const visibleTopics = useMemo(() => {
    if (category === "ALL") return TOPIC_PILLS;
    return TOPIC_PILLS.filter((p) => p.category === category);
  }, [category]);

  // Phone routing
  const currentChannel = viewer.kind === "channel" && viewer.channelId ? CHANNELS[viewer.channelId] : null;
  const handleBack = () => setViewer({ kind: "empty" });
  const enterChannel = (channelId) => setViewer({ kind: "channel", channelId });
  const onSearchSubmit = () => {
    if (!query.trim()) return;
    setViewer({ kind: "digest", topic: query.trim() });
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>

      {/* ═══ BANNER ═══ */}
      <div className="glass" style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 16,
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: TG.cyan, flexShrink: 0,
        }}>
          <Icon.paperPlane width="20" height="20" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div className="mono" style={{ fontSize: 9, color: t.text25, letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 700 }}>Telegram Monitor</div>
            <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(255,69,98,0.14)", color: "#FF4562", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
              {MY_MENTIONS.length} new mentions
            </span>
          </div>
          <div style={{ fontSize: 11, color: t.text50 }}>Real-time intelligence from underground Telegram channels</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexShrink: 0 }}>
          {[
            { l: "Monitored Channels", v: "2,340",  c: TG.cyan },
            { l: "Your Mentions",      v: MY_MENTIONS.length, c: "#FF4562" },
            { l: "Messages Today",     v: "14,203", c: "var(--text)" },
            { l: "Trending Topics",    v: TRENDING_ROWS.length + 6, c: "#F59E0B" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 70 }}>
              <div style={{ fontSize: 7, color: t.text25, letterSpacing: "0.10em", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 1 }}>{s.l.toUpperCase()}</div>
              <div className="hfont" style={{ fontSize: 18, fontWeight: 700, color: s.c, letterSpacing: "-0.01em" }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TWO-PANEL ═══ */}
      <div style={{
        display: "grid", gridTemplateColumns: "6fr 4fr", gap: 16, minHeight: 720,
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>

        {/* ─── LEFT PANEL ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

          {/* Your Mentions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <YoursTag />
                <Icon.bell width="13" height="13" style={{ color: t.text50 }} />
                <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Your Mentions</span>
                <span style={{
                  fontSize: 8.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  background: "rgba(255,69,98,0.14)", color: "#FF4562",
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
                }}>{MY_MENTIONS.length} new</span>
              </div>
              <span className="mono" style={{ fontSize: 10, color: TG.cyan, cursor: "pointer", fontWeight: 600 }}>View All →</span>
            </div>

            {visibleMentions.map((m) => (
              <MentionCard
                key={m.id}
                m={m}
                active={viewer.kind === "channel" && viewer.channelId === m.channelId}
                onClick={() => enterChannel(m.channelId)}
              />
            ))}

            {!showAllMentions && (
              <div style={{ textAlign: "center", padding: "6px 0" }}>
                <span onClick={() => setShowAllMentions(true)} className="mono" style={{ fontSize: 9.5, color: TG.cyan, cursor: "pointer", fontWeight: 600 }}>
                  Show {MY_MENTIONS.length - 3} more mentions ↓
                </span>
              </div>
            )}
          </div>

          {/* Trending Intelligence */}
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: t.text25, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
              Trending Intelligence
            </div>

            {/* Category pills */}
            <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
              {TRENDING_CATEGORIES.map((c) => (
                <CategoryPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
              ))}
            </div>

            {/* Topic pill row (horizontal scroll) */}
            <div style={{
              display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, marginBottom: 10,
              scrollbarWidth: "thin",
            }}>
              {visibleTopics.map((p) => (
                <TopicPill
                  key={p.label}
                  pill={p}
                  active={viewer.kind === "digest" && viewer.topic === p.label}
                  onClick={() => setViewer({ kind: "digest", topic: p.label })}
                />
              ))}
            </div>

            {/* Trending list */}
            <div className="glass" style={{ overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "minmax(0,1fr) 40px 60px 70px 130px",
                gap: 10, padding: "8px 14px",
                fontSize: 7.5, color: t.text20, letterSpacing: "0.10em", fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                borderBottom: `1px solid ${t.borderSection}`,
              }}>
                <span>Keyword</span>
                <span style={{ textAlign: "center" }}>Trend</span>
                <span style={{ textAlign: "right" }}>Volume</span>
                <span style={{ textAlign: "right" }}>Δ 24h</span>
                <span style={{ textAlign: "right" }}>Top Channel</span>
              </div>
              {filteredTrending.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: 11, color: t.text35 }}>
                  No trending keywords match this filter.
                </div>
              ) : (
                filteredTrending.map((row, i) => (
                  <TrendingRow key={i} row={row} onClick={() => setViewer({ kind: "digest", topic: row.keyword })} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Icon.search width="14" height="14" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4, color: t.text }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit(); }}
              placeholder='Search Telegram channels and messages…  AND, OR, NOT, "exact", @channel'
              style={{
                width: "100%", padding: "10px 14px 10px 36px",
                fontSize: 11, fontFamily: "'Inter', sans-serif",
                background: t.bgInput, color: t.text,
                border: `1px solid ${t.borderLight}`, borderRadius: 9,
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(34,211,238,0.4)"}
              onBlur={(e) => e.target.style.borderColor = t.borderLight}
            />
          </div>

          {/* Operator chips */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              { label: "Last 24h", active: true }, { label: "7d" }, { label: "30d" }, { label: "90d" },
              { divider: true },
              { label: "All Types", active: true }, { label: "Stealer" }, { label: "Hacktivist" }, { label: "Carding" }, { label: "Ransom" },
              { divider: true },
              { label: "All Lang", active: true }, { label: "EN" }, { label: "RU" }, { label: "AR" },
            ].map((op, i) => op.divider ? (
              <span key={i} style={{ width: 1, height: 16, background: t.borderLight, margin: "0 2px", alignSelf: "center" }} />
            ) : (
              <span key={i} style={{
                fontSize: 8, padding: "3px 8px", borderRadius: 4,
                border: `1px solid ${op.active ? "rgba(34,211,238,0.3)" : t.borderLight}`,
                background: op.active ? "rgba(34,211,238,0.10)" : "transparent",
                color: op.active ? TG.cyan : t.text35,
                cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em", fontWeight: 600,
              }}>{op.label}</span>
            ))}
          </div>

          {/* Phone */}
          <PhoneFrame>
            <PhoneHeader channel={currentChannel} mode={viewer.kind} onBack={handleBack} />
            {viewer.kind === "channel" && currentChannel && (
              <PhoneMessages>
                {currentChannel.messages.map((msg, i) => <TgBubble key={msg.id || `d-${i}`} msg={msg} />)}
              </PhoneMessages>
            )}
            {viewer.kind === "digest" && <DigestBody topic={viewer.topic} onEnter={enterChannel} />}
            {viewer.kind === "empty" && <EmptyPhone />}
            <PhoneBottom />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
