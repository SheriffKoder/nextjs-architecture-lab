/**
 * Pagination Footer Component
 *
 * Purpose: Reusable component for pagination UI
 * Used in: Pages that need pagination below content
 * Why: Provides consistent pagination UI structure
 *
 * Desktop (`md+`): PaginationWrapper (full controls)
 * Mobile (`< md`): PaginationMobile compact bar
 *   `1-10 of 25` —— [10 ▾] [<] 1/3 [>]
 */

'use client'

import { useMemo } from 'react'
import { useEffectiveSearchParams } from '@/platform/url-kit/url-params'
import { PaginationWrapper } from '../feature-pagination/components'
import { PaginationMobile } from '../feature-pagination/components/pagination-mobile'
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
 * HOW: Desktop wrapper + mobile compact bar
 */
export function PaginationFooter({
  totalItems,
  config,
  title = 'Pagination',
  hideWhenShowAllForViews,
  defaultView = 'table',
}: PaginationFooterProps) {
  const searchParams = useEffectiveSearchParams()
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
    <div className="my-4" aria-label={title}>
      <div className="hidden md:block">
        <PaginationWrapper
          totalItems={totalItems}
          config={config}
          hideWhenShowAllForViews={hideWhenShowAllForViews}
          defaultView={defaultView}
        />
      </div>
      <div className="md:hidden">
        <PaginationMobile
          totalItems={totalItems}
          config={config}
          hideWhenShowAllForViews={hideWhenShowAllForViews}
          defaultView={defaultView}
        />
      </div>
    </div>
  )
}
