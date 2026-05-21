/**
 * Use Initial Sorts Hook
 * 
 * Purpose: Applies initial sort configuration to URL on mount if no sorts exist
 * Used in: Client pages that need default sorting behavior
 * Why: Provides a way to set default sorts when page first loads without overriding user's sort choices
 * 
 * Function Index:
 * - useInitialSorts: Hook that applies initial sorts on mount
 *   Example input: useInitialSorts([{ key: 'createdAt', direction: 'desc' }])
 *   Example output: Updates URL with initial sorts if no sort param exists
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useNavigationTransitionOptional } from '@/features/url-kit/filters/navigation-transition-context'
import type { SortSpec } from '../types'

/**
 * Hook to apply initial sorts on mount
 * WHY: Set default sorting when page first loads
 * HOW: Checks if sort param exists, if not, applies initial sorts from config in a single URL update
 * @param {SortSpec[]} initialSorts - Array of initial sort specifications to apply
 */
export function useInitialSorts(initialSorts: SortSpec[]) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { wrapNavigation } = useNavigationTransitionOptional()
  const wrapRef = useRef(wrapNavigation)
  wrapRef.current = wrapNavigation
  const hasAppliedRef = useRef(false)

  useEffect(() => {
    // Only apply once on mount
    if (hasAppliedRef.current) return
    
    // Check if sort param already exists in URL
    const sortParam = searchParams.get('sort')
    
    // Only apply initial sorts if no sorts exist in URL
    if (!sortParam && initialSorts.length > 0) {
      // Build sort string from initial sorts
      const sortString = initialSorts.map(s => `${s.key}:${s.direction}`).join(',')
      
      // Update URL with initial sorts in a single operation
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', sortString)
      wrapRef.current(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
      
      hasAppliedRef.current = true
    } else if (sortParam) {
      // Sorts already exist, mark as applied
      hasAppliedRef.current = true
    }
  }, []) // Empty deps - only run on mount

  // Note: We intentionally don't include dependencies because we only want to run this once on mount
}
