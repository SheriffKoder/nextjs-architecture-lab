/**
 * Pagination skeleton
 *
 * Purpose: Loading placeholder for footer pagination (controls + page strip)
 * Used in: Route `loading.tsx` and Suspense fallbacks for paginated lists
 */

import type { LucideIcon } from 'lucide-react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import styles from './pagination-skeleton.module.css'

interface PaginationSkeletonProps {
  className?: string
  /** Staggered fade-in (off for static backdrops e.g. error fallback) */
  animated?: boolean
}

const navBtn =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-medium transition-colors text-tertiary border-tertiary/30 bg-tertiary/10 hover:bg-tertiary/20 dark:border-tertiary/20 dark:bg-white/5'

const activePageBtn =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-medium transition-colors bg-tertiary text-background border-tertiary/50'

type Slot =
  | { kind: 'icon'; Icon: LucideIcon; dim?: boolean }
  | { kind: 'page'; label: string; active?: boolean }

const slots: Slot[] = [
  { kind: 'icon', Icon: ChevronsLeft, dim: true },
  { kind: 'icon', Icon: ChevronLeft, dim: true },
  { kind: 'page', label: '1', active: true },
  { kind: 'page', label: '2' },
  { kind: 'page', label: '3' },
  { kind: 'icon', Icon: ChevronRight },
  { kind: 'icon', Icon: ChevronsRight },
]

export default function PaginationSkeleton({ className, animated = true }: PaginationSkeletonProps) {
  return (
    <div className={['shrink-0 pb-2 mr-2', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-center gap-1 blur-sm" aria-hidden>
        {slots.map((slot, index) => {
          const appearClass = slot.kind === 'icon' && slot.dim ? styles.itemDim : animated ? styles.item : ''

          if (slot.kind === 'icon') {
            const { Icon } = slot
            return (
              <div key={index} data-index={index} className={[appearClass, navBtn].join(' ')}>
                <Icon className="h-4 w-4" aria-hidden />
              </div>
            )
          }

          const btnClass = slot.active ? activePageBtn : navBtn
          return (
            <div key={index} data-index={index} className={[appearClass, btnClass].join(' ')}>
              {slot.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
