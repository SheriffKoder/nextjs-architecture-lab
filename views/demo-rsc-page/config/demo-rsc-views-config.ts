/**
 * Demo RSC — views that require the full filtered dataset (`?all=1`).
 * Shared by FilteringWrapper and pagination footer hide logic.
 */

export const DEMO_RSC_USE_ALL_ITEMS_VIEWS = [
  'kanban',
  'calendar',
  'map',
  'timeline',
  'subheadings',
] as const

export const DEMO_RSC_DEFAULT_VIEW = 'table'
