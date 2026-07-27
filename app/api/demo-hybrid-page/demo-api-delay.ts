/**
 * @file app/api/demo-hybrid-page/demo-api-delay.ts
 * Artificial latency helper for hybrid demo Route Handlers.
 *
 * Purpose: Make TanStack loading states visible during local development
 * Used in: `cars/route.ts`, `cars/[id]/route.ts`, `options/route.ts`
 * Used for: UX testing of skeletons, pending states, and slow networks
 *
 * Function Index:
 * - delayDemoHybridApi — await fixed ms before handler continues
 *
 * Steps:
 * 1. Read `DEMO_HYBRID_API_DELAY_MS` (tune to 0 to disable).
 * 2. Resolve after timeout.
 */

/** Tune to `0` to disable demo latency on hybrid API routes. */
export const DEMO_HYBRID_API_DELAY_MS = 600

/**
 * Pause the current Route Handler to simulate network latency.
 *
 * @returns Promise that resolves after {@link DEMO_HYBRID_API_DELAY_MS}
 */
export function delayDemoHybridApi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, DEMO_HYBRID_API_DELAY_MS)
  })
}
