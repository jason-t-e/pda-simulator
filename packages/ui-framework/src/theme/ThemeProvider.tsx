import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { DesignTokens } from "../types/ui";

// ─── Types ────────────────────────────────────────────────────────

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  /** Current active theme. */
  theme: Theme;
  /** Toggle between light and dark. */
  toggleTheme: () => void;
  /** Live CSS variable values for the current theme. */
  tokens: DesignTokens;
}

// ─── Constants ────────────────────────────────────────────────────

const STORAGE_KEY = "ui-framework-theme";

const EMPTY_TOKENS: DesignTokens = {
  accent: "", success: "", danger: "", background: "", text: "",
};

// ─── SSR-safe helpers ─────────────────────────────────────────────

/**
 * Reads the theme from the DOM (set by the blocking init script).
 * Returns a stable "dark" constant during SSR/build time.
 */
function readThemeFromDOM(): Theme {
  if (typeof window === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return (window.__THEME__ ?? "dark") as Theme;
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

// ─── Context ──────────────────────────────────────────────────────

const ThemeCtx = createContext<ThemeContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Optionally override the localStorage key used to persist the theme.
   * Useful if you embed this framework alongside another theme system.
   */
  storageKey?: string;
  /**
   * Inline blocking script content as a string, to be injected into your
   * document `<head>` before React mounts. When omitted, the provider
   * performs a best-effort read from the DOM attribute on mount.
   */
  defaultTheme?: Theme;
}

/**
 * Wraps your application to provide theme state and design tokens.
 *
 * @example
 * ```tsx
 * // In your index.html <head> (BLOCKING — prevents FOUC):
 * // <script>
 * //   (function(){var t;try{t=localStorage.getItem('ui-framework-theme')}catch(e){}
 * //   if(t!=='light'&&t!=='dark'){try{t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){t='dark'}}
 * //   document.documentElement.setAttribute('data-theme',t);window.__THEME__=t;})();
 * // </script>
 *
 * root.render(
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 * );
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  storageKey = STORAGE_KEY,
  defaultTheme,
}) => {
  const [theme, setTheme] = useState<Theme>(() => defaultTheme ?? readThemeFromDOM());
  const [tokens, setTokens] = useState<DesignTokens>(EMPTY_TOKENS);

  // Apply theme to DOM and persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (_) {
      // Silent: blocked in private mode or by CSP
    }
    // Sync tokens after paint using rAF — no MutationObserver needed
    const raf = requestAnimationFrame(() => setTokens(readTokens()));
    return () => cancelAnimationFrame(raf);
  }, [theme, storageKey]);

  // Populate tokens on first client mount (empty during SSR snapshot)
  useEffect(() => { setTokens(readTokens()); }, []);

  const toggleTheme = useCallback(() => {
    setTheme(p => (p === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme, tokens }}>
      {children}
    </ThemeCtx.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────

/**
 * Access the current theme and design tokens.
 * Must be used inside `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, tokens } = useTheme();
 * ```
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    throw new Error(
      "[@pda-sim/ui-framework] useTheme() must be used inside <ThemeProvider>."
    );
  }
  return ctx;
}
