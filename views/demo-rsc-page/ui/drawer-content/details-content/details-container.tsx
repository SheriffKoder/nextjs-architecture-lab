'use client'

import type { RentalCarTableItem } from '../../../../../entities/cars-rsc/types/rental-car-table-item'
import { useDrawerChrome } from '@/platform/url-kit/url-drawer'
import { cn } from '@/shared/lib/utils'
import RentalCarVehicleDetails from './rental-car-vehicle-details'
import RentalCarRentalDetails from './rental-car-rental-details'
import TimelineJourney from './timeline-journey'
import { MOCK_TIMELINE_JOURNEY_ITEMS } from '../../../config/mocks/timeline-journey-mocks'

export interface DemoClientCarSliderDetailsContainerProps {
  selectedCar: RentalCarTableItem | null
}

/**
 * View-mode body: column by default; journey expanded → row with scrollable details column (`shrink-0` cards) + timeline `flex-1`.
 */
export default function DemoClientCarSliderDetailsContainer({
  selectedCar,
}: DemoClientCarSliderDetailsContainerProps) {
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
        <RentalCarVehicleDetails car={selectedCar} />
        <RentalCarRentalDetails car={selectedCar} />
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
