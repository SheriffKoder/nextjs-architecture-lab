/**
 * Mobile-list field registry entry.
 *
 * Owns formatting / badge chrome / dropdown-toggle metadata — not card layout slots.
 * Layout membership + order live on `MobileListCardComposition`.
 */

import type { ReactElement } from 'react'
import type { DropdownOption } from '@/widgets/multi-view/types/dropdown'

/**
 * @template T - Row / card item type
 */
export interface MobileListFieldDef<T = unknown> {
  key: string
  label?: string
  /** Format value for plain text lines (primary / secondary / accordion text) */
  formatter?: (value: unknown, item: T) => string
  /**
   * Custom render (badges, toggles, dropdowns).
   * Prefer for `card.badges` and interactive accordion fields.
   */
  cellRenderer?: (
    value: unknown,
    item?: T,
    columnAction?: (item: T, value: unknown) => void | Promise<void>
  ) => ReactElement | null
  /** Accordion / show-more group id (fields with a groupId appear under Show more) */
  groupId?: string
  isDateField?: boolean
  isNumberField?: boolean
  isTimeField?: boolean
  decimalPlaces?: number
  /** Dropdown / toggle-style inline edit (no free-text on cards) */
  isDropdown?: boolean
  dropdownOptions?: DropdownOption[]
  dropdownFormatter?: (option: DropdownOption) => ReactElement
  excludeCurrentSelection?: boolean
}
