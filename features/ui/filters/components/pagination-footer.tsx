/**
 * Pagination Footer Component
 * 
 * Purpose: Reusable component for pagination UI
 * Used in: Pages that need pagination below content
 * Why: Provides consistent pagination UI structure
 */

import { PaginationWrapper } from "../feature-pagination/components"
import type { PaginationConfig } from "../feature-pagination/types"

interface PaginationFooterProps {
  totalItems: number
  config: PaginationConfig
  title?: string
}

/**
 * PaginationFooter component - renders pagination UI
 * WHY: Provides consistent pagination layout
 * HOW: Renders pagination wrapper with title
 */
export function PaginationFooter({
  totalItems,
  config,
  title = "Pagination",
}: PaginationFooterProps) {
  return (
    <div className="my-4">
      <PaginationWrapper
        totalItems={totalItems}
        config={config}
      />
    </div>
  )
}
