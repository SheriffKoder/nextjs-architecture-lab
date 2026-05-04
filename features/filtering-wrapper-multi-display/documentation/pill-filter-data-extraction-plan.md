# Pill Filter Data Extraction Plan

## Problem
Pill filters show the left panel (columns) but no filter options. This is because `TableFilterList` only works with:
- `dropdownItemsFromParent` (from `filterUniqueValues` when columns have `uniqueValues`)
- `getDropdownItems` (function on column)

Unlike table header filters (`TableFilterDropdownOrchestrator`), `TableFilterList` doesn't have a fallback to extract unique values directly from the data array.

## Solution
Add the same data extraction fallback logic that `TableFilterDropdownOrchestrator` uses, so pill filters can extract options from data when API sources aren't available.

## Implementation Steps

### 1. Update `PillFilter` Component Interface
- Add `data?: T[]` prop
- Add `filteredData?: T[]` prop  
- Add `getFilteredDataExcludingColumn?: (excludeColumnKey: string) => T[]` prop
- Pass these props to `TableFilterList`

### 2. Update `TableFilterList` Component Interface
- Add `data?: T[]` prop
- Add `filteredData?: T[]` prop
- Add `getFilteredDataExcludingColumn?: (excludeColumnKey: string) => T[]` prop

### 3. Add Data Extraction Logic to `TableFilterList`
- Copy the fallback logic from `TableFilterDropdownOrchestrator` (lines 352-423)
- Extract unique values from `data` when:
  - `dropdownItemsFromParent` is undefined
  - `getDropdownItems` is not provided or returns empty
  - `data` is available and not empty
- Calculate counts (total and column-independent) similar to table header filters
- Handle arrays, objects, and primitives in column values
- Include active filters in options even if not in data

### 4. Update `FilteringWrapper` to Pass Data Props
- Pass `data={data}` to `PillFilter`
- Pass `filteredData={displayFilteredData}` to `PillFilter`
- Pass `getFilteredDataExcludingColumn={getFilteredDataExcludingColumn}` to `PillFilter`

## Files to Modify
1. `components/filtering-wrapper-multi-display/components/PillFilter/pill-filters-wrapper.tsx`
2. `components/filtering-wrapper-multi-display/components/PillFilter/TableFilterList.tsx`
3. `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

## Expected Outcome
Pill filters will show filter options extracted from the data array when:
- Columns don't have `uniqueValues` configured
- `filterUniqueValues` is not provided
- Columns don't have `getDropdownItems` function

This matches the behavior of table header filters.

## Implementation Status: ✅ COMPLETED

### Changes Made:
1. ✅ Updated `PillFilter` interface to accept `data`, `filteredData`, and `getFilteredDataExcludingColumn` props
2. ✅ Updated `TableFilterList` interface to accept the same props
3. ✅ Added data extraction fallback logic to `TableFilterList` (similar to `TableFilterDropdownOrchestrator`)
4. ✅ Updated `FilteringWrapper` to pass `data`, `filteredData`, and `getFilteredDataExcludingColumn` to `PillFilter`

### Files Modified:
1. ✅ `components/filtering-wrapper-multi-display/components/PillFilter/pill-filters-wrapper.tsx`
2. ✅ `components/filtering-wrapper-multi-display/components/PillFilter/TableFilterList.tsx`
3. ✅ `components/filtering-wrapper-multi-display/filtering-wrapper.tsx`

The pill filter now extracts unique values from the data array as a fallback when API sources aren't available, matching the behavior of table header filters.
