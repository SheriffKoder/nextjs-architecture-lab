/**
 * Accordion show-more — toggle (row 1) and details panel (row 2).
 * One control reveals all accordion field groups.
 */

'use client'

import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type {
  MobileListAccordionGroup,
  MobileListCardComposition,
  MobileListFieldDef,
} from '../../../types'
import {
  buildAccordionGroups,
  type AccordionGroupBlock,
} from '../../../lib/formatting'
import { stopCardInteractionPropagation } from '../../../lib/interactions'
import { SearchHighlightedText } from '../../../lib/search'
import { cn } from '@/shared/lib/utils'
import { CardFieldControl, InteractionZone } from '../interactions'

////////////////////////////////////
// Shared helpers
////////////////////////////////////

export function resolveAccordionGroups<T>(
  fields: MobileListFieldDef<T>[],
  card: MobileListCardComposition,
  accordionGroups?: MobileListAccordionGroup[]
): AccordionGroupBlock<T>[] {
  return buildAccordionGroups(fields, card, accordionGroups)
}

////////////////////////////////////
// Toggle — lives in row 1 / col 1 under secondary
////////////////////////////////////

export interface CardAccordionToggleProps {
  open: boolean
  onToggle: () => void
  /** When false, only `headerExtras` render (no Show more button). */
  showToggle?: boolean
  /** Extra controls beside Show more (e.g. row-expansion toggle). */
  headerExtras?: ReactNode
  className?: string
}

export function CardAccordionToggle({
  open,
  onToggle,
  showToggle = true,
  headerExtras,
  className,
}: CardAccordionToggleProps) {
  if (!showToggle && !headerExtras) return null

  return (
    <div className={cn('mt-0.5 flex flex-wrap items-center gap-1.5', className)}>
      {showToggle ? (
        <InteractionZone>
          <button
            type="button"
            className="inline-flex items-center gap-0.5 rounded-md py-0 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={open}
            onClick={(e) => {
              stopCardInteractionPropagation(e)
              onToggle()
            }}
          >
            {open ? 'Show less' : 'Show more'}
            {open ? (
              <ChevronUp className="size-3" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="size-3" strokeWidth={1.75} />
            )}
          </button>
        </InteractionZone>
      ) : null}
      {headerExtras}
    </div>
  )
}

////////////////////////////////////
// Details — full-width row 2 when open
////////////////////////////////////

export interface CardAccordionDetailsProps<T> {
  open: boolean
  item: T
  groups: AccordionGroupBlock<T>[]
  editableColumns?: string[]
  columnActions?: Record<
    string,
    (item: T, value: unknown) => void | Promise<void>
  >
  onCellValueChange?: (columnKey: string, newValue: unknown) => void
  globalSearchText?: string
  className?: string
}

export function CardAccordionDetails<T>({
  open,
  item,
  groups,
  editableColumns,
  columnActions,
  onCellValueChange,
  globalSearchText,
  className,
}: CardAccordionDetailsProps<T>) {
  if (!open || groups.length === 0) return null

  return (
    <div
      className={cn(
        'mt-1.5 flex w-full min-w-0 flex-col gap-3 border-t border-border/50 pt-2',
        className
      )}
    >
      {groups.map((group, groupIndex) => (
        <div key={group.id} className="flex flex-col gap-1.5 rounded-md bg-card/50 dark:bg-card/30 p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="flex flex-col gap-1.5">
            {group.fields.map((field) => (
              <li
                key={field.key}
                className="flex min-w-0 items-center justify-between gap-3"
              >
                <span className="shrink-0 text-xs text-muted-foreground">
                  <SearchHighlightedText
                    text={field.label ?? field.key}
                    searchTerm={globalSearchText}
                  />
                </span>
                <div className="min-w-0 text-right text-xs text-foreground">
                  <CardFieldControl
                    item={item}
                    fieldKey={field.key}
                    field={field}
                    editableColumns={editableColumns}
                    columnAction={columnActions?.[field.key]}
                    onValueChange={
                      onCellValueChange
                        ? (newValue) => onCellValueChange(field.key, newValue)
                        : undefined
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          {groupIndex < groups.length - 1 ? (
            <div
              className="mt-1 border-t border-dashed border-border/60"
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}

////////////////////////////////////
// Legacy combined export (toggle + details in one tree)
////////////////////////////////////

export interface CardAccordionExpandProps<T> {
  item: T
  fields: MobileListFieldDef<T>[]
  card: MobileListCardComposition
  accordionGroups?: MobileListAccordionGroup[]
  editableColumns?: string[]
  columnActions?: Record<
    string,
    (item: T, value: unknown) => void | Promise<void>
  >
  onCellValueChange?: (columnKey: string, newValue: unknown) => void
  globalSearchText?: string
  headerExtras?: ReactNode
  open: boolean
  onToggle: () => void
  className?: string
}

/**
 * Convenience wrapper when parent already owns open state.
 * Prefer composing {@link CardAccordionToggle} + {@link CardAccordionDetails} in the card shell.
 */
export function CardAccordionExpand<T>({
  item,
  fields,
  card,
  accordionGroups,
  editableColumns,
  columnActions,
  onCellValueChange,
  globalSearchText,
  headerExtras,
  open,
  onToggle,
  className,
}: CardAccordionExpandProps<T>) {
  const groups = resolveAccordionGroups(fields, card, accordionGroups)
  const hasGroups = groups.length > 0

  if (!hasGroups && !headerExtras) return null

  return (
    <div className={cn('w-full min-w-0', className)}>
      {hasGroups || headerExtras ? (
        <CardAccordionToggle
          open={open}
          onToggle={onToggle}
          headerExtras={headerExtras}
        />
      ) : null}
      <CardAccordionDetails
        open={open}
        item={item}
        groups={groups}
        editableColumns={editableColumns}
        columnActions={columnActions}
        onCellValueChange={onCellValueChange}
        globalSearchText={globalSearchText}
      />
    </div>
  )
}
