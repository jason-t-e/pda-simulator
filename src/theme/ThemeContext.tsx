import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { DesignTokens } from "../types/ui";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme:       Theme;
  toggleTheme: () => void;
  tokens:      DesignTokens;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ─── SSR-safe helpers ──────────────────────────────────────────────

const EMPTY_TOKENS: DesignTokens = {
  accent: "", success: "", danger: "", background: "", text: ""
};

/**
 * Reads the theme from the DOM attribute applied by the blocking script.
 * This ensures the very first React state matches what is already on screen.
 */
function readThemeFromDOM(): Theme {
  if (typeof window === "undefined") return "dark"; // SSR: constant default
  // The blocking script in index.html sets both the DOM attr and window.__THEME__
  const domAttr = document.documentElement.getAttribute("data-theme");
  if (domAttr === "light" || domAttr === "dark") return domAttr;
  return window.__THEME__ ?? "dark";
}

function readTokens(): DesignTokens {
  if (typeof window === "undefined") return EMPTY_TOKENS;
  const s = getComputedStyle(document.documentElement);
  return {
    accent:     s.getPropertyValue("--accent-color").trim(),
    success:    s.getPropertyValue("--success").trim(),
    danger:     s.getPropertyValue("--danger").trim(),
    background: s.getPropertyValue("--bg-primary").trim(),
    text:       s.getPropertyValue("--text-primary").trim(),
  };
}

// ─── Provider ─────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * KEY DESIGN DECISION — zero hydration mismatch:
   *
   *  • The blocking script in index.html sets `data-theme` and `window.__THEME__`
   *    BEFORE React begins rendering.
   *  • We initialize React state by reading from the DOM attribute directly.
   *  • Because both server and client agree on the constant "dark" during SSR,
   *    and the DOM is already correct on the client before React mounts,
   *    the first React render matches the DOM → no mismatch warning.
   */
  const [theme, setTheme] = useState<Theme>(readThemeFromDOM);

  // Tokens are client-only; initialized as empty for SSR, populated post-mount.
  const [tokens, setTokens] = useState<DesignTokens>(EMPTY_TOKENS);

  // Sync both the DOM attribute and localStorage when theme changes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("pda-sim-theme", theme); } catch (_) { /* private mode */ }
    // Re-read CSS variable tokens after the attribute change settles.
    // rAF ensures the browser has processed the attribute update + repaint.
    const raf = requestAnimationFrame(() => setTokens(readTokens()));
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  // On first client mount, ensure tokens are populated (they are empty during SSR).
  useEffect(() => {
    setTokens(readTokens());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Consumer hook ─────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("[DS] useTheme must be used inside <ThemeProvider>.");
  return ctx;
};
