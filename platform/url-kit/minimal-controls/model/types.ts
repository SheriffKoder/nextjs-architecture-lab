/**
 * Minimal controls — URL hooks and shared types for filter toolbar + orchestrator.
 */

import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import type { SortConfig } from '@/platform/url-kit/filters/feature-sorting/types'

/** Groupable field for the grouping dropdown (dumb key/label — not TableColumn). */
export interface GroupableField {
  key: string
  label: string
  initial?: boolean
  initialSubGroup?: boolean
}

export type ViewResolution =
  | { status: 'available'; view: string }
  | { status: 'fallback'; view: string; requested: string }
  | { status: 'missing'; view: string }

/** Toolbar / page config for view + grouping URL params. */
export interface FilterToolbarPageConfig {
  availableViews: string[]
  defaultView?: string
  useAllItems?: readonly string[]
  defaultPageSize?: number
  groupableFields?: GroupableField[]
  groupingSupportedViews?: string[]
  sortConfig?: SortConfig[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchConfig?: SearchConfig<any>
}

/** @deprecated Use `FilterToolbarPageConfig`. */
export type MinimalControlsConfig = FilterToolbarPageConfig
