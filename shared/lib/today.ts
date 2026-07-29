/**
 * @file shared/lib/today.ts
 *
 * Purpose: Format the user's local calendar day as an ISO date string (`YYYY-MM-DD`).
 * Used in: `shared/ui/week-grouping/lib/week-open-state.ts` (auto-open the current week),
 *          `shared/lib/use-local-today-iso-date.ts` (client hook wrapper).
 * Why: Week grouping and calendar UIs compare against "today" in local time, not UTC midnight.
 *
 * Safe to import from server or client code — no React or browser APIs.
 */

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns today's date in the user's local timezone as `YYYY-MM-DD`.
 *
 * Optional `date` argument supports tests or callers that need a fixed reference day.
 */
export function getTodayIsoDate(date = new Date()): string {
  return formatLocalIsoDate(date)
}
