"use client"

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { GroupSidebarInfo } from '../../timeline-container'

interface GroupSidebarProps {
  groups: GroupSidebarInfo[]
  rowHeight: number
  groupByKey?: string // NEW: The field name used for grouping
  headerRowsHeight?: number // NEW: Total height of timeline header rows
  collapsedGroups?: Set<string | null> // NEW: Set of collapsed group keys
  onGroupClick?: (groupKey: string | null) => void
  onGroupToggle?: (groupKey: string | null) => void // NEW: Handler for collapse/expand toggle
}

const GroupSidebar = ({ groups, rowHeight, groupByKey, headerRowsHeight = 0, collapsedGroups = new Set(), onGroupClick, onGroupToggle }: GroupSidebarProps) => {
  // Format groupByKey for display (e.g., "project_name" -> "Project Name")
  const formatGroupByKey = (key?: string): string => {
    if (!key) return ''
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="flex flex-col border-r border-foreground/15 bg-transparent sticky left-0 z-40 min-w-[200px]">
      {/* Header cell - aligned with timeline headers */}
      {headerRowsHeight > 0 && (
        <div
          className="flex flex-col items-start justify-center px-4 border-b border-border/60 bg-[#f1f1f1] dark:bg-[#131313]"
          style={{
            height: `${headerRowsHeight}px`
          }}
        >
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
            Grouped by
          </span>
          <span className="text-sm font-bold text-foreground mt-1">
            {formatGroupByKey(groupByKey) || 'Group'}
          </span>
        </div>
      )}
      
      {/* Group cells */}
      {groups.map((group, index) => {
        const isCollapsed = collapsedGroups.has(group.groupKey)
        const shouldHaveBorderTop = index > 0 // Only groups at index 1, 2, 3, etc. get border-top (not index 0)
        
        return (
          <div
            key={`sidebar-group-${index}`}
            className={`flex items-start justify-start px-4 pt-2 font-semibold text-sm text-foreground border-b border-border/60 bg-transparent hover:bg-foreground/5 dark:hover:bg-foreground/10 transition-colors ${shouldHaveBorderTop ? 'border-t' : ''}`}
            style={{
              height: `${group.height}px`,
              minHeight: `${rowHeight}px`,
              ...(shouldHaveBorderTop ? {
                borderTopColor: 'hsl(var(--foreground) / 0.2)',
                borderTopWidth: '1px',
                borderTopStyle: 'solid'
              } : {})
            }}
            title={`${group.itemCount} item${group.itemCount !== 1 ? 's' : ''}`}
          >
            <div className="flex items-center gap-2 w-full">
              {/* Collapse/Expand Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onGroupToggle?.(group.groupKey)
                }}
                className="flex-shrink-0 p-0.5 hover:bg-foreground/10 rounded transition-colors"
                title={isCollapsed ? 'Expand group' : 'Collapse group'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-foreground/70" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-foreground/70" />
                )}
              </button>
              
              {/* Group Label */}
              <span 
                className="truncate flex-1 cursor-pointer"
                onClick={() => onGroupClick?.(group.groupKey)}
              >
                {group.groupKey || 'No Group'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default GroupSidebar
export type { GroupSidebarInfo }
