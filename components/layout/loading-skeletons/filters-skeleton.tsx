/**
 * Filters skeleton
 *
 * Purpose: Loading placeholder for filter bars (search + action buttons)
 * Used in: Route `loading.tsx` and Suspense fallbacks for filter-heavy pages
 */

import LoadingValue from '@/components/design/inputs/loading-value'
import styles from './filters-skeleton.module.css'
import { CalendarIcon, ChevronDownIcon, FilterIcon, SearchIcon } from 'lucide-react'

interface FiltersSkeletonProps {
  /** Number of button placeholders on the trailing side (default: 3) */
  buttonCount?: number
  className?: string
  pillFilter?: boolean
  buttonWidthPx?: string
}

export default function FiltersSkeleton({
  buttonCount = 3,
  pillFilter,
  className,
  buttonWidthPx = 'md:w-[200px]'
}: FiltersSkeletonProps) {
  return (
    <div className={['flex shrink-0 flex-col gap-2 ml-2', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between blur-sm gap-3 md:gap-4">

      {pillFilter && (
        <div
          className={[
            styles.searchIntro,
            'flex h-9 min-h-9 shrink-0 flex-row items-stretch overflow-hidden rounded-lg border border-border',
          ].join(' ')}
          aria-hidden
        >
          <div className="flex h-full w-[86.52px] shrink-0 items-center justify-center gap-2 bg-tertiary px-3 text-background">
            <FilterIcon className="h-3 w-3" />
            <span className="text-xs">Filter</span>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 bg-tertiary/10 px-3 text-sm text-muted-foreground backdrop-blur-sm">
            <div className='flex items-center justify-start gap-2'>
              <SearchIcon className="h-3 w-3 shrink-0" />
              <span className="truncate text-sm">Search by name, email or phone</span>
            </div>

            <div className='flex items-center justify-end gap-2'>
              <ChevronDownIcon className='w-3 h-3 text-tertiary' />
            </div>
          </div>
        </div>
      )}
      
        <div className="flex shrink-0 items-center justify-end gap-2">
          {Array.from({ length: buttonCount }).map((_, i) => (
            <div
              key={i}
              data-index={i}
              className={[
                styles.buttonIntro,
                'h-9 w-10 rounded-md border bg-tertiary/10 blur-sm border-tertiary/40 dark:border-tertiary/20',
                buttonWidthPx,
                'flex items-center justify-between gap-2 px-3',
              ].join(' ')}
              aria-hidden
            >
              {/* <LoadingValue className="h-full w-full" /> */}
              <div className='flex items-center justify-center'>
                <CalendarIcon className='w-3 h-3 text-tertiary' />
                <span className='text-foreground/50'>{`Button ${i}`}</span>
              </div>

              <ChevronDownIcon className='w-3 h-3 text-tertiary' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
