# Dropdown Filter Implementation Plan

## Overview
Create a new dropdown filter component system that follows the exact styling from `StandardFilterDropdown` but with cleaner, more maintainable code architecture. The component will integrate with the existing filter system (`FilterConfig`, `useUrlFilters`) and support all filter types.

## Goals
1. **Exact Styling Match**: Replicate all visual styling from `StandardFilterDropdown`
2. **Clean Architecture**: Modular components, clear separation of concerns
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Integration**: Works with existing `FilterConfig` and `useUrlFilters` system
5. **Performance**: Virtualized list for large option sets
6. **Maintainability**: Well-documented, reusable components

---

## Architecture

### Component Structure
```
dropdown-filter/
├── index.ts                          # Main exports
├── dropdown-filter.tsx               # Main orchestrator component
├── components/
│   ├── dropdown-header.tsx           # Header with title, count, sort
│   ├── active-filters-section.tsx    # Active filter badges
│   ├── range-filter-section.tsx     # Expandable range filter wrapper
│   ├── search-input.tsx             # Search input component
│   ├── filter-options-list.tsx       # Virtualized options list
│   └── dropdown-footer.tsx           # Clear/Cancel/Apply buttons
├── range-filters/
│   ├── date-range-filter-dropdown.tsx  # Date range (MM/DD/YYYY inputs)
│   └── number-range-filter-dropdown.tsx # Number range (Min/Max inputs)
└── types.ts                          # TypeScript interfaces
```

---

## Implementation Steps

### Phase 1: Core Infrastructure

#### Step 1.1: Create Type Definitions
**File**: `dropdown-filter/types.ts`

**Interfaces to Create**:
```typescript
// Extend existing FilterOption to include counts
export interface DropdownFilterOption extends FilterOption {
  rawValue: any
  totalCount: number
  columnIndependentCount: number
}

// Props for main dropdown component
export interface DropdownFilterProps {
  filter: FilterConfig
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dataSource?: any[] // Optional data source for option generation
  formatDisplayValue?: (value: any) => string
  autoApply?: boolean
  showBadges?: boolean
  isLastColumn?: boolean
  allActiveFilterColumns?: Record<string, any>
}
```

**Why**: Centralized type definitions ensure consistency
**Dependencies**: `FilterConfig`, `FilterOption` from `filter-types.ts`

---

#### Step 1.2: Create Main Orchestrator Component
**File**: `dropdown-filter/dropdown-filter.tsx`

**Responsibilities**:
- Manage dropdown open/close state
- Coordinate between sub-components
- Handle filter state (pending vs applied)
- Integrate with `useUrlFilters` hook
- Calculate filter options and counts

**Key Features**:
- Uses `FilterConfig` for configuration
- Reads from URL via `useUrlFilters`
- Manages pending selections (before Apply)
- Auto-apply mode support (via prop)
- Click outside to close

**Props**:
```typescript
interface DropdownFilterProps {
  filter: FilterConfig
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dataSource?: any[] // Optional data source for option generation
  formatDisplayValue?: (value: any) => string
  autoApply?: boolean // Prop to control auto-apply behavior
  showBadges?: boolean
  isLastColumn?: boolean
  allActiveFilterColumns?: Record<string, any>
  // Button configuration
  useFilterIcon?: boolean // true = icon button, false = FilterBoxButton
  useFilterIconText?: string
  useFilterIconWidth?: string
  filterIcon?: React.ComponentType<{ size?: number; className?: string }>
}
```

**State Management**:
```typescript
const [isOpen, setIsOpen] = useState(false)
const [searchTerm, setSearchTerm] = useState('')
const [pendingSelections, setPendingSelections] = useState<string[]>([])
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
const [isOptionsLoaded, setIsOptionsLoaded] = useState(false)
```

**Why**: Single source of truth for dropdown state
**Dependencies**: `useUrlFilters`, `FilterConfig`, sub-components

---

### Phase 2: UI Components

#### Step 2.1: Dropdown Header
**File**: `dropdown-filter/components/dropdown-header.tsx`

**Exact Styling** (from StandardFilterDropdown):
```tsx
<div className="p-3 border-b border-border dark:border-border/50 bg-tertiary/20 flex justify-between items-center">
  <div className="flex items-center">
    <h3 className="text-sm font-medium text-tertiary">Filter: {filter.label}</h3>
    <span className="ml-2 px-1.5 py-0.5 text-xs bg-tertiary/20 text-tertiary rounded-full">
      {selectedCount}/{availableCount}
    </span>
  </div>
  <div className="flex items-center">
    <button
      onClick={onToggleSort}
      className="p-1 rounded-md hover:bg-primary-foreground/20 focus:outline-none"
      title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
    >
      <ArrowUpDown size={14} className={`text-tertiary transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
    </button>
  </div>
</div>
```

**Props**:
- `filter: FilterConfig`
- `selectedCount: number`
- `availableCount: number`
- `sortDirection: 'asc' | 'desc'`
- `onToggleSort: () => void`

**Why**: Reusable header component with exact styling match

---

#### Step 2.2: Active Filters Section
**File**: `dropdown-filter/components/active-filters-section.tsx`

**Exact Styling**:
```tsx
{isFilterActive && showBadges && (
  <div className="p-3 pb-2 bg-foreground/5 border-b border-border dark:border-border/50">
    <div className="flex items-center justify-between">
      <div className="text-xs mb-1 text-foreground">Active Filters:</div>
      <button 
        className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
        onClick={onClearFilters}
      >
        Clear All
      </button>
    </div>
    <div className="flex flex-wrap mt-1 max-h-16 overflow-y-auto pr-1">
      {activeFilters.map((filter, index) => {
        const option = filteredOptions.find(opt => opt.value === String(filter))
        const rawValue = option?.rawValue ?? filter
        const displayValue = formatDisplayValue ? formatDisplayValue(rawValue) : String(filter)
          
        return (
          <span key={index} className="text-xs inline-flex items-center bg-tertiary/50 border border-tertiary/20 text-background rounded px-1 py-0.5 mr-1 mb-1">
            {displayValue}
            <button 
              className="ml-1 hover:bg-tertiary/30 rounded-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFilter(filter)
              }}
            >
              <X size={12}/>
            </button>
          </span>
        )
      })}
    </div>
  </div>
)}
```

**Props**:
- `activeFilters: string[]`
- `filteredOptions: DropdownFilterOption[]`
- `formatDisplayValue?: (value: any) => string`
- `onRemoveFilter: (value: string) => void`
- `onClearFilters: () => void`
- `showBadges: boolean`

**Why**: Conditional rendering of active filters with exact styling

---

#### Step 2.3: Range Filter Section
**File**: `dropdown-filter/components/range-filter-section.tsx`

**Exact Styling** (expandable wrapper):
```tsx
<div className="border-t border-b border-gray-200">
  <div 
    className="p-2 bg-gray-50 flex justify-between items-center cursor-pointer"
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <span className="text-sm font-medium">Filter by range</span>
    <button className="text-gray-500">
      {isExpanded ? '−' : '+'}
    </button>
  </div>
  
  {isExpanded && (
    <div className="">
      {rangeFilterContent}
    </div>
  )}
</div>
```

**Props**:
- `filter: FilterConfig`
- `rangeFilterContent: React.ReactNode`
- `isExpanded: boolean` (default: true)
- `onExpandedChange: (expanded: boolean) => void`

**Why**: Reusable expandable wrapper for range filters

---

#### Step 2.4: Search Input
**File**: `dropdown-filter/components/search-input.tsx`

**Exact Styling**:
```tsx
<div className="p-3 border-b border-border dark:border-border/50">
  <input
    ref={inputRef}
    type="text"
    placeholder="Search..."
    className="w-full p-2 bg-transparent text-foreground border-b border-border dark:border-border/50 text-sm focus:outline-none focus:border-b-tertiary dark:focus:border-b-tertiary/50 transition-colors duration-200 placeholder:text-muted-foreground"
    value={searchTerm}
    onChange={(e) => onSearchChange(e.target.value)}
  />
</div>
```

**Props**:
- `searchTerm: string`
- `onSearchChange: (value: string) => void`
- `inputRef?: React.RefObject<HTMLInputElement>`
- `placeholder?: string` (default: "Search...")

**Why**: Reusable search input with exact styling and auto-focus support

---

#### Step 2.5: Filter Options List
**File**: `dropdown-filter/components/filter-options-list.tsx`

**Exact Styling** (virtualized list item):
```tsx
<div 
  style={style}
  className={`flex items-center py-1 px-2 rounded-l-md ${
    isSelected ? 'bg-gradient-to-r from-tertiary/20 to-transparent' : ''
  } ${
    isSelectable ? 'hover:bg-gradient-to-r from-tertiary/10 to-transparent cursor-pointer' : 'cursor-not-allowed opacity-50'
  }`}
  onClick={() => isSelectable ? onToggleOption(option.value) : null}
>
  <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
    isSelected ? 'bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary' : shouldGreyOut ? 'border-muted-foreground/30 bg-muted' : 'border-border dark:border-border/50'
  }`}>
    {isSelected && <Check size={12} className="text-tertiary-foreground" />}
  </div>
  <span className={`truncate flex-grow text-left text-xs ${
    shouldGreyOut ? 'text-muted-foreground' : isSelected ? 'font-medium text-tertiary' : 'text-foreground'
  }`}>
    {displayValue}
  </span>
  
  {/* Badge showing count */}
  <div className="ml-2">
    {isSelected ? (
      <span className="text-xs text-center px-3 py-1 rounded-full bg-tertiary/50 border border-tertiary/30 text-foreground">
        {option.columnIndependentCount}
      </span>
    ) : hasOtherColumnFilters ? (
      <span className={`text-xs px-3 py-1 rounded-full ${
        shouldGreyOut ? 'bg-muted text-muted-foreground' : 'bg-muted text-foreground'
      }`}>
        {option.columnIndependentCount}/{option.totalCount}
      </span>
    ) : (
      <span className="text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300/50 dark:border-green-300/10">
        {option.totalCount}
      </span>
    )}
  </div>
</div>
```

**Props**:
- `options: DropdownFilterOption[]`
- `pendingSelections: string[]`
- `onToggleOption: (value: string) => void`
- `formatDisplayValue?: (value: any) => string`
- `hasOtherColumnFilters: boolean`
- `isOptionsLoaded: boolean`

**Virtualization**:
- Use `react-window` `FixedSizeList`
- Height: `224px` (max-height: `23vh`)
- Item size: `35px`
- Container: `h-[23vh] max-h-[224px]`

**Why**: Virtualized list for performance with exact styling

---

#### Step 2.6: Dropdown Footer
**File**: `dropdown-filter/components/dropdown-footer.tsx`

**Exact Styling**:
```tsx
<div className="p-3 border-t border-border dark:border-border/50 bg-foreground/5 flex justify-between items-center z-10">
  <button
    onClick={onClearFilters}
    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-background"
  >
    Clear
  </button>

  <div className="flex items-center gap-2">
    <button
      onClick={onCancel}
      className="cursor-pointer text-sm px-3 py-1 text-foreground rounded hover:bg-background"
    >
      Cancel
    </button>
    {!autoApply && (
      <button
        onClick={onApplyFilters}
        className="cursor-pointer text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={pendingSelections.length === 0 && !isFilterActive}
      >
        Apply
      </button>
    )}
  </div>
</div>
```

**Props**:
- `pendingSelections: string[]`
- `isFilterActive: boolean`
- `autoApply: boolean`
- `onClearFilters: () => void`
- `onCancel: () => void`
- `onApplyFilters: () => void`

**Why**: Reusable footer with exact button styling

---

### Phase 3: Range Filter Components

#### Step 3.1: Date Range Filter (Dropdown Version)
**File**: `dropdown-filter/range-filters/date-range-filter-dropdown.tsx`

**Exact Styling** (from old DateRangeFilter):
- MM/DD/YYYY input format
- Three inputs per date (Month, Day, Year)
- Labels below inputs: `text-xs text-gray-500 text-center mt-0.5`
- Input styling: `w-full p-1.5 text-xs border border-gray-300 rounded text-center`
- Clear and Apply buttons
- Error message display: `text-xs text-red-500`

**Structure**:
```tsx
<div className="p-3">
  <div className="space-y-3">
    <div>
      <label className="block text-xs text-gray-600 mb-1">Start Date</label>
      <div className="flex space-x-2">
        <div className="w-1/3">
          <input type="text" placeholder="MM" className="w-full p-1.5 text-xs border border-gray-300 rounded text-center" />
          <div className="text-xs text-gray-500 text-center mt-0.5">Month</div>
        </div>
        {/* Day and Year inputs */}
      </div>
    </div>
    {/* End Date section */}
    {/* Error message */}
    <div className="flex justify-between pt-1">
      <button className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer underline">Clear</button>
      <button className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90">Apply</button>
    </div>
  </div>
</div>
```

**Props**:
- `filter: FilterConfig`
- `startDate: string | undefined`
- `endDate: string | undefined`
- `onDateRangeChange: (start: string, end: string) => void`
- `onClear: () => void`

**Integration**:
- Uses `useUrlFilters().getRange()` to read current range
- Uses `useUrlFilters().setRange()` to update URL
- Converts between MM/DD/YYYY (display) and YYYY-MM-DD (URL)

**Why**: Date range filter matching old component styling

---

#### Step 3.2: Number Range Filter (Dropdown Version)
**File**: `dropdown-filter/range-filters/number-range-filter-dropdown.tsx`

**Exact Styling** (from old NumberRangeFilter):
- Min and Max number inputs
- Input styling: `w-full p-1.5 border border-gray-300 rounded text-xs`
- Apply button: `px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90`
- Error message display: `text-red-500 text-xs mt-1`
- Decimal places support

**Structure**:
```tsx
<div className="p-2 pt-0">
  <div className="flex space-x-2 mt-2">
    <div className="flex-1">
      <input type="number" placeholder="Min" className="w-full p-1.5 border border-gray-300 rounded text-xs" />
    </div>
    <div className="flex-1">
      <input type="number" placeholder="Max" className="w-full p-1.5 border border-gray-300 rounded text-xs" />
    </div>
    <button className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90">Apply</button>
  </div>
  {errorMessage && (
    <div className="text-red-500 text-xs mt-1">{errorMessage}</div>
  )}
</div>
```

**Props**:
- `filter: FilterConfig`
- `minValue: number | undefined`
- `maxValue: number | undefined`
- `onNumberRangeChange: (min: number, max: number) => void`
- `onClear: () => void`
- `decimalPlaces?: number` (default: 2)

**Integration**:
- Uses `useUrlFilters().getNumberRange()` to read current range
- Uses `useUrlFilters().setNumberRange()` to update URL

**Why**: Number range filter matching old component styling

---

#### Step 3.3: Quick-Select List for Range Filters
**File**: 
- `dropdown-filter/components/range-quick-select-list.tsx`

**Purpose**: Display a quick-select list of unique values when `filter.showQuickSelect` is true, separate from range inputs

**Features**:
- Shows list of unique values from `filter.options` separate from range inputs
- Each option has a checkbox, label, and count badge
- Clicking an option toggles it and updates the range (min/max for numbers, start/end for dates)
- Selected options are highlighted with tertiary styling
- Count badges show total count for each option
- Two-way sync: manual range changes update selected options, and option selections update the range
- Always visible (not affected by range inputs expand/collapse)

**Structure** (Quick Select List):
```tsx
{filter.showQuickSelect && filter.options && filter.options.length > 0 && (
  <>
    <div className="border-t border-border pt-3 mt-3">
      <div className="mb-3 text-xs font-medium text-muted-foreground">
        Quick Select
      </div>
      <div className="max-h-48 overflow-y-auto">
        <div className="space-y-1">
          {filter.options.map((option) => {
            const isSelected = selectedValues.includes(option.value)
            
            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center py-1 px-2 rounded-l-md cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-r from-tertiary/20 to-transparent"
                    : "hover:bg-gradient-to-r from-tertiary/10 to-transparent"
                )}
                onClick={() => handleToggle(option.value)}
              >
                {/* Checkbox */}
                <div className={cn(
                  "w-4 h-4 border rounded mr-3 flex items-center justify-center",
                  isSelected
                    ? "bg-tertiary/80 dark:bg-tertiary/20 border-tertiary/30 dark:border-tertiary"
                    : "border-border"
                )}>
                  {isSelected && (
                    <Check size={12} className="text-tertiary-foreground" />
                  )}
                </div>
                
                {/* Option label */}
                <span className={cn(
                  "truncate flex-grow text-left text-xs",
                  isSelected
                    ? "font-medium text-tertiary"
                    : "text-foreground"
                )}>
                  {option.label}
                </span>
                
                {/* Count badge */}
                {option.count !== undefined && (
                  <div className="ml-2">
                    <span className={cn(
                      "text-xs px-3 py-1 rounded-full",
                      isSelected
                        ? "bg-tertiary text-tertiary-foreground"
                        : "bg-green-500/10 text-green-500 border border-green-500/20"
                    )}>
                      {option.count}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </>
)}
```

**State Management** (in parent `DropdownFilter`):
- `rangeSelectedValues: string[]` - Tracks which options are currently selected
- `handleRangeToggle(value: string)` - Toggles option selection and updates range
- Sync effect calculates selected values from current URL range state

**Date Range Logic**:
- Selected dates are sorted chronologically
- Range is set to min (earliest) and max (latest) selected dates
- When range changes manually, `getSelectedOptions()` finds all dates within the range

**Number Range Logic**:
- Selected numbers are converted to numeric values
- Range is set to min and max of selected numbers
- When range changes manually, `getSelectedOptions()` finds all numbers within the range

**Integration**:
- Uses `filter.options` from FilterConfig (populated by API/server function)
- Requires `filter.showQuickSelect === true` to display
- Syncs with URL via `useUrlFilters().setRange()` and `setNumberRange()`

**Why**: Provides quick selection of common values without manual input, matching PillFilter functionality

**Separation from Range Inputs**:
- Quick-select list is rendered separately from range inputs
- Range inputs are in expandable section (controlled by +/- button)
- Quick-select list is always visible (not affected by range expand/collapse)
- Both sections are independent but share the same filter state via URL
- The quick-select list is rendered outside the `RangeFilterSection` component in the main dropdown

**Implementation Details**:
- `RangeQuickSelectList` component is a separate component in `components/range-quick-select-list.tsx`
- State (`rangeSelectedValues`) and handlers (`handleRangeToggle`) are managed in the parent `DropdownFilter` component
- Sync effect calculates selected values from current URL range state
- Rendered conditionally when `filter.showQuickSelect === true`

---

### Phase 4: API Updates for Column Independent Count

#### Step 4.1: Update FilterOption Type
**File**: `app/development/filters/components/filter-types.ts`

**Change**:
```typescript
export interface FilterOption {
  label: string
  value: string
  count?: number // Total count (all data)
  columnIndependentCount?: number // Count filtered by other columns
}
```

**Why**: Support both total count and filtered count for selectability logic

---

#### Step 4.2: Update getFilterOptions Utility
**File**: `app/development/filters/utils/get-filter-options.ts`

**Changes Needed**:
1. Accept optional `filteredDataSource` parameter (data filtered by other columns)
2. Calculate `columnIndependentCount` for each option
3. Return both `count` and `columnIndependentCount` in options

**Updated Interface**:
```typescript
export interface GetFilterOptionsOptions<T extends DataRecord> {
  filterConfigs: FilterConfig[]
  dataSource: T[] // Full data source for totalCount
  fieldMap: Record<string, keyof T>
  filteredDataSource?: T[] // Optional: data filtered by other columns for columnIndependentCount
}
```

**Updated Logic**:
```typescript
// Calculate totalCount from full dataSource
const totalCount = getCountFromData(field, dataSource)

// Calculate columnIndependentCount from filteredDataSource (if provided)
const columnIndependentCount = filteredDataSource 
  ? getCountFromData(field, filteredDataSource)
  : totalCount // If no filtered data, use total count

return {
  label: formatLabel(value),
  value: value,
  count: totalCount,
  columnIndependentCount: columnIndependentCount
}
```

**Why**: Enable selectability logic by providing filtered counts

---

#### Step 4.3: Update API Route
**File**: `app/api/filters/options/route.ts`

**Changes Needed**:
1. Accept optional query parameter for active filters from other columns
2. Filter data source based on other column filters
3. Pass filtered data to `getFilterOptions` for `columnIndependentCount` calculation

**Updated GET Handler**:
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get active filters from other columns (if provided)
    const otherColumnFilters = parseOtherColumnFilters(searchParams)
    
    // Filter data source based on other column filters
    const filteredDataSource = otherColumnFilters 
      ? filterDataByOtherColumns(employees, otherColumnFilters)
      : employees // Use full data if no other filters
    
    const filtersWithOptions = await getFilterOptions({
      filterConfigs: employeeBaseFilters,
      dataSource: employees, // Full data for totalCount
      fieldMap: employeeFieldMap,
      filteredDataSource: filteredDataSource // Filtered data for columnIndependentCount
    })
    
    return NextResponse.json(filtersWithOptions, { status: 200 })
  } catch (error) {
    // Error handling
  }
}
```

**Why**: Provide column-independent counts via API for client-side filtering

---

#### Step 4.4: Update Server Function
**File**: `app/development/filters/utils/rsc-page/get-filter-options-server.ts`

**Changes Needed**:
1. Accept optional `filteredDataSource` parameter
2. Pass to `getFilterOptions` for `columnIndependentCount` calculation

**Updated Function**:
```typescript
export async function getFilterOptionsServer(
  baseConfigs: FilterConfig[] = employeeBaseFilters,
  filteredDataSource?: Employee[] // Optional filtered data
): Promise<FilterConfig[]> {
  return getFilterOptions({
    filterConfigs: baseConfigs,
    dataSource: employees, // Full data
    fieldMap: employeeFieldMap,
    filteredDataSource: filteredDataSource // Filtered data for counts
  })
}
```

**Why**: Support column-independent counts in RSC pages

---

### Phase 5: Integration & Logic

#### Step 5.1: Filter Options Calculation
**Location**: `dropdown-filter/dropdown-filter.tsx`

**Logic**:
1. Get data source from `FilterConfig` (via props or context)
2. Extract unique values for filter key
3. Calculate `totalCount` (all data)
4. Calculate `columnIndependentCount` (filtered by other columns)
5. Apply search term filtering
6. Sort based on `sortDirection` and field type
7. Handle selected items priority (always at top)

**Helper Functions**:
```typescript
const getFilterOptions = (): DropdownFilterOption[] => {
  // Extract unique values from data
  // Calculate counts
  // Apply search filter
  // Sort options
  // Return formatted options
}

const getFilteredOptions = (options: DropdownFilterOption[], searchTerm: string): DropdownFilterOption[] => {
  // Filter by search term (case-insensitive)
  // Return filtered options
}

const sortOptions = (options: DropdownFilterOption[], direction: 'asc' | 'desc'): DropdownFilterOption[] => {
  // Sort by field type (number, date, text)
  // Selected items always first
  // Apply direction
  // Return sorted options
}
```

**Why**: Centralized logic for option generation and filtering

---

#### Step 5.2: URL Integration
**Location**: `dropdown-filter/dropdown-filter.tsx`

**Integration Points**:
- Read active filters: `useUrlFilters().getList(filter.key)`
- Read date range: `useUrlFilters().getRange(filter.key)`
- Read number range: `useUrlFilters().getNumberRange(filter.key)`
- Update filters: `useUrlFilters().setList(filter.key, values)`
- Update ranges: `useUrlFilters().setRange()` / `setNumberRange()`
- Remove filter: `useUrlFilters().remove(filter.key)`

**State Sync**:
- Initialize `pendingSelections` from URL on open
- Apply changes to URL on Apply (or auto-apply)
- Cancel resets `pendingSelections` to URL state

**Why**: Single source of truth (URL) for filter state

---

#### Step 5.3: Selectability Logic
**Location**: `dropdown-filter/components/filter-options-list.tsx`

**Logic**:
```typescript
const isSelectable = (option: DropdownFilterOption, pendingSelections: string[], hasOtherFilters: boolean): boolean => {
  // Option is selectable if:
  // 1. Already selected, OR
  // 2. Has matches in filtered data (columnIndependentCount > 0), OR
  // 3. No other column filters are active
  return pendingSelections.includes(option.value) || 
         option.columnIndependentCount > 0 || 
         !hasOtherFilters
}
```

**Why**: Prevents selecting options with no available data

---

### Phase 6: Main Component Assembly

#### Step 6.1: Dropdown Container
**File**: `dropdown-filter/dropdown-filter.tsx`

**Structure**:
```tsx
<div
  ref={dropdownRef}
  className={`absolute z-30 mt-1 bg-background/10 dark:bg-background/70 backdrop-blur-sm border border-border dark:border-border/50 rounded shadow-lg overflow-hidden w-64 ${
    isLastColumn ? 'right-0' : 'left-0'
  }`}
>
  <DropdownHeader ... />
  {isFilterActive && <ActiveFiltersSection ... />}
  {isRangeFilter && <RangeFilterSection ... />}
  <SearchInput ... />
  <FilterOptionsList ... />
  <DropdownFooter ... />
</div>
```

**Why**: Main container with exact styling and conditional sections

---

#### Step 6.2: Trigger Button Options
**Location**: `dropdown-filter/dropdown-filter.tsx` or separate component

**Options**:
1. Icon button (ListFilter icon) with badge
2. Text button (FilterBoxButton style)

**Styling** (Icon button):
```tsx
<button
  onClick={() => setIsOpen(!isOpen)}
  className={`relative p-1 rounded-md hover:bg-foreground/10 focus:outline-none ${
    isFilterActive ? 'text-tertiary' : 'text-tertiary'
  }`}
  title={`Filter ${filter.label}`}
>
  <ListFilter 
    strokeWidth={isFilterActive ? 2.5 : 2} 
    size={14} 
    className={isFilterActive ? 'fill-tertiary/20 text-tertiary' : 'text-tertiary'} 
  />
  {filterCount > 0 && (
    <span className="absolute -top-0.5 -right-0.5 bg-tertiary text-background text-[8px] font-medium rounded-full h-3 w-3 flex items-center justify-center">
      {filterCount > 9 ? '9+' : filterCount}
    </span>
  )}
</button>
```

**Why**: Reusable trigger button with active state indicator

---

#### Step 6.3: FilterBoxButton Component
**File**: `dropdown-filter/components/filter-box-button.tsx`

**Purpose**: Text-based filter button with icon, text, and chevron indicator

**Exact Styling** (from `filter-box-button.tsx`):
```tsx
<button
  onClick={handleClick}
  className={`cursor-pointer flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors duration-200 ${
    isActive
      ? 'bg-tertiary text-background hover:bg-tertiary/90 border-tertiary'
      : 'bg-background text-background hover:bg-muted border-border hover:border-tertiary/50'
  } ${isOpen ? 'border-tertiary' : ''} w-full lg:w-[200px]`}
>
  <div className="flex items-center gap-2">
    <IconComponent 
      size={iconSize} 
      className={isActive ? 'text-background' : (iconColor || 'text-foreground')} 
    />
    <span className={`text-sm font-medium ${isActive ? 'text-background' : 'text-foreground'}`}>
      {buttonText}
    </span>
  </div>
  <ChevronDown 
    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${
      isActive ? 'text-background' : 'text-foreground'
    }`} 
  />
</button>
```

**Props**:
```typescript
interface FilterBoxButtonProps {
  buttonText?: string
  isActive?: boolean
  isOpen?: boolean
  onClick?: () => void
  width?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  iconSize?: number
  iconColor?: string
  chevronDown?: boolean
}
```

**Behavior**:
- **Closed State**: Shows icon + button text + chevron down
- **Open State**: Shows icon + "Close Filter" (or date range if active) + chevron up (rotated)
- **Active State**: `bg-tertiary text-background` styling
- **Inactive State**: `bg-background` with hover effects
- **Chevron**: Rotates 180° when expanded

**Why**: Provides text-based filter button option matching old component exactly

---

### Phase 7: Testing & Refinement

#### Step 7.1: Component Testing
- Test all filter types (multi-select, single-select, date-range, number-range)
- Test search functionality
- Test sort functionality
- Test selectability logic
- Test URL integration
- Test auto-apply vs manual apply
- Test expandable range filters

#### Step 7.2: Styling Verification
- Compare side-by-side with old `StandardFilterDropdown`
- Verify all colors, spacing, borders match exactly
- Test dark mode styling
- Test responsive behavior

#### Step 7.3: Performance Testing
- Test with large option sets (1000+ items)
- Verify virtualization works correctly
- Test search performance
- Test filter calculation performance

---

## File Structure Summary

```
app/development/filters/components/dropdown-filter/
├── index.ts                                    # Exports
├── dropdown-filter.tsx                         # Main orchestrator
├── types.ts                                    # TypeScript interfaces
├── components/
│   ├── dropdown-header.tsx                    # Header component
│   ├── active-filters-section.tsx              # Active filters badges
│   ├── range-filter-section.tsx                 # Expandable wrapper
│   ├── range-quick-select-list.tsx             # Quick-select list for range filters
│   ├── search-input.tsx                        # Search input
│   ├── filter-options-list.tsx                 # Virtualized list
│   ├── dropdown-footer.tsx                     # Footer buttons
│   └── filter-box-button.tsx                  # FilterBoxButton component
└── range-filters/
    ├── date-range-filter-dropdown.tsx          # Date range inputs
    └── number-range-filter-dropdown.tsx        # Number range inputs
```

---

## Key Design Decisions

1. **Modular Components**: Each UI section is a separate component for reusability
2. **Type Safety**: Full TypeScript with proper interfaces
3. **URL as Source of Truth**: All filter state managed via `useUrlFilters`
4. **Exact Styling Match**: Copy all className strings exactly from old component
5. **Virtualization**: Use `react-window` for performance with large lists
6. **Conditional Rendering**: Only show sections when needed (active filters, range filters)
7. **Pending State**: Manage pending selections separately from applied filters
8. **Auto-apply Mode**: Support both auto-apply and manual apply modes (via prop)
9. **Column Independent Counts**: API returns both `count` and `columnIndependentCount` for selectability logic
10. **FilterBoxButton**: Full text-based button option with exact styling from old component

---

## Dependencies

- `react-window` - For virtualized list
- `lucide-react` - For icons (Check, X, ArrowUpDown, ListFilter)
- `useUrlFilters` hook - For URL state management
- `FilterConfig` type - For filter configuration
- Existing UI components (if any) - Button, Input, etc.

---

## Migration Path

1. Create new dropdown filter components
2. Test alongside old components
3. Update pages to use new components
4. Remove old components once verified

---

## Component Flow

### Entry Point
```
User clicks trigger button
  ↓
[FilterBoxButton] OR [Icon Button (ListFilter)]
  ↓
Opens dropdown (isOpen = true)
```

### Main Component Structure
```
DropdownFilter (Main Orchestrator)
  ├── State Management
  │   ├── isOpen (dropdown visibility)
  │   ├── searchTerm (search input)
  │   ├── pendingSelections (before Apply)
  │   ├── sortDirection (asc/desc)
  │   └── isOptionsLoaded (loading state)
  │
  ├── URL Integration (useUrlFilters)
  │   ├── Read active filters from URL
  │   ├── Read date/number ranges from URL
  │   └── Update URL on Apply/Clear
  │
  ├── API Integration (for options)
  │   ├── Fetch filter options from /api/filters/options
  │   ├── Options include: count, columnIndependentCount
  │   └── Handle loading states
  │
  └── Dropdown Container (when isOpen === true)
      ├── DropdownHeader
      │   ├── Title: "Filter: {label}"
      │   ├── Count badge: "{selected}/{available}"
      │   └── Sort toggle button
      │
      ├── ActiveFiltersSection (conditional)
      │   ├── Shows active filter badges
      │   ├── "Clear All" button
      │   └── Individual remove buttons (X)
      │
      ├── RangeFilterSection (conditional - if date/number range)
      │   ├── Expandable header: "Filter by range"
      │   └── Range filter content:
      │       ├── DateRangeFilterDropdown (MM/DD/YYYY inputs)
      │       └── NumberRangeFilterDropdown (Min/Max inputs)
      │
      ├── SearchInput
      │   ├── Text input with focus effect
      │   └── Filters options list in real-time
      │
      ├── FilterOptionsList (Virtualized)
      │   ├── Uses react-window FixedSizeList
      │   ├── Each option:
      │   │   ├── Checkbox (selected/unselected)
      │   │   ├── Option label
      │   │   └── Count badge (conditional styling)
      │   └── Handles selectability logic
      │
      └── DropdownFooter
          ├── Clear button
          ├── Cancel button
          └── Apply button (if !autoApply)
```

### Data Flow

```
FilterConfig (props)
  ↓
DropdownFilter extracts:
  - filter.key (URL param name)
  - filter.label (display name)
  - filter.type (multi-select, date-range, etc.)
  ↓
useUrlFilters reads current state:
  - getList(filter.key) → activeFilters
  - getRange(filter.key) → dateRange
  - getNumberRange(filter.key) → numberRange
  ↓
API Call (if options not provided):
  - GET /api/filters/options?otherFilters=...
  - Returns FilterConfig[] with options
  - Each option has: count, columnIndependentCount
  ↓
Calculate filter options:
  - Use API options or calculate from dataSource
  - Apply searchTerm filter
  - Sort by sortDirection
  - Determine selectability (columnIndependentCount > 0)
  ↓
User interactions:
  - Toggle option → updates pendingSelections
  - Change search → filters options list
  - Toggle sort → re-sorts options
  - Apply → updates URL via useUrlFilters (if !autoApply)
  - Auto-apply → updates URL immediately on toggle
  - Cancel → resets pendingSelections to URL state
  - Clear → removes filter from URL
```

### Button States

**FilterBoxButton States:**
```
Closed State:
  - Shows: Icon + "Filter {label}" + ChevronDown
  - Styling: bg-background (or bg-tertiary if active)
  - Click → Opens dropdown

Open State:
  - Shows: Icon + "Close Filter" (or date range if active) + ChevronDown (rotated)
  - Styling: border-tertiary (highlighted border)
  - Click → Closes dropdown
```

**Icon Button States:**
```
Closed State:
  - Shows: ListFilter icon + badge (if active)
  - Styling: hover:bg-foreground/10
  - Click → Opens dropdown

Open State:
  - Shows: X icon
  - Styling: hover:bg-tertiary/10
  - Click → Closes dropdown
```

---

## Notes

- All styling must match `StandardFilterDropdown` exactly
- Use existing `FilterConfig` system for configuration
- Integrate with `useUrlFilters` for URL state management
- Support all filter types: multi-select, single-select, date-range, number-range
- Maintain performance with virtualization for large option sets
- Document all components with JSDoc comments
- `autoApply` is a prop passed to the component (not internal state)
- API must return both `count` and `columnIndependentCount` for proper selectability logic