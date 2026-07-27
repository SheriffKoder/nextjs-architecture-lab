/**
 * @file views/demo-hybrid-page/ui/drawer/modes/view/sections/sections-layout.tsx
 * Composes read-only view sections (vehicle, rental, journey) + journey expand layout.
 *
 * Used in: `view-panel` after detail query succeeds
 */

'use client'

import type { RentalCarTableItem } from '@/entities/demo-hybrid-cars/model/rental-car-table-item'
import { useDrawerChrome } from '@/platform/url-kit/url-drawer'
import { cn } from '@/shared/lib/utils'
import { MOCK_TIMELINE_JOURNEY_ITEMS } from '@/views/demo-hybrid-page/config/mocks/timeline-journey-mocks'
import RentalCarVehicleSection from './vehicle-section'
import RentalCarRentalSection from './rental-section'
import TimelineJourney from './timeline-journey'

export interface CarDrawerViewSectionsLayoutProps {
  selectedCar: RentalCarTableItem | null
}

/**
 * Column by default; journey expanded → row with scrollable sections + timeline.
 */
export default function CarDrawerViewSectionsLayout({
  selectedCar,
}: CarDrawerViewSectionsLayoutProps) {
  const { isJourneyPanelOpen, setIsJourneyPanelOpen } = useDrawerChrome()

  if (!selectedCar) {
    return null
  }

  return (
    <div
      className={cn(
        'flex gap-4',
        isJourneyPanelOpen
          ? 'min-h-0 flex-1 flex-row overflow-hidden'
          : 'flex-col',
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-4',
          isJourneyPanelOpen
            ? 'h-full min-h-0 w-[30%] shrink-0 overflow-y-auto [&>*]:shrink-0 pb-2 pr-2'
            : 'w-full [&>*]:shrink-0',
        )}
      >
        <RentalCarVehicleSection car={selectedCar} />
        <RentalCarRentalSection car={selectedCar} />
      </div>

      {isJourneyPanelOpen ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TimelineJourney
            selectedItem={selectedCar}
            data={MOCK_TIMELINE_JOURNEY_ITEMS}
            setIsJourneyPanelOpen={setIsJourneyPanelOpen}
            isJourneyPanelOpen={isJourneyPanelOpen}
          />
        </div>
      ) : (
        <TimelineJourney
          selectedItem={selectedCar}
          data={MOCK_TIMELINE_JOURNEY_ITEMS}
          setIsJourneyPanelOpen={setIsJourneyPanelOpen}
          isJourneyPanelOpen={isJourneyPanelOpen}
        />
      )}
    </div>
  )
}
