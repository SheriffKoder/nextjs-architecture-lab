/**
 * SearchConfig used by server-side list filtering (`q` param).
 *
 * Field keys / placeholder come from `config/contract/rental-car-search-fields.ts`.
 */

import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import {
  RENTAL_CAR_SEARCH_MIN_LENGTH,
  RENTAL_CAR_SEARCH_PLACEHOLDER,
  RENTAL_CAR_SEARCHABLE_FIELDS,
} from '../contract/rental-car-search-fields'

export const rentalCarSearchConfig: SearchConfig<RentalCarTableItem> = {
  searchableFields: RENTAL_CAR_SEARCHABLE_FIELDS,
  placeholder: RENTAL_CAR_SEARCH_PLACEHOLDER,
  minLength: RENTAL_CAR_SEARCH_MIN_LENGTH,
}
