/**
 * Wide search field with max-width + opacity chrome.
 */

'use client'

import { SearchBar } from '@/platform/url-kit/filters/feature-filtering/components/search-bar'
import type { SearchConfig } from '@/platform/url-kit/filters/feature-filtering/components/search-types'
import { cn } from '@/shared/lib/utils'
import {
  FILTER_TOOLBAR_SEARCH_CLASS,
  FILTER_TOOLBAR_SEARCH_SURFACE_BG,
} from '../../config/chrome'

export interface SearchControlProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches SearchBar
  config: SearchConfig<any>
  className?: string
}

export function SearchControl({ config, className }: SearchControlProps) {
  return (
    <div
      className={cn(
        FILTER_TOOLBAR_SEARCH_CLASS,
        'rounded-md border border-input',
        FILTER_TOOLBAR_SEARCH_SURFACE_BG,
        className
      )}
    >
      <SearchBar
        config={config}
        className={cn(
          'h-8 min-w-0 flex-1 !opacity-100',
          '[&>input]:border-0 [&>input]:bg-transparent [&>input]:shadow-none',
          // Smaller placeholder / typed text on mobile toolbar
          '[&>input]:text-xs [&>input]:placeholder:text-xs',
          'md:[&>input]:text-sm md:[&>input]:placeholder:text-sm',
        )}
      />
    </div>
  )
}
