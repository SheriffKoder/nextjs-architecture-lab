# Group First Row Border Feature - Implementation Plan

## Overview

This feature adds a border-top to the first data row in each group when using sidebar grouping mode (`isGroupInline: false`). The border also appears on the corresponding sidebar group item to maintain visual consistency.

## Requirements

1. **Timeline Rows**: Add a border-top to the first data row of each group in sidebar mode (excluding the first group at index 0)
2. **Sidebar Items**: Add the same border-top to group items at index 1, 2, 3, etc. (not the first group at index 0)
3. **Styling**: Border should be `foreground` color with 25% opacity (`hsl(var(--foreground) / 0.25)`)
4. **Scope**: Only applies when `isGroupInline: false` (sidebar grouping mode)
5. **Exclusion**: The first group (index 0) should NOT have a border-top

## Implementation Steps

### 1. Update `TimelineRow` Component

**File**: `components/main/timeline-row.tsx`

#### Add `isFirstRowInGroup` prop:

```typescript
interface TimelineRowProps {
  // ... existing props ...
  isFirstRowInGroup?: boolean // NEW: indicates if this is the first data row in a group
}
```

#### Apply border-top styling:

```typescript
return (
  <div 
    className={`border-r border-border/60 relative ${isFirstRowInGroup ? 'border-t' : ''}`}
    style={{ 
      height: `${cellHeight}px`,
      minHeight: `${cellHeight}px`,
      width: `${actualRowWidth}px`,
      display: 'grid',
      gridTemplateColumns: gridTemplateColumns,
      overflow: 'hidden',
      ...(isFirstRowInGroup ? {
        borderTopColor: 'hsl(var(--foreground) / 0.25)',
        borderTopWidth: '1px',
        borderTopStyle: 'solid'
      } : {})
    }}
  >
    {/* ... existing cell rendering ... */}
  </div>
)
```

### 2. Update `YearMonthWeekView` for Sidebar Grouping

**File**: `components/main/year-month-week-view.tsx`

#### Identify first rows using `groupSidebarData` (excluding first group):

```typescript
} else if (groupSidebarData && groupSidebarData.length > 0 && !isGroupInline) {
  // Create a Set of startRowIndices for quick lookup, excluding the first group (index 0)
  const firstRowIndices = new Set(
    groupSidebarData
      .filter((g, index) => index > 0) // Exclude first group (index 0)
      .map(g => g.startRowIndex)
  )
  
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
            // ... existing props ...
            isFirstRowInGroup={firstRowIndices.has(index)} // NEW: Only true for groups at index 1+
          />
        </div>
      ))}
    </div>
  )
}
```

### 3. Update `GroupSidebar` Component

**File**: `components/grouping/group-sidebar.tsx`

#### Add border-top to first group item:

```typescript
{groups.map((group, index) => {
  const isCollapsed = collapsedGroups.has(group.groupKey)
  const isFirstGroup = index === 0 // NEW: Check if this is the first group
  
  return (
    <div
      key={`sidebar-group-${index}`}
      className={`flex items-start justify-start px-4 pt-2 font-semibold text-sm text-foreground border-b border-border/60 bg-transparent hover:bg-foreground/5 dark:hover:bg-foreground/10 transition-colors ${isFirstGroup ? 'border-t' : ''}`}
      style={{
        height: `${group.height}px`,
        minHeight: `${rowHeight}px`,
        ...(isFirstGroup ? {
          borderTopColor: 'hsl(var(--foreground) / 0.25)',
          borderTopWidth: '1px',
          borderTopStyle: 'solid'
        } : {})
      }}
      title={`${group.itemCount} item${group.itemCount !== 1 ? 's' : ''}`}
    >
      {/* ... existing content ... */}
    </div>
  )
})}
```

## Visual Result

### Before:
```
┌──────────────┬──────────────────────┐
│ Grouped by   │ Timeline Headers      │
│ Project Name ├──────────────────────┤
├──────────────┤                      │
│ Project A    │ Task 1 (pill)        │
│              │ Task 2 (pill)        │
├──────────────┤                      │
│ Project B    │ Task 3 (pill)        │
└──────────────┴──────────────────────┘
```

### After:
```
┌──────────────┬──────────────────────┐
│ Grouped by   │ Timeline Headers      │
│ Project Name ├──────────────────────┤
├──────────────┤                      │ ← No border-top (first group, index 0)
│ Project A    │ Task 1 (pill)        │
│              │ Task 2 (pill)        │
├──────────────┤══════════════════════┤ ← Border-top (foreground/25%, index 1+)
│ Project B    │ Task 3 (pill)        │
└──────────────┴──────────────────────┘
```

## Key Considerations

1. **Performance**: Using a `Set` for `firstRowIndices` provides O(1) lookup time
2. **Consistency**: Both sidebar and timeline rows use the same border styling
3. **Theme Support**: Uses CSS custom properties (`hsl(var(--foreground) / 0.25)`) for theme-aware styling
4. **Scope**: Only applies to sidebar mode (`isGroupInline: false`)
5. **First Group Exclusion**: The first group (index 0) does NOT have a border-top, only groups at index 1, 2, 3, etc.
6. **Collapse Handling**: Border still appears on first row of groups at index 1+ even if previous groups are collapsed

## Files to Modify

1. ✅ `components/main/timeline-row.tsx` - Add `isFirstRowInGroup` prop and border styling
2. ✅ `components/main/year-month-week-view.tsx` - Pass `isFirstRowInGroup` prop for sidebar mode
3. ✅ `components/grouping/group-sidebar.tsx` - Add border-top to first group item

## Testing Checklist

- [ ] First row of groups at index 1+ has border-top in sidebar mode
- [ ] First group (index 0) does NOT have border-top
- [ ] Sidebar group items at index 1+ have matching border-top
- [ ] Sidebar group item at index 0 does NOT have border-top
- [ ] Border color is `foreground` with 25% opacity
- [ ] Border only appears in sidebar mode (`isGroupInline: false`)
- [ ] Border appears correctly even when groups are collapsed/expanded
- [ ] Border works in all views (Year, Month, Week)
- [ ] Border styling is theme-aware (light/dark mode)
