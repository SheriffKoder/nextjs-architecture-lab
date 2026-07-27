/**
 * @file entities/demo-hybrid-cars/lib/rental-car-activity-status.ts
 * Pure rules for toggling rental car activity status in the demo UI.
 *
 * Purpose: Shared available ↔ reserved toggle logic for cells and future mutations
 * Used in: `views/demo-hybrid-page/config/ui/cells/rental-car-set-activity-cell.tsx`
 * Used for: Avoid duplicating status flip rules across UI and server layers
 *
 * Function Index:
 * - getNextActivityStatus — compute next status from current
 * - formatActivityStatusLabel — human-readable label
 * - isActivityToggleChecked — checkbox checked when reserved
 */

import { RentalCarStatus, type RentalCarStatusValue } from '@/entities/demo-hybrid-cars/model/rental-car-status'

/** If currently `available` → `reserved`; any other status → `available`. */
export function getNextActivityStatus(current: string): RentalCarStatusValue {
  return current === RentalCarStatus.AVAILABLE
    ? RentalCarStatus.RESERVED
    : RentalCarStatus.AVAILABLE
}

export function formatActivityStatusLabel(status: RentalCarStatusValue): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/** Checkbox appears checked when the row is in the reserved activity state. */
export function isActivityToggleChecked(status: string): boolean {
  return status === RentalCarStatus.RESERVED
}
