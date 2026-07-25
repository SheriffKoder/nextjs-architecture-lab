/**
 * URL grouping — `groupBy` / `subGroupBy` with allowed-key validation and clear cascade.
 */

'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useNavigationTransitionOptional } from '@/platform/url-kit/filters/navigation-transition-context'
import {
  DEFAULT_GROUP_BY_PARAM,
  DEFAULT_SUB_GROUP_BY_PARAM,
} from '../config/defaults'

export interface UseUrlGroupingOptions {
  /** Keys allowed for groupBy / subGroupBy. Unknown URL values → null. */
  allowedKeys: readonly string[]
  groupByParam?: string
  subGroupByParam?: string
}

export interface UseUrlGroupingReturn {
  groupBy: string | null
  subGroupBy: string | null
  setGroupBy: (key: string | null) => void
  setSubGroupBy: (key: string | null) => void
  clearGrouping: () => void
}

function parseAllowed(
  raw: string | null,
  allowedKeys: readonly string[]
): string | null {
  if (!raw) return null
  return allowedKeys.includes(raw) ? raw : null
}

export function useUrlGrouping(
  options: UseUrlGroupingOptions
): UseUrlGroupingReturn {
  const {
    allowedKeys,
    groupByParam = DEFAULT_GROUP_BY_PARAM,
    subGroupByParam = DEFAULT_SUB_GROUP_BY_PARAM,
  } = options

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { wrapNavigation } = useNavigationTransitionOptional()

  const groupBy = useMemo(
    () => parseAllowed(searchParams.get(groupByParam), allowedKeys),
    [searchParams, groupByParam, allowedKeys]
  )

  const subGroupBy = useMemo(() => {
    const primary = parseAllowed(searchParams.get(groupByParam), allowedKeys)
    if (!primary) return null
    const secondary = parseAllowed(
      searchParams.get(subGroupByParam),
      allowedKeys
    )
    if (!secondary || secondary === primary) return null
    return secondary
  }, [searchParams, groupByParam, subGroupByParam, allowedKeys])

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      if (params.toString() === searchParams.toString()) return
      const qs = params.toString()
      wrapNavigation(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [searchParams, pathname, router, wrapNavigation]
  )

  const setGroupBy = useCallback(
    (key: string | null) => {
      replaceParams((params) => {
        if (!key) {
          params.delete(groupByParam)
          params.delete(subGroupByParam)
          return
        }
        if (!allowedKeys.includes(key)) return
        params.set(groupByParam, key)
        const currentSub = params.get(subGroupByParam)
        if (currentSub === key) {
          params.delete(subGroupByParam)
        }
      })
    },
    [replaceParams, groupByParam, subGroupByParam, allowedKeys]
  )

  const setSubGroupBy = useCallback(
    (key: string | null) => {
      replaceParams((params) => {
        const primary = params.get(groupByParam)
        if (!primary || !allowedKeys.includes(primary)) {
          params.delete(subGroupByParam)
          return
        }
        if (!key) {
          params.delete(subGroupByParam)
          return
        }
        if (!allowedKeys.includes(key) || key === primary) return
        params.set(subGroupByParam, key)
      })
    },
    [replaceParams, groupByParam, subGroupByParam, allowedKeys]
  )

  const clearGrouping = useCallback(() => {
    setGroupBy(null)
  }, [setGroupBy])

  return {
    groupBy,
    subGroupBy,
    setGroupBy,
    setSubGroupBy,
    clearGrouping,
  }
}
