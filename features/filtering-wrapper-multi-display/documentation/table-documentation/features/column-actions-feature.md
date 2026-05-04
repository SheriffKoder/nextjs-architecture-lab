# Column Actions Feature

## Overview
The Column Actions feature allows you to create interactive cells (like checkboxes, buttons, or custom controls) that can trigger actions when clicked. This feature separates cell rendering logic from action handling, making it reusable and maintainable.

## Feature Description
- **cellRenderer**: A function in your column definition that receives the cell value, the full row item, and an optional action handler
- **columnActions**: A prop passed to `FilteringWrapper` that maps column keys to action handler functions
- When a user interacts with the cell (e.g., clicks a checkbox), the action handler is called with the item and the new value

## Complete Implementation Flow

### Step 1: Update Your Column Definition (cellRenderer)

**Location:** Your table config file (e.g., `features/admin-panel/config/tasks-table-config.ts`)

**Current State:** You have a basic `cellRenderer` that doesn't accept parameters yet:

```typescript
status: {
  key: "status",
  name: "Status",
  cellRenderer: () => {
    // Your current renderer without parameters
    return <div>Status</div>;
  }
}
```

**Update to:** Add the three parameters to your `cellRenderer`:

```typescript
status: {
  key: "status",
  name: "Status",
  cellRenderer: (
    value: any,                                    // The cell value (e.g., TaskStatusEnum.ACTIVE)
    item?: AdminTaskTableItem,                     // The full row data
    columnAction?: (item: AdminTaskTableItem, value: any) => void | Promise<void>  // The action handler
  ): React.ReactElement | null => {
    // Check if status is active (checked) or inactive (unchecked)
    const isChecked = value === TaskStatusEnum.ACTIVE;
    
    return React.createElement('div', {
      className: 'flex items-center justify-center px-4 w-full h-full'
    }, React.createElement(Checkbox, {
      checked: isChecked,
      onCheckedChange: async (checked: boolean) => {
        // Call the action handler if it exists
        if (item && columnAction) {
          await columnAction(item, checked);
        }
      },
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click when clicking checkbox
      }
    }));
  }
}
```

**Key Points:**
- `value`: The raw cell value from your data (e.g., `item.status`)
- `item`: The complete row object (useful for accessing other fields like `item.id`)
- `columnAction`: The handler function passed via `columnActions` prop (will be `undefined` if not provided)

---

### Step 2: Create the Action Handler in Your Container Component

**Location:** Your container component (e.g., `features/admin-panel/default-tasks/components/phase-1-container.tsx`)

**Add the handler function:**

```typescript
/**
 * Handle status change when checkbox is clicked
 * Converts checked boolean to TaskStatusEnum and calls mutation
 * 
 * @param {AdminTaskTableItem} item - The task item
 * @param {boolean} checked - The checked state from the checkbox
 */
const handleStatusChange = (item: AdminTaskTableItem, checked: boolean) => {
  // Convert checked boolean to TaskStatusEnum
  const newStatus = checked ? TaskStatusEnum.ACTIVE : TaskStatusEnum.INACTIVE;
  
  // Call your mutation or API function
  statusMutation.mutate({
    id: item.id,
    status: newStatus,
  });
};
```

**Key Points:**
- The handler receives the full `item` (so you can access `item.id`, `item.name`, etc.)
- The handler receives the new `value` (the value from your cell renderer's interaction)
- You can perform any action here: API calls, mutations, state updates, etc.

---

### Step 3: Pass columnActions to FilteringWrapper

**Location:** Same container component where you render `FilteringWrapper`

**Add the `columnActions` prop:**

```typescript
<FilteringWrapper
  data={tasks}
  columns={tableColumns}
  onRowClick={handleRowClick}
  onActionClick={handleActionClick}
  filterConfig={filterConfig}
  tableConfig={tableConfig}
  // Add this prop:
  columnActions={{
    status: handleStatusChange  // Maps the "status" column key to the handler
  }}
/>
```

**Key Points:**
- `columnActions` is an object where keys match your column `key` values
- Each value is the action handler function you defined in Step 2
- You can define multiple column actions:
  ```typescript
  columnActions={{
    status: handleStatusChange,
    priority: handlePriorityChange,
    assignee: handleAssigneeChange,
  }}
  ```

---

## Complete Data Flow

```
1. User clicks checkbox in status cell
   ↓
2. cellRenderer's onCheckedChange fires
   ↓
3. cellRenderer calls: columnAction(item, checked)
   ↓
4. FilteringWrapper looks up: columnActions['status']
   ↓
5. Calls: handleStatusChange(item, checked)
   ↓
6. Handler converts boolean to TaskStatusEnum
   ↓
7. Handler calls mutation/API to update status
```

---

## How It Works Internally

### In the Table Row Component

**File:** `features/filtering-wrapper-multi-display/features/virtualized-table/components/rows/table-row.tsx`

```typescript
// Line 445: Look up the action handler for this column
const columnAction = columnActions?.[column.key];

// Line 448-449: Pass it to cellRenderer
const displayValue = column.cellRenderer 
  ? column.cellRenderer(value, item, columnAction)
  : formatCellValue({ value, column });
```

**What happens:**
1. The table row component receives `columnActions` as a prop
2. For each cell, it looks up the action handler using `column.key` (e.g., `"status"`)
3. It passes the handler as the third parameter to `cellRenderer`
4. If no handler is provided for that column, `columnAction` will be `undefined`

---

## Type Definitions

### Column Action Handler Type

```typescript
type ColumnAction<T> = (item: T, value: any) => void | Promise<void>;
```

- `item`: The full row data object
- `value`: The new value from the cell interaction
- Returns: `void` or `Promise<void>` (supports async operations)

### ColumnActions Prop Type

```typescript
columnActions?: Record<string, (item: T, value: any) => void | Promise<void>>;
```

- Keys: Column keys (must match `column.key` values)
- Values: Action handler functions

### cellRenderer Type

```typescript
cellRenderer?: (
  value: any,
  item?: T,
  columnAction?: (item: T, value: any) => void | Promise<void>
) => React.ReactElement | null;
```

---

## Example: Checkbox Cell Renderer

**Complete example for a status checkbox:**

```typescript
// In your column config
status: {
  key: "status",
  name: "Status",
  cellRenderer: (value, item?, columnAction?) => {
    const isChecked = value === TaskStatusEnum.ACTIVE;
    
    return (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isChecked}
          onCheckedChange={async (checked: boolean) => {
            if (item && columnAction) {
              await columnAction(item, checked);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }
}
```

---

## Example: Button Cell Renderer

**Example for an action button:**

```typescript
// In your column config
actions: {
  key: "actions",
  name: "Actions",
  cellRenderer: (value, item?, columnAction?) => {
    return (
      <button
        onClick={() => {
          if (item && columnAction) {
            columnAction(item, 'edit');
          }
        }}
      >
        Edit
      </button>
    );
  }
}

// In your container
const handleEdit = (item: MyItem, action: string) => {
  if (action === 'edit') {
    router.push(`/edit/${item.id}`);
  }
};

// In FilteringWrapper
<FilteringWrapper
  columnActions={{
    actions: handleEdit
  }}
/>
```

---

## Best Practices

1. **Always check for existence**: Always check if `item` and `columnAction` exist before calling:
   ```typescript
   if (item && columnAction) {
     await columnAction(item, newValue);
   }
   ```

2. **Prevent event bubbling**: Use `e.stopPropagation()` to prevent row clicks when interacting with cells:
   ```typescript
   onClick={(e) => e.stopPropagation()}
   ```

3. **Handle async operations**: If your action handler is async, use `await`:
   ```typescript
   onCheckedChange={async (checked) => {
     if (item && columnAction) {
       await columnAction(item, checked);
     }
   }}
   ```

4. **Type safety**: Use proper TypeScript types for your item type:
   ```typescript
   cellRenderer: (
     value: any,
     item?: AdminTaskTableItem,
     columnAction?: (item: AdminTaskTableItem, value: any) => void | Promise<void>
   ) => React.ReactElement | null
   ```

---

## Troubleshooting

### Issue: `columnAction` is undefined

**Cause:** You haven't passed `columnActions` prop to `FilteringWrapper`, or the column key doesn't match.

**Solution:** 
- Check that you're passing `columnActions` prop
- Verify the key in `columnActions` matches the column's `key` property

### Issue: Row click fires when clicking cell

**Cause:** Event is bubbling up to the row.

**Solution:** Add `e.stopPropagation()` to your click handler:
```typescript
onClick={(e) => e.stopPropagation()}
```

### Issue: Handler not being called

**Cause:** You're not checking if `columnAction` exists before calling it.

**Solution:** Always check before calling:
```typescript
if (item && columnAction) {
  columnAction(item, value);
}
```

---

## Related Files

- `features/filtering-wrapper-multi-display/filtering-wrapper.tsx` - Main component that accepts `columnActions` prop
- `features/filtering-wrapper-multi-display/features/virtualized-table/components/rows/table-row.tsx` - Row component that passes action to cellRenderer
- `features/filtering-wrapper-multi-display/features/virtualized-table/types/table-column.ts` - Type definitions for `cellRenderer`

---

## Summary

1. **Update cellRenderer**: Add `value`, `item`, and `columnAction` parameters
2. **Create handler**: Define action handler function in your container
3. **Pass columnActions**: Map column keys to handlers via `columnActions` prop
4. **Handle interactions**: In your cellRenderer, call `columnAction(item, newValue)` when user interacts

This pattern provides a clean separation of concerns: column definitions handle rendering, container components handle business logic.
