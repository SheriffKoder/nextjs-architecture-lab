/**
 * Resolve a field def by key from the registry.
 */

import type { MobileListFieldDef } from '../../types'

export function getFieldDef<T>(
  fields: MobileListFieldDef<T>[],
  key: string
): MobileListFieldDef<T> | undefined {
  return fields.find((f) => f.key === key)
}

export function buildFieldMap<T>(
  fields: MobileListFieldDef<T>[]
): Map<string, MobileListFieldDef<T>> {
  return new Map(fields.map((f) => [f.key, f]))
}
