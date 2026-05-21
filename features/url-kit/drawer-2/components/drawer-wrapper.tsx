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
 * 5. Drawer chrome context — inner content can call `useDrawerChrome()` to toggle journey full-width (`expandToFullScreen`)
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import RightDrawer from '@/features/ui-kit/layout/right-drawer'
import { parseDrawerState } from '../drawer-parser'
import { useDrawerActions } from '../hooks/use-drawer-actions'
import { DrawerChromeProvider, useDrawerChromeValue } from '../providers/drawer-chrome-context'

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

  /////////////////////////////////////////////////////////////////
  // Drawer chrome (context) — `isJourneyPanelOpen` + provider value
  /////////////////////////////////////////////////////////////////

  const [isJourneyPanelOpen, setIsJourneyPanelOpen] = useState(false)
  const drawerChrome = useDrawerChromeValue(isJourneyPanelOpen, setIsJourneyPanelOpen)

  /////////////////////////////////////////////////////////////////
  // Drawer chrome (context) — reset when URL closes the drawer
  /////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!state.isOpen) {
      setIsJourneyPanelOpen(false)
    }
  }, [state.isOpen])

  /////////////////////////////////////////////////////////////////
  // Drawer chrome (context) — close handler clears chrome then URL
  /////////////////////////////////////////////////////////////////

  const handleClose = useCallback(() => {
    setIsJourneyPanelOpen(false)
    close()
  }, [close])

  /////////////////////////////////////////////////////////////////
  // Drawer chrome (context) — `RightDrawer.expandToFullScreen` + provider
  /////////////////////////////////////////////////////////////////

  // Stay mounted while closed so `RightDrawer` + `AnimatePresence` can run exit transition.
  return (
    <RightDrawer
      isOpen={state.isOpen}
      onClose={handleClose}
      expandToFullScreen={isJourneyPanelOpen}
    >
      {state.isOpen ? (
        <DrawerChromeProvider value={drawerChrome}>{children}</DrawerChromeProvider>
      ) : null}
    </RightDrawer>
  )
}
