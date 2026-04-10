import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SortHeader, useSort, usePagination, Pagination, exportCSV, ExportButton, RowChevron, CopyCell, TimeCell, stickyHeaderStyle, useSelection, Checkbox, BulkActionBar, useTimeRange, TimeRangeFilter } from "../components/TableUtils";
import { useTheme } from "../context/ThemeContext";

// ── VIP Profiles ──
const VIP_PROFILES = {
  "gabriel@gmail.com": {
    name: "Gabriel Jackson", email: "gabriel@gmail.com", riskScore: 55, riskLevel: "HIGH",
    breaches: 13, passwords: 10, dataClasses: 13, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "Email addresses, Usernames", severity: "HIGH", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "Passwords", severity: "HIGH", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "Genders, Names, Dates of birth", severity: "HIGH", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "Employers, Job titles", severity: "HIGH", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "IP addresses, Physical addresses", severity: "HIGH", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "Phone numbers", severity: "HIGH", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [
      { date: "Apr 2025", types: ["Email addresses", "Passwords"], severity: "high" },
      { date: "Feb 2025", types: ["Email addresses", "Passwords"], severity: "high" },
      { date: "Aug 2024", types: ["Email addresses"], severity: "medium" },
      { date: "May 2024", types: ["Email addresses", "Passwords", "Usernames"], severity: "high" },
      { date: "Nov 2020", types: ["Email addresses", "Passwords"], severity: "medium" },
      { date: "Oct 2019", types: ["Email addresses", "Employers", "Geographic locations", "Job titles", "Names", "Phone numbers"], severity: "critical" },
    ],
    sources: [
      { name: "Credential Databases", severity: "VERY HIGH" },
      { name: "Email & Communication", severity: "VERY HIGH" },
      { name: "Breach Databases", severity: "VERY HIGH" },
      { name: "Telecom & ISP", severity: "VERY HIGH" },
      { name: "Professional & Corporate", severity: "VERY HIGH" },
    ],
    attackVectors: [
      { label: "Credential Stuffing", severity: "VERY HIGH", desc: "10 breaches exposed passwords or password hints. Attackers use these in automated login attacks across banking, email, and SaaS platforms.", color: "#DC2626" },
      { label: "Identity Theft", severity: "HIGH", desc: "3 PII categories (names, DOB, gender) exposed across 2 breaches. Sufficient for fraudulent credit applications.", color: "#EA580C" },
      { label: "Financial Fraud", severity: "LOW", desc: "No direct financial data exposure found in breach records.", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "VERY HIGH", desc: "Phone numbers exposed in 2 breaches. Enables telecom social engineering to hijack phone and intercept 2FA.", color: "#DC2626" },
      { label: "Spear Phishing", severity: "VERY HIGH", desc: "13 total breaches provide rich context for highly targeted phishing. Professional role data enables impersonation.", color: "#DC2626" },
      { label: "Account Recovery Abuse", severity: "HIGH", desc: "DOB exposed in 1 breach. Can answer common security questions to gain unauthorized access to portals.", color: "#EA580C" },
    ],
  },
  "simon.johnsson@greenanimals.com": {
    name: "Simon Johnsson", email: "simon.johnsson@greenanimals.com", riskScore: 72, riskLevel: "VERY HIGH",
    breaches: 8, passwords: 6, dataClasses: 9, pastes: 2,
    categories: [
      { label: "Online Accounts & Email", desc: "Email addresses, Usernames, OAuth tokens", severity: "VERY HIGH", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "Passwords, Password hints, Security questions", severity: "VERY HIGH", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "Full name, DOB, National ID", severity: "HIGH", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "Employer, Role: CFO, Department", severity: "VERY HIGH", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "Office IP ranges, Home IP, City", severity: "MEDIUM", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "Personal mobile, Office direct line", severity: "HIGH", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [
      { date: "Aug 2025", types: ["Email addresses", "Passwords"], severity: "high" },
      { date: "Jul 2025", types: ["Email addresses", "Passwords", "Employer"], severity: "high" },
      { date: "Mar 2025", types: ["Email addresses", "National IDs"], severity: "critical" },
      { date: "Dec 2024", types: ["Email addresses", "Phone numbers"], severity: "medium" },
      { date: "Sep 2024", types: ["Email addresses", "Passwords", "Security questions"], severity: "high" },
    ],
    sources: [
      { name: "Credential Databases", severity: "VERY HIGH" },
      { name: "Paste Sites", severity: "HIGH" },
      { name: "Breach Databases", severity: "VERY HIGH" },
      { name: "Dark Web Forums", severity: "VERY HIGH" },
      { name: "Telegram Channels", severity: "HIGH" },
    ],
    attackVectors: [
      { label: "Credential Stuffing", severity: "VERY HIGH", desc: "6 passwords exposed across 8 breaches. CFO-level credentials are high-value targets for financial system access.", color: "#DC2626" },
      { label: "Identity Theft", severity: "VERY HIGH", desc: "National ID exposed in Mar 2025 breach. Combined with name/DOB, enables full identity impersonation and bank fraud.", color: "#DC2626" },
      { label: "Financial Fraud", severity: "HIGH", desc: "CFO role data paired with corporate email enables business email compromise (BEC) attacks targeting finance teams.", color: "#EA580C" },
      { label: "SIM Swap Attack", severity: "HIGH", desc: "Personal mobile number found in Dec 2024 breach. SIM swap could bypass 2FA on banking and corporate accounts.", color: "#EA580C" },
      { label: "Spear Phishing", severity: "VERY HIGH", desc: "8 breaches with role and employer data. Attackers can craft convincing CFO-targeted phishing with financial urgency pretexts.", color: "#DC2626" },
      { label: "Account Recovery Abuse", severity: "HIGH", desc: "Security questions exposed in Sep 2024. Common recovery flows for banking portals are compromised.", color: "#EA580C" },
    ],
  },
  "dogan.akkaya@socradar.io": {
    name: "Dogan Akkaya", email: "dogan.akkaya@socradar.io", riskScore: 38, riskLevel: "MEDIUM",
    breaches: 3, passwords: 1, dataClasses: 5, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "Email addresses, Usernames", severity: "MEDIUM", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "One password (hashed)", severity: "MEDIUM", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "Full name", severity: "LOW", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "Employer: SOCRadar, Role: Product Team", severity: "MEDIUM", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "City-level geolocation (Ankara)", severity: "LOW", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "No phone data found", severity: "LOW", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [
      { date: "Sep 2025", types: ["VIP Mention", "Telegram channel"], severity: "medium" },
      { date: "Jun 2025", types: ["Email addresses", "Passwords (hashed)"], severity: "high" },
      { date: "Jan 2025", types: ["Email addresses", "Employer"], severity: "medium" },
    ],
    sources: [
      { name: "Telegram Channels", severity: "MEDIUM" },
      { name: "Breach Databases", severity: "HIGH" },
      { name: "Professional & Corporate", severity: "MEDIUM" },
    ],
    attackVectors: [
      { label: "Credential Stuffing", severity: "MEDIUM", desc: "1 hashed password found. Risk depends on hash strength — if cracked, could grant access to SOCRadar internal tools.", color: "#CA8A04" },
      { label: "Identity Theft", severity: "LOW", desc: "Only name and employer exposed. Insufficient for identity theft without additional PII.", color: "#16A34A" },
      { label: "Financial Fraud", severity: "LOW", desc: "No financial data or executive-level authority role exposed.", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "LOW", desc: "No phone numbers found in any breach records.", color: "#16A34A" },
      { label: "Spear Phishing", severity: "HIGH", desc: "SOCRadar employee credentials are high-value for supply chain attacks. Employer and role data enable targeted social engineering.", color: "#EA580C" },
      { label: "Account Recovery Abuse", severity: "LOW", desc: "No security questions or recovery data exposed.", color: "#16A34A" },
    ],
  },
  "maria.berg@greenanimals.com": {
    name: "Maria Berg", email: "maria.berg@greenanimals.com", riskScore: 0, riskLevel: "LOW",
    breaches: 0, passwords: 0, dataClasses: 0, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "No data found", severity: "LOW", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "No data found", severity: "LOW", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "No data found", severity: "LOW", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "No data found", severity: "LOW", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "No data found", severity: "LOW", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "No data found", severity: "LOW", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [],
    sources: [],
    attackVectors: [
      { label: "Credential Stuffing", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Identity Theft", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Financial Fraud", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Spear Phishing", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Account Recovery Abuse", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
    ],
  },
  "ahmet.kara@socradar.io": {
    name: "Ahmet Kara", email: "ahmet.kara@socradar.io", riskScore: 15, riskLevel: "LOW",
    breaches: 1, passwords: 0, dataClasses: 2, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "Email addresses", severity: "LOW", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "No data found", severity: "LOW", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "No data found", severity: "LOW", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "Employer: SOCRadar, Role: Security Engineer", severity: "MEDIUM", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "No data found", severity: "LOW", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "No data found", severity: "LOW", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [
      { date: "Jan 2025", types: ["Email addresses"], severity: "medium" },
    ],
    sources: [
      { name: "Breach Databases", severity: "MEDIUM" },
    ],
    attackVectors: [
      { label: "Credential Stuffing", severity: "LOW", desc: "No passwords found in breach records.", color: "#16A34A" },
      { label: "Identity Theft", severity: "LOW", desc: "Minimal PII exposure.", color: "#16A34A" },
      { label: "Financial Fraud", severity: "LOW", desc: "No financial data exposed.", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "LOW", desc: "No phone numbers found.", color: "#16A34A" },
      { label: "Spear Phishing", severity: "MEDIUM", desc: "SOCRadar security engineer role makes this a potential supply chain target despite minimal data exposure.", color: "#CA8A04" },
      { label: "Account Recovery Abuse", severity: "LOW", desc: "No security questions exposed.", color: "#16A34A" },
    ],
  },
  "j.morrison@jtrustbank.co.id": {
    name: "James Morrison", email: "j.morrison@jtrustbank.co.id", riskScore: 0, riskLevel: "LOW",
    breaches: 0, passwords: 0, dataClasses: 0, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "No exposure", severity: "LOW", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "No exposure", severity: "LOW", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "No exposure", severity: "LOW", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "No exposure", severity: "LOW", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "No exposure", severity: "LOW", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "No exposure", severity: "LOW", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [],
    sources: [],
    attackVectors: [
      { label: "Credential Stuffing", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Identity Theft", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Financial Fraud", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Spear Phishing", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
      { label: "Account Recovery Abuse", severity: "LOW", desc: "No exposure found", color: "#16A34A" },
    ],
  },
  "elena.marchetti@socradar.io": {
    name: "Elena Marchetti", email: "elena.marchetti@socradar.io", riskScore: 5, riskLevel: "LOW",
    breaches: 0, passwords: 0, dataClasses: 0, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "No exposure detected", severity: "LOW", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "No exposure detected", severity: "LOW", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "No exposure detected", severity: "LOW", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "No exposure detected", severity: "LOW", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "No exposure detected", severity: "LOW", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "No exposure detected", severity: "LOW", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [],
    sources: [],
    attackVectors: [
      { label: "Credential Stuffing", severity: "LOW", desc: "No credentials found in any breach databases. Account is secure.", color: "#16A34A" },
      { label: "Identity Theft", severity: "LOW", desc: "No PII exposure detected.", color: "#16A34A" },
      { label: "Financial Fraud", severity: "LOW", desc: "No financial data exposure.", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "LOW", desc: "No phone data exposed.", color: "#16A34A" },
      { label: "Spear Phishing", severity: "LOW", desc: "Minimal attack surface — no breach data available for targeting.", color: "#16A34A" },
      { label: "Account Recovery Abuse", severity: "LOW", desc: "No security questions or recovery data exposed.", color: "#16A34A" },
    ],
  },
  "james.chen@greenanimalsbank.com": {
    name: "James Chen", email: "james.chen@greenanimalsbank.com", riskScore: 8, riskLevel: "LOW",
    breaches: 0, passwords: 0, dataClasses: 1, pastes: 0,
    categories: [
      { label: "Online Accounts & Email", desc: "Email address only (public)", severity: "LOW", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
      { label: "Credentials", desc: "No exposure detected", severity: "LOW", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
      { label: "Identity & PII", desc: "No exposure detected", severity: "LOW", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" },
      { label: "Professional Intel", desc: "No exposure detected", severity: "LOW", icon: "M3 21h18M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2M9 21V9m6 12V9" },
      { label: "Location & IP", desc: "No exposure detected", severity: "LOW", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" },
      { label: "Phone & Contact", desc: "No exposure detected", severity: "LOW", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72" },
    ],
    breachTimeline: [],
    sources: [{ name: "Professional & Corporate", severity: "LOW" }],
    attackVectors: [
      { label: "Credential Stuffing", severity: "LOW", desc: "No credentials exposed. Account is secure.", color: "#16A34A" },
      { label: "Identity Theft", severity: "LOW", desc: "No PII exposure.", color: "#16A34A" },
      { label: "Financial Fraud", severity: "LOW", desc: "No financial data found.", color: "#16A34A" },
      { label: "SIM Swap Attack", severity: "LOW", desc: "No phone data exposed.", color: "#16A34A" },
      { label: "Spear Phishing", severity: "LOW", desc: "Minimal exposure — low risk target.", color: "#16A34A" },
      { label: "Account Recovery Abuse", severity: "LOW", desc: "No recovery data exposed.", color: "#16A34A" },
    ],
  },
};

// ── VIP Alarm Records ──
const VIP_ALARMS = [
  { id: 1, vipName: "Gabriel Jackson", keyword: "gabriel@gmail.com", source: "https://t.me/emp_chat/273664", status: "Open", date: "2025-07-03", alarmType: "Breach Data", leakDate: "2025-07-02", password: "g****g", passwordType: "raw" },
  { id: 2, vipName: "Gabriel Jackson", keyword: "gabriel@gmail.com", source: "https://t.me/emp_chat/273664", status: "Open", date: "2025-07-03", alarmType: "Breach Data", leakDate: "2025-07-02", password: "g****g", passwordType: "raw" },
  { id: 3, vipName: "Gabriel Jackson", keyword: "gabriel@gmail.com", source: "https://t.me/emp_chat/273664", status: "Open", date: "2025-07-03", alarmType: "Breach Data", leakDate: "2025-07-01", password: "G****!", passwordType: "hashed" },
  { id: 4, vipName: "Gabriel Jackson", keyword: "gabriel@gmail.com", source: "https://shieldforum.net/threads/jefit-5-5m-email-pass.20164/", status: "Open", date: "2025-07-01", alarmType: "Breach Data", leakDate: "2025-06-28", password: "j****3", passwordType: "raw" },
  { id: 5, vipName: "Gabriel Jackson", keyword: "gabriel@gmail.com", source: "https://t.me/7357882541/48903", status: "Open", date: "2025-06-26", alarmType: "Breach Data", leakDate: "2025-06-25", password: "G****2", passwordType: "raw" },
  { id: 6, vipName: "Simon Johnsson", keyword: "simon.johnsson@greenanimals.com", source: "https://t.me/-1001389201445/9102", status: "Open", date: "2025-08-15", alarmType: "Breach Data", leakDate: "2025-08-14", password: "S****n", passwordType: "raw" },
  { id: 7, vipName: "Simon Johnsson", keyword: "simon.johnsson@greenanimals.com", source: "https://darkforums.st/thread/combo-aug-2025", status: "Open", date: "2025-08-10", alarmType: "Breach Data", leakDate: "2025-08-09", password: "J****!", passwordType: "hashed" },
  { id: 8, vipName: "Dogan Akkaya", keyword: "dogan.akkaya@socradar.io", source: "https://t.me/leaked_databases_2025/5521", status: "Open", date: "2025-09-22", alarmType: "VIP Mentions", leakDate: "—", password: "—", passwordType: "—" },
  { id: 9, vipName: "Elena Marchetti", keyword: "elena.marchetti@socradar.io", source: "—", status: "Closed", date: "2025-04-15", alarmType: "Monitoring", leakDate: "—", password: "—", passwordType: "—" },
  { id: 10, vipName: "James Chen", keyword: "james.chen@greenanimalsbank.com", source: "—", status: "Closed", date: "2025-03-20", alarmType: "Monitoring", leakDate: "—", password: "—", passwordType: "—" },
];

// ── CSV columns ──
const CSV_COLS = [
  { label: "VIP Name", field: "vipName" }, { label: "Keyword", field: "keyword" },
  { label: "Source", field: "source" }, { label: "Status", field: "status" },
  { label: "Date", field: "date" }, { label: "Alarm Type", field: "alarmType" },
];

// ── Timeline chart ──
const TREND_DATA = Array.from({ length: 13 }, (_, i) => {
  const d = new Date(2024, 11 + i, 1);
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const spike = i >= 6 && i <= 8 ? 200 + Math.random() * 150 : 0;
  return { month: label, vipMentions: 0, infoStealer: 0, breachData: Math.round(spike + Math.random() * 10) };
});

const RECORD_STATUS = [
  { label: "Open", count: 440, color: "#E8463A" },
  { label: "On Hold", count: 0, color: "#F59E0B" },
  { label: "Closed", count: 0, color: "#3B82F6" },
];

const TOP_ACCOUNTS = [
  { label: "gabriel@gmail.com", count: 336, color: "#E8463A" },
  { label: "mail@mail.com", count: 102, color: "#A855F7" },
  { label: "tanya.southey@gmail.c...", count: 1, color: "#3B82F6" },
  { label: "mmail@mail.com", count: 1, color: "#F59E0B" },
];

const SEV_COLOR = { "VERY HIGH": "#DC2626", "HIGH": "#EA580C", "MEDIUM": "#CA8A04", "LOW": "#16A34A" };
const SEV_BG = { "VERY HIGH": "rgba(220,38,38,0.12)", "HIGH": "rgba(234,88,12,0.1)", "MEDIUM": "rgba(202,138,4,0.1)", "LOW": "rgba(22,163,74,0.1)" };

// ── 3 featured VIP profiles for cards section ──
const FEATURED_EMAILS = ["gabriel@gmail.com", "simon.johnsson@greenanimals.com", "dogan.akkaya@socradar.io"];

function MiniDonut({ segments, size = 110 }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  let cumulative = 0;
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.count / total : 0;
        const offset = cumulative; cumulative += pct;
        return <circle key={i} cx="55" cy="55" r={r} fill="none" stroke={seg.color} strokeWidth="14" strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={-offset * circ} transform="rotate(-90 55 55)" />;
      })}
      <text x="55" y="53" textAnchor="middle" dominantBaseline="central" fill="#E8ECF1" fontSize="16" fontWeight="800" fontFamily="'Plus Jakarta Sans'">{total}</text>
    </svg>
  );
}

// ═══════════════════════════════════════
export default function ExecutiveProtection() {
  const { t } = useTheme();
  const ttS = {
    contentStyle: { background: "rgba(12,16,28,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", backdropFilter: "blur(20px)", boxShadow: "0 12px 48px rgba(0,0,0,0.5)", padding: "10px 14px" },
    itemStyle: { color: t.text, padding: "2px 0" }, labelStyle: { color: t.text50, marginBottom: 4, fontWeight: 600 },
  };
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detailEmail, setDetailEmail] = useState(null);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const { sortField, sortDir, onSort, sortData } = useSort("date", "desc");
  const sel = useSelection("id");
  const { range, setRange, filterByRange } = useTimeRange("All");

  const filtered = sortData(filterByRange(VIP_ALARMS.filter(a => !searchQuery || a.vipName.toLowerCase().includes(searchQuery.toLowerCase()) || a.keyword.toLowerCase().includes(searchQuery.toLowerCase())), "date"));
  const pag = usePagination(filtered.length, 10);
  const pageData = pag.paginate(filtered);

  const bulkActions = [
    { label: "Mark Resolved", onClick: () => sel.clear() },
    { label: "Export Selected", onClick: () => { exportCSV(filtered.filter(a => sel.isSelected(a.id)), CSV_COLS, "vip-alarms-selected.csv"); sel.clear(); } },
    { label: "Assign", onClick: () => { alert("Assigning " + sel.count + " items to analyst..."); sel.clear(); } },
  ];

  // Detail panel: from table row click OR from VIP card "View Full Profile"
  const selected = VIP_ALARMS.find(a => a.id === selectedId);
  const profile = selected ? VIP_PROFILES[selected.keyword] : (detailEmail ? VIP_PROFILES[detailEmail] : null);
  const panelOpen = selected || detailEmail;

  const closePanel = () => { setSelectedId(null); setDetailEmail(null); };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

      {/* ═══ SECTION 1: HERO BANNER ═══ */}
      <div className="glass" style={{ padding: "20px 24px", animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" /><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" opacity="0.5" /></svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#A855F7", textTransform: "uppercase", fontWeight: 600 }}>Executive Protection</span>
                <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, background: "rgba(232,70,58,0.1)", color: "#E8463A", fontFamily: "'JetBrains Mono',monospace" }}>440 open</span>
              </div>
              <div style={{ fontSize: 12, color: t.text40, marginTop: 3 }}>VIP threat monitoring and executive profile protection</div>
            </div>
          </div>
          {/* Right: 3 inline stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div className="hfont" style={{ fontSize: 22, fontWeight: 800 }}>440</div>
              <div style={{ fontSize: 9, color: t.text30, marginTop: 2 }}>Total Alarms</div>
            </div>
            <div style={{ width: 1, height: 28, background: t.borderSection }} />
            <div style={{ textAlign: "center" }}>
              <div className="hfont" style={{ fontSize: 22, fontWeight: 800 }}>3</div>
              <div style={{ fontSize: 9, color: t.text30, marginTop: 2 }}>VIP Accounts</div>
            </div>
            <div style={{ width: 1, height: 28, background: t.borderSection }} />
            <div style={{ textAlign: "center" }}>
              <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: SEV_BG["HIGH"], color: SEV_COLOR["HIGH"], fontFamily: "'JetBrains Mono',monospace" }}>HIGH</span>
              <div style={{ fontSize: 9, color: t.text30, marginTop: 6 }}>Risk Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: CHARTS ROW ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        {/* Left: Alarm Trends */}
        <div className="glass" style={{ padding: "20px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span className="hfont" style={{ fontSize: 14, fontWeight: 700 }}>Alarm Trends By Type</span>
            <span className="tab-btn on" style={{ padding: "3px 10px", fontSize: 10 }}>Last Year</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} interval={2} tick={{ fontSize: 9, fill: t.text30 }} />
              <YAxis axisLine={false} tickLine={false} width={30} tick={{ fontSize: 9, fill: t.text30 }} />
              <Tooltip {...ttS} />
              <Area type="monotone" dataKey="breachData" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.08} strokeWidth={2} dot={false} name="Breach Data" />
              <Area type="monotone" dataKey="vipMentions" stroke="#E8463A" fill="#E8463A" fillOpacity={0.05} strokeWidth={1.5} dot={false} name="VIP Mentions" />
              <Area type="monotone" dataKey="infoStealer" stroke="#16A34A" fill="#16A34A" fillOpacity={0.05} strokeWidth={1.5} dot={false} name="Info Stealer" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {[{ l: "Breach Data", c: "#3B82F6", v: 336 }, { l: "VIP Mentions", c: "#E8463A", v: 0 }, { l: "Info Stealer", c: "#16A34A", v: 0 }].map(i => (
              <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 3, background: i.c, opacity: 0.7 }} />
                <span className="mono" style={{ fontSize: 9, color: t.text30 }}>{i.l}</span>
                <span className="mono" style={{ fontSize: 9, color: t.text50, fontWeight: 600 }}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Record Statuses + Top Accounts stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Record Statuses */}
          <div className="glass" style={{ padding: "20px", flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 12 }}>Record Statuses</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <MiniDonut segments={RECORD_STATUS} size={90} />
              <div style={{ flex: 1 }}>
                {RECORD_STATUS.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                    <span style={{ fontSize: 11, color: t.text50, flex: 1 }}>{s.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: t.text60, fontWeight: 600 }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Accounts */}
          <div className="glass" style={{ padding: "20px", flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 12 }}>Top Alarm Generated Accounts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TOP_ACCOUNTS.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 10, color: t.text30, width: 14, textAlign: "right" }}>{i + 1}.</span>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                  <span className="mono" style={{ fontSize: 10, color: t.text50, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: t.text35, fontWeight: 600 }}>{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 3: ALARMS TABLE ═══ */}
      <div className="glass" style={{ overflow: "hidden", animation: loaded ? "fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.borderSection}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>{filtered.length} Total Alarms</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>VIP Monitoring</span>
          </div>
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by VIP name or email..." style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 12, fontFamily: "'Satoshi',sans-serif", background: t.bgInput, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, outline: "none" }} />
          </div>
          <TimeRangeFilter range={range} onRangeChange={setRange} />
          <ExportButton onClick={() => exportCSV(filtered, CSV_COLS, "vip-alarms.csv")} />
        </div>

        <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 70px 100px 100px", gap: 8, borderBottom: `1px solid ${t.borderRow}`, ...stickyHeaderStyle }}>
          <Checkbox checked={sel.allSelected(pageData)} indeterminate={sel.count > 0 && !sel.allSelected(pageData)} onChange={() => sel.toggleAll(pageData)} />
          <SortHeader label="VIP Name" field="vipName" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Keyword" field="keyword" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Source" field="source" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <SortHeader label="Discovery Date" field="date" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          <span className="mono" style={{ fontSize: 9, color: t.text20, textTransform: "uppercase" }}>Related Alarm</span>
        </div>

        {pageData.map(a => (
          <div key={a.id} onClick={() => { setSelectedId(a.id); setDetailEmail(null); }} className="trow" style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr 70px 100px 100px", gap: 8, alignItems: "center", padding: "12px 20px", cursor: "pointer", background: sel.isSelected(a.id) ? "rgba(168,85,247,0.04)" : selectedId === a.id ? "rgba(232,70,58,0.04)" : undefined, borderLeft: selectedId === a.id ? "3px solid #E8463A" : "3px solid transparent" }}>
            <Checkbox checked={sel.isSelected(a.id)} onChange={() => sel.toggle(a.id)} />
            <span style={{ fontSize: 12, fontWeight: 500, color: t.text70 }}>{a.vipName}</span>
            <CopyCell value={a.keyword} style={{ fontSize: 11, color: t.text45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} />
            <CopyCell value={a.source}>
              <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%" }}>{a.source}</span>
            </CopyCell>
            <span className="tag" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 3 }}>{a.status} <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg></span>
            <TimeCell date={a.date} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: t.text50 }}>{a.alarmType} <RowChevron /></span>
          </div>
        ))}

        <Pagination
          page={pag.page} totalPages={pag.totalPages} startIdx={pag.startIdx} endIdx={pag.endIdx}
          totalItems={filtered.length} onPrev={pag.prev} onNext={pag.next} onGoTo={pag.goTo}
          perPage={pag.perPage} onPerPageChange={pag.setPerPage}
        />
        <BulkActionBar count={sel.count} onClear={sel.clear} actions={bulkActions} />
      </div>

      {/* ═══ SECTION 4: VIP PROFILE CARDS ═══ */}
      <div style={{ animation: loaded ? "fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both" : "none" }}>
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.borderSection}` }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 4 }}>Executive Risk Profiles</div>
            <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>VIP Monitoring — All Assets</span>
          </div>

          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {FEATURED_EMAILS.map(email => {
              const p = VIP_PROFILES[email];
              if (!p) return null;
              const initials = p.name.split(" ").map(n => n[0]).join("");
              const topVectors = p.attackVectors
                .filter(v => v.severity !== "LOW")
                .sort((a, b) => {
                  const sevOrder = { "VERY HIGH": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
                  return (sevOrder[b.severity] || 0) - (sevOrder[a.severity] || 0);
                })
                .slice(0, 3);

              return (
                <div key={email} style={{
                  padding: "18px",
                  borderRadius: 12,
                  background: t.bgCard,
                  border: `1px solid ${t.borderSection}`,
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {/* Header: Name, email, risk badge, score */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: `${SEV_COLOR[p.riskLevel]}15`,
                      border: `2px solid ${SEV_COLOR[p.riskLevel]}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: SEV_COLOR[p.riskLevel],
                      fontWeight: 700, fontSize: 13, fontFamily: "'Plus Jakarta Sans'"
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text70 }}>{p.name}</div>
                      <div className="mono" style={{ fontSize: 9, color: t.text35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 8, fontWeight: 700, background: SEV_BG[p.riskLevel], color: SEV_COLOR[p.riskLevel], fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>
                        {p.riskLevel} RISK
                      </span>
                      <span className="mono" style={{ fontSize: 9, color: t.text35 }}>{p.riskScore}/100</span>
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
                    {[
                      { label: "Breaches", val: p.breaches, color: "#E8463A" },
                      { label: "Passwords", val: p.passwords, color: "#A855F7" },
                      { label: "Data Classes", val: p.dataClasses, color: "#3B82F6" },
                      { label: "Pastes", val: p.pastes, color: "#F59E0B" },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: "8px 4px", borderRadius: 6, background: t.bgHover, textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 8, color: t.text30, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top 3 attack vectors */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, flex: 1 }}>
                    {topVectors.length > 0 ? topVectors.map((v, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6, background: t.bgHover }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: v.color, boxShadow: `0 0 6px ${v.color}50`, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: t.text60 }}>{v.label}</span>
                        </div>
                        <span style={{ padding: "2px 6px", borderRadius: 3, fontSize: 8, fontWeight: 700, background: SEV_BG[v.severity], color: SEV_COLOR[v.severity], fontFamily: "'JetBrains Mono',monospace" }}>{v.severity}</span>
                      </div>
                    )) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px", borderRadius: 6, background: "rgba(22,163,74,0.06)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                          <path d="M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" />
                          <path d="M9 13l2 2 4-4" />
                        </svg>
                        <span style={{ fontSize: 10, color: "#16A34A", fontWeight: 500 }}>No significant threats detected</span>
                      </div>
                    )}
                  </div>

                  {/* View Full Profile link */}
                  <button
                    onClick={() => { setDetailEmail(email); setSelectedId(null); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      width: "100%", padding: "10px", borderRadius: 8,
                      border: `1px solid ${t.borderSection}`, background: "transparent",
                      color: t.text50, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Satoshi',sans-serif", transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.bgHover; e.currentTarget.style.color = t.text70; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.text50; }}
                  >
                    View Full Profile
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ DETAIL PANEL — Executive Profile ═══ */}
      {panelOpen && (
        <>
          <div onClick={closePanel} style={{ position: "fixed", inset: 0, background: t.bgOverlay, zIndex: 50, cursor: "pointer" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 520, overflow: "auto", zIndex: 51, background: t.bgPanel, backdropFilter: "blur(20px)", borderLeft: `1px solid ${t.borderLight}`, animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.borderSection}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <span className="hfont" style={{ fontSize: 20, fontWeight: 700 }}>{selected ? selected.vipName : profile.name}</span>
                    <div className="mono" style={{ fontSize: 10, color: t.text35, marginTop: 2 }}>{selected ? selected.keyword : profile.email}</div>
                  </div>
                </div>
                <button onClick={closePanel} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: t.borderLight, color: t.text50, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
              {/* Risk badge */}
              {profile && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: SEV_BG[profile.riskLevel], color: SEV_COLOR[profile.riskLevel], fontFamily: "'JetBrains Mono',monospace" }}>{profile.riskLevel} RISK</span>
                  <span className="mono" style={{ fontSize: 11, color: t.text40 }}>Score: {profile.riskScore}/100</span>
                </div>
              )}
            </div>

            {profile ? (
              <div style={{ padding: "20px 24px" }}>
                {/* Quick stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                  {[
                    { label: "Data Breaches", value: profile.breaches, color: "#E8463A" },
                    { label: "Passwords", value: profile.passwords, color: "#A855F7" },
                    { label: "Data Classes", value: profile.dataClasses, color: "#3B82F6" },
                    { label: "Paste Exposures", value: profile.pastes, color: "#F59E0B" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "12px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.borderSection}`, textAlign: "center" }}>
                      <div className="hfont" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: t.text30, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Exposure Categories */}
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Exposure Categories</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                  {profile.categories.map((cat, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.borderSection}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.text30} strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}><path d={cat.icon} /></svg>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: t.text70, marginBottom: 2 }}>{cat.label}</div>
                        <div style={{ fontSize: 10, color: t.text30 }}>{cat.desc}</div>
                      </div>
                      <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 8, fontWeight: 700, background: SEV_BG[cat.severity], color: SEV_COLOR[cat.severity], fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{cat.severity}</span>
                    </div>
                  ))}
                </div>

                {/* Breach Timeline */}
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Breach Timeline</div>
                <div style={{ marginBottom: 20 }}>
                  {profile.breachTimeline.map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 70, flexShrink: 0 }}>
                        <span className="mono" style={{ fontSize: 10, color: t.text35 }}>{b.date}</span>
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.severity === "critical" ? "#DC2626" : b.severity === "high" ? "#EA580C" : "#CA8A04", marginTop: 4, flexShrink: 0 }} />
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {b.types.map((tp, j) => (
                          <span key={j} style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 500, background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontFamily: "'JetBrains Mono',monospace" }}>{tp}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Intelligence Sources */}
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Intelligence Sources</div>
                <div style={{ marginBottom: 20 }}>
                  {profile.sources.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                      <span style={{ fontSize: 12, color: t.text60 }}>{s.name}</span>
                      <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, background: SEV_BG[s.severity], color: SEV_COLOR[s.severity], fontFamily: "'JetBrains Mono',monospace" }}>{s.severity}</span>
                    </div>
                  ))}
                </div>

                {/* Attack Vectors */}
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 10 }}>Potential Attack Vectors</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {profile.attackVectors.map((v, i) => (
                    <div key={i} style={{ padding: "14px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.borderSection}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: t.text70 }}>{v.label}</span>
                        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 8, fontWeight: 700, background: SEV_BG[v.severity], color: SEV_COLOR[v.severity], fontFamily: "'JetBrains Mono',monospace" }}>{v.severity}</span>
                      </div>
                      <p style={{ fontSize: 10, color: t.text35, lineHeight: 1.5, margin: 0 }}>{v.desc}</p>
                      <div style={{ height: 3, borderRadius: 1.5, background: t.bgHover, marginTop: 8 }}>
                        <div style={{ height: "100%", borderRadius: 1.5, background: v.color, width: v.severity === "VERY HIGH" ? "90%" : v.severity === "HIGH" ? "65%" : "20%", opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Fallback: basic alarm detail if no profile */
              <div style={{ padding: "20px 24px" }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: t.text25, textTransform: "uppercase", marginBottom: 16 }}>Overview</div>
                {[
                  { label: "Discovery Date", value: selected.date },
                  { label: "Status", value: selected.status },
                  { label: "Leak Date", value: selected.leakDate },
                  { label: "Password", value: selected.password },
                  { label: "Password Type", value: selected.passwordType },
                  { label: "User", value: selected.keyword },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${t.borderRow}` }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: t.text55 }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: t.text60 }}>{row.value}</span>
                  </div>
                ))}
                <button style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#151B2E", color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Satoshi',sans-serif", marginTop: 20 }}>Go to Alarm</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
