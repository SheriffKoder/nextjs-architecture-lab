# Demo RSC Page - Implementation Plan

## Overview
Create a React Server Component (RSC) page that demonstrates fetching mock rental car data from a server function and displaying it using FilteringWrapper with table view as default. Includes action buttons beside page header and comprehensive configuration options.

## File Structure

```
features/demo-rsc-page/
├── types/
│   └── rental-car-table-item.ts # Row type `RentalCarTableItem` (mock data + displays import this)
├── config/
│   └── displays/table-config.ts # Table chrome config (imports row type from `types/`)
├── components/
│   └── action-buttons.tsx       # Action buttons component (Export CSV, Add Car)
├── utils/
│   └── server/
│       ├── get-rental-cars-data.ts    # Server function to fetch mock rental cars
│       └── data-source.ts            # Mock rental cars data source
├── demo-rsc-content.tsx          # Client component that renders FilteringWrapper
└── README.md                      # Documentation for this feature

app/(root)/demo-rsc-page/
└── page.tsx                       # RSC page component
```

## Implementation Steps

### Step 1: Create Feature Directory Structure
- Create `features/demo-rsc-page/` directory
- Create subdirectories: `config/`, `components/`, `utils/server/`

### Step 2: Create Mock Data Source (`utils/server/data-source.ts`)
**Purpose**: Define mock rental cars data array
**Content**:
- Export array of rental car objects matching `RentalCarTableItem` from `types/rental-car-table-item.ts`
- Include fields: id, model, make, year, status, location, mileage, pricePerDay, color, licensePlate
- Generate ~20-30 mock cars with varied data

### Step 3: Create Server Function (`utils/server/get-rental-cars-data.ts`)
**Purpose**: Server function that returns mock rental cars (can be extended for filtering later)
**Function Signature**:
```typescript
export async function getRentalCarsData(
  searchParams?: { [key: string]: string | string[] | undefined }
): Promise<RentalCarTableItem[]>
```
**Implementation**:
- Import mock data from `data-source.ts`
- Return all cars (filtering can be added later if needed)
- Keep it simple for initial demo

### Step 4: Create Action Buttons Component (`components/action-buttons.tsx`)
**Purpose**: Action buttons for page header (Export CSV, Add Car)
**Implementation**:
- Export CSV button with Save icon
- Add Car button with Plus icon
- Uses PrimaryButton component

### Step 5: Create Table Configuration (`config/displays/table-config.ts`)
**Purpose**: Define table chrome config with ALL available options (row type lives in `types/rental-car-table-item.ts`)

**Exports**:
1. **Table Columns**: All columns with proper configuration (see `config/columns.ts`)
2. **Header Columns**: Columns for filter dropdowns in header
3. **Filter Config**: All filter configuration options (marked false/undefined where not needed)
4. **Table Config**: All table configuration options (marked false/undefined where not needed)

### Step 6: Create Content Component (`demo-rsc-content.tsx`)
**Purpose**: Client component that renders FilteringWrapper
**Type**: `'use client'` component
**Props**: cars, loading, onRowClick

### Step 7: Create RSC Page (`app/(root)/demo-rsc-page/page.tsx`)
**Purpose**: Server component that fetches data and renders page with action buttons
**Features**:
- PageHeader with subtitle
- ActionButtons beside header
- Suspense boundary with loading skeletons
- DemoRscContent component

## Loading Skeleton Structure

The loading skeleton includes:
1. **PageHeaderSkeleton**: Matches PageHeader with subtitle
2. **Action Buttons Skeleton**: Two placeholder buttons matching ActionButtons layout
3. **TableSkeleton**: Matches table structure with 9 columns (matching tableColumns) and 10 rows

## Configuration Options Reference

### FilterConfig - All Available Options:
- ✅ `initialSortKey`: Default column to sort by
- ✅ `initialSortDirection`: "ascending" | "descending"
- ✅ `autoApplyDropdown`: Auto-apply filters when selected
- ✅ `showBadgesDropdown`: Show badge count in dropdown
- ✅ `rangeOpen`: Default state for range filters
- ✅ `searchPlaceholder`: Placeholder text for search
- ✅ `searchHighlightStyle`: CSS classes for search highlight
- ✅ `hideTopLevelFilterSorting`: Hide sorting controls in header
- ✅ `hideTopLevelFiltering`: Hide filter dropdowns in header
- ✅ `hideTopLevelSearch`: Hide search bar in header
- ✅ `headerColumns`: Columns to show in header filters
- ✅ `showPill`: Show pill filter component
- ✅ `showIndependentDateFilter`: Show separate date filter button
- ✅ `showDateFilterHeader`: Show date filter in header
- ✅ `sideFilterButton`: Side filter button configuration
- ✅ `initialPaginationMode`: Enable pagination by default
- ✅ `itemsPerPage`: Items per page when pagination enabled
- ✅ `hidePaginationSwitch`: Hide toggle to enable/disable pagination

### TableConfig - All Available Options:
- ✅ `rowHeight`: Fixed row height in pixels
- ✅ `minRowHeight`: Minimum row height for dynamic rows
- ✅ `dynamicRowHeight`: Enable variable row heights
- ✅ `tableHeight`: Fixed table height
- ✅ `emptyMessage`: Message when no data
- ✅ `loading`: Loading state
- ✅ `loadingStateShimmer`: Show shimmer effect when loading
- ✅ `rowExpansion`: Row expansion configuration
- ✅ `actionMode`: 'inline' | 'dropdown' for row actions
- ✅ `editableColumns`: Array of column keys that are editable
- ✅ `groupStylerConfig`: Custom styling per group
- ✅ `rowStyler`: Custom styling per row
- ✅ `transparentHeader`: Header becomes transparent on scroll
- ✅ `groupBy`: Primary grouping key
- ✅ `subGroupBy`: Secondary grouping key
- ✅ `groupKeyFormatter`: Custom formatter for group headers
- ✅ `subGroupKeyFormatter`: Custom formatter for sub-group headers
- ✅ `groupSpacing`: Spacing between groups in pixels

## Next Steps (Future Enhancements)
1. Add server-side filtering support via searchParams
2. Add server-side sorting support via searchParams
3. Add server-side pagination support via searchParams
4. Add additional views (kanban, calendar, map, etc.)
5. Implement actual CSV export functionality
6. Implement add car / row detail (e.g. drawer on the client demo page pattern)

## Testing Checklist
- [ ] Page renders without errors
- [ ] Mock data displays in table
- [ ] Action buttons render beside page header
- [ ] Loading skeletons display correctly
- [ ] Columns are sortable
- [ ] Filters work (dropdown filters)
- [ ] Search works
- [ ] Pagination works
- [ ] Loading state displays correctly
- [ ] Empty state displays when no data
- [ ] Row click handler works
