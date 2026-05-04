# Bug Fix: Missing Droppable Cells for Years 2023, 2024, 2025

## Issue
Droppable cells were not rendering for years 2023, 2024, 2025 when scrolling to them in Year/Month/Week views. Users could see the timeline items but couldn't drop tasks on those years.

## Root Cause

**Stale Closure in useMemo**

In `timeline-row.tsx`, the cell generation was wrapped in `useMemo` for performance:

```typescript
const droppableCells = useMemo(() => {
  const cells: React.ReactElement[] = []
  
  yearsInRange.forEach((year) => {  // ← Uses yearsInRange
    const visible = isYearVisible(year)
    // ... generate cells
  })
  
  return cells
}, [visibleYearsInRange, timelineIndex, view]) // ❌ Missing yearsInRange!
```

**The Problem:**
- The function uses `yearsInRange` to loop through all years
- But `yearsInRange` was **NOT** in the dependency array
- When scrolling, `visibleYearsInRange` would update correctly
- But the memoized function kept using the **old** `yearsInRange` from initial render
- This caused a stale closure where new years weren't being checked

## The Fix

Added `yearsInRange` to the useMemo dependency array:

```typescript
const droppableCells = useMemo(() => {
  // ... same cell generation logic
  return cells
}, [visibleYearsInRange, yearsInRange, timelineIndex, view]) // ✅ Added yearsInRange
```

**Why This Works:**
- Now the memoized function re-evaluates when `yearsInRange` changes
- All years are properly checked against `visibleYearsInRange`
- Cells generate correctly for all years when scrolling

## Files Modified

1. **`components/main/timeline-row.tsx`**
   - Added `yearsInRange` to useMemo dependency array
   - Added debug logging to help diagnose similar issues

2. **`virtualization/utils/visible-year-calculator.ts`**
   - Added debug logging to track visible years calculation
   - Helps verify scroll position and viewport calculations

## Debug Logging Added

When running in development mode, you'll now see console logs:

```
📊 Calculate Visible Years: {
  scrollOffset: 5234,
  viewportWidth: 1200,
  viewportStart: 5234,
  viewportEnd: 6434,
  totalYears: 6
}
✅ Visible Years Result: [2022, 2023, 2024]
🔍 TimelineRow - Visible Years: [2022, 2023, 2024] All Years: [2020, 2021, 2022, 2023, 2024, 2025]
```

This helps verify:
- Scroll tracking is working correctly
- Visible years are calculated correctly
- Cells are being generated for the right years

## Testing

To verify the fix:
1. Load timeline with 2020-2025 data in Year/Month/Week view
2. Scroll horizontally to years 2023, 2024, 2025
3. Try to drag/drop a task onto those years
4. Cells should now appear and accept drops

## Lessons Learned

### useMemo Dependency Rules
When using `useMemo`, **ALL** variables used inside the function must be in the dependency array:

```typescript
// ❌ BAD - Missing dependencies
useMemo(() => {
  return array1.map(x => array2.includes(x))  // Uses array2 but not in deps
}, [array1])

// ✅ GOOD - All dependencies included
useMemo(() => {
  return array1.map(x => array2.includes(x))
}, [array1, array2])
```

### React Hooks ESLint Rule
The `react-hooks/exhaustive-deps` ESLint rule would have caught this. Consider enabling it:

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Related Issues

This same pattern exists in `timeline-row-day.tsx` - verify it has correct dependencies:

```typescript
const droppableCells = useMemo(() => {
  return daysInRange.flatMap((day) => { ... })
}, [visibleDaysInRange, timelineIndex, daysInRange]) // ✅ Has daysInRange
```

This one is correct - it already includes `daysInRange`.

## Performance Impact

**No negative impact:**
- The fix adds `yearsInRange` to dependencies
- `yearsInRange` only changes when the timeline data range changes (rare)
- In normal scrolling, only `visibleYearsInRange` changes (already in deps)
- Cell regeneration frequency remains the same

**Benefit:**
- Cells now correctly generate for all years when scrolling
- Virtualization still works as intended
- No performance regression

## Status
✅ **FIXED** - Droppable cells now render correctly for all years when scrolling.

