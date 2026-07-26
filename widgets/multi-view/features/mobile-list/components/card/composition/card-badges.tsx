/**
 * Right-column badges — vertical stack from `card.badges` keys.
 * Interactive fields use CardFieldControl (dropdown / toggle) with propagation stopped.
 */

'use client'

import type { MobileListFieldDef } from '../../../types'
import { getFieldDef } from '../../../lib/formatting'
import { cn } from '@/shared/lib/utils'
import { CardFieldControl } from '../interactions'

export interface CardBadgesProps<T> {
  item: T
  badgeKeys: string[]
  fields: MobileListFieldDef<T>[]
  editableColumns?: string[]
  columnActions?: Record<
    string,
    (item: T, value: unknown) => void | Promise<void>
  >
  onCellValueChange?: (columnKey: string, newValue: unknown) => void
  className?: string
}

export function CardBadges<T>({
  item,
  badgeKeys,
  fields,
  editableColumns,
  columnActions,
  onCellValueChange,
  className,
}: CardBadgesProps<T>) {
  if (!badgeKeys.length) return null

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {badgeKeys.map((key) => (
        <CardFieldControl
          key={key}
          item={item}
          fieldKey={key}
          field={getFieldDef(fields, key)}
          editableColumns={editableColumns}
          columnAction={columnActions?.[key]}
          onValueChange={
            onCellValueChange
              ? (newValue) => onCellValueChange(key, newValue)
              : undefined
          }
        />
      ))}
    </div>
  )
}
