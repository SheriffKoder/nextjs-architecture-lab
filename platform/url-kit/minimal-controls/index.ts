/**
 * url-kit / minimal-controls
 *
 * Composed URL-driven controls bar: grouping, advanced filter, sort, view, search.
 * Writes URL params; multi-view ViewOrchestrator (or any orchestrator) reads them.
 *
 * ## Import
 *
 * ```ts
 * import {
 *   MinimalControls,
 *   useUrlGrouping,
 *   useViewResolution,
 * } from '@/platform/url-kit/minimal-controls'
 * ```
 *
 * ## URL params
 *
 * | Param | Role |
 * |---|---|
 * | `view` | Active view key |
 * | `groupBy` / `subGroupBy` | Client-side row grouping |
 * | (existing) sort / q / query-builder keys | Via reused url-kit controls |
 * | `all` | Synced when view requires full dataset |
 *
 * Does not import `widgets/multi-view`. Pass `{ key, label }[]` for groupable fields.
 */

export { MinimalControls } from './ui/minimal-controls'
export type { MinimalControlsProps } from './ui/minimal-controls'

export { GroupingControl } from './ui/grouping-control'
export type { GroupingControlProps } from './ui/grouping-control'

export { ViewSwitcherControl } from './ui/view-switcher-control'
export type { ViewSwitcherControlProps } from './ui/view-switcher-control'

export { useUrlGrouping } from './hooks/use-url-grouping'
export type {
  UseUrlGroupingOptions,
  UseUrlGroupingReturn,
} from './hooks/use-url-grouping'

export { useViewResolution } from './hooks/use-view-resolution'
export type {
  UseViewResolutionOptions,
  UseViewResolutionReturn,
} from './hooks/use-view-resolution'

export { resolveView } from './lib/resolve-view'

export type {
  GroupableField,
  ViewResolution,
  MinimalControlsConfig,
} from './model/types'

export {
  DEFAULT_VIEW_PARAM,
  DEFAULT_GROUP_BY_PARAM,
  DEFAULT_SUB_GROUP_BY_PARAM,
  DEFAULT_GROUPING_SUPPORTED_VIEWS,
  MINIMAL_CONTROLS_SURFACE_BG,
  MINIMAL_CONTROLS_SEARCH_SURFACE_BG,
  MINIMAL_CONTROLS_TRIGGER_CLASS,
  MINIMAL_CONTROLS_TRIGGER_SURFACE_CLASS,
} from './config/defaults'

export { MinimalControlsTriggerButton } from './ui/trigger-button'
export type { MinimalControlsTriggerButtonProps } from './ui/trigger-button'
