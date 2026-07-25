/**
 * Searchable field keys + chrome copy for rental car `q` search.
 *
 * `data/` and `ui/` both build `SearchConfig` from this so neither imports the other.
 */

import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'

export const RENTAL_CAR_SEARCHABLE_FIELDS: (keyof RentalCarTableItem)[] = [
  'model',
  'make',
  'location',
  'licensePlate',
]

export const RENTAL_CAR_SEARCH_PLACEHOLDER =
  'Search cars by model, make, location, or license plate...'

/** Search immediately (no minimum length requirement). */
export const RENTAL_CAR_SEARCH_MIN_LENGTH = 0
