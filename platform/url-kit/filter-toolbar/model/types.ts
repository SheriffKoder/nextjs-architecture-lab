/**
 * Filter toolbar prop / field types.
 * Self-contained — no imports from minimal-controls.
 */

import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import type { PlaceholderMarqueeProp } from '@/platform/url-kit/filters/feature-filtering/features/placeholder-marquee'

export type GroupableField = {
  key: string
  label: string
}

export type ViewResolution =
  | { status: 'available'; view: string }
  | { status: 'fallback'; view: string; requested: string }
  | { status: 'missing'; view: string }

export interface FilterToolbarProps {
  filters: FilterConfig[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches SearchBar / feature-filtering SearchConfig usage
  searchConfig: SearchConfig<any>
  /** Filter key for FilterOptionsButtons (label filters). */
  labelFilterKey?: string
  labelSelectType?: 'multi-select' | 'single-select'
  dateFilterKey?: string
  dateFilterButtonText?: string
  groupableFields?: GroupableField[]
  groupingSupportedViews?: readonly string[]
  availableViews?: readonly string[]
  defaultView?: string
  useAllItems?: readonly string[]
  defaultPageSize?: number
  enabledFilterKeys?: readonly string[]
  showInitialCount?: boolean
  /**
   * Scroll overflowing search placeholder on narrow fields.
   * `true` / shared config → both shells; `{ desktop, mobile }` → per shell.
   * See `features/placeholder-marquee`.
   */
  placeholderMarquee?: PlaceholderMarqueeProp
  className?: string
}
