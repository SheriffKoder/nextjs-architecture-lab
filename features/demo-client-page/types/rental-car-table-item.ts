/**
 * Rental car row shape for demo client + shared filtering / table views.
 *
 * Used in: mock `data-source`, display configs, server simulation, TanStack handlers
 */

export interface RentalCarTableItem {
  id: string
  model: string
  make: string
  year: number
  status: string
  location: string
  mileage: number
  pricePerDay: number
  color: string
  licensePlate: string
  /** ISO date string (e.g. `2024-01-15T00:00:00.000Z`) */
  rentalStartDate: string
  /** ISO date string */
  rentalEndDate: string
  /** Order within a subheadings bucket when `manualSorting` is enabled. */
  manual_sorting?: number
  latitude?: number
  longitude?: number
}
