import React, { forwardRef } from "react";
import type { AnimationType, PolymorphicProps } from "../types/ui";
import { createVariants } from "../utils/variants";

// ─── Variant Engine ───────────────────────────────────────────────

const animVariants = createVariants("anim-entry", {
  variant: {
    "fade-up":  "anim--fade-up",
    "fade-in":  "anim--fade-in",
    "scale-in": "anim--scale-in",
    "slide-in": "anim--slide-in",
  },
}, { variant: "fade-up" });

// ─── Types ────────────────────────────────────────────────────────

type AnimEl = "div" | "section" | "article" | "aside";

interface AnimatedEntryOwnProps {
  /** Animation variant. Defaults to "fade-up". */
  variant?: AnimationType;
  /**
   * CSS `animation-delay` value (e.g. "200ms", "0.5s").
   * Defaults to "0s".
   */
  delay?: string;
}

// ─── Component ───────────────────────────────────────────────────

const AnimatedEntryInner = forwardRef(
  <C extends AnimEl = "div">(
    { as, variant, children, className, delay = "0s", style, ...rest }: PolymorphicProps<C, AnimatedEntryOwnProps>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = (as ?? "div") as React.ElementType;

    return (
      <Component
        ref={ref}
        className={animVariants({ variant, className })}
        style={{
          ...style,
          animationDelay: delay,
          // GPU compositing hint: promote to own layer for layout-free animation
          willChange: "transform, opacity",
        }}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

AnimatedEntryInner.displayName = "AnimatedEntry";

/**
 * Wraps children in a GPU-composited entry animation.
 * Only `opacity` and `transform` are animated to prevent layout thrashing.
 * Respects `prefers-reduced-motion` via the theme.css media query.
 *
 * @example
 * ```tsx
 * <AnimatedEntry variant="scale-in" delay="150ms">
 *   <ResultCard ... />
 * </AnimatedEntry>
 * ```
 */
export const AnimatedEntry = AnimatedEntryInner as <C extends AnimEl = "div">(
  props: PolymorphicProps<C, AnimatedEntryOwnProps>
) => React.ReactElement;
