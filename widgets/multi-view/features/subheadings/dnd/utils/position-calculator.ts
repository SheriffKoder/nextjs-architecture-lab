/**
 * Subheadings DnD position helpers
 *
 * Purpose: Stable `cellId` strings for `useDroppable` (`groupKey::rowIndex`) and lookups.
 */

import type { SubheadingsDragPosition } from '../types'

const SEPARATOR = '::'

/** Builds droppable id for a row slot (append slot uses `rowIndex === items.length`). */
export function createCellId(groupKey: string, rowIndex: number): string {
  return `${groupKey}${SEPARATOR}${rowIndex}`
}

/**
 * Parses a cell id from {@link createCellId}; returns null if malformed.
 */
export function parseCellId(cellId: string): SubheadingsDragPosition | null {
  const sepIndex = cellId.lastIndexOf(SEPARATOR)
  if (sepIndex === -1) return null

  const groupKey = cellId.substring(0, sepIndex)
  const rowIndex = parseInt(cellId.substring(sepIndex + SEPARATOR.length), 10)
  if (Number.isNaN(rowIndex)) return null

  return { groupKey, rowIndex, cellId }
}

/**
 * Finds an item’s current group and row using `idKey` (e.g. `id`).
 */
export function findItemPosition<T = unknown>(
  itemId: string,
  groupedData: Record<string, T[]>,
  idKey: string
): SubheadingsDragPosition | null {
  for (const groupKey in groupedData) {
    const items = groupedData[groupKey]
    const rowIndex = items.findIndex(
      (item) => String((item as Record<string, unknown>)[idKey]) === String(itemId)
    )
    if (rowIndex !== -1) {
      return { groupKey, rowIndex, cellId: createCellId(groupKey, rowIndex) }
    }
  }
  return null
}
