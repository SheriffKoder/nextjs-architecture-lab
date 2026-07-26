/**
 * Join ordered field keys into a ` · `-separated card line.
 */

import type { MobileListFieldDef } from '../../types'
import { formatFieldValue } from './format-field-value'
import { getFieldDef } from './field-registry'

export const FIELD_LINE_SEPARATOR = ' · '

export function composeFieldLine<T>(
  item: T,
  keys: string[],
  fields: MobileListFieldDef<T>[]
): string {
  return keys
    .map((key) => formatFieldValue(item, getFieldDef(fields, key), key))
    .map((part) => part.trim())
    .filter(Boolean)
    .join(FIELD_LINE_SEPARATOR)
}
