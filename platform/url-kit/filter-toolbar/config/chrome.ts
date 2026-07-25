/**
 * Shared chrome for filter-toolbar icon triggers and search surface.
 * Owned by this kit — do not import minimal-controls defaults.
 */

export const FILTER_TOOLBAR_SURFACE_BG = 'bg-white dark:bg-[#000000]'

/** Search field surface at reduced opacity. */
export const FILTER_TOOLBAR_SEARCH_SURFACE_BG =
  'bg-white/50 dark:bg-[#000000]/50'

export const FILTER_TOOLBAR_ICON_TRIGGER_CLASS = [
  'relative inline-flex items-center justify-center',
  'h-8 w-8 shrink-0 rounded-md',
  'border border-input text-foreground',
  'bg-transparent',
  'hover:text-tertiary',
  'focus:outline-none focus-visible:outline-none',
  'focus-visible:ring-0 focus-visible:ring-offset-0',
  'disabled:pointer-events-none disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
].join(' ')

export const FILTER_TOOLBAR_ICON_TRIGGER_SURFACE_CLASS = [
  'absolute inset-px z-0 rounded-[calc(0.5rem-1px)] pointer-events-none',
  FILTER_TOOLBAR_SURFACE_BG,
].join(' ')

/** Grow within the row but cap width; muted surface. */
export const FILTER_TOOLBAR_SEARCH_CLASS = [
  'relative flex-1 min-w-[12rem] max-w-md',
  'opacity-80',
].join(' ')

/**
 * Compact label+icon+chevron trigger for label-filters below `xl`
 * (not the large outline Button from FilterOptionsButtons).
 */
export const FILTER_TOOLBAR_COMPACT_LABEL_TRIGGER_CLASS = [
  'relative inline-flex items-center justify-center gap-1.5',
  'h-8 shrink-0 rounded-md px-2.5',
  'border border-input text-foreground text-xs font-medium',
  'bg-transparent',
  'hover:text-tertiary',
  'focus:outline-none focus-visible:outline-none',
  'focus-visible:ring-0 focus-visible:ring-offset-0',
  'disabled:pointer-events-none disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
].join(' ')

export const DEFAULT_VIEW_PARAM = 'view'
export const DEFAULT_GROUP_BY_PARAM = 'groupBy'
export const DEFAULT_SUB_GROUP_BY_PARAM = 'subGroupBy'

export const DEFAULT_GROUPING_SUPPORTED_VIEWS = [
  'table',
  'list',
  'subheadings',
  'timeline',
] as const
