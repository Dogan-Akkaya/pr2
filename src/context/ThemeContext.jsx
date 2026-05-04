import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Theme Definitions ──
const themes = {
  dark: {
    name: "dark",
    // SOCRadar brand tokens (https://socradar.io/brand-guideline/)
    brandCoral: "#FF4562",        // Energetic Coral — primary accent
    brandCoralDark: "#99293C",
    brandCoralLight: "#FFD1DB",
    brandNight: "#1B1B3C",        // Deep Night Blue — page bg
    brandNightDeep: "#0D0D1C",    // sidebar bg
    brandNightLight: "#8D8DA2",
    // Backgrounds
    bgBase: "#1B1B3C",
    bgSidebar: "#0D0D1C",
    bgCard: "rgba(255,255,255,0.02)",
    bgCardSm: "rgba(255,255,255,0.025)",
    bgInput: "rgba(255,255,255,0.03)",
    bgHover: "rgba(255,255,255,0.04)",
    bgElevated: "rgba(255,255,255,0.06)",
    bgTopbar: "rgba(12,16,33,0.92)",
    bgTooltip: "rgba(12,16,28,0.96)",
    bgPanel: "rgba(12,16,33,0.98)",
    bgOverlay: "rgba(0,0,0,0.4)",
    bgWhiteSearch: "#F0F2F5",
    bgCode: "rgba(15,20,35,0.95)",
    // Text — opacity tiers bumped for legibility (was 0.15-0.7, now 0.25-0.88)
    text: "#E8ECF1",
    textStrong: "#fff",
    text70: "rgba(232,236,241,0.88)",
    text60: "rgba(232,236,241,0.78)",
    text55: "rgba(232,236,241,0.72)",
    text50: "rgba(232,236,241,0.68)",
    text45: "rgba(232,236,241,0.62)",
    text40: "rgba(232,236,241,0.58)",
    text35: "rgba(232,236,241,0.52)",
    text30: "rgba(232,236,241,0.45)",
    text25: "rgba(232,236,241,0.40)",
    text20: "rgba(232,236,241,0.32)",
    text15: "rgba(232,236,241,0.25)",
    textInverse: "#1A1A2E",
    // Borders
    border: "rgba(255,255,255,0.05)",
    borderLight: "rgba(255,255,255,0.06)",
    borderMed: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.12)",
    borderRow: "rgba(255,255,255,0.02)",
    borderSection: "rgba(255,255,255,0.04)",
    // Scrollbar
    scrollThumb: "rgba(255,255,255,0.06)",
    // Recharts
    gridLine: "rgba(255,255,255,0.03)",
    chartText: "rgba(232,236,241,0.55)",
  },
  light: {
    name: "light",
    // SOCRadar brand tokens (same in both modes — brand colors don't theme)
    brandCoral: "#FF4562",
    brandCoralDark: "#99293C",
    brandCoralLight: "#FFD1DB",
    brandNight: "#1B1B3C",
    brandNightDeep: "#0D0D1C",
    brandNightLight: "#8D8DA2",
    // Backgrounds
    bgBase: "#F5F6F8",
    bgSidebar: "#FFFFFF",
    bgCard: "rgba(255,255,255,0.85)",
    bgCardSm: "rgba(255,255,255,0.9)",
    bgInput: "rgba(0,0,0,0.03)",
    bgHover: "rgba(0,0,0,0.04)",
    bgElevated: "rgba(0,0,0,0.06)",
    bgTopbar: "rgba(255,255,255,0.92)",
    bgTooltip: "rgba(255,255,255,0.98)",
    bgPanel: "rgba(255,255,255,0.98)",
    bgOverlay: "rgba(0,0,0,0.25)",
    bgWhiteSearch: "#FFFFFF",
    bgCode: "rgba(0,0,0,0.03)",
    // Text — opacity tiers bumped for legibility (was 0.12-0.75, now 0.25-0.88)
    text: "#1A1A2E",
    textStrong: "#0D0D1A",
    text70: "rgba(26,26,46,0.88)",
    text60: "rgba(26,26,46,0.80)",
    text55: "rgba(26,26,46,0.74)",
    text50: "rgba(26,26,46,0.70)",
    text45: "rgba(26,26,46,0.65)",
    text40: "rgba(26,26,46,0.60)",
    text35: "rgba(26,26,46,0.55)",
    text30: "rgba(26,26,46,0.48)",
    text25: "rgba(26,26,46,0.42)",
    text20: "rgba(26,26,46,0.32)",
    text15: "rgba(26,26,46,0.25)",
    // textInverse = always-dark text/icon used on bgWhiteSearch and similar always-light surfaces
    textInverse: "#1A1A2E",
    // Borders
    border: "rgba(0,0,0,0.08)",
    borderLight: "rgba(0,0,0,0.06)",
    borderMed: "rgba(0,0,0,0.1)",
    borderStrong: "rgba(0,0,0,0.15)",
    borderRow: "rgba(0,0,0,0.04)",
    borderSection: "rgba(0,0,0,0.06)",
    // Scrollbar
    scrollThumb: "rgba(0,0,0,0.1)",
    // Recharts
    gridLine: "rgba(0,0,0,0.06)",
    chartText: "rgba(26,26,46,0.55)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem("socradar-theme") || "dark"; } catch { return "dark"; }
  });

  const toggle = useCallback(() => {
    setMode(m => {
      const next = m === "dark" ? "light" : "dark";
      try { localStorage.setItem("socradar-theme", next); } catch {}
      return next;
    });
  }, []);

  // Apply CSS custom properties + data-theme attribute
  useEffect(() => {
    const t = themes[mode];
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    // Set CSS custom properties for global.css classes
    root.style.setProperty("--brand-coral", t.brandCoral);
    root.style.setProperty("--brand-coral-dark", t.brandCoralDark);
    root.style.setProperty("--brand-coral-light", t.brandCoralLight);
    root.style.setProperty("--brand-night", t.brandNight);
    root.style.setProperty("--brand-night-deep", t.brandNightDeep);
    root.style.setProperty("--bg-base", t.bgBase);
    root.style.setProperty("--bg-sidebar", t.bgSidebar);
    root.style.setProperty("--bg-card", t.bgCard);
    root.style.setProperty("--bg-card-sm", t.bgCardSm);
    root.style.setProperty("--bg-input", t.bgInput);
    root.style.setProperty("--bg-hover", t.bgHover);
    root.style.setProperty("--bg-elevated", t.bgElevated);
    root.style.setProperty("--bg-topbar", t.bgTopbar);
    root.style.setProperty("--bg-tooltip", t.bgTooltip);
    root.style.setProperty("--bg-panel", t.bgPanel);
    root.style.setProperty("--bg-overlay", t.bgOverlay);
    root.style.setProperty("--bg-code", t.bgCode);
    root.style.setProperty("--text", t.text);
    root.style.setProperty("--text-strong", t.textStrong);
    root.style.setProperty("--text-inverse", t.textInverse);
    root.style.setProperty("--text-70", t.text70);
    root.style.setProperty("--text-60", t.text60);
    root.style.setProperty("--text-55", t.text55);
    root.style.setProperty("--text-50", t.text50);
    root.style.setProperty("--text-45", t.text45);
    root.style.setProperty("--text-40", t.text40);
    root.style.setProperty("--text-35", t.text35);
    root.style.setProperty("--text-30", t.text30);
    root.style.setProperty("--text-25", t.text25);
    root.style.setProperty("--text-20", t.text20);
    root.style.setProperty("--text-15", t.text15);
    root.style.setProperty("--border", t.border);
    root.style.setProperty("--border-light", t.borderLight);
    root.style.setProperty("--border-med", t.borderMed);
    root.style.setProperty("--border-strong", t.borderStrong);
    root.style.setProperty("--border-row", t.borderRow);
    root.style.setProperty("--border-section", t.borderSection);
    root.style.setProperty("--scroll-thumb", t.scrollThumb);
    root.style.setProperty("--grid-line", t.gridLine);
    root.style.setProperty("--chart-text", t.chartText);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle, t: themes[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Fallback to dark theme if outside provider (shouldn't happen but prevents white screen)
  if (!ctx) return { mode: "dark", toggle: () => {}, t: themes.dark };
  return ctx;
}
