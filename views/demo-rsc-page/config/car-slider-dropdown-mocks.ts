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

import type { DropdownItem } from '@/shared/ui/multi-select'
import { TimelineJourneyItem } from '../ui/drawer-content/details-content/timeline-journey'

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

export const MOCK_TIMELINE_JOURNEY_ITEMS: TimelineJourneyItem[] = [
  {
    title: 'Reserved',
    description:
      'Booking confirmed · Toyota RAV4 · prepaid deposit held · pickup window 9:00–11:00 AM at Brooklyn hub',
    date: 'Apr 10, 2025',
    color: 'red',
  },
  {
    title: 'Rented',
    description:
      'Rental agreement RNT-4482 signed · odometer 24,102 mi at checkout · unlimited miles · secondary driver added',
    date: 'Apr 12, 2025',
    color: 'green',
  },
  {
    title: 'Returned',
    description:
      'Vehicle checked in on time · fuel full · walk-around signed · odometer 24,458 mi · deposit released to card',
    date: 'Apr 19, 2025',
    color: 'blue',
  },
  {
    title: 'Reserved',
    description:
      'Booking confirmed · Toyota RAV4 · prepaid deposit held · pickup window 9:00–11:00 AM at Brooklyn hub',
    date: 'Apr 10, 2025',
    color: 'red',
  },
  {
    title: 'Rented',
    description:
      'Rental agreement RNT-4482 signed · odometer 24,102 mi at checkout · unlimited miles · secondary driver added',
    date: 'Apr 12, 2025',
    color: 'green',
  },
  {
    title: 'Returned',
    description:
      'Vehicle checked in on time · fuel full · walk-around signed · odometer 24,458 mi · deposit released to card',
    date: 'Apr 19, 2025',
    color: 'blue',
  },
  {
    title: 'Reserved',
    description:
      'Booking confirmed · Toyota RAV4 · prepaid deposit held · pickup window 9:00–11:00 AM at Brooklyn hub',
    date: 'Apr 10, 2025',
    color: 'red',
  },
  {
    title: 'Rented',
    description:
      'Rental agreement RNT-4482 signed · odometer 24,102 mi at checkout · unlimited miles · secondary driver added',
    date: 'Apr 12, 2025',
    color: 'green',
  },
  {
    title: 'Returned',
    description:
      'Vehicle checked in on time · fuel full · walk-around signed · odometer 24,458 mi · deposit released to card',
    date: 'Apr 19, 2025',
    color: 'blue',
  },
]