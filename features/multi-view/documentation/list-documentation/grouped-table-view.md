# Grouped Table View Documentation

## Overview

The Grouped Table View feature allows data to be organized into collapsible groups while maintaining full table functionality (sorting, filtering, search). Each group contains its own table header and data rows, creating a nested structure that can support single-level or multi-level grouping.

## Visual Structure

### ASCII Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GROUPED TABLE VIEW                        │
└─────────────────────────────────────────────────────────────┘

DEFAULT VIEW (No Grouping):
┌─────────────────────────────────────────────────────────────┐
│ [Table Header Row]                                           │
│ ┌──────────┬──────────┬──────────┬──────────┐               │
│ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │               │
│ └──────────┴──────────┴──────────┴──────────┘               │
├─────────────────────────────────────────────────────────────┤
│ [Data Row 1]                                                 │
│ [Data Row 2]                                                 │
│ [Data Row 3]                                                 │
└─────────────────────────────────────────────────────────────┘

SINGLE LEVEL GROUPING (Group by Company):
┌─────────────────────────────────────────────────────────────┐
│ ▼ [Company A]                    [Group Header Row]         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Table Header Row]                                       │ │
│ │ ┌──────────┬──────────┬──────────┬──────────┐         │ │
│ │ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │         │ │
│ │ └──────────┴──────────┴──────────┴──────────┘         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Data Row 1 - Company A]                                 │ │
│ │ [Data Row 2 - Company A]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ▼ [Company B]                    [Group Header Row]         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Table Header Row]                                       │ │
│ │ ┌──────────┬──────────┬──────────┬──────────┐         │ │
│ │ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │         │ │
│ │ └──────────┴──────────┴──────────┴──────────┘         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Data Row 1 - Company B]                                 │ │
│ │ [Data Row 2 - Company B]                                 │ │
│ │ [Data Row 3 - Company B]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

COLLAPSED GROUP:
┌─────────────────────────────────────────────────────────────┐
│ ▶ [Company A]                    [Group Header Row]         │
│   (Table header and rows hidden)                             │
├─────────────────────────────────────────────────────────────┤
│ ▼ [Company B]                    [Group Header Row]         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Table Header Row]                                       │ │
│ │ ┌──────────┬──────────┬──────────┬──────────┐         │ │
│ │ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │         │ │
│ │ └──────────┴──────────┴──────────┴──────────┘         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Data Row 1 - Company B]                                 │ │
│ │ [Data Row 2 - Company B]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

NESTED GROUPING (Group by Company, then by Status):
┌─────────────────────────────────────────────────────────────┐
│ ▼ [Company A]                    [Level 1 Group Header]      │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ ▼ [Active]                  [Level 2 Group Header]   │ │
│   │   ┌─────────────────────────────────────────────────┐ │ │
│   │   │ [Table Header Row]                              │ │ │
│   │   │ ┌──────────┬──────────┬──────────┬──────────┐ │ │ │
│   │   │ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │ │ │ │
│   │   │ └──────────┴──────────┴──────────┴──────────┘ │ │ │
│   │   ├─────────────────────────────────────────────────┤ │ │
│   │   │ [Data Row 1 - Company A, Active]                │ │ │
│   │   │ [Data Row 2 - Company A, Active]                │ │ │
│   │   └─────────────────────────────────────────────────┘ │ │
│   ├───────────────────────────────────────────────────────┤ │
│   │ ▶ [Completed]                [Level 2 Group Header] │ │
│   │   (Collapsed - table header and rows hidden)          │ │
│   └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ▼ [Company B]                    [Level 1 Group Header]      │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ ▼ [Active]                  [Level 2 Group Header]   │ │
│   │   ┌─────────────────────────────────────────────────┐ │ │
│   │   │ [Table Header Row]                              │ │ │
│   │   │ ┌──────────┬──────────┬──────────┬──────────┐ │ │ │
│   │   │ │ Col 1    │ Col 2    │ Col 3    │ Col 4    │ │ │ │
│   │   │ └──────────┴──────────┴──────────┴──────────┘ │ │ │
│   │   ├─────────────────────────────────────────────────┤ │ │
│   │   │ [Data Row 1 - Company B, Active]                │ │ │
│   │   └─────────────────────────────────────────────────┘ │ │
│   └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

STRUCTURE BREAKDOWN:
───────────────────────────────────────────────────────────────
Each Group Container (flex-col):
  Row 1: Collapsible Header (flex-row)
    - Chevron (▼ expanded / ▶ collapsed)
    - Group Key Value (e.g., "Company A", "Status: Active")
    - Optional: Group summary stats (count, totals, etc.)
  
  Row 2: Border + Items (only when expanded)
    - Light border-b (border-gray-200)
    - Table Header Row
      - Standard table header with sort/filter
      - Same columns as default view
      - Light border-b (border-gray-200)
    - Data Rows
      - Standard table rows
      - Same styling as default view
      - Filtered to this group's data
      - Each row has light border-b (border-gray-200)

Nested Groups:
  - Level 1 Group Container (indent: 0px)
    - Row 1: Collapsible Header
    - Row 2: Border + Items
      - Level 2 Group Container (indent: 20px)
        - Row 1: Collapsible Header
        - Row 2: Border + Items
          - Table Header Row (indent: 40px)
          - Data Rows (indent: 40px)
```

## Key Concepts

### 1. Group Structure
- **Group Header**: Collapsible row showing group key with chevron icon
- **Table Header**: Standard table header (sort/filter enabled) within each expanded group
- **Data Rows**: Standard table rows filtered to the group's data

### 2. Grouping Levels
- **Single Level**: Group by one field (e.g., `company.name`)
- **Nested Level**: Group by two fields (e.g., `company.name` then `status`)

### 3. State Management
- Each group can be independently expanded/collapsed
- Nested groups maintain separate expand/collapse state
- Supports expand all / collapse all operations

### 4. Functionality Preservation
- **Sorting**: Works within each group's table
- **Filtering**: Filters apply to all groups, updating group contents
- **Search**: Search highlights work in grouped view
- **Virtualization**: Maintains performance with large datasets

## Typography & Styling Quick Reference

### Required Typography Styles

| Element | Font Size | Font Weight | Text Color | Border | Tailwind Classes |
|---------|-----------|-------------|------------|--------|------------------|
| **Table Header** | Small | Light | Foreground 70% | `border-b border-gray-200` | `text-sm font-light text-foreground/70 border-b border-gray-200` |
| **Data Row** | Base | Normal | Foreground | `border-b border-gray-200` | `text-base font-normal text-foreground border-b border-gray-200` |
| **Group Header (Collapsible)** | Large | Semi-bold | Foreground | None | `text-lg font-semibold text-foreground` |

### Implementation Notes
- **Table Header**: Used for column headers within each group's table, has light bottom border
- **Data Row**: Standard table row styling for all data rows, each row has light bottom border
- **Group Header**: The collapsible group header row with chevron and group key (no border, border is on container's Row 2)
- **Group Container**: Flex column with 2 rows - Row 1 (collapsible header) and Row 2 (border + items)

### Example Usage

```tsx
// Complete Group Container Structure
<div className="flex flex-col">
  {/* Row 1: Collapsible + Header */}
  <div className="flex flex-row items-center gap-2 px-4 py-2">
    <ChevronDown className="w-4 h-4" />
    <span className="text-lg font-semibold text-foreground">
      {groupValue}
    </span>
  </div>
  
  {/* Row 2: Border + Items (only when expanded) */}
  {isExpanded && (
    <div className="border-b border-gray-200">
      {/* Table Header */}
      <div className="px-4 py-2 bg-gray-100">
        <div className="text-sm font-light text-foreground/70">
          {/* Header cells */}
        </div>
      </div>
      
      {/* Data Rows */}
      {items.map((item, index) => (
        <div key={index} className="border-b border-gray-200">
          <div className="px-4 py-2 text-base font-normal text-foreground hover:bg-gray-50">
            {/* Row cells */}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

## Implementation Plan

### Phase 1: Data Structure & Grouping Logic

#### 1.1 Create Grouping Utilities
**File:** `components/filtering-wrapper-multi-display/features/virtualized-list/utils/grouping-utils.ts`

**Purpose:** Core utilities for grouping data by one or more keys

**Key Functions:**
- `groupData<T>(data: T[], config: GroupConfig): GroupedData<T>[]` - Main grouping function
- Support for nested grouping (groupBy + subGroupBy)
- Custom formatters for group key display

**Type Definitions:**
```typescript
export interface GroupConfig {
  // Primary group key (e.g., "company.name")
  groupBy?: string;
  // Secondary group key for nested grouping (e.g., "status")
  subGroupBy?: string;
  // Custom group key formatter
  groupKeyFormatter?: (value: any) => string;
  // Custom sub-group key formatter
  subGroupKeyFormatter?: (value: any) => string;
}

export interface GroupedData<T> {
  groupKey: string;
  groupValue: any;
  items: T[];
  subGroups?: GroupedData<T>[];
}
```

#### 1.2 Create Group State Management Hook
**File:** `components/filtering-wrapper-multi-display/features/virtualized-list/hooks/useGroupState.ts`

**Purpose:** Manage expand/collapse state for groups and sub-groups

**Key Functions:**
- `isGroupExpanded(groupKey: string): boolean`
- `isSubGroupExpanded(groupKey: string, subGroupKey: string): boolean`
- `toggleGroup(groupKey: string): void`
- `toggleSubGroup(groupKey: string, subGroupKey: string): void`
- `expandAll(): void`
- `collapseAll(): void`

**State Structure:**
- Uses `Set<string>` for expanded group keys
- Uses `Map<string, Set<string>>` for expanded sub-group keys

### Phase 2: Component Structure

#### 2.1 Create Group Header Component
**File:** `components/filtering-wrapper-multi-display/features/virtualized-list/components/group-header.tsx`

**Purpose:** Render collapsible group header row

**Props:**
```typescript
interface GroupHeaderProps<T> {
  groupKey: string;
  groupValue: any;
  isExpanded: boolean;
  onToggle: () => void;
  level: number; // 0 for level 1, 1 for level 2, etc.
  itemCount: number;
  style?: React.CSSProperties; // For virtualization
  // Optional: Custom renderer for group header content
  renderGroupHeader?: (props: GroupHeaderProps<T>) => React.ReactNode;
}
```

**Features:**
- Chevron icon (ChevronDown/ChevronRight from lucide-react)
- Group key display with optional formatter
- Indentation based on level (`paddingLeft: level * 20px`)
- Click handler to toggle expand/collapse
- Optional summary stats (item count, totals, etc.)
- Hover effects and visual feedback

#### 2.2 Modify VirtualizedTableContainer
**File:** `components/filtering-wrapper-multi-display/features/virtualized-list/virtualized-table-container.tsx`

**Changes:**
1. Add `listViewConfig` prop to component props interface
2. Add grouping logic before rendering:
   ```typescript
   const groupedData = useMemo(() => {
     if (!listViewConfig?.groupBy) return null;
     return groupData(filteredData, listViewConfig);
   }, [filteredData, listViewConfig]);
   ```
3. Integrate group state hook:
   ```typescript
   const groupState = useGroupState(groupedData || []);
   ```
4. Modify `rowRenderer` to handle different row types:
   - Group header rows
   - Table header rows (within groups)
   - Data rows (within groups)

#### 2.3 Create Flattened Row Structure
**File:** `components/filtering-wrapper-multi-display/features/virtualized-list/utils/flatten-grouped-rows.ts`

**Purpose:** Convert grouped data structure into flat array for virtualization

**Type Definitions:**
```typescript
export interface FlattenedRow<T> {
  type: 'group-header' | 'sub-group-header' | 'table-header' | 'data-row';
  level?: number;
  groupKey?: string;
  subGroupKey?: string;
  data?: T;
  groupData?: GroupedData<T>;
}
```

**Function:**
```typescript
export function flattenGroupedRows<T>(
  groupedData: GroupedData<T>[],
  groupState: ReturnType<typeof useGroupState>
): FlattenedRow<T>[] {
  // Flatten structure:
  // - Group Header (if expanded)
  //   - Sub Group Header (if expanded)
  //     - Table Header
  //     - Data Rows
  //   - Sub Group Header (if expanded)
  //     - Table Header
  //     - Data Rows
}
```

**Logic:**
- Only include expanded groups in flattened array
- Maintain order: Group Header → Sub Group Headers → Table Header → Data Rows
- Preserve level information for indentation

### Phase 3: Row Rendering

#### 3.1 Modify Row Renderer
**File:** `components/filtering-wrapper-multi-display/features/virtualized-list/virtualized-table-container.tsx`

**Update `rowRenderer` function:**

```typescript
const rowRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
  const flattenedRow = flattenedRows[index];
  
  switch (flattenedRow.type) {
    case 'group-header':
      return (
        <GroupHeader
          groupKey={flattenedRow.groupKey!}
          groupValue={flattenedRow.groupData!.groupValue}
          isExpanded={groupState.isGroupExpanded(flattenedRow.groupKey!)}
          onToggle={() => groupState.toggleGroup(flattenedRow.groupKey!)}
          level={flattenedRow.level || 0}
          itemCount={flattenedRow.groupData!.items.length}
          style={style}
        />
      );
    
    case 'sub-group-header':
      return (
        <GroupHeader
          groupKey={flattenedRow.subGroupKey!}
          groupValue={/* sub-group value */}
          isExpanded={groupState.isSubGroupExpanded(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
          onToggle={() => groupState.toggleSubGroup(flattenedRow.groupKey!, flattenedRow.subGroupKey!)}
          level={flattenedRow.level || 1}
          itemCount={/* sub-group item count */}
          style={style}
        />
      );
    
    case 'table-header':
      return (
        <VirtualizedTableHeader
          columns={visibleColumns}
          sortConfig={sortConfig}
          handleSort={handleSort}
          activeFilters={filters}
          handleFilterChange={handleFilterChange}
          data={data}
          filteredData={filteredData}
          getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}
          autoApplyDropdown={autoApplyDropdown}
          showBadgesDropdown={showBadgesDropdown}
          rangeOpen={rangeOpen}
          filterUniqueValues={filterUniqueValues}
          onFilterApply={onFilterApply}
          style={style}
          isGrouped={true}
          groupLevel={flattenedRow.level}
        />
      );
    
    case 'data-row':
      return (
        <VirtualizedTableRow
          item={flattenedRow.data!}
          columns={visibleColumns}
          onRowClick={onRowClick}
          onActionClick={onActionClick}
          actionMode={actionMode}
          actionClickConfigs={actionConfigs?.(flattenedRow.data!)}
          globalSearchText={effectiveSearchText}
          truncateText={!dynamicRowHeight}
          isSelected={/* check selection */}
          editableColumns={editableColumns}
          onCellValueChange={onCellValueChange}
          rowIndex={index}
          calculatedRowHeight={calculatedRowHeight}
          groupStylerConfig={groupStylerConfig}
          rowStyler={rowStyler}
          searchHighlightStyle={searchHighlightStyle}
          style={style}
          isGrouped={true}
          groupLevel={flattenedRow.level}
          columnActions={columnActions}
        />
      );
  }
}, [flattenedRows, groupState, visibleColumns, /* ... */]);
```

#### 3.2 Update Row Height Calculation
**Modify `calculateRowHeight` function:**

```typescript
const calculateRowHeight = useCallback((index: number): number => {
  const flattenedRow = flattenedRows[index];
  
  switch (flattenedRow.type) {
    case 'group-header':
    case 'sub-group-header':
      return 40; // Fixed height for group headers
    
    case 'table-header':
      return 50; // Fixed height for table headers
    
    case 'data-row':
      // Use existing row height calculation
      const baseHeight = calculatedRowHeight;
      
      // If row expansion is enabled, check if this row is expanded
      if (rowExpansionEnabled && flattenedRow.data) {
        const rowId = (flattenedRow.data as any)?.id;
        if (rowId && isRowExpanded(rowId)) {
          const children = getChildren(rowId);
          const childrenCount = children.length;
          if (childrenCount === 0) {
            return baseHeight + 20;
          }
          const heightPerChild = 40;
          const expandedHeight = childrenCount * heightPerChild;
          return baseHeight + expandedHeight;
        }
      }
      
      return baseHeight;
  }
}, [flattenedRows, calculatedRowHeight, rowExpansionEnabled, isRowExpanded, getChildren]);
```

### Phase 4: Styling & Visual Adjustments

#### 4.1 Group Container Structure (Collapsible)
- **Layout**: Flex column container with 2 flex rows
- **Row 1**: Collapsible chevron + Group header text
- **Row 2**: Border + Table header and data rows

**Structure:**
```tsx
<div className="flex flex-col">
  {/* Row 1: Collapsible + Header */}
  <div className="flex flex-row items-center gap-2 px-4 py-2">
    <ChevronDown className="w-4 h-4" />
    <span className="text-lg font-semibold text-foreground">
      {groupValue}
    </span>
  </div>
  
  {/* Row 2: Border + Items (only when expanded) */}
  {isExpanded && (
    <div className="border-b border-gray-200">
      {/* Table header and data rows go here */}
    </div>
  )}
</div>
```

**Group Header Row (Row 1) Styling:**
- **Layout**: `flex flex-row` - Horizontal layout
- **Typography**: 
  - `text-lg` - Large text size
  - `font-semibold` - Semi-bold font weight
  - `text-foreground` - Default foreground color
- **Indentation**: `paddingLeft: level * 20px`
- **Spacing**: `gap-2` between chevron and text
- **Padding**: `px-4 py-2`
- **Chevron**: Positioned on left, rotates on expand/collapse

#### 4.2 Table Header Styling (Within Groups)
- **Typography**:
  - `text-sm` - Small text size
  - `font-light` - Light font weight
  - `text-foreground/70` - Foreground color with 70% opacity
- **Border**: Light bottom border (`border-b border-gray-200`)
- **Indentation**: Match group level (`paddingLeft: (level + 1) * 20px`)
- **Background**: Slightly different background (`bg-gray-100`) to distinguish from main header
- **Functionality**: Keep all sort/filter functionality
- **Visual separation**: Subtle border or shadow to indicate nested context

**Example:**
```tsx
<div className="border-b border-gray-200">
  <div className="px-4 py-2 bg-gray-100" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
    <div className="text-sm font-light text-foreground/70">
      {/* Header cells */}
    </div>
  </div>
</div>
```

#### 4.3 Data Row Styling (Within Groups)
- **Typography**:
  - `text-base` - Base text size
  - `font-normal` - Normal font weight
  - `text-foreground` - Default foreground color
- **Border**: Light bottom border (`border-b border-gray-200`)
- **Indentation**: Match group level (`paddingLeft: (level + 1) * 20px`)
- **Interactions**: Maintain hover, selection, and interaction states
- **Visual consistency**: Ensure rows align properly with indented headers

**Example:**
```tsx
<div className="border-b border-gray-200">
  <div 
    className="px-4 py-2 text-base font-normal text-foreground hover:bg-gray-50"
    style={{ paddingLeft: `${(level + 1) * 20}px` }}
  >
    {/* Row cells */}
  </div>
</div>
```

#### 4.4 Typography Summary

| Element | Font Size | Font Weight | Text Color | Border |
|---------|-----------|-------------|------------|--------|
| **Table Header** | `text-sm` | `font-light` | `text-foreground/70` | `border-b border-gray-200` |
| **Data Row** | `text-base` | `font-normal` | `text-foreground` | `border-b border-gray-200` |
| **Group Header (Collapsible)** | `text-lg` | `font-semibold` | `text-foreground` | None |

**Border Styling Notes:**
- **Table Header**: Light bottom border (`border-b border-gray-200`)
- **Data Rows**: Light bottom border (`border-b border-gray-200`)
- **Group Header**: No border (border is on the container's Row 2 which wraps all items)

### Phase 5: Integration with FilteringWrapper

#### 5.1 Add List View Config to FilteringWrapper Props
**File:** `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

**Add to interface:**
```typescript
interface FilteringWrapperProps<T extends Record<string, any> = Record<string, any>> {
  // ... existing props
  listViewConfig?: GroupConfig;
}
```

#### 5.2 Pass List View Config to VirtualizedTableContainer
Pass `listViewConfig` prop through to `VirtualizedTableComponent`:

```typescript
<VirtualizedTableComponent
  // ... existing props
  listViewConfig={listViewConfig}
/>
```

#### 5.3 Update Type Exports
**File:** `components/filtering-wrapper-multi-display/types/index.ts`

Export group-related types:
```typescript
export type { GroupConfig, GroupedData } from '../features/virtualized-list/utils/grouping-utils';
```

### Phase 6: Testing & Edge Cases

#### 6.1 Empty Groups
- Handle groups with no items gracefully
- Show group header with count of 0
- Don't render table header or rows for empty groups

#### 6.2 All Groups Collapsed
- Show only group headers
- Maintain virtualization performance
- Allow expand all functionality

#### 6.3 Sorting
- Ensure sorting works within each group's table
- Sorting should not affect group structure
- Group order can be sorted separately if needed

#### 6.4 Filtering
- Filters apply to all groups
- Groups update their contents based on filters
- Empty groups after filtering should be hidden or shown with 0 count

#### 6.5 Search
- Search highlights work in grouped view
- Search results respect group structure
- Search can filter groups (hide groups with no matches)

#### 6.6 Pagination
- Consider how pagination interacts with grouping
- Options:
  - Paginate groups (show N groups per page)
  - Paginate items within groups
  - Disable pagination when grouping is active

#### 6.7 Performance
- Virtualization should work with grouped structure
- Flattened row array should be memoized
- Group calculations should be memoized
- Row height calculations should be optimized

#### 6.8 Nested Group Edge Cases
- Handle groups with no sub-groups
- Handle sub-groups with no items
- Handle deeply nested structures (3+ levels if needed)

## File Structure Summary

```
components/filtering-wrapper-multi-display/features/virtualized-list/
├── virtualized-table-container.tsx (MODIFY)
│   - Add listViewConfig prop
│   - Add grouping logic
│   - Modify rowRenderer for grouped rows
│   - Update row height calculation
│
├── components/
│   ├── group-header.tsx (NEW)
│   │   - GroupHeader component
│   │   - Chevron icon and toggle logic
│   │   - Indentation based on level
│   │
│   └── rows/
│       └── table-row.tsx (MODIFY)
│           - Add group styling props (isGrouped, groupLevel)
│           - Add indentation styling
│
├── hooks/
│   └── useGroupState.ts (NEW)
│       - Group expand/collapse state management
│       - Support for nested groups
│
└── utils/
    ├── grouping-utils.ts (NEW)
    │   - groupData function
    │   - GroupConfig and GroupedData types
    │
    └── flatten-grouped-rows.ts (NEW)
        - flattenGroupedRows function
        - FlattenedRow type
        - Convert grouped structure to flat array
```

## Configuration Example

### Basic Usage

```typescript
// In page component
import { FilteringWrapper } from '@/components/filtering-wrapper-multi-display/filtering-wrapper';
import type { GroupConfig } from '@/components/filtering-wrapper-multi-display/types';

const listViewConfig: GroupConfig = {
  groupBy: "company.name",
  groupKeyFormatter: (value) => `Company: ${value || 'Unknown'}`,
};

<FilteringWrapper
  data={projects}
  columns={tableColumns}
  listViewConfig={listViewConfig}
  filterConfig={filterConfig}
  tableConfig={tableConfig}
  // ... other props
/>
```

### Nested Grouping

```typescript
const listViewConfig: GroupConfig = {
  groupBy: "company.name",
  subGroupBy: "status",
  groupKeyFormatter: (value) => `Company: ${value || 'Unknown'}`,
  subGroupKeyFormatter: (value) => `Status: ${value || 'Unknown'}`,
};

<FilteringWrapper
  data={projects}
  columns={tableColumns}
  listViewConfig={listViewConfig}
  // ... other props
/>
```

### With Custom Group Header Renderer

```typescript
const listViewConfig: GroupConfig = {
  groupBy: "company.name",
  groupKeyFormatter: (value) => value || 'Unknown',
};

// In GroupHeader component, you can pass a custom renderer:
const renderGroupHeader = (props: GroupHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <span>{props.groupValue}</span>
      <span className="text-xs text-gray-500">
        ({props.itemCount} items)
      </span>
    </div>
  );
};
```

## Migration Notes

### When to Use Grouped View
- Data has natural groupings (e.g., by company, status, date ranges)
- Users need to see data organized by category
- Collapsible groups help manage large datasets
- Need to maintain sort/filter functionality within groups

### When NOT to Use Grouped View
- Simple flat lists without natural groupings
- Performance-critical scenarios with very large datasets (consider pagination first)
- When column grouping (accordion) is more appropriate

### Backward Compatibility
- Grouped view is optional (listViewConfig is optional)
- Default behavior (no grouping) remains unchanged
- Existing table functionality preserved when grouping is enabled

## Per-Group Sorting

### Overview

Per-group sorting allows each group (and sub-group) to have its own independent sort configuration. When you click a sort button in a group's table header, only the items within that specific group are sorted, not the entire dataset.

### How It Works

1. **Independent Sort State**: Each group/sub-group maintains its own sort configuration (column key and direction)
2. **Group-Specific Handlers**: Each table header within a group has its own sort handler that only affects that group's items
3. **Isolated Sorting**: Sorting in one group does not affect items in other groups
4. **Persistent State**: Sort configurations persist when groups are collapsed/expanded

### Implementation Details

#### State Management

**File:** `hooks/useGroupSortState.ts`

- Maintains a `Map<string, SortConfig>` where the key is `${groupKey}${subGroupKey || ''}`
- Provides methods to get/set sort config for specific groups
- Handles sort toggle logic (ascending → descending → none)

#### Sorting Logic

**File:** `utils/sort-grouped-data.ts`

- Takes grouped data and per-group sort configurations
- Recursively sorts items within each group/sub-group
- Uses the same sorting logic as the main table (handles numbers, strings, dates)

#### Integration

**File:** `virtualized-list-container.tsx`

- Applies per-group sorting after grouping but before flattening
- Creates group-specific sort handlers in `rowRenderer`
- Passes group-specific sort config to each table header

### Usage

Per-group sorting is automatically enabled when `listViewConfig` is provided. Users can:

1. Click sort buttons in any group's table header
2. Each group maintains its own sort state independently
3. Sort configurations persist across group expand/collapse

### Example

```
Group A (sorted by name, ascending)
  - Item 1
  - Item 2
  - Item 3

Group B (sorted by date, descending)
  - Item 5 (newest)
  - Item 4 (oldest)
```

## Future Enhancements

1. **Group Summary Rows**: Show totals, averages, or other aggregations per group
2. **Group-Level Sorting**: Sort groups themselves (e.g., by group key, by item count)
3. **Group Actions**: Bulk actions on all items in a group
4. **Group Persistence**: Save expand/collapse and sort state to localStorage
5. **Virtual Group Headers**: Optimize rendering for many groups
6. **Custom Group Styling**: Per-group colors, icons, or styling
7. **Group Filtering**: Filter groups themselves (e.g., show only groups with >5 items)
