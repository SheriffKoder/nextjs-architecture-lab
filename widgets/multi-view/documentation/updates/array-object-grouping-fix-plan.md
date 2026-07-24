# Plan: Fix Array and Object Grouping Display Issues

## Overview

When grouping by fields that contain arrays (like `assignedUsers`) or nested objects (like `company`), the group headers display "[object Object]" instead of meaningful text. This plan addresses both issues:

1. **Company Grouping Issue**: When grouping by `company.name`, if the value is an object instead of a string, it displays "[object Object]"
2. **Members Grouping Issue**: When grouping by `assignedUsers` (array of user objects), it displays "[object Object],[object Object]" instead of user names

## Current Problems

### Problem 1: Company Grouping
- **Symptom**: Group header shows `[object Object] (10)` when grouping by `company.name`
- **Root Cause**: When `groupValue` is an object (e.g., entire `company` object), `String(groupValue)` converts it to "[object Object]"
- **Location**: 
  - `features/virtualized-list/utils/grouping-utils.ts` (line 73, 102)
  - `features/virtualized-list/components/group-header.tsx` (line 54)

### Problem 2: Members Grouping
- **Symptom**: Group headers show:
  ```
  [object Object] (1)
  [object Object],[object Object] (4)
  [object Object],[object Object],[object Object] (2)
  ```
- **Root Cause**: When grouping by `assignedUsers` (array), `String([{...}])` converts arrays to "[object Object]"
- **Location**: 
  - `features/virtualized-list/utils/grouping-utils.ts` (line 73, 102)
  - `features/virtualized-list/components/group-header.tsx` (line 54)

## Solution Approach

Create helper functions to:
1. **Create stable group keys** from arrays/objects for consistent grouping
2. **Format display values** from arrays/objects for readable group headers

## Implementation Steps

### Phase 1: Update Grouping Utilities

**File**: `features/virtualized-list/utils/grouping-utils.ts`

#### Step 1.1: Add Helper Functions

Add two new helper functions before `groupData`:

```typescript
/**
 * Create a stable group key from a value (handles arrays, objects, and primitives)
 * Used for consistent grouping when values are complex types
 */
function createGroupKey(value: any): string {
  if (value == null) return 'null';
  
  // Handle arrays (e.g., assignedUsers array)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'empty';
    
    // For arrays of objects (like users), create a stable key from sorted IDs
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      // Extract IDs and sort them for consistent grouping
      const ids = value
        .map((item: any) => item?.id || item?.email || item?.name || JSON.stringify(item))
        .filter((id: any) => id != null)
        .sort()
        .map((id: any) => String(id));
      
      return ids.join(',');
    }
    
    // For arrays of primitives, sort and join
    return value
      .map((item: any) => String(item))
      .sort()
      .join(',');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    // Try to extract a meaningful identifier
    if (value.id) return String(value.id);
    if (value.name) return String(value.name);
    if (value.email) return String(value.email);
    // Fallback to JSON string (not ideal but better than [object Object])
    return JSON.stringify(value);
  }
  
  // Handle primitives
  return String(value);
}

/**
 * Format group value for display (handles arrays, objects, and primitives)
 * Used to create readable group header text
 */
function formatGroupValueForDisplay(value: any): string {
  if (value == null) return 'Unknown';
  
  // Handle arrays (e.g., assignedUsers array)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'No Members';
    
    // For arrays of objects (like users), extract names
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const names = value
        .map((item: any) => item?.name || item?.email || item?.username || 'Unknown')
        .filter((name: string) => name !== 'Unknown');
      
      if (names.length === 0) return 'No Members';
      if (names.length === 1) return names[0];
      if (names.length <= 3) return names.join(', ');
      return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    }
    
    // For arrays of primitives, join them
    return value.map((item: any) => String(item)).join(', ');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    if (value.name) return String(value.name);
    if (value.email) return String(value.email);
    if (value.id) return String(value.id);
    return 'Unknown';
  }
  
  // Handle primitives
  return String(value);
}
```

#### Step 1.2: Update `groupData` Function

Replace the group key creation logic (lines 71-80):

**Before:**
```typescript
for (const item of data) {
  const groupValue = getNestedValue(item, config.groupBy);
  const groupKey = groupValue != null ? String(groupValue) : 'null';
  
  if (!groupsMap.has(groupKey)) {
    groupsMap.set(groupKey, []);
  }
  
  groupsMap.get(groupKey)!.push(item);
}
```

**After:**
```typescript
for (const item of data) {
  const groupValue = getNestedValue(item, config.groupBy);
  const groupKey = createGroupKey(groupValue);
  
  if (!groupsMap.has(groupKey)) {
    groupsMap.set(groupKey, []);
  }
  
  groupsMap.get(groupKey)!.push(item);
}
```

#### Step 1.3: Update Group Key Formatting

Replace the formatted key logic (lines 83-87):

**Before:**
```typescript
const formattedKey = config.groupKeyFormatter 
  ? config.groupKeyFormatter(groupValue)
  : groupKey;
```

**After:**
```typescript
// Use formatter if provided, otherwise format for display
const formattedKey = config.groupKeyFormatter 
  ? config.groupKeyFormatter(groupValue)
  : formatGroupValueForDisplay(groupValue);
```

#### Step 1.4: Update Sub-Group Key Creation

Replace sub-group key creation (lines 100-102):

**Before:**
```typescript
const subGroupValue = getNestedValue(item, config.subGroupBy);
const subGroupKey = subGroupValue != null ? String(subGroupValue) : 'null';
```

**After:**
```typescript
const subGroupValue = getNestedValue(item, config.subGroupBy);
const subGroupKey = createGroupKey(subGroupValue);
```

#### Step 1.5: Update Sub-Group Key Formatting

Replace sub-group key formatting (lines 111-115):

**Before:**
```typescript
const formattedSubKey = config.subGroupKeyFormatter
  ? config.subGroupKeyFormatter(subGroupValue)
  : subGroupKey;
```

**After:**
```typescript
const formattedSubKey = config.subGroupKeyFormatter
  ? config.subGroupKeyFormatter(subGroupValue)
  : formatGroupValueForDisplay(subGroupValue);
```

#### Step 1.6: Update Group Sorting

Replace sorting logic (lines 132-136):

**Before:**
```typescript
groups.sort((a, b) => {
  const aKey = a.groupValue != null ? String(a.groupValue) : '';
  const bKey = b.groupValue != null ? String(b.groupValue) : '';
  return aKey.localeCompare(bKey);
});
```

**After:**
```typescript
// Sort groups by formatted group key (alphabetically)
groups.sort((a, b) => {
  const aKey = a.groupKey || '';
  const bKey = b.groupKey || '';
  return aKey.localeCompare(bKey);
});
```

### Phase 2: Update Group Header Component

**File**: `features/virtualized-list/components/group-header.tsx`

#### Step 2.1: Add Format Helper Function

Add the same `formatGroupValueForDisplay` function at the top of the file (before the component):

```typescript
/**
 * Format group value for display (handles arrays, objects, and primitives)
 * Used to create readable group header text
 */
function formatGroupValueForDisplay(value: any): string {
  if (value == null) return 'Unknown';
  
  // Handle arrays (e.g., assignedUsers array)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'No Members';
    
    // For arrays of objects (like users), extract names
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      const names = value
        .map((item: any) => item?.name || item?.email || item?.username || 'Unknown')
        .filter((name: string) => name !== 'Unknown');
      
      if (names.length === 0) return 'No Members';
      if (names.length === 1) return names[0];
      if (names.length <= 3) return names.join(', ');
      return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    }
    
    // For arrays of primitives, join them
    return value.map((item: any) => String(item)).join(', ');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    if (value.name) return String(value.name);
    if (value.email) return String(value.email);
    if (value.id) return String(value.id);
    return 'Unknown';
  }
  
  // Handle primitives
  return String(value);
}
```

#### Step 2.2: Update Display Value Logic

Replace the display value extraction (lines 50-54):

**Before:**
```typescript
const displayValue = groupKey.includes(': ') 
  ? groupKey.split(': ').slice(1).join(': ') 
  : (groupValue != null ? String(groupValue) : groupKey);
```

**After:**
```typescript
// Extract the value from groupKey (remove prefix like "Category: " if present)
// If groupKey contains ": ", use the part after it, otherwise format groupValue
let displayValue: string;
if (groupKey.includes(': ')) {
  displayValue = groupKey.split(': ').slice(1).join(': ');
} else if (groupValue != null) {
  // Use the formatting function to handle arrays, objects, and primitives
  displayValue = formatGroupValueForDisplay(groupValue);
} else {
  displayValue = groupKey;
}
```

### Phase 3: Update Virtualized Table Grouping (if needed)

**File**: `features/virtualized-table/utils/grouping-utils.ts`

Apply the same changes as Phase 1 to ensure consistency across both list and table views.

### Phase 4: Testing

Test the following scenarios:

1. **Company Grouping**:
   - Group by `company.name` on projects page
   - Verify group headers show company names (e.g., "Acme Corp (10)") instead of "[object Object]"

2. **Members Grouping**:
   - Group by `assignedUsers` on projects page
   - Verify group headers show user names (e.g., "John, Jane (4)" or "John, Jane, Bob +2 more (6)") instead of "[object Object]"

3. **Edge Cases**:
   - Empty arrays: Should show "No Members"
   - Single item arrays: Should show single name
   - Large arrays (>3 items): Should show first 3 + count
   - Null/undefined values: Should show "Unknown"
   - Nested objects: Should extract name/email/id

## Expected Behavior After Fix

### Company Grouping
- **Before**: `[object Object] (10)`
- **After**: `Acme Corporation (10)`

### Members Grouping
- **Before**: 
  ```
  [object Object] (1)
  [object Object],[object Object] (4)
  ```
- **After**:
  ```
  John Doe (1)
  Jane Smith, Bob Johnson (4)
  Alice, Bob, Charlie +2 more (6)
  ```

## Files to Modify

1. `features/virtualized-list/utils/grouping-utils.ts` - Add helper functions and update grouping logic
2. `features/virtualized-list/components/group-header.tsx` - Add format helper and update display logic
3. `features/virtualized-table/utils/grouping-utils.ts` - Apply same changes for consistency (if table view also has grouping)

## Implementation Status

- [x] Phase 1: Update grouping utilities
- [x] Phase 2: Update group header component
- [x] Phase 3: Update virtualized table grouping utilities
- [ ] Phase 4: Update table view GroupHeaderRow component
- [ ] Phase 5: Fix first group header badge issue in list view
- [ ] Phase 6: Testing

## Additional Fixes Needed

### Phase 4: Update Table View GroupHeaderRow Component

**File**: `features/virtualized-table/components/group-header-row.tsx`

The table view uses `GroupHeaderRow` component which also needs the same formatting fixes:
- Add `formatGroupValueForDisplay` helper function
- Update display value logic to handle arrays, objects, and primitives

### Phase 5: Fix First Group Header Badge Issue

**File**: `features/virtualized-list/virtualized-list-container.tsx`

**Problem**: The first group header doesn't show a badge because `fieldName` is extracted from `listViewConfig?.groupBy` instead of `effectiveGroupBy`.

**Fix**: Use `effectiveGroupBy` to extract the field name instead of `listViewConfig?.groupBy`.

**Location**: Line 513-515

**Before:**
```typescript
const groupFieldName = listViewConfig?.groupBy 
  ? listViewConfig.groupBy.split('.').pop() || ''
  : '';
```

**After:**
```typescript
const groupFieldName = effectiveGroupBy 
  ? effectiveGroupBy.split('.').pop() || ''
  : '';
```

## Notes

- The `createGroupKey` function ensures consistent grouping by creating stable keys from arrays/objects
- The `formatGroupValueForDisplay` function creates readable text for group headers
- Both functions handle arrays, objects, and primitives gracefully
- The solution maintains backward compatibility with existing grouping configurations
- Table view uses `GroupHeaderRow` component which needs the same formatting fixes
- List view needs to use `effectiveGroupBy` instead of `listViewConfig?.groupBy` for field name extraction