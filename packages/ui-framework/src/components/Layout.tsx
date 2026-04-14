import React, { forwardRef } from "react";
import type { SpacingSize, ContainerVariant, PolymorphicProps } from "../types/ui";
import { createVariants } from "../utils/variants";

// ─── Container ────────────────────────────────────────────────────

const containerVariants = createVariants("ds-container", {
  variant: {
    sm:   "container--sm",
    md:   "container--md",
    lg:   "container--lg",
    full: "",
  },
}, { variant: "md" });

type ContainerEl = "div" | "main" | "section" | "article";

interface ContainerOwnProps {
  /** Width constraint variant. Defaults to "md". */
  variant?: ContainerVariant;
}

const ContainerInner = forwardRef(
  <C extends ContainerEl = "div">(
    { as, variant, children, className, ...rest }: PolymorphicProps<C, ContainerOwnProps>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = (as ?? "div") as React.ElementType;
    return (
      <Component ref={ref} className={containerVariants({ variant, className })} {...rest}>
        {children}
      </Component>
    );
  }
);
ContainerInner.displayName = "Container";

/**
 * Centered, max-width content container.
 *
 * @example
 * ```tsx
 * <Container as="main" variant="lg">
 *   <h1>Page Content</h1>
 * </Container>
 * ```
 */
export const Container = ContainerInner as <C extends ContainerEl = "div">(
  props: PolymorphicProps<C, ContainerOwnProps>
) => React.ReactElement;

// ─── LayoutStack ─────────────────────────────────────────────────

const stackVariants = createVariants("ds-stack", {
  direction: { v: "layout-v-stack", h: "layout-h-stack" },
  gap: {
    none: "ds-gap--none",
    xs:   "ds-gap--xs",
    sm:   "ds-gap--sm",
    md:   "ds-gap--md",
    lg:   "ds-gap--lg",
    xl:   "ds-gap--xl",
  },
  center: { true: "layout-center", false: "" },
}, { direction: "v", gap: "md", center: false });

type StackEl = "div" | "nav" | "header" | "footer" | "section";

interface StackOwnProps {
  /** Stack direction. Defaults to "v" (vertical). */
  direction?: "v" | "h";
  /** Gap between children. Defaults to "md". */
  gap?: SpacingSize;
  /** Center children on both axes. Defaults to false. */
  center?: boolean;
}

const LayoutStackInner = forwardRef(
  <C extends StackEl = "div">(
    { as, direction, gap, center, children, className, ...rest }: PolymorphicProps<C, StackOwnProps>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = (as ?? "div") as React.ElementType;
    return (
      <Component
        ref={ref}
        className={stackVariants({ direction, gap, center, className })}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);
LayoutStackInner.displayName = "LayoutStack";

/**
 * Flexbox stack layout with direction, gap and centering controls.
 *
 * @example
 * ```tsx
 * <LayoutStack direction="h" gap="lg">
 *   <Button>Save</Button>
 *   <Button variant="outline">Cancel</Button>
 * </LayoutStack>
 * ```
 */
export const LayoutStack = LayoutStackInner as <C extends StackEl = "div">(
  props: PolymorphicProps<C, StackOwnProps>
) => React.ReactElement;

// ─── StepCard ────────────────────────────────────────────────────

type StepEl = "section" | "article" | "div";

interface StepCardOwnProps {
  /** Optional heading rendered as an <h2> */
  title?: string;
  /** Remove the bottom border. Useful for the last card in a list. */
  noBorder?: boolean;
}

const StepCardInner = forwardRef(
  <C extends StepEl = "section">(
    { as, title, children, className, noBorder, style, ...rest }: PolymorphicProps<C, StepCardOwnProps>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = (as ?? "section") as React.ElementType;
    return (
      <Component
        ref={ref}
        className={`step-card${className ? ` ${className}` : ""}`}
        style={{ ...style, ...(noBorder ? { borderBottom: "none" } : {}) }}
        {...rest}
      >
        {title !== undefined && <h2>{title}</h2>}
        {children}
      </Component>
    );
  }
);
StepCardInner.displayName = "StepCard";

/**
 * A labelled card section for multi-step layouts.
 *
 * @example
 * ```tsx
 * <StepCard title="Step 1: Configure">
 *   <p>Fill in the fields below.</p>
 * </StepCard>
 * ```
 */
export const StepCard = StepCardInner as <C extends StepEl = "section">(
  props: PolymorphicProps<C, StepCardOwnProps>
) => React.ReactElement;
