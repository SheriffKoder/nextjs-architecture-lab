/**
 * URL view resolution + navigation (`view` param, `all=1` sync).
 *
 * Returns explicit {@link ViewResolution} so orchestrators can branch on
 * available / fallback / missing.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'
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

  const { effectiveParams, buildParams, commit, committedSnapshot } =
    useUrlParamsTransport()

  const resolution = useMemo(
    () =>
      resolveView(
        effectiveParams.get(paramName),
        availableViews,
        effectiveDefaultView
      ),
    [effectiveParams, paramName, availableViews, effectiveDefaultView]
  )

  const currentView = resolution.view

  const replaceParams = useCallback(
    (params: URLSearchParams) => {
      const next = params.toString()
      if (next === committedSnapshot) return
      commit(next)
    },
    [commit, committedSnapshot]
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

      const params = buildParams()
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
      buildParams,
      currentView,
      defaultPageSize,
      effectiveDefaultView,
      paramName,
      replaceParams,
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
    if (isShowAllUrlParam(effectiveParams)) {
      didSyncShowAllRef.current = effectiveParams.toString()
      return
    }

    const key = effectiveParams.toString()
    if (didSyncShowAllRef.current === key) return
    didSyncShowAllRef.current = key

    const params = buildParams()
    applyShowAllToSearchParams(params)
    replaceParams(params)
  }, [buildParams, currentView, effectiveParams, replaceParams, useAllItems])

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
