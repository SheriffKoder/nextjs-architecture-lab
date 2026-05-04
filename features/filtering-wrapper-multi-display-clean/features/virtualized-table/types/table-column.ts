/**
 * Table Column Type Definitions
 *
 * Purpose: TypeScript shape for virtualized table columns (display, layout, editable cells)
 * Used in: Virtualized table, list, subheadings; demo column configs
 * Why: Header sort/filter/search are driven by `sortConfig`, `FilterConfig[]`, and search config — not column flags
 */

import React from "react"
import type { DropdownOption } from "../../../types/dropdown"

/**
 * @template T - Row data type
 */
export interface TableColumn<T = unknown> {
  key: string
  name: string
  /** Format cell value for display in read-only cells */
  formatter?: (value: unknown) => string
  cellRenderer?: (
    value: unknown,
    item?: T,
    columnAction?: (item: T, value: unknown) => void | Promise<void>
  ) => React.ReactElement | null
  isDateField?: boolean
  isNumberField?: boolean
  isTimeField?: boolean
  decimalPlaces?: number
  width?: string
  minWidth?: string
  headerWidth?: string
  headerMinWidth?: string
  isDropdown?: boolean
  dropdownOptions?: DropdownOption[]
  dropdownFormatter?: (option: DropdownOption) => React.ReactElement
  excludeCurrentSelection?: boolean
  groupId?: string
  sticky?: boolean
  stickyPosition?: number
  fixedWidth?: number
  showExpandIcon?: boolean
  /** Hidden in grid but row data still available to the app */
  isHidden?: boolean
}
