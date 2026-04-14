import type React from "react";

// ─── Design Token Types ────────────────────────────────────────────
export interface DesignTokens {
  accent:     string;
  success:    string;
  danger:     string;
  background: string;
  text:       string;
}

// ─── Semantic Variant Types ────────────────────────────────────────
export type DesignVariant    = "success" | "danger" | "neutral" | "info" | "warning";
export type SpacingSize      = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type ContainerVariant = "sm" | "md" | "lg" | "full";
export type AnimationType    = "fade-up" | "fade-in" | "scale-in" | "slide-in";

// ─── Safe Polymorphic Elements ─────────────────────────────────────
// Restricted to block-level elements that:
//  • support className, ref, and standard DOM attributes
//  • do NOT cause semantic/hydration conflicts (no Fragment, Portal, svg, img, etc.)
export type SafeBlockElement =
  | "div" | "section" | "article" | "main"
  | "header" | "footer" | "nav" | "aside";

export type SafeInlineElement = "span" | "p";
export type SafeElement = SafeBlockElement | SafeInlineElement;

// ─── Polymorphic Prop Utilities ────────────────────────────────────
export type AsProp<T extends SafeElement> = { as?: T };

export type PolymorphicProps<T extends SafeElement, OwnProps = {}> =
  OwnProps &
  AsProp<T> &
  Omit<React.ComponentPropsWithRef<T>, keyof OwnProps | "as">;

// ─── Slot Prop System (Required Structural Props) ──────────────────
/**
 * RequiredSlots: all keys MUST be provided.
 * Prevents undefined slots reaching the DOM at compile time.
 */
export type RequiredSlots<T extends string> = {
  [K in T]: React.ReactNode;
};

/**
 * OptionalSlots: some keys may be omitted.
 */
export type OptionalSlots<T extends string> = {
  [K in T]?: React.ReactNode;
};

// ─── Global Type Augmentation ──────────────────────────────────────
// Allows ThemeContext to safely read window.__THEME__ set by the
// blocking script in index.html without TypeScript errors.
declare global {
  interface Window {
    __THEME__?: "light" | "dark";
  }
}
