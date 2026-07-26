/**
 * Demo RSC — mobile-list (`cards` view) display configuration.
 *
 * Purpose: Card composition + field registry for the thin mobile cards view
 * Used in: demo-rsc-content → ViewOrchestrator (`mobileListConfig`)
 * Why: Reuses shared stylers / editable keys / status formatters from table/list
 * while defining primary / secondary / badges layout independently of columns.
 *
 * Composition (reference):
 *   primary   → Camry · Toyota
 *   secondary → 2022 · Black · ABC-1234
 *   badges    → status (vertical stack)
 *   show more → Updates (location, mileage, pricePerDay, setActivity)
 */

import type { MobileListConfig } from '@/widgets/multi-view/features/mobile-list'
import type { RentalCarTableItem } from '@/entities/cars-rsc/types/rental-car-table-item'
import { formatGroupedInteger, formatGroupedNumber } from '@/shared/lib/formatters/number'
// import { rentalCarStatusFormat } from '../cells/rental-car-status-format'
import {
  demoRscEditableColumnKeys,
  rentalCarLocationDropdownFormatter,
  rentalCarLocationDropdownOptions,
  rentalCarLocationFormat,
} from '../cells/rental-car-location-options'
import { rentalCarSetActivityCell } from '../cells/rental-car-set-activity-cell'
import { demoRscRowHighlighting, demoRscRowStyler } from '../row-highlighting'

////////////////////////////////////
// Mobile List Display Configuration
////////////////////////////////////

/**
 * Cards view config for rental cars.
 * Pagination stays table-style (not in `DEMO_RSC_USE_ALL_ITEMS_VIEWS`).
 */
export const mobileListConfig: MobileListConfig<RentalCarTableItem> = {
  fields: [
    {
      key: 'model',
      label: 'Model',
    },
    {
      key: 'make',
      label: 'Make',
    },
    {
      key: 'year',
      label: 'Year',
      isNumberField: true,
      formatter: (value) =>
        typeof value === 'number' ? value.toString() : String(value),
    },
    {
      key: 'color',
      label: 'Color',
    },
    {
      key: 'licensePlate',
      label: 'Plate #',
    },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   formatter: rentalCarStatusFormat.text,
    //   cellRenderer: rentalCarStatusFormat.cell,
    // },
    {
      key: 'location',
      label: 'Location',
      groupId: 'updates',
      formatter: rentalCarLocationFormat.text,
      cellRenderer: rentalCarLocationFormat.cell,
      isDropdown: true,
      dropdownOptions: rentalCarLocationDropdownOptions,
      dropdownFormatter: rentalCarLocationDropdownFormatter,
    },
    {
      key: 'mileage',
      label: 'Mileage',
      groupId: 'updates',
      isNumberField: true,
      formatter: (value) =>
        typeof value === 'number'
          ? formatGroupedInteger(value, { suffix: ' mi' })
          : String(value),
    },
    {
      key: 'pricePerDay',
      label: 'Price/Day',
      groupId: 'updates',
      isNumberField: true,
      decimalPlaces: 2,
      formatter: (value) =>
        typeof value === 'number'
          ? formatGroupedNumber(value, {
              prefix: '$',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : String(value),
    },
    {
      key: 'setActivity',
      label: 'Set activity',
      groupId: 'updates',
      cellRenderer: rentalCarSetActivityCell,
    },
  ],

  card: {
    primary: ['model', 'make'],
    secondary: ['year', 'color', 'licensePlate'],
    badges: [
      // 'status',
    ],
  },

  accordionGroups: [{ id: 'updates', label: 'Updates' }],

  emptyMessage: 'No rental cars found',
  loadingStateShimmer: true,
  // actionMode: 'dropdown',
  /** Dropdown/toggle only — free-text edits stay in the drawer */
  editableColumns: [...demoRscEditableColumnKeys],

  rowStyler: demoRscRowStyler,
  rowHighlighting: demoRscRowHighlighting,

  /** Grouping comes from URL `groupBy`; formatter matches list view labels */
  groupBy: undefined,
  groupKeyFormatter: (value) => {
    const statusMap: Record<string, string> = {
      available: 'Available',
      rented: 'Rented',
      maintenance: 'Maintenance',
      reserved: 'Reserved',
    }
    return statusMap[value as string] || String(value)
  },

  expansionLiftPaddingTop: 10,
}
