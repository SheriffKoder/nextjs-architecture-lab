/**
 * @file entities/demo-hybrid-cars/model/rental-car-status.ts
 * Rental car status enum values for the hybrid demo entity.
 *
 * Purpose: Stable status string constants for filters, cells, and mutations
 * Used in: View config cells, `lib/rental-car-activity-status.ts`
 * Used for: Type-safe status comparisons without magic strings
 */

export const RentalCarStatus = {
  AVAILABLE: "available",
  RENTED: "rented",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
} as const;

export type RentalCarStatusValue =
  (typeof RentalCarStatus)[keyof typeof RentalCarStatus];
