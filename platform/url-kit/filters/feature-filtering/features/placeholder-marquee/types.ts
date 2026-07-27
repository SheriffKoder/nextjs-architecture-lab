/**
 * Config for the optional search-placeholder marquee feature.
 */

export type PlaceholderMarqueeConfig = {
  /** Master switch. Default true when the prop object is passed. */
  enabled?: boolean
  /** Full cycle in ms: hold → scroll → hold at end → snap reset. Default 10000. */
  cycleMs?: number
}

/**
 * Per-viewport switches for FilterToolbar (desktop shell vs mobile shell).
 *
 * Examples:
 * - `true` → both on
 * - `{ cycleMs: 12000 }` → both on, shared timing
 * - `{ mobile: true }` → mobile only
 * - `{ desktop: true, mobile: true }` → both
 * - `{ desktop: false, mobile: { cycleMs: 8000 } }` → mobile only with custom cycle
 */
export type PlaceholderMarqueeViewportConfig = {
  desktop?: boolean | PlaceholderMarqueeConfig
  mobile?: boolean | PlaceholderMarqueeConfig
}

/** Prop accepted by FilterToolbar / SearchBar. */
export type PlaceholderMarqueeProp =
  | boolean
  | PlaceholderMarqueeConfig
  | PlaceholderMarqueeViewportConfig

export type ResolvedPlaceholderMarqueeConfig = {
  enabled: boolean
  cycleMs: number
}

export function resolvePlaceholderMarqueeConfig(
  value?: boolean | PlaceholderMarqueeConfig
): ResolvedPlaceholderMarqueeConfig {
  if (!value) {
    return { enabled: false, cycleMs: 10000 }
  }

  if (value === true) {
    return { enabled: true, cycleMs: 10000 }
  }

  return {
    enabled: value.enabled !== false,
    cycleMs: value.cycleMs ?? 10000,
  }
}

function isViewportConfig(
  value: PlaceholderMarqueeProp
): value is PlaceholderMarqueeViewportConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('desktop' in value || 'mobile' in value)
  )
}

/**
 * Resolve marquee settings for one FilterToolbar shell (`desktop` | `mobile`).
 * Shared boolean/config applies to both; viewport object picks per shell.
 */
export function resolvePlaceholderMarqueeForViewport(
  value: PlaceholderMarqueeProp | undefined,
  viewport: 'desktop' | 'mobile'
): boolean | PlaceholderMarqueeConfig | undefined {
  if (value == null || value === false) return undefined
  if (value === true) return true

  if (isViewportConfig(value)) {
    const slot = value[viewport]
    if (slot == null || slot === false) return undefined
    return slot
  }

  // Shared PlaceholderMarqueeConfig → both viewports
  return value
}
