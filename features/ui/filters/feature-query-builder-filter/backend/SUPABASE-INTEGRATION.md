# Supabase Integration Guide

## Files & Functions Used

**Files:**
- `validate-filter.ts` - `validateFilter()`
  - **WHY**: Ensures filter AST structure is valid before processing to prevent invalid queries and errors
  - **What it does**: Recursively validates filter nodes, checks required fields (id, field, operator, logic), and validates logic values (and/or)

- `apply-filters.ts` - `applyFilters()`, `FieldMapping` interface
  - **WHY**: Translates filter AST to Supabase query filters, enabling complex nested filter logic
  - **What it does**: Recursively traverses filter tree, applies conditions to Supabase query builder using field mapping, handles AND/OR group logic, and processes nested groups

- `filter-dsl.ts` - `FilterDSL` (used internally by `applyFilters`)
  - **WHY**: Maps user-friendly operators (contains, is, gt, etc.) to Supabase query operators (ilike, eq, gt, etc.)
  - **What it does**: Provides type-safe operator mapping for text/number/date fields, returns standardized {op, value} objects for query building

- `resolve-date.ts` - `resolveDate()` (used internally by `FilterDSL`)
  - **WHY**: Converts user-friendly relative date values (today, yesterday, days_ago) to ISO date strings for database queries
  - **What it does**: Calculates actual dates from relative date types, handles numeric offsets (days_ago, days_from_now), and returns ISO date strings (YYYY-MM-DD format)

**Utilities:**
- `utils/decode-filters.ts` - `decodeFilters()` (decode filter from URL param)
  - **WHY**: Converts URL-encoded filter parameter back to filter AST structure for processing
  - **What it does**: URI decodes the filter parameter, parses JSON to FilterNode, and returns null if invalid or missing

---

## Real-World Scenario: Applying Query Filters to Supabase

This guide shows how to receive a filter parameter from a request and apply it to a Supabase query to filter data.

### Step 1: Setup Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side
)
```

### Step 2: Receive Filter Parameter

In your API route or server function, extract the filter parameter:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { decodeFilters } from '@/app/development/filters/query-filter/utils/decode-filters'
import { validateFilter, applyFilters, type FieldMapping } from '@/app/development/filters/query-filter/backend'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filterParam = searchParams.get('filter')
  
  // Decode filter from URL parameter
  const filter = decodeFilters(filterParam)
  
  // Validate filter structure
  if (filter && !validateFilter(filter)) {
    return NextResponse.json(
      { error: 'Invalid filter structure' },
      { status: 400 }
    )
  }
  
  // Continue to Step 3...
}
```

### Step 3: Define Field Mapping

Create a field mapping that maps your filter field keys to Supabase table columns:

```typescript
// Map filter field keys to database columns
const fieldMap: FieldMapping = {
  // Filter key → Database column mapping
  name: { column: 'full_name', type: 'text' },
  email: { column: 'email_address', type: 'text' },
  status: { column: 'status', type: 'text' },
  role: { column: 'role', type: 'text' },
  department: { column: 'department', type: 'text' },
  salary: { column: 'annual_salary', type: 'number' },
  createdAt: { column: 'created_at', type: 'date' },
  updatedAt: { column: 'updated_at', type: 'date' }
}
```

**Why Field Mapping?**
- Filter fields use user-friendly names (e.g., "name", "email")
- Database columns may have different names (e.g., "full_name", "email_address")
- Field types are required to select the correct operator mapping (text/number/date)

### Step 4: Apply Filters to Supabase Query

Apply the filter to your Supabase query:

```typescript
// Start with base query
let query = supabase
  .from('employees')
  .select('*')

// Apply filter if it exists
if (filter) {
  query = applyFilters(query, filter, fieldMap)
}

// Execute query
const { data, error } = await query

if (error) {
  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  )
}

return NextResponse.json({ data })
```

### Complete Example: API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decodeFilters } from '@/app/development/filters/query-filter/utils/decode-filters'
import { validateFilter, applyFilters, type FieldMapping } from '@/app/development/filters/query-filter/backend'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Field mapping: filter keys → database columns
const employeeFieldMap: FieldMapping = {
  name: { column: 'full_name', type: 'text' },
  email: { column: 'email_address', type: 'text' },
  status: { column: 'status', type: 'text' },
  role: { column: 'role', type: 'text' },
  department: { column: 'department', type: 'text' },
  salary: { column: 'annual_salary', type: 'number' },
  createdAt: { column: 'created_at', type: 'date' }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Extract filter parameter from URL
    const { searchParams } = new URL(request.url)
    const filterParam = searchParams.get('filter')
    
    // 2. Decode filter from URL parameter
    const filter = decodeFilters(filterParam)
    
    // 3. Validate filter structure
    if (filter && !validateFilter(filter)) {
      return NextResponse.json(
        { error: 'Invalid filter structure' },
        { status: 400 }
      )
    }
    
    // 4. Build base Supabase query
    let query = supabase
      .from('employees')
      .select('*')
    
    // 5. Apply filter if it exists
    if (filter) {
      query = applyFilters(query, filter, employeeFieldMap)
    }
    
    // 6. Execute query
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      )
    }
    
    // 7. Return filtered results
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Complete Example: Server Function (RSC)

```typescript
import { createClient } from '@supabase/supabase-js'
import { decodeFilters } from '@/app/development/filters/query-filter/utils/decode-filters'
import { validateFilter, applyFilters, type FieldMapping } from '@/app/development/filters/query-filter/backend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const employeeFieldMap: FieldMapping = {
  name: { column: 'full_name', type: 'text' },
  email: { column: 'email_address', type: 'text' },
  status: { column: 'status', type: 'text' },
  salary: { column: 'annual_salary', type: 'number' },
  createdAt: { column: 'created_at', type: 'date' }
}

export async function getEmployees(
  searchParams: { [key: string]: string | string[] | undefined } = {}
) {
  // 1. Extract and decode filter
  const filterParam = typeof searchParams.filter === 'string' 
    ? searchParams.filter 
    : null
  const filter = decodeFilters(filterParam)
  
  // 2. Validate filter
  if (filter && !validateFilter(filter)) {
    throw new Error('Invalid filter structure')
  }
  
  // 3. Build query
  let query = supabase.from('employees').select('*')
  
  // 4. Apply filter
  if (filter) {
    query = applyFilters(query, filter, employeeFieldMap)
  }
  
  // 5. Execute and return
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }
  
  return data || []
}
```

## How It Works

### Filter AST Structure

The filter parameter contains a JSON AST structure like:

```json
{
  "type": "group",
  "id": "node_123",
  "logic": "and",
  "children": [
    {
      "type": "condition",
      "id": "node_456",
      "field": "status",
      "operator": "is",
      "value": "active"
    },
    {
      "type": "condition",
      "id": "node_789",
      "field": "salary",
      "operator": "gt",
      "value": 50000
    }
  ]
}
```

### Translation Process

1. **Decode**: URL parameter → Filter AST
2. **Validate**: Check AST structure is valid
3. **Apply**: Recursively traverse AST and build Supabase query:
   - Conditions → Query filters using `FilterDSL`
   - Groups → AND/OR logic grouping
   - Nested groups → Recursive processing

### Example Translation

**Filter AST:**
```json
{
  "type": "group",
  "logic": "and",
  "children": [
    {
      "type": "condition",
      "field": "name",
      "operator": "contains",
      "value": "john"
    },
    {
      "type": "condition",
      "field": "salary",
      "operator": "gt",
      "value": 50000
    }
  ]
}
```

**Supabase Query:**
```typescript
supabase
  .from('employees')
  .select('*')
  .filter('full_name', 'ilike', '%john%')
  .filter('annual_salary', 'gt', 50000)
```

## Handling Nested Groups

The `applyFilters` function automatically handles nested groups with AND/OR logic:

**Filter AST with nested group:**
```json
{
  "type": "group",
  "logic": "and",
  "children": [
    {
      "type": "condition",
      "field": "status",
      "operator": "is",
      "value": "active"
    },
    {
      "type": "group",
      "logic": "or",
      "children": [
        {
          "type": "condition",
          "field": "role",
          "operator": "is",
          "value": "admin"
        },
        {
          "type": "condition",
          "field": "role",
          "operator": "is",
          "value": "manager"
        }
      ]
    }
  ]
}
```

**Translation:**
- Status = "active" **AND** (Role = "admin" **OR** Role = "manager")
- Supabase handles OR groups using `.or()` method

## Date Field Handling

Date fields with relative values are automatically resolved:

**Filter AST:**
```json
{
  "type": "condition",
  "field": "createdAt",
  "operator": "before",
  "dateType": "today",
  "value": null
}
```

**Process:**
1. `FilterDSL.date.before()` is called
2. `resolveDate('today')` converts to ISO date string
3. Supabase query: `.filter('created_at', 'lt', '2025-01-20')`

## Error Handling

Always validate filters before applying:

```typescript
// Validate before applying
if (filter && !validateFilter(filter)) {
  return NextResponse.json(
    { error: 'Invalid filter structure' },
    { status: 400 }
  )
}

// Apply filter
if (filter) {
  try {
    query = applyFilters(query, filter, fieldMap)
  } catch (error) {
    console.error('Filter application error:', error)
    return NextResponse.json(
      { error: 'Failed to apply filter' },
      { status: 500 }
    )
  }
}
```

## Best Practices

1. **Always validate**: Use `validateFilter()` before applying
2. **Field mapping**: Keep field mapping in a separate config file
3. **Error handling**: Wrap filter application in try-catch
4. **Logging**: Log filter application for debugging
5. **Type safety**: Use TypeScript types for field mapping
6. **Security**: Validate field keys to prevent SQL injection (field mapping acts as whitelist)

## Common Issues

### Issue: Filter returns null
**Solution**: Check if filter parameter exists in URL and is properly encoded

### Issue: Invalid filter structure
**Solution**: Ensure filter AST has required fields (id, field, operator, logic)

### Issue: Field not found in mapping
**Solution**: Add missing field to `FieldMapping` object

### Issue: Operator not supported
**Solution**: Check `FilterDSL` has the operator for the field type

## Testing

Test your integration with various filter structures:

```typescript
// Simple condition
const filter1 = {
  type: 'group',
  logic: 'and',
  children: [{
    type: 'condition',
    field: 'status',
    operator: 'is',
    value: 'active'
  }]
}

// Multiple conditions
const filter2 = {
  type: 'group',
  logic: 'and',
  children: [
    { type: 'condition', field: 'status', operator: 'is', value: 'active' },
    { type: 'condition', field: 'salary', operator: 'gt', value: 50000 }
  ]
}

// Nested groups
const filter3 = {
  type: 'group',
  logic: 'and',
  children: [
    { type: 'condition', field: 'status', operator: 'is', value: 'active' },
    {
      type: 'group',
      logic: 'or',
      children: [
        { type: 'condition', field: 'role', operator: 'is', value: 'admin' },
        { type: 'condition', field: 'role', operator: 'is', value: 'manager' }
      ]
    }
  ]
}
```
