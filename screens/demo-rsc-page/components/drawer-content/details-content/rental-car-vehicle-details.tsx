'use client'

import CollapsibleCard from '@/features/ui-kit/layout/CollapsibleCard-sm'
import DetailRow from '@/features/ui-kit/layout/detail-row'
import { ChevronDownIcon } from 'lucide-react'
import type { RentalCarTableItem } from '../../../../../features/cars-rsc/types/rental-car-table-item'

export interface RentalCarVehicleDetailsProps {
  car: RentalCarTableItem
}

/**
 * Read-only vehicle identity + specs for the demo client car drawer (view mode).
 */
export default function RentalCarVehicleDetails({ car }: RentalCarVehicleDetailsProps) {
  return (
    <CollapsibleCard
      headerText="Vehicle"
      rightIcon={ChevronDownIcon}
      defaultOpen
      variant="sm"
    >
      <div className="mt-0">
        <h3 className="border-b border-foreground/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-tertiary">
          Identification & specs
        </h3>
        <DetailRow label="Make" value={car.make} />
        <DetailRow label="Model" value={car.model} />
        <DetailRow label="Year" value={car.year} />
        <DetailRow label="Color" value={car.color} />
        <DetailRow label="License plate" value={car.licensePlate} />
        <DetailRow label="Mileage" value={car.mileage.toLocaleString()} />
      </div>
    </CollapsibleCard>
  )
}
