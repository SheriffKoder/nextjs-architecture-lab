import React from 'react'
import { MappedTimelineItem, MappingKeys } from '../../utils/mapping/timeline-mapping'
import { calculateNewDates } from '../../utils/dnd/timeline-item-updater'
import { parseDayCellIdToDate } from '../../utils/dnd/day-view-item-updater'

interface DragPreviewOverlayProps {
  activeItem: MappedTimelineItem | null
  hoveredCell: { cellId: string, year: number, month: number, day: number, hour?: number, minute?: number } | null
  mappingKeys: MappingKeys
  view?: 'Year' | 'Month' | 'Week' | 'Day'
}

/**
 * DragPreviewOverlay Component
 * 
 * Purpose: Displays expected dates preview above dragged item during drag operations
 * Used in: timeline-container.tsx (rendered inside DragOverlay from @dnd-kit)
 * Why: Shows user the expected new date range while dragging, providing immediate feedback
 * 
 * Features:
 * - Displays calculated expected dates in a tooltip above dragged item
 * - Shows date range in YYYY-MM-DD format (e.g., "2024-05-01 → 2024-05-21")
 * - For Day view: includes 12-hour time format (e.g., "2024-05-01 02:30 PM → 2024-05-01 05:45 PM")
 * - Positioned absolutely above the cursor
 * - Only visible when hovering over a valid drop cell
 * 
 * Code Flow:
 * 1. User starts dragging a timeline item -> DndContext's onDragStart fires
 * 2. timeline-container.tsx sets activeItem state with the dragged item
 * 3. DragMonitor component (using useDndMonitor) tracks drag events
 * 4. When dragging over a cell -> onDragOver fires, updates hoveredCell state
 * 5. This component receives activeItem and hoveredCell as props
 * 6. If hoveredCell exists, calculateNewDates() computes new start/end dates
 * 7. Dates are formatted and displayed in tooltip above dragged item
 * 8. As user moves mouse over different cells, hoveredCell updates
 * 9. Expected dates recalculate and display in real-time
 * 10. On drag end -> activeItem and hoveredCell reset, overlay disappears
 * 
 * Key Design:
 * - Uses DragOverlay from @dnd-kit which renders above all other content
 * - Dates are calculated using calculateNewDates utility (preserves item duration)
 * - Only shows preview when actively dragging AND hovering over a cell
 * - Actual data update happens in handleDragEnd (timeline-container.tsx)
 * - Provides real-time feedback without committing changes during drag
 * 
 * Visual Appearance:
 * - Blue tooltip (bg-blue-600) with white text
 * - Positioned above dragged item (translate-y-[-100%])
 * - Rounded corners and shadow for depth
 * - Dragged item itself is invisible (opacity-0) in overlay
 * - Tooltip shows date range with arrow separator
 */
const DragPreviewOverlay = ({ 
  activeItem, 
  hoveredCell, 
  mappingKeys,
  view
}: DragPreviewOverlayProps) => {
  if (!activeItem) return null

  // Calculate expected new dates if hovering over a cell
  let expectedText = ''
  if (hoveredCell && activeItem) {
    if (view === 'Day' && hoveredCell.hour !== undefined && hoveredCell.minute !== undefined) {
      const droppedCellId = `${activeItem.mapping.timelineIndex}:${hoveredCell.year}:${hoveredCell.month}:${hoveredCell.day}:${hoveredCell.hour}:${hoveredCell.minute}`
      const originalStart = new Date(activeItem.mapping.startDate)
      const originalEnd = new Date(activeItem.mapping.endDate)
      const droppedDate = parseDayCellIdToDate(droppedCellId)

      const durationInMs = originalEnd.getTime() - originalStart.getTime()
      const isMovingStart = droppedDate <= originalEnd
      const isMovingEnd = droppedDate >= originalStart
      let newStartDate: Date
      let newEndDate: Date
      if (isMovingStart) {
        newStartDate = new Date(droppedDate)
        newEndDate = new Date(droppedDate.getTime() + durationInMs)
      } else if (isMovingEnd) {
        newEndDate = new Date(droppedDate)
        newStartDate = new Date(droppedDate.getTime() - durationInMs)
      } else {
        const offsetInMs = droppedDate.getTime() - originalStart.getTime()
        newStartDate = new Date(originalStart.getTime() + offsetInMs)
        newEndDate = new Date(originalEnd.getTime() + offsetInMs)
      }

      const fmt = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        
        // Convert to 12-hour format with AM/PM
        const hours24 = d.getHours()
        const hours12 = hours24 % 12 || 12 // Convert 0 to 12, keep 1-11, convert 13-23 to 1-11
        const ampm = hours24 >= 12 ? 'PM' : 'AM'
        const hh = String(hours12).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        
        return `${y}-${m}-${dd} ${hh}:${mm} ${ampm}`
      }
      expectedText = `${fmt(newStartDate)} → ${fmt(newEndDate)}`
    } else {
      const droppedCellId = `${activeItem.mapping.timelineIndex}:${hoveredCell.year}:${hoveredCell.month}:${hoveredCell.day}`
      const { newStartDate, newEndDate } = calculateNewDates(
        activeItem.mapping.startCellId,
        activeItem.mapping.endCellId,
        droppedCellId
      )
      const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      expectedText = `${formatDate(newStartDate)} → ${formatDate(newEndDate)}`
    }
  }
  
  return (
    <div className='relative' style={{ transform: 'translateY(-50%)' }}>
      {/* Expected dates preview - positioned on top of item */}
      {hoveredCell && (
        <div 
          className='absolute left-1/2 translate-x-[-50%] bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50'
          style={{ bottom: '100%', marginBottom: '4px' }}
        >
          {expectedText}
        </div>
      )}
      {/* Dragged item preview - visible to show tooltip position correctly */}
      <div className='bg-blue-500 opacity-30 border border-blue-500 rounded flex items-center justify-center px-2 py-1'>
        <span className='text-xs font-semibold text-blue-700'>
          {/* {activeItem[mappingKeys.titleKey]} */}
        </span>
      </div>
    </div>
  )
}

export default DragPreviewOverlay

