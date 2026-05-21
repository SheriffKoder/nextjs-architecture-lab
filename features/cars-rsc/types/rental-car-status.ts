/**
 * Rental car row/API status values only.
 */

export const RentalCarStatus = {
  AVAILABLE: "available",
  RENTED: "rented",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
} as const;

export type RentalCarStatusValue =
  (typeof RentalCarStatus)[keyof typeof RentalCarStatus];
