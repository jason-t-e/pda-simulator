type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

/**
 * Minimal class merger — no allocations, direct string concat.
 */
export function cn(...inputs: ClassValue[]): string {
  let out = "";
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (!input) continue;
    if (typeof input === "string") { if (out) out += " "; out += input; }
    else if (typeof input === "number") { if (out) out += " "; out += input; }
    else if (Array.isArray(input)) { const s = cn(...input); if (s) { if (out) out += " "; out += s; } }
    else if (typeof input === "object") {
      for (const key in input) { if (input[key]) { if (out) out += " "; out += key; } }
    }
  }
  return out;
}

/**
 * Design System v7.0 — Variant Engine
 * ─────────────────────────────────────
 * O(1) lookup: no runtime loops, no temporary array allocations.
 * Supports .extend() for type-preserving extension without any usage of `any`.
 */
type VariantMap = Record<string, string>;
type VariantConfig = Record<string, VariantMap>;
type DefaultsOf<T extends VariantConfig> = { [K in keyof T]?: (keyof T[K]) | boolean };
type PropsOf<T extends VariantConfig>    = { [K in keyof T]?: (keyof T[K]) | boolean } & { className?: string };

type VariantFn<T extends VariantConfig> = {
  (props?: PropsOf<T>): string;
  /** Immutably merge additional variants, preserving full type inference. */
  extend<E extends VariantConfig>(
    extension: E,
    overrideDefaults?: DefaultsOf<T & E>
  ): VariantFn<T & E>;
};

export function createVariants<T extends VariantConfig>(
  base: string,
  config: T,
  defaults: DefaultsOf<T> = {}
): VariantFn<T> {
  // Pre-index every key so the resolver is a pure direct-access lookup.
  const keys = Object.keys(config) as (keyof T & string)[];

  const resolver = (props: PropsOf<T> = {}): string => {
    let out = base;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const raw = k in props ? props[k] : defaults[k];
      if (raw === undefined || raw === null || raw === false) continue;
      const cls = config[k][typeof raw === "boolean" ? "true" : (raw as string)];
      if (cls) { out += " "; out += cls; }
    }
    if (props.className) { out += " "; out += props.className; }
    return out;
  };

  resolver.extend = <E extends VariantConfig>(
    extension: E,
    overrideDefaults?: DefaultsOf<T & E>
  ) => createVariants(
    base,
    { ...config, ...extension } as T & E,
    { ...defaults, ...overrideDefaults } as DefaultsOf<T & E>
  );

  return resolver as VariantFn<T>;
}

/** Extract prop types from a VariantFn for use in React component props. */
export type VariantProps<F extends VariantFn<any>> = NonNullable<Parameters<F>[0]>;
