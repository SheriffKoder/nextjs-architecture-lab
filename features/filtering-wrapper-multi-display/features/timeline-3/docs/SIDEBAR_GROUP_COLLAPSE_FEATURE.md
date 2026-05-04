# Group Collapse Feature

## Overview
This feature adds the ability to collapse/expand groups in both sidebar and inline grouping modes. When a group is collapsed:
- **Sidebar Mode**: Sidebar cell height reduces to 1 row, timeline shows 1 empty row (filtering out all events)
- **Inline Mode**: Header row remains visible, but all data rows for that group are hidden (filtering out all events)

## Implementation Details

### 1. State Management
- **Location**: `timeline-container.tsx`
- **State**: `collapsedGroups: Set<string | null>`
- **Purpose**: Tracks which groups are currently collapsed (shared between sidebar and inline modes)
- **Handler**: `handleGroupToggle(groupKey: string | null)` - toggles collapse state for a group

### 2. UI Components

#### GroupSidebar Component (Sidebar Mode)
- **Chevron Icon**: Added on the left side of each group label
  - `ChevronDown` when expanded
  - `ChevronRight` when collapsed
- **Button Behavior**: 
  - Clicking chevron toggles collapse state (stops event propagation)
  - Clicking group label still triggers `onGroupClick` (for selection/filtering)
- **Visual Feedback**: Hover states and transitions

#### GroupHeaderRow Component (Inline Mode)
- **Chevron Icon**: Added on the left side of each group header label
  - `ChevronDown` when expanded
  - `ChevronRight` when collapsed
- **Button Behavior**:
  - Clicking chevron toggles collapse state
  - Group label remains clickable for selection/filtering
- **Visual Feedback**: Hover states and transitions
- **Positioning**: Chevron appears in the sticky label overlay

### 3. Data Filtering Logic

#### Sidebar Mode (`isGroupInline = false`)

**When Group is Collapsed:**
- **Sidebar Height**: Reduced to `1 * rowHeight` (single row)
- **Timeline Rows**: Replaced with 1 empty row (no events displayed)
- **Item Count**: Shows original count in tooltip, but displays as 1 row

**When Group is Expanded:**
- **Sidebar Height**: `itemCount * rowHeight` (full height)
- **Timeline Rows**: All items for that group are displayed
- **Item Count**: Actual count displayed

#### Inline Mode (`isGroupInline = true`)

**When Group is Collapsed:**
- **Header Row**: Remains visible (shows chevron and group label)
- **Data Rows**: All data rows for that group are skipped (not rendered)
- **Timeline**: Only header row appears, no events displayed for that group

**When Group is Expanded:**
- **Header Row**: Visible with expanded chevron
- **Data Rows**: All items for that group are displayed normally
- **Timeline**: Full group structure visible

### 4. Implementation Flow

#### Sidebar Mode:
1. **User clicks chevron** → `onGroupToggle` called
2. **State updated** → `collapsedGroups` Set modified
3. **useEffect triggered** → Grouping logic recalculates
4. **Filtered data** → Collapsed groups replaced with empty rows
5. **Sidebar updated** → Heights and chevron icons updated
6. **Timeline re-rendered** → Only expanded groups show events

#### Inline Mode:
1. **User clicks chevron in header** → `onGroupToggle` called
2. **State updated** → `collapsedGroups` Set modified
3. **useEffect triggered** → Grouping logic recalculates
4. **Rendering logic filters** → Data rows for collapsed groups are skipped
5. **Header updated** → Chevron icon updated
6. **Timeline re-rendered** → Only header row visible for collapsed groups

### 5. Key Changes

#### timeline-container.tsx
- Add `collapsedGroups` state (shared for both modes)
- Add `handleGroupToggle` callback
- **Sidebar grouping logic**: 
  - Check collapse state for each group
  - Calculate display height (1 row if collapsed, full height if expanded)
  - Filter timeline data (empty array for collapsed groups)
- **Inline grouping logic**:
  - No changes needed in data structure (header rows remain)
  - Rendering logic filters data rows based on collapse state
- Pass `collapsedGroups` and `onGroupToggle` to both `GroupSidebar` and `GroupHeaderRow`
- Add `collapsedGroups` to useEffect dependencies

#### group-sidebar.tsx
- Add `collapsedGroups` and `onGroupToggle` props
- Import `ChevronDown` and `ChevronRight` from `lucide-react`
- Add chevron button before group label
- Update cell height based on collapse state
- Prevent event propagation on chevron click

#### group-header-row.tsx
- Add `collapsedGroups` and `onGroupToggle` props
- Import `ChevronDown` and `ChevronRight` from `lucide-react`
- Add chevron button before group label in overlay
- Update chevron icon based on collapse state
- Make overlay interactive (remove `pointer-events-none` from container, add to label)
- Prevent event propagation on chevron click

#### year-month-week-view.tsx (or day-view.tsx)
- Pass `collapsedGroups` and `onGroupToggle` to `GroupHeaderRow`
- Filter data rows when rendering: skip `group.items` if group is collapsed
- Only render header row for collapsed groups (no data rows)

### 6. User Experience

- **Visual Indicator**: Chevron clearly shows expand/collapse state in both modes
- **Smooth Transitions**: Height changes (sidebar) and row visibility (inline) are animated
- **Persistent State**: Collapse state persists during view changes and data updates
- **Unified Behavior**: Same collapse state works across both grouping modes
- **Accessibility**: Button has proper title attributes for screen readers

### 7. Edge Cases Handled

- **Empty Groups**: Handled gracefully (no items to collapse)
- **Single Item Groups**: Can still be collapsed
- **All Groups Collapsed**: 
  - Sidebar: Timeline shows only empty rows
  - Inline: Timeline shows only header rows
- **State Persistence**: Collapse state maintained during view/data changes
- **Event Propagation**: Chevron click doesn't trigger group selection
- **Mode Switching**: Collapse state persists when switching between inline/sidebar modes

## Files Modified

1. `components/filtering-wrapper-multi-display/features/timeline-3/timeline-container.tsx`
   - State management (shared for both modes)
   - Sidebar data filtering logic
   - Props passing to both components

2. `components/filtering-wrapper-multi-display/features/timeline-3/components/grouping/group-sidebar.tsx`
   - UI components (chevron button)
   - Collapse state handling
   - Visual updates

3. `components/filtering-wrapper-multi-display/features/timeline-3/components/header-rows/group-header-row.tsx`
   - UI components (chevron button)
   - Collapse state handling
   - Interactive overlay

4. `components/filtering-wrapper-multi-display/features/timeline-3/components/main/year-month-week-view.tsx`
   - Pass collapse props to GroupHeaderRow
   - Filter data rows based on collapse state

5. `components/filtering-wrapper-multi-display/features/timeline-3/components/main/day-view.tsx` (if applicable)
   - Same changes as year-month-week-view.tsx

## Testing Checklist

### Sidebar Mode:
- [ ] Click chevron to collapse group → Sidebar height reduces, timeline shows 1 empty row
- [ ] Click chevron to expand group → Sidebar height increases, timeline shows all items
- [ ] Click group label (not chevron) → Group selection still works
- [ ] Collapse multiple groups → All collapsed groups show 1 row each
- [ ] Change view (Year/Month/Week/Day) → Collapse state persists
- [ ] Update data → Collapse state persists
- [ ] Tooltip shows correct item count even when collapsed
- [ ] Hover states work correctly on chevron and label

### Inline Mode:
- [ ] Click chevron in header to collapse group → Header remains, data rows hidden
- [ ] Click chevron in header to expand group → All data rows visible
- [ ] Click group label (not chevron) → Group selection still works
- [ ] Collapse multiple groups → All collapsed groups show only headers
- [ ] Change view (Year/Month/Week/Day) → Collapse state persists
- [ ] Update data → Collapse state persists
- [ ] Chevron icon updates correctly (down/right)
- [ ] Hover states work correctly on chevron and label

### Cross-Mode:
- [ ] Switch from sidebar to inline mode → Collapse state preserved
- [ ] Switch from inline to sidebar mode → Collapse state preserved
- [ ] Collapse in one mode, switch to other → State correctly applied
