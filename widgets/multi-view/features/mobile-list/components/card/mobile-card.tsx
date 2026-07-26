/**
 * Mobile card shell — two-row layout:
 *   Row 1 Col1: indicator (via rowStyler), primary, secondary, show-more toggle
 *   Row 1 Col2: badges, actions / chevron
 *   Row 2: accordion detail groups (when open)
 *
 * Card body opens via `onRowClick`; interactive zones stop propagation.
 */

'use client'

import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import type { ActionHandler } from '@/widgets/multi-view/constants/actions'
import type { MobileListConfig, MobileListFieldDef } from '../../types'
import { composeFieldLine } from '../../lib/formatting'
import { isInteractiveEventTarget } from '../../lib/interactions'
import { cn } from '@/shared/lib/utils'
import {
  CardBadges,
  CardPrimaryLine,
  CardSecondaryLine,
} from './composition'
import { CardActions, type CardActionConfig } from './actions'
import { resolveCardActionConfigs } from './interactions'
import {
  CardAccordionDetails,
  CardAccordionToggle,
  resolveAccordionGroups,
} from './expansion'

export interface MobileCardProps<T> {
  item: T
  fields: MobileListFieldDef<T>[]
  card: MobileListConfig<T>['card']
  accordionGroups?: MobileListConfig<T>['accordionGroups']
  rowStyler?: (rowData: T) => string
  rowHighlighting?: (rowData: T) => ReactNode
  isSelected?: boolean
  globalSearchText?: string
  actionMode?: 'inline' | 'dropdown'
  actionConfigs?: CardActionConfig[]
  /** Fallback when `actionConfigs` omitted — builds menu without delete */
  onActionClick?: ActionHandler<T>
  columnActions?: Record<
    string,
    (item: T, value: unknown) => void | Promise<void>
  >
  editableColumns?: string[]
  /** Per-field value change (dropdowns). Free-text stays in the drawer. */
  onCellValueChange?: (columnKey: string, newValue: unknown) => void
  onRowClick?: (item: T) => void
  /** Optional toggle for lifted row-expansion sibling (beside Show more). */
  rowExpansionToggle?: ReactNode
  className?: string
}

export function MobileCard<T>({
  item,
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
  rowExpansionToggle,
  className,
}: MobileCardProps<T>) {
  const primaryText = composeFieldLine(item, card.primary, fields)
  const secondaryText = composeFieldLine(item, card.secondary, fields)
  const highlight = rowHighlighting?.(item)
  /** Actions chrome only when `actionMode` is set in display config */
  const showActions = actionMode != null
  const onDelete =
    showActions && columnActions?.delete
      ? (row: T) => columnActions.delete!(row, undefined)
      : undefined
  const resolvedActions = showActions
    ? resolveCardActionConfigs(item, actionConfigs, onActionClick)
    : undefined

  const accordionBlocks = resolveAccordionGroups(fields, card, accordionGroups)
  const hasAccordion = accordionBlocks.length > 0
  const [accordionOpen, setAccordionOpen] = useState(false)

  const openCard = () => {
    onRowClick?.(item)
  }

  const handleClick = (e: MouseEvent) => {
    if (isInteractiveEventTarget(e.target)) return
    openCard()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    if (isInteractiveEventTarget(e.target)) return
    e.preventDefault()
    openCard()
  }

  return (
    <div
      role={onRowClick ? 'button' : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? handleClick : undefined}
      onKeyDown={onRowClick ? handleKeyDown : undefined}
      className={cn(
        'relative flex overflow-hidden rounded-lg border border-border/60 bg-background',
        onRowClick && 'cursor-pointer transition-colors hover:bg-muted/40',
        isSelected && 'bg-tertiary/50 ring-1 ring-tertiary/40',
        // Surface / hover / selection chrome from rowStyler (full card)
        rowStyler?.(item),
        // Keep table `pl-5` in rowStyler; cards use their own horizontal padding
        '!pl-0',
        // Indicator must not live on the full card — hide outer ::before
        'before:hidden',
        className
      )}
    >
      {highlight ? (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          {highlight}
        </div>
      ) : null}

      <div className="relative z-10 flex w-full flex-col gap-0">
        {/* Row 1: indicator only (no extra bg — surface stays on the outer card) */}
        <div
          className={cn(
            'relative flex w-full items-center gap-2 px-3 py-1.5',
            rowStyler?.(item),
            // Keep status bar color from rowStyler; drop surface/hover/pl from table styler
            '!border-0 !bg-transparent !pl-4 hover:!bg-transparent hover:!text-inherit',
            // Show indicator on main row only (~85% of row 1)
            'before:!block before:!top-1/2 before:!h-[85%] before:!-translate-y-1/2'
          )}
        >
          <div className="flex min-w-0 flex-1 pl-2 flex-col justify-center gap-0">
            <CardPrimaryLine text={primaryText} searchTerm={globalSearchText} />
            <CardSecondaryLine
              text={secondaryText}
              searchTerm={globalSearchText}
            />
            {hasAccordion || rowExpansionToggle ? (
              <CardAccordionToggle
                open={accordionOpen}
                onToggle={() => setAccordionOpen((v) => !v)}
                showToggle={hasAccordion}
                headerExtras={rowExpansionToggle}
              />
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-center">
            <CardBadges
              item={item}
              badgeKeys={card.badges}
              fields={fields}
              editableColumns={editableColumns}
              columnActions={columnActions}
              onCellValueChange={onCellValueChange}
            />
            <CardActions
              item={item}
              actionMode={actionMode}
              actionConfigs={resolvedActions}
              onDelete={onDelete}
              onOpen={onRowClick}
            />
          </div>
        </div>

        {/* Row 2: accordion detail groups (full width, no indicator) */}
        <CardAccordionDetails
          open={accordionOpen}
          item={item}
          groups={accordionBlocks}
          editableColumns={editableColumns}
          columnActions={columnActions}
          onCellValueChange={onCellValueChange}
          globalSearchText={globalSearchText}
          className="px-2 pb-2"
        />
      </div>
    </div>
  )
}
