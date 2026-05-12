'use client'

import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import DetailRow from '@/components/design/slider/detail-row'
import { ChevronDownIcon } from 'lucide-react'
import { capitalizeAllFirstLetters } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { RentalCarTableItem } from '../../../types/rental-car-table-item'

export interface RentalCarRentalDetailsProps {
  car: RentalCarTableItem
}

/**
 * Read-only rental terms, pricing, and location for the demo client car drawer (view mode).
 */
export default function RentalCarRentalDetails({ car }: RentalCarRentalDetailsProps) {
  const coords =
    car.latitude != null && car.longitude != null
      ? `${car.latitude.toFixed(4)}, ${car.longitude.toFixed(4)}`
      : undefined

  return (
    <CollapsibleCard
      headerText="Rental"
      rightIcon={ChevronDownIcon}
      defaultOpen
      variant="sm"
    >
      <div className="mt-0">
        <h3 className="border-b border-foreground/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-tertiary">
          Terms & placement
        </h3>
        <DetailRow label="Status" value={capitalizeAllFirstLetters(car.status)} />
        <DetailRow label="Location" value={car.location} />
        <DetailRow label="Price per day" value={`${formatCurrency(car.pricePerDay)} / day`} />
        <DetailRow label="Rental start" value={formatDate(car.rentalStartDate)} />
        <DetailRow label="Rental end" value={formatDate(car.rentalEndDate)} />
        {coords ? <DetailRow label="Coordinates" value={coords} /> : null}
      </div>
    </CollapsibleCard>
  )
}
