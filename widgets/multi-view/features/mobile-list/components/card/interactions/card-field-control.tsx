/**
 * Per-field card control: read-only badge/text, dropdown edit, or toggle cellRenderer.
 * Free-text / number edit is intentionally not offered on the card.
 * Editable controls use a compact density so they fit thin mobile cards.
 */

'use client'

import { EditableCell } from '@/widgets/multi-view/features/virtualized-table/components/rows/editable-cell'
import type { MobileListFieldDef } from '../../../types'
import { formatFieldValue } from '../../../lib/formatting'
import { isCardSurfaceEditable } from '../../../lib/interactions'
import { InteractionZone } from './interaction-zone'

/** Compact shell for dropdown triggers inside cards (overrides table EditableCell min height). */
const COMPACT_DROPDOWN_CLASS =
  '!min-h-6 max-w-[8.5rem] gap-1 px-1.5 py-0 text-[11px] leading-none [&_svg]:!h-3 [&_svg]:!w-3'

/** Shrink shared checkbox / badge cell renderers without changing table cell defs. */
const COMPACT_CONTROL_CLASS =
  'shrink-0 [&_button[role=checkbox]]:size-5 [&_button[role=checkbox]]:rounded [&_button[role=checkbox]_svg]:size-3 [&_button[role=checkbox]]:p-0 [&>div]:h-auto [&>div]:w-auto [&>div]:px-0'

export interface CardFieldControlProps<T> {
  item: T
  fieldKey: string
  field: MobileListFieldDef<T> | undefined
  editableColumns?: string[]
  columnAction?: (item: T, value: unknown) => void | Promise<void>
  onValueChange?: (newValue: unknown) => void
}

export function CardFieldControl<T>({
  item,
  fieldKey,
  field,
  editableColumns,
  columnAction,
  onValueChange,
}: CardFieldControlProps<T>) {
  const value = (item as Record<string, unknown>)[fieldKey]
  const canEditDropdown = isCardSurfaceEditable(field, fieldKey, editableColumns)

  if (canEditDropdown && field) {
    return (
      <InteractionZone className={COMPACT_CONTROL_CLASS}>
        <EditableCell
          value={value}
          item={item}
          columnAction={columnAction}
          onValueChange={onValueChange}
          cellRenderer={field.cellRenderer}
          isDropdown
          dropdownOptions={field.dropdownOptions ?? []}
          dropdownFormatter={field.dropdownFormatter}
          excludeCurrentSelection={field.excludeCurrentSelection ?? false}
          className={COMPACT_DROPDOWN_CLASS}
        />
      </InteractionZone>
    )
  }

  if (field?.cellRenderer) {
    return (
      <InteractionZone className={COMPACT_CONTROL_CLASS}>
        {field.cellRenderer(value, item, columnAction)}
      </InteractionZone>
    )
  }

  const label = formatFieldValue(item, field, fieldKey)
  if (!label) return null

  return (
    <span className="inline-flex max-w-[9rem] truncate rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  )
}
