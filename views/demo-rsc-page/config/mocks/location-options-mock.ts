/**
 * Stand-in location enum for editable location cells / dropdowns.
 *
 * Replace with facet or lookup API options (same `{ value, label }` shape).
 * See `config/mocks/responsibilities.md`.
 */

export type RentalCarLocationOption = {
  value: string
  label: string
}

/** Demo / stand-in for fetched location enum. Extend when seed data adds cities. */
export const MOCK_RENTAL_CAR_LOCATION_OPTIONS: RentalCarLocationOption[] = [
  { value: 'New York, NY', label: 'New York, NY' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
  { value: 'Chicago, IL', label: 'Chicago, IL' },
  { value: 'Miami, FL', label: 'Miami, FL' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
]
