/**
 * Use Initial Sort Specs Hook
 *
 * Purpose: Applies explicit initial sort specifications to URL on mount if no sorts exist
 * Used in: Pages that pass pre-built SortSpec[] defaults (not SortConfig with `initial` flags)
 * Why: Transport-aware alternative when config objects are not available
 *
 * Function Index:
 * - useInitialSortSpecs: Hook that applies initial sorts on mount
 *   Example input: useInitialSortSpecs([{ key: 'createdAt', direction: 'desc' }])
 *   Example output: Updates URL with initial sorts if no sort param exists
 */

'use client'

import { useEffect, useRef } from 'react'
import { useUrlSorting } from './useUrlSorting'
import type { SortSpec } from '../types'

/**
 * Hook to apply initial sorts on mount
 * WHY: Set default sorting when page first loads
 * HOW: Checks if sort param exists, if not, applies initial sorts via url-params transport
 * @param {SortSpec[]} initialSorts - Array of initial sort specifications to apply
 */
export function useInitialSortSpecs(initialSorts: SortSpec[]) {
  const { getSorts, setSorts } = useUrlSorting()
  const hasAppliedRef = useRef(false)

  useEffect(() => {
    if (hasAppliedRef.current) return

    const currentSorts = getSorts()
    if (currentSorts.length === 0 && initialSorts.length > 0) {
      setSorts(initialSorts)
    }

    hasAppliedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
