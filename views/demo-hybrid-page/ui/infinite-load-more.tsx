/**
 * @file views/demo-hybrid-page/ui/infinite-load-more.tsx
 * Load-more control for `useInfiniteRentalCars` (`all=1` on paginated views).
 *
 * Purpose: Either IntersectionObserver auto-load or a manual button (`loadTrigger`)
 * Used in: list view as `listEndRow` (last virtualized row); table/cards as external slot
 */

'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { HybridInfiniteLoadTrigger } from '@/views/demo-hybrid-page/config/data/demo-rsc-views-config'

export type InfiniteLoadMoreProps = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  /** `automatic` = IO sentinel; `button` = manual only. Default `automatic`. */
  loadTrigger?: HybridInfiniteLoadTrigger
  /** Extra classes on the outer shell (e.g. drop row bg on cards). */
  className?: string
}

/**
 * Load-more UI — as last virtualized row on table / list / cards.
 */
export function InfiniteLoadMore({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  loadTrigger = 'automatic',
  className,
}: InfiniteLoadMoreProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isAutomatic = loadTrigger === 'automatic'

  useEffect(() => {
    if (!isAutomatic) return
    const el = sentinelRef.current
    if (!el || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isAutomatic, isFetchingNextPage])

  if (!hasNextPage && !isFetchingNextPage) {
    return null
  }

  return (
    <div
      ref={isAutomatic ? sentinelRef : undefined}
      className={cn(
        'flex h-full w-full shrink-0 items-center justify-center border-b border-tertiary/10 bg-tertiary/5',
        className,
      )}
    >
      {isFetchingNextPage ? (
        <Loader2
          className="size-3.5 animate-spin text-muted-foreground"
          aria-label="Loading more cars"
        />
      ) : hasNextPage && loadTrigger === 'button' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="group h-full w-full rounded-none text-xs text-muted-foreground hover:bg-tertiary/10 hover:text-tertiary"
          onClick={() => fetchNextPage()}
        >
          <div className='rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors group-hover:bg-transparent group-hover:border-transparent'>
            Load more
          </div>
        </Button>
      ) : hasNextPage && isAutomatic ? (
        <span className="sr-only">Scroll for more</span>
      ) : null}
    </div>
  )
}
