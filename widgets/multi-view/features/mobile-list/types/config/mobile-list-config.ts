/**
 * Mobile-list (`cards` view) display configuration.
 *
 * Reuses table/list chrome contracts (stylers, expansion, actions, empty/loading)
 * and adds card composition arrays for primary / secondary / badges.
 *
 * URL view key: `cards`. Feature folder: `mobile-list/`.
 */

import type { ReactNode } from 'react'
import type { RowExpansionConfig } from '@/widgets/multi-view/features/virtualized-table/components/row-expand/types'
import type { MobileListAccordionGroup } from './mobile-list-accordion-group'
import type { MobileListCardComposition } from './mobile-list-card-composition'
import type { MobileListFieldDef } from './mobile-list-field'

/**
 * @template T - Row / card item type
 */
export interface MobileListConfig<T = unknown> {
  /** Field registry (format + render + groupId). Layout order is not taken from this array. */
  fields: MobileListFieldDef<T>[]
  /** Card layout slots + order */
  card: MobileListCardComposition

  /** Labels for accordion groups revealed by the single “Show more” */
  accordionGroups?: MobileListAccordionGroup[]

  emptyMessage?: string
  loading?: boolean
  loadingStateShimmer?: boolean

  /**
   * Dropdown / toggle keys only — free-text edits stay in the drawer.
   * Keys should match `fields[].key` (and typically `isDropdown` fields).
   */
  editableColumns?: string[]

  /**
   * When set, shows delete + action menu (inline or dropdown).
   * Omit to hide action chrome (open chevron can still show).
   */
  actionMode?: 'inline' | 'dropdown'

  rowStyler?: (rowData: T) => string
  /** Full-card overlay behind content (same contract as table `rowHighlighting`) */
  rowHighlighting?: (rowData: T) => ReactNode

  /**
   * Shared row-expansion contract.
   * Renders as a lifted sibling card below the main card (not inside Show more).
   */
  rowExpansion?: RowExpansionConfig

  /** Primary group key for section headers (e.g. status) — often overridden by URL groupBy */
  groupBy?: string
  groupKeyFormatter?: (value: unknown) => string
  /** Extra top padding on card items so lifted expansion cards don’t collide */
  expansionLiftPaddingTop?: number
}
