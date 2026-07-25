/**
 * Default URL param names, grouping-capable views, and shared chrome classes
 * for minimal-controls.
 */

export const DEFAULT_VIEW_PARAM = 'view'
export const DEFAULT_GROUP_BY_PARAM = 'groupBy'
export const DEFAULT_SUB_GROUP_BY_PARAM = 'subGroupBy'

/** Views that support row grouping in the orchestrator. */
export const DEFAULT_GROUPING_SUPPORTED_VIEWS = [
  'table',
  'list',
  'subheadings',
  'timeline',
] as const

/**
 * Solid fill for the absolute layer behind trigger buttons
 * (`bg-white dark:bg-black`).
 */
export const MINIMAL_CONTROLS_SURFACE_BG = 'bg-white dark:bg-[#000000]'

/**
 * Same surface as triggers at 50% opacity — expandable search absolute layer when open.
 */
export const MINIMAL_CONTROLS_SEARCH_SURFACE_BG =
  'bg-white/50 dark:bg-[#000000]/50'

/**
 * Shared native `<button>` chrome for Group / Advanced Filter / Sort / View.
 * Transparent itself — solid fill comes from an absolute child using
 * {@link MINIMAL_CONTROLS_SURFACE_BG}. Border matches Add Car (`border-input`).
 * No focus ring; tertiary text on hover.
 */
export const MINIMAL_CONTROLS_TRIGGER_CLASS = [
  'relative inline-flex items-center justify-center gap-2',
  'h-8 rounded-md px-3 text-xs font-medium',
  'border border-input text-foreground',
  'bg-transparent',
  'hover:text-tertiary',
  'focus:outline-none focus-visible:outline-none',
  'focus-visible:ring-0 focus-visible:ring-offset-0',
  'disabled:pointer-events-none disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
].join(' ')

/** Absolute solid blocker inside a trigger button (inset so `border-input` stays visible). */
export const MINIMAL_CONTROLS_TRIGGER_SURFACE_CLASS = [
  'absolute inset-px z-0 rounded-[calc(0.5rem-1px)] pointer-events-none',
  MINIMAL_CONTROLS_SURFACE_BG,
].join(' ')
