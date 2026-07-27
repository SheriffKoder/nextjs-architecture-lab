/**
 * @file views/demo-hybrid-page/config/mocks/timeline-journey-mocks.ts
 * Static timeline journey items for the car details drawer demo.
 *
 * Purpose: Stand-in journey/history data until per-car server fields exist
 * Used in: Drawer details timeline (Phase 3+)
 * Used for: UI development without backend journey API
 *
 * Replace with per-car journey from the server — see `config/mocks/responsibilities.md`.
 */

export interface TimelineJourneyItem {
  title: string
  description: string
  date: string
  color: 'blue' | 'green' | 'red'
}

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
