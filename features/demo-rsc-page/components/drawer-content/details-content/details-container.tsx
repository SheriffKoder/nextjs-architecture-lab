'use client'

import type { RentalCarTableItem } from '../../../types/rental-car-table-item'
import RentalCarVehicleDetails from './rental-car-vehicle-details'
import RentalCarRentalDetails from './rental-car-rental-details'

export interface DemoClientCarSliderDetailsContainerProps {
  selectedCar: RentalCarTableItem | null
}

/**
 * View-mode body: stacked collapsible sections (same layout idea as portfolio `ProjectSliderDetailsContainer`).
 */
export default function DemoClientCarSliderDetailsContainer({
  selectedCar,
}: DemoClientCarSliderDetailsContainerProps) {
  if (!selectedCar) {
    return null
  }

  return (
    <div className="space-y-4">
      <RentalCarVehicleDetails car={selectedCar} />
      <RentalCarRentalDetails car={selectedCar} />
    </div>
  )
}
