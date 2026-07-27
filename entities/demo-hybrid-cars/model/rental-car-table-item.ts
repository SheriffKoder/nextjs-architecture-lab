/**
 * @file entities/demo-hybrid-cars/model/rental-car-table-item.ts
 * Rental car row shape for the hybrid demo entity.
 *
 * Purpose: Canonical table/drawer row type for mock data, filters, and API responses
 * Used in: `repository/data-source.ts`, view `config/`, server loaders, TanStack hooks
 * Used for: Shared row contract across repository, server, client, and UI layers
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
  /** Order within subheadings group when `manualSorting` is enabled on the wrapper. */
  manual_sorting?: number
  latitude?: number
  longitude?: number
}
