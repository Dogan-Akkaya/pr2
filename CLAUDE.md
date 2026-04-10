# SOCRadar Dark Web Monitoring — Redesign Prototype

## What This Is
A **frontend-only prototype** of SOCRadar's Advanced Dark Web Monitoring product redesign. This is a concept for the product team — not production code. It uses dummy data and has no backend. The goal is to demonstrate enterprise-grade UI across multiple interconnected screens.

## Tech Stack
- **React + Vite** (JSX, no TypeScript)
- **React Router** for multi-page navigation
- **React Context + useReducer** for state (no external state libraries)
- **Recharts** for charts
- **Canvas API** for smoke particle effects
- **All custom styling** — no component libraries (no MUI, no shadcn, no Chakra, no Tailwind)
- **Inline styles** for component-specific styling + **global.css** for shared classes
- **Google Fonts**: Plus Jakarta Sans, JetBrains Mono, DM Sans
- **Fontshare**: Satoshi

## Page Architecture

| Page | File | Status |
|------|------|--------|
| Dashboard ("Your Threats") | `src/pages/Dashboard.jsx` | Built |
| Global Threats | `src/pages/GlobalThreats.jsx` | Built |
| Protection Coverage | `src/pages/ProtectionCoverage.jsx` | Built |
| Black Market | `src/pages/BlackMarket.jsx` | Built |
| Dark Web Search | `src/pages/DarkWebSearch.jsx` | Placeholder |
| I&A Intelligence | `src/pages/IAIntelligence.jsx` | Placeholder |
| Tactical Intelligence | `src/pages/TacticalIntel.jsx` | Placeholder |
| Incidents | `src/pages/Incidents.jsx` | Placeholder |
| Reports | `src/pages/Reports.jsx` | Placeholder |
| Settings | `src/pages/Settings.jsx` | Placeholder |

## Adding a New Page (Checklist)
1. Create `src/pages/PageName.jsx`
2. Add route in `src/App.jsx`
3. Add nav item in `src/components/Sidebar.jsx` (with SVG icon)
4. Use the standard page structure (see Page Skeleton below)
5. Add dummy data — realistic, not lorem ipsum

---

# DESIGN SYSTEM

Full reference in `CLAUDE-socradar-rules.md`. Below are the **enforced patterns** extracted from the built pages.

## Colors (STRICT — do not deviate)

### Backgrounds
- Page background: `#0C1021`
- Sidebar: `#151B2E` (NEVER change)
- Top bar: `rgba(12,16,33,0.92)` + `blur(16px)`
- Glass card: `rgba(255,255,255,0.02)`
- Glass card small: `rgba(255,255,255,0.025)`
- Input fields: `rgba(255,255,255,0.03)` or `rgba(255,255,255,0.04)`

### Brand & Severity
- SOCRadar red (primary accent): `#E8463A`
- Alternate accent: `#FF4562` (Brief Room/Labs)
- Critical: `#DC2626`
- High: `#EA580C`
- Medium/Warning: `#CA8A04`
- Low/Safe: `#16A34A`
- Info/Config: `#3B82F6`
- Financial/Warning: `#F59E0B`
- Purple (accent): `#A855F7`
- Teal (accent): `#06B6D4`
- Green (accent): `#10B981`

### Text Opacity Tiers (based on `#E8ECF1`)
| Tier | Value | Usage |
|------|-------|-------|
| Primary | `#E8ECF1` or `#fff` | Headings, key values |
| Secondary | `rgba(232,236,241,0.5)` | Body text, descriptions |
| Tertiary | `rgba(232,236,241,0.35)` | Meta text, timestamps |
| Label | `rgba(232,236,241,0.25)` | Section labels, column headers |
| Hint | `rgba(232,236,241,0.2)` | Pagination, minimal text |
| Ghost | `rgba(232,236,241,0.15)` | Table headers, barely visible |

### Borders
- Glass card border: `rgba(255,255,255,0.05)`
- Input border: `rgba(255,255,255,0.06)` → `rgba(255,255,255,0.08)` (focused)
- Row separator: `rgba(255,255,255,0.02)` (between data rows)
- Section divider: `rgba(255,255,255,0.03)` or `rgba(255,255,255,0.04)`

## Typography (STRICTLY enforced)

| Role | Font | Weight | Size | Extra |
|------|------|--------|------|-------|
| Page title | Plus Jakarta Sans (`.hfont`) | 700 | 16px | — |
| Section heading | Plus Jakarta Sans | 700-800 | 14-22px | letterSpacing: -0.02em |
| Hero heading | Plus Jakarta Sans | 800 | 26px | letterSpacing: -0.03em |
| Stat value | Plus Jakarta Sans | 800 | 24px | letterSpacing: -0.02em |
| Body text | Satoshi (default) | 400-500 | 12-13px | — |
| Section label | JetBrains Mono (`.mono`) | 400 | 10px | uppercase, letterSpacing: 0.08em |
| Data values | JetBrains Mono | 400-500 | 10-12px | — |
| Table header | JetBrains Mono | 400 | 9px | uppercase, ghost color |
| Button text | Satoshi or Plus Jakarta Sans | 600-700 | 11-14px | — |

**NEVER use**: Inter, Roboto, Arial, system fonts, Space Grotesk, Syne

## Layout Architecture

### App Shell (fixed)
```
┌─────────────────────────────────────────┐
│ Sidebar (220px) │ TopBar (sticky, z:25) │
│ z:30            │─────────────────────│
│                 │ Page Content         │
│                 │ (padding: 20px 24px) │
│                 │ (flex-col, gap: 18)  │
└─────────────────────────────────────────┘
```
- Sidebar: 220px fixed, `#151B2E`, z-index 30
- TopBar: sticky, frosted glass, z-index 25
- Content: flex:1, overflow:auto, position:relative

### Grid Patterns
- **4-column stats**: `gridTemplateColumns: "repeat(4,1fr)"`, gap: 12
- **3-column data**: `gridTemplateColumns: "1fr 1fr 1fr"`, gap: 18
- **2-column split**: `gridTemplateColumns: "1fr 1fr"`, gap: 18
- **Table columns**: explicit px widths per column via grid

---

# COMPONENT PATTERNS

## Page Skeleton
Every page MUST follow this structure:
```jsx
import { useState, useEffect } from "react";

export default function PageName() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
      {/* Section 1 */}
      <div className="glass" style={{
        animation: loaded ? "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        ...
      </div>
      {/* Section 2 — stagger by 0.1s */}
      <div style={{
        animation: loaded ? "fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}>
        ...
      </div>
    </div>
  );
}
```

## Animation Stagger Sequence
Every section in a page gets an incrementing delay:
- Section 1: `0s` (no delay)
- Section 2: `0.1s`
- Section 3: `0.15s`
- Section 4: `0.2s`
- Section 5: `0.25s`
- And so on...

Formula: `animation: loaded ? "fadeUp 0.6s ${delay}s cubic-bezier(0.16,1,0.3,1) both" : "none"`

## Glass Card Section
Standard pattern for any content section:
```jsx
<div className="glass" style={{ overflow: "hidden" }}>
  {/* Header */}
  <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(232,236,241,0.25)", textTransform: "uppercase", marginBottom: 4 }}>
      SECTION LABEL
    </div>
    <span className="hfont" style={{ fontSize: 15, fontWeight: 700 }}>Section Title</span>
  </div>
  {/* Content */}
  <div>
    {/* .trow rows or custom content */}
  </div>
</div>
```

## Data Row (`.trow`)
```jsx
<div className="trow">
  <span className="mono" style={{ fontSize: 11, color: "rgba(232,236,241,0.5)" }}>value</span>
  <span className="mono" style={{ fontSize: 10, color: "rgba(232,236,241,0.35)" }}>meta</span>
</div>
```

## Stat Card
```jsx
<div className="glass" style={{ padding: "16px 18px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}10`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="14" height="14" ... stroke={color} />
    </div>
    <span style={{ fontSize: 11, color: "rgba(232,236,241,0.4)" }}>Label</span>
  </div>
  <span className="hfont" style={{ fontSize: 24, fontWeight: 800 }}>Value</span>
</div>
```

## Tab Toggle
```jsx
<div style={{ display: "flex", gap: 6 }}>
  <button className={`tab-btn ${active === "a" ? "on" : ""}`} onClick={...}>Tab A</button>
  <button className={`tab-btn ${active === "b" ? "on" : ""}`} onClick={...}>Tab B</button>
</div>
```

## Search Bar (full-width, inside glass card)
```jsx
<div style={{ position: "relative", flex: 1 }}>
  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8ECF1" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
  <input placeholder="..." style={{
    width: "100%", padding: "10px 14px 10px 36px", fontSize: 12,
    fontFamily: "'Satoshi',sans-serif", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10,
    color: "#E8ECF1", outline: "none",
  }} />
</div>
```

## White Search Bar (standalone entry point)
For prominent search features (DW Search, I&A Intelligence):
```jsx
<div style={{ background: "#F0F2F5", borderRadius: 18, padding: "28px 32px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
  {/* Icon + Label on left */}
  {/* Input with white bg in center (flex:1) */}
  {/* Red CTA button on right */}
</div>
```

## Slide-Out Panel (right side)
Used for detail views and forms (AdminPanel, Add Asset, Black Market Detail):
```jsx
{/* Backdrop */}
<div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }} />
{/* Panel */}
<div style={{
  position: "fixed", top: 0, right: 0, bottom: 0, width: 380-480,
  background: "rgba(12,16,33,0.98)", backdropFilter: "blur(20px)",
  borderLeft: "1px solid rgba(255,255,255,0.06)",
  zIndex: 51, overflow: "auto", padding: "20px 24px",
  animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
}}>
```
- Width: 380px (admin), 440px (forms), 480px (detail views)
- Always has backdrop overlay that dismisses on click
- Always has close button top-right

## Buttons
| Type | Background | Color | Shadow |
|------|-----------|-------|--------|
| Primary (CTA) | `#E8463A` | `#fff` | `0 4px 16px rgba(232,70,58,0.3)` |
| Secondary | `rgba(255,255,255,0.04)` | `rgba(232,236,241,0.65)` | none |
| Danger | `rgba(220,38,38,0.06)` | `#DC2626` | none |
| Icon (32x32) | `rgba(255,255,255,0.04)` | varies | none |
| Dashed (add) | transparent, dashed border | `rgba(232,236,241,0.3)` | none |

## Severity Indicator
Always: colored dot (7px) + glow shadow + uppercase label
```jsx
<div style={{ width: 7, height: 7, borderRadius: "50%", background: SEV[severity], boxShadow: `0 0 6px ${SEV[severity]}50` }} />
```

## Tag/Badge
```jsx
<span className="tag" style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A", fontSize: 9 }}>Open</span>
```

## Highlighted Domain (in stealer logs)
```jsx
<span style={{ background: "rgba(245,158,11,0.25)", padding: "1px 2px", borderRadius: 2 }}>domain.com</span>
```

---

# DATA CONVENTIONS

## Dummy Data Rules
- All data is dummy/mock — stored as JS constants in page files or `src/data/`
- Data should look **realistic** (real-looking emails, domains, timestamps, prices, CVEs)
- Every data point should include: **source**, **time/date**, **domain/asset** where applicable
- Use ISO 2-letter country codes (US, GB, DE, CN) with country name mappings
- Dates: `YYYY-MM-DD` format in data, display as `DD Mon YYYY`
- Prices: `$10.00` format

## Data Context (global state)
- `src/context/DataContext.jsx` — React Context + useReducer
- Actions: `SET_THREAT_LEVEL`, `SET_HERO_ALERTS`, `DISMISS_HERO_ALERT`, `TOGGLE_ADMIN`, `RESET_ALL`, etc.
- Only the Dashboard page reads from global context. Other pages use local dummy data.
- Admin panel dispatches changes to context for live preview

## Threat Level System
```js
TL[level] → { label, color: [r,g,b], hex, glow }
SEV[severity] → hex color string
STR_COL[strength] → hex color string
```

---

# TECHNICAL CONVENTIONS

## File Organization
```
src/
  main.jsx              — entry point, imports global.css
  App.jsx               — DataProvider + BrowserRouter + Routes
  styles/global.css     — shared classes + fonts + keyframes
  context/DataContext.jsx — global state
  data/defaults.js      — default data for Dashboard
  data/threat-levels.js — TL, SEV, STR_COL maps
  data/worldMapPaths.js — SVG country outlines (MIT, Simplemaps)
  layouts/AppLayout.jsx — Sidebar + TopBar + Outlet + AdminPanel
  components/           — shared components
  pages/                — one file per page
```

## Routing
- Routes defined in `src/App.jsx` inside `<Route element={<AppLayout />}>`
- Path convention: kebab-case (`/black-market`, `/protection-coverage`)
- Default route redirects to `/dashboard`

## Icons
- All icons are inline SVG with `stroke="currentColor"` or explicit color
- Standard size: 16x16 for nav items, 14x14 for stat cards, 12x12 for inline
- strokeWidth: 2 (standard), 1.5 (detailed icons)
- NO emoji — ever

## Recharts Configuration
- Always use `<ResponsiveContainer width="100%" height={N}>`
- `<CartesianGrid strokeDasharray="3 3" vertical={false} />`
- Axes: `axisLine={false} tickLine={false}`
- Areas: `type="monotone"`, `dot={false}`, `fillOpacity` 0.04-0.08
- Custom tooltips with frosted glass style (see Dashboard ttS object)
- Legend: custom flex row above chart, not Recharts legend component

## Canvas Smoke Effects
- ThreatSmokeLayer: background arc-based particle system
- Uses requestAnimationFrame, DPR-aware canvas sizing
- HSL-based particle coloring per threat level
- Particle cap: 600 (smoke) + 60 (fog)
- On threat level change: accelerate decay on all existing particles (fast kill)
- The `originY` prop controls where the arc emission line sits

## Key Principles
1. **"Your Threats" first** — Dashboard prioritizes customer's own exposure
2. **Glanceable severity** — color + label = instant understanding
3. **Progressive disclosure** — hero shows top items, full data below
4. **White search bars stand out** — light backgrounds for entry points
5. **Data transparency** — always show source, time, domain
6. **Coverage gamification** — progress bars incentivize configuration
7. **Guide the user** — empty states should suggest actions, not just show "no data"
8. **Enterprise-grade feel** — slow, deliberate animations; premium typography; no clutter
9. **Realistic data** — dummy data should feel like a real customer account
10. **No emojis in the platform** — monochrome SVG stroke icons only (except country flags in data)

## Deployment
- `npm run build` → `dist/`
- `vercel.json` included for SPA rewrites
- Dev server pinned to port 5174 (`vite.config.js`)
