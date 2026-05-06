/**
 * Car slider dropdown mocks (RSC demo)
 *
 * Purpose: Static `DropdownItem` lists for make / status / location so the create drawer stays decoupled from `demo-client-page`.
 * Used in: `features/demo-rsc-page/components/drawer-forms/rsc-car-create-form-client.tsx`
 * Used for: Parity with client `CarSliderForm` option sets until facets load from the server.
 *
 * Function Index:
 * - MOCK_CAR_STATUS_ITEMS — rental lifecycle labels
 * - MOCK_CAR_LOCATION_ITEMS — city labels matching mock data vocabulary
 * - MOCK_CAR_MAKE_ITEMS — manufacturer labels
 */

import type { DropdownItem } from '@/components/design/multi-select-2/utils/types'

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
