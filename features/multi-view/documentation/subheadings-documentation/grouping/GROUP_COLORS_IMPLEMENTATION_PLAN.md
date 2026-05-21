# Timeline Group-Based Item Colors - Implementation Plan

## Overview

This document outlines the implementation plan for adding group-based coloring to timeline item pills. The feature allows items within each group to be colored using an array of Tailwind color classes, with automatic cycling if there are more groups than colors.

## Current Structure

### Item Styling
- Timeline items (pills) are currently styled with `bg-tertiary/50` in `draggable-timeline-item.tsx` (line ~295)
- The color is applied via className on the main draggable item div
- Items inherit their styling from `cellStyle` configuration in `timeline-container.tsx`

## Implementation Steps

### 1. Add `groupColors` prop to `TimelineWrapper`

**File**: `timeline-wrapper.tsx`

```typescript
const TimelineWrapper = ({ 
  timelineData, 
  mappingKeys,
  views = ['Year', 'Month', 'Week', 'Day'],
  groupByKey,
  groupColors, // NEW: Array of Tailwind color classes
  onEventClick,
  onItemDrag,
  onItemResize
}: { 
  timelineData: any
  mappingKeys: any
  views?: string[]
  groupByKey?: string
  groupColors?: string[] // NEW: e.g., ["bg-red-500 dark:bg-red-300", "bg-blue-500 dark:bg-blue-300"]
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
})
```

### 2. Pass `groupColors` to `TimelineContainer`

**File**: `timeline-wrapper.tsx` (around line 251)

```typescript
<TimelineContainer 
  ref={timelineRef}
  data={timelineData} 
  view={selectedView} 
  mappingKeys={mappingKeys}
  groupByKey={groupByKey}
  groupColors={groupColors} // NEW
  hourColumnWidth={effectiveHourColumnWidth}
  weekDayWidth={effectiveWeekDayWidth}
  monthDayWidth={effectiveMonthDayWidth}
  yearWeekWidth={effectiveYearWeekWidth}
  onEventClick={onEventClick}
  onItemDrag={onItemDrag}
  onItemResize={onItemResize}
/>
```

### 3. Update `TimelineContainer` interface and create color mapping

**File**: `timeline-container.tsx`

#### Update interface:

```typescript
interface TimelineContainerProps {
  data: any[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  mappingKeys: MappingKeys
  groupByKey?: string
  groupColors?: string[] // NEW
  hourColumnWidth?: number
  weekDayWidth?: number
  monthDayWidth?: number
  yearWeekWidth?: number
  onEventClick?: (eventId: string) => void
  onItemDrag?: (item: { id: string; start_date: string; end_date: string }) => void
  onItemResize?: (item: { id: string; start_date: string; end_date: string }) => void
}
```

#### Add state for color mapping:

```typescript
// timeline-container.tsx - add state
const [groupColorMap, setGroupColorMap] = useState<Map<string | null, string>>(new Map())
```

#### Create color mapping in grouping useEffect (around line 485):

```typescript
useEffect(() => {
  if (mappedData.length === 0) {
    setTimelineData([])
    setGroupedTimelineData([])
    setGroupColorMap(new Map())
    return
  }
  
  // ... existing filtering logic ...
  
  if (groupByKey) {
    const groupMap = new Map<string | null, MappedTimelineItem[][]>()
    const colorMap = new Map<string | null, string>()
    
    filteredData.forEach((itemGroup) => {
      const firstItem = itemGroup[0]
      const groupValue = firstItem?.[groupByKey] || null
      
      if (!groupMap.has(groupValue)) {
        groupMap.set(groupValue, [])
      }
      groupMap.get(groupValue)!.push(itemGroup)
    })
    
    // Map each group to a color (cycle through colors if more groups than colors)
    if (groupColors && groupColors.length > 0) {
      let colorIndex = 0
      groupMap.forEach((items, groupKey) => {
        const color = groupColors[colorIndex % groupColors.length]
        colorMap.set(groupKey, color)
        colorIndex++
      })
    }
    
    setGroupColorMap(colorMap)
    
    // ... rest of grouping logic (convert to GroupedTimelineData, etc.) ...
  } else {
    setGroupColorMap(new Map())
    // ... no grouping logic ...
  }
}, [mappedData, groupByKey, groupColors, visibleYearsString, visibleDaysString, view, /* other deps */])
```

### 4. Pass `groupColorMap` to `YearMonthWeekView`

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
  groupedTimelineData={groupedTimelineData}
  groupByKey={groupByKey}
  groupColorMap={groupColorMap} // NEW
  mappingKeys={mappingKeys}
  rowHeight={rowHeight}
  cellStyle={cellStyle}
  onResizeLeft={handleResizeLeft}
  onResizeRight={handleResizeRight}
  onEventClick={onEventClick}
/>
```

### 5. Update `YearMonthWeekView` interface and pass color to rows

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
  timelineData: MappedTimelineItem[][]
  groupedTimelineData?: GroupedTimelineData[]
  groupByKey?: string
  groupColorMap?: Map<string | null, string> // NEW
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
  groupColorMap, // NEW
  mappingKeys,
  rowHeight,
  cellStyle,
  onResizeLeft,
  onResizeRight,
  onEventClick
}: YearMonthWeekViewProps) => {
  // ... existing code ...
```

#### Update row rendering to pass color (around line 285):

```typescript
{(() => {
  if (groupedTimelineData && groupedTimelineData.length > 0) {
    let currentRowIndex = 0
    const rowsToRender: JSX.Element[] = []
    
    groupedTimelineData.forEach((group, groupIndex) => {
      if (group.isHeader) {
        // Render sticky header row
        // ... existing header rendering logic ...
        currentRowIndex++
      } else {
        // Get color for this group
        const groupColor = groupColorMap?.get(group.groupKey) || undefined
        
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
                  groupColor={groupColor} // NEW
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
    // ... existing non-grouping rendering ...
    // Pass undefined for groupColor when not grouping
    <TimelineRow 
      // ... existing props
      groupColor={undefined} // NEW
    />
  }
})()}
```

### 6. Update `TimelineRow` interface and pass color to items

**File**: `components/main/timeline-row.tsx`

#### Update interface:

```typescript
interface TimelineRowProps {
  yearsInRange: number[]
  visibleYearsInRange: number[]
  view: 'Year' | 'Month' | 'Week' | 'Day'
  yearWeekWidth: number
  monthDayWidth: number
  weekDayWidth: number
  cellWidth: number
  cellHeight?: number
  timelineIndex: number
  timelineData: MappedTimelineItem[]
  mappingKeys: MappingKeys
  cellStyle: any
  groupColor?: string // NEW: Tailwind color class for this group
  onResizeLeft?: (item: MappedTimelineItem, daysChange: number) => void
  onResizeRight?: (item: MappedTimelineItem, daysChange: number) => void
  onEventClick?: (eventId: string) => void
}
```

#### Update component signature:

```typescript
const TimelineRow = ({ 
  yearsInRange,
  visibleYearsInRange,
  view, 
  yearWeekWidth, 
  monthDayWidth, 
  weekDayWidth,
  cellWidth,
  cellHeight = 40,
  timelineIndex,
  timelineData,
  mappingKeys,
  cellStyle,
  groupColor, // NEW
  onResizeLeft,
  onResizeRight,
  onEventClick
}: TimelineRowProps) => {
  // ... existing code ...
```

#### Pass color to items (around line 372):

```typescript
{/* Timeline items as spanning elements across unified grid */}
{timelineItemsForRow.map((item, index) => {
  const startPos = getItemStartPosition(item)
  const span = getGridSpan(item)
  
  // Only render if item has valid position and span
  if (startPos === 0 || span === 0) {
    return null
  }
  
  return (
    <DraggableTimelineItem
      key={`timeline-item-${index}`}
      item={item}
      startPos={startPos}
      span={span}
      mappingKeys={mappingKeys}
      cellStyle={cellStyle}
      view={view}
      cellWidth={cellWidth}
      cellHeight={cellHeight}
      groupColor={groupColor} // NEW
      onResizeLeft={onResizeLeft ? (daysChange) => onResizeLeft(item, daysChange) : undefined}
      onResizeRight={onResizeRight ? (daysChange) => onResizeRight(item, daysChange) : undefined}
      onEventClick={onEventClick ? () => onEventClick(item[mappingKeys.uniqueIdKey as keyof MappedTimelineItem] as string) : undefined}
      onGhostUpdate={(newStartPos, newSpan) => {
        if (newStartPos !== null && newSpan !== null) {
          setActiveGhostItemIndex(index)
          setGhostStartPos(newStartPos)
          setGhostSpan(newSpan)
        } else {
          setActiveGhostItemIndex(null)
          setGhostStartPos(null)
          setGhostSpan(null)
        }
      }}
    />
  )
})}
```

### 7. Update `DraggableTimelineItem` to use the color

**File**: `components/dnd/draggable-timeline-item.tsx`

#### Update interface:

```typescript
interface DraggableTimelineItemProps {
  item: MappedTimelineItem
  startPos: number
  span: number
  mappingKeys: MappingKeys
  cellStyle: any
  view: 'Year' | 'Month' | 'Week' | 'Day'
  cellWidth: number
  cellHeight?: number
  groupColor?: string // NEW: Tailwind color class
  onResizeLeft?: (daysChange: number) => void
  onResizeRight?: (daysChange: number) => void
  onEventClick?: () => void
  onGhostUpdate?: (ghostStartPos: number | null, ghostSpan: number | null) => void
}
```

#### Update component signature:

```typescript
const DraggableTimelineItem = ({ 
  item, 
  startPos, 
  span, 
  mappingKeys,
  cellStyle,
  view,
  cellWidth,
  cellHeight = 40,
  groupColor, // NEW
  onResizeLeft,
  onResizeRight,
  onEventClick,
  onGhostUpdate
}: DraggableTimelineItemProps) => {
  // ... existing code ...
```

#### Apply color to main draggable item div (around line 293):

```typescript
{/* Main Draggable Item - Handles Dragging */}
<div
  ref={setNodeRef}
  className={`absolute z-10 flex items-center justify-center ${
    groupColor || 'bg-tertiary/50' // Use groupColor if provided, otherwise default
  } text-foreground ${
    isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
  }`}
  style={{
    left: '0px',
    right: '0px',
    top: '50%',
    transform: 'translateY(-50%)',
    height: `${itemHeight}px`,
    ...cellStyle
  }}
  onClick={(e) => {
    // Only trigger click if not dragging and not resizing
    if (!isDragging && !isResizing && onEventClick) {
      e.stopPropagation()
      onEventClick()
    }
  }}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const leftThreshold = width * 0.25
    const rightThreshold = width * 0.75
    
    if (x <= leftThreshold) {
      setHoverArea('left')
    } else if (x >= rightThreshold) {
      setHoverArea('right')
    } else {
      setHoverArea(null)
    }
  }}
  onMouseLeave={() => setHoverArea(null)}
  {...listeners}
  {...attributes}
>
  {/* ... existing content ... */}
</div>
```

### 8. Update `filtering-wrapper.tsx` to pass `groupColors`

**File**: `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

#### Update interface:

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
  groupByKey?: string
  groupColors?: string[] // NEW
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
  groupColors={timelineConfig.groupColors} // NEW
  onEventClick={timelineConfig.onEventClick}
  onItemDrag={timelineConfig.onItemDrag}
  onItemResize={timelineConfig.onItemResize}
/>
```

### 9. Update `tasks-2/page.tsx` to use `groupColors`

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
  groupColors: [ // NEW
    "bg-red-500 dark:bg-red-300",
    "bg-blue-500 dark:bg-blue-300",
    "bg-green-500 dark:bg-green-300",
    "bg-yellow-500 dark:bg-yellow-300",
    "bg-purple-500 dark:bg-purple-300",
    "bg-pink-500 dark:bg-pink-300",
    "bg-indigo-500 dark:bg-indigo-300",
    "bg-orange-500 dark:bg-orange-300",
  ],
  onEventClick: handleTimelineEventClick,
  onItemDrag: handleItemDrag,
  onItemResize: handleItemResize
}), [handleTimelineEventClick, handleItemDrag, handleItemResize])
```

## Key Considerations

### 1. Color Cycling
- If there are more groups than colors, colors will cycle using modulo (`colorIndex % groupColors.length`)
- Example: With 3 colors and 5 groups, groups will get colors: 0, 1, 2, 0, 1

### 2. Fallback Behavior
- If `groupColors` is not provided or empty, items use default `bg-tertiary/50`
- If a group doesn't have a color assigned, items in that group use default `bg-tertiary/50`
- This ensures backward compatibility when grouping is enabled without colors

### 3. Dark Mode Support
- Color classes should include `dark:` variants for proper dark mode support
- Example: `"bg-red-500 dark:bg-red-300"`
- Users can provide any Tailwind color classes, including opacity modifiers

### 4. Day View Support
- The same changes need to be applied to:
  - `draggable-timeline-item-day.tsx` - Add `groupColor` prop and apply to className
  - `timeline-row-day.tsx` - Add `groupColor` prop and pass to `DraggableTimelineItemDay`
  - `day-view.tsx` - Pass `groupColorMap` and handle color assignment similar to `YearMonthWeekView`

### 5. Performance
- Color mapping is calculated once when data is grouped
- No performance impact on rendering since colors are passed as props
- Color classes are applied via Tailwind, which is optimized

### 6. Backward Compatibility
- When `groupColors` is not provided, behavior is unchanged
- When grouping is disabled, colors are not applied
- Existing functionality (drag, resize, click) remains unaffected

## Files to Modify

1. ✅ `timeline-wrapper.tsx` - Add `groupColors` prop
2. ✅ `timeline-container.tsx` - Create color mapping, pass to view
3. ✅ `year-month-week-view.tsx` - Pass color to rows
4. ✅ `timeline-row.tsx` - Pass color to items
5. ✅ `draggable-timeline-item.tsx` - Apply color to item pill
6. ⚠️ `day-view.tsx` - (Optional) Add color support for day view
7. ⚠️ `timeline-row-day.tsx` - (Optional) Pass color for day view
8. ⚠️ `draggable-timeline-item-day.tsx` - (Optional) Apply color for day view
9. ✅ `filtering-wrapper.tsx` - Pass `groupColors` to timeline
10. ✅ `tasks-2/page.tsx` - Configure `groupColors` in timeline config

## Testing Checklist

- [ ] Colors are applied correctly when `groupColors` is provided
- [ ] Colors cycle correctly when there are more groups than colors
- [ ] Default color (`bg-tertiary/50`) is used when `groupColors` is not provided
- [ ] Dark mode colors work correctly with `dark:` variants
- [ ] Colors work with grouping enabled
- [ ] Colors don't affect functionality when grouping is disabled
- [ ] Drag and drop still works with colored items
- [ ] Resize still works with colored items
- [ ] Click events still work with colored items
- [ ] Performance is acceptable with many groups and colors

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
  groupByKey: 'project_name',
  groupColors: [
    "bg-red-500 dark:bg-red-300",
    "bg-blue-500 dark:bg-blue-300",
    "bg-green-500 dark:bg-green-300",
    "bg-yellow-500 dark:bg-yellow-300",
    "bg-purple-500 dark:bg-purple-300",
  ],
  onEventClick: handleTimelineEventClick,
  onItemDrag: handleItemDrag,
  onItemResize: handleItemResize
}), [handleTimelineEventClick, handleItemDrag, handleItemResize])
```

This will display:
- **Project A** (sticky header)
  - Task 1 (red pill)
  - Task 2 (red pill)
- **Project B** (sticky header)
  - Task 3 (blue pill)
  - Task 4 (blue pill)
- **Project C** (sticky header)
  - Task 5 (green pill)
  - Task 6 (green pill)

## Color Class Examples

Here are some example color combinations that work well:

```typescript
// Vibrant colors
groupColors: [
  "bg-red-500 dark:bg-red-300",
  "bg-blue-500 dark:bg-blue-300",
  "bg-green-500 dark:bg-green-300",
  "bg-yellow-500 dark:bg-yellow-300",
  "bg-purple-500 dark:bg-purple-300",
]

// Softer pastels
groupColors: [
  "bg-red-200 dark:bg-red-800",
  "bg-blue-200 dark:bg-blue-800",
  "bg-green-200 dark:bg-green-800",
  "bg-yellow-200 dark:bg-yellow-800",
  "bg-purple-200 dark:bg-purple-800",
]

// With opacity
groupColors: [
  "bg-red-500/80 dark:bg-red-300/80",
  "bg-blue-500/80 dark:bg-blue-300/80",
  "bg-green-500/80 dark:bg-green-300/80",
]

// Custom colors
groupColors: [
  "bg-rose-500 dark:bg-rose-300",
  "bg-cyan-500 dark:bg-cyan-300",
  "bg-emerald-500 dark:bg-emerald-300",
  "bg-amber-500 dark:bg-amber-300",
]
```
