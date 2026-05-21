# Vertical Virtualization and Horizontal Data Filtering

## Overview

Add vertical virtualization to render only visible timeline rows (tasks/projects) and implement horizontal data filtering to show only items whose dates overlap with the currently visible year/month/day range.

## Current State Analysis

- Timeline currently renders ALL rows (tasks) vertically without limit
- All timeline data is mapped and rendered regardless of horizontal scroll position
- Row container has fixed height `h-[60vh]` in year-month-week-view.tsx and needs same in day-view.tsx
- Horizontal virtualization exists for years/days/months (headers AND data rows already implemented)
- Data filtering happens at row-level (`getTimelineItemsForRow`) but applies to entire date range, not visible range
- Header rows wrapped in sticky div (line 118 in year-month-week-view.tsx) but sticky positioning not working well
- Vertical scrolling should happen in VirtualizedTimelineContainer wrapper, not in view components

## Implementation Plan

### Phase 1: Vertical Virtualization Infrastructure

**1.1 Create Vertical Scroll Configuration**

- File: `components/timeline-3/virtualization/timeline-config.ts`
- Add constants:
  - `OVERSCAN_ROWS = 5` (render 5 extra rows above/below viewport)
  - Export alongside existing `OVERSCAN_YEARS`, `OVERSCAN_DAYS`

**1.2 Create Visible Rows Calculator Utility**

- File: `components/timeline-3/virtualization/utils/visible-row-calculator.ts` (new)
- Functions:
  - `calculateVisibleRows(scrollTop, viewportHeight, rowHeight, totalRows, overscan)` → returns `{ startIndex, endIndex, visibleIndices }`
  - Similar pattern to `visible-year-calculator.ts` and `visible-day-calculator.ts`
- Returns indices of rows that should be rendered

**1.3 Create useVisibleRows Hook**

- File: `components/timeline-3/virtualization/hooks/use-visible-rows.ts` (new)
- Consumes scroll state (scrollTop, viewportHeight)
- Uses `calculateVisibleRows` utility
- Returns memoized `{ visibleRowIndices, totalRows, rowHeight }`
- Similar pattern to `use-visible-years.ts` and `use-visible-days.ts`

**1.4 Update VisibleRangeContext**

- File: `components/timeline-3/virtualization/context/visible-range-context.tsx`
- Add to context:
  - `scrollTop: number`
  - `viewportHeight: number`
  - `visibleRowIndices: number[]`
  - `totalRows: number`

### Phase 2: Horizontal Data Filtering

**2.1 Create Data Filtering Utilities**

- File: `components/timeline-3/utils/filtering/timeline-data-filter.ts` (new)
- Functions:
  - `filterDataByYear(data, visibleYears, mappingKeys)` → Year view: filters items where startDate/endDate overlap with ANY visible year
  - `filterDataByMonth(data, visibleYears, scrollOffset, yearPositions, mappingKeys)` → Month/Week view: filters items where startDate/endDate overlap with ANY visible MONTH (extract months from visible years based on horizontal scroll position)
  - `filterDataByDay(data, visibleDays, mappingKeys)` → Day view: filters items where startDate/endDate overlap with ANY visible day
  - `getVisibleMonths(visibleYears, yearPositions, scrollOffset, viewportWidth)` → determines which months are actually visible within visible years based on scroll position
- Logic examples:
  - Year view: Item with dates 2024-05-01 to 2024-12-31 is visible if 2024 is in visibleYears
  - Month view: Item with dates 2024-05-01 to 2024-07-31 is visible if May, June, or July 2024 are visible months
  - Day view: Item with dates 2024-05-01 to 2024-05-03 is visible if any of those 3 days are in visibleDays

**2.2 Update timeline-container.tsx Data Flow**

- File: `components/timeline-3/timeline-container.tsx`
- Current: `mapTimelineDataToCellIds(rawData)` maps ALL data
- New: Add filtering step AFTER mapping based on view:
  ```typescript
  const mappedData = mapTimelineDataToCellIds(rawData, mappingKeys, gmtShift)
  let filteredData
  if (view === 'Year') {
    filteredData = filterDataByYear(mappedData, visibleYears, mappingKeys)
  } else if (view === 'Month' || view === 'Week') {
    filteredData = filterDataByMonth(mappedData, visibleYears, scrollOffset, yearPositions, mappingKeys)
  } else { // Day
    filteredData = filterDataByDay(mappedData, visibleDays, mappingKeys)
  }
  setTimelineData(filteredData)
  ```

- Recalculate when `visibleYears`, `visibleDays`, or `scrollOffset` change (add to useEffect dependencies)

### Phase 3: Vertical Scroll in VirtualizedTimelineContainer

**3.1 Add Vertical Scroll to VirtualizedTimelineContainer**

- File: `components/timeline-3/virtualization/components/virtualized-timeline-container.tsx`
- Current: Only tracks horizontal scroll (`overflow-x-auto`, scrollLeft, viewportWidth)
- New: Add vertical scroll tracking as well
  - Change `overflow-x-auto` to `overflow-auto` (enables both horizontal and vertical scroll)
  - Track `scrollTop` and `viewportHeight` alongside existing horizontal scroll state
  - Update `onScroll` callback signature: `onScroll(scrollLeft, scrollTop, viewportWidth, viewportHeight)`
  - Update ref interface to expose `getScrollTop()` and `getViewportHeight()`
  - Add event listeners for both horizontal and vertical scroll in one handler

**3.2 Update View Components to Use Virtualized Rows**

- Files:
  - `components/timeline-3/components/main/year-month-week-view.tsx` (line 283)
  - `components/timeline-3/components/main/day-view.tsx` (line 156)
- Consume `visibleRowIndices` from context
- Current structure (year-month-week-view.tsx):
  ```tsx
  <div className='flex flex-col h-[60vh]'>
    {timelineData.map((itemGroup, index) => <TimelineRow />)}
  </div>
  ```

- New structure with vertical virtualization:
  ```tsx
  <div style={{ height: `${timelineData.length * rowHeight}px`, position: 'relative' }}>
    {visibleRowIndices.filter(i => i < timelineData.length).map(index => (
      <div key={`row-${index}`} style={{ position: 'absolute', top: `${index * rowHeight}px`, width: '100%' }}>
        <TimelineRow data={timelineData[index]} />
      </div>
    ))}
  </div>
  ```

- Remove `h-[60vh]` from row container (height comes from absolute positioning)
- Keep `h-[60vh]` on the OUTER wrapper (year-month-week-view.tsx and day-view.tsx root divs)

**3.3 Fix Header Sticky Positioning**

- Files:
  - `components/timeline-3/components/main/year-month-week-view.tsx` (line 118)
  - `components/timeline-3/components/main/day-view.tsx` (header rows 1 and 2)
- Current: `<div className='flex flex-col sticky top-0 left-0'>`
- Issue: Sticky not working because scroll is in parent (VirtualizedTimelineContainer)
- Solution: Add `z-index` and `background-color` to ensure headers stay fixed:
  ```tsx
  <div className='flex flex-col sticky top-0 left-0 z-10 bg-white'>
  ```

- Headers (Rows 1-3 for Year/Month/Week, Rows 1-2 for Day) must stick to top during vertical scroll in VirtualizedTimelineContainer

### Phase 4: Integration and Testing

**4.1 Update VisibleRangeContext Provider**

- File: `components/timeline-3/timeline-container.tsx`
- Add vertical scroll state:
  ```typescript
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  ```

- Update `handleScroll` callback to accept 4 parameters: `(scrollLeft, scrollTop, viewportWidth, viewportHeight)`
- Calculate `visibleRowIndices` using `useVisibleRows` hook
- Pass all scroll states to context provider

**4.2 Handle Edge Cases**

- Empty data: Show placeholder message ("No tasks to display")
- Single row: No vertical scroll needed, render normally
- Drag & drop across virtualized boundaries: Keep overscan buffer (5 rows)
- Resize operations: Ensure ghost overlay positions correctly with absolute positioning (use row index × rowHeight for top position)

**4.3 Performance Optimization**

- Memoize filtered data with `useMemo()`
- Add `React.memo` to `TimelineRow` and `TimelineRowDay` components to prevent unnecessary re-renders
- Use `useCallback` for scroll handlers
- Debounce or throttle scroll events if performance issues arise (using `requestAnimationFrame`)

### Phase 5: Droppable Cell Optimization

**5.1 Add Droppable Buffer Zones**

- File: `components/timeline-3/virtualization/timeline-config.ts`
- Add buffer constants:
  - `DROPPABLE_BUFFER_YEAR = 50` (cells before/after task span in Year view)
  - `DROPPABLE_BUFFER_MONTH = 5` (cells before/after task span in Month view)
  - `DROPPABLE_BUFFER_WEEK = 5` (cells before/after task span in Week view)
  - `DROPPABLE_BUFFER_DAY = 20` (cells before/after task span in Day view)
- Purpose: Limit `useDroppable` hooks to only cells within buffer zones around task spans
- Performance Impact:
  - Without buffer: ~288 droppable cells per day in Day view (entire day)
  - With buffer (20 each side): ~10-50 droppable cells per task area (task + buffers)
  - Reduction: 83-96% fewer `useDroppable` hooks
- Implementation:
  - Files: `components/timeline-3/components/main/timeline-row.tsx`, `components/timeline-3/components/main/timeline-row-day.tsx`
  - Calculate droppable zones: `[taskStart - buffer, taskEnd + buffer]` for each task
  - Only render `DroppableTimelineCell` components within these zones
  - Render plain `<div>` for cells outside buffer zones (non-droppable)
  - Buffer cells can have visual indicator (red background `#fee2e2`) for testing/debugging

**5.2 Conditional useDroppable Hook**

- Files:
  - `components/timeline-3/components/dnd/droppable-timeline-cell.tsx`
  - `components/timeline-3/components/dnd/droppable-timeline-cell-day.tsx`
- Purpose: Disable `useDroppable` hooks until a drag operation is initiated
- Implementation:
  - Add drag state tracking via context: `isDragging: boolean` in `VisibleRangeState`
  - Track drag state in `timeline-container.tsx`: `setIsDragging(true)` on `onDragStart`, `setIsDragging(false)` on `onDragEnd` and `onDragCancel`
  - In droppable cells: Use `disabled: !isDragging` prop in `useDroppable` hook
  - When not dragging: Droppable hooks are disabled, reducing overhead
  - When dragging starts: All droppable hooks enable automatically
- Performance Impact:
  - Before: All cells always registered with @dnd-kit (even when idle)
  - After: Droppables disabled when not dragging (via `disabled: true`)
  - Only enabled during active drag operations
  - Significant reduction in idle overhead for large timelines

### Phase 6: Data Sorting and UI Consistency

**6.1 Order Rows by Start Date**

- File: `components/timeline-3/timeline-container.tsx`
- Purpose: Sort filtered timeline rows by earliest start date for cascading/chronological view
- Implementation:
  - Sort groups (rows) by earliest start date in each group: `getEarliestStartDate(group)`
  - Sort items within each group by start date (ascending)
  - Applied after filtering, before setting `timelineData`
- Logic:
  ```typescript
  // Sort groups by earliest start date
  const sortedData = [...filteredData].sort((groupA, groupB) => {
    const earliestA = getEarliestStartDate(groupA)
    const earliestB = getEarliestStartDate(groupB)
    return earliestA.getTime() - earliestB.getTime()
  })
  
  // Sort items within each group
  const finalData = sortedData.map(group => {
    return [...group].sort((a, b) => {
      return new Date(a.mapping.startDate).getTime() - new Date(b.mapping.startDate).getTime()
    })
  })
  ```
- Result: Timeline rows display in chronological order (earliest dates first), providing intuitive cascading view

**6.2 Add Dummy Rows for Consistent UI**

- File: `components/timeline-3/virtualization/timeline-config.ts`
- Add constant: `MIN_ROWS = 12` (minimum number of rows to always display)
- Purpose: Ensure consistent UI even when filtered data results in zero rows
- Implementation:
  - Files: `components/timeline-3/components/main/year-month-week-view.tsx`, `components/timeline-3/components/main/day-view.tsx`
  - When `timelineData.length < MIN_ROWS`: Pad with empty dummy rows
  - Dummy rows: Use same `TimelineRow`/`TimelineRowDay` components with empty `timelineData = []`
  - Dummy rows maintain:
    - Same cell styling (weekends, borders, backgrounds)
    - Same grid structure and cell generation
    - Visual consistency and feedback that timeline is functional
  - Dummy rows are NOT droppable (no timeline items to drag)
- Logic:
  ```typescript
  const totalRows = Math.max(MIN_ROWS, timelineData.length)
  const rowsToRender = timelineData.length >= MIN_ROWS 
    ? timelineData 
    : [...timelineData, ...Array(MIN_ROWS - timelineData.length).fill([])] // Pad with empty rows
  ```
- Examples:
  - 0 data rows → Shows 12 dummy rows with full cell styling
  - 5 data rows → Shows 5 data rows + 7 dummy rows = 12 total
  - 15 data rows → Shows 15 data rows (no dummies needed)
- UX Benefits:
  - Prevents completely empty timeline when filtering results in zero matches
  - Maintains visual consistency and prevents jarring empty state
  - Provides visual feedback that timeline is functional
  - Users can see the timeline grid structure even with no data
- Configuration: Default 12 rows works well with common viewport heights (60vh typically shows ~10-15 rows)

## Key Design Decisions

1. **Vertical scroll in VirtualizedTimelineContainer wrapper**

   - Headers remain fixed using sticky positioning
   - Both horizontal and vertical scroll in VirtualizedTimelineContainer (`overflow-auto`)
   - View components (year-month-week-view.tsx, day-view.tsx) set height `h-[60vh]` on root
   - Row container uses absolute positioning with calculated total height

2. **Horizontal filtering granularity by view**

   - Year view: Filter by YEAR (show items that overlap visible years)
   - Month/Week view: Filter by MONTH (show items that overlap visible months)
   - Day view: Filter by DAY (show items that overlap visible days)
   - Reduces memory footprint for large datasets
   - Works WITH existing horizontal virtualization for headers/cells

3. **Overscan buffer of 5 rows**

   - Smooth scrolling experience
   - Prevents white flashes during scroll
   - Balances performance vs. UX

4. **Absolute positioning for virtualized rows**

   - Maintains scroll height with wrapper div (height = totalRows × rowHeight)
   - Positions each visible row at correct offset (top = index × rowHeight)
   - Preserves grid alignment and drag/drop functionality
   - Compatible with existing horizontal cell virtualization

## Files to Create

- `components/timeline-3/virtualization/utils/visible-row-calculator.ts`
- `components/timeline-3/virtualization/hooks/use-visible-rows.ts`
- `components/timeline-3/utils/filtering/timeline-data-filter.ts`

## Files to Modify

- `components/timeline-3/virtualization/timeline-config.ts`
- `components/timeline-3/virtualization/context/visible-range-context.tsx`
- `components/timeline-3/virtualization/components/virtualized-timeline-container.tsx`
- `components/timeline-3/timeline-container.tsx`
- `components/timeline-3/components/main/year-month-week-view.tsx`
- `components/timeline-3/components/main/day-view.tsx`

## Expected Performance Impact

- **Before**: 100 rows × 2,190 cells = 219,000 DOM elements
- **After (Horizontal filtering)**: 20 rows with visible dates × 400 visible cells = 8,000 DOM elements
- **After (Both horizontal + vertical)**: ~10 visible rows × 400 visible cells = 4,000 DOM elements
- **Combined**: ~98% reduction in rendered DOM elements for large datasets
