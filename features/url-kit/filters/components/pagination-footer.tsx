/**
 * Pagination Footer Component
 *
 * Purpose: Reusable component for pagination UI
 * Used in: Pages that need pagination below content
 * Why: Provides consistent pagination UI structure
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { PaginationWrapper } from '../feature-pagination/components'
import { shouldHidePaginationForUseAllView } from '../feature-pagination/utils'
import type { PaginationConfig } from '../feature-pagination/types'

interface PaginationFooterProps {
  totalItems: number
  config: PaginationConfig
  title?: string
  /** Hide footer when `all=1` and `view` is in this list */
  hideWhenShowAllForViews?: readonly string[]
  defaultView?: string
}

/**
 * PaginationFooter component - renders pagination UI
 * WHY: Provides consistent pagination layout
 * HOW: Renders pagination wrapper with title
 */
export function PaginationFooter({
  totalItems,
  config,
  title = 'Pagination',
  hideWhenShowAllForViews,
  defaultView = 'table',
}: PaginationFooterProps) {
  const searchParams = useSearchParams()
  const hidden = useMemo(
    () =>
      shouldHidePaginationForUseAllView(searchParams, {
        useAllItems: hideWhenShowAllForViews,
        defaultView,
      }),
    [searchParams, hideWhenShowAllForViews, defaultView],
  )

  if (hidden) {
    return null
  }

  return (
    <div className="my-4">
      <PaginationWrapper
        totalItems={totalItems}
        config={config}
        hideWhenShowAllForViews={hideWhenShowAllForViews}
        defaultView={defaultView}
      />
    </div>
  )
}
