/**
 * Activity toggle — available ↔ reserved for the demo "Set activity" column.
 * just for this demo of changing the status of the rental car
 * used in server actions, hookk and cell component
 * why: to avoid code duplication
 */

import { RentalCarStatus, type RentalCarStatusValue } from '../../cars-rsc/types/rental-car-status'

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
