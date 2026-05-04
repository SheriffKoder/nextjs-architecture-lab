/**
 * Artificial network latency for demo-client-page Route Handlers.
 * Tune `DEMO_CLIENT_API_DELAY_MS` when testing loading / Suspense UX.
 */
export const DEMO_CLIENT_API_DELAY_MS = 600

export function delayDemoClientApi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, DEMO_CLIENT_API_DELAY_MS)
  })
}
