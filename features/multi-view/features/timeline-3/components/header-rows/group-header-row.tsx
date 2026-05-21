"use client"

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import TimelineRow from '../main/timeline-row'
import { MappingKeys } from '../../utils/mapping/timeline-mapping'

interface GroupHeaderRowProps {
  groupKey: string | null
  yearsInRange: number[]
  visibleYearsInRange: number[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  yearWeekWidth: number
  monthDayWidth: number
  weekDayWidth: number
  calculatedCellWidth: number
  rowHeight: number
  totalTimelineWidth: number
  timelineIndex: number
  mappingKeys: MappingKeys
  collapsedGroups?: Set<string | null> // NEW: Set of collapsed group keys
  onGroupToggle?: (groupKey: string | null) => void // NEW: Handler for collapse/expand toggle
}

const GroupHeaderRow = ({ 
  groupKey, 
  yearsInRange,
  visibleYearsInRange,
  view,
  yearWeekWidth,
  monthDayWidth,
  weekDayWidth,
  calculatedCellWidth,
  rowHeight,
  totalTimelineWidth,
  timelineIndex,
  mappingKeys,
  collapsedGroups = new Set(),
  onGroupToggle
}: GroupHeaderRowProps) => {
  const isCollapsed = collapsedGroups.has(groupKey)
  
  return (
    <div className="relative" style={{ width: '100%', height: `${rowHeight}px` }}>
      {/* Background row with cells - renders full timeline row structure */}
      <div className="absolute inset-0">
        <TimelineRow 
          yearsInRange={yearsInRange}
          visibleYearsInRange={visibleYearsInRange}
          view={view}
          yearWeekWidth={yearWeekWidth}
          monthDayWidth={monthDayWidth}
          weekDayWidth={weekDayWidth}
          cellWidth={calculatedCellWidth}
          cellHeight={rowHeight}
          timelineIndex={timelineIndex}
          timelineData={[]} // Empty array - no pills will be rendered
          mappingKeys={mappingKeys}
          cellStyle={{}}
          // No resize/click handlers needed for header row
        />
      </div>
      
      {/* Overlay label - positioned on top of the background row */}
      <div
        className="absolute inset-0 z-30 flex items-center px-4 font-semibold text-sm text-foreground"
      >
        <div 
          className="sticky left-4 bg-[#f1f1f1]/10 dark:bg-[#131313]/95 px-2 py-1 rounded flex items-center gap-2"
          style={{
            backdropFilter: 'blur(2px)',
          }}
        >
          {/* Collapse/Expand Button */}
          {onGroupToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGroupToggle(groupKey)
              }}
              className="flex-shrink-0 p-0.5 hover:bg-foreground/10 rounded transition-colors pointer-events-auto"
              title={isCollapsed ? 'Expand group' : 'Collapse group'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3 text-foreground/70" />
              ) : (
                <ChevronDown className="w-3 h-3 text-foreground/70" />
              )}
            </button>
          )}
          
          {/* Group Label */}
          <span className="pointer-events-none">
            {groupKey || 'No Group'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GroupHeaderRow
