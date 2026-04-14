# @pda-sim/ui-framework

[![npm version](https://img.shields.io/npm/v/@pda-sim/ui-framework?color=6366f1&style=flat-square)](https://www.npmjs.com/package/@pda-sim/ui-framework)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@pda-sim/ui-framework?color=10b981&style=flat-square&label=gzip)](https://bundlephobia.com/package/@pda-sim/ui-framework)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Compatible-black?style=flat-square&logo=vercel)](https://vercel.com)

A production-ready, SSR-safe, tree-shakeable React UI framework with:

- **Type-driven variants** — invalid keys fail at compile time, not runtime
- **Compile-time slot enforcement** — required content cannot be omitted
- **Strict polymorphism** — `as` prop restricted to semantically safe elements
- **Zero-FOUC theming** — blocking init script + reactive context
- **O(1) variant resolution** — no runtime property iteration
- **Tree-shakeable** — named exports + `"sideEffects": false`
- **SSR-safe** — no `window`/`document` access during render
- **Vercel compatible** — works in static, serverless, and edge deployments

---

## Installation

```bash
npm install @pda-sim/ui-framework
# or
pnpm add @pda-sim/ui-framework
# or
yarn add @pda-sim/ui-framework
```

> **Peer dependencies** (install separately if not already present):
> ```bash
> npm install react react-dom
> ```

---

## Quick Start

### 1. Prevent Flash of Unstyled Content (FOUC)

Add this **blocking script** as the **first element in your `<head>`**, before any CSS links or other scripts:

```html
<script>
  (function () {
    var theme;
    try { theme = localStorage.getItem("ui-framework-theme"); } catch (e) {}
    if (theme !== "light" && theme !== "dark") {
      try {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark" : "light";
      } catch (e) { theme = "dark"; }
    }
    document.documentElement.setAttribute("data-theme", theme);
    window.__THEME__ = theme;
  })();
</script>
```

This script:
- Reads saved theme from `localStorage`
- Falls back to OS preference (`prefers-color-scheme`)
- Falls back to `"dark"` if localStorage is blocked (incognito mode, CSP)
- Sets `data-theme` attribute **before first paint** — zero FOUC

### 2. Import CSS tokens

```tsx
import "@pda-sim/ui-framework/theme.css";
```

### 3. Wrap your app

```tsx
import { ThemeProvider } from "@pda-sim/ui-framework";

root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
```

---

## Vite Setup

```tsx
// index.html — add the blocking script to <head>
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@pda-sim/ui-framework";
import "@pda-sim/ui-framework/theme.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

---

## Next.js App Router Setup

> **SSR Note**: `ThemeProvider` uses React state and must be a Client Component. Layout components (`Container`, `LayoutStack`, `ResultCard`, `AnimatedEntry`) are pure render functions and work as Server Components.

### `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "@pda-sim/ui-framework/theme.css";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "My App" };

const themeScript = `(function(){var t;try{t=localStorage.getItem('ui-framework-theme')}catch(e){}if(t!=='light'&&t!=='dark'){try{t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){t='dark'}}document.documentElement.setAttribute('data-theme',t);window.__THEME__=t;})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

> `suppressHydrationWarning` on `<html>` is required because `data-theme` is set dynamically and Next.js would otherwise warn about the mismatch between server HTML and client render.

### `app/providers.tsx`

```tsx
"use client";
import { ThemeProvider } from "@pda-sim/ui-framework";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

### `next.config.ts`

```ts
import type { NextConfig } from "next";

export default {
  transpilePackages: ["@pda-sim/ui-framework"],
} satisfies NextConfig;
```

---

## Components

### `ResultCard`

Structured status card with compile-time slot enforcement.

```tsx
import { ResultCard } from "@pda-sim/ui-framework";

// ✅ Valid — all required slots provided
<ResultCard
  variant="success"
  slots={{
    title: "Simulation Result",
    status: "ACCEPTED",
    divider: true,          // optional
    reason: "The string was accepted by the automaton.",
  }}
/>

// ❌ TypeScript Error — `reason` slot is required
<ResultCard
  variant="danger"
  slots={{ title: "Error", status: "REJECTED" }}  // TS2741: Property 'reason' is missing
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"success" \| "danger" \| "neutral" \| "info" \| "warning"` | `"neutral"` | Visual style |
| `slots.title` | `ReactNode` | **required** | Card heading |
| `slots.status` | `ReactNode` | **required** | Status badge  |
| `slots.reason` | `ReactNode` | **required** | Body text |
| `slots.divider` | `ReactNode` | optional | Horizontal rule |
| `as` | `"div" \| "article" \| "section"` | `"div"` | Element override |

---

### `LayoutStack`

```tsx
import { LayoutStack } from "@pda-sim/ui-framework";

<LayoutStack direction="h" gap="lg" center>
  <Button>Save</Button>
  <Button>Cancel</Button>
</LayoutStack>
```

| Prop | Type | Default |
|---|---|---|
| `direction` | `"v" \| "h"` | `"v"` |
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` |
| `center` | `boolean` | `false` |
| `as` | `"div" \| "nav" \| "header" \| "footer" \| "section"` | `"div"` |

---

### `Container`

```tsx
<Container as="main" variant="lg">
  <h1>Content</h1>
</Container>
```

| Prop | `"sm"` | `"md"` | `"lg"` | `"full"` |
|---|---|---|---|---|
| max-width | 640px | 860px | 1200px | 100% |

---

### `AnimatedEntry`

GPU-composited entry animations. Respects `prefers-reduced-motion`.

```tsx
<AnimatedEntry variant="scale-in" delay="150ms">
  <ResultCard ... />
</AnimatedEntry>
```

| Variant | Effect |
|---|---|
| `"fade-up"` | Fade in + rise 12px |
| `"fade-in"` | Opacity only |
| `"scale-in"` | Scale from 92% + fade |
| `"slide-in"` | Slide from left + fade |

---

### `ThemeProvider` + `useTheme`

```tsx
import { useTheme } from "@pda-sim/ui-framework";

function Header() {
  const { theme, toggleTheme, tokens } = useTheme();

  // tokens.accent, tokens.success, tokens.danger, etc. are live CSS variable values
  return (
    <button
      onClick={toggleTheme}
      style={{ color: tokens.accent }}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
```

| Prop | Type | Description |
|---|---|---|
| `theme` | `"light" \| "dark"` | Current active theme |
| `toggleTheme` | `() => void` | Toggle theme |
| `tokens` | `DesignTokens` | Live CSS variable values |
| `storageKey` | `string` (prop) | Custom localStorage key |

---

## Variant Extension

The variant engine supports type-safe `.extend()` for custom variants:

```ts
import { createVariants } from "@pda-sim/ui-framework";

const buttonVariants = createVariants("btn", {
  intent: { primary: "btn--primary", ghost: "btn--ghost" }
}).extend({
  size: { sm: "btn--sm", md: "btn--md", lg: "btn--lg" }
}, { size: "md" });

// TypeScript knows 'intent' AND 'size' are valid:
buttonVariants({ intent: "primary", size: "lg" }); // "btn btn--primary btn--lg"

// ❌ TypeScript Error — 'huge' is not a valid size
buttonVariants({ size: "huge" });
```

---

## Theming

All design tokens are CSS custom properties. Override at any scope:

```css
/* Global override */
:root {
  --accent-color: #7c3aed;
}

/* Scoped override */
.my-section {
  --accent-color: #0891b2;
}
```

**Full token reference:**

| Token | Dark | Light | Usage |
|---|---|---|---|
| `--bg-primary` | `#0f1117` | `#f8fafc` | Page background |
| `--bg-card` | `#1a2035` | `#ffffff` | Card backgrounds |
| `--text-primary` | `#e2e8f0` | `#0f172a` | Body text |
| `--accent-color` | `#6366f1` | `#4f46e5` | Interactive elements |
| `--success` | `#10b981` | `#059669` | Success states |
| `--danger` | `#ef4444` | `#dc2626` | Error states |
| `--warning` | `#f59e0b` | `#d97706` | Warning states |

---

## Publishing

### Automated (recommended)

Push to `main` — the GitHub Actions workflow publishes automatically if the version changed.

### Manual version bump

```bash
# From packages/ui-framework/
npm run release:patch   # 1.0.0 → 1.0.1
npm run release:minor   # 1.0.0 → 1.1.0
npm run release:major   # 1.0.0 → 2.0.0
```

### Setup NPM Token (one-time)

1. Go to [npmjs.com](https://www.npmjs.com) → **Access Tokens** → `Generate New Token (Classic)` → **Automation**
2. Copy the token
3. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
4. Add secret: Name = `NPM_TOKEN`, Value = your token

---

## License

MIT — see [LICENSE](./LICENSE)
