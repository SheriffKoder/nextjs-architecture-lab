/**
 * url-kit / filter-toolbar
 *
 * One-row filter chrome:
 * [filter] [group]  [search……] ---- [label filters] [view] [date]
 *
 * Decoupled from `FiltersHeader` and `MinimalControls`. Owns chrome + URL hooks.
 * Reuses only low-level engines under `filters/feature-filtering` (pill panel
 * pieces, SearchBar, FilterOptionsButtons, date dropdown).
 */

export { FilterToolbar } from './ui/filter-toolbar'
export type { FilterToolbarProps } from './model/types'

export { FilterControl } from './ui/filter-control/filter-control'
export type { FilterControlProps } from './ui/filter-control/filter-control'

export { GroupControl } from './ui/group-control/group-control'
export type { GroupControlProps } from './ui/group-control/group-control'

export { SearchControl } from './ui/search-control/search-control'
export type { SearchControlProps } from './ui/search-control/search-control'

export { LabelFilters } from './ui/label-filters'
export type { LabelFiltersProps } from './ui/label-filters'

export { ViewControl } from './ui/view-control/view-control'
export type { ViewControlProps } from './ui/view-control/view-control'

export { DateControl } from './ui/date-control/date-control'
export type { DateControlProps } from './ui/date-control/date-control'

export { IconTriggerButton } from './ui/shared/icon-trigger-button'
export type { IconTriggerButtonProps } from './ui/shared/icon-trigger-button'

export {
  FILTER_TOOLBAR_SURFACE_BG,
  FILTER_TOOLBAR_SEARCH_SURFACE_BG,
  FILTER_TOOLBAR_ICON_TRIGGER_CLASS,
  FILTER_TOOLBAR_SEARCH_CLASS,
  FILTER_TOOLBAR_COMPACT_LABEL_TRIGGER_CLASS,
  DEFAULT_GROUPING_SUPPORTED_VIEWS,
} from './config/chrome'

export type { GroupableField, ViewResolution } from './model/types'
