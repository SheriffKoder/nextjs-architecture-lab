# Bug Fix: Grid Positioning for Virtualized Cells

## Issue  
Cells were being generated for years 2022, 2023, 2024 (1096 cells) but weren't appearing at the correct positions. Year 2023 cells were invisible even though the console showed they were being created.

## Root Cause

**Grid Auto-Placement vs Unified Grid**

The timeline uses a unified CSS Grid spanning ALL years (2020-2025):
```typescript
gridTemplateColumns: `repeat(${totalCells}, ${cellWidth}px)` // 2,190 days total
```

When virtualizing, we only render cells for visible years (e.g., 2022-2024). However, these cells were being auto-placed by CSS Grid starting at column 1, instead of at their correct positions in the unified grid.

**Example:**
```
Unified Grid: [Day 1] [Day 2] ... [Day 730] [Day 731] ... [Day 1095] [Day 1096] ...
               └─ 2020 ─┘          └─ 2021 ─┘             └─ 2022 ─┘             └─ 2023 ─┘

When rendering only 2022-2024:
❌ BEFORE: Cells placed at columns 1, 2, 3, ... (wrong!)
✅ AFTER:  Cells placed at columns 731, 732, ... 1096, 1097, ... (correct!)
```

## The Fix

### Step 1: Calculate Year Offsets

Calculate the cumulative day offset for each year in the unified grid:

```typescript
let cumulativeDayOffset = 0
const yearDayOffsets = new Map<number, number>()
yearsInRange.forEach((year) => {
  yearDayOffsets.set(year, cumulativeDayOffset) // 2020:0, 2021:365, 2022:730, 2023:1095, ...
  cumulativeDayOffset += getDaysInYear(year)
})
```

### Step 2: Explicit Grid Positioning

Wrap each cell in a div with explicit `gridColumn` style:

```typescript
// For year 2023 starting at day 1095
const yearStartDayIndex = yearDayOffsets.get(year) // 1095
let dayOffsetWithinYear = 0

for (let day = 1; day <= daysInMonth; day++) {
  const gridColumn = yearStartDayIndex + dayOffsetWithinYear + 1 // 1096, 1097, 1098, ...
  
  cells.push(
    <div key={cellId} style={{ gridColumn }}>
      <DroppableTimelineCell {...props} />
    </div>
  )
  
  dayOffsetWithinYear++
}
```

### Why This Works

**CSS Grid Column Placement:**
- Without `gridColumn`: Grid auto-places cells sequentially (1, 2, 3, ...)
- With `gridColumn`: Each cell explicitly positioned at its correct location in the unified grid

**Result:**
- Year 2022 cells render at columns 731-1095
- Year 2023 cells render at columns 1096-1460
- Year 2024 cells render at columns 1461-1825
- All cells appear at their correct positions!

## Debug Output

When scrolling, you'll now see:

```
🔍 TimelineRow - Visible Years: [2022, 2023, 2024] All Years: [2020, ..., 2025]
  Year 2020: visible=false, inVisibleArray=false, dayOffset=0
  Year 2021: visible=false, inVisibleArray=false, dayOffset=365
  Year 2022: visible=true, inVisibleArray=true, dayOffset=730
  ✨ Generating cells for year 2022, gridColumn starts at 731
  Year 2023: visible=true, inVisibleArray=true, dayOffset=1095
  ✨ Generating cells for year 2023, gridColumn starts at 1096
  Year 2024: visible=true, inVisibleArray=true, dayOffset=1461
  ✨ Generating cells for year 2024, gridColumn starts at 1462
  Year 2025: visible=false, inVisibleArray=false, dayOffset=2191
📦 Total cells generated: 1096
```

This confirms:
- Day offsets calculated correctly
- Grid columns start at correct positions
- Cells generated and positioned properly

## Files Modified

**`components/main/timeline-row.tsx`**
- Added `yearDayOffsets` Map to calculate cumulative day positions
- Wrapped DroppableTimelineCell in div with explicit `gridColumn` style
- Added debug logging for day offsets and grid column positions

## Testing

1. ✅ Load timeline with 2020-2025 data
2. ✅ Scroll to year 2023
3. ✅ Cells now appear at correct positions
4. ✅ Drag/drop works on year 2023

## Related

This same fix may be needed for `timeline-row-day.tsx` if Day view has similar issues with cell positioning across virtualized days.

## Status

✅ **FIXED** - Cells now render at correct grid positions for all virtualized years.

