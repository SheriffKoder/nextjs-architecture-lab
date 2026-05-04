'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface UseViewModeOptions {
  /**
   * Name of the first view option (default: 'table')
   * This corresponds to viewMode value 0
   */
  viewOne?: string
  /**
   * Name of the second view option (default: 'kanban')
   * This corresponds to viewMode value 1
   */
  viewTwo?: string
  /**
   * URL parameter name to use (default: 'view')
   */
  paramName?: string
}

interface UseViewModeReturn {
  /**
   * Current view mode: 0 for viewOne, 1 for viewTwo
   */
  viewMode: number
  /**
   * Handler to change view mode
   * @param value - 0 for viewOne, 1 for viewTwo
   */
  handleViewModeChange: (value: number) => void
}

/**
 * Custom hook for managing view mode state synchronized with URL parameters
 * 
 * @param options - Configuration options for view names and URL param name
 * @returns Object with viewMode state and change handler
 * 
 * @example
 * ```tsx
 * // Basic usage with defaults (table/kanban)
 * const { viewMode, handleViewModeChange } = useViewMode()
 * 
 * // Custom view names
 * const { viewMode, handleViewModeChange } = useViewMode({
 *   viewOne: 'list',
 *   viewTwo: 'grid',
 *   paramName: 'display'
 * })
 * 
 * // Example usage with custom view names and URL param name
 * const { viewMode, handleViewModeChange } = useViewMode({
    viewOne: 'table',
    viewTwo: 'calendar'
  })
 * ```
 */
export function useViewMode(options: UseViewModeOptions = {}): UseViewModeReturn {
  const {
    viewOne = 'table',
    viewTwo = 'kanban',
    paramName = 'view'
  } = options

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize viewMode from URL params, default to viewOne (0)
  const [viewMode, setViewMode] = useState(() => {
    const viewParam = searchParams.get(paramName)
    if (viewParam === viewTwo) return 1
    return 0 // default to viewOne
  })

  // Sync viewMode with URL params when searchParams change (e.g., browser back/forward)
  useEffect(() => {
    const viewParam = searchParams.get(paramName)
    const urlViewMode = viewParam === viewTwo ? 1 : 0
    if (urlViewMode !== viewMode) {
      setViewMode(urlViewMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramName, viewTwo])

  const handleViewModeChange = (value: number) => {
    setViewMode(value)
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (value === 1) {
      params.set(paramName, viewTwo)
    } else {
      params.set(paramName, viewOne)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return {
    viewMode,
    handleViewModeChange
  }
}
