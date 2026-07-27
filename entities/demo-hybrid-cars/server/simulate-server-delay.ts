/**
 * @file entities/demo-hybrid-cars/server/simulate-server-delay.ts
 * Artificial latency toggles for hybrid demo server use-cases.
 *
 * Purpose: Make Suspense / prefetch / API loading states visible in development
 * Used in: `get-rental-cars-data.ts`, `get-filter-options-server.ts`, `get-rental-car-by-id.ts`
 * Used for: Tune or disable per-leg delay without changing business logic
 *
 * Function Index:
 * - simulateServerDelay — no-op when ms ≤ 0, else await timeout
 */

/** Filter facet options (`getFilterOptionsServer` for rental cars). */
export const DEMO_RSC_SIMULATE_FILTER_OPTIONS_MS = 0

/** List payload (`getRentalCarsData`). */
export const DEMO_RSC_SIMULATE_RENTAL_CARS_MS = 500

/** Single-car by id (`getRentalCarById`) — drawer detail / Suspense demos. */
export const DEMO_RSC_SIMULATE_RENTAL_CAR_BY_ID_MS = 500

export async function simulateServerDelay(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}
