/**
 * Filter / query key → `RentalCarTableItem` property map.
 *
 * Shared by list query builders and filter option loaders. Keys here are the
 * URL / filter vocabulary; values are the row fields they read.
 */

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'

export const rentalCarFieldMap: Record<string, keyof RentalCarTableItem> = {
  model: 'model',
  status: 'status',
  make: 'make',
  location: 'location',
  year: 'year',
  pricePerDay: 'pricePerDay',
  mileage: 'mileage',
  rentalStartDate: 'rentalStartDate',
  rentalEndDate: 'rentalEndDate',
  color: 'color',
  licensePlate: 'licensePlate',
}
