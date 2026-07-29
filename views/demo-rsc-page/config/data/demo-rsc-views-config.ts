/**
 * Demo RSC — single source of truth for available views and related URL view behavior.
 * Shared by FilterToolbar, ViewOrchestrator, and pagination footer hide logic.
 */

export const DEMO_RSC_AVAILABLE_VIEWS = ['list', 'cards'] as const

/** Views that require the full filtered dataset (`?all=1`). Public demo has none. */
export const DEMO_RSC_USE_ALL_ITEMS_VIEWS = [] as const

export const DEMO_RSC_DEFAULT_VIEW = 'list'

export type DemoRscView = (typeof DEMO_RSC_AVAILABLE_VIEWS)[number]
