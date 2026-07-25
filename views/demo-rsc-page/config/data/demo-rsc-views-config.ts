/**
 * Demo RSC — single source of truth for available views and related URL view behavior.
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
] as const

/** Views that require the full filtered dataset (`?all=1`). */
export const DEMO_RSC_USE_ALL_ITEMS_VIEWS = [
  'kanban',
  'calendar',
  'map',
  'timeline',
  'subheadings',
] as const

export const DEMO_RSC_DEFAULT_VIEW = 'table'

export type DemoRscView = (typeof DEMO_RSC_AVAILABLE_VIEWS)[number]
