/**
 * Query Builder Component
 * 
 * Purpose: Main entry component for query filter builder
 * Used in: Pages that need advanced filtering
 * Why: Provides complete query builder UI with dropdown
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, RotateCcw } from 'lucide-react'
import { useFilterBuilder } from '../../hooks/use-filter-builder'
import { useUrlQueryFilter } from '../../hooks/use-url-query-filter'
import { GroupNode } from './group-node'
import { AddButtons } from './add-buttons'
import { filterFields } from '../../config/filter-fields'
import { filterCompleteConditions } from '../../utils/filter-complete-conditions'
import { getAppliedConditionIds } from '../../utils/get-applied-conditions'
import type { FilterField } from '../../types/field'
import type { FilterNode } from '../../types/filter'

interface QueryBuilderProps {
  fields?: FilterField[]
  className?: string
  placeholder?: string
}

/**
 * QueryBuilder component - main query builder with dropdown
 * WHY: Provides complete query builder UI
 * HOW: Integrates filter builder hook with URL sync and renders dropdown UI
 */
export function QueryBuilder({
  fields = filterFields,
  className,
  placeholder = "Filter",
}: QueryBuilderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { getFilter, setFilter, clearFilter } = useUrlQueryFilter()
  const filterBuilder = useFilterBuilder()

  // Sync URL filter to builder on mount
  useEffect(() => {
    const urlFilter = getFilter()
    if (urlFilter) {
      filterBuilder.setFilter(urlFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // Sync builder → URL when the tree changes.
  // - Complete tree → write `filter` param (setFilter no-ops if serialized query unchanged).
  // - Incomplete/empty tree → clear URL only if `filter` exists; otherwise skip (avoids mount-time wrapNavigation + list dimmers).
  useEffect(() => {
    const completeFilter = filterCompleteConditions(filterBuilder.filterTree)

    if (completeFilter) {
      setFilter(completeFilter)
    } else if (getFilter() != null) {
      clearFilter()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBuilder.filterTree])

  const handleReset = () => {
    filterBuilder.clearFilter()
    clearFilter()
  }

  const hasFilters = filterBuilder.filterTree !== null && 
    filterBuilder.filterTree.type === 'group' &&
    filterBuilder.filterTree.children.length > 0

  // Get applied condition IDs from URL filter
  const urlFilter = getFilter()
  const appliedConditionIds = getAppliedConditionIds(urlFilter)

  const getButtonText = () => {
    if (!hasFilters) return placeholder
    const group = filterBuilder.filterTree as any
    const count = group?.children?.length || 0
    return count > 0 ? `Filter (${count})` : placeholder
  }

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasFilters ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {getButtonText()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[800px] h-fit flex flex-col p-0">
          <div className="flex-1 flex flex-col p-3 overflow-y-auto">
            {hasFilters && filterBuilder.filterTree?.type === 'group' ? (
              <GroupNode
                group={filterBuilder.filterTree}
                isRoot={true}
                filterBuilder={filterBuilder}
                fields={fields}
                appliedConditionIds={appliedConditionIds}
              />
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No filters applied. Add a condition to get started.
              </div>
            )}

            {/* Add buttons when no filters */}
            {!hasFilters && (
              <div className="mt-4">
                <AddButtons
                  onAddCondition={() => {
                    // Create root group with first condition
                    filterBuilder.addCondition('')
                  }}
                  onAddGroup={() => {
                    // Create root group with nested group
                    filterBuilder.addGroup('')
                  }}
                />
              </div>
            )}
          </div>

          {/* Reset Button - Sticky at bottom */}
          {hasFilters && (
            <div className="mt-auto p-3 border-t border-border flex justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
