# Dynamic Filter Options Implementation Plan

## Overview
Replace static filter options with dynamic options extracted from actual data. This ensures filter options stay in sync with the dataset.

## Goals
1. Extract unique values from employee data for each filterable field
2. Create API endpoint for TanStack Query pages
3. Create server function for RSC pages
4. Add loading state component for filters
5. Update both pages to use dynamic options

## Implementation Steps

### Phase 1: Core Utilities
- [x] Create `get-filter-options.ts` utility
  - Extract unique values from employee data
  - Map filter keys to employee fields
  - Format labels appropriately
  - Populate FilterConfig options

### Phase 2: API & Server Functions
- [x] Create `/api/filters/options` route
  - Accept base filter configs
  - Return configs with populated options
  - Handle errors gracefully

- [x] Create `get-filter-options-server.ts`
  - Server function wrapper for RSC pages
  - Reuse core utility logic

### Phase 3: Loading Component
- [x] Create `LoadingFiltersBar` component
  - Skeleton loader for filter buttons
  - Match FiltersBar layout
  - Smooth loading experience

### Phase 4: Update Pages
- [x] Update RSC page (`page.tsx`)
  - Remove static filter options
  - Use `getFilterOptionsServer()`
  - Add Suspense with LoadingFiltersBar

- [x] Update TanStack page (`employees-client/page.tsx`)
  - Create `useFilterOptions` hook
  - Fetch from `/api/filters/options`
  - Show LoadingFiltersBar while loading
  - Use dynamic options in FiltersBar

### Phase 5: Testing & Verification
- [ ] Verify filter options match data
- [ ] Test loading states
- [ ] Ensure filters work correctly
- [ ] Check error handling

## File Structure
```
app/development/filters/
├── utils/
│   ├── get-filter-options.ts (NEW)
│   └── get-filter-options-server.ts (NEW)
├── components/
│   └── loading-filters-bar.tsx (NEW)
├── api/filters/
│   └── options/route.ts (NEW)
├── page.tsx (UPDATE)
└── employees-client/
    └── page.tsx (UPDATE)
```

## Technical Details

### Field Mapping
- `status` → `employee.status`
- `role` → `employee.role`
- `department` → `employee.department`
- `salary` → `employee.salary` (number-range, no options needed)

### Filter Types
- `multi-select` and `single-select` → Need options
- `date-range` and `number-range` → No options needed

### Data Source
- Uses centralized `employees` from `data-source.ts`
- Can be extended to accept filtered data in future
