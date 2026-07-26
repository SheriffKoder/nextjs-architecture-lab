'use client'

import { cn } from '@/shared/lib/utils'
import { useUrlSorting } from '../../hooks/useUrlSorting'
import { SortStatusPill } from './sort-status-pill'
import { SortDirectionActions } from './sort-direction-actions'

export interface DropdownSortRowProps {
  sortKey: string
  label: string
  className?: string
}

/**
 * In-dropdown column URL sort strip: status pill + Asc / Desc / None / Clear all.
 * Distinct from DropdownHeader option-list A↔Z sorting.
 */
export function DropdownSortRow({
  sortKey,
  label,
  className,
}: DropdownSortRowProps) {
  const { getSort, getSortLevel, getSorts, setSort, removeSort, clearSorts } =
    useUrlSorting()

  const direction = getSort(sortKey)
  const level = getSortLevel(sortKey)
  const hasAnySorts = getSorts().length > 0

  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-1.5 border-b border-border px-2 py-2 dark:border-border/50',
        className,
      )}
    >
      <SortStatusPill label={label} level={level} />
      <SortDirectionActions
        direction={direction}
        hasAnySorts={hasAnySorts}
        onAsc={() => setSort(sortKey, 'asc')}
        onDesc={() => setSort(sortKey, 'desc')}
        onNone={() => removeSort(sortKey)}
        onClearAll={clearSorts}
      />
    </div>
  )
}
