/**
 * Hybrid car drawer sticky headers (`ui/drawer/chrome`)
 *
 * Purpose: Shared blurred toolbar chrome plus mode-specific actions (view↔edit, delete).
 * Used in: `modes/view|edit|create` content shells
 */

'use client'

import type { ReactNode } from 'react'
import { Eye, Pencil, Trash2, Save, RotateCcw } from 'lucide-react'
import { useDrawerActions } from '@/platform/url-kit/url-drawer'
import { DEMO_HYBRID_CAR_DRAWER_KEY } from '../car-drawer-key'
import { CarDrawerToolbarButton } from './toolbar-button'

export interface CarDrawerStickyHeaderProps {
  label: string
  title: string
  actions?: ReactNode
}

//////////////////////////////////
// Generic sticky drawer header row (backdrop blur + title stack).
//////////////////////////////////
export function CarDrawerStickyHeader({ label, title, actions }: CarDrawerStickyHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-primary pr-10 px-4 py-3">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-background/70 backdrop-blur-sm"
        aria-hidden
      />
      <div className="relative z-[2] flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-sm text-foreground">{label}</h2>
          <p className="truncate text-lg font-semibold text-foreground">{title}</p>
        </div>
      </div>
      {actions ? (
        <div className="relative z-[1] mr-2 flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

//////////////////////////////////
// Create mode toolbar — Reset + Save (stub until Phase 4 form wiring).
//////////////////////////////////
export function CarDrawerCreateHeader({
  formId,
  isSubmitting = false,
  onResetForm,
}: {
  formId: string
  isSubmitting?: boolean
  onResetForm?: () => void
}) {
  return (
    <CarDrawerStickyHeader
      label="Add car"
      title="New listing"
      actions={
        <>
          <CarDrawerToolbarButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onResetForm?.()}
            aria-label="Reset form"
            title="Reset"
          >
            <RotateCcw size={18} />
          </CarDrawerToolbarButton>
          <CarDrawerToolbarButton
            type="submit"
            form={formId}
            disabled={isSubmitting}
            aria-label="Create car"
            title="Save"
          >
            <Save size={18} />
          </CarDrawerToolbarButton>
        </>
      }
    />
  )
}

//////////////////////////////////
// View mode toolbar — opens edit mode for the same entity id (URL-driven drawer).
//////////////////////////////////
export function CarDrawerViewHeader({ id }: { id: string }) {
  const { openEdit } = useDrawerActions()

  return (
    <CarDrawerStickyHeader
      label="Car details"
      title={id}
      actions={
        <CarDrawerToolbarButton
          type="button"
          onClick={() => openEdit(DEMO_HYBRID_CAR_DRAWER_KEY, id)}
          aria-label="Edit car"
          title="Edit"
        >
          <Pencil size={18} />
        </CarDrawerToolbarButton>
      }
    />
  )
}

const deleteToolbarBtnClass =
  'rounded-md bg-foreground/5 p-2 text-destructive transition-colors duration-200 hover:bg-destructive/10 disabled:opacity-50 dark:bg-transparent dark:hover:bg-destructive/15'

//////////////////////////////////
// Edit mode toolbar — view shortcut + destructive trigger wired to URL confirm flow.
//////////////////////////////////
export function CarDrawerEditHeader({ id }: { id: string }) {
  const { openView, triggerDelete } = useDrawerActions()

  return (
    <CarDrawerStickyHeader
      label="Edit Car"
      title={id}
      actions={
        <>
          <CarDrawerToolbarButton
            type="button"
            onClick={() => openView(DEMO_HYBRID_CAR_DRAWER_KEY, id)}
            aria-label="View details"
            title="View details"
          >
            <Eye size={18} />
          </CarDrawerToolbarButton>
          <button
            type="button"
            onClick={() => triggerDelete()}
            className={deleteToolbarBtnClass}
            aria-label="Delete car"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </>
      }
    />
  )
}
