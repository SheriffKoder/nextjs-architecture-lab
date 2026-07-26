/**
 * Build a flat virtual-row list: optional group headers + cards.
 * Single-level grouping only (no nested sub-groups in the cards view).
 */

import { groupData } from '@/widgets/multi-view/features/virtualized-list/utils/grouping-utils'
import type { MobileListVirtualRow } from '../../types'

export interface BuildVirtualRowsParams<T> {
  data: T[]
  getItemId: (item: T) => string | number
  groupBy?: string | null
  groupKeyFormatter?: (value: unknown) => string
}

export function buildVirtualRows<T>({
  data,
  getItemId,
  groupBy,
  groupKeyFormatter,
}: BuildVirtualRowsParams<T>): MobileListVirtualRow<T>[] {
  if (!groupBy) {
    return data.map((item) => ({
      kind: 'card' as const,
      id: String(getItemId(item)),
      item,
    }))
  }

  const groups = groupData(data as Record<string, unknown>[], {
    groupBy,
    groupKeyFormatter,
  })

  const rows: MobileListVirtualRow<T>[] = []

  for (const group of groups) {
    const items = (
      group.subGroups?.length
        ? group.subGroups.flatMap((sg) => sg.items)
        : group.items
    ) as T[]

    rows.push({
      kind: 'group-header',
      id: `group:${group.groupKey}`,
      groupKey: String(group.groupKey),
      label: String(group.groupKey),
      count: items.length,
    })

    for (const item of items) {
      rows.push({
        kind: 'card',
        id: String(getItemId(item)),
        item,
        groupKey: String(group.groupKey),
      })
    }
  }

  return rows
}

export function estimateVirtualRowSize(
  row: MobileListVirtualRow | undefined
): number {
  if (!row) return 68
  return row.kind === 'group-header' ? 36 : 68
}
