# PillFilter Component Implementation Plan

## Overview
Create a pill-style filter component similar to `features/filtering-wrapper-multi-display/components/PillFilter` that integrates with our existing filter system. The component will combine a filter button, search bar, and dropdown panel in a single pill-shaped container.

## Goals
1. Create PillFilter component matching the reference design
2. Integrate with existing FilterConfig system
3. Use existing filter options fetching (getFilterOptions)
4. Integrate with useUrlFilters hook
5. Support both RSC and client pages
6. Maintain existing filter functionality (multi-select, single-select, ranges)

## File Structure
```
app/development/filters/components/PillFilter/
├── pill-filter.tsx              # Main PillFilter component
├── filter-column-list.tsx       # Left side column titles list
├── filter-options-panel.tsx     # Right side filter options panel
├── pill-search-bar.tsx          # Integrated search bar for pill
└── index.ts                      # Exports
```

## Implementation Phases

### Phase 1: Core Component Structure
**Files to Create:**
- `app/development/filters/components/PillFilter/pill-filter.tsx`

**Features:**
- Main container with pill-shaped border (rounded-lg)
- Filter button on left (rounded-l-lg) with:
  - Filter icon
  - "Filter" text
  - Count badge showing active filter count
  - Tertiary background when active
- Search input on right (flex-1) with:
  - Search icon on left
  - Input field
  - Chevron up/down toggle button on right
- Dropdown panel (absolute positioned) that:
  - Appears below pill when toggled
  - Has backdrop blur effect
  - Two-column layout (column titles left, filter options right)

**Props Interface:**
```typescript
interface PillFilterProps {
  filters: FilterConfig[]  // Filter configurations with options
  searchConfig?: SearchConfig<any>  // Optional search config
  className?: string
}
```

**State Management:**
- `isDropdownOpen`: boolean - Controls dropdown visibility
- `activeFilterKey`: string | null - Currently active filter column
- `selectedFiltersOrder`: string[] - Order of selected filters (for styling)

### Phase 2: Filter Column List Component
**Files to Create:**
- `app/development/filters/components/PillFilter/filter-column-list.tsx`

**Features:**
- Vertical list of filter column titles (left side)
- Width: w-32 lg:w-48
- Scrollable if many filters (max-h-[500px])
- Active column styling:
  - Gradient background (from-tertiary/30 to-transparent)
  - Tertiary text color
- Previously selected with active filters:
  - Gradient background (from-tertiary/10 to-transparent)
  - Tertiary text color
- Click handler to set active column

**Props Interface:**
```typescript
interface FilterColumnListProps {
  filters: FilterConfig[]
  activeFilterKey: string | null
  selectedFiltersOrder: string[]
  activeFilters: Record<string, any>  // From useUrlFilters
  onFilterClick: (filterKey: string) => void
}
```

**Active Filter Detection:**
- Use useUrlFilters to check if each filter has active values
- For multi-select: check if array length > 0
- For single-select: check if value exists
- For ranges: check if start/end or min/max exist

### Phase 3: Filter Options Panel Component
**Files to Create:**
- `app/development/filters/components/PillFilter/filter-options-panel.tsx`

**Features:**
- Right side panel showing filter options for active column
- Only shows options for active filter (others hidden)
- Reuses existing filter components:
  - MultiSelectFilter (for multi-select type)
  - SingleSelectFilter (for single-select type)
  - DateRangeFilter (for date-range type)
  - NumberRangeFilter (for number-range type)
- Spacing: space-y-2 lg:space-y-4

**Props Interface:**
```typescript
interface FilterOptionsPanelProps {
  filters: FilterConfig[]
  activeFilterKey: string | null
}
```

**Implementation:**
- Map over filters array
- Only render FilterRenderer for active filter
- Use existing FilterRenderer component (already handles all filter types)

### Phase 4: Integrated Search Bar
**Files to Create:**
- `app/development/filters/components/PillFilter/pill-search-bar.tsx`

**Features:**
- Simplified search bar for pill container
- Integrated into right side of pill (flex-1)
- Search icon on left
- Input field
- Chevron toggle button on right
- Reuses SearchBar component logic but with pill-specific styling

**Props Interface:**
```typescript
interface PillSearchBarProps {
  searchConfig: SearchConfig<any>
  className?: string
}
```

**Alternative:** 
- Could reuse existing SearchBar component with custom styling
- Or create simplified version for pill

### Phase 5: Active Filter Count Logic
**Location:** `pill-filter.tsx`

**Features:**
- Count active filters using useUrlFilters
- Count logic:
  - Multi-select: array length
  - Single-select: 1 if value exists
  - Date range: 1 if start or end exists
  - Number range: 1 if min or max exists
- Display count in badge on filter button
- Badge styling: px-3 py-0.5, rounded-full, bg-foreground/30

**Implementation:**
```typescript
const { getList, get, getRange, getNumberRange } = useUrlFilters()

const activeFilterCount = filters.reduce((count, filter) => {
  if (filter.type === 'multi-select') {
    return count + getList(filter.key).length
  }
  if (filter.type === 'single-select') {
    return count + (get(filter.key) ? 1 : 0)
  }
  if (filter.type === 'date-range') {
    const range = getRange(filter.key)
    return count + (range?.start || range?.end ? 1 : 0)
  }
  if (filter.type === 'number-range') {
    const range = getNumberRange(filter.key)
    return count + (range?.min !== undefined || range?.max !== undefined ? 1 : 0)
  }
  return count
}, 0)
```

### Phase 6: Integration with Existing System

#### For RSC Pages (`app/development/filters/page.tsx`):
**Changes:**
- Replace FiltersBar with PillFilter
- Keep Suspense boundary for filter options
- Pass filters from getFilterOptionsServer
- Pass searchConfig

**Code:**
```typescript
<Suspense fallback={<LoadingFiltersBar />}>
  <PillFilter 
    filters={filters} 
    searchConfig={employeeSearchConfig}
  />
</Suspense>
```

#### For Client Pages (`app/development/filters/employees-client/page.tsx`):
**Changes:**
- Replace FiltersBar with PillFilter
- Use useFilterOptions hook for filter options
- Pass filters from query result
- Pass searchConfig

**Code:**
```typescript
const { data: filterOptions } = useFilterOptions()

{filterOptions && (
  <PillFilter 
    filters={filterOptions} 
    searchConfig={employeeSearchConfig}
  />
)}
```

### Phase 7: Styling and Polish
**Features:**
- Match reference component styling exactly
- Pill container: border, rounded-lg
- Filter button: rounded-l-lg, tertiary background
- Search input: rounded-r-md, tertiary/10 background
- Dropdown: backdrop-blur-sm, shadow-lg
- Smooth transitions for dropdown open/close
- Responsive design (mobile and desktop)

**Tailwind Classes:**
- Pill container: `border border-border rounded-lg`
- Filter button: `rounded-l-lg bg-tertiary text-tertiary-foreground`
- Search input: `rounded-r-md bg-tertiary/10`
- Dropdown: `bg-background/80 backdrop-blur-sm shadow-lg`
- Transitions: `transition-all duration-200`

## Dependencies
- Existing components: FilterRenderer, SearchBar (or create pill version)
- Existing hooks: useUrlFilters
- Existing utilities: getFilterOptions, getFilterOptionsServer
- Existing config: employeeBaseFilters, employeeSearchConfig

## Testing Checklist
- [ ] Pill container renders correctly
- [ ] Filter button shows count badge when filters active
- [ ] Search input works and updates URL
- [ ] Dropdown toggles on chevron click
- [ ] Column list shows all filters
- [ ] Active column highlighted correctly
- [ ] Filter options panel shows only active filter
- [ ] All filter types work (multi-select, single-select, ranges)
- [ ] Filter counts display correctly in dropdowns
- [ ] Works in RSC page
- [ ] Works in client page
- [ ] Responsive design works on mobile
- [ ] Active filter count calculates correctly

## Implementation Order
1. Create pill-filter.tsx (main component structure)
2. Create filter-column-list.tsx (left side)
3. Create filter-options-panel.tsx (right side)
4. Create or adapt pill-search-bar.tsx (search integration)
5. Add active filter count logic
6. Integrate into RSC page
7. Integrate into client page
8. Style and polish
9. Test all functionality

## Notes
- Reuse existing FilterRenderer component (no need to recreate filter components)
- Reuse existing SearchBar component or create simplified pill version
- Maintain compatibility with existing filter system
- All URL state management through useUrlFilters hook
- Filter options fetched same way as current system (getFilterOptions)
