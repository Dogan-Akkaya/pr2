import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Theme Definitions ──
const themes = {
  dark: {
    name: "dark",
    // Backgrounds
    bgBase: "#0C1021",
    bgSidebar: "#151B2E",
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
    // Text
    text: "#E8ECF1",
    textStrong: "#fff",
    text70: "rgba(232,236,241,0.7)",
    text60: "rgba(232,236,241,0.6)",
    text55: "rgba(232,236,241,0.55)",
    text50: "rgba(232,236,241,0.5)",
    text45: "rgba(232,236,241,0.45)",
    text40: "rgba(232,236,241,0.4)",
    text35: "rgba(232,236,241,0.35)",
    text30: "rgba(232,236,241,0.3)",
    text25: "rgba(232,236,241,0.25)",
    text20: "rgba(232,236,241,0.2)",
    text15: "rgba(232,236,241,0.15)",
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
    chartText: "rgba(232,236,241,0.3)",
  },
  light: {
    name: "light",
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
    // Text
    text: "#1A1A2E",
    textStrong: "#0D0D1A",
    text70: "rgba(26,26,46,0.75)",
    text60: "rgba(26,26,46,0.65)",
    text55: "rgba(26,26,46,0.6)",
    text50: "rgba(26,26,46,0.55)",
    text45: "rgba(26,26,46,0.5)",
    text40: "rgba(26,26,46,0.45)",
    text35: "rgba(26,26,46,0.4)",
    text30: "rgba(26,26,46,0.35)",
    text25: "rgba(26,26,46,0.28)",
    text20: "rgba(26,26,46,0.2)",
    text15: "rgba(26,26,46,0.12)",
    textInverse: "#E8ECF1",
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
    chartText: "rgba(26,26,46,0.4)",
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
    root.style.setProperty("--bg-base", t.bgBase);
    root.style.setProperty("--bg-sidebar", t.bgSidebar);
    root.style.setProperty("--bg-card", t.bgCard);
    root.style.setProperty("--bg-card-sm", t.bgCardSm);
    root.style.setProperty("--bg-input", t.bgInput);
    root.style.setProperty("--bg-hover", t.bgHover);
    root.style.setProperty("--bg-topbar", t.bgTopbar);
    root.style.setProperty("--text", t.text);
    root.style.setProperty("--text-40", t.text40);
    root.style.setProperty("--text-25", t.text25);
    root.style.setProperty("--text-20", t.text20);
    root.style.setProperty("--text-15", t.text15);
    root.style.setProperty("--border", t.border);
    root.style.setProperty("--border-light", t.borderLight);
    root.style.setProperty("--border-med", t.borderMed);
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
