import type { FilterConfig } from '@/platform/url-kit/filters/feature-filtering/components/filter-types'

export interface LabelFiltersProps {
  filterKey: string
  filterOptions: FilterConfig[]
  selectType?: 'multi-select' | 'single-select'
  showInitialCount?: boolean
}

export type LabelFilterOption = NonNullable<FilterConfig['options']>[number]
