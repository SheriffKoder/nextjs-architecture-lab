/**
 * Format a single field value for plain-text card lines.
 */

import type { MobileListFieldDef } from '../../types'

export function formatFieldValue<T>(
  item: T,
  field: MobileListFieldDef<T> | undefined,
  key: string
): string {
  const raw = (item as Record<string, unknown>)[key]
  if (field?.formatter) {
    return field.formatter(raw, item)
  }
  if (raw == null) return ''
  return String(raw)
}
