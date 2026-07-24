<!-- 11ad3e4b-b681-41e8-ad63-da3c8a8a265f c40d201d-3c99-489f-83f4-17f8815adc41 -->
# Horizontal Year Virtualization for Timeline Performance

## Problem

Timeline renders ALL day-level grid cells for ALL years (2020-2025) upfront, causing browser freeze. With 365+ days × 6 years × N rows, this creates 10,000+ DOM elements even though only a small portion is visible.

## Solution

Implement horizontal virtualization that only renders years and their cells when they're visible in the viewport.

## Implementation Steps

### 1. Create Visible Range Context

**File**: `app/development/timeline-3/virtualization/context/visible-range-context.tsx` (new)

Create a React Context to share visible range information from the scroll container down to child components.

**Structure:**

```typescript
interface VisibleRange {
  visibleYears: number[]           // Array of years currently visible
  allYears: number[]               // All years in timeline
  scrollOffset: number             // Current scroll position
  yearPositions: Map<number, {     // Position data for each year
    startX: number
    width: number
  }>
}
```

**Documentation:** Follow project-guidelines.md format with header comment explaining purpose, usage, and why/how.

### 2. Replace VirtualizedTimelineContainer

**File**: `app/development/timeline-3/virtualization/componentsvirtualized-timeline-container.tsx` (modify)

Replace `@tanstack/react-virtual` with custom scroll tracking:

**Why Replace:**

- Years have variable widths (365-366 days, different months) - can't use uniform column slicing
- Current implementation doesn't pass virtualization data to children
- Our year-based approach is simpler and more precise

**New Implementation:**

- Track scroll position with `useRef` + scroll event listener
- Calculate viewport width and scroll offset
- Provide scroll data via VisibleRangeContext
- Children use hooks to determine what's visible

**Keep:** Scroll container structure and styling

**Remove:** `@tanstack/react-virtual` dependency and logic

### 3. Create useVisibleYears Hook

**File**: `app/development/timeline-3/virtualization/hooks/use-visible-years.ts` (new)

Custom hook that:

- Calculates which years are visible based on scroll position
- Uses existing width calculators (`getMonthWidths`, `getTotalYearWidth`)
- Includes overscan buffer (1 year on each side)
- **Dynamic expansion**: When dragging starts, expand visible range if drag extends beyond buffer
- Returns visible years array and year position metadata

**Documentation:** Explain WHY we use useMemo (avoid recalculation), HOW it improves performance.

### 4. Create useVisibleDays Hook (Day View)

**File**: `app/development/timeline-3/virtualization/hooks/use-visible-days.ts` (new)

Custom hook for Day view virtualization:

- Calculates which days are visible based on scroll position
- Similar logic to useVisibleYears but at day-level granularity
- Includes overscan buffer (7 days on each side)
- Returns visible days array and day position metadata

**Why needed:** Day view with 100+ days (2020-2025) needs same virtualization approach

### 3. Create Visible Year Calculator Utilities

**File**: `app/development/timeline-3/virtualization/utils/visible-year-calculator.ts` (new)

Create utility functions to:

- Calculate cumulative width/position for each year **using existing width calculators**
- Determine which years are in the visible viewport range
- Include overscan buffer (e.g., 1 year on each side)

**CRITICAL - Accurate Width Calculation:**

- Each year has different width (365 or 366 days for leap years)
- Each month has different days (28-31)
- **Must use existing utilities**: `getMonthWidths()` and `getTotalYearWidth()` for precise width per year
- Cannot approximate with `365 * cellWidth` - will cause misalignment

Example:

```typescript
// For 2020 (leap year): 366 days
// For 2021 (regular): 365 days
// February 2020: 29 days, February 2021: 28 days
// Must calculate exact width for each year to determine scroll positions
```

### 4. Update YearMonthWeekView

**File**: `app/development/timeline-3/components/main/year-month-week-view.tsx`

Changes:

- Consume visible range context
- Filter `yearsInRange` to determine which years to fully render vs which need spacers

**Critical Constraint - Width Cascade in Headers:**

- **Row 3 (Week/Day headers)** determines the width → flows up to Row 2 → flows up to Row 1
- Cannot skip Row 2/Row 3 entirely or Row 1 collapses
- **Solution**: Render minimal spacer divs for non-visible years to maintain width

**Implementation per Row:**

- **Row 1 (Year labels)**: Always render, but for visible years show full labels, for non-visible years show minimal spacer div with calculated width
- **Row 2 (Month headers)**: For visible years render all month labels, for non-visible years render single spacer div with total year width
- **Row 3 (Week/Day headers)**: For visible years render all week/day cells, for non-visible years render single spacer div with total year width
- **Row 4+ (Timeline data)**: Only pass visible years to TimelineRow components

This maintains the width cascade while only creating expensive DOM elements for visible years.

### 5. Update TimelineRow Component

**File**: `app/development/timeline-3/components/main/timeline-row.tsx`

Major changes:

- Accept `visibleYearsInRange` prop instead of rendering all years
- Only generate droppable cells for visible years
- Maintain correct grid positioning even when some years aren't rendered
- Use CSS Grid column start/end to position items correctly in the unified grid

Key insight: The grid structure remains unified, but we only render cells for visible portions.

### 6. Update Timeline Container

**File**: `app/development/timeline-3/timeline-container.tsx`

Wrap the content with the new VisibleRangeContext.Provider so all child components have access to visible range data.

## Technical Approach

### Grid Positioning Strategy

Even when not rendering all cells, maintain correct positioning:

- **Calculate widths for ALL years** (lightweight calculation, no DOM creation)
- Determine cumulative x-position for each year based on calculated widths
- **For visible years**: Render full DOM with all headers and cells
- **For non-visible years**: Render minimal spacer divs with calculated width only
- Use `grid-column: start / end` to position items in the correct location

### Width Calculation Flow (Bottom-Up)

The width cascades from bottom to top:

1. **Row 4+ determines width**: Each day cell has a width (e.g., 50px for Month view, 7.14px for Year view)
2. **Row 3 matches Row 4+**: Week/day headers span the same total width
3. **Row 2 matches Row 4+**: Month headers span the same total width  
4. **Row 1 matches Row 4+**: Year labels span the same total width

**Key Strategy**: Calculate widths for all years, but only render expensive DOM elements (cells, labels) for visible years. For non-visible years, render simple spacer divs.

### Performance Benefits

- **Before**: 2,190 days × 10 rows = 21,900 DOM elements on load
- **After**: ~400 days × 10 rows = 4,000 DOM elements (showing ~1 year)
- **Result**: ~80% reduction in initial render, smooth scrolling

### Overscan Buffer

Include 1 year before and after visible range to prevent pop-in during scroll.

## Styling Preservation Guarantee

**Zero visual changes** to visible content:

1. **Visible years**: Render with ALL existing CSS classes, inline styles, and structure - NO CHANGES
2. **Spacer divs**: Minimal styling (only width + height), no borders/backgrounds/colors
3. **No CSS modifications**: Keep all existing `className` props and `style` attributes
4. **Layout structure**: Maintain flex/grid display types exactly as they are
5. **Cell styling**: The `cellStyle` prop passed to timeline items remains unchanged
6. **Borders & separators**: Visible year borders/separators render normally, spacers have no visual styling

**Implementation Rule**: Spacer divs are invisible placeholder elements that only maintain width/height for scroll area.

## Testing Strategy

1. Test with 2020-2025 data range
2. Verify initial render only loads visible year(s)
3. **Visual regression test**: Compare visible timeline appearance before/after - should be identical
4. Scroll horizontally and confirm years render as they approach with correct styling
5. Verify drag-and-drop still works across year boundaries
6. Check that resize operations work correctly
7. **Styling verification**: Confirm borders, colors, fonts, spacing all match original

## Edge Cases

- Timeline items spanning across visible/non-visible year boundaries
- Dragging items from rendered to non-rendered years
- Initial scroll position (not at year 0)
- Single year vs multi-year visibility

### To-dos

- [ ] Create VisibleRangeContext to share scroll position and visible range data
- [ ] Create utility to calculate which years are visible based on scroll position
- [ ] Update VirtualizedTimelineContainer to track scroll and provide visible range
- [ ] Modify YearMonthWeekView to filter years based on visible range
- [ ] Update TimelineRow to only render cells for visible years
- [ ] Wire VisibleRangeContext throughout the timeline container hierarchy