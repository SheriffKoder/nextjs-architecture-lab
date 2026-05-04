// Expandable rows with configurable components
Added to table-column type:   showExpandIcon?: boolean;
when the column has an expand icon in its configs, will have the +
which is rendered from the table row

2. pass the items to the table with hasChildren flag
this allows to detect if the row has children or not to enable/disable the rendered + icon


/////
3. add the row-expand feature folder
we will be able to pass, a getChildren function, 
renderExpandedContent, expandedContentHeight, enabled

4. the useRowExpansion hook is called in the virtualized-table
to notify the list with height/row positioning re-calculations
based on stored expanded states/child count

5. ExpandedRowContent component allows to parse incoming children into a custom JSX component
it is rendered inside the table-row
this is what takes the ExpandedChildTasksList returned from renderExpandedContent in the config

6. the calculateRowHeight in the virtualized-table now calculates row heights dynamically
also we have handleToggleRow, 

7. the configs for the rowExansion to be in the tableConfig in the project.ts

8. minRowHeight sets the parent heights,
table-row main div width if auto works for tasks (probably because it has expanding configs) but others it should be 100%, 


# Expandable Rows Documentation

## Overview

The VirtualizedTable component supports expandable rows, allowing parent rows to expand and display child content below them. This is useful for hierarchical data structures like tasks with subtasks, categories with items, etc.

## Basic Setup

### 1. Enable Row Expansion in Table Config

Add `rowExpansion` configuration to your table config:

```typescript
export const tableConfig = {
  // ... other config options
  
  rowExpansion: {
    enabled: true,
    getChildren: async (rowId: string | number) => {
      // Fetch and return children data
      const response = await fetch(`/api/items?parent_id=${rowId}`);
      const result = await response.json();
      return result.data || [];
    },
    renderExpandedContent: (item: any, children: any[], onRowClick?: (row: any) => void) => {
      // Return custom component to render expanded content
      return React.createElement(ExpandedContentComponent, { 
        childTasks: children,
        onRowClick: onRowClick
      });
    }
  }
};
```

### 2. Enable Expand Icon on Column

Add `showExpandIcon: true` to the column where you want the expand/collapse icon:

```typescript
export const allColumns = {
  title: {
    key: "title",
    name: "Title",
    showExpandIcon: true, // Shows + icon when row has children
    // ... other column config
  }
};
```

### 3. Add `hasChildren` Flag to Data

Mark rows that have children:

```typescript
const transformedData = data.map(item => ({
  ...item,
  hasChildren: checkIfHasChildren(item.id) // Your logic to determine if row has children
}));
```

## Configuration Options

### `rowExpansion.enabled`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable/disable row expansion functionality

### `rowExpansion.getChildren`
- **Type**: `(rowId: string | number) => Promise<any[]> | any[]`
- **Description**: Function to fetch or return children data for a row
- **Example**:
```typescript
getChildren: async (rowId) => {
  const response = await fetch(`/api/children/${rowId}`);
  return response.json();
}
```

### `rowExpansion.renderExpandedContent`
- **Type**: `(item: T, children: any[], onRowClick?: (row: T) => void) => React.ReactElement | null`
- **Description**: Custom render function for expanded content
- **Parameters**:
  - `item`: The parent row data
  - `children`: Array of child items
  - `onRowClick`: Optional click handler (same as parent row's `onRowClick`)
- **Example**:
```typescript
renderExpandedContent: (item, children, onRowClick) => {
  return React.createElement(CustomExpandedComponent, {
    childTasks: children,
    onRowClick: onRowClick
  });
}
```

### `rowExpansion.expandedContentHeight`
- **Type**: `number`
- **Default**: `0`
- **Description**: Not used - height is calculated dynamically based on content

## Complete Example: Tasks with Subtasks

```typescript
// tasks.ts
import { ExpandedChildTasksList } from "../components/row-expand/ExpandedChildTasksList";

export const tableConfig = {
  rowHeight: 60,
  minRowHeight: 60, // Important for row expansion
  
  rowExpansion: {
    enabled: true,
    expandedContentHeight: 0, // Height calculated dynamically
    
    // Fetch child tasks from API
    getChildren: async (taskId: string | number) => {
      try {
        const response = await fetch(`/api/tasks?parent_id=${taskId}&page=1&limit=1000`);
        if (!response.ok) throw new Error('Failed to fetch children');
        const result = await response.json();
        return result.data || [];
      } catch (error) {
        console.error('Error fetching children tasks:', error);
        return [];
      }
    },
    
    // Render child tasks using custom component
    renderExpandedContent: (task: TaskTableItem, children: any[], onRowClick?: (row: any) => void) => {
      // Transform children to match expected structure
      const transformedChildren = children.map((child: any) => ({
        id: child.id,
        title: child.title,
        type: child.type,
        status: child.status,
        due_date: child.due_date,
        project_id: child.project_id,
        project_name: child.project?.name || task.project_name,
        assignedUsers: child.assignedUsers || [],
        parent_id: child.parent_id
      }));
      
      // Use custom component, passing onRowClick for clickable children
      return React.createElement(ExpandedChildTasksList, { 
        childTasks: transformedChildren,
        onRowClick: onRowClick
      });
    }
  }
};

// Column config with expand icon
export const allColumns = {
  title: {
    key: "title",
    name: "Title",
    showExpandIcon: true, // Shows + icon when hasChildren is true
    sticky: true,
    // ... other config
  }
};
```

## Custom Expanded Content Component

Create a custom component to render expanded content:

```typescript
// ExpandedChildTasksList.tsx
import React from 'react';

interface ChildTask {
  id: string;
  title: string;
  // ... other fields
}

interface ExpandedChildTasksListProps {
  childTasks: ChildTask[];
  onRowClick?: (row: ChildTask) => void;
}

export function ExpandedChildTasksList({ childTasks, onRowClick }: ExpandedChildTasksListProps) {
  if (childTasks.length === 0) {
    return <div>No children found</div>;
  }

  return (
    <div className="w-full">
      {childTasks.map((child) => (
        <div 
          key={child.id}
          onClick={() => onRowClick?.(child)}
          className={`h-[40px] flex items-center ${
            onRowClick ? 'cursor-pointer hover:bg-gray-100' : ''
          }`}
        >
          <div>{child.title}</div>
          {/* Add more child content */}
        </div>
      ))}
    </div>
  );
}
```

## Click Handlers

Child rows can use the same click handler as parent rows:

```typescript
// In your page component
const handleRowClick = (task: TaskTableItem) => {
  // Handle both parent and child task clicks
  console.log('Clicked task:', task);
  // Navigate, open modal, etc.
};

// Pass to VirtualizedTable
<VirtualizedTable
  data={tasks}
  columns={tableColumns}
  onRowClick={handleRowClick}
  {...tableConfig}
/>
```

The `onRowClick` handler is automatically passed to `renderExpandedContent`, so child items can trigger the same behavior as parent rows.

## Row Height Calculation

Row heights are calculated dynamically:
- **Base row height**: Measured from actual content
- **Expanded height**: Base height + content height (calculated from number of children)
- **Minimum height**: Set via `minRowHeight` config (default: 40px)

The system uses `VariableSizeList` from `react-window` to handle dynamic row heights efficiently.

## Best Practices

1. **Set `minRowHeight`**: Important for proper row measurement with expansion
   ```typescript
   minRowHeight: 60, // Match your rowHeight or slightly larger
   ```

2. **Mark rows with children**: Always set `hasChildren: true` for rows that can expand
   ```typescript
   const data = items.map(item => ({
     ...item,
     hasChildren: checkHasChildren(item.id)
   }));
   ```

3. **Handle loading states**: The system automatically shows loading state while fetching children

4. **Transform child data**: Ensure child data matches your expected structure in `renderExpandedContent`

5. **Use custom components**: Create reusable components for expanded content (like `ExpandedChildTasksList`)

## Notes

- The expand icon (`+`/`-`) only appears when `showExpandIcon: true` is set on a column
- The icon is disabled (grayed out) when `hasChildren: false`
- Row expansion works with virtualization - only expanded rows render their children
- Height calculation is automatic based on content, no manual height management needed
