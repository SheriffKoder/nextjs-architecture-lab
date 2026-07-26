/**
 * One list item: main card (+ accordion) and optional lifted row-expansion sibling.
 */

'use client'

import type { ReactNode } from 'react'
import type { ActionHandler } from '@/widgets/multi-view/constants/actions'
import type { RowExpansionConfig } from '@/widgets/multi-view/features/virtualized-table/components/row-expand/types'
import type { MobileListConfig, MobileListFieldDef } from '../../types'
import { cn } from '@/shared/lib/utils'
import { MobileCard } from './mobile-card'
import type { CardActionConfig } from './actions'
import {
  CardRowExpansion,
  CardRowExpansionToggle,
} from './expansion'

export interface MobileCardItemProps<T> {
  item: T
  itemId: string | number
  fields: MobileListFieldDef<T>[]
  card: MobileListConfig<T>['card']
  accordionGroups?: MobileListConfig<T>['accordionGroups']
  rowStyler?: (rowData: T) => string
  rowHighlighting?: (rowData: T) => ReactNode
  isSelected?: boolean
  globalSearchText?: string
  actionMode?: 'inline' | 'dropdown'
  actionConfigs?: CardActionConfig[]
  onActionClick?: ActionHandler<T>
  columnActions?: Record<
    string,
    (item: T, value: unknown) => void | Promise<void>
  >
  editableColumns?: string[]
  onCellValueChange?: (columnKey: string, newValue: unknown) => void
  onRowClick?: (item: T) => void
  rowExpansion?: RowExpansionConfig
  isRowExpanded?: boolean
  isLoadingChildren?: boolean
  expandedChildren?: unknown[]
  onToggleRowExpansion?: () => void
  expansionLiftPaddingTop?: number
  className?: string
}

export function MobileCardItem<T>({
  item,
  itemId: _itemId,
  fields,
  card,
  accordionGroups,
  rowStyler,
  rowHighlighting,
  isSelected,
  globalSearchText,
  actionMode,
  actionConfigs,
  onActionClick,
  columnActions,
  editableColumns,
  onCellValueChange,
  onRowClick,
  rowExpansion,
  isRowExpanded = false,
  isLoadingChildren = false,
  expandedChildren = [],
  onToggleRowExpansion,
  expansionLiftPaddingTop = 10,
  className,
}: MobileCardItemProps<T>) {
  const expansionEnabled = Boolean(rowExpansion?.enabled)
  const showExpansion = expansionEnabled && isRowExpanded
  const liftPadding =
    expansionEnabled && isRowExpanded ? expansionLiftPaddingTop : 0

  const expansionBody =
    rowExpansion?.renderExpandedContent?.(
      item,
      expandedChildren,
      onRowClick,
      undefined
    ) ?? null

  return (
    <div
      className={cn('relative flex flex-col', className)}
      style={liftPadding ? { paddingTop: liftPadding } : undefined}
    >
      <div className="relative z-10">
        <MobileCard
          item={item}
          fields={fields}
          card={card}
          accordionGroups={accordionGroups}
          rowStyler={rowStyler}
          rowHighlighting={rowHighlighting}
          isSelected={isSelected}
          globalSearchText={globalSearchText}
          actionMode={actionMode}
          actionConfigs={actionConfigs}
          onActionClick={onActionClick}
          columnActions={columnActions}
          editableColumns={editableColumns}
          onCellValueChange={onCellValueChange}
          onRowClick={onRowClick}
          rowExpansionToggle={
            expansionEnabled && onToggleRowExpansion ? (
              <CardRowExpansionToggle
                isExpanded={isRowExpanded}
                onToggle={onToggleRowExpansion}
                disabled={
                  Boolean((item as { hasChildren?: boolean }).hasChildren === false)
                }
              />
            ) : undefined
          }
        />
      </div>

      {showExpansion ? (
        <CardRowExpansion
          isLoading={isLoadingChildren}
          liftPx={Math.min(liftPadding, 8)}
          className="z-0"
        >
          {expansionBody}
        </CardRowExpansion>
      ) : null}
    </div>
  )
}
