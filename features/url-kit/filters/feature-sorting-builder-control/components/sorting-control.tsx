/**
 * Sorting Control Component
 * 
 * Purpose: Main dropdown-based sorting control with rows, list, and reset
 * Used in: Pages that need advanced sorting UI
 * Why: Provides comprehensive sorting management with visual interface
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, RotateCcw } from 'lucide-react'
import { useUrlSorting } from '../hooks/useUrlSorting'
import { SortRow } from './sort-row'
import { AvailableSortsList } from './available-sorts-list'
import type { SortingControlProps } from '../types'

/**
 * SortingControl component - main sorting control dropdown
 * WHY: Provides comprehensive UI for managing multiple sorts
 * HOW: Uses useUrlSorting hook, renders rows for active sorts, list for available sorts, reset button
 */
export function SortingControl({
  sortConfig,
  className,
  placeholder = "Sort",
}: SortingControlProps) {
  const { getSorts, setSorts, clearSorts } = useUrlSorting()
  const [isOpen, setIsOpen] = useState(false)

  // Get current sorts from URL
  const activeSorts = getSorts()

  // Get used keys (for filtering available list)
  const usedKeys = activeSorts.map(s => s.key)

  // Get available configs (for list)
  const availableConfigs = sortConfig.filter(c => !usedKeys.includes(c.key))

  // Get button text
  const getButtonText = () => {
    if (activeSorts.length === 0) {
      return placeholder
    }
    if (activeSorts.length === 1) {
      const sort = activeSorts[0]
      const config = sortConfig.find(c => c.key === sort.key)
      return `${config?.label || sort.key} (${sort.direction === 'asc' ? 'A→Z' : 'Z→A'})`
    }
    return `Sort (${activeSorts.length})`
  }

  // Handlers
  const handleSortChange = (oldKey: string, newKey: string, newDirection: 'asc' | 'desc') => {
    // Check if key changed or just direction
    if (oldKey !== newKey) {
      // Key changed - replace the old key with new key
      const newSorts = activeSorts.map(s => 
        s.key === oldKey ? { key: newKey, direction: newDirection } : s
      )
      setSorts(newSorts)
    } else {
      // Only direction changed
      const newSorts = activeSorts.map(s => 
        s.key === newKey ? { ...s, direction: newDirection } : s
      )
      setSorts(newSorts)
    }
  }

  const handleRemove = (key: string) => {
    const newSorts = activeSorts.filter(s => s.key !== key)
    setSorts(newSorts.length > 0 ? newSorts : [])
  }

  const handleAdd = (key: string) => {
    const newSorts = [...activeSorts, { key, direction: 'asc' as const }]
    setSorts(newSorts)
  }

  const handleMoveUp = (key: string) => {
    const index = activeSorts.findIndex(s => s.key === key)
    if (index <= 0) return
    const newSorts = [...activeSorts]
    ;[newSorts[index - 1], newSorts[index]] = [newSorts[index], newSorts[index - 1]]
    setSorts(newSorts)
  }

  const handleMoveDown = (key: string) => {
    const index = activeSorts.findIndex(s => s.key === key)
    if (index < 0 || index >= activeSorts.length - 1) return
    const newSorts = [...activeSorts]
    ;[newSorts[index], newSorts[index + 1]] = [newSorts[index + 1], newSorts[index]]
    setSorts(newSorts)
  }

  const handleReset = () => {
    clearSorts()
  }

  const hasSorts = activeSorts.length > 0

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasSorts ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {getButtonText()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-64 min-h-[300px] flex flex-col p-0">
          <div className="flex-1 flex flex-col p-3 overflow-y-auto">
            {/* Sort Rows */}
            {activeSorts.length > 0 && (
              <div className="space-y-2 mb-3">
                {activeSorts.map((sort, index) => (
                  <SortRow
                    key={`${sort.key}-${index}`}
                    sort={sort}
                    level={index}
                    availableConfigs={sortConfig}
                    allSorts={activeSorts}
                    isFirst={index === 0}
                    isLast={index === activeSorts.length - 1}
                    onSortChange={(key, direction) => {
                      handleSortChange(sort.key, key, direction)
                    }}
                    onRemove={() => handleRemove(sort.key)}
                    onMoveUp={() => handleMoveUp(sort.key)}
                    onMoveDown={() => handleMoveDown(sort.key)}
                  />
                ))}
              </div>
            )}

            {/* Available Sorts List */}
            {availableConfigs.length > 0 && (
              <>
              <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                Available sortable fields
              </DropdownMenuLabel>
              <AvailableSortsList
                availableConfigs={sortConfig}
                usedKeys={usedKeys}
                onKeySelect={handleAdd}
              />
              </>
            )}
          </div>

          {/* Reset Button - Sticky at bottom */}
          {hasSorts && (
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
