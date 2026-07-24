'use client'

import { SquarePen } from 'lucide-react'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import DemoClientCarSliderDetailsContainer from './details-content/details-container'

export interface DemoClientCarViewDrawerContainerProps {
  car: RentalCarTableItem
  onSwitchToEdit: () => void
}

/**
 * View-mode layout: sticky header (title + edit affordance) and scrollable read-only detail cards.
 */
export default function DemoClientCarViewDrawerContainer({
  car,
  onSwitchToEdit,
}: DemoClientCarViewDrawerContainerProps) {
  const title = `${car.make} ${car.model}`.trim()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-primary px-4 py-3 pr-10">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-background/70 backdrop-blur-sm"
          aria-hidden
        />
        <div className="relative z-[2] min-w-0 flex-1">
          <h2 className="text-sm text-foreground">Car details</h2>
          <p className="truncate text-lg font-semibold text-foreground">{title || 'Rental car'}</p>
        </div>
        <div className="relative z-[1] mr-2 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToEdit}
            className="rounded-md bg-foreground/5 p-2 text-foreground transition-colors duration-200 hover:bg-foreground/5 dark:bg-transparent dark:text-tertiary dark:hover:bg-tertiary/10"
            aria-label="Edit car"
            title="Edit"
          >
            <SquarePen size={18} />
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DemoClientCarSliderDetailsContainer selectedCar={car} />
      </div>
    </div>
  )
}
