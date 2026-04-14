/**
 * Vite + React Example
 * Demonstrates: ThemeProvider, ResultCard, LayoutStack, Container, AnimatedEntry
 *
 * Install:
 *   npm install @pda-sim/ui-framework react react-dom
 */
import {
  ThemeProvider,
  useTheme,
  ResultCard,
  Container,
  LayoutStack,
  AnimatedEntry,
} from "@pda-sim/ui-framework";
import "@pda-sim/ui-framework/theme.css";

// ─── ThemeToggle ──────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        cursor: "pointer",
        fontSize: "0.9rem",
      }}
    >
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

// ─── Demo Page ───────────────────────────────────────────────────

function Demo() {
  return (
    <Container as="main" variant="md">
      <LayoutStack
        as="header"
        direction="h"
        gap="md"
        style={{ padding: "24px 0", justifyContent: "space-between" }}
      >
        <h1 style={{ margin: 0, color: "var(--text-primary)" }}>
          @pda-sim/ui-framework
        </h1>
        <ThemeToggle />
      </LayoutStack>

      <LayoutStack gap="xl">
        <AnimatedEntry variant="fade-up">
          <ResultCard
            variant="success"
            slots={{
              title: "✅ Build Verified",
              status: "ACCEPTED",
              divider: true,
              reason:
                "The package built successfully. ESM, CJS, and type declarations are all present.",
            }}
          />
        </AnimatedEntry>

        <AnimatedEntry variant="fade-up" delay="100ms">
          <ResultCard
            variant="danger"
            slots={{
              title: "❌ Rejection Case",
              status: "REJECTED",
              divider: true,
              reason:
                "This demonstrates the danger variant for invalid states.",
            }}
          />
        </AnimatedEntry>

        <AnimatedEntry variant="fade-up" delay="200ms">
          <ResultCard
            variant="warning"
            slots={{
              title: "⚠️ Warning State",
              status: "DEGRADED",
              reason: "This demonstrates the warning variant without a divider.",
            }}
          />
        </AnimatedEntry>

        <AnimatedEntry variant="scale-in" delay="300ms">
          <ResultCard
            variant="info"
            slots={{
              title: "ℹ️ Info Card",
              status: "IN PROGRESS",
              divider: true,
              reason: "Variant engine extension example: myVariants.extend({ size: { lg: 'card--lg' } })",
            }}
          />
        </AnimatedEntry>
      </LayoutStack>
    </Container>
  );
}

// ─── App Entry ───────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <Demo />
    </ThemeProvider>
  );
}
