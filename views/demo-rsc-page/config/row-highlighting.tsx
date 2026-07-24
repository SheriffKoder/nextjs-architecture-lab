import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import { RentalCarStatus, type RentalCarStatusValue } from '@/entities/cars-rsc/types/rental-car-status'


////////////////////////////////////
// Example 1: Row Styler - Left Border Indicator by Rental Status
////////////////////////////////////

const rowStylerBaseClasses =
  'relative pl-5 before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-[17px] before:rounded cursor-pointer hover:bg-tertiary/10 hover:text-tertiary border-b border-tertiary/10  bg-tertiary/5'


function getStatusBorderColor(status: string): string {
  switch (status as RentalCarStatusValue) {
    case RentalCarStatus.AVAILABLE:
      return 'before:bg-green-500'
    case RentalCarStatus.RESERVED:
      return 'before:bg-yellow-500'
    case RentalCarStatus.RENTED:
      return 'before:bg-blue-500'
    case RentalCarStatus.MAINTENANCE:
      return 'before:bg-red-500'
    default:
      return 'before:bg-border'
  }
}

/** Left border indicator by rental status (green / yellow / blue / red). */
export function demoRscRowStyler(row: RentalCarTableItem): string {
  return `${rowStylerBaseClasses} ${getStatusBorderColor(row.status)}`
}

/** Example 2: Full-row highlight when price per day is above threshold. */
export function demoRscRowHighlighting(row: RentalCarTableItem) {
  if (row.pricePerDay > 100) {
    return (
      <div className="h-full w-full border-t border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/15 dark:bg-emerald-500/5" />
    )
  }
  return null
}
