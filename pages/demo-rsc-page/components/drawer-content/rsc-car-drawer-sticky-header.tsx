/**
 * RSC car drawer sticky headers
 *
 * Purpose: Shared blurred toolbar chrome plus mode-specific actions (create submit/reset, view edit, edit view/delete).
 * Used in: `rsc-car-drawer-create-content.tsx`, `rsc-car-drawer-view-content.tsx`, `rsc-car-drawer-edit-content.tsx`
 * Used for: Matches client drawer toolbar styling; create flow uses `form` + `formId` so Save sits in header while fields scroll.
 *
 * Function Index:
 * - RscCarDrawerStickyHeader — generic label/title/actions shell
 * - RscCarDrawerCreateHeader — Reset + submit associated to remote `<form id>`
 * - RscCarDrawerViewHeader — jump to edit
 * - RscCarDrawerEditHeader — view + delete affordances
 */

'use client'

import type { ReactNode } from 'react'
import { Eye, Pencil, Trash2, Save, RotateCcw } from 'lucide-react'
import { useDrawerActions } from '@/features/url-kit/drawer-2'
import { DEMO_RSC_CAR_DRAWER_KEY } from './rsc-car-drawer-constants'
import { RscCarDrawerToolbarButton } from './rsc-car-drawer-toolbar-button'

export interface RscCarDrawerStickyHeaderProps {
  label: string
  title: string
  actions?: ReactNode
}

//////////////////////////////////
// Generic sticky drawer header row (backdrop blur + title stack).
// Used in: preset headers below
// Used for: Single visual primitive so create/view/edit stay consistent.
//////////////////////////////////
export function RscCarDrawerStickyHeader({ label, title, actions }: RscCarDrawerStickyHeaderProps) {
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

//////////////////////////////////
// Create mode toolbar — Reset triggers parent-held RHF reset; Save submits via native `form` association.
// Used in: `rsc-car-drawer-create-content.tsx`
// Used for: Keeps primary actions visible while the form body scrolls (`docs/5. server-forms.md`).
//
// Steps:
// 1. Reset as type=button so we never rely on native reset for controlled RHF fields.
// 2. Submit as type=submit + form={formId} to hit the scrollable form below.
// 3. Disable both while transition pending to reduce double submits.
//////////////////////////////////
export function RscCarDrawerCreateHeader({
  formId,
  isSubmitting = false,
  onResetForm,
}: {
  /** Associate toolbar submit with `<form id={formId}>` (fields scroll below the sticky header). */
  formId: string
  isSubmitting?: boolean
  /** RHF-backed reset from `RscCarCreateFormClient` — native `type="reset"` does not sync controlled inputs. */
  onResetForm?: () => void
}) {
  return (
    <RscCarDrawerStickyHeader
      label="Add car"
      title="New listing"
      actions={
        <>
          <RscCarDrawerToolbarButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onResetForm?.()}
            aria-label="Reset form"
            title="Reset"
          >
            <RotateCcw size={18} />
          </RscCarDrawerToolbarButton>
          <RscCarDrawerToolbarButton
            type="submit"
            form={formId}
            disabled={isSubmitting}
            aria-label="Create car"
            title="Save"
          >
            <Save size={18} />
          </RscCarDrawerToolbarButton>
        </>
      }
    />
  )
}
//////////////////////////////////

//////////////////////////////////
// View mode toolbar — opens edit mode for the same entity id (URL-driven drawer).
// Used in: `rsc-car-drawer-view-content.tsx`
// Used for: Quick pivot from read-only to editable drawer without leaving overlay.
//////////////////////////////////
export function RscCarDrawerViewHeader({ id }: { id: string }) {
  const { openEdit } = useDrawerActions()

  return (
    <RscCarDrawerStickyHeader
      label="Car details"
      title={id}
      actions={
        <RscCarDrawerToolbarButton
          type="button"
          onClick={() => openEdit(DEMO_RSC_CAR_DRAWER_KEY, id)}
          aria-label="Edit car"
          title="Edit"
        >
          <Pencil size={18} />
        </RscCarDrawerToolbarButton>
      }
    />
  )
}
//////////////////////////////////

const deleteToolbarBtnClass =
  'rounded-md bg-foreground/5 p-2 text-destructive transition-colors duration-200 hover:bg-destructive/10 disabled:opacity-50 dark:bg-transparent dark:hover:bg-destructive/15'

//////////////////////////////////
// Edit mode toolbar — view shortcut + destructive trigger wired to URL confirm flow.
// Used in: `rsc-car-drawer-edit-content.tsx`
// Used for: Parity with client edit drawer chrome.
//////////////////////////////////
export function RscCarDrawerEditHeader({ id }: { id: string }) {
  const { openView, triggerDelete } = useDrawerActions()

  return (
    <RscCarDrawerStickyHeader
      label="Edit Car"
      title={id}
      actions={
        <>
          <RscCarDrawerToolbarButton
            type="button"
            onClick={() => openView(DEMO_RSC_CAR_DRAWER_KEY, id)}
            aria-label="View details"
            title="View details"
          >
            <Eye size={18} />
          </RscCarDrawerToolbarButton>
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
//////////////////////////////////
