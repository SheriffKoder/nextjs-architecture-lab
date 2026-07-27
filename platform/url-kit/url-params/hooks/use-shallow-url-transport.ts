/**
 * @file platform/url-kit/url-params/hooks/use-shallow-url-transport.ts
 * Shallow transport — `history.replaceState` + popstate (hybrid / TanStack pages).
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UrlParamsAdapter } from '../model/types'

function readWindowSnapshot(): string {
  if (typeof window === 'undefined') return ''
  return window.location.search.replace(/^\?/, '')
}

function replaceStateSnapshot(next: string) {
  if (typeof window === 'undefined') return
  const path = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', path)
}

type UseShallowUrlTransportOptions = {
  /** Server-rendered query string (without `?`) for hydration parity */
  initialSnapshot: string
}

/**
 * Shallow URL transport for client list pages. Must run under `ShallowUrlProvider`.
 */
export function useShallowUrlTransport({
  initialSnapshot,
}: UseShallowUrlTransportOptions): UrlParamsAdapter {
  const [effectiveSnapshot, setEffectiveSnapshot] = useState(
    () => initialSnapshot || readWindowSnapshot(),
  )

  const committedSnapshot = effectiveSnapshot

  useEffect(() => {
    const onPopState = () => {
      setEffectiveSnapshot(readWindowSnapshot())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const effectiveParams = useMemo(
    () => new URLSearchParams(effectiveSnapshot),
    [effectiveSnapshot],
  )

  const buildParams = useCallback(
    () => new URLSearchParams(effectiveSnapshot),
    [effectiveSnapshot],
  )

  const applyPendingSnapshot = useCallback((next: string) => {
    setEffectiveSnapshot(next)
  }, [])

  const commit = useCallback(
    (next: string, options?: { skipIfUnchanged?: boolean }) => {
      if (options?.skipIfUnchanged !== false && next === effectiveSnapshot) {
        return
      }
      setEffectiveSnapshot(next)
      replaceStateSnapshot(next)
    },
    [effectiveSnapshot],
  )

  const clearAllParams = useCallback(() => {
    setEffectiveSnapshot('')
    replaceStateSnapshot('')
  }, [])

  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : ''

  const wrapNavigation = useCallback((fn: () => void) => {
    fn()
  }, [])

  return useMemo(
    (): UrlParamsAdapter => ({
      effectiveParams,
      getSnapshot: () => effectiveSnapshot,
      getEffectiveParams: () => effectiveParams,
      buildParams,
      applyPendingSnapshot,
      commit,
      clearAllParams,
      pathname,
      wrapNavigation,
      committedSnapshot,
    }),
    [
      effectiveSnapshot,
      effectiveParams,
      buildParams,
      applyPendingSnapshot,
      commit,
      clearAllParams,
      pathname,
      wrapNavigation,
      committedSnapshot,
    ],
  )
}
