/**
 * @file views/demo-hybrid-page/ui/fetch-pending-dimmer.tsx
 * RSC-style delayed dim while TanStack refetches list data (no route navigation).
 *
 * Purpose: Mirror `NavigationPendingDimmer` UX for client-side `isFetching` + placeholder rows
 * Used in: `demo-hybrid-content.tsx`
 * Used for: Signal stale rows during shallow URL changes without table loading shimmer
 *
 * Function Index:
 * - FetchPendingDimmer — dims children after `pending` stays true past `dimDelayMs`
 *
 * Steps:
 * 1. Accept explicit `pending` (e.g. `isFetching && isPlaceholderData`).
 * 2. Wait `dimDelayMs` before applying opacity (skip flash on instant cache hits).
 * 3. Apply `opacity-60` + `pointer-events-none` like the RSC table island.
 */

'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

const DEFAULT_DIM_DELAY_MS = 150

type FetchPendingDimmerProps = {
  children: ReactNode
  /** When true, start dim delay timer (typically list refetch with previous rows shown). */
  pending: boolean
  className?: string
  /** Only dim after `pending` has been true for this many ms. */
  dimDelayMs?: number
}

/**
 * Dims children while a TanStack list fetch stays pending past the delay threshold.
 */
export function FetchPendingDimmer({
  children,
  pending,
  className,
  dimDelayMs = DEFAULT_DIM_DELAY_MS,
}: FetchPendingDimmerProps) {
  const [showDim, setShowDim] = useState(false)
  const dimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!pending) {
      if (dimTimerRef.current) {
        clearTimeout(dimTimerRef.current)
        dimTimerRef.current = null
      }
      setShowDim(false)
      return
    }

    if (dimTimerRef.current) {
      clearTimeout(dimTimerRef.current)
    }
    dimTimerRef.current = setTimeout(() => {
      dimTimerRef.current = null
      setShowDim(true)
    }, dimDelayMs)

    return () => {
      if (dimTimerRef.current) {
        clearTimeout(dimTimerRef.current)
        dimTimerRef.current = null
      }
    }
  }, [pending, dimDelayMs])

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        showDim && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
    </div>
  )
}
