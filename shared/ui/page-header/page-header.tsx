/**
 * Page Header Component
 * 
 * Purpose: Displays page title with parent route context
 * Used in: app/(root)/layout.tsx
 * Why: Provides consistent page header with breadcrumb-like navigation context
 * 
 * Function Index:
 * - PageHeader: Main component that displays parent route (small text) and current page (bold text)
 * 
 * Steps:
 * 1. Get current pathname from usePathname hook
 * 2. Parse pathname to extract route segments
 * 3. Determine parent route (second-to-last segment) and current page (last segment)
 * 4. Display parent as small text if exists, current page as bold text
 * 5. If only one level, show only bold text
 */

'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/widgets/side-nav'

export interface PageHeaderProps {
  subTitle?: string
  /**
   * When false, omit the mobile sidebar toggle (e.g. parent places it beside actions).
   * @default true
   */
  showMenuToggle?: boolean
  /** Hide subtitle below `md` to keep the mobile title row compact */
  hideSubtitleOnMobile?: boolean
  className?: string
}

export default function PageHeader({
  subTitle,
  showMenuToggle = true,
  hideSubtitleOnMobile = false,
  className,
}: PageHeaderProps) {
  const pathname = usePathname()
  const { openSidebar } = useSidebar()

  ///////////////////////
  // Parse pathname to extract route segments
  // Why: Need to separate parent route from current page
  // How: Split by '/' and filter out empty strings, then extract segments
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0)
  
  ///////////////////////
  // Determine parent and current page
  // Why: Display parent as small text, current as bold
  // How: If multiple segments, parent is second-to-last, current is last. If single segment, only current.
  const currentPage = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1] 
    : 'Home'
  
  const parentRoute = pathSegments.length > 1 
    ? pathSegments[pathSegments.length - 2] 
    : null

  ///////////////////////
  // Format text for display
  // Why: Convert route segments to readable text (capitalize, replace hyphens)
  // How: Capitalize first letter and replace hyphens with spaces
  const formatText = (text: string): string => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 md:w-fit',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Parent route - small text (only shown if parent exists) */}
        {parentRoute && (
          <span className="text-sm text-foreground/40">
            {formatText(parentRoute)}
          </span>
        )}
        
        {/* Current page - bold text */}
        <h1 className="truncate text-2xl font-bold text-foreground md:text-3xl">
          {formatText(currentPage)}
        </h1>

        {subTitle && (
          <span
            className={cn(
              'text-sm text-foreground/40',
              hideSubtitleOnMobile && 'hidden md:inline',
            )}
          >
            {subTitle}
          </span>
        )}
      </div>

      {/* Hamburger Menu - Mobile Only */}
      {showMenuToggle ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={openSidebar}
          className="md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-foreground" />
        </Button>
      ) : null}
    </div>
  )
}
