# TableFilters Dropdown Structure Visualization

This document visualizes the structure of the old TableFilters dropdown system, showing how different filter types are organized.

## 1. **DROPDOWN** (StandardFilterDropdown)

```
┌─────────────────────────────────────────┐
│ Header                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Filter: ColumnName  [2/10]  [↑↓]   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Active Filters (if active)              │
│ ┌─────────────────────────────────────┐ │
│ │ Active Filters: [Clear All]        │ │
│ │ [Filter1 ×] [Filter2 ×]            │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Range Filter (if date/number/time)      │
│ ┌─────────────────────────────────────┐ │
│ │ [Expandable Range Section]          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Search                                  │
│ ┌─────────────────────────────────────┐ │
│ │ [Search input...]                   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ List (Virtualized)                      │
│ ┌─────────────────────────────────────┐ │
│ │ ☑ Option 1              [5]         │ │
│ │ ☐ Option 2              [3/10]     │ │
│ │ ☐ Option 3              [2]         │ │
│ │ ☑ Option 4              [1]         │ │
│ │ ... (scrollable)                    │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Footer                                  │
│ ┌─────────────────────────────────────┐ │
│ │ [Clear]        [Cancel] [Apply]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 2. **SEARCH** (Search Input Section)

```
┌─────────────────────────────────────────┐
│ Search                                  │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Search...                        │ │
│ │ (border-bottom focus effect)       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 3. **RANGE COMPONENTS**

### **Date Range Filter:**
```
┌─────────────────────────────────────────┐
│ Filter by range  [−]                   │
│ (Expandable header)                     │
├─────────────────────────────────────────┤
│ Start Date                              │
│ ┌─────┐ ┌─────┐ ┌──────┐              │
│ │ MM  │ │ DD  │ │ YYYY │              │
│ └─────┘ └─────┘ └──────┘              │
│ Month  Day    Year                     │
│                                         │
│ End Date                                │
│ ┌─────┐ ┌─────┐ ┌──────┐              │
│ │ MM  │ │ DD  │ │ YYYY │              │
│ └─────┘ └─────┘ └──────┘              │
│ Month  Day    Year                     │
│                                         │
│ [Clear]                    [Apply]     │
└─────────────────────────────────────────┘
```

### **Number Range Filter:**
```
┌─────────────────────────────────────────┐
│ Filter by range  [−]                   │
│ (Expandable header)                     │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌──────┐     │
│ │  Min    │ │  Max    │ │Apply │     │
│ └─────────┘ └─────────┘ └──────┘     │
│                                         │
│ (Error message if invalid)             │
└─────────────────────────────────────────┘
```

## 4. **LIST** (Virtualized Options List)

```
┌─────────────────────────────────────────┐
│ List Items (Virtualized)                │
│ ┌─────────────────────────────────────┐ │
│ │ ☑ Active        [5]                 │ │
│ │ ☐ Pending       [3/10]              │ │
│ │ ☐ Inactive      [2]                 │ │
│ │ ☑ Completed     [1]                  │ │
│ │ ☐ Archived      [0/5] (greyed)      │ │
│ │ ...                                  │ │
│ │ (scrollable, max-height: 224px)     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Features:
- Checkbox (☑/☐) on left
- Option label in middle
- Count badge on right:
  * Selected: [count] (tertiary badge)
  * Unselected (with other filters): [filtered/total] (muted)
  * Unselected (no other filters): [total] (green)
- Selected items: gradient background
- Greyed out if not selectable
- Hover effects
```

## Complete Structure Flow:

```
┌─────────────────────────────────────────┐
│ 1. HEADER                               │
│    - Title + Count Badge + Sort         │
├─────────────────────────────────────────┤
│ 2. ACTIVE FILTERS (conditional)        │
│    - Badges with X buttons              │
├─────────────────────────────────────────┤
│ 3. RANGE FILTER (conditional)           │
│    - Expandable section                 │
│    - Date/Number/Time inputs            │
├─────────────────────────────────────────┤
│ 4. SEARCH                               │
│    - Text input with focus effect       │
├─────────────────────────────────────────┤
│ 5. LIST                                 │
│    - Virtualized scrollable list        │
│    - Checkboxes + Labels + Counts       │
├─────────────────────────────────────────┤
│ 6. FOOTER                               │
│    - Clear | Cancel | Apply            │
└─────────────────────────────────────────┘
```

## Key Components:

1. **Header**: Shows filter title, selected/available count badge, and sort toggle button
2. **Active Filters**: Displays currently applied filters as removable badges (only shown when filters are active)
3. **Range Filter**: Expandable section for date/number/time range filtering (only shown for range-type fields)
4. **Search**: Text input for filtering the option list
5. **List**: Virtualized scrollable list of filter options with checkboxes and count badges
6. **Footer**: Action buttons (Clear, Cancel, Apply)

## Differences from PillFilter:

1. **Dropdown**: Single dropdown vs. two-column panel
2. **Search**: Inside dropdown vs. integrated in pill
3. **Range**: Expandable sections vs. always visible inputs + quick list
4. **List**: Virtualized dropdown list vs. always-visible list panel
