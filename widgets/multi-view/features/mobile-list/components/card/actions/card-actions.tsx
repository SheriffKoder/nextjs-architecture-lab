/**
 * Top-right card actions: delete + ActionButton (mode-aware) + open chevron.
 * All controls stopPropagation so they do not open the drawer.
 */

'use client'

import type { ComponentType, MouseEvent } from 'react'
import { ChevronRight, Trash2 } from 'lucide-react'
import { ActionButton } from '@/widgets/multi-view/features/virtualized-table/components/rows/rows-action-buttons'
import { stopCardInteractionPropagation } from '../../../lib/interactions'
import { cn } from '@/shared/lib/utils'
import { InteractionZone } from '../interactions'

export interface CardActionConfig {
  key: string
  icon: ComponentType<{ size?: number }>
  label: string
  onClick: (e: MouseEvent) => void
  buttonClassName?: string
  iconClassName?: string
  buttonPadding?: string
  buttonBackground?: string
  buttonHoverBackground?: string
  iconColor?: string
  iconSize?: number
  buttonBorderRadius?: string
  buttonBorder?: string
}

export interface CardActionsProps<T> {
  item: T
  actionMode?: 'inline' | 'dropdown'
  actionConfigs?: CardActionConfig[]
  onDelete?: (item: T) => void | Promise<void>
  onOpen?: (item: T) => void
  className?: string
}

export function CardActions<T>({
  item,
  actionMode = 'dropdown',
  actionConfigs,
  onDelete,
  onOpen,
  className,
}: CardActionsProps<T>) {
  const hasTopActions =
    Boolean(onDelete) || Boolean(actionConfigs && actionConfigs.length > 0)

  return (
    <div className={cn('flex items-center justify-end', className)}>
      {hasTopActions ? (
        <InteractionZone className="flex items-center gap-0.5">
          {onDelete ? (
            <button
              type="button"
              aria-label="Delete"
              title="Delete"
              className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
              onClick={(e) => {
                stopCardInteractionPropagation(e)
                void onDelete(item)
              }}
            >
              <Trash2 size={16} />
            </button>
          ) : null}

          {actionConfigs && actionConfigs.length > 0 ? (
            <ActionButton
              actions={actionConfigs}
              mode={actionMode}
              iconSize={16}
            />
          ) : null}
        </InteractionZone>
      ) : null}

      {onOpen ? (
        <InteractionZone>
          <button
            type="button"
            aria-label="Open"
            title="Open"
            className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={(e) => {
              stopCardInteractionPropagation(e)
              onOpen(item)
            }}
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </InteractionZone>
      ) : (
        <ChevronRight
          className="size-4 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
    </div>
  )
}
