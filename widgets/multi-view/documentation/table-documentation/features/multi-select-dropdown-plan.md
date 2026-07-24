# Multi-Select Dropdown Plan

## Files affected (Lotis)
features\filtering-wrapper-multi-display\components\dropdown
features\filtering-wrapper-multi-display\components\rows\table-row.tsx

features\filtering-wrapper-multi-display\features\subheadings\components\rows\editable-cell.tsx
features\filtering-wrapper-multi-display\features\subheadings\components\rows\table-row.tsx
features\filtering-wrapper-multi-display\features\subheadings\types\table-column.ts

features\filtering-wrapper-multi-display\features\virtualized-table\components\rows\editable-cell.tsx
features\filtering-wrapper-multi-display\features\virtualized-table\components\rows\table-row.tsx
features\filtering-wrapper-multi-display\features\virtualized-table\types\table-column.ts

features\filtering-wrapper-multi-display\types\dropdown.ts


## Overview

This document outlines the plan for implementing multi-select dropdown functionality in editable table cells. This feature will allow users to select multiple options from a dropdown, with the dropdown remaining open until the user explicitly closes it by clicking a button.

## Requirements

1. **Multi-Select Capability**: Allow selecting multiple options from a dropdown
2. **Persistent Dropdown**: Keep dropdown open after selection until user clicks close button
3. **Array Management**: Store selected values as an array (e.g., `["Item1", "Item2"]`)
4. **Visual Indicators**: Show which items are currently selected (checkmarks, badges, etc.)
5. **Configurable**: Enable via table column configuration
6. **Backward Compatible**: Single-select dropdowns should continue to work as before

## Use Cases

- **Phase Type Selection**: Users can select multiple phase types for a task: `["Phase 1", "Desktop", "Transaction Screen"]`
- **Tag Selection**: Users can add multiple tags to items
- **Category Selection**: Users can assign items to multiple categories

## Technical Approach

### 1. Type Definitions

#### Update `TableColumn` Interface

**File**: `features/filtering-wrapper-multi-display/features/virtualized-table/types/table-column.ts`

Add new properties:
```typescript
export interface TableColumn<T = any> {
  // ... existing properties
  
  // Multi-select dropdown configuration
  isMultiSelect?: boolean; // Enable multi-select mode
  multiSelectCloseButtonText?: string; // Text for close button (default: "Done" or "Close")
  multiSelectMaxSelections?: number; // Optional limit on number of selections
}
```

#### Update `DropdownOption` Interface

**File**: `features/filtering-wrapper-multi-display/types/dropdown.ts`

Add properties for multi-select:
```typescript
export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  // Multi-select specific
  isSelected?: boolean; // For visual indication in multi-select mode
}
```

#### Update `DropdownListProps` Interface

**File**: `features/filtering-wrapper-multi-display/types/dropdown.ts`

Add multi-select properties:
```typescript
export interface DropdownListProps {
  options: DropdownOption[];
  value: any; // Can be single value or array for multi-select
  onSelect: (option: DropdownOption) => void;
  formatter?: (option: DropdownOption) => React.ReactElement;
  excludeCurrentSelection?: boolean;
  className?: string;
  // Multi-select specific
  isMultiSelect?: boolean;
  selectedValues?: (string | number)[]; // Array of selected values
  onClose?: () => void; // Callback for close button
  closeButtonText?: string;
  maxSelections?: number;
}
```

### 2. Component Changes

#### A. EditableCell Component

**File**: `features/filtering-wrapper-multi-display/features/virtualized-table/components/rows/editable-cell.tsx`

**Changes Needed**:

1. **Add multi-select state management**:
   ```typescript
   const [selectedValues, setSelectedValues] = useState<(string | number)[]>(() => {
     if (isMultiSelect) {
       // Convert value to array if it's not already
       if (Array.isArray(value)) return value;
       return value ? [value] : [];
     }
     return [];
   });
   ```

2. **Update `handleDropdownSelect`**:
   - For multi-select: Add/remove from array, don't close dropdown
   - For single-select: Set value and close dropdown (existing behavior)

3. **Add close button handler**:
   ```typescript
   const handleMultiSelectClose = () => {
     if (onValueChange && isMultiSelect) {
       onValueChange(selectedValues);
     }
     setIsDropdownOpen(false);
   };
   ```

4. **Pass multi-select props to DropdownList**:
   - `isMultiSelect`
   - `selectedValues`
   - `onClose`
   - `closeButtonText`
   - `maxSelections`

#### B. DropdownList Component

**File**: `features/filtering-wrapper-multi-display/components/dropdown/dropdown-list.tsx`

**Changes Needed**:

1. **Update option reordering logic**:
   - For multi-select: Show selected options at top with checkmarks
   - For single-select: Keep existing behavior

2. **Add visual indicators**:
   - Show checkmark icon for selected items
   - Highlight selected items differently

3. **Update selection handling**:
   - For multi-select: Toggle selection (add if not selected, remove if selected)
   - For single-select: Keep existing behavior

4. **Add close button**:
   - Render at bottom of dropdown when `isMultiSelect` is true
   - Call `onClose` when clicked

5. **Handle max selections**:
   - Disable options when `maxSelections` is reached
   - Show visual feedback (gray out disabled options)

#### C. DropdownItem Component

**File**: `features/filtering-wrapper-multi-display/components/dropdown/dropdown-item.tsx`

**Changes Needed**:

1. **Add checkmark icon**:
   - Show checkmark when `isSelected` is true in multi-select mode
   - Use Lucide `Check` icon

2. **Update styling**:
   - Different background color for selected items
   - Visual distinction between selected and unselected

#### D. Table Row Component

**File**: `features/filtering-wrapper-multi-display/features/virtualized-table/components/rows/table-row.tsx`

**Changes Needed**:

1. **Pass column multi-select config to EditableCell**:
   ```typescript
   <EditableCell
     // ... existing props
     isMultiSelect={column.isMultiSelect || false}
     multiSelectCloseButtonText={column.multiSelectCloseButtonText}
     multiSelectMaxSelections={column.multiSelectMaxSelections}
   />
   ```

2. **Handle array values**:
   - When `isMultiSelect` is true, ensure value is treated as array
   - Convert single value to array if needed for display

### 3. Display Formatting

#### Cell Renderer Updates

**File**: `features/admin-panel/default-tasks/config/tasks-table-config.ts` (example)

For multi-select columns, update `cellRenderer` to display array values:
```typescript
cellRenderer: (value): React.ReactElement | null => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return React.createElement('div', { className: 'TableTextClass' }, 'Not set');
  }
  
  // Display as comma-separated list or badges
  const displayValue = value.join(', ');
  return React.createElement('div', { className: 'TableTextClass' }, displayValue);
}
```

**Alternative**: Display as badges/chips for better visual representation:
```typescript
cellRenderer: (value): React.ReactElement | null => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return React.createElement('div', { className: 'TableTextClass' }, 'Not set');
  }
  
  return React.createElement('div', { className: 'flex flex-wrap gap-1' },
    value.map((item, index) =>
      React.createElement('span', {
        key: index,
        className: 'px-2 py-1 bg-primary/10 text-primary rounded text-xs'
      }, item)
    )
  );
}
```

### 4. Value Handling Logic

#### Array Management

**In EditableCell**:
```typescript
const handleDropdownSelect = (option: DropdownOption) => {
  if (isMultiSelect) {
    // Toggle selection in array
    setSelectedValues(prev => {
      const isSelected = prev.includes(option.value);
      if (isSelected) {
        // Remove from array
        return prev.filter(v => v !== option.value);
      } else {
        // Check max selections limit
        if (maxSelections && prev.length >= maxSelections) {
          return prev; // Don't add if limit reached
        }
        // Add to array
        return [...prev, option.value];
      }
    });
    // Don't close dropdown in multi-select mode
  } else {
    // Single-select: existing behavior
    if (onValueChange) {
      onValueChange(option.value);
    }
    setIsDropdownOpen(false);
  }
};
```

#### Initial Value Conversion

**In EditableCell useEffect**:
```typescript
useEffect(() => {
  if (isMultiSelect) {
    // Ensure value is an array
    if (Array.isArray(value)) {
      setSelectedValues(value);
    } else if (value !== null && value !== undefined) {
      setSelectedValues([value]);
    } else {
      setSelectedValues([]);
    }
  } else {
    // Single-select: existing behavior
    setEditValue(isNumberField ? formatNumberForInput(value) : value);
  }
}, [value, isMultiSelect, isNumberField]);
```

### 5. UI/UX Considerations

#### Visual Design

1. **Selected Items**:
   - Checkmark icon (✓) next to selected options
   - Different background color (e.g., `bg-primary/10`)
   - Bold or highlighted text

2. **Close Button**:
   - Positioned at bottom of dropdown
   - Styled as primary button
   - Text: "Done" or "Close" (configurable)
   - Shows count of selections: "Done (3 selected)"

3. **Empty State**:
   - Show "No selections" when array is empty
   - Placeholder text in cell: "Click to select"

4. **Max Selections Reached**:
   - Disable remaining options visually
   - Show tooltip: "Maximum X selections allowed"
   - Gray out disabled options

#### Interaction Flow

1. **Opening Dropdown**:
   - Double-click cell to open dropdown
   - Dropdown shows all available options

2. **Selecting Items** (Multi-Select):
   - Click option to toggle selection
   - Option gets checkmark and highlight
   - Dropdown stays open
   - Selected count updates in close button

3. **Closing Dropdown**:
   - Click "Done" button to save and close
   - Click outside dropdown to cancel (discard changes)
   - Press Escape to cancel (discard changes)

4. **Saving Changes**:
   - Only when "Done" button is clicked
   - Calls `onValueChange` with array of selected values
   - Updates cell display immediately

### 6. Implementation Steps

#### Phase 1: Type Definitions
- [ ] Update `TableColumn` interface with multi-select props
- [ ] Update `DropdownOption` interface
- [ ] Update `DropdownListProps` interface
- [ ] Update `EditableCellProps` interface

#### Phase 2: DropdownList Component
- [ ] Add multi-select mode detection
- [ ] Implement toggle selection logic
- [ ] Add checkmark indicators for selected items
- [ ] Add close button at bottom
- [ ] Handle max selections limit
- [ ] Update option reordering for multi-select

#### Phase 3: DropdownItem Component
- [ ] Add checkmark icon display
- [ ] Update styling for selected state
- [ ] Handle disabled state (max selections reached)

#### Phase 4: EditableCell Component
- [ ] Add multi-select state management
- [ ] Update `handleDropdownSelect` for multi-select
- [ ] Add `handleMultiSelectClose` function
- [ ] Update value initialization logic
- [ ] Pass multi-select props to DropdownList

#### Phase 5: Table Row Component
- [ ] Pass column multi-select config to EditableCell
- [ ] Handle array values in value extraction

#### Phase 6: Configuration Updates
- [ ] Update phaseType column config to use multi-select
- [ ] Update cell renderer to display arrays as badges/chips
- [ ] Test with existing single-select dropdowns (backward compatibility)

#### Phase 7: Testing
- [ ] Test multi-select with phaseType column
- [ ] Test single-select still works (backward compatibility)
- [ ] Test max selections limit
- [ ] Test cancel behavior (click outside, Escape)
- [ ] Test save behavior (Done button)
- [ ] Test with empty arrays
- [ ] Test with null/undefined values

### 7. Example Configuration

#### Phase Type Column (Multi-Select)

```typescript
phaseType: {
  key: "phaseType",
  name: "Phase Type",
  sortable: true,
  width: "200px",
  isSearchable: true,
  isDropdown: true,
  isMultiSelect: true, // Enable multi-select
  multiSelectCloseButtonText: "Done", // Optional: custom button text
  multiSelectMaxSelections: undefined, // Optional: no limit
  formatter: (value) => {
    if (!value || !Array.isArray(value) || value.length === 0) return 'Not set';
    return value.join(', ');
  },
  cellRenderer: (value): React.ReactElement | null => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return React.createElement('div', { className: 'TableTextClass' }, 'Not set');
    }
    
    // Display as badges
    return React.createElement('div', { className: 'flex flex-wrap gap-1' },
      value.map((item, index) =>
        React.createElement('span', {
          key: index,
          className: 'px-2 py-0.5 bg-primary/10 text-primary rounded text-xs'
        }, item)
      )
    );
  },
}
```

### 8. Backward Compatibility

- Single-select dropdowns (without `isMultiSelect: true`) continue to work as before
- Existing dropdown configurations don't need changes
- Only columns with `isMultiSelect: true` will use new behavior
- Value handling: Single-select expects single value, multi-select expects array

### 9. Edge Cases

1. **Value Type Mismatch**:
   - If column is multi-select but value is not array: Convert to array
   - If column is single-select but value is array: Use first element

2. **Empty Selections**:
   - Empty array `[]` should be valid
   - Display as "Not set" or placeholder

3. **Invalid Options**:
   - If selected value is not in options list: Still show in selected list
   - Handle gracefully in UI

4. **Rapid Selections**:
   - Debounce not needed (local state updates are instant)
   - Only API call happens on "Done" click

### 10. Future Enhancements

1. **Search/Filter in Dropdown**: Add search box for long option lists
2. **Select All / Deselect All**: Quick actions for multi-select
3. **Keyboard Shortcuts**: 
   - Space to toggle selection
   - Enter to confirm and close
4. **Drag to Reorder**: Allow reordering selected items
5. **Custom Badge Styling**: Allow per-column badge styling configuration

## Testing Checklist

- [ ] Multi-select dropdown opens correctly
- [ ] Options can be selected/deselected
- [ ] Dropdown stays open after selection
- [ ] Close button saves changes
- [ ] Click outside cancels changes
- [ ] Escape key cancels changes
- [ ] Max selections limit works
- [ ] Selected items show checkmarks
- [ ] Cell displays array as badges/chips
- [ ] Empty array displays correctly
- [ ] Single-select dropdowns still work
- [ ] Array values are saved correctly
- [ ] Optimistic updates work with mutations
- [ ] Error handling and rollback work

## Notes

- The implementation should be backward compatible
- Multi-select is opt-in via column configuration
- Array values are expected for multi-select columns
- Single values are expected for single-select columns
- The dropdown close behavior is different: multi-select requires explicit close, single-select closes on selection
