/**
 * Demo RSC car drawer headers — shared chrome (`RscCarDrawerStickyHeader`) plus create / view / edit presets.
 * Matches `car-edit-slider-form` toolbar styling for sticky rows.
 */

'use client'

import type { ReactNode } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useDrawerActions } from '@/features/ui/drawer-2'
import { DEMO_RSC_CAR_DRAWER_KEY } from './rsc-car-drawer-constants'
import { RscCarDrawerToolbarButton } from './rsc-car-drawer-toolbar-button'

export interface RscCarDrawerStickyHeaderProps {
  label: string
  title: string
  actions?: ReactNode
}

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

export function RscCarDrawerCreateHeader() {
  return <RscCarDrawerStickyHeader label="Add car" title="New listing" />
}

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

const deleteToolbarBtnClass =
  'rounded-md bg-foreground/5 p-2 text-destructive transition-colors duration-200 hover:bg-destructive/10 disabled:opacity-50 dark:bg-transparent dark:hover:bg-destructive/15'

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
