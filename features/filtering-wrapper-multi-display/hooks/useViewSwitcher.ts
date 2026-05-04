'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

interface UseViewSwitcherOptions {
  /** Available view keys */
  availableViews: string[]
  /** Default view if no param in URL */
  defaultView?: string
  /** URL parameter name (default: 'view') */
  paramName?: string
}

interface UseViewSwitcherReturn {
  /** Current view key */
  currentView: string
  /** Change handler that updates URL */
  setView: (view: string) => void
  /** Whether a specific view is available */
  isViewAvailable: (view: string) => boolean
}

/**
 * Hook for managing view state synchronized with URL parameters
 * 
 * @param options - Configuration options for available views and defaults
 * @returns Object with currentView, setView, and isViewAvailable
 * 
 * @example
 * ```tsx
 * const { currentView, setView } = useViewSwitcher({
 *   availableViews: ['table', 'kanban', 'map'],
 *   defaultView: 'table'
 * })
 * ```
 */
export function useViewSwitcher(options: UseViewSwitcherOptions): UseViewSwitcherReturn {
  const {
    availableViews,
    defaultView,
    paramName = 'view'
  } = options

  // Use first option in availableViews as default, or 'table' if no options provided
  const effectiveDefaultView = defaultView || (availableViews.length > 0 ? availableViews[0] : 'table')

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get initial view from URL or use default
  const getViewFromUrl = useCallback((): string => {
    const viewParam = searchParams.get(paramName)
    if (viewParam && availableViews.includes(viewParam)) {
      return viewParam
    }
    return effectiveDefaultView
  }, [searchParams, paramName, availableViews, effectiveDefaultView])

  const [currentView, setCurrentView] = useState<string>(() => getViewFromUrl())

  // Sync with URL params when they change (browser back/forward)
  useEffect(() => {
    const urlView = getViewFromUrl()
    if (urlView !== currentView) {
      setCurrentView(urlView)
    }
  }, [getViewFromUrl, currentView])

  const setView = useCallback((view: string) => {
    if (!availableViews.includes(view)) {
      console.warn(`View "${view}" is not in availableViews:`, availableViews)
      return
    }

    setCurrentView(view)
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (view === effectiveDefaultView) {
      // Remove param if it's the default view (cleaner URLs)
      params.delete(paramName)
    } else {
      params.set(paramName, view)
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [availableViews, effectiveDefaultView, paramName, searchParams, pathname, router])

  const isViewAvailable = useCallback((view: string): boolean => {
    return availableViews.includes(view)
  }, [availableViews])

  return {
    currentView,
    setView,
    isViewAvailable
  }
}
