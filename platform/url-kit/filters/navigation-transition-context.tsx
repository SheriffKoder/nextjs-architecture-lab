'use client'

/**
 * Optional root: wraps URL-driven demo pages so `router.replace` runs inside one `useTransition`,
 * exposing `isNavigationPending` for dimming slow islands (e.g. RSC table).
 *
 * Hooks call `useNavigationTransitionOptional().wrapNavigation(() => router.replace(...))`.
 * Without a provider, falls back to `startTransition` only (pending stays false here).
 *
 * `NavigationPendingDimmer` waits before dimming so instant/cached navigations do not flash opacity.
 */

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { cn } from '@/shared/lib/utils'

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

const DEFAULT_DIM_DELAY_MS = 150

/** Dims children while a wrapped navigation stays pending past `dimDelayMs` (avoids opacity flash on fast/cached updates). */
export function NavigationPendingDimmer({
  children,
  className,
  dimDelayMs = DEFAULT_DIM_DELAY_MS,
}: {
  children: ReactNode
  className?: string
  /** Only dim after `isNavigationPending` has been true for this many ms. */
  dimDelayMs?: number
}) {
  const { isNavigationPending } = useNavigationTransitionOptional()
  const [showDim, setShowDim] = useState(false)
  const dimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isNavigationPending) {
      if (dimTimerRef.current) {
        clearTimeout(dimTimerRef.current)
        dimTimerRef.current = null
      }
      setShowDim(false)
      return
    }

    if (dimTimerRef.current) {
      clearTimeout(dimTimerRef.current)
    }
    dimTimerRef.current = setTimeout(() => {
      dimTimerRef.current = null
      setShowDim(true)
    }, dimDelayMs)

    return () => {
      if (dimTimerRef.current) {
        clearTimeout(dimTimerRef.current)
        dimTimerRef.current = null
      }
    }
  }, [isNavigationPending, dimDelayMs])

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        showDim && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
    </div>
  )
}
