import React, { forwardRef } from "react";
import type { DesignVariant, PolymorphicProps, RequiredSlots, OptionalSlots } from "../types/ui";
import { createVariants, cn } from "../utils/variants";

// ─── Variant Engine ───────────────────────────────────────────────

const cardVariants = createVariants("res-card", {
  variant: {
    success: "res-card--success",
    danger:  "res-card--danger",
    neutral: "res-card--neutral",
    info:    "res-card--info",
    warning: "res-card--warning",
  },
}, { variant: "neutral" });

// ─── Slot Types ───────────────────────────────────────────────────

/** Structural slots: cannot be omitted at compile time. */
type RequiredCardSlots = "title" | "status" | "reason";
/** Supplementary slots: may be omitted. */
type OptionalCardSlots = "divider";

export interface CardSlots
  extends RequiredSlots<RequiredCardSlots>,
          OptionalSlots<OptionalCardSlots> {}

// ─── Props ────────────────────────────────────────────────────────

export interface ResultCardOwnProps {
  /** Visual variant. Defaults to "neutral". */
  variant?: DesignVariant;
  /**
   * Required content slots.
   * - `title`  — the card heading (required)
   * - `status` — prominent status badge (required)
   * - `reason` — explanatory body text (required)
   * - `divider`— optional horizontal rule between status and reason
   */
  slots: CardSlots;
}

type ResultCardElement = "div" | "article" | "section";

export type ResultCardProps<C extends ResultCardElement = "div"> =
  PolymorphicProps<C, ResultCardOwnProps>;

// ─── Component ────────────────────────────────────────────────────

const ResultCardInner = forwardRef(
  <C extends ResultCardElement = "div">(
    { as, variant = "neutral", slots, className, ...rest }: ResultCardProps<C>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = (as ?? "div") as React.ElementType;

    return (
      <Component
        ref={ref}
        className={cardVariants({ variant, className })}
        {...rest}
      >
        <div className="res-card__title">{slots.title}</div>

        <div className={cn("res-card__status", `res-card__status--${variant}`)}>
          {slots.status}
        </div>

        {slots.divider !== undefined && (
          <div className="res-card__divider" role="separator" />
        )}

        <div className="res-card__reason">{slots.reason}</div>
      </Component>
    );
  }
);

ResultCardInner.displayName = "ResultCard";

/**
 * A structured result/status card with compile-time slot enforcement.
 *
 * @example
 * ```tsx
 * <ResultCard
 *   variant="success"
 *   slots={{
 *     title: "Verification Complete",
 *     status: "ACCEPTED",
 *     divider: true,
 *     reason: "The input string was processed and accepted by the automaton.",
 *   }}
 * />
 * ```
 */
export const ResultCard = ResultCardInner as <C extends ResultCardElement = "div">(
  props: ResultCardProps<C>
) => React.ReactElement;
