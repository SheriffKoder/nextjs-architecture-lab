/**
 * Demo car slider — mock dropdown options (id / label / value)
 *
 * Purpose: Static options for `CarSliderForm` without coupling to filter API / `FilterConfig`
 * Used in: `components/car-slider-form.tsx`
 */

import type { DropdownItem } from '@/features/ui-kit/forms/multi-select/utils/types'

export const MOCK_CAR_STATUS_ITEMS: DropdownItem[] = [
  { id: 'available', label: 'Available', value: 'available' },
  { id: 'rented', label: 'Rented', value: 'rented' },
  { id: 'maintenance', label: 'Maintenance', value: 'maintenance' },
  { id: 'reserved', label: 'Reserved', value: 'reserved' },
]

export const MOCK_CAR_LOCATION_ITEMS: DropdownItem[] = [
  { id: 'ny', label: 'New York, NY', value: 'New York, NY' },
  { id: 'la', label: 'Los Angeles, CA', value: 'Los Angeles, CA' },
  { id: 'chi', label: 'Chicago, IL', value: 'Chicago, IL' },
  { id: 'mia', label: 'Miami, FL', value: 'Miami, FL' },
]

export const MOCK_CAR_MAKE_ITEMS: DropdownItem[] = [
  { id: 'toyota', label: 'Toyota', value: 'Toyota' },
  { id: 'honda', label: 'Honda', value: 'Honda' },
  { id: 'ford', label: 'Ford', value: 'Ford' },
  { id: 'bmw', label: 'BMW', value: 'BMW' },
  { id: 'tesla', label: 'Tesla', value: 'Tesla' },
]
