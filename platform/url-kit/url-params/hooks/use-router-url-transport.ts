/**
 * @file platform/url-kit/url-params/hooks/use-router-url-transport.ts
 * App Router transport — `router.replace` + optimistic reads (RSC default).
 */

'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useOptimisticUrlSearchParams } from '@/platform/url-kit/filters/lib/use-optimistic-url-search-params'
import { useNavigationTransitionOptional } from '@/platform/url-kit/filters/navigation-transition-context'
import type { UrlParamsAdapter } from '../model/types'

/**
 * Router-backed URL transport. Used as fallback when no `UrlParamsProvider` is mounted.
 */
export function useRouterUrlTransport(): UrlParamsAdapter {
  const router = useRouter()
  const pathname = usePathname()
  const { wrapNavigation } = useNavigationTransitionOptional()
  const {
    committedSnapshot,
    effectiveParams,
    buildParams,
    applyPendingSnapshot,
  } = useOptimisticUrlSearchParams()

  const commit = useCallback(
    (next: string, options?: { skipIfUnchanged?: boolean }) => {
      applyPendingSnapshot(next)
      if (options?.skipIfUnchanged !== false && next === committedSnapshot) {
        return
      }
      wrapNavigation(() => {
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
      })
    },
    [
      applyPendingSnapshot,
      committedSnapshot,
      pathname,
      router,
      wrapNavigation,
    ],
  )

  const clearAllParams = useCallback(() => {
    applyPendingSnapshot('')
    wrapNavigation(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [applyPendingSnapshot, pathname, router, wrapNavigation])

  return useMemo(
    (): UrlParamsAdapter => ({
      effectiveParams,
      getSnapshot: () => effectiveParams.toString(),
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
