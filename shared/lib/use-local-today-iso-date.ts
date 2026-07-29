/**
 * @file shared/lib/use-local-today-iso-date.ts
 *
 * Purpose: React hook that tracks the user's local "today" and updates after midnight.
 * Used in: `widgets/calendar/ui/month-calendar.tsx` — highlights today's cell when
 *          `todayIso` prop is omitted.
 * Why: A calendar left open past midnight should re-highlight the new day without a refresh.
 *      Uses `useSyncExternalStore` so the value stays in sync with wall-clock rollovers.
 *
 * For one-off server or non-React checks, use `getTodayIsoDate` from `@/shared/lib/today`.
 */

'use client'

import { useSyncExternalStore } from 'react'

import { getTodayIsoDate } from '@/shared/lib/today'

/** Schedules a re-read at the next local midnight. */
function subscribeToMidnightRollover(onStoreChange: () => void): () => void {
  const now = new Date()
  const nextMidnight = new Date(now)
  nextMidnight.setHours(24, 0, 0, 0)
  const timeoutMs = nextMidnight.getTime() - now.getTime()
  const timeoutId = window.setTimeout(onStoreChange, timeoutMs)
  return () => window.clearTimeout(timeoutId)
}

/**
 * Returns today's local ISO date (`YYYY-MM-DD`) and re-subscribes after midnight.
 */
export function useLocalTodayIsoDate(): string {
  return useSyncExternalStore(
    subscribeToMidnightRollover,
    () => getTodayIsoDate(),
    () => getTodayIsoDate(),
  )
}
