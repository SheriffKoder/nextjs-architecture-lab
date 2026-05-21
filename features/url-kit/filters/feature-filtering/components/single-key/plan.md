# Filter Options Button Group Component Plan

## Overview
A reusable component that displays filter options as either a row of buttons or a dropdown menu, allowing quick selection of filter values.

## Component Name
`FilterOptionsButtons`

## Props Interface

```typescript
interface FilterOptionsButtonsProps {
  /**
   * Filter key (e.g., "department", "status", "role")
   * WHY: Identifies which filter to use and which URL parameter to read/write
   * HOW: Used to find filter in filterOptions array and with useUrlFilters to get/set filter values
   */
  filterKey: string
  
  /**
   * Array of filter configurations with options populated from getFilterOptions
   * WHY: Provides all available filters, component will find the one matching the key
   * HOW: Component searches this array for filter with matching key
   */
  filterOptions: FilterConfig[]
  
  /**
   * Selection type override (multi-select or single-select)
   * WHY: Allow overriding the filter's default type for different use cases
   * HOW: If provided, overrides the filter's type property; if not provided, uses filter's original type
   */
  selectType?: "multi-select" | "single-select"
  
  /**
   * Whether to display as dropdown instead of button row
   * WHY: Allow flexible UI presentation based on use case
   * HOW: If true, shows dropdown menu; if false, shows button row
   * Default: false (shows as buttons)
   */
  isDropdown?: boolean
}
```

## Functionality

### 1. State Management
- Use `useUrlFilters` hook to read current filter state
- For multi-select: Use `getList(filterKey)` to get array of selected values
- For single-select: Use `get(filterKey)` to get single selected value
- Handle both filter types (multi-select and single-select)

### 2. Display Modes

#### Button Mode (`isDropdown={false}`)
- Display: Horizontal row of buttons, one per option
- Layout: `flex gap-2 flex-wrap` for responsive wrapping
- Active State: Selected buttons have `bg-tertiary text-background`
- Inactive State: Unselected buttons have `bg-muted text-foreground hover:bg-muted/80`
- Count Badges: Show count next to option label if available
- Click Behavior:
  - Multi-select: Toggle value using `toggleListValue(filterKey, value)`
  - Single-select: Set value using `set(filterKey, value)` or remove if already selected

#### Dropdown Mode (`isDropdown={true}`)
- Display: Single button with dropdown menu
- Button Text: Shows selected count or filter label
- Dropdown Content: List of options with checkboxes (multi-select) or radio buttons (single-select)
- Click Behavior: Same as button mode but within dropdown

### 3. Edge Cases
- No options: Show message or hide component
- Empty filter: Handle gracefully
- Loading state: Show skeleton if options not loaded
- Filter type mismatch: Support both multi-select and single-select

## Styling

### Button Row Styling
```tsx
<div className="flex gap-2 flex-wrap items-center">
  <span className="text-sm font-medium mr-2">{filter.label}:</span>
  {filter.options?.map(option => (
    <button
      className={cn(
        "px-3 py-1.5 text-xs rounded-md transition-colors",
        isSelected 
          ? "bg-tertiary text-background hover:bg-tertiary/90"
          : "bg-muted text-foreground hover:bg-muted/80"
      )}
    >
      {option.label}
      {option.count !== undefined && (
        <span className="ml-2 text-xs">({option.count})</span>
      )}
    </button>
  ))}
</div>
```

### Dropdown Styling
- Reuse existing DropdownMenu components from `ui/dropdown-menu`
- Similar to MultiSelectFilter component styling
- Show selected count in button text

## Integration

### RSC Page Integration
```tsx
// Get filters with options
const filters = await getFilterOptionsServer(baseFilters)

// Render as dropdown (single-select override)
<FilterOptionsButtons
  filterKey="role"
  filterOptions={filters}
  selectType="single-select"
  isDropdown={true}
/>
```

### Client Page Integration
```tsx
// Get filters with options
const { data: filterOptions } = useFilterOptions()

// Render as buttons (uses filter's original type)
<FilterOptionsButtons
  filterKey="department"
  filterOptions={filterOptions}
  isDropdown={false}
/>
```

## Implementation Steps

1. Create component directory: `app/development/filters/components/single-key/`
2. Create main component file: `filter-options-buttons.tsx`
3. Create index file: `index.ts`
4. Implement button row mode
5. Implement dropdown mode
6. Add active state handling
7. Add count badge display
8. Integrate into RSC page (dropdown mode)
9. Integrate into client page (button mode)
10. Test both modes and filter types

## Testing Checklist

- [ ] Button mode displays correctly
- [ ] Dropdown mode displays correctly
- [ ] Multi-select toggle works
- [ ] Single-select set/remove works
- [ ] Active state highlighting works
- [ ] Count badges display correctly
- [ ] Responsive wrapping works
- [ ] Works on RSC page
- [ ] Works on client page
- [ ] No scroll to top on filter change (already fixed)
