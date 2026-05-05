/**
 * DrawerWrapper
 *
 * Purpose: Client gate that mounts `RightDrawer` when URL-derived `DrawerState.isOpen` is true
 * Used in: Layouts or pages that host drawer content as `children`
 * Used for: Shared shell (overlay + panel) driven only by search params
 *
 * Steps:
 * 1. Subscribe to `useSearchParams()` for reactive URL updates
 * 2. Parse with `parseDrawerState` (Zod-backed)
 * 3. Keep `RightDrawer` mounted with `isOpen` so Framer exit animation can finish
 * 4. `onClose` clears URL drawer params via `useDrawerActions().close()`
 */

'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import RightDrawer from '@/components/design/right-drawer'
import { parseDrawerState } from '../drawer-parser'
import { useDrawerActions } from '../hooks/use-drawer-actions'

export default function DrawerWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const { close } = useDrawerActions()

  // Build a plain record: each `get` returns first value for a key (matches typical usage).
  const raw = useMemo(() => {
    const acc: Record<string, string | undefined> = {}
    searchParams.forEach((value, key) => {
      // If duplicate keys ever appear, first wins — consistent with `.get(key)`.
      if (acc[key] === undefined) acc[key] = value
    })
    return acc
  }, [searchParams])

  const state = parseDrawerState(raw)

  // Stay mounted while closed so `RightDrawer` + `AnimatePresence` can run exit transition.
  return (
    <RightDrawer isOpen={state.isOpen} onClose={close}>
      {state.isOpen ? children : null}
    </RightDrawer>
  )
}
