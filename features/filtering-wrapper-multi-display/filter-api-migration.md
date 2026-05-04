# Filter API Migration Guide

This document explains the filtering system architecture, including API-based filter dropdowns, custom parameter mapping, and range filtering capabilities.

---

## Step 1: API-Based Filter Dropdown Items

This step documents the migration from data-based filter options to API-fetched filter options.

### Overview
The filter system now supports fetching filter options from an API endpoint instead of generating them from local data. This allows for more dynamic and server-controlled filter options.

### Implementation Steps

#### 1. Define in the table-columns config
Add a `getDropdownItems` callback function to your column definition in the table config:

```typescript
getDropdownItems: async (columnKey: string) => {
  const apiUrl = `/api/companies?limit=1000`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch dropdown items: ${response.statusText}`);
    }
    const result = await response.json();
    // Map to the format expected by the filter component
    return (result.data || []).map((company: { id: string, name: string }) => ({
      id: company.id,
      item: company.name,
    }));
  } catch (error) {
    console.error(`Error fetching dropdown items for ${columnKey}:`, error);
    return [];
  }
}
```

The function should return a Promise that resolves to an array of objects with:
- `id`: Optional unique identifier (string or number)
- `item`: The filter value to display (string or number)
- `count`: Optional count/occurrence of that item (number)

#### 2. The callback is called on the items list
The `getDropdownItems` callback is automatically called when the filter list component mounts or when the column key changes. The fetched items are displayed in the filter options list.

**Note**: The callback is only called for text field types. Date and number fields use range inputs instead (see Step 3).

#### 3. On item click added to pending
When a user clicks on a filter option:
- The item is added to `pendingSelections` (if not already selected)
- The item is removed from `pendingSelections` (if already selected)
- Pending items are visually highlighted with a checkmark and background color
- Changes are not applied until the user clicks "Apply"

#### 4. Display selected items (pending+active) on apply
When the user clicks the "Apply" button, the `displayFilterValues` function is called which:
- Combines pending and active selections for text filters
- Sends only pending selections for range filters (date/number)
- Maps selected display values to the appropriate field (id or item) based on configuration
- Calls `onFilterApply` callback with the column key, items, type, and column configuration

### Type Definition

The `getDropdownItems` property is defined in the `TableColumn` interface:

```typescript
getDropdownItems?: (columnKey: string) => Promise<Array<{ 
  id?: string | number; 
  item: string | number; 
  count?: number 
}>>;
```

---

## Step 2: Communicate with the Main File (index.tsx)

This step documents how to pass the `onFilterApply` callback from the main index file down through the component hierarchy to handle filter apply actions.

### Overview
The filter system now supports a callback mechanism that allows the main index file to receive filter apply events with the column key, selected items, column type, and optional column configuration.

### Implementation Steps

#### 1. Pass onFilterApply from index > content > FilteringWrapper > PillFilter > items list

The callback is passed through the following component chain:

**index.tsx** → **content.tsx** → **FilteringWrapper** → **PillFilter** → **TableFilterList**

1. **Define the callback in index.tsx**:
```typescript
const handleFilterApply = (
  key: string, 
  items: string[], 
  type: string, 
  columnConfig?: { 
    filterApiParams?: { 
      text?: string; 
      number?: { from: string; to: string }; 
      date?: { start: string; end: string }; 
      isArray?: boolean; 
      valueField?: 'id' | 'item' 
    } 
  }
) => {
  // Convert filter to API parameters
  const apiParams = convertFilterToApiParams(key, items, type, columnConfig);
  
  // Update filters state and refetch data
  setFilters(prevFilters => {
    const newFilters = { ...prevFilters };
    // Remove old related filters and add new ones
    // ... filter management logic
    loadProjects(newFilters);
    return newFilters;
  });
};
```

2. **Pass to content component**:
```typescript
<ProjectBoardContent 
  onFilterApply={handleFilterApply}
  // ... other props
/>
```

3. **Pass to FilteringWrapper**:
```typescript
<FilteringWrapper
  onFilterApply={onFilterApply}
  // ... other props
/>
```

4. **Pass to PillFilter**:
```typescript
<PillFilter
  onFilterApply={onFilterApply}
  // ... other props
/>
```

5. **Pass to TableFilterList**:
```typescript
<TableFilterList
  onFilterApply={onFilterApply}
  columnConfig={columnConfig}
  // ... other props
/>
```

#### 2. Remove all associations with the filteringHook in the wrapper

The following props are no longer needed in the FilteringWrapper and related components:
- `data` - No longer needed as filtering is handled via API
- `filteredData` - No longer needed
- `getFilteredDataExcludingColumn` - No longer needed
- `availableItemCounts` - No longer needed

These were previously used for data-based filtering but are now replaced by the API-based approach and the `onFilterApply` callback.

### Callback Signature

```typescript
onFilterApply?: (
  key: string, 
  items: string[], 
  type: string, 
  columnConfig?: { 
    filterApiParams?: { 
      text?: string; 
      number?: { from: string; to: string }; 
      date?: { start: string; end: string }; 
      isArray?: boolean; 
      valueField?: 'id' | 'item' 
    } 
  }
) => void;
```

- **key**: The column key (e.g., "name", "email", "lender")
- **items**: Array of selected filter values
  - For text fields: Array of selected item strings (or IDs if `valueField: 'id'`)
  - For date/number ranges: Array with `[start, end]` format
- **type**: The column type - "date", "number", or "text"
- **columnConfig**: Optional column configuration with custom API parameter mapping

---

## Step 3: Ranges

This step documents the support for date and number range filtering via reusable components.

### Overview
Date and number field types now use dedicated range input components instead of dropdown lists. These components allow users to specify a range (from/to) and update the pending selections state directly.

### Implementation Steps

#### 1. Support ranges for date and number via reusable components updating the pending list

For date and number field types, the system automatically displays range input components instead of the dropdown list:

- **Date fields** (`isDateField: true`): Uses `DateRangeInput` component
  - Format: MM-DD-YYYY (from MM-DD-YYYY to MM-DD-YYYY)
  - Separate input fields for Month, Day, Year for both start and end dates
  
- **Number fields** (`isNumberField: true`): Uses `NumberRangeInput` component
  - Format: From N to N
  - Simple number inputs for min and max values

Both components:
- Update `pendingSelections` state directly as `[start, end]` array
- Are theme-aware using Tailwind CSS theme classes
- Provide real-time updates on input change (if `autoApplyDropdown` is enabled)

#### 2. The displayFilterValues in this case will send pending items only, not allItems

For range types (date/number), the `displayFilterValues` function sends only the `pendingSelections` array, not a combination of pending and active selections:

```typescript
// For range types, send pending selections only
// For text types, combine pending and active selections
const itemsToSend = (isDateField || isNumberField) 
  ? pendingSelections  // [start, end] format
  : [...new Set([...pendingSelections, ...selectedOptions])];
```

**Example for date range**:
- If user enters start date "01-15-2024" and end date "02-20-2024"
- `pendingSelections` = `["01-15-2024", "02-20-2024"]`
- `onFilterApply` receives: `key="purchase_closing_date", items=["01-15-2024", "02-20-2024"], type="date"`

**Example for number range**:
- If user enters min "1000" and max "5000"
- `pendingSelections` = `["1000", "5000"]`
- `onFilterApply` receives: `key="after_repair_value", items=["1000", "5000"], type="number"`

### Component Files

- `components/PillFilter/components/DateRangeInput.tsx` - Date range input component
- `components/PillFilter/components/NumberRangeInput.tsx` - Number range input component

### Behavior

- **No API callback**: Date and number fields do not use `getDropdownItems` - they use range inputs instead
- **State format**: Range inputs always maintain state as `[start, end]` array
- **Clear action**: Sets state to `['', '']` for range types
- **Cancel action**: Reverts to previous `selectedOptions` state
- **Apply action**: Sends current `pendingSelections` to `onFilterApply` callback

---

## Step 4: Custom API Parameter Mapping

This step documents how to customize the API parameter names and value formats sent to the backend when filters are applied.

### Overview
The filter system supports custom API parameter mapping through the `filterApiParams` configuration in the table column definition. This allows you to:
- Specify custom parameter names (e.g., `lender_ids` instead of `lender_search`)
- Control whether to send values as arrays or single values
- Choose which field to send (ID vs. item/name) from dropdown options

### Implementation

#### 1. Define filterApiParams in table column config

Add the `filterApiParams` property to your column definition:

```typescript
{
  key: "lender",
  name: "Lender",
  // ... other column properties
  getDropdownItems: async (columnKey: string) => {
    // Fetch dropdown items with id and item fields
    return (result.data || []).map((org: { id: string, name: string }) => ({
      id: org.id,
      item: org.name,
    }));
  },
  filterApiParams: {
    text: 'lender_ids',        // Custom parameter name
    isArray: true,              // Send as array parameter
    valueField: 'id'            // Send 'id' field instead of 'item' (name)
  }
}
```

#### 2. filterApiParams Configuration Options

**For Text Filters:**
```typescript
filterApiParams?: {
  text?: string;              // Custom parameter name (e.g., "lender_ids", "company_ids")
  isArray?: boolean;          // If true, sends as array; if false, sends first item only
  valueField?: 'id' | 'item'; // Which field to send: 'id' or 'item' (default: 'item')
}
```

**For Number Range Filters:**
```typescript
filterApiParams?: {
  number?: {
    from: string;  // Custom parameter name for min value (e.g., "arv_min")
    to: string;    // Custom parameter name for max value (e.g., "arv_max")
  };
}
```

**For Date Range Filters:**
```typescript
filterApiParams?: {
  date?: {
    start: string; // Custom parameter name for start date (e.g., "purchase_date_from")
    end: string;   // Custom parameter name for end date (e.g., "purchase_date_to")
  };
}
```

#### 3. Value Field Mapping

When `valueField: 'id'` is specified:
- The system maps selected display values (names) to their corresponding IDs
- Uses the `id` field from the dropdown options
- Useful when the API expects IDs instead of names

When `valueField: 'item'` is specified (or omitted):
- The system uses the `item` field (or `rawValue`) from dropdown options
- Sends the display value as-is
- Default behavior

**Example - Sending IDs:**
```typescript
// Column config
filterApiParams: {
  text: 'lender_ids',
  isArray: true,
  valueField: 'id'
}

// Dropdown options
[
  { id: '123', item: 'Bank A' },
  { id: '456', item: 'Bank B' }
]

// User selects "Bank A" and "Bank B"
// API receives: lender_ids=['123', '456']
```

**Example - Sending Names:**
```typescript
// Column config
filterApiParams: {
  text: 'lender_search',
  isArray: false,
  valueField: 'item'  // or omit (default)
}

// User selects "Bank A"
// API receives: lender_search='Bank A'
```

#### 4. Default Parameter Naming

If `filterApiParams` is not specified, the system uses default parameter naming conventions:

- **Text filters**: `{columnKey}_search` (e.g., `address_search`, `company_search`)
- **Number filters**: `{columnKey}_filter_from` and `{columnKey}_filter_to` (e.g., `after_repair_value_filter_from`, `after_repair_value_filter_to`)
- **Date filters**: `{columnKey}_filter_start` and `{columnKey}_filter_end` (e.g., `purchase_date_filter_start`, `purchase_date_filter_end`)

Special mappings exist for certain columns:
- `owner` → `company_search`
- `lender` → `lender_search`
- `purchase_closing_date` → `purchase_date_filter_start/end`

#### 5. Complete Example

```typescript
// Owner column - sends company_ids as array
owner: {
  key: "owner",
  name: "Owner",
  getDropdownItems: async (columnKey: string) => {
    const response = await fetch(`/api/companies?limit=1000`);
    const result = await response.json();
    return (result.data || []).map((company: { id: string, name: string }) => ({
      id: company.id,
      item: company.name,
    }));
  },
  filterApiParams: {
    text: 'company_ids',
    isArray: true,
    valueField: 'id'
  }
}

// Lender column - sends lender_ids as array
lender: {
  key: "lender",
  name: "Lender",
  getDropdownItems: async (columnKey: string) => {
    const response = await fetch(`/api/orgs?limit=1000&org_type=lender`);
    const result = await response.json();
    return (result.data || []).map((org: { id: string, name: string }) => ({
      id: org.id,
      item: org.name,
    }));
  },
  filterApiParams: {
    text: 'lender_ids',
    isArray: true,
    valueField: 'id'
  }
}

// ARV column - uses default parameter naming (after_repair_value_filter_from/to)
arv: {
  key: "after_repair_value",
  name: "ARV",
  isNumberField: true,
  // No filterApiParams needed - uses defaults
}
```

### Backend API Handling

The backend API should handle these parameters accordingly:

```typescript
// Handle array ID filters
const companyIds = searchParams.get("company_ids");
if (companyIds) {
  const ids = companyIds.split(',').filter(id => id.trim());
  if (ids.length > 0) {
    where.company_id = { in: ids };
  }
}

const lenderIds = searchParams.get("lender_ids");
if (lenderIds) {
  const ids = lenderIds.split(',').filter(id => id.trim());
  if (ids.length > 0) {
    where.lender_org_id = { in: ids };
  }
}
```

### Type Definition

The `filterApiParams` property is defined in the `TableColumn` interface:

```typescript
filterApiParams?: {
  text?: string;
  number?: { from: string; to: string };
  date?: { start: string; end: string };
  isArray?: boolean;
  valueField?: 'id' | 'item';
};
```

---

## Summary

The filtering system provides:

1. **API-based dropdowns**: Fetch filter options from backend APIs
2. **Custom parameter mapping**: Control API parameter names and formats
3. **Value field selection**: Choose to send IDs or display values
4. **Range filtering**: Support for date and number ranges
5. **Flexible configuration**: Per-column customization through table config

This architecture decouples the frontend filter UI from backend API requirements, making it easy to adapt to different API designs while maintaining a consistent user experience.
