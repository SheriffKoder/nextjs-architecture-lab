'use client'

/**
 * Drawer chrome — UI state shared between `RightDrawer` shell and inner drawer content.
 *
 * Purpose: e.g. journey “expand view” toggles `expandToFullScreen` without prop drilling.
 * Used in: `DrawerWrapper` (provides + reads `isJourneyPanelOpen` for `RightDrawer`), drawer body children (`useDrawerChrome`).
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

export type DrawerChromeContextValue = {
  isJourneyPanelOpen: boolean
  setIsJourneyPanelOpen: (open: boolean) => void
  toggleJourneyPanel: () => void
}

export const DrawerChromeContext = createContext<DrawerChromeContextValue | null>(null)

export function DrawerChromeProvider({
  value,
  children,
}: {
  value: DrawerChromeContextValue
  children: ReactNode
}) {
  return <DrawerChromeContext.Provider value={value}>{children}</DrawerChromeContext.Provider>
}

/** Throws if used outside `DrawerWrapper` (or any host that mounts `DrawerChromeProvider`). */
export function useDrawerChrome(): DrawerChromeContextValue {
  const ctx = useContext(DrawerChromeContext)
  if (!ctx) {
    throw new Error('useDrawerChrome must be used inside DrawerChromeProvider (e.g. under DrawerWrapper).')
  }
  return ctx
}

/** Same store as `useDrawerChrome`, but returns `null` when no provider (optional integrations). */
export function useDrawerChromeOptional(): DrawerChromeContextValue | null {
  return useContext(DrawerChromeContext)
}

export function useDrawerChromeValue(
  isJourneyPanelOpen: boolean,
  setIsJourneyPanelOpen: Dispatch<SetStateAction<boolean>>
): DrawerChromeContextValue {
  const toggleJourneyPanel = useCallback(() => {
    setIsJourneyPanelOpen((v) => !v)
  }, [setIsJourneyPanelOpen])

  return useMemo(
    () => ({
      isJourneyPanelOpen,
      setIsJourneyPanelOpen,
      toggleJourneyPanel,
    }),
    [isJourneyPanelOpen, setIsJourneyPanelOpen, toggleJourneyPanel],
  )
}
