import type React from "react";

// ─── Design Tokens ────────────────────────────────────────────────
export interface DesignTokens {
  accent:     string;
  success:    string;
  danger:     string;
  background: string;
  text:       string;
}

// ─── Semantic Design Types ────────────────────────────────────────
export type DesignVariant    = "success" | "danger" | "neutral" | "info" | "warning";
export type SpacingSize      = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type ContainerVariant = "sm" | "md" | "lg" | "full";
export type AnimationType    = "fade-up" | "fade-in" | "scale-in" | "slide-in";

// ─── Polymorphic Element Constraints ─────────────────────────────
/**
 * SafeBlockElement: block-level elements that:
 *  – support ref and className uniformly
 *  – do NOT cause SSR/hydration mismatches
 *  – are semantically appropriate for layout containers
 */
export type SafeBlockElement =
  | "div" | "section" | "article" | "main"
  | "header" | "footer" | "nav" | "aside";

export type SafeInlineElement = "span" | "p";
export type SafeElement = SafeBlockElement | SafeInlineElement;

// ─── Polymorphic Prop Utilities ───────────────────────────────────
export type AsProp<T extends SafeElement> = { as?: T };

/**
 * Merges component-specific OwnProps with the DOM element's props,
 * using OwnProps to shadow any conflicting element props.
 * No `any` used — fully typed through conditional inference.
 */
export type PolymorphicProps<
  T extends SafeElement,
  OwnProps = Record<string, never>
> = OwnProps &
  AsProp<T> &
  Omit<React.ComponentPropsWithRef<T>, keyof OwnProps | "as">;

// ─── Slot System ──────────────────────────────────────────────────
/**
 * RequiredSlots: ALL keys must be provided.
 * Use for structurally-critical content (title, body, etc.)
 * that cannot be omitted without breaking the component's layout.
 */
export type RequiredSlots<T extends string> = { [K in T]: React.ReactNode };

/**
 * OptionalSlots: keys may be omitted.
 * Use for supplementary content (dividers, footers, icons).
 */
export type OptionalSlots<T extends string> = { [K in T]?: React.ReactNode };

// ─── Global Augmentation ─────────────────────────────────────────
/**
 * Augments the global Window interface to include the theme token
 * set by the blocking initialization script in index.html.
 * This makes window.__THEME__ accessible without type assertions.
 */
declare global {
  interface Window {
    __THEME__?: "light" | "dark";
  }
}
