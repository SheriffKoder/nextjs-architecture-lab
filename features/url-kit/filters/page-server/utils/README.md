# Page Server Utils Structure

This directory contains utility functions for the server-side (RSC) page implementation. The structure separates **organizational code** (wrappers/coordinators) from **business logic** (core algorithms that can be swapped).

## Directory Structure

```
utils/
├── backend-simulate/          # Business logic (swappable core algorithms)
│   ├── get-filter-options.ts  # Algorithm for extracting unique values and populating filter options
│   ├── filter-employees.ts    # Filtering rules and logic for employees
│   └── filter-by-search.ts   # Search algorithm for filtering by query
├── get-filter-options-server.ts  # Organizational wrapper for filter options
└── get-page-data.ts              # Organizational wrapper for page data
```

## File Categories

### Organizational Code (Wrappers)

These files coordinate and organize the business logic. They define the interface and structure but delegate the actual work to business logic functions.

#### `get-filter-options-server.ts`
- **Purpose**: Server-side wrapper for getting filter options in RSC pages
- **Role**: Coordinates the filter options generation process
- **Dependencies**: Uses `backend-simulate/get-filter-options.ts` for core logic
- **Why separate**: Provides RSC-specific interface while keeping business logic swappable

#### `get-page-data.ts`
- **Purpose**: Provides filtered employee data for the page
- **Role**: Coordinates data fetching and filtering
- **Dependencies**: Uses `backend-simulate/filter-employees.ts` for filtering logic
- **Why separate**: Provides page-specific interface while keeping filtering logic swappable

### Business Logic (`backend-simulate/`)

These files contain the **core algorithms and business rules** that can be replaced when moving from mock data to real backend APIs or when changing business requirements.

#### `backend-simulate/get-filter-options.ts`
- **Purpose**: Generic utility to extract unique values and populate filter options
- **Core Logic**: 
  - Extracts unique values from data source
  - Calculates counts (totalCount and initialCount)
  - Formats labels appropriately
- **Swappable**: Can be replaced with database queries or API calls
- **Interface**: Accepts `filterConfigs`, `dataSource`, `fieldMap`, and optional `filteredDataSource`

#### `backend-simulate/filter-employees.ts`
- **Purpose**: Filters employee data based on URL search parameters
- **Core Logic**:
  - Parses multi-select filters (comma-separated)
  - Parses single-select filters
  - Parses number-range filters (underscore-separated)
  - Parses date-range filters
  - Applies all filters to employee array
- **Swappable**: Can be replaced with database queries or API filtering
- **Helper Functions**:
  - `filterEmployeesExcludingColumn()` - Filters data excluding a specific column (for initialCount calculation)

#### `backend-simulate/filter-by-search.ts`
- **Purpose**: Generic utility to filter data by search query across multiple fields
- **Core Logic**:
  - Normalizes search query (case-insensitive)
  - Searches across specified fields with OR logic
  - Handles null/undefined values gracefully
- **Swappable**: Can be replaced with full-text search or database search queries

## Architecture Pattern

This structure follows the **Strategy Pattern**:

- **Organizational Code** = Interface/Structure (stable)
- **Business Logic** = Implementation (swappable)

### Benefits

1. **Easy Replacement**: When moving from mock data to real APIs, only swap `backend-simulate/` functions
2. **Clear Boundaries**: Organizational code focuses on "how to organize", business logic focuses on "what the rules are"
3. **Testability**: Business logic can be tested independently from organizational code
4. **Maintainability**: Changes to business rules only affect business logic files

### Example: Replacing Business Logic

When moving to a real backend:

```typescript
// Instead of: backend-simulate/get-filter-options.ts
// Use: backend-api/get-filter-options.ts

// The organizational code (get-filter-options-server.ts) stays the same
// Only the import changes:
import { getFilterOptions } from "./backend-api/get-filter-options"
```

The organizational wrappers remain unchanged, maintaining a stable interface while allowing the core logic to evolve.
