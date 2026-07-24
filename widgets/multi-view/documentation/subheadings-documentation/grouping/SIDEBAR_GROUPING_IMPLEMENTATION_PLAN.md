# Timeline Sidebar Grouping Feature - Implementation Plan

## Overview

This document outlines the implementation plan for adding sidebar-style grouping to the timeline component. When `isGroupInline = false`, groups will be displayed in a sidebar on the left side of the timeline, with each group cell height matching the total height of its items. No rows are reserved in the timeline itself.

## Current Structure

### Inline Grouping (Existing)
- Groups are displayed as header rows within the timeline
- Header rows reserve row indices (no pills rendered in those rows)
- Groups are rendered inline with timeline data

### Sidebar Grouping (New)
- Groups are displayed in a sidebar on the left
- Each group cell height = number of items in group × rowHeight
- No rows are reserved in the timeline
- Groups align vertically with their items

## Implementation Steps

### 1. Add `isGroupInline` prop to `TimelineWrapper`

**File**: `timeline-wrapper.tsx`

```typescript
const TimelineWrapper = ({ 
  timelineData, 
  mappingKeys,
  views = ['Year', 'Month', 'Week', 'Day'],
  groupByKey,
  isGroupInline = true, // NEW: default true for backward compatibility
  onEventClick,
  onItemDrag,
  onItemResize
}: { 
  timelineData: any
  mappingKeys: any
  views?: string[]
  groupByKey?: string
  isGroupInline?: boolean // NEW: true = inline headers, false = sidebar
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
})
```

### 2. Pass `isGroupInline` to `TimelineContainer`

**File**: `timeline-wrapper.tsx` (around line 252)

```typescript
<TimelineContainer 
  ref={timelineRef}
  data={timelineData} 
  view={selectedView} 
  mappingKeys={mappingKeys}
  groupByKey={groupByKey}
  isGroupInline={isGroupInline} // NEW
  hourColumnWidth={effectiveHourColumnWidth}
  weekDayWidth={effectiveWeekDayWidth}
  monthDayWidth={effectiveMonthDayWidth}
  yearWeekWidth={effectiveYearWeekWidth}
  onEventClick={onEventClick}
  onItemDrag={onItemDrag}
  onItemResize={onItemResize}
/>
```

### 3. Update `TimelineContainer` interface and add sidebar grouping logic

**File**: `timeline-container.tsx`

#### Update interface:

```typescript
interface TimelineContainerProps {
  data: any[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  mappingKeys: MappingKeys
  groupByKey?: string
  isGroupInline?: boolean // NEW
  hourColumnWidth?: number
  weekDayWidth?: number
  monthDayWidth?: number
  yearWeekWidth?: number
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

#### Add group sidebar data structure:

```typescript
// Group metadata for sidebar mode
export interface GroupSidebarInfo {
  groupKey: string | null // The value to group by (e.g., "Project A", "Project B")
  startRowIndex: number // First row index for this group
  itemCount: number // Number of items (rows) in this group
  height: number // Total height: itemCount * rowHeight
}

const [groupSidebarData, setGroupSidebarData] = useState<GroupSidebarInfo[]>([])
```

#### Update grouping logic in useEffect (around line 496):

```typescript
useEffect(() => {
  if (mappedData.length === 0) {
    setTimelineData([])
    setGroupedTimelineData([])
    setGroupSidebarData([])
    return
  }
  
  // ... existing filtering logic ...
  
  // If groupByKey is provided, group the filtered data
  if (groupByKey) {
    const groupMap = new Map<string | null, MappedTimelineItem[][]>()
    
    filteredData.forEach((itemGroup) => {
      const firstItem = itemGroup[0]
      const groupValue = firstItem?.[groupByKey] || null
      
      if (!groupMap.has(groupValue)) {
        groupMap.set(groupValue, [])
      }
      groupMap.get(groupValue)!.push(itemGroup)
    })
    
    if (isGroupInline) {
      // Inline grouping: create header rows
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
      setGroupSidebarData([])
      setTimelineData(grouped.filter(g => !g.isHeader).flatMap(g => g.items))
    } else {
      // Sidebar grouping: calculate group metadata, no header rows
      const sidebarGroups: GroupSidebarInfo[] = []
      let currentRowIndex = 0
      
      groupMap.forEach((items, groupKey) => {
        const itemCount = items.length
        sidebarGroups.push({
          groupKey,
          startRowIndex: currentRowIndex,
          itemCount,
          height: itemCount * rowHeight
        })
        currentRowIndex += itemCount
      })
      
      setGroupSidebarData(sidebarGroups)
      setGroupedTimelineData([]) // No inline headers
      // Flatten all items for timeline (no header rows)
      setTimelineData(filteredData)
    }
  } else {
    // No grouping
    setGroupedTimelineData([])
    setGroupSidebarData([])
    setTimelineData(filteredData)
  }
}, [mappedData, groupByKey, isGroupInline, visibleYearsString, visibleDaysString, view, rowHeight, /* other deps */])
```

### 4. Pass `groupSidebarData` to `YearMonthWeekView`

**File**: `timeline-container.tsx` (around line 1102)

```typescript
<YearMonthWeekView 
  yearsInRange={yearsInRange}
  view={view}
  yearWeekWidth={yearWeekWidth}
  monthDayWidth={monthDayWidth}
  weekDayWidth={weekDayWidth}
  totalTimelineWidth={totalTimelineWidth}
  timelineData={timelineData}
  groupedTimelineData={groupedTimelineData}
  groupByKey={groupByKey}
  isGroupInline={isGroupInline} // NEW
  groupSidebarData={groupSidebarData} // NEW
  mappingKeys={mappingKeys}
  rowHeight={rowHeight}
  cellStyle={cellStyle}
  onResizeLeft={handleResizeLeft}
  onResizeRight={handleResizeRight}
  onEventClick={onEventClick}
/>
```

### 5. Create GroupSidebar component

**File**: `components/grouping/group-sidebar.tsx` (NEW FILE)

```typescript
"use client"

import React from 'react'

export interface GroupSidebarInfo {
  groupKey: string | null
  startRowIndex: number
  itemCount: number
  height: number
}

interface GroupSidebarProps {
  groups: GroupSidebarInfo[]
  rowHeight: number
  groupByKey?: string // NEW: The field name used for grouping
  headerRowsHeight?: number // NEW: Total height of timeline header rows
  onGroupClick?: (groupKey: string | null) => void
}

const GroupSidebar = ({ groups, rowHeight, groupByKey, headerRowsHeight = 0, onGroupClick }: GroupSidebarProps) => {
  // Format groupByKey for display (e.g., "project_name" -> "Project Name")
  const formatGroupByKey = (key?: string): string => {
    if (!key) return ''
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="flex flex-col border-r border-border/60 bg-[#f1f1f1] dark:bg-[#131313] sticky left-0 z-40 min-w-[200px]">
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
      {groups.map((group, index) => (
        <div
          key={`sidebar-group-${index}`}
          className="flex items-start justify-start px-4 pt-2 font-semibold text-sm text-foreground border-b border-border/60 hover:bg-foreground/5 dark:hover:bg-foreground/10 cursor-pointer transition-colors"
          style={{
            height: `${group.height}px`,
            minHeight: `${rowHeight}px`
          }}
          onClick={() => onGroupClick?.(group.groupKey)}
          title={`${group.itemCount} item${group.itemCount !== 1 ? 's' : ''}`}
        >
          <span className="truncate">{group.groupKey || 'No Group'}</span>
        </div>
      ))}
    </div>
  )
}

export default GroupSidebar
```

### 6. Update `YearMonthWeekView` to support sidebar grouping

**File**: `components/main/year-month-week-view.tsx`

**Important**: The sidebar is NOT rendered inside `YearMonthWeekView`. It is rendered at the `timeline-container.tsx` level (see step 7). `YearMonthWeekView` only needs to know about sidebar mode to render timeline rows normally (without inline headers).

#### Update interface:

```typescript
import { GroupSidebarInfo } from '../../timeline-container'

interface YearMonthWeekViewProps {
  yearsInRange: number[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  yearWeekWidth: number
  monthDayWidth: number
  weekDayWidth: number
  totalTimelineWidth: number
  timelineData: MappedTimelineItem[][]
  groupedTimelineData?: GroupedTimelineData[]
  groupByKey?: string
  isGroupInline?: boolean // NEW
  groupSidebarData?: GroupSidebarInfo[] // NEW (used to detect sidebar mode, not for rendering)
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
  groupedTimelineData,
  groupByKey,
  isGroupInline, // NEW
  groupSidebarData, // NEW (used to detect sidebar mode)
  mappingKeys,
  rowHeight,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick
}: YearMonthWeekViewProps) => {
  // ... existing code ...
```

#### Update row rendering logic:

**Note**: The sidebar is now rendered at the `timeline-container.tsx` level (see step 7), not inside `YearMonthWeekView`. When in sidebar mode, `YearMonthWeekView` simply renders timeline rows normally without the sidebar.

```typescript
{/* Row 4+: Timeline rows - unified grid with vertical virtualization */}
{(() => {
  // If grouping is enabled, use grouped data structure
  if (groupedTimelineData && groupedTimelineData.length > 0 && isGroupInline) {
    // Existing inline grouping logic (with header rows)
    // ... current implementation ...
  } else if (groupSidebarData && groupSidebarData.length > 0 && !isGroupInline) {
    // Sidebar grouping: render timeline rows normally (no header rows, sidebar is rendered at container level)
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
  } else {
    // Original rendering logic (no grouping)
    // ... existing non-grouping rendering ...
  }
})()}
```

### 7. Restructure layout to keep sidebar outside horizontal scroll boundary

**Critical**: The sidebar must be outside the `VirtualizedTimelineContainer` which handles horizontal scrolling. The sidebar should:
- Stay fixed on the left (no horizontal scroll)
- Scroll vertically with the timeline content
- Have its header aligned with timeline headers

**Solution**: Render the sidebar at the `timeline-container.tsx` level as a sibling of `VirtualizedTimelineContainer`, not inside `YearMonthWeekView`. This ensures proper scroll boundaries and alignment.

**File**: `timeline-container.tsx` (around line 1080)

#### Current Structure:
```
<div className='w-full h-full border...'>
  <VirtualizedTimelineContainer>  <!-- Handles both horizontal & vertical scroll -->
    <YearMonthWeekView />
  </VirtualizedTimelineContainer>
</div>
```

#### New Structure for Sidebar Mode:
```
<div className='w-full h-full border...'>
  <div className="flex w-full h-full">  <!-- Flex container -->
    {/* Sidebar - outside scroll container, sticky left */}
    {!isGroupInline && groupSidebarData && (
      <GroupSidebar ... />
    )}
    
    {/* Timeline - inside scroll container, scrolls horizontally */}
    <div className="flex-1 overflow-hidden">
      <VirtualizedTimelineContainer>  <!-- Only timeline scrolls horizontally -->
        <YearMonthWeekView />
      </VirtualizedTimelineContainer>
    </div>
  </div>
</div>
```

#### Implementation:

**Note**: The sidebar is rendered at the `timeline-container.tsx` level, outside the `VirtualizedTimelineContainer`. This ensures it stays fixed on the left during horizontal scrolling while scrolling vertically with the timeline content.

```typescript
// timeline-container.tsx - around line 1119
<div className='w-full h-full border border-border/50 rounded-lg m-4 overflow-hidden'>
  {/* Flex container: sidebar + timeline */}
  <div className="flex w-full h-full">
    {/* Sidebar - outside horizontal scroll boundary */}
    {!isGroupInline && groupByKey && groupSidebarData && groupSidebarData.length > 0 && (
      (() => {
        // Calculate total height of timeline header rows
        // Year view: 3 rows (Year, Month, Week) = 3 * 24px = 72px
        // Month/Week view: 2 rows (Year, Month) = 2 * 24px = 48px
        // Day view: different structure
        const headerRowsHeight = view === 'Year' 
          ? 72 // 3 rows * 24px
          : view === 'Month' || view === 'Week'
            ? 48 // 2 rows * 24px
            : 0 // Day view handled separately
        
        return (
      <GroupSidebar 
        groups={groupSidebarData}
        rowHeight={rowHeight}
        groupByKey={groupByKey}
        headerRowsHeight={headerRowsHeight}
      />
        )
      })()
    )}
    
    {/* Timeline container - scrolls horizontally */}
    <div className="flex-1 overflow-hidden">
      <VirtualizedTimelineContainer 
        ref={scrollContainerRef}
        totalWidth={totalTimelineWidth}
        onScroll={handleScroll}
      >
        {view === 'Day' ? (
          <DayView 
            // ... props
          />
        ) : (
          <YearMonthWeekView 
            // ... props (sidebar is NOT rendered here, it's at container level)
            groupedTimelineData={groupedTimelineData}
            groupByKey={groupByKey}
            isGroupInline={isGroupInline}
            groupSidebarData={groupSidebarData}
            // ... other props
          />
        )}
      </VirtualizedTimelineContainer>
    </div>
  </div>
</div>
```

#### Vertical Scrolling Behavior:

**Current Implementation**: The sidebar and timeline both scroll vertically together because they are siblings in a flex container, and the `VirtualizedTimelineContainer` handles both horizontal and vertical scrolling. The sidebar's `sticky left-0` positioning keeps it fixed on the left during horizontal scrolling.

**Key Points**:
- Sidebar is outside `VirtualizedTimelineContainer` (horizontal scroll boundary)
- Sidebar scrolls vertically with timeline content (both are inside the same scroll context)
- Sidebar stays fixed on left during horizontal scroll (via `sticky left-0`)
- Sidebar header aligns with timeline headers (via `headerRowsHeight` calculation)

**Note**: The `VirtualizedTimelineContainer` continues to handle both horizontal and vertical scrolling. The sidebar, being a sibling outside this container, naturally scrolls vertically with the timeline content while remaining fixed horizontally.

### 8. Update virtualization to account for sidebar mode

**File**: `timeline-container.tsx`

The virtualization calculation should remain the same for sidebar mode since no rows are reserved:

```typescript
// Calculate visible rows for vertical virtualization
// For sidebar mode, no header rows are included
const totalRowsForVirtualization = groupByKey && !isGroupInline && groupSidebarData.length > 0
  ? timelineData.length // No header rows in sidebar mode
  : groupByKey && isGroupInline && groupedTimelineData.length > 0
    ? groupedTimelineData.length // Includes header rows in inline mode
    : Math.max(MIN_ROWS, timelineData.length)

const visibleRowsData = useVisibleRows({
  scrollTop,
  viewportHeight,
  rowHeight,
  totalRows: totalRowsForVirtualization,
  overscanCount: OVERSCAN_ROWS
})
```

### 9. Update `filtering-wrapper.tsx` to pass `isGroupInline`

**File**: `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

#### Update interface:

```typescript
timelineConfig?: {
  mappingKeys: {
    startDateKey: string
    endDateKey: string
    titleKey?: string
    typeKey?: string
    statusKey?: string
    uniqueIdKey?: string
  }
  views?: string[]
  groupByKey?: string
  isGroupInline?: boolean // NEW: true = inline headers, false = sidebar
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

#### Pass to TimelineWrapper:

```typescript
<TimelineWrapper
  timelineData={data}
  mappingKeys={timelineConfig.mappingKeys}
  views={timelineConfig.views}
  groupByKey={timelineConfig.groupByKey}
  isGroupInline={timelineConfig.isGroupInline} // NEW
  onEventClick={timelineConfig.onEventClick}
  onItemDrag={timelineConfig.onItemDrag}
  onItemResize={timelineConfig.onItemResize}
/>
```

### 10. Update `tasks-2/page.tsx` to configure `isGroupInline`

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
  groupByKey: 'project_name',
  isGroupInline: false, // NEW: Use sidebar grouping
  onEventClick: handleTimelineEventClick,
  onItemDrag: handleItemDrag,
  onItemResize: handleItemResize
}), [handleTimelineEventClick, handleItemDrag, handleItemResize])
```

## Key Considerations

### 1. Row Alignment
- Sidebar groups must align perfectly with timeline rows
- Each group's `startRowIndex` must match the first row of its items
- Group height = `itemCount × rowHeight` ensures perfect alignment

### 2. Scrolling Synchronization
- Sidebar should scroll vertically with the timeline
- Sidebar should be sticky horizontally (stays on left while timeline scrolls)
- Consider using the same scroll container or synchronizing scroll events

### 3. Performance
- Sidebar rendering is lightweight (just labels)
- No performance impact on timeline rendering
- Virtualization still works normally (no reserved rows)

### 4. Visual Design
- Sidebar width: ~200px (configurable)
- Background: Match timeline header colors
- Hover effects: Subtle background change
- Border: Right border to separate from timeline

### 5. Responsive Behavior
- On small screens, consider hiding sidebar or making it collapsible
- Sidebar can be toggled on/off if needed

### 6. Backward Compatibility
- Default `isGroupInline = true` maintains existing behavior
- When `isGroupInline` is not provided, uses inline grouping
- Existing code continues to work without changes

## Files to Create/Modify

1. ✅ `components/grouping/group-sidebar.tsx` - New component
2. ✅ `timeline-wrapper.tsx` - Add `isGroupInline` prop and pass to container
3. ✅ `timeline-container.tsx` - Add `isGroupInline` prop, calculate group metadata, render sidebar at container level
4. ✅ `year-month-week-view.tsx` - Support sidebar mode (detect mode, render timeline rows normally)
5. ✅ `filtering-wrapper.tsx` - Add `isGroupInline` to timelineConfig
6. ✅ `tasks-2/page.tsx` - Configure `isGroupInline` in timeline config

## Implementation Notes

### Sidebar Rendering Location

**Important Change**: The sidebar is rendered at the `timeline-container.tsx` level, not inside `YearMonthWeekView`. This ensures:
- Sidebar is outside the horizontal scroll boundary
- Sidebar scrolls vertically with timeline content
- Sidebar stays fixed on left during horizontal scroll
- Proper alignment between sidebar groups and timeline rows

### Text Alignment

The sidebar group text is aligned to the top of each cell using:
- `items-start` instead of `items-center` for vertical alignment
- `pt-2` for padding from the top edge

This ensures group labels align with the top of their corresponding timeline rows.

## Testing Checklist

- [ ] Sidebar groups align correctly with timeline rows
- [ ] Group heights match item counts × rowHeight
- [ ] No rows are reserved in sidebar mode
- [ ] Sidebar scrolls with timeline vertically
- [ ] Sidebar stays sticky on left during horizontal scroll
- [ ] Inline grouping still works when `isGroupInline = true`
- [ ] Backward compatibility maintained (default behavior)
- [ ] Performance is acceptable with many groups
- [ ] Dark mode styling works correctly
- [ ] Hover effects work on sidebar groups

## Example Usage

```typescript
// Inline grouping (default)
const timelineConfig = {
  groupByKey: 'project_name',
  isGroupInline: true, // or omit (defaults to true)
  // ... other config
}

// Sidebar grouping
const timelineConfig = {
  groupByKey: 'project_name',
  isGroupInline: false, // Use sidebar
  // ... other config
}
```

## Visual Layout

### Inline Grouping (`isGroupInline = true`)
```
┌─────────────────────────────────────┐
│ Timeline Headers                     │
├─────────────────────────────────────┤
│ Project A (header row)              │
│ └─ Task 1 (pill)                    │
│ └─ Task 2 (pill)                    │
│ Project B (header row)              │
│ └─ Task 3 (pill)                    │
└─────────────────────────────────────┘
```

### Sidebar Grouping (`isGroupInline = false`)
```
┌──────────────┬──────────────────────┐
│ Grouped by   │ Timeline Headers      │
│ Project Name ├──────────────────────┤
├──────────────┤                      │
│ Project A    │ Task 1 (pill)        │
│              │ Task 2 (pill)        │
├──────────────┤                      │
│ Project B    │ Task 3 (pill)        │
│              │                      │
└──────────────┴──────────────────────┘
```

**Sidebar Header Cell**:
- Aligned with timeline header rows
- Shows "Grouped by" label (small, uppercase)
- Shows formatted group key name (e.g., "Project Name")
- Height matches total timeline header rows height
- Styled to match timeline header background

### Scroll Boundaries

**Layout Structure**:
```
┌─────────────────────────────────────────────────────┐
│ Parent Container (overflow-y-auto, overflow-x-hidden)│
│ ┌──────────────┬───────────────────────────────────┐ │
│ │ Sidebar      │ Timeline Container                 │ │
│ │ (fixed width)│ (flex-1, overflow-x-auto)         │ │
│ │              │ ┌───────────────────────────────┐ │ │
│ │ No horizontal│ │ VirtualizedTimelineContainer │ │ │
│ │ scroll       │ │ (horizontal scroll only)     │ │ │
│ │              │ └───────────────────────────────┘ │ │
│ │ Scrolls      │ Scrolls horizontally             │ │
│ │ vertically   │ Scrolls vertically with parent   │ │
│ │ with parent  │                                   │ │
│ └──────────────┴───────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key Points**:
- Sidebar is **outside** `VirtualizedTimelineContainer` (horizontal scroll boundary)
- Parent container handles **vertical scrolling** for both sidebar and timeline
- Only timeline scrolls **horizontally** (inside `VirtualizedTimelineContainer`)
- Sidebar stays **fixed on left** during horizontal scroll
- Both scroll **vertically together** via parent container

## Benefits of Sidebar Grouping

1. **No Reserved Rows**: All timeline rows are available for items
2. **Better Space Usage**: Sidebar doesn't take up timeline space
3. **Clear Visual Separation**: Groups are clearly separated from timeline
4. **Scalable**: Works well with many groups
5. **Flexible**: Can add features like group collapse/expand later
