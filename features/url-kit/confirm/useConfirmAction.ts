/**
 * useConfirmAction
 *
 * Purpose: Thin convenience layer on `useDrawerParams` scoped to confirm flows (delete, archive, …)
 * Used in: `ConfirmRoot`, table action handlers, drawer edit header trash
 * Used for: Open/cancel/complete a URL-driven confirm intent without touching raw param keys
 *
 * Steps:
 * 1. Read drawer params for `action`, `id`, `drawer`
 * 2. Derive `isConfirmOpen`
 * 3. Expose `openConfirm`, `cancelConfirm`, `confirmDone`
 */

'use client'

import { useCallback } from 'react'
import { useDrawerParams } from '@/features/url-kit/drawer'
import type { DrawerAction } from '@/features/url-kit/drawer'

/////////////////////////////////////////////////////////////
// Hook
/////////////////////////////////////////////////////////////

//////////////////////////////////
// useConfirmAction — URL-driven confirm intent helpers
// Used in: `ConfirmRoot.tsx`, entity pages (table/drawer delete triggers)
// Used for: Keeps confirm open/cancel/done consistent across all entry points
//////////////////////////////////
export function useConfirmAction() {
  const { drawer, id, action, setParams, clearAction, clearAll } = useDrawerParams()

  // 1. Derived: confirm is showing when action + id + drawer are all present
  const isConfirmOpen = Boolean(action && id && drawer)

  // 2. Open a confirm intent — sets drawer + id + action in one replace
  const openConfirm = useCallback(
    (confirmAction: DrawerAction, confirmDrawer: string, confirmId: string) => {
      setParams({ drawer: confirmDrawer, id: confirmId, action: confirmAction })
    },
    [setParams]
  )

  // 3. Cancel: remove action only → user stays in the same drawer context
  const cancelConfirm = useCallback(() => {
    clearAction()
  }, [clearAction])

  // 4. Done (action succeeded): clear all drawer params → back to baseline
  const confirmDone = useCallback(() => {
    clearAll()
  }, [clearAll])

  return {
    isConfirmOpen,
    confirmAction: action,
    confirmId: id,
    confirmDrawer: drawer,
    openConfirm,
    cancelConfirm,
    confirmDone,
  }
}
//////////////////////////////////
