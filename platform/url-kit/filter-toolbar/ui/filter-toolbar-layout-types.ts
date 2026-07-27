/**
 * Shared props for desktop / mobile filter-toolbar layouts.
 * Hooks stay in `FilterToolbarInner`; layouts are presentational.
 */

import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import type { PlaceholderMarqueeConfig } from '@/platform/url-kit/filters/feature-filtering/features/placeholder-marquee'
import type { GroupableField } from '../model/types'

export interface FilterToolbarLayoutProps {
  displayedFilters: FilterConfig[]
  filters: FilterConfig[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches SearchBar
  searchConfig: SearchConfig<any>
  showInitialCount: boolean
  groupableFields: GroupableField[]
  groupBy: string | null
  subGroupBy: string | null
  setGroupBy: (key: string | null) => void
  setSubGroupBy: (key: string | null) => void
  currentView: string
  setView: (view: string) => void
  groupingSupportedViews: readonly string[]
  resolvedLabelKey: string
  labelSelectType: 'multi-select' | 'single-select'
  availableViews: readonly string[]
  dateFilterKey?: string
  dateFilterLabel?: string
  dateFilterButtonText?: string
  /** Already resolved for this shell (desktop or mobile). */
  placeholderMarquee?: boolean | PlaceholderMarqueeConfig
  className?: string
}
