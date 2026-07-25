/**
 * URL view resolution + navigation (`view` param, `all=1` sync).
 *
 * Returns explicit {@link ViewResolution} so orchestrators can branch on
 * available / fallback / missing.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useNavigationTransitionOptional } from '@/platform/url-kit/filters/navigation-transition-context'
import {
  applyShowAllToSearchParams,
  isShowAllUrlParam,
  syncShowAllForViewChange,
  viewRequiresAllItems,
} from '@/platform/url-kit/filters/feature-pagination/utils'
import { DEFAULT_VIEW_PARAM } from '../config/defaults'
import { resolveView } from '../lib/resolve-view'
import type { ViewResolution } from '../model/types'

export interface UseViewResolutionOptions {
  availableViews: readonly string[]
  defaultView?: string
  paramName?: string
  useAllItems?: readonly string[]
  defaultPageSize?: number
}

export interface UseViewResolutionReturn {
  /** Explicit resolution of the URL `view` param. */
  resolution: ViewResolution
  /** Effective view to render (always in availableViews / default). */
  currentView: string
  setView: (view: string) => void
  isViewAvailable: (view: string) => boolean
}

export function useViewResolution(
  options: UseViewResolutionOptions
): UseViewResolutionReturn {
  const {
    availableViews,
    defaultView,
    paramName = DEFAULT_VIEW_PARAM,
    useAllItems,
    defaultPageSize = 10,
  } = options

  const effectiveDefaultView =
    defaultView || (availableViews.length > 0 ? availableViews[0] : 'table')

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { wrapNavigation } = useNavigationTransitionOptional()

  const resolution = useMemo(
    () =>
      resolveView(
        searchParams.get(paramName),
        availableViews,
        effectiveDefaultView
      ),
    [searchParams, paramName, availableViews, effectiveDefaultView]
  )

  const currentView = resolution.view

  const replaceParams = useCallback(
    (params: URLSearchParams) => {
      if (params.toString() === searchParams.toString()) return
      const qs = params.toString()
      wrapNavigation(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams, wrapNavigation]
  )

  const setView = useCallback(
    (view: string) => {
      if (!availableViews.includes(view)) {
        console.warn(
          `View "${view}" is not in availableViews:`,
          availableViews
        )
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      if (view === effectiveDefaultView) {
        params.delete(paramName)
      } else {
        params.set(paramName, view)
      }

      syncShowAllForViewChange(params, currentView, view, {
        useAllItems,
        defaultPageSize,
      })

      replaceParams(params)
    },
    [
      availableViews,
      currentView,
      defaultPageSize,
      effectiveDefaultView,
      paramName,
      replaceParams,
      searchParams,
      useAllItems,
    ]
  )

  const didSyncShowAllRef = useRef<string | null>(null)
  useEffect(() => {
    if (
      !useAllItems?.length ||
      !viewRequiresAllItems(currentView, useAllItems)
    ) {
      didSyncShowAllRef.current = null
      return
    }
    if (isShowAllUrlParam(searchParams)) {
      didSyncShowAllRef.current = searchParams.toString()
      return
    }

    const key = searchParams.toString()
    if (didSyncShowAllRef.current === key) return
    didSyncShowAllRef.current = key

    const params = new URLSearchParams(searchParams.toString())
    applyShowAllToSearchParams(params)
    replaceParams(params)
  }, [currentView, replaceParams, searchParams, useAllItems])

  const isViewAvailable = useCallback(
    (view: string): boolean => availableViews.includes(view),
    [availableViews]
  )

  return {
    resolution,
    currentView,
    setView,
    isViewAvailable,
  }
}
