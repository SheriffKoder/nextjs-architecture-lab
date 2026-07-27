/**
 * Shared chrome for filter-toolbar search surface and panel tokens.
 * Icon triggers use `@/components/ui/button` variant **control** — see that file’s header map.
 */

export const FILTER_TOOLBAR_SURFACE_BG = 'bg-white dark:bg-[#000000]'

/** Opaque panel surface for filter / date dropdowns. */
export const FILTER_TOOLBAR_PANEL_SURFACE_CLASS = 'bg-background'

/** Search field surface at reduced opacity. */
export const FILTER_TOOLBAR_SEARCH_SURFACE_BG =
  'bg-white/50 dark:bg-[#000000]/50'

/** @deprecated Use `Button` variant **control** size **icon-sm**. */
export const FILTER_TOOLBAR_ICON_TRIGGER_CLASS = [
  'relative inline-flex items-center justify-center',
  'h-8 w-8 shrink-0 rounded-md',
  'border border-input text-foreground',
  'bg-background',
  'hover:text-tertiary',
  'focus:outline-none focus-visible:outline-none',
  'focus-visible:ring-0 focus-visible:ring-offset-0',
  'disabled:pointer-events-none disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
].join(' ')

/** @deprecated Inset surface removed — use **control** variant directly. */
export const FILTER_TOOLBAR_ICON_TRIGGER_SURFACE_CLASS = ''

/** Grow within the row but cap width; muted surface. */
export const FILTER_TOOLBAR_SEARCH_CLASS = [
  'relative flex-1 min-w-[12rem] max-w-md',
  'opacity-80',
].join(' ')

/** @deprecated Use `Button` variant **control** size **compact**. */
export const FILTER_TOOLBAR_COMPACT_LABEL_TRIGGER_CLASS = [
  'relative inline-flex items-center justify-center gap-1.5',
  'h-8 shrink-0 rounded-md px-2.5',
  'border border-input text-foreground text-xs font-medium',
  'bg-background',
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
  'cards',
  'subheadings',
  'timeline',
] as const
