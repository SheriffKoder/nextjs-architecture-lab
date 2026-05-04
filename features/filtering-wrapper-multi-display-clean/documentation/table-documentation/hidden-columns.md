# Hidden Columns Documentation

## Overview

The VirtualizedTable component supports hidden columns - columns that are searchable and filterable but not displayed in the table. This is useful for adding searchable metadata that shouldn't clutter the UI, such as child task names, computed fields, or backend-only search fields.

## Basic Setup

### 1. Add `isHidden` Property to Column Config

Mark a column as hidden by setting `isHidden: true`:

```typescript
export const allColumns: Record<string, TableColumn<TaskTableItem>> = {
  // ... other columns
  
  child_names: {
    key: "child_names",
    name: "Child Names",
    sortable: false,
    isSearchable: true, // Still searchable even though hidden
    isHidden: true, // Hide from table display
    formatter: (value) => {
      if (!value || !Array.isArray(value)) return '';
      return value.join(' '); // Join child names for search
    }
  }
};
```

### 2. Include Hidden Column in `tableColumns`

Hidden columns must still be included in `tableColumns` to be searchable:

```typescript
export const tableColumns: TableColumn<TaskTableItem>[] = createColumnArray([
  'title',
  'project',
  'type',
  'status',
  'assignees',
  'due',
  'child_names' // Hidden but included for search
]);
```

## Use Case: Child Task Names Search

### Problem
When searching for a child task name, we want the parent task to appear in results, but we don't want to display a "Child Names" column in the table.

### Solution
1. **Collect child names in data transformation** (`TasksTable.tsx`):
```typescript
// Group children by parent_id to collect child names
const childrenByParent = new Map<string, string[]>()
allTasksWithProjectNames.forEach(task => {
  if (task.parent_id) {
    const existing = childrenByParent.get(task.parent_id) || []
    childrenByParent.set(task.parent_id, [...existing, task.title])
  }
})

// Add child_names to each parent task
const tasksWithChildrenFlag = tasksWithoutChildren.map(task => ({
  ...task,
  hasChildren: parentIds.has(task.id),
  child_names: childrenByParent.get(task.id) || [] // Array of child task titles
}))
```

2. **Define hidden searchable column** (`tasks.ts`):
```typescript
child_names: {
  key: "child_names",
  name: "Child Names",
  sortable: false,
  isSearchable: true, // Enable search
  isHidden: true, // Hide from display
  formatter: (value) => {
    if (!value || !Array.isArray(value)) return '';
    return value.join(' '); // Convert array to searchable string
  }
}
```

3. **Include in tableColumns**:
```typescript
export const tableColumns: TableColumn<TaskTableItem>[] = createColumnArray([
  'title',
  'project',
  'type',
  'status',
  'assignees',
  'due',
  'child_names' // Hidden but searchable
]);
```

## Implementation Details

### How Hidden Columns Work

1. **Table Header** (`table-header.tsx`):
   - Checks `column.isHidden` before rendering header cells
   - Skips hidden columns in the map function
   - Excludes hidden columns from width calculations

2. **Table Rows** (`table-row.tsx`):
   - Checks `column.isHidden` before rendering cells
   - Returns `null` for hidden column cells
   - Excludes hidden columns from width calculations

3. **Search Functionality**:
   - Hidden columns are still included in the `columns` prop
   - Search filters by `isSearchable !== false`, so hidden columns with `isSearchable: true` are searched
   - The `formatter` function converts the data to a searchable string

### Width Calculation: `calculateTotalMinWidth`

Both `table-header.tsx` and `table-row.tsx` use `calculateTotalMinWidth` to ensure proper width handling. This function:

1. **Excludes hidden columns** from width calculation:
```typescript
const calculateTotalMinWidth = () => {
  let totalMinWidth = 0;
  columns.forEach((column, index) => {
    // Skip hidden columns in width calculation
    if (column.isHidden) {
      return;
    }
    const minWidth = getColumnMinWidth(column, index);
    const numericValue = parseInt(minWidth);
    if (!isNaN(numericValue)) {
      totalMinWidth += numericValue;
    }
  });
  return totalMinWidth > 0 ? `${totalMinWidth}px` : '100%';
};
```

2. **Why exclude hidden columns?**
   - Hidden columns shouldn't affect the visible table width
   - Only visible columns contribute to the minimum width requirement
   - Ensures the table width matches what users actually see

3. **Applied in both components**:
   - **Table Header**: Sets `minWidth` on the header container div
   - **Table Row**: Sets `minWidth` on the row container div and row content div

## Complete Example

```typescript
// tasks.ts
export interface TaskTableItem {
  id: string;
  title: string;
  // ... other fields
  child_names?: string[]; // Array of child task titles
}

export const allColumns: Record<string, TableColumn<TaskTableItem>> = {
  title: {
    key: "title",
    name: "Title",
    // ... visible column config
  },
  
  // Hidden column for child names search
  child_names: {
    key: "child_names",
    name: "Child Names",
    sortable: false,
    isSearchable: true, // Searchable
    isHidden: true, // Hidden from display
    formatter: (value) => {
      if (!value || !Array.isArray(value)) return '';
      return value.join(' '); // Convert array to searchable string
    }
  }
};

// Include in tableColumns for searchability
export const tableColumns: TableColumn<TaskTableItem>[] = createColumnArray([
  'title',
  'project',
  'type',
  'status',
  'assignees',
  'due',
  'child_names' // Hidden but searchable
]);
```

```typescript
// TasksTable.tsx
const transformedTasks = useMemo(() => {
  // ... transform tasks
  
  // Group children by parent_id
  const childrenByParent = new Map<string, string[]>()
  allTasksWithProjectNames.forEach(task => {
    if (task.parent_id) {
      const existing = childrenByParent.get(task.parent_id) || []
      childrenByParent.set(task.parent_id, [...existing, task.title])
    }
  })
  
  // Add child_names to parent tasks
  const tasksWithChildrenFlag = tasksWithoutChildren.map(task => ({
    ...task,
    hasChildren: parentIds.has(task.id),
    child_names: childrenByParent.get(task.id) || []
  }))
  
  return tasksWithChildrenFlag;
}, [tasks, isAdmin, userId]);
```

## Best Practices

1. **Always include hidden columns in `tableColumns`**: They need to be in the columns array to be searchable

2. **Use `formatter` for data transformation**: Convert complex data (arrays, objects) to searchable strings

3. **Don't set width/minWidth on hidden columns**: They're excluded from width calculations anyway

4. **Keep hidden columns simple**: They're for search/filter purposes, not display

5. **Document hidden columns**: Add comments explaining why they exist

## Notes

- Hidden columns are **not rendered** in the table header or rows
- Hidden columns are **excluded from width calculations** in both header and rows
- Hidden columns are **still searchable** if `isSearchable: true`
- Hidden columns can still be used for **filtering** if `filterable: true`
- The `formatter` function is used for search matching, so ensure it returns a searchable string
