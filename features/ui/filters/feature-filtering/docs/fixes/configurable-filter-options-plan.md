# Generic Filter Options Refactoring Plan

## Overview
Refactor filter options system to be generic and reusable across any entity (employees, products, orders, etc.) by:
1. Making `getFilterOptions` accept an options object with explicit props
2. Creating shared config files that export data, configs, and field maps
3. Making the system work with any data type, not just employees

## Goals
1. Make `getFilterOptions` generic and accept options object
2. Create `employee-filter-config.ts` with shared config, data, and field map
3. Update server function and API route to use shared config
4. Ensure backward compatibility with existing pages

## Implementation Steps

### Phase 1: Create Shared Config File
- [x] Create `employee-filter-config.ts`
  - Export `employeeBaseFilters` (filter configs)
  - Export `employeeFieldMap` (key to field mapping)
  - Export `employees` and `Employee` type

### Phase 2: Refactor getFilterOptions
- [x] Create `GetFilterOptionsOptions<T>` interface
- [x] Make `getFilterOptions` generic with options object
- [x] Remove hardcoded Employee type dependencies
- [x] Make `getUniqueValuesForField` generic
- [x] Remove default data source parameter

### Phase 3: Update Server Function
- [x] Import from shared config file
- [x] Update to use new options object signature
- [x] Keep default parameter for backward compatibility

### Phase 4: Update API Route
- [x] Import from shared config file
- [x] Update to use new options object signature

### Phase 5: Verify
- [x] Check RSC page still works (uses getFilterOptionsServer with custom configs)
- [x] Check client page still works (uses API route)
- [x] Verify no linter errors

## Benefits
- Generic: Works with any data type
- Self-documenting: Options object makes parameters clear
- Centralized: Config and data in one place per entity
- Reusable: Easy to add new entities (products, orders, etc.)
- Type-safe: TypeScript enforces required properties
