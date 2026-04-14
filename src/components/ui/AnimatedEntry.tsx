import React, { forwardRef } from "react";
import type { AnimationType, PolymorphicProps } from "../../types/ui";
import { createVariants } from "../../utils/variants";

/**
 * Design System v7.0 — AnimatedEntry
 * ─────────────────────────────────────────────────────────────────
 * GPU-only animations: only `transform` and `opacity` are animated
 * to avoid layout thrashing. `will-change` is set as a paint hint.
 */

const animVariants = createVariants("anim-entry", {
  variant: {
    "fade-up":  "anim--fade-up",
    "fade-in":  "anim--fade-in",
    "scale-in": "anim--scale-in",
    "slide-in": "anim--slide-in",
  }
}, { variant: "fade-up" });

type AnimEl = "div" | "section" | "article" | "aside";

interface AnimatedEntryOwnProps {
  variant?: AnimationType;
  /** CSS animation-delay value. Defaults to "0s". */
  delay?: string;
}

const AnimatedEntryInner = forwardRef(
  <C extends AnimEl = "div">(
    { as, variant, children, className, delay = "0s", style, ...rest }: PolymorphicProps<C, AnimatedEntryOwnProps>,
    ref: React.Ref<any>
  ) => {
    const Component = (as ?? "div") as React.ElementType;
    return (
      <Component
        ref={ref}
        className={animVariants({ variant, className })}
        style={{
          ...style,
          animationDelay: delay,
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

export const AnimatedEntry = AnimatedEntryInner as <C extends AnimEl = "div">(
  props: PolymorphicProps<C, AnimatedEntryOwnProps>
) => React.ReactElement;
