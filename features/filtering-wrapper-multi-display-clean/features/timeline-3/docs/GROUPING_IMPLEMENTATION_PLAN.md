# Timeline Grouping Feature - Implementation Plan

## Overview

This document outlines the implementation plan for adding grouping functionality to the timeline component. The feature will allow items to be grouped by a specified key (e.g., `project_name`, `project_id`, `status`) with sticky header rows displaying the group name.

## Current Structure

### Data Flow
1. `timeline-wrapper.tsx` → `timeline-container.tsx` → `year-month-week-view.tsx` → `timeline-row.tsx`
2. Data format: `timelineData` is `MappedTimelineItem[][]` (array of arrays, grouped by unique ID)
3. Row rendering: Each sub-array becomes one `TimelineRow` in `year-month-week-view.tsx` (lines 285-322)

### Current Data Structure
- `timelineData`: `MappedTimelineItem[][]` - Array of arrays where each sub-array contains items with the same unique ID
- Each row in the timeline represents one group of items with the same ID

## Implementation Steps

### 1. Add `groupByKey` prop to `TimelineWrapper`

**File**: `timeline-wrapper.tsx`

```typescript
const TimelineWrapper = ({ 
  timelineData, 
  mappingKeys,
  views = ['Year', 'Month', 'Week', 'Day'],
  groupByKey, // NEW: e.g., 'project_name', 'project_id', 'status'
  onEventClick,
  onItemDrag,
  onItemResize
}: { 
  timelineData: any
  mappingKeys: any
  views?: string[]
  groupByKey?: string // NEW
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
})
```

### 2. Pass `groupByKey` to `TimelineContainer`

**File**: `timeline-wrapper.tsx` (line ~251)

```typescript
<TimelineContainer 
  ref={timelineRef}
  data={timelineData} 
  view={selectedView} 
  mappingKeys={mappingKeys}
  groupByKey={groupByKey} // NEW
  hourColumnWidth={effectiveHourColumnWidth}
  weekDayWidth={effectiveWeekDayWidth}
  monthDayWidth={effectiveMonthDayWidth}
  yearWeekWidth={effectiveYearWeekWidth}
  onEventClick={onEventClick}
  onItemDrag={onItemDrag}
  onItemResize={onItemResize}
/>
```

### 3. Add `groupByKey` prop to `TimelineContainer` interface

**File**: `timeline-container.tsx`

```typescript
interface TimelineContainerProps {
  data: any[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  mappingKeys: MappingKeys
  groupByKey?: string // NEW
  hourColumnWidth?: number
  weekDayWidth?: number
  monthDayWidth?: number
  yearWeekWidth?: number
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

### 4. Transform data in `timeline-container.tsx` to support grouping

**File**: `timeline-container.tsx`

#### Add new data structure:

```typescript
interface GroupedTimelineData {
  groupKey: string | null // The value to group by (e.g., "Project A", "Project B")
  items: MappedTimelineItem[][] // The actual timeline rows for this group
  isHeader: boolean // true for header rows, false for data rows
}

const [groupedTimelineData, setGroupedTimelineData] = useState<GroupedTimelineData[]>([])
```

#### Transform the data after mapping (around line 485):

```typescript
useEffect(() => {
  if (mappedData.length === 0) {
    setTimelineData([])
    setGroupedTimelineData([])
    return
  }
  
  // Apply horizontal filtering first (existing logic)
  let filteredData = mappedData
  // ... existing filtering logic ...
  
  // If groupByKey is provided, group the filtered data
  if (groupByKey) {
    // Group items by the specified key
    const groupMap = new Map<string | null, MappedTimelineItem[][]>()
    
    filteredData.forEach((itemGroup) => {
      // Get the group value from the first item in the group
      const firstItem = itemGroup[0]
      const groupValue = firstItem?.[groupByKey] || null
      
      if (!groupMap.has(groupValue)) {
        groupMap.set(groupValue, [])
      }
      groupMap.get(groupValue)!.push(itemGroup)
    })
    
    // Convert to array with header rows
    const grouped: GroupedTimelineData[] = []
    groupMap.forEach((items, groupKey) => {
      // Add header row
      grouped.push({
        groupKey,
        items: [],
        isHeader: true
      })
      // Add data rows
      items.forEach(itemGroup => {
        grouped.push({
          groupKey,
          items: [itemGroup],
          isHeader: false
        })
      })
    })
    
    setGroupedTimelineData(grouped)
    // Also update timelineData for backward compatibility (flatten grouped data)
    setTimelineData(grouped.filter(g => !g.isHeader).flatMap(g => g.items))
  } else {
    // No grouping - use original structure
    setGroupedTimelineData([])
    setTimelineData(filteredData)
  }
}, [mappedData, groupByKey, visibleYearsString, visibleDaysString, view, /* other deps */])
```

### 5. Create a Group Header Row component

**File**: `components/header-rows/group-header-row.tsx` (NEW FILE)

**Approach**: Render a full timeline row structure with cells in the background, and overlay the group label on top. The row index is reserved (no pills will be rendered in this row).

```typescript
"use client"

import React from 'react'
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
  mappingKeys
}: GroupHeaderRowProps) => {
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
        className="absolute inset-0 z-30 flex items-center px-4 font-semibold text-sm text-foreground pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(241, 241, 241, 0.95) 0%, rgba(241, 241, 241, 0.85) 50%, transparent 100%)',
        }}
      >
        <span className="sticky left-4 dark:bg-[#131313]/95 dark:px-2 dark:py-1 dark:rounded">
          {groupKey || 'No Group'}
        </span>
      </div>
    </div>
  )
}

export default GroupHeaderRow
```

**Key Points**:
- Uses `TimelineRow` with empty `timelineData` array to render the background cell structure
- Row index is reserved - no pills can be rendered in this row
- Label is overlaid on top with a gradient background for visibility
- Maintains visual consistency with the timeline grid structure

### 6. Modify `year-month-week-view.tsx` to render group headers

**File**: `components/main/year-month-week-view.tsx`

#### Update interface:

```typescript
interface YearMonthWeekViewProps {
  yearsInRange: number[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  yearWeekWidth: number
  monthDayWidth: number
  weekDayWidth: number
  totalTimelineWidth: number
  timelineData: MappedTimelineItem[][] // Array of arrays where each sub-array contains items with the same ID
  groupedTimelineData?: GroupedTimelineData[] // NEW
  groupByKey?: string // NEW
  mappingKeys: MappingKeys
  rowHeight: number
  cellStyle: any
  onResizeLeft?: (item: MappedTimelineItem, daysChange: number) => void
  onResizeRight?: (item: MappedTimelineItem, daysChange: number) => void
  onEventClick?: (eventId: string) => void
}
```

#### Update component signature:

```typescript
const YearMonthWeekView = ({ 
  yearsInRange, 
  view, 
  yearWeekWidth, 
  monthDayWidth, 
  weekDayWidth, 
  totalTimelineWidth,
  timelineData,
  groupedTimelineData, // NEW
  groupByKey, // NEW
  mappingKeys,
  rowHeight,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick
}: YearMonthWeekViewProps) => {
  // ... existing code ...
```

#### Add import:

```typescript
import GroupHeaderRow from '../header-rows/group-header-row'
```

#### Update row rendering logic (around line 285):

```typescript
{/* Row 4+: Timeline rows - unified grid with vertical virtualization */}
{(() => {
  // If grouping is enabled, use grouped data structure
  if (groupedTimelineData && groupedTimelineData.length > 0) {
    let currentRowIndex = 0
    const rowsToRender: JSX.Element[] = []
    
    groupedTimelineData.forEach((group, groupIndex) => {
            if (group.isHeader) {
              // Render background row with overlay label (only if visible)
              // Row index is reserved - no pills will render here
              if (visibleRowIndices.includes(currentRowIndex)) {
                rowsToRender.push(
                  <div
                    key={`group-header-${groupIndex}`}
                    style={{ 
                      position: 'absolute', 
                      top: `${currentRowIndex * rowHeight}px`, 
                      width: '100%',
                      zIndex: 10 // Lower than pills but above background
                    }}
                  >
                    <GroupHeaderRow
                      groupKey={group.groupKey}
                      yearsInRange={yearsInRange}
                      visibleYearsInRange={visibleYears}
                      view={view}
                      yearWeekWidth={yearWeekWidth}
                      monthDayWidth={monthDayWidth}
                      weekDayWidth={weekDayWidth}
                      calculatedCellWidth={calculatedCellWidth}
                      rowHeight={rowHeight}
                      totalTimelineWidth={totalTimelineWidth}
                      timelineIndex={currentRowIndex}
                      mappingKeys={mappingKeys}
                    />
                  </div>
                )
              }
              currentRowIndex++ // Row index is reserved - no pills will render here
      } else {
        // Render timeline rows for this group
        group.items.forEach((itemGroup) => {
          if (visibleRowIndices.includes(currentRowIndex)) {
            rowsToRender.push(
              <div
                key={`row-${currentRowIndex}`}
                style={{ 
                  position: 'absolute', 
                  top: `${currentRowIndex * rowHeight}px`, 
                  width: '100%' 
                }}
              >
                <TimelineRow 
                  yearsInRange={yearsInRange}
                  visibleYearsInRange={visibleYears}
                  view={view}
                  yearWeekWidth={yearWeekWidth}
                  monthDayWidth={monthDayWidth}
                  weekDayWidth={weekDayWidth}
                  cellWidth={calculatedCellWidth}
                  cellHeight={rowHeight}
                  timelineIndex={currentRowIndex}
                  timelineData={itemGroup}
                  mappingKeys={mappingKeys}
                  cellStyle={cellStyle}
                  onResizeLeft={onResizeLeft}
                  onResizeRight={onResizeRight}
                  onEventClick={onEventClick}
                />
              </div>
            )
          }
          currentRowIndex++
        })
      }
    })
    
    const totalRows = currentRowIndex
    return (
      <div style={{ height: `${totalRows * rowHeight}px`, position: 'relative' }}>
        {rowsToRender}
      </div>
    )
  } else {
    // Original rendering logic (no grouping)
    const totalRows = Math.max(MIN_ROWS, timelineData.length)
    const rowsToRender = timelineData.length >= MIN_ROWS 
      ? timelineData 
      : [...timelineData, ...Array(MIN_ROWS - timelineData.length).fill([])]
    
    const allVisibleIndices = visibleRowIndices.filter(i => i < totalRows)
    
    return (
      <div style={{ height: `${totalRows * rowHeight}px`, position: 'relative' }}>
        {allVisibleIndices.map(index => (
          <div 
            key={`row-${index}`} 
            style={{ position: 'absolute', top: `${index * rowHeight}px`, width: '100%' }}
          >
            <TimelineRow 
              yearsInRange={yearsInRange}
              visibleYearsInRange={visibleYears}
              view={view}
              yearWeekWidth={yearWeekWidth}
              monthDayWidth={monthDayWidth}
              weekDayWidth={weekDayWidth}
              cellWidth={calculatedCellWidth}
              cellHeight={rowHeight}
              timelineIndex={index}
              timelineData={rowsToRender[index] || []}
              mappingKeys={mappingKeys}
              cellStyle={cellStyle}
              onResizeLeft={onResizeLeft}
              onResizeRight={onResizeRight}
              onEventClick={onEventClick}
            />
          </div>
        ))}
      </div>
    )
  }
})()}
```

### 7. Update virtualization to account for header rows

**File**: `timeline-container.tsx`

Update the total rows calculation for virtualization:

```typescript
// Calculate total rows for vertical virtualization
// If grouping is enabled, include header rows in the count
const totalRowsForVirtualization = groupByKey && groupedTimelineData.length > 0
  ? groupedTimelineData.length // Includes header rows
  : Math.max(MIN_ROWS, timelineData.length)

const visibleRowsData = useVisibleRows({
  scrollTop,
  viewportHeight,
  rowHeight,
  totalRows: totalRowsForVirtualization,
  overscanCount: OVERSCAN_ROWS
})
```

### 8. Pass `groupedTimelineData` to `YearMonthWeekView`

**File**: `timeline-container.tsx` (around line 1037)

```typescript
<YearMonthWeekView 
  yearsInRange={yearsInRange}
  view={view}
  yearWeekWidth={yearWeekWidth}
  monthDayWidth={monthDayWidth}
  weekDayWidth={weekDayWidth}
  totalTimelineWidth={totalTimelineWidth}
  timelineData={timelineData}
  groupedTimelineData={groupedTimelineData} // NEW
  groupByKey={groupByKey} // NEW
  mappingKeys={mappingKeys}
  rowHeight={rowHeight}
  cellStyle={cellStyle}
  onResizeLeft={handleResizeLeft}
  onResizeRight={handleResizeRight}
  onEventClick={onEventClick}
/>
```

### 9. Update `filtering-wrapper.tsx` to pass `groupByKey`

**File**: `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

Update the `timelineConfig` interface and pass it through:

```typescript
interface TimelineConfig {
  mappingKeys: {
    startDateKey: string
    endDateKey: string
    titleKey: string
    typeKey?: string
    statusKey?: string
    uniqueIdKey?: string
  }
  views?: string[]
  groupByKey?: string // NEW
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

Then pass it to `TimelineWrapper`:

```typescript
<TimelineWrapper
  timelineData={data}
  mappingKeys={timelineConfig.mappingKeys}
  views={timelineConfig.views}
  groupByKey={timelineConfig.groupByKey} // NEW
  onEventClick={timelineConfig.onEventClick}
  onItemDrag={timelineConfig.onItemDrag}
  onItemResize={timelineConfig.onItemResize}
/>
```

### 10. Update `timelineConfig` in `tasks-2/page.tsx`

**File**: `app/(root)/tasks-2/page.tsx`

```typescript
const timelineConfig = useMemo(() => ({
  mappingKeys: {
    startDateKey: 'start_date',
    endDateKey: 'end_date',
    titleKey: 'title',
    typeKey: 'type',
    statusKey: 'status',
    uniqueIdKey: 'id'
  },
  views: ['Year', 'Month', 'Week'],
  groupByKey: 'project_name', // NEW: Group by project
  onEventClick: handleTimelineEventClick,
  onItemDrag: handleItemDrag,
  onItemResize: handleItemResize
}), [handleTimelineEventClick, handleItemDrag, handleItemResize])
```

## Key Considerations

### 1. Sticky Positioning
- Headers should be `sticky top-[72px]` (below the 3 header rows: Year, Month, Week/Day)
- Use `z-index: 20` to ensure headers stay above timeline items
- Headers should span the full width of the timeline

### 2. Virtualization
- Header rows must be included in row count calculations for proper virtualization
- When grouping is enabled, the total row count = number of groups + number of data rows
- Virtualization should still work efficiently with grouping enabled

### 3. Row Indices
- When grouping, row indices change (header rows take up indices)
- Ensure virtualization accounts for header rows in visible row calculations
- Timeline items should still reference correct row indices for positioning

### 4. Performance
- Grouping adds additional rows (one header per group)
- Ensure virtualization still works efficiently with many groups
- Consider memoization for grouped data transformations

### 5. Day View Support
- Apply the same grouping logic to `day-view.tsx` if needed
- Day view has different header structure (hours instead of weeks/days)
- Adjust sticky positioning for day view headers

### 6. Backward Compatibility
- When `groupByKey` is not provided, timeline should work exactly as before
- Maintain `timelineData` structure for components that don't use grouping
- Ensure existing functionality (drag, resize, click) still works with grouping

## Files to Modify

1. ✅ `timeline-wrapper.tsx` - Add `groupByKey` prop
2. ✅ `timeline-container.tsx` - Transform data for grouping, add state
3. ✅ `year-month-week-view.tsx` - Render group headers
4. ⚠️ `day-view.tsx` - (Optional) Add grouping support
5. ✅ `components/header-rows/group-header-row.tsx` - New component
6. ✅ `filtering-wrapper.tsx` - Pass `groupByKey` to timeline
7. ✅ `tasks-2/page.tsx` - Configure `groupByKey` in timeline config

## Testing Checklist

- [ ] Grouping works with `groupByKey` set
- [ ] Timeline works without `groupByKey` (backward compatibility)
- [ ] Sticky headers stay in place when scrolling
- [ ] Virtualization works correctly with grouping
- [ ] Drag and drop still works with grouped items
- [ ] Resize still works with grouped items
- [ ] Click events still work with grouped items
- [ ] Multiple groups display correctly
- [ ] Empty groups (null/undefined values) display correctly
- [ ] Performance is acceptable with many groups

## Example Usage

```typescript
// In tasks-2/page.tsx
const timelineConfig = useMemo(() => ({
  mappingKeys: {
    startDateKey: 'start_date',
    endDateKey: 'end_date',
    titleKey: 'title',
    typeKey: 'type',
    statusKey: 'status',
    uniqueIdKey: 'id'
  },
  views: ['Year', 'Month', 'Week'],
  groupByKey: 'project_name', // Group tasks by project
  onEventClick: handleTimelineEventClick,
  onItemDrag: handleItemDrag,
  onItemResize: handleItemResize
}), [handleTimelineEventClick, handleItemDrag, handleItemResize])
```

This will display:
- **Project A** (sticky header)
  - Task 1
  - Task 2
- **Project B** (sticky header)
  - Task 3
  - Task 4
- **No Project** (sticky header for null/undefined values)
  - Task 5
