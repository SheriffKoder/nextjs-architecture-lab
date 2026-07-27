/**
 * Flat virtual-row model for `@tanstack/react-virtual`.
 * Built by `lib/virtualization/build-virtual-rows.ts` (+ optional end slot in the list host).
 */

export type MobileListVirtualRowKind = 'group-header' | 'card' | 'end-slot'

export interface MobileListGroupHeaderRow {
  kind: 'group-header'
  id: string
  groupKey: string
  label: string
  count: number
}

export interface MobileListCardVirtualRow<T = unknown> {
  kind: 'card'
  id: string
  item: T
  /** Optional nesting / group context for indent or section association */
  groupKey?: string
}

/** Trailing load-more / footer slot — not domain data. */
export interface MobileListEndSlotRow {
  kind: 'end-slot'
  id: string
}

export type MobileListVirtualRow<T = unknown> =
  | MobileListGroupHeaderRow
  | MobileListCardVirtualRow<T>
  | MobileListEndSlotRow
