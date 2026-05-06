'use client'

/**
 * Optional root: wraps URL-driven demo pages so `router.replace` runs inside one `useTransition`,
 * exposing `isNavigationPending` for dimming slow islands (e.g. RSC table).
 *
 * Hooks call `useNavigationTransitionOptional().wrapNavigation(() => router.replace(...))`.
 * Without a provider, falls back to `startTransition` only (pending stays false here).
 */

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

export type NavigationTransitionContextValue = {
  wrapNavigation: (fn: () => void) => void
  isNavigationPending: boolean
}

const NavigationTransitionCtx = createContext<NavigationTransitionContextValue | null>(null)

export function NavigationTransitionRoot({ children }: { children: ReactNode }) {
  const [isNavigationPending, startNavTransition] = useTransition()

  const wrapNavigation = useCallback(
    (fn: () => void) => {
      startNavTransition(fn)
    },
    [startNavTransition]
  )

  return (
    <NavigationTransitionCtx.Provider value={{ wrapNavigation, isNavigationPending }}>
      {children}
    </NavigationTransitionCtx.Provider>
  )
}

export function useNavigationTransitionOptional(): NavigationTransitionContextValue {
  const ctx = useContext(NavigationTransitionCtx)
  if (ctx) return ctx
  return {
    wrapNavigation: (fn: () => void) => startTransition(fn),
    isNavigationPending: false,
  }
}

/** Dims children while a wrapped navigation is in-flight (same transition as URL hooks). */
export function NavigationPendingDimmer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { isNavigationPending } = useNavigationTransitionOptional()

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isNavigationPending && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
    </div>
  )
}
