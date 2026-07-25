/**
 * View switcher hook — thin wrapper over url-kit `useViewResolution`
 * for backward compatibility inside multi-view.
 */

'use client'

import {
  useViewResolution,
  type UseViewResolutionOptions,
} from '@/platform/url-kit/minimal-controls'

interface UseViewSwitcherOptions {
  availableViews: string[]
  defaultView?: string
  paramName?: string
  useAllItems?: readonly string[]
  defaultPageSize?: number
}

interface UseViewSwitcherReturn {
  currentView: string
  setView: (view: string) => void
  isViewAvailable: (view: string) => boolean
  /** Explicit URL resolution (available | fallback | missing). */
  resolution: ReturnType<typeof useViewResolution>['resolution']
}

export function useViewSwitcher(
  options: UseViewSwitcherOptions
): UseViewSwitcherReturn {
  const { resolution, currentView, setView, isViewAvailable } =
    useViewResolution(options as UseViewResolutionOptions)

  return {
    currentView,
    setView,
    isViewAvailable,
    resolution,
  }
}
