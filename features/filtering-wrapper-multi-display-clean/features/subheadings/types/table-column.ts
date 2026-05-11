/**
 * Table Column Type Definitions
 *
 * Purpose: Column shape for subheadings view (aligned with virtualized table list)
 */

import React from "react"
import type { DropdownOption } from "../../../types/dropdown"
import type { EditableGroupedNumberConfig } from "@/utils/number-formatters/format-grouped-number"

export interface TableColumn<T = unknown> {
  key: string
  name: string
  formatter?: (value: unknown) => string
  cellRenderer?: (
    value: unknown,
    item?: T,
    columnAction?: (item: T, value: unknown) => void | Promise<void>
  ) => React.ReactElement | null
  isDateField?: boolean
  isNumberField?: boolean
  editableGroupedNumber?: EditableGroupedNumberConfig
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
  isHidden?: boolean
}
