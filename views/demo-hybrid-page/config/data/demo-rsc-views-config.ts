/**
 * Demo hybrid — available views and related URL / data-path behavior.
 * Shared by MinimalControls, ViewSwitcherWrapper, FolderTabs,
 * ViewOrchestrator, and pagination footer hide logic.
 */

export const DEMO_RSC_AVAILABLE_VIEWS = [
  'table',
  'kanban',
  'calendar',
  'map',
  'timeline',
  'subheadings',
  'list',
  'cards',
] as const

/** Views that require the full filtered dataset in one request (`?all=1` + `useRentalCars`). */
export const DEMO_RSC_USE_ALL_ITEMS_VIEWS = [
  'kanban',
  'calendar',
  'map',
  'timeline',
  'subheadings',
] as const
// Note: `table` / `list` / `cards` use footer pagination; `all=1` on those uses infinite scroll.

export const DEMO_RSC_DEFAULT_VIEW = 'table'

/**
 * How infinite load-more advances pages when `all=1` on paginated views.
 * - `automatic` — IntersectionObserver (threshold 0.1)
 * - `button` — manual Load more only
 */
export type HybridInfiniteLoadTrigger = 'automatic' | 'button'

export const DEMO_HYBRID_INFINITE_LOAD_TRIGGER: HybridInfiniteLoadTrigger =
  'button'

export type DemoRscView = (typeof DEMO_RSC_AVAILABLE_VIEWS)[number]

/**
 * Infinite replaces a single showAll dump when the user picks All on
 * table / list / cards. Board views (`USE_ALL_ITEMS`) still fetch the full set.
 */
export function isHybridInfiniteAllMode(
  view: string,
  showAll: boolean | undefined,
): boolean {
  if (!showAll) return false
  return !(DEMO_RSC_USE_ALL_ITEMS_VIEWS as readonly string[]).includes(view)
}
