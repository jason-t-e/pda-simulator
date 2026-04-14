/**
 * Next.js (App Router) Example — @pda-sim/ui-framework
 *
 * SSR-safe integration pattern:
 *  1. Blocking script in layout.tsx <head> prevents FOUC
 *  2. ThemeProvider is a Client Component boundary
 *  3. All UI components are tree-shakeable and hydrate correctly
 */

// ─── app/layout.tsx ───────────────────────────────────────────────
//
// import type { Metadata } from "next";
// import "@pda-sim/ui-framework/theme.css";
// import { Providers } from "./providers";
//
// export const metadata: Metadata = {
//   title: "My App",
// };
//
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // CRITICAL: The dangerouslySetInnerHTML script MUST render before any
//   // React hydration. This sets data-theme synchronously on the server-
//   // rendered HTML, preventing FOUC. Next.js will preserve this in SSR output.
//   const themeScript = `
//     (function(){
//       var t;
//       try{t=localStorage.getItem('ui-framework-theme')}catch(e){}
//       if(t!=='light'&&t!=='dark'){
//         try{t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
//         catch(e){t='dark'}
//       }
//       document.documentElement.setAttribute('data-theme',t);
//       window.__THEME__=t;
//     })();
//   `.trim();
//
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         {/* suppressHydrationWarning on html is required because data-theme
//             is set dynamically and will differ between SSR and client */}
//         <script dangerouslySetInnerHTML={{ __html: themeScript }} />
//       </head>
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }


// ─── app/providers.tsx ────────────────────────────────────────────
//
// "use client"; // <-- Required: ThemeProvider uses React state + localStorage
//
// import { ThemeProvider } from "@pda-sim/ui-framework";
//
// export function Providers({ children }: { children: React.ReactNode }) {
//   return <ThemeProvider>{children}</ThemeProvider>;
// }


// ─── app/page.tsx ─────────────────────────────────────────────────
//
// // Server Component (default in App Router)
// import { ResultCard, Container, AnimatedEntry } from "@pda-sim/ui-framework";
//
// export default function Page() {
//   return (
//     <Container as="main" variant="lg">
//       <AnimatedEntry variant="scale-in">
//         <ResultCard
//           variant="success"
//           slots={{
//             title: "SSR Verified",
//             status: "ACCEPTED",
//             divider: true,
//             reason: "This page was server-rendered without hydration errors.",
//           }}
//         />
//       </AnimatedEntry>
//     </Container>
//   );
// }
//
// NOTE: ResultCard, Container, AnimatedEntry are pure render functions with
// no state or browser APIs, so they work perfectly as Server Components.
// ThemeProvider must be a Client Component (use client) due to useState/useEffect.


// ─── next.config.ts ──────────────────────────────────────────────
//
// import type { NextConfig } from "next";
//
// const config: NextConfig = {
//   // Transpile the package so Next.js can handle ESM imports & CSS
//   transpilePackages: ["@pda-sim/ui-framework"],
// };
//
// export default config;

export {};
