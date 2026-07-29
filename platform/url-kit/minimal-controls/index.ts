/**
 * url-kit / minimal-controls — URL hooks for view, grouping, and pagination sync.
 */

export { useUrlGrouping } from './hooks/use-url-grouping'
export type {
  UseUrlGroupingOptions,
  UseUrlGroupingReturn,
} from './hooks/use-url-grouping'

export { useInitialGrouping } from './hooks/use-initial-grouping'

export { useViewResolution } from './hooks/use-view-resolution'
export type {
  UseViewResolutionOptions,
  UseViewResolutionReturn,
} from './hooks/use-view-resolution'

export { resolveView } from './lib/resolve-view'

export type {
  GroupableField,
  ViewResolution,
  FilterToolbarPageConfig,
  MinimalControlsConfig,
} from './model/types'

export {
  DEFAULT_VIEW_PARAM,
  DEFAULT_GROUP_BY_PARAM,
  DEFAULT_SUB_GROUP_BY_PARAM,
  DEFAULT_GROUPING_SUPPORTED_VIEWS,
} from './config/defaults'
