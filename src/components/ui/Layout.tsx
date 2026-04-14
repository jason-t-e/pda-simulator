import React, { forwardRef } from "react";
import type { SpacingSize, ContainerVariant, PolymorphicProps } from "../../types/ui";import { createVariants } from "../../utils/variants";

/**
 * Design System v7.0 — Layout Components
 * ─────────────────────────────────────────────────────────────────
 * All elements restricted to SafeBlockElement to prevent semantic
 * misuse and hydration conflicts on Vercel/SSR environments.
 */

// ─── Container ────────────────────────────────────────────────────

const containerVariants = createVariants("ds-container", {
  variant: {
    sm:   "container--sm",
    md:   "container--md",
    lg:   "container--lg",
    full: "",
  }
}, { variant: "md" });

type ContainerEl = "div" | "main" | "section" | "article";

interface ContainerOwnProps { variant?: ContainerVariant; }

const ContainerInner = forwardRef(
  <C extends ContainerEl = "div">(
    { as, variant, children, className, ...rest }: PolymorphicProps<C, ContainerOwnProps>,
    ref: React.Ref<any>
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

export const Container = ContainerInner as <C extends ContainerEl = "div">(
  props: PolymorphicProps<C, ContainerOwnProps>
) => React.ReactElement;

// ─── LayoutStack ──────────────────────────────────────────────────

const stackVariants = createVariants("ds-stack", {
  direction: {
    v: "layout-v-stack",
    h: "layout-h-stack",
  },
  gap: {
    none: "ds-gap--none",
    xs:   "ds-gap--xs",
    sm:   "ds-gap--sm",
    md:   "ds-gap--md",
    lg:   "ds-gap--lg",
    xl:   "ds-gap--xl",
  },
  center: {
    true:  "layout-center",
    false: "",
  }
}, { direction: "v", gap: "md", center: false });

type StackEl = "div" | "nav" | "header" | "footer" | "section";

interface StackOwnProps {
  direction?: "v" | "h";
  gap?: SpacingSize;
  center?: boolean;
}

const LayoutStackInner = forwardRef(
  <C extends StackEl = "div">(
    { as, direction, gap, center, children, className, ...rest }: PolymorphicProps<C, StackOwnProps>,
    ref: React.Ref<any>
  ) => {
    const Component = (as ?? "div") as React.ElementType;
    return (
      <Component ref={ref} className={stackVariants({ direction, gap, center, className })} {...rest}>
        {children}
      </Component>
    );
  }
);
LayoutStackInner.displayName = "LayoutStack";

export const LayoutStack = LayoutStackInner as <C extends StackEl = "div">(
  props: PolymorphicProps<C, StackOwnProps>
) => React.ReactElement;

// ─── StepCard ─────────────────────────────────────────────────────

type StepEl = "section" | "article" | "div";

interface StepCardOwnProps {
  title?: string;
  noBorder?: boolean;
}

const StepCardInner = forwardRef(
  <C extends StepEl = "section">(
    { as, title, children, className, noBorder, style, ...rest }: PolymorphicProps<C, StepCardOwnProps>,
    ref: React.Ref<any>
  ) => {
    const Component = (as ?? "section") as React.ElementType;
    return (
      <Component
        ref={ref}
        className={`step-card${className ? ` ${className}` : ""}`}
        style={{ ...style, borderBottom: noBorder ? "none" : undefined }}
        {...rest}
      >
        {title && <h2>{title}</h2>}
        {children}
      </Component>
    );
  }
);
StepCardInner.displayName = "StepCard";

export const StepCard = StepCardInner as <C extends StepEl = "section">(
  props: PolymorphicProps<C, StepCardOwnProps>
) => React.ReactElement;
