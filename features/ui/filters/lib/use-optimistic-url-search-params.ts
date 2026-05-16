'use client'

/**
 * Optimistic URL search params for filter/sort hooks.
 *
 * Getters read `effectiveParams` (updates immediately on click). Setters call
 * `applyPendingSnapshot` before `router.replace` so controls stay in sync while RSC loads.
 * Reconciles when `useSearchParams()` catches up after navigation.
 */

import { useCallback, useMemo, useOptimistic } from 'react'
import { useSearchParams } from 'next/navigation'

export function useOptimisticUrlSearchParams() {
  const searchParams = useSearchParams()
  const committedSnapshot = searchParams.toString()

  const [effectiveSnapshot, setEffectiveSnapshot] = useOptimistic(
    committedSnapshot,
    (_current, next: string) => next,
  )

  const effectiveParams = useMemo(
    () => new URLSearchParams(effectiveSnapshot),
    [effectiveSnapshot],
  )

  const buildParams = useCallback(
    () => new URLSearchParams(effectiveSnapshot),
    [effectiveSnapshot],
  )

  const applyPendingSnapshot = useCallback(
    (next: string) => {
      setEffectiveSnapshot(next)
    },
    [setEffectiveSnapshot],
  )

  return {
    committedSnapshot,
    effectiveParams,
    buildParams,
    applyPendingSnapshot,
  }
}
