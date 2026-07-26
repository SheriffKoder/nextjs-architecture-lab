/**
 * Whether a field may be edited on the card surface.
 * Free-text / number typing is drawer-only — dropdowns (and toggle cellRenderers) only.
 */

import type { MobileListFieldDef } from '../../types'

export function isCardSurfaceEditable<T>(
  field: MobileListFieldDef<T> | undefined,
  fieldKey: string,
  editableColumns?: string[]
): boolean {
  if (!field || !editableColumns?.includes(fieldKey)) return false
  return Boolean(field.isDropdown)
}
