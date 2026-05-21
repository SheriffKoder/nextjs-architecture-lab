# Quick Select for Date/Number Ranges Implementation Plan

## Overview
Add multi-select quick select dropdowns to date-range and number-range filters that show unique values from data. When users select multiple values, automatically determine min/max and update the range params.

## Goals
1. Add `showQuickSelect` flag to FilterConfig
2. Extract unique values for date and number fields
3. Create quick select components that use multi-select UI
4. Integrate into existing range filter components
5. Auto-calculate min/max from selected values

## Implementation Steps

### Phase 1: Type Updates
- [x] Add `showQuickSelect?: boolean` to FilterConfig
- [x] Add `quickSelectType?: "unique" | "buckets" | "presets"` (future-proof)
- [x] Keep buckets/presets in type but not implement yet

### Phase 2: Data Extraction
- [x] Update `get-filter-options.ts` to extract unique values for date/number fields
- [x] Add `salary` and `createdAt` to field mapping
- [x] Extract unique values when `showQuickSelect: true`

### Phase 3: Quick Select Components
- [x] Create `DateQuickSelect` component
  - Multi-select dropdown showing unique dates
  - Reads current range from URL
  - Calculates min/max from selections
  - Updates range params using same key

- [x] Create `NumberQuickSelect` component
  - Multi-select dropdown showing unique numbers
  - Reads current range from URL
  - Calculates min/max from selections
  - Updates range params using same key

### Phase 4: Integration
- [x] Update `DateRangeFilter` to show `DateQuickSelect` when `showQuickSelect: true`
- [x] Update `NumberRangeFilter` to show `NumberQuickSelect` when `showQuickSelect: true`
- [x] Ensure both use same URL key (no conflicts)

### Phase 5: API & Config Updates
- [x] Update `/api/filters/options` to include `showQuickSelect: true` for salary/date
- [ ] Test end-to-end flow

## Technical Details

### URL Param Strategy
- Same key for both quick select and manual range input
- Quick select sets: `salary=65000_110000` (min_max)
- Manual input also sets: `salary=65000_110000`
- Both read from same param, no conflicts

### Component Structure
```
DateRangeFilter
├── DateQuickSelect (if showQuickSelect: true)
│   └── Multi-select showing unique dates
└── DateRangePicker (existing)
```

### Selection Logic
1. User selects multiple dates/numbers in quick select
2. Component finds min and max from selected values
3. Calls `setRange()` or `setNumberRange()` with min/max
4. URL updates, range picker/inputs sync automatically

## Future Enhancements (Not Now)
- `quickSelectType: "buckets"` - Group dates by month, numbers by ranges
- `quickSelectType: "presets"` - Pre-defined ranges (Last 30 days, etc.)
