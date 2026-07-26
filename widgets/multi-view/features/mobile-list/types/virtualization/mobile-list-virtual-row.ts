/**
 * Flat virtual-row model for `@tanstack/react-virtual`.
 * Built by `lib/virtualization/build-virtual-rows.ts`.
 */

export type MobileListVirtualRowKind = 'group-header' | 'card'

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

export type MobileListVirtualRow<T = unknown> =
  | MobileListGroupHeaderRow
  | MobileListCardVirtualRow<T>
