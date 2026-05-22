'use server'

/**
 * Demo RSC Page Server Actions
 *
 * Purpose: Server-only actions for the demo RSC header (e.g. Mailchimp export stub)
 * Used in: `features/demo-rsc-page/demo-rsc-index.tsx`, `components/action-buttons.tsx`
 * Used for: Keeps the page as an RSC while buttons trigger server work without serializing arbitrary client closures
 */

//////////////////////////////////
// Placeholder for Mailchimp / CSV export; no-op until product defines the contract.
// Used in: `components/action-buttons.tsx` (export control)
// Used for: Keeps the server-action wiring in place without side effects
export async function exportForMailchimpAction() {
  // 1. Intentionally empty — replace with export pipeline when requirements land
}
//////////////////////////////////
