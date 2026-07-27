/**
 * Minimal controls — shared types (url-kit; no multi-view imports).
 */

import type { SortConfig } from '@/platform/url-kit/filters/feature-sorting/types'
import type { FilterField } from '@/platform/url-kit/filters/feature-query-builder-filter/types/field'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'

/** Groupable field for the grouping dropdown (dumb key/label — not TableColumn). */
export interface GroupableField {
  key: string
  label: string
  /** Apply as default groupBy when URL has no grouping */
  initial?: boolean
  /** Apply as default subGroupBy when primary grouping is set and URL has no subGroupBy */
  initialSubGroup?: boolean
}

export type ViewResolution =
  | { status: 'available'; view: string }
  | { status: 'fallback'; view: string; requested: string }
  | { status: 'missing'; view: string }

/** Page-level config for the composed MinimalControls bar. */
export interface MinimalControlsConfig {
  /** Views offered in the switcher (and used for resolution). */
  availableViews: string[]
  /** Default when `view` is missing or invalid. */
  defaultView?: string
  /** Views that require `?all=1`. */
  useAllItems?: readonly string[]
  defaultPageSize?: number
  /** Fields available for groupBy / subGroupBy. */
  groupableFields?: GroupableField[]
  /** Views where the grouping control is shown. */
  groupingSupportedViews?: string[]
  sortConfig?: SortConfig[]
  queryBuilderFields?: FilterField[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchConfig?: SearchConfig<any>
  /** Show/hide individual controls (default: show when config present). */
  showGrouping?: boolean
  showQueryBuilder?: boolean
  showSort?: boolean
  showViewSwitcher?: boolean
  showSearch?: boolean
  className?: string
}
