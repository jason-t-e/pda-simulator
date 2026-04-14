import React, { forwardRef } from "react";
import type { DesignVariant, RequiredSlots, OptionalSlots, PolymorphicProps } from "../../types/ui";
import { createVariants, cn } from "../../utils/variants";

/**
 * Design System v7.0 — ResultCard
 * ─────────────────────────────────────────────────────────────────
 * Slot-based API: structure is enforced at compile-time.
 * RequiredSlots → title, status, reason (cannot be undefined).
 * OptionalSlots → divider (structural divider is optional).
 */

const rootVariants = createVariants("res-card anim-entry anim--scale-in", {
  variant: {
    success: "res-card--success",
    danger:  "res-card--danger",
    neutral: "res-card--neutral",
    info:    "res-card--info",
    warning: "res-card--warning",
  }
}, { variant: "neutral" });

// ─── Slot Types ────────────────────────────────────────────────────

type RequiredCardSlots = "title" | "status" | "reason";
type OptionalCardSlots = "divider";

interface CardSlots extends RequiredSlots<RequiredCardSlots>, OptionalSlots<OptionalCardSlots> {}

// ─── Component Types ───────────────────────────────────────────────

interface ResultCardOwnProps {
  variant?: DesignVariant;
  /** Required structural content slots. title, status, and reason are mandatory. */
  slots: CardSlots;
}

type ResultCardElement = "div" | "article" | "section";

export type ResultCardProps<C extends ResultCardElement = "div"> =
  PolymorphicProps<C, ResultCardOwnProps>;

// ─── Implementation ────────────────────────────────────────────────

const ResultCardInner = forwardRef(
  <C extends ResultCardElement = "div">(
    { as, variant = "neutral", slots, className, ...rest }: ResultCardProps<C>,
    ref: React.Ref<any>
  ) => {
    const Component = (as ?? "div") as React.ElementType;

    return (
      <Component
        ref={ref}
        className={rootVariants({ variant, className })}
        {...rest}
      >
        <div className="res-card__title">{slots.title}</div>

        <div className={cn("res-card__status", `res-card__status--${variant}`)}>
          {slots.status}
        </div>

        {/* Divider is optional — only rendered when explicitly provided */}
        {slots.divider !== undefined && <div className="res-card__divider" />}

        <div className="res-card__reason">{slots.reason}</div>
      </Component>
    );
  }
);

ResultCardInner.displayName = "ResultCard";

// Re-export with proper generic signature preserved through the cast.
export const ResultCard = ResultCardInner as <C extends ResultCardElement = "div">(
  props: ResultCardProps<C>
) => React.ReactElement;
