/**
 * Use Initial Grouping Hook
 *
 * Purpose: Applies default groupBy / subGroupBy from field config when URL has no grouping
 * Used in: MinimalControls, FilterToolbar, and other chrome that owns grouping config
 * Why: Mirrors useInitialSorts — seed URL grouping on mount without overriding user choices
 *
 * Function Index:
 * - useInitialGrouping: Hook that applies initial grouping on mount
 *   Example input: useInitialGrouping([{ key: 'status', label: 'Status', initial: true }])
 *   Example output: Sets groupBy when URL has no groupBy param
 */

'use client'

import { useEffect, useRef } from 'react'
import { useUrlParamsTransport } from '@/platform/url-kit/url-params'
import {
  DEFAULT_GROUP_BY_PARAM,
  DEFAULT_SUB_GROUP_BY_PARAM,
} from '../config/defaults'
import type { GroupableField } from '../model/types'
import type { UseUrlGroupingOptions } from './use-url-grouping'

type UseInitialGroupingOptions = Pick<
  UseUrlGroupingOptions,
  'allowedKeys' | 'groupByParam' | 'subGroupByParam'
>

/**
 * Apply initial groupBy / subGroupBy from config when URL has no grouping.
 * @param groupableFields - Fields; mark one with `initial`, optionally one with `initialSubGroup`
 * @param options - Allowed keys and optional param names
 */
export function useInitialGrouping(
  groupableFields: GroupableField[],
  options: UseInitialGroupingOptions,
) {
  const {
    allowedKeys,
    groupByParam = DEFAULT_GROUP_BY_PARAM,
    subGroupByParam = DEFAULT_SUB_GROUP_BY_PARAM,
  } = options

  const { effectiveParams, buildParams, commit, committedSnapshot } =
    useUrlParamsTransport()
  const hasAppliedRef = useRef(false)

  useEffect(() => {
    if (hasAppliedRef.current) return

    const currentGroupBy = effectiveParams.get(groupByParam)
    if (!currentGroupBy) {
      const initialPrimary = groupableFields.find((field) => field.initial)
      if (initialPrimary && allowedKeys.includes(initialPrimary.key)) {
        const params = buildParams()
        params.set(groupByParam, initialPrimary.key)

        const initialSecondary = groupableFields.find(
          (field) => field.initialSubGroup,
        )
        if (
          initialSecondary &&
          initialSecondary.key !== initialPrimary.key &&
          allowedKeys.includes(initialSecondary.key) &&
          !params.get(subGroupByParam)
        ) {
          params.set(subGroupByParam, initialSecondary.key)
        }

        const next = params.toString()
        if (next !== committedSnapshot) {
          commit(next)
        }
      }
    }

    hasAppliedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
