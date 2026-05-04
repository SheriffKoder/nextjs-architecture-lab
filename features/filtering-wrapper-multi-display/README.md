# Virtualized Table - Accordion & Dropdown Features

This document explains how to use the accordion column grouping and dropdown editing features in the VirtualizedTable component.

## Table of Contents
- [Accordion Feature](#accordion-feature)
- [Dropdown Feature](#dropdown-feature)
- [Complete Example](#complete-example)

## Accordion Feature

The accordion feature allows you to group columns and show/hide them with visual indicators. Only one group can be open at a time by default.

### Configuration Setup

#### 1. Define Column Groups

In your column configuration, add `groupId` to columns that should be grouped:

```typescript
// features/reports/config/your-report/columns.ts
export const allYourReportColumns: Record<string, TableColumn<YourReportItem>> = {
  // Always visible columns (no groupId)
  weekStart: {
    key: "weekStart",
    name: "Week Start",
    sortable: true,
    width: "100%",
    isDateField: true,
    // No groupId - always visible
  },
  
  // Group: Recruiting (blue)
  newRequisitions: {
    key: "newRequisitions",
    name: "# New of Requisitions",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "recruiting", // Group this column
  },
  fullTime: {
    key: "fullTime",
    name: "Full Time",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "recruiting", // Same group
  },
  
  // Group: Payroll (green)
  manualEntries: {
    key: "manualEntries",
    name: "# of Manual Entries",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "payroll", // Different group
  },
};
```

#### 2. Create Accordion Configuration

Create an accordion config file:

```typescript
// features/reports/config/your-report/accordion.ts
export const YOUR_REPORT_ACCORDION_CONFIG = {
  groups: [
    {
      id: "recruiting",
      name: "Recruiting",
      color: "bg-blue-100",
      textColor: "text-blue-800"
    },
    {
      id: "payroll", 
      name: "Payroll",
      color: "bg-green-100",
      textColor: "text-green-800"
    },
    {
      id: "hr",
      name: "HR",
      color: "bg-purple-100",
      textColor: "text-purple-800"
    }
  ],
  allowMultipleOpen: false, // Only one group open at a time
  defaultOpenGroup: "recruiting" // Which group to open by default
};
```

#### 3. Update Column Arrays

Update your column arrays to include all columns:

```typescript
// features/reports/config/your-report/columns.ts
export const yourReportColumns: TableColumn<YourReportItem>[] = createColumnArray([
  'weekStart', 'weekEnd', // Always visible
  'newRequisitions', 'fullTime', // Recruiting group
  'manualEntries', 'hospitalizations', // Payroll group
  'hireTech', 'turnoverRate' // HR group
]);

export const yourReportHeaderColumns: TableColumn<YourReportItem>[] = createColumnArray([
  'weekStart', 'weekEnd', 'newRequisitions', 'manualEntries', 'hireTech' // First column of each group
]);
```

#### 4. Export Accordion Config

```typescript
// features/reports/config/your-report/index.ts
export * from './accordion';
export * from './columns';
export * from './data';
// ... other exports
```

#### 5. Use in Report Hook

```typescript
// features/reports/hooks/useYourReport.ts
import { YOUR_REPORT_ACCORDION_CONFIG } from '../config/your-report';

export const useYourReport = (user: User | null) => {
  const { data, isLoading, error } = useReportData(user, 'your-report');
  const columns = getYourReportColumnsByRole(user?.role);
  
  return {
    data: data?.data || [],
    columns,
    headerColumns: yourReportHeaderColumns,
    sortableColumns: yourReportSortableColumns,
    editableColumns: YOUR_REPORT_EDITABLE_COLUMNS,
    cards: data?.data ? getYourReportCards(data.data) : [],
    accordionConfig: YOUR_REPORT_ACCORDION_CONFIG, // Add this
    isLoading,
    error
  };
};
```

#### 6. Pass to VirtualizedTable

```typescript
// features/reports/index.tsx
<VirtualizedTable
  data={tableData}
  columns={columns}
  headerColumns={headerColumns}
  sortableColumns={sortableColumns}
  editableColumns={editableColumns}
  accordionConfig={accordionConfig} // Add this prop
  // ... other props
/>
```

### How It Works

- **Closed Groups**: Show only the first column of each group
- **Open Groups**: Show all columns in that group
- **Visual Indicators**: Group headers have colored backgrounds
- **Toggle Behavior**: Click on group headers to open/close groups
- **Filter Integration**: Pill filter only shows columns from open groups

## Dropdown Feature

The dropdown feature allows inline editing with dropdown selections for specific columns.

### Configuration Setup

#### 1. Define Dropdown Columns

In your column configuration, add dropdown properties:

```typescript
// features/reports/config/your-report/columns.ts
export const allYourReportColumns: Record<string, TableColumn<YourReportItem>> = {
  status: {
    key: "status",
    name: "Status",
    sortable: true,
    width: "100%",
    isDropdown: true, // Enable dropdown
    dropdownOptions: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" }
    ],
    dropdownFormatter: (value) => {
      // Custom formatting for display
      const option = dropdownOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },
    excludeCurrentSelection: true, // Don't show current selection in dropdown
  },
  
  priority: {
    key: "priority",
    name: "Priority",
    sortable: true,
    width: "100%",
    isDropdown: true,
    dropdownOptions: [
      { value: "high", label: "High", color: "text-red-600" },
      { value: "medium", label: "Medium", color: "text-yellow-600" },
      { value: "low", label: "Low", color: "text-green-600" }
    ],
    dropdownFormatter: (value) => {
      const option = dropdownOptions.find(opt => opt.value === value);
      return option ? (
        <span className={option.color}>{option.label}</span>
      ) : value;
    }
  }
};
```

#### 2. Add to Editable Columns

```typescript
// features/reports/config/your-report/editable-columns.ts
export const YOUR_REPORT_EDITABLE_COLUMNS = [
  'status',
  'priority',
  // ... other editable columns
];
```

#### 3. Handle Dropdown Changes

The dropdown changes are automatically handled by the `EditableCell` component. The component will:

- Show a dropdown when the cell is clicked
- Position the dropdown using a portal to avoid clipping
- Reorder options to show the current selection at the top
- Handle keyboard navigation (arrow keys, enter, escape)
- Save changes when a new option is selected

### Dropdown Properties

| Property | Type | Description |
|----------|------|-------------|
| `isDropdown` | `boolean` | Enable dropdown editing for this column |
| `dropdownOptions` | `Array<{value: string, label: string, color?: string}>` | Available options |
| `dropdownFormatter` | `(value: any) => React.ReactElement` | Custom formatting for display |
| `excludeCurrentSelection` | `boolean` | Hide current selection from dropdown list |

## Complete Example

Here's a complete example of a report with both accordion and dropdown features:

### 1. Types
```typescript
// features/reports/config/example/types.ts
export interface ExampleReportItem {
  id: string;
  weekStart: string;
  weekEnd: string;
  
  // Recruiting group
  newRequisitions: number;
  fullTime: number;
  
  // Payroll group
  manualEntries: number;
  hospitalizations: number;
  
  // Status (dropdown)
  status: string;
  priority: string;
}
```

### 2. Columns
```typescript
// features/reports/config/example/columns.ts
export const allExampleColumns: Record<string, TableColumn<ExampleReportItem>> = {
  weekStart: {
    key: "weekStart",
    name: "Week Start",
    sortable: true,
    width: "100%",
    isDateField: true,
  },
  weekEnd: {
    key: "weekEnd",
    name: "Week End", 
    sortable: true,
    width: "100%",
    isDateField: true,
  },
  
  // Recruiting group
  newRequisitions: {
    key: "newRequisitions",
    name: "# New Requisitions",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "recruiting",
  },
  fullTime: {
    key: "fullTime",
    name: "Full Time",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "recruiting",
  },
  
  // Payroll group
  manualEntries: {
    key: "manualEntries",
    name: "# Manual Entries",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "payroll",
  },
  hospitalizations: {
    key: "hospitalizations",
    name: "Hospitalizations",
    sortable: true,
    width: "100%",
    isNumberField: true,
    groupId: "payroll",
  },
  
  // Dropdown columns
  status: {
    key: "status",
    name: "Status",
    sortable: true,
    width: "100%",
    isDropdown: true,
    dropdownOptions: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" }
    ],
    dropdownFormatter: (value) => {
      const option = dropdownOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },
    excludeCurrentSelection: true,
  },
  priority: {
    key: "priority",
    name: "Priority",
    sortable: true,
    width: "100%",
    isDropdown: true,
    dropdownOptions: [
      { value: "high", label: "High", color: "text-red-600" },
      { value: "medium", label: "Medium", color: "text-yellow-600" },
      { value: "low", label: "Low", color: "text-green-600" }
    ],
    dropdownFormatter: (value) => {
      const option = dropdownOptions.find(opt => opt.value === value);
      return option ? (
        <span className={option.color}>{option.label}</span>
      ) : value;
    }
  }
};
```

### 3. Accordion Config
```typescript
// features/reports/config/example/accordion.ts
export const EXAMPLE_ACCORDION_CONFIG = {
  groups: [
    {
      id: "recruiting",
      name: "Recruiting",
      color: "bg-blue-100",
      textColor: "text-blue-800"
    },
    {
      id: "payroll",
      name: "Payroll", 
      color: "bg-green-100",
      textColor: "text-green-800"
    }
  ],
  allowMultipleOpen: false,
  defaultOpenGroup: "recruiting"
};
```

### 4. Hook
```typescript
// features/reports/hooks/useExampleReport.ts
export const useExampleReport = (user: User | null) => {
  const { data, isLoading, error } = useReportData(user, 'example');
  const columns = getExampleColumnsByRole(user?.role);
  
  return {
    data: data?.data || [],
    columns,
    headerColumns: exampleHeaderColumns,
    sortableColumns: exampleSortableColumns,
    editableColumns: EXAMPLE_EDITABLE_COLUMNS,
    accordionConfig: EXAMPLE_ACCORDION_CONFIG,
    isLoading,
    error
  };
};
```

### 5. Usage
```typescript
// In your report component
const reportData = useExampleReport(user);
const { data, columns, headerColumns, accordionConfig, editableColumns } = reportData;

<VirtualizedTable
  data={data}
  columns={columns}
  headerColumns={headerColumns}
  editableColumns={editableColumns}
  accordionConfig={accordionConfig}
  // ... other props
/>
```

## Best Practices

### Accordion
- Keep group names short and descriptive
- Use consistent color schemes across reports
- Always include a default open group
- Test with different screen sizes

### Dropdown
- Provide clear, descriptive option labels
- Use consistent option values across similar columns
- Consider using colors for visual distinction
- Test keyboard navigation

### Performance
- Limit the number of groups (recommended: 3-8 groups)
- Keep dropdown options reasonable (recommended: <20 options)
- Use `excludeCurrentSelection: true` for better UX

## Troubleshooting

### Accordion Issues
- **Groups not showing**: Check that `groupId` is set on columns
- **Colors not applied**: Verify accordion config is passed to VirtualizedTable
- **Filter not updating**: Ensure `headerColumns` includes first column of each group

### Dropdown Issues
- **Dropdown not appearing**: Check that `isDropdown: true` is set
- **Options not showing**: Verify `dropdownOptions` array is properly formatted
- **Changes not saving**: Ensure column is in `editableColumns` array

### General Issues
- **Type errors**: Make sure all column keys match your data interface
- **Rendering issues**: Check that all required props are passed to VirtualizedTable
- **Performance issues**: Consider reducing the number of columns or groups
