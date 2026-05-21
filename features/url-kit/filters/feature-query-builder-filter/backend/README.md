# Query Filter Backend Utilities

This directory contains backend utilities for processing query filter AST (Abstract Syntax Tree) structures. These utilities translate user-created filters into database queries and validate filter structures.

## Purpose

The backend utilities bridge the gap between the frontend filter builder UI and database query execution. They handle:
- **Validation**: Ensuring filter structures are valid before processing
- **Translation**: Converting filter AST to database-specific query formats
- **Date Resolution**: Converting user-friendly date values to actual dates
- **Query Building**: Applying filters to database query builders (e.g., Supabase)

## Files Overview

### `resolve-date.ts`

**Why**: Converts user-friendly relative date values to ISO date strings.

**When to use**: 
- When processing date filter conditions
- When a user selects relative dates like "today", "yesterday", "days_ago", etc.
- Before applying date filters to database queries

**Example**:
```typescript
resolveDate('today') // Returns: '2025-01-20'
resolveDate('days_ago', 7) // Returns: '2025-01-13'
resolveDate('exact_date', undefined, '2025-01-15') // Returns: '2025-01-15'
```

**Key Features**:
- Handles relative dates (today, yesterday, one_week_ago, etc.)
- Supports numeric offsets (days_ago, days_from_now)
- Returns ISO date strings (YYYY-MM-DD format)

---

### `filter-dsl.ts`

**Why**: Maps user-friendly filter operators to database-specific query operators.

**When to use**:
- When translating filter conditions to database queries
- When working with Supabase or similar query builders
- When you need to convert operators like "contains" to "ilike" or "is" to "eq"

**Example**:
```typescript
FilterDSL.text.contains('john') // Returns: { op: 'ilike', value: '%john%' }
FilterDSL.number.gt(100) // Returns: { op: 'gt', value: 100 }
FilterDSL.date.before('2025-01-01', 'exact_date') // Returns: { op: 'lt', value: '2025-01-01' }
```

**Key Features**:
- Type-safe operator mapping (text, number, date)
- Handles empty operators (is_empty, is_not_empty)
- Integrates with date resolution for date fields
- Returns standardized `{ op, value }` objects

---

### `validate-filter.ts`

**Why**: Ensures filter AST structures are valid before processing.

**When to use**:
- Before applying filters to database queries
- When receiving filter data from URL parameters
- As a safety check to prevent invalid queries
- In API routes before processing filter requests

**Example**:
```typescript
const filter = decodeFilters(urlParam)
if (!validateFilter(filter)) {
  return error('Invalid filter structure')
}
// Proceed with applying filter
```

**Key Features**:
- Recursively validates nested filter groups
- Checks required fields (id, field, operator, logic)
- Validates logic values (and/or)
- Returns early for empty filters (considered valid)

---

### `apply-filters.ts`

**Why**: Applies filter AST to database query builders (e.g., Supabase).

**When to use**:
- In API routes that need to filter database results
- When building Supabase queries with complex filters
- When translating filter AST to actual database queries
- For server-side filtering operations

**Example**:
```typescript
const query = supabase.from('employees').select('*')
const fieldMap = {
  name: { column: 'name', type: 'text' },
  salary: { column: 'salary', type: 'number' },
  createdAt: { column: 'created_at', type: 'date' }
}
const filteredQuery = applyFilters(query, filterAST, fieldMap)
```

**Key Features**:
- Recursively processes nested filter groups
- Handles AND/OR logic correctly
- Maps filter fields to database columns
- Supports Supabase query builder pattern
- Handles different operator signatures (empty operators, date operators, etc.)

**Important**: 
- Requires a `FieldMapping` to map filter field keys to database column names
- Works with Supabase query builder instances
- Handles nested groups with proper logic application

---

### `index.ts`

**Why**: Centralized exports for all backend utilities.

**When to use**:
- When importing backend utilities in API routes
- For clean, organized imports
- To maintain a single entry point for backend functionality

**Example**:
```typescript
import { validateFilter, applyFilters, resolveDate, FilterDSL } from '@/app/development/filters/query-filter/backend'
```

---

## Usage Flow

### Typical Backend Processing Flow:

1. **Receive filter from URL** → Decode using `decodeFilters()`
2. **Validate filter** → Use `validateFilter()` to ensure structure is valid
3. **Apply to query** → Use `applyFilters()` with field mapping and query builder
4. **Date resolution** → Handled automatically by `FilterDSL` using `resolveDate()`
5. **Execute query** → Run the filtered query against database

### Example Integration:

```typescript
// In API route
import { decodeFilters } from '../utils/decode-filters'
import { validateFilter, applyFilters } from '../backend'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filterParam = searchParams.get('filter')
  
  // 1. Decode filter from URL
  const filter = decodeFilters(filterParam)
  
  // 2. Validate filter structure
  if (filter && !validateFilter(filter)) {
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 })
  }
  
  // 3. Apply to Supabase query
  const supabase = createClient(...)
  let query = supabase.from('employees').select('*')
  
  if (filter) {
    const fieldMap = {
      name: { column: 'name', type: 'text' },
      email: { column: 'email', type: 'text' },
      status: { column: 'status', type: 'text' },
      salary: { column: 'salary', type: 'number' },
      createdAt: { column: 'created_at', type: 'date' }
    }
    query = applyFilters(query, filter, fieldMap)
  }
  
  // 4. Execute query
  const { data, error } = await query
  return NextResponse.json({ data })
}
```

## Field Mapping

The `applyFilters` function requires a `FieldMapping` object that maps filter field keys to database columns:

```typescript
const fieldMap: FieldMapping = {
  // Filter key → Database column mapping
  name: { column: 'full_name', type: 'text' },
  email: { column: 'email_address', type: 'text' },
  salary: { column: 'annual_salary', type: 'number' },
  createdAt: { column: 'created_at', type: 'date' }
}
```

**Why**: 
- Filter fields use user-friendly names (e.g., "name", "email")
- Database columns may have different names (e.g., "full_name", "email_address")
- Field types are needed to select the correct operator mapping

## Notes

- **Supabase-specific**: The current implementation targets Supabase query builders, but can be adapted for other databases
- **Type safety**: All utilities are fully typed with TypeScript
- **Recursive**: Handles deeply nested filter groups recursively
- **Immutable**: Filter operations don't mutate the original filter AST
- **Validation**: Always validate filters before applying to prevent invalid queries
