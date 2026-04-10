export const DEFAULT_EXP_DATA = Array.from({ length: 24 }, (_, i) => {
  const m = i < 12
    ? `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]} '25`
    : `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i - 12]} '26`;
  const b = 40 + Math.sin(i * 0.5) * 20;
  return {
    month: m,
    infostealerLogs: Math.round(b + Math.random() * 30),
    dataBreaches: Math.round(b * 0.4 + Math.random() * 15),
    logsOnSale: Math.round(b * 0.3 + Math.random() * 20 + i * 2),
    darkWebMentions: Math.round(b * 0.2 + Math.random() * 10),
  };
});

export const DEFAULT_HERO_ALERTS = [
  { id: 1, sev: "critical", text: "23 employee credentials found in stealer logs", source: "Russian Market", time: "2h ago" },
  { id: 2, sev: "critical", text: "Company database listed for sale on Breach Forums", source: "Breach Forums", time: "5h ago" },
  { id: 3, sev: "high", text: "3 VIP accounts detected in combo lists", source: "Telegram", time: "8h ago" },
];

export const DEFAULT_LOWER_ALARMS = [
  { id: 10, severity: "high", title: "New ransomware group mentions your sector", source: "Dark Web Forum", time: "6h ago", domain: "Financial Services", count: 2 },
  { id: 11, severity: "medium", title: "Third-party vendor credentials exposed", source: "Public Paste", time: "1d ago", domain: "vendor.partner.com", count: 7 },
  { id: 12, severity: "medium", title: "Subdomain discussed in hacking channel", source: "Telegram", time: "1d ago", domain: "api.example.com", count: 2 },
  { id: 13, severity: "medium", title: "Exposed API key detected in code repository", source: "Github Gist", time: "2d ago", domain: "keys.example.com", count: 1 },
  { id: 14, severity: "low", title: "Brand mentioned in low-risk dark web thread", source: "Forum", time: "3d ago", domain: "example.com", count: 1 },
];

export const DEFAULT_COVERAGE_BARS = [
  { label: "Domains", used: 2, total: 3, color: "#E8463A" },
  { label: "Keywords", used: 5, total: 10, color: "#F59E0B" },
  { label: "VIP Accounts", used: 1, total: 5, color: "#A855F7" },
  { label: "Financial Assets", used: 0, total: 2, color: "#3B82F6" },
];

export const DEFAULT_BLACK_MARKET = [
  { id: 1, asset: "platform.socradar.com", price: "$10.00", status: "Open", date: "2025-10-29" },
  { id: 2, asset: "academy.socradar.is", price: "$10.00", status: "Open", date: "2025-10-22" },
  { id: 3, asset: "socradar.com", price: "$10.00", status: "Open", date: "2025-10-03" },
  { id: 4, asset: "fastpay.co.id", price: "$10.00", status: "Open", date: "2025-10-03" },
];

export const DEFAULT_FQDN_DATA = [
  { domain: "gateway.example.com", count: 28700 },
  { domain: "example.com", count: 14100 },
  { domain: "openam.example.com", count: 460 },
  { domain: "www.example.com", count: 1100 },
  { domain: "business.example.com", count: 335 },
  { domain: "apps.example.com", count: 758 },
  { domain: "login.example.com", count: 644 },
];

export const DEFAULT_THIRD_PARTY_DATA = [
  { domain: "salesforce.example.com", service: "Salesforce", creds: 10 },
  { domain: "docusign.com", service: "DocuSign", creds: 7 },
  { domain: "onelogin.com", service: "OneLogin", creds: 5 },
  { domain: "lastpass.com", service: "LastPass", creds: 5 },
  { domain: "adp.com", service: "ADP", creds: 4 },
  { domain: "carta.com", service: "Carta", creds: 4 },
];

export const DEFAULT_EXPOSED_EMP = [
  { email: "v.walker@greenanimalsbank.com", date: "2023-11-21", strength: "Fair" },
  { email: "g.barnett@greenanimalsbank.com", date: "2023-11-21", strength: "Weak" },
  { email: "m.white@greenanimalsbank.com", date: "2023-11-21", strength: "Strong" },
  { email: "bird@greenanimalsbank.com", date: "2023-11-21", strength: "Poor" },
  { email: "test9@greenanimalsbank.com", date: "2023-11-21", strength: "Weak" },
  { email: "admin@greenanimalsbank.com", date: "2023-10-15", strength: "Fair" },
  { email: "finance@greenanimalsbank.com", date: "2023-10-12", strength: "Poor" },
  { email: "ops@greenanimalsbank.com", date: "2023-09-28", strength: "Weak" },
];

export const DEFAULT_STATS = [
  { label: "Total DW Findings", value: "1,345", change: "+12%", icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { label: "Exposed Employees", value: "712", change: "+8%", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8a6 6 0 0 1 12 0H6z" },
  { label: "Infected Employees", value: "2,552", change: "+23%", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  { label: "Password Reuse", value: "31.8%", change: "+2%", icon: "M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z" },
];
