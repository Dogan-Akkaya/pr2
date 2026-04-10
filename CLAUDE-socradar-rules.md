# SOCRadar Advanced Dark Web Monitoring — Redesign Rules

## Project Context
We are redesigning SOCRadar's Advanced Dark Web Monitoring product. SOCRadar is an enterprise cybersecurity SaaS company based in Ankara. The product is strong in SMB/mid-market but has been upgraded with new data capabilities. The goal is to create an enterprise-grade UI that showcases these capabilities while feeling premium, not template-like.

This is NOT a marketing website. It is a web-hosted platform (SaaS app) used daily by SOC analysts, CISOs, and security teams. Every design decision must serve real operational workflows.

## Design System

### Colors
- **Primary accent:** `#E8463A` (SOCRadar red) — used for CTAs, active states, severity indicators, accent text
- **Alternate accent:** `#FF4562` — used in Brief Room / Labs products
- **Background (content area):** `#0C1021` (deep navy-black)
- **Sidebar background:** `#151B2E` (dark navy) — DO NOT CHANGE, keep existing SOCRadar nav shell
- **Severity system:**
  - Critical: `#DC2626`
  - High: `#EA580C`
  - Medium: `#CA8A04`
  - Low/Safe: `#16A34A`
- **Info/configuration:** `#3B82F6` (blue) — for informational cards, under-configured warnings
- **Financial/warning:** `#F59E0B` (amber) — for password reuse, pricing
- **Text primary:** `#E8ECF1`
- **Text secondary:** `rgba(232,236,241,0.5)`
- **Text tertiary:** `rgba(232,236,241,0.25)`

### Typography
- **Headings:** `Plus Jakarta Sans` — weights 600-800, tight letter-spacing (-0.02em to -0.03em)
- **Body:** `Satoshi` (fallback: DM Sans) — weights 300-600
- **Data/labels/mono:** `JetBrains Mono` — weights 300-500, letter-spacing 0.06-0.12em, UPPERCASE for labels
- **NEVER use:** Inter, Roboto, Arial, system fonts, Space Grotesk, Syne

### Component Patterns

#### Glass Cards (`.glass`)
```css
background: rgba(255,255,255,0.02);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.05);
border-radius: 16px;
```

#### Smaller Glass (`.glass-sm`)
```css
background: rgba(255,255,255,0.025);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.05);
border-radius: 12px;
```

#### Section Labels
```
font-family: JetBrains Mono
font-size: 10px
letter-spacing: 0.08em
color: rgba(232,236,241,0.25)
text-transform: uppercase
margin-bottom: 4-8px
```

#### Data Rows
- Padding: 9px 20px
- Border-bottom: 1px solid rgba(255,255,255,0.02)
- Hover: background rgba(255,255,255,0.02)
- Mono font for data values

#### Toggle Tabs
- Rounded 8px buttons with 6px 16px padding
- Active: red background tint, red border, red text, font-weight 600
- Inactive: subtle border, low-opacity text

### Animations
- **Entry:** `fadeUp` — opacity 0→1, translateY 12px→0, cubic-bezier(0.16,1,0.3,1)
- **Stagger:** 0.05-0.1s delay between sequential elements
- **Hover transitions:** 0.2-0.3s with same cubic-bezier
- **Pulse glow:** For severity indicators, 2.5s ease-in-out infinite

### Smoke Effect System
The signature visual element. A canvas-based particle system that:
- Emits from a curved arc line (not a point) spanning the widget width
- Color matches threat level (red for critical, orange for high, amber for medium, green for low)
- Uses noise-driven organic movement (layered sine waves)
- Particles go primarily upward (35-40%) with accumulation near top bar, and downward (60-65%) with faster decay
- Differential canvas clearing: top clears slower → smoke pools between source and top bar
- Particles near y<80 get velocity dampened (pooling effect)
- Particle cap: 600, emission rate: ~1.4/frame with spontaneous bursts
- Canvas layer sits at zIndex:1, content at zIndex:2, top bar at zIndex:25
- Top bar has backdrop-filter blur(16px) and 0.92 opacity background so smoke passes behind it smoothly

### Layout Architecture

#### Sidebar
- Width: 220px, fixed, kept AS-IS from existing SOCRadar platform
- Dark navy (#151B2E), icon + text nav items
- Active state: red tint background, #E8463A text
- zIndex: 30 (above smoke)

#### Top Bar
- Sticky, zIndex: 25
- Frosted glass: rgba(12,16,33,0.92) + blur(16px)
- Contains: page title, "Advanced Dark Web Monitoring" subtitle, last scan time, notification bell

#### Content Area
- Padding: 20px 24px
- Gap: 18px between sections
- Grid columns: mostly 2-column for data panels, 4-column for stats row

## Page Architecture

### Dashboard ("Your Threats")
Top-to-bottom order:
1. **Hero Threat Widget** — smoke background, half-logo straddling top border, severity status, alert cards with overlay hover actions, coverage sidebar with progress bars
2. **Exposure Timeline** — 24-month area chart, 4 data series
3. **Stats Row** — 4 compact glass cards (Total DW Findings, Exposed Employees, Infected Employees, Compromised Domains)
4. **Two columns:** Your Critical Alerts | Data Intel (Unique Identifiers + Black Market Activity stacked)
5. **Dark Web Search Engine** — WHITE background, eye-catching, globe+spy icon
6. **Two columns:** Employee Exposure (toggle Exposed/Infected, taller) | Domain Exposure (toggle FQDNs/Third-Party Risk)
7. **Identity & Access Intelligence** — WHITE background search bar, eye icon, "Investigate" button

### Global News Dashboard (TODO)
- Dedicated to threat intelligence news feeds
- Dark Web News + Ransomware News toggles
- Will be built as separate page

### Other Pages (TODO)
- Protection Coverage
- Dark Web Search Engine (full page)
- Identity & Access Intelligence (full page)
- Tactical Intelligence
- Incidents
- Reports

## Key Principles
1. **"Your Threats" first** — Dashboard prioritizes the customer's own exposure, not generic news
2. **Glanceable severity** — Smoke color + pulsing dot + severity label = instant understanding
3. **Progressive disclosure** — Hero shows top 3 critical alerts, lower section shows remaining
4. **White search bars stand out** — Against the dark dashboard, the two white search modules (DW Search + I&A Intelligence) are unmissable entry points
5. **Toggle patterns** — Used for Exposed/Infected employees and FQDNs/Third-Party Risk. Always default to the most common view.
6. **Overlay hover actions** — Alert cards show action buttons as a frosted overlay from the right, not by expanding the card
7. **Data transparency** — Show source, time, domain for every data point. Enterprise users need provenance.
8. **Coverage gamification** — Progress bars for domains, keywords, VIPs, financial assets incentivize complete configuration
9. **No emojis in the platform** — Use monochrome SVG stroke icons in #FF4562 or category colors
10. **Charts are premium** — Recharts with monotone curves, no axis clutter, frosted glass containers, premium tooltips with blur

## Tech Stack
- React (JSX artifacts / Vite)
- Recharts for charts
- Canvas API for smoke effects
- Google Fonts: Plus Jakarta Sans, JetBrains Mono, DM Sans
- Fontshare: Satoshi
- No external component libraries — all custom styled
- No localStorage — use React state

## File Naming
- Dashboard: `socradar-dashboard.jsx`
- Brief Room: `brief-room.jsx`
- Additional pages: `socradar-{page-name}.jsx`
