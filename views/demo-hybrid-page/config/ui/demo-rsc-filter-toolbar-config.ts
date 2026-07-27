/**
 * Demo RSC — FilterToolbar chrome options (presentation only).
 */

import type { PlaceholderMarqueeProp } from '@/platform/url-kit/filters/feature-filtering/features/placeholder-marquee'

/**
 * Search placeholder marquee for narrow fields.
 *
 * - omit / false → off
 * - true → both desktop + mobile
 * - `{ mobile: true }` → mobile only
 * - `{ desktop: true, mobile: true }` → both
 * - `{ desktop: { cycleMs: 12000 }, mobile: true }` → per-shell timing
 */
export const DEMO_RSC_PLACEHOLDER_MARQUEE: PlaceholderMarqueeProp = {
  desktop: true,
  mobile: true,
}
