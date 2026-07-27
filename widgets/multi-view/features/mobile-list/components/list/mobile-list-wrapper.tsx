/**
 * MobileListWrapper
 *
 * Purpose: Hosts the virtualized `cards` list — grouping headers, card items,
 *   accordion/row-expansion, and orchestrator action wiring.
 * Used in: ViewOrchestrator (Step 5) / demo RSC page when `?view=cards`
 * Why: Keeps scroll + virtualization + grouping in one list host so card atoms stay dumb.
 *
 * Steps:
 * 1. Resolve display config + effective groupBy (URL override wins)
 * 2. Build flat virtual rows (group-header | card) and id → data-index map
 * 3. Mount `@tanstack/react-virtual` with dynamic measureElement heights
 * 4. Render loading / empty / virtual window of GroupSectionHeader + MobileCardItem
 */

'use client'

import { useMemo, useRef, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ActionHandler } from '@/widgets/multi-view/constants/actions'
import { useRowExpansion } from '@/widgets/multi-view/features/virtualized-table/components/row-expand/useRowExpansion'
import type { MobileListConfig } from '../../types'
import {
  buildVirtualRows,
  estimateVirtualRowSize,
} from '../../lib/virtualization'
import { cn } from '@/shared/lib/utils'
import { MobileCardItem, type CardActionConfig } from '../card'
import { GroupSectionHeader } from './group-section-header'

////////////////////////////////////
// Type Definitions: Component props
////////////////////////////////////

/**
 * Props for {@link MobileListWrapper}.
 *
 * Orchestrator contracts mirror table/list (`onCellValueChange` rowIndex is against
 * the flat `data` array, not the virtual row index).
 */
export interface MobileListWrapperProps<T> {
  ////////////////////////////////////
  // Data & display
  ////////////////////////////////////
  data: T[]
  config: MobileListConfig<T>
  getItemId?: (item: T) => string | number
  selectedItemId?: string | number | null
  globalSearchText?: string
  className?: string
  emptyState?: ReactNode

  ////////////////////////////////////
  // Actions & edits
  ////////////////////////////////////
  actionConfigs?: (row: T) => CardActionConfig[]
  onActionClick?: ActionHandler<T>
  columnActions?: Record<
    string,
    (item: T, value: unknown) => void | Promise<void>
  >
  /**
   * Matches table/list orchestrator contract (`rowIndex`, `columnKey`, `newValue`).
   * Index is against the flat `data` prop (not the virtual row index).
   */
  onCellValueChange?: (
    rowIndex: number,
    columnKey: string,
    newValue: unknown
  ) => void
  onRowClick?: (item: T) => void

  ////////////////////////////////////
  // Grouping
  ////////////////////////////////////
  /** URL / toolbar groupBy override (wins over `config.groupBy`). */
  selectedGroupBy?: string | null
  /**
   * Trailing virtualized slot (e.g. infinite load-more).
   * Appended after cards / group headers — not domain data.
   */
  listEndRow?: ReactNode
  /** Estimate height for `listEndRow` before measure (default 40). */
  listEndRowHeight?: number
}

////////////////////////////////////
// Helpers: item identity
////////////////////////////////////

/**
 * Fallback id when the consumer does not pass `getItemId`.
 *
 * @param item - Row / card data
 * @returns `item.id` when present, otherwise `String(item)`
 */
function defaultGetItemId<T>(item: T): string | number {
  // 1. Prefer a conventional `id` field used across demo entities
  const id = (item as { id?: string | number }).id
  // 2. Fall back to stringification so virtual keys stay unique enough for demos
  return id ?? String(item)
}

////////////////////////////////////
// Component: virtualized mobile list host
////////////////////////////////////

/**
 * Render a scrollable, optionally grouped stack of mobile cards.
 *
 * @param props - see {@link MobileListWrapperProps}
 */
export function MobileListWrapper<T>({
  data,
  config,
  getItemId = defaultGetItemId,
  selectedItemId,
  globalSearchText,
  actionConfigs,
  onActionClick,
  columnActions,
  onCellValueChange,
  onRowClick,
  selectedGroupBy,
  className,
  emptyState,
  listEndRow,
  listEndRowHeight = 40,
}: MobileListWrapperProps<T>) {
  ////////////////////////////////////
  // 1. Config resolution
  ////////////////////////////////////

  // Pull display fields once so render paths stay flat
  const {
    fields,
    card,
    accordionGroups,
    rowStyler,
    rowHighlighting,
    actionMode,
    editableColumns,
    rowExpansion,
    expansionLiftPaddingTop,
    groupBy: configGroupBy,
    groupKeyFormatter,
    emptyMessage = 'No items found',
    loading,
    loadingStateShimmer,
  } = config

  // URL/toolbar groupBy wins over config default; null disables grouping
  const effectiveGroupBy = selectedGroupBy || configGroupBy || null

  ////////////////////////////////////
  // 2. Row-expansion state (lifted sibling cards)
  ////////////////////////////////////

  const {
    isRowExpanded,
    toggleRow,
    getChildren,
    isLoadingChildren,
  } = useRowExpansion<T>(rowExpansion)

  ////////////////////////////////////
  // 3. Virtualization inputs
  ////////////////////////////////////

  // Scroll parent for tanstack virtualizer
  const parentRef = useRef<HTMLDivElement>(null)

  // Map card id → original `data` index so cell edits keep the table contract
  const indexById = useMemo(function buildIndexById() {
    const map = new Map<string, number>()
    // Walk source data once; virtual rows may reorder under grouping
    data.forEach(function mapItem(item, index) {
      map.set(String(getItemId(item)), index)
    })
    return map
  }, [data, getItemId])

  // Flat list: optional `group-header` rows interleaved with `card` rows
  const virtualRows = useMemo(
    function buildRows() {
      const rows = buildVirtualRows({
        data,
        getItemId,
        groupBy: effectiveGroupBy,
        groupKeyFormatter,
      })
      if (listEndRow == null) return rows
      return [
        ...rows,
        { kind: 'end-slot' as const, id: '__mobile-list-end-row__' },
      ]
    },
    [data, getItemId, effectiveGroupBy, groupKeyFormatter, listEndRow]
  )

  // Dynamic heights: estimate first, then measureElement on expand/accordion
  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: function getScrollElement() {
      return parentRef.current
    },
    estimateSize: function estimateSize(index) {
      const row = virtualRows[index]
      if (row?.kind === 'end-slot') return listEndRowHeight
      return estimateVirtualRowSize(row)
    },
    overscan: 8,
    getItemKey: function getItemKey(index) {
      return virtualRows[index]?.id ?? index
    },
  })

  ////////////////////////////////////
  // 4. Early UI: loading / empty
  ////////////////////////////////////

  // Shimmer placeholders while config.loading is true
  if (loading && loadingStateShimmer) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col gap-3 px-3 md:px-0 md:pr-2',
          className
        )}
      >
        {Array.from({ length: 6 }).map(function renderShimmer(_, i) {
          return (
            <div
              key={i}
              className="h-11 animate-pulse rounded-lg border border-border/40 bg-muted/50"
            />
          )
        })}
      </div>
    )
  }

  // Empty state when there is nothing to virtualize
  if (!data.length) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center px-4 py-12 text-sm text-muted-foreground',
          className
        )}
      >
        {emptyState ?? emptyMessage}
      </div>
    )
  }

  ////////////////////////////////////
  // 5. Virtual window render
  ////////////////////////////////////

  // Only the visible (+ overscan) slice is mounted
  const items = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className={cn('h-full min-h-0 w-full overflow-auto', className)}
    >
      {/* Spacer height = full list so the scrollbar stays correct.
          Horizontal inset lives on each absolute item — parent padding is ignored by
          `absolute left-0 w-full` children. */}
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {items.map(function renderVirtualItem(virtualItem) {
          const row = virtualRows[virtualItem.index]
          // Guard against stale index during rapid data swaps
          if (!row) return null

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={
                row.kind === 'end-slot'
                  ? 'absolute left-0 top-0 w-full px-3 md:px-0 md:pr-2'
                  : 'absolute left-0 top-0 w-full px-3 pb-3 md:px-0 md:pr-2'
              }
              style={{
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {row.kind === 'group-header' ? (
                // Section label: e.g. Available (5)
                <GroupSectionHeader label={row.label} count={row.count} />
              ) : row.kind === 'end-slot' ? (
                <div
                  className="flex w-full items-stretch"
                  style={{ height: listEndRowHeight }}
                >
                  {listEndRow}
                </div>
              ) : (
                // Card stack item (accordion + optional lifted expansion)
                <MobileCardItem
                  item={row.item}
                  itemId={row.id}
                  fields={fields}
                  card={card}
                  accordionGroups={accordionGroups}
                  rowStyler={rowStyler}
                  rowHighlighting={rowHighlighting}
                  isSelected={
                    selectedItemId != null &&
                    String(selectedItemId) === String(row.id)
                  }
                  globalSearchText={globalSearchText}
                  actionMode={actionMode}
                  actionConfigs={actionConfigs?.(row.item)}
                  onActionClick={onActionClick}
                  columnActions={columnActions}
                  editableColumns={editableColumns}
                  onCellValueChange={
                    onCellValueChange
                      ? function handleCellValueChange(columnKey, newValue) {
                          // Translate virtual card id back to flat data index
                          const rowIndex = indexById.get(String(row.id))
                          if (rowIndex == null) return
                          onCellValueChange(rowIndex, columnKey, newValue)
                        }
                      : undefined
                  }
                  onRowClick={onRowClick}
                  rowExpansion={rowExpansion}
                  isRowExpanded={isRowExpanded(row.id)}
                  isLoadingChildren={isLoadingChildren(row.id)}
                  expandedChildren={getChildren(row.id)}
                  onToggleRowExpansion={function handleToggleRowExpansion() {
                    void toggleRow(row.id, row.item)
                  }}
                  expansionLiftPaddingTop={expansionLiftPaddingTop}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
