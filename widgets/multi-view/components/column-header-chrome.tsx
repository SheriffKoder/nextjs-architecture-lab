'use client'

import { cn } from '@/shared/lib/utils'
import { SortButton } from '@/platform/url-kit/filters/feature-sorting/components/sort-button'
import { SortStatusIndicator } from '@/platform/url-kit/filters/feature-sorting/components/sort-status-indicator'

export type ColumnSortPlacement = 'header' | 'dropdown'

export interface ColumnHeaderChromeProps {
  /** Column title text */
  label?: string
  showLabel?: boolean
  labelClassName?: string
  /** Where URL sort UI lives — drives indicator vs SortButton */
  sortPlacement?: ColumnSortPlacement
  /** Present when this column is in sortConfig */
  sortKey?: string
  sortLabel?: string
  /** Legacy prop from header — only applies when sortPlacement is `header` */
  showHeaderSortButton?: boolean
  /** Filter dropdown(s) for this column */
  filter?: React.ReactNode
  className?: string
  /** Extra classes on the row when controls should hide (e.g. sub-heading rows) */
  hidden?: boolean
}

/**
 * Header cell inner chrome: label · [filter + sort] (no gap between filter/sort).
 * Outer cell padding stays on the parent; gap-2 only between label and controls.
 */
export function ColumnHeaderChrome({
  label,
  showLabel = true,
  labelClassName = 'tableTitleClass transition-colors duration-200',
  sortPlacement = 'header',
  sortKey,
  sortLabel,
  showHeaderSortButton = true,
  filter = null,
  className,
  hidden = false,
}: ColumnHeaderChromeProps) {
  const canSort = Boolean(sortKey)
  const showIndicator = sortPlacement === 'dropdown' && canSort
  const showSortButton =
    sortPlacement === 'header' && canSort && showHeaderSortButton

  if (hidden) {
    return null
  }

  return (
    <div
      className={cn(
        'relative z-10 flex min-w-0 items-center gap-2',
        className,
      )}
    >
      {showLabel && label ? (
        <span className={labelClassName}>{label}</span>
      ) : null}

      {/* Stop bubble so filter/sort clicks don't toggle accordion on the cell */}
      <div
        className="flex items-center gap-0"
        onClick={(e) => e.stopPropagation()}
      >
        {filter}

        {showIndicator && sortKey ? (
          <SortStatusIndicator sortKey={sortKey} label={sortLabel} />
        ) : null}

        {showSortButton && sortKey ? (
          <SortButton
            sortKey={sortKey}
            label={sortLabel}
            showPriority
            className="ml-0"
          />
        ) : null}
      </div>
    </div>
  )
}
