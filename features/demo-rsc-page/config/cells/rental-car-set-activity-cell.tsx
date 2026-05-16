/**
 * Set activity column cell — checkbox affordance for available ↔ reserved toggle.
 */

import React from 'react'
import { Check } from 'lucide-react'
import type { RentalCarTableItem } from '../../types/rental-car-table-item'
import {
  formatActivityStatusLabel,
  getNextActivityStatus,
  isActivityToggleChecked,
} from '../../lib/rental-car-activity-status'

export function rentalCarSetActivityCell(
  _value: unknown,
  item?: RentalCarTableItem,
  columnAction?: (item: RentalCarTableItem, value: unknown) => void | Promise<void>
): React.ReactElement | null {
  if (!item || !columnAction) return null

  const checked = isActivityToggleChecked(String(item.status ?? ''))
  const next = getNextActivityStatus(String(item.status ?? ''))
  const nextLabel = formatActivityStatusLabel(next)

  return (
    <div
      className="flex h-full w-full items-center justify-center px-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={checked ? 'Reserved — click to set available' : 'Available — click to reserve'}
        title={checked ? 'Reserved (click for available)' : `Set to ${nextLabel}`}
        className="flex size-7 items-center justify-center rounded-md border border-tertiary/10 bg-tertiary/10 transition-colors hover:bg-tertiary/20"
        onClick={(e) => {
          e.stopPropagation()
          void columnAction(item, next)
        }}
      >
        {checked ? <Check className="size-4 text-tertiary" aria-hidden /> : null}
      </button>
    </div>
  )
}
