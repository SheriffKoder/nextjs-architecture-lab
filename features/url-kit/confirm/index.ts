/**
 * features/ui/confirm barrel
 *
 * Purpose: Single import surface for URL-driven confirm **helpers** only (no entity UI)
 * Used in: Entity-specific confirm managers (e.g. `car-confirm-manager.tsx`), table actions
 *
 * Entity confirm modals live next to that feature’s drawer manager — see `docs/example-entity-confirm-manager.md`.
 */

export { useConfirmAction } from './useConfirmAction'
