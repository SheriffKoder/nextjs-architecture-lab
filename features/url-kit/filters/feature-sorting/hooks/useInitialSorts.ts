/**
 * Use Initial Sorts Hook
 * 
 * Purpose: Automatically applies initial sorts from config when no sorts exist
 * Used in: SortButtons component to handle initial sort application
 * Why: Keeps component logic clean, handles initial sort application in one place
 * 
 * Function Index:
 * - useInitialSorts: Hook that applies initial sorts from config
 *   Example input: useInitialSorts([{ key: 'status', initial: true, initialOrder: 'asc' }])
 *   Example output: Automatically applies initial sorts if none exist
 */

'use client'

import { useEffect } from 'react'
import { useUrlSorting } from './useUrlSorting'
import type { SortConfig } from '../types'

/**
 * Hook to apply initial sorts from config when no sorts exist
 * WHY: Provide default sorting on page load without cluttering components
 * HOW: Checks if sorts exist, if not, applies configs with initial: true
 * @param {SortConfig[]} sortConfig - Array of sort configurations
 */
export function useInitialSorts(sortConfig: SortConfig[]) {
  const { getSorts, setSorts } = useUrlSorting()
  
  useEffect(() => {
    const currentSorts = getSorts()
    
    // Only apply initial sorts if no sorts are currently active
    if (currentSorts.length === 0) {
      // Find all configs with initial: true and convert to SortSpec array
      const initialSorts = sortConfig
        .filter(config => config.initial === true)
        .map(config => ({
          key: config.key,
          direction: (config.initialOrder || 'asc') as 'asc' | 'desc'
        }))
      
      // Apply all initial sorts in a single batch operation
      if (initialSorts.length > 0) {
        setSorts(initialSorts)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - empty deps array
}
