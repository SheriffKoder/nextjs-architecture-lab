/**
 * Filter toolbar skeleton
 *
 * Purpose: Loading placeholder for horizontal filter/tool rows (group, filters, sort, view, search)
 * Used in: Route loading / Suspense fallbacks where the real toolbar matches this layout
 */

import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  Layers2,
  LayoutGrid,
  Search,
} from 'lucide-react'

import styles from './filter-toolbar-skeleton.module.css'

/** Pixel widths left → right for Group, Advanced Filter, Sort by…, Table (spec had “10”; use 110 unless you meant `w-10`). */
const BUTTON_WIDTHS_PX = [84, 138, 98, 110] as const

const btnBase =
  'inline-flex h-8 shrink-0 items-center gap-2 overflow-hidden rounded-sm border border-border bg-background px-2 text-foreground'

interface FilterToolbarSkeletonProps {
  className?: string
}

type ToolbarButtonSpec = {
  label: string
  Icon: LucideIcon
  widthPx: (typeof BUTTON_WIDTHS_PX)[number]
  /** Extra trailing icon (e.g. Table dropdown chevron) */
  TrailingIcon?: LucideIcon
}

const toolbarButtons: ToolbarButtonSpec[] = [
  { label: 'Group', Icon: Layers2, widthPx: BUTTON_WIDTHS_PX[0] },
  { label: 'Advanced Filter', Icon: Filter, widthPx: BUTTON_WIDTHS_PX[1] },
  { label: 'Sort by...', Icon: ArrowUpDown, widthPx: BUTTON_WIDTHS_PX[2] },
  {
    label: 'Table',
    Icon: LayoutGrid,
    widthPx: BUTTON_WIDTHS_PX[3],
    TrailingIcon: ChevronDown,
  },
]

export default function FilterToolbarSkeleton({ className }: FilterToolbarSkeletonProps) {
  return (
    <div
      className={['flex shrink-0 flex-wrap gap-2 w-full justify-end blur-sm', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      {toolbarButtons.map(({ label, Icon, widthPx, TrailingIcon }, index) => (
        <div
          key={label}
          data-index={index}
          className={[styles.item, btnBase, 'text-xs font-medium'].join(' ')}
          style={{ width: widthPx }}
        >
          <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <span className="min-w-0 truncate">{label}</span>
          {TrailingIcon ? (
            <TrailingIcon className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          ) : null}
        </div>
      ))}

      <div
        data-index={toolbarButtons.length}
        className={[
          styles.item,
          'inline-flex h-8 w-8 shrink-0 items-center justify-center text-foreground',
        ].join(' ')}
      >
        <Search className="h-4 w-4 opacity-80" aria-hidden />
      </div>
    </div>
  )
}
