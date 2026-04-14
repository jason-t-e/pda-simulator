// ─── Class Name Merger ────────────────────────────────────────────
type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean | undefined | null }
  | ClassValue[];

/**
 * Merges class values into a single space-separated string.
 * Zero allocations on the hot path.
 */
export function cn(...inputs: ClassValue[]): string {
  let out = "";
  for (let i = 0; i < inputs.length; i++) {
    const v = inputs[i];
    if (!v) continue;
    if (typeof v === "string") { if (out) out += " "; out += v; }
    else if (typeof v === "number") { if (out) out += " "; out += v; }
    else if (Array.isArray(v)) { const s = cn(...v); if (s) { if (out) out += " "; out += s; } }
    else if (typeof v === "object") {
      for (const k in v) { if (v[k]) { if (out) out += " "; out += k; } }
    }
  }
  return out;
}

// ─── Variant Engine ───────────────────────────────────────────────
type VariantMap    = Record<string, string>;
type VariantConfig = Record<string, VariantMap>;

type DefaultsOf<T extends VariantConfig> = {
  [K in keyof T]?: keyof T[K] | boolean;
};

type PropsOf<T extends VariantConfig> = {
  [K in keyof T]?: keyof T[K] | boolean | undefined;
} & { className?: string | undefined };

/**
 * A variant resolver function. Callable and extendable.
 */
export type VariantFn<T extends VariantConfig> = {
  (props?: PropsOf<T>): string;
  /**
   * Return a new variant engine that merges `extension` into the current config.
   * Fully type-safe: the returned function accepts both old and new variant keys.
   */
  extend<E extends VariantConfig>(
    extension: E,
    newDefaults?: DefaultsOf<T & E>
  ): VariantFn<T & E>;
};

/** Extract prop types from a VariantFn for use in component prop interfaces. */
export type VariantProps<F extends VariantFn<VariantConfig>> =
  NonNullable<Parameters<F>[0]>;

/**
 * Creates a type-safe, O(1) variant resolver.
 *
 * @example
 * const cardVariants = createVariants("card", {
 *   variant: { success: "card--success", danger: "card--danger" }
 * }, { variant: "success" });
 *
 * cardVariants({ variant: "danger" }); // "card card--danger"
 * cardVariants.extend({ size: { sm: "card--sm" } });
 */
export function createVariants<T extends VariantConfig>(
  base: string,
  config: T,
  defaults: DefaultsOf<T> = {} as DefaultsOf<T>
): VariantFn<T> {
  // Pre-index keys at creation time — resolver has no Object iteration.
  const keys = Object.keys(config) as (keyof T & string)[];

  const resolver = (props: PropsOf<T> = {}): string => {
    let out = base;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]!;
      const raw = k in props ? props[k] : defaults[k];
      if (raw === undefined || raw === null || raw === false) continue;
      const cls = config[k]![typeof raw === "boolean" ? "true" : (raw as string)];
      if (cls) { out += " "; out += cls; }
    }
    if (props.className != null) { out += " "; out += props.className; }
    return out;
  };

  resolver.extend = <E extends VariantConfig>(
    extension: E,
    newDefaults?: DefaultsOf<T & E>
  ): VariantFn<T & E> =>
    createVariants(
      base,
      { ...config, ...extension } as T & E,
      { ...(defaults as DefaultsOf<T & E>), ...newDefaults }
    );

  return resolver as VariantFn<T>;
}
