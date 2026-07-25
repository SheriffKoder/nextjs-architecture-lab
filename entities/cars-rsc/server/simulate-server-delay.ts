/**
 * Artificial latency for demo RSC loaders (Suspense / streaming exercises).
 * Set any constant to `0` to disable that leg.
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
