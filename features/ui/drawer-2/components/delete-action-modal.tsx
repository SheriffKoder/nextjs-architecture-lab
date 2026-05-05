/**
 * DeleteActionModal
 *
 * Purpose: Confirmation UI when URL contains `action=delete` and a valid `id`
 * Used in: Same layout as `DrawerWrapper`, sibling under a route that uses drawer delete flow
 * Used for: Destructive confirmation aligned with `components/confirm-modal.tsx` styling/ARIA
 *
 * Steps:
 * 1. Read URL → `parseDrawerState`
 * 2. Only render `ConfirmModal` when `action === 'delete'` and `id` is set
 * 3. Confirm runs parent `onConfirm(id)`; cancel clears `action` via `cancelAction`
 */

'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ConfirmModal from '@/components/confirm-modal'
import { parseDrawerState } from '../drawer-parser'
import { useDrawerActions } from '../hooks/use-drawer-actions'

export default function DeleteActionModal({
  onConfirm,
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}: {
  onConfirm: (id: string) => void | Promise<void>
  title?: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
}) {
  const searchParams = useSearchParams()
  const { cancelAction } = useDrawerActions()

  const raw = useMemo(() => {
    const acc: Record<string, string | undefined> = {}
    searchParams.forEach((value, key) => {
      if (acc[key] === undefined) acc[key] = value
    })
    return acc
  }, [searchParams])

  const state = parseDrawerState(raw)

  const open = state.action === 'delete' && !!state.id

  return (
    <ConfirmModal
      open={open}
      onClose={cancelAction}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant="destructive"
      onConfirm={() => (state.id ? onConfirm(state.id) : undefined)}
    />
  )
}
