# Unified Event on Collapse Feature - Implementation Plan

## Overview

This feature adds the ability to show a unified event when a group is collapsed in sidebar mode (`isGroupInline: false`). Instead of showing an empty row, the collapsed group displays a single event that spans from the earliest start date to the latest end date of all items within that group.

## Requirements

1. **Configurable**: Controlled via `showUnifiedEventOnCollapse` prop in timeline config (default: `true`)
2. **Scope**: Only applies to sidebar mode (`isGroupInline: false`)
3. **Unified Event**: 
   - Start date = earliest `start_date` from all items in the group
   - End date = latest `end_date` from all items in the group
   - Single event rendered in the timeline
   - **Display**: Shows date range format instead of title (e.g., "01/15/2024 - 03/20/2024 (5 items)")
4. **Backward Compatibility**: Default behavior is to show unified event (can be disabled via prop)

## Implementation Steps

### Step 1: Add Prop to `filtering-wrapper.tsx`

**File**: `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

#### Update `timelineConfig` interface:

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
  isGroupInline?: boolean
  showUnifiedEventOnCollapse?: boolean // NEW: default true, show unified event when collapsed
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

#### Pass prop to `TimelineWrapper`:

```typescript
{isTimelineView && (
  <TimelineWrapper
    timelineData={data}
    mappingKeys={timelineConfig.mappingKeys}
    views={timelineConfig.views}
    groupByKey={timelineConfig.groupByKey}
    isGroupInline={timelineConfig.isGroupInline}
    showUnifiedEventOnCollapse={timelineConfig.showUnifiedEventOnCollapse} // NEW
    onEventClick={timelineConfig.onEventClick}
    onItemDrag={timelineConfig.onItemDrag}
    onItemResize={timelineConfig.onItemResize}
  />
)}
```

### Step 2: Update `TimelineWrapper` Interface and Pass Prop

**File**: `components/filtering-wrapper-multi-display/features/timeline-3/timeline-wrapper.tsx`

#### Update component signature:

```typescript
const TimelineWrapper = ({ 
  timelineData, 
  mappingKeys,
  views = ['Year', 'Month', 'Week', 'Day'],
  groupByKey,
  isGroupInline = true,
  showUnifiedEventOnCollapse = true, // NEW: default true
  onEventClick,
  onItemDrag,
  onItemResize
}: { 
  timelineData: any
  mappingKeys: any
  views?: string[]
  groupByKey?: string
  isGroupInline?: boolean
  showUnifiedEventOnCollapse?: boolean // NEW
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
})
```

#### Pass prop to `TimelineContainer`:

```typescript
<TimelineContainer 
  ref={timelineRef}
  data={timelineData} 
  view={selectedView} 
  mappingKeys={mappingKeys}
  groupByKey={groupByKey}
  isGroupInline={isGroupInline}
  showUnifiedEventOnCollapse={showUnifiedEventOnCollapse} // NEW
  hourColumnWidth={effectiveHourColumnWidth}
  weekDayWidth={effectiveWeekDayWidth}
  monthDayWidth={effectiveMonthDayWidth}
  yearWeekWidth={effectiveYearWeekWidth}
  onEventClick={onEventClick}
  onItemDrag={onItemDrag}
  onItemResize={onItemResize}
/>
```

### Step 3: Update `TimelineContainer` Interface

**File**: `components/filtering-wrapper-multi-display/features/timeline-3/timeline-container.tsx`

#### Update `TimelineContainerProps` interface:

```typescript
interface TimelineContainerProps {
  data: any[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  mappingKeys: MappingKeys
  groupByKey?: string
  isGroupInline?: boolean
  showUnifiedEventOnCollapse?: boolean // NEW
  hourColumnWidth?: number
  weekDayWidth?: number
  monthDayWidth?: number
  yearWeekWidth?: number
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

#### Update component signature:

```typescript
const TimelineContainer = forwardRef<TimelineContainerRef, TimelineContainerProps>(
  ({ 
    data, 
    view, 
    mappingKeys, 
    groupByKey, 
    isGroupInline = true,
    showUnifiedEventOnCollapse = true, // NEW: default true
    hourColumnWidth: hourWidthProp,
    weekDayWidth: weekWidthProp,
    monthDayWidth: monthWidthProp,
    yearWeekWidth: yearWeekWidthProp,
    onEventClick,
    onItemDrag,
    onItemResize
  }, ref) => {
    // ... existing code ...
  }
)
```

### Step 4: Implement Unified Event Creation Logic

**File**: `components/filtering-wrapper-multi-display/features/timeline-3/timeline-container.tsx`

#### Update sidebar grouping logic (around line 671-697):

```typescript
groupMap.forEach((items, groupKey) => {
  const isCollapsed = collapsedGroups.has(groupKey)
  const originalItemCount = items.length
  let displayItemCount: number
  let groupData: MappedTimelineItem[][]
  
  if (isCollapsed) {
    if (showUnifiedEventOnCollapse && items.length > 0) {
      // Create unified event from earliest start to latest end
      // Flatten all items from all item groups in this group
      const allItems = items.flat()
      
      // Find earliest start date and latest end date
      const allStartDates = allItems.map(item => item.mapping.startDate)
      const allEndDates = allItems.map(item => item.mapping.endDate)
      
      const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())))
      const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())))
      
      // Use the first item as a template for the unified event
      const firstItem = allItems[0]
      
      // Create unified item with merged date range
      const unifiedItem: MappedTimelineItem = {
        ...firstItem,
        // Override with unified dates (keep as Date objects for mapping)
        [mappingKeys.startDateKey]: earliestStart.toISOString(),
        [mappingKeys.endDateKey]: latestEnd.toISOString(),
        // Update mapping metadata
        mapping: {
          ...firstItem.mapping,
          startDate: earliestStart,
          endDate: latestEnd,
          startCellId: `${currentRowIndex}:${earliestStart.getFullYear()}:${earliestStart.getMonth() + 1}:${earliestStart.getDate()}`,
          endCellId: `${currentRowIndex}:${latestEnd.getFullYear()}:${latestEnd.getMonth() + 1}:${latestEnd.getDate()}`,
          timelineIndex: currentRowIndex
        },
        // Add metadata to identify this as a unified collapsed event
        _isUnifiedCollapsedEvent: true,
        _originalItemCount: originalItemCount
        // Title is not modified - will be replaced with date range in draggable component
      }
      
      groupData = [[unifiedItem]] // Single unified event in array format
      displayItemCount = 1
    } else {
      // Original behavior: empty row (when showUnifiedEventOnCollapse is false)
      groupData = []
      displayItemCount = 1
    }
  } else {
    // Expanded: show all items
    groupData = items
    displayItemCount = originalItemCount
  }
  
  const displayHeight = displayItemCount * rowHeight
  
  sidebarGroups.push({
    groupKey,
    startRowIndex: currentRowIndex,
    itemCount: originalItemCount, // Keep original count for display/tooltip
    height: displayHeight
  })
  
  // Add the group data (unified event or all items or empty)
  filteredTimelineData.push(...groupData)
  
  currentRowIndex += displayItemCount
})
```

### Step 5: Add `showUnifiedEventOnCollapse` to useEffect Dependencies

**File**: `components/filtering-wrapper-multi-display/features/timeline-3/timeline-container.tsx`

#### Update useEffect dependency array (around line 706):

```typescript
}, [
  mappedData, 
  view, 
  visibleYearsString, 
  visibleDaysString, 
  scrollOffset, 
  viewportWidth, 
  mappingKeys, 
  visibleYearsData.visibleYears, 
  visibleDaysData.visibleDays, 
  visibleYearsData.yearPositions, 
  yearsInRange.length, 
  daysInRange.length, 
  groupByKey, 
  isGroupInline, 
  rowHeight, 
  collapsedGroups,
  showUnifiedEventOnCollapse // NEW: Add to dependencies
])
```

### Step 6: Update Draggable Components to Show Date Range

**File**: `components/filtering-wrapper-multi-display/features/timeline-3/components/dnd/draggable-timeline-item.tsx`

#### Add date range display for unified events:

```typescript
const DraggableTimelineItem = ({ item, mappingKeys, ... }: DraggableTimelineItemProps) => {
  // Check if this is a unified collapsed event
  const isUnifiedEvent = item._isUnifiedCollapsedEvent === true
  
  // Format date for display (MM/DD/YYYY)
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }
  
  // Get display text: date range for unified events, title for regular events
  const displayText = isUnifiedEvent && item._originalItemCount
    ? `${formatDate(item.mapping.startDate)} - ${formatDate(item.mapping.endDate)} (${item._originalItemCount} items)`
    : item[mappingKeys.titleKey] || ''
  
  // Use displayText instead of item[mappingKeys.titleKey] throughout the component
  // ... rest of component uses displayText ...
}
```

**File**: `components/filtering-wrapper-multi-display/features/timeline-3/components/dnd/draggable-timeline-item-day.tsx`

#### Add date range display with time for day view:

```typescript
// Format date for display (MM/DD/YYYY HH:MM AM/PM for day view)
const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  const ampm = hours24 >= 12 ? 'PM' : 'AM'
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`
}

// Get display text: date range for unified events, title for regular events
const displayText = isUnifiedEvent && item._originalItemCount
  ? `${formatDate(item.mapping.startDate)} - ${formatDate(item.mapping.endDate)} (${item._originalItemCount} items)`
  : item[mappingKeys.titleKey] || ''
```

## Data Flow

### When Group is Collapsed with `showUnifiedEventOnCollapse: true`:

1. **User clicks chevron** → `onGroupToggle` called
2. **State updated** → `collapsedGroups` Set modified
3. **useEffect triggered** → Grouping logic recalculates
4. **Unified event created**:
   - Extract all items from the group
   - Find `earliestStart = min(all start dates)`
   - Find `latestEnd = max(all end dates)`
   - Create single `MappedTimelineItem` with merged date range
5. **Timeline re-rendered** → Single unified event displayed spanning the full range

### When Group is Collapsed with `showUnifiedEventOnCollapse: false`:

1. **User clicks chevron** → `onGroupToggle` called
2. **State updated** → `collapsedGroups` Set modified
3. **useEffect triggered** → Grouping logic recalculates
4. **Empty row created** → `filteredTimelineData.push([])`
5. **Timeline re-rendered** → Empty row displayed (original behavior)

## Key Considerations

1. **Date Handling**: Unified event uses Date objects for mapping calculations, but stores ISO strings in the original date keys
2. **Mapping Metadata**: Must update `mapping.startDate`, `mapping.endDate`, `mapping.startCellId`, `mapping.endCellId`, and `mapping.timelineIndex`
3. **Template Item**: Uses first item as template to preserve other properties (type, status, etc.) - title is NOT preserved
4. **Display Text**: Unified events show date range format instead of title:
   - Year/Month/Week: `MM/DD/YYYY - MM/DD/YYYY (X items)`
   - Day view: `MM/DD/YYYY HH:MM AM/PM - MM/DD/YYYY HH:MM AM/PM (X items)`
5. **Item Count**: Stores original count in `_originalItemCount` for display in date range text
6. **Title Replacement**: Title is completely replaced with date range - original title is not shown
7. **Performance**: Calculating min/max dates is O(n) where n is items in group - acceptable for typical group sizes
8. **Edge Cases**: 
   - Empty groups: No unified event created (no items to unify)
   - Single item groups: Unified event shows date range of that single item
   - Invalid dates: Should handle gracefully (filter out invalid dates before min/max)

## Files to Modify

1. ✅ `components/filtering-wrapper-multi-display/filtering-wrapper.tsx` - Add prop to timelineConfig interface and pass to TimelineWrapper
2. ✅ `components/filtering-wrapper-multi-display/features/timeline-3/timeline-wrapper.tsx` - Add prop to interface and pass to TimelineContainer
3. ✅ `components/filtering-wrapper-multi-display/features/timeline-3/timeline-container.tsx` - Add prop, implement unified event creation logic
4. ✅ `components/filtering-wrapper-multi-display/features/timeline-3/components/dnd/draggable-timeline-item.tsx` - Update to show date range instead of title for unified events
5. ✅ `components/filtering-wrapper-multi-display/features/timeline-3/components/dnd/draggable-timeline-item-day.tsx` - Update to show date range with time instead of title for unified events

## Testing Checklist

- [ ] Unified event appears when group is collapsed (sidebar mode)
- [ ] Unified event spans from earliest start to latest end date
- [ ] Unified event shows correct date range visually
- [ ] Setting `showUnifiedEventOnCollapse: false` shows empty row (original behavior)
- [ ] Setting `showUnifiedEventOnCollapse: true` shows unified event (new behavior)
- [ ] Unified event works in all views (Year, Month, Week)
- [ ] Unified event shows date range format instead of title (e.g., "01/15/2024 - 03/20/2024 (5 items)")
- [ ] Unified event in day view shows time (e.g., "01/15/2024 09:00 AM - 03/20/2024 05:00 PM (5 items)")
- [ ] Unified event preserves other properties from first item (type, status, etc.)
- [ ] Collapse/expand toggle works correctly with unified events
- [ ] Multiple groups can be collapsed simultaneously
- [ ] Empty groups don't create unified events
- [ ] Single item groups work correctly
- [ ] Unified events are draggable (if drag is enabled)
- [ ] Unified events are clickable (if click handler is provided)

## Example Usage

```typescript
// Show unified events when collapsed (default)
const timelineConfig = {
  mappingKeys: {
    startDateKey: 'start_date',
    endDateKey: 'end_date',
    titleKey: 'title',
    uniqueIdKey: 'id'
  },
  groupByKey: 'project_name',
  isGroupInline: false,
  showUnifiedEventOnCollapse: true, // or omit (defaults to true)
  // ... other config
}

// Show empty rows when collapsed (original behavior)
const timelineConfig = {
  // ... same as above ...
  showUnifiedEventOnCollapse: false, // Disable unified events
}
```

## Visual Result

### Before (Empty Row):
```
┌──────────────┬──────────────────────┐
│ Grouped by   │ Timeline Headers      │
│ Project Name ├──────────────────────┤
├──────────────┤                      │
│ Project A    │ [empty row]          │ ← Collapsed, no events
├──────────────┤                      │
│ Project B    │ Task 1 (pill)        │
│              │ Task 2 (pill)        │
└──────────────┴──────────────────────┘
```

### After (Unified Event):
```
┌──────────────┬──────────────────────┐
│ Grouped by   │ Timeline Headers      │
│ Project Name ├──────────────────────┤
├──────────────┤                      │
│ Project A    │ [01/15 - 03/20 (5)]  │ ← Unified event showing date range
├──────────────┤                      │
│ Project B    │ Task 1 (pill)        │
│              │ Task 2 (pill)        │
└──────────────┴──────────────────────┘
```

**Display Format**:
- **Year/Month/Week views**: `MM/DD/YYYY - MM/DD/YYYY (X items)`
- **Day view**: `MM/DD/YYYY HH:MM AM/PM - MM/DD/YYYY HH:MM AM/PM (X items)`

## Benefits

1. **Better UX**: Users can see the overall time span of a collapsed group
2. **Visual Context**: Maintains timeline context even when collapsed
3. **Configurable**: Can be disabled if empty rows are preferred
4. **Backward Compatible**: Default behavior is enabled, but can be disabled
5. **Informative**: Shows the full date range covered by the group's items
