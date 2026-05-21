# Advanced Filter Query Builder

## Overview

We will add a new type of filter. This filter will be a button + dropdown. The dropdown allows:

- **1st level condition**: Col key + rule + value + optional input (check date below)
- **2nd level condition**: and/or + col key + rule + value + optional input (check date below)
- **Actions**: + Add condition, + Add group

### Frontend Dropdown UI Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Filter Button ▼]                                               │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Query Builder Dropdown                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [AND ▼]  [Field ▼]  [Operator ▼]  [Value Input]  [×] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [OR  ▼]  [Field ▼]  [Operator ▼]  [Value Input]  [×] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [AND ▼]  [Date Field ▼]  [Operator ▼]  [Date Type ▼] │   │
│  │                                    [Value Input]  [×]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [AND ▼]  [Field ▼]  [Operator ▼]  [Value Input]  [×] │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  Nested Group: [AND ▼]                          │     │   │
│  │  │  ┌─────────────────────────────────────────┐   │     │   │
│  │  │  │  [AND ▼]  [Field ▼]  [Op ▼]  [Val]  [×]│   │     │   │
│  │  │  └─────────────────────────────────────────┘   │     │   │
│  │  │  ┌─────────────────────────────────────────┐   │     │   │
│  │  │  │  [OR  ▼]  [Date ▼]  [Op ▼]  [Type ▼]   │   │     │   │
│  │  │  │                    [Value Input]  [×]   │   │     │   │
│  │  │  └─────────────────────────────────────────┘   │     │   │
│  │  │  [+ Add Condition]  [+ Add Group]             │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [+ Add Condition]  [+ Add Group]                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                    [Reset]  [Apply]      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Legend:**
- `[AND ▼]` / `[OR ▼]` - Logic selector dropdown (for conditions after the first)
- `[Field ▼]` - Field selector dropdown (text/date/number fields)
- `[Operator ▼]` - Operator selector dropdown (contains/is/before/etc.)
- `[Date Type ▼]` - **Date value type dropdown** (today/yesterday/exact_date/days_ago/etc.) - **Only shown for date fields**
- `[Value Input]` - Dynamic input:
  - **Text field**: Text input
  - **Number field**: Number input
  - **Date field**: 
    - If relative date (today/yesterday/etc.): No additional input
    - If "days_ago" or "days_from_now": Number input for days
    - If "exact_date": Date picker
- `[×]` - Delete button for condition/group
- `[+ Add Condition]` - Button to add new condition
- `[+ Add Group]` - Button to add nested group
- `[Reset]` / `[Apply]` - Action buttons at bottom

**Date Field Value Flow:**
1. Select date field → `[Date Field ▼]`
2. Select operator → `[Operator ▼]` (is/before/after/etc.)
3. Select date type → `[Date Type ▼]` (today/yesterday/exact_date/days_ago/etc.)
4. If needed, show additional input:
   - `days_ago` or `days_from_now` → Number input for days
   - `exact_date` → Date picker
   - Other relative dates → No additional input needed

## Requirements

Create a React Query Builder component system using TypeScript and React.

### Core Features

- Support nested filter groups
- Each group has logic: AND / OR
- Users can add:
  - condition
  - group
- Conditions contain:
  - field selector
  - operator selector
  - value input

### Field Types

Fields support the following types:

- **text**
- **date**
- **number**

### Operators

#### Text Operators

- contains
- does not contain
- is
- is not
- is empty
- is not empty

#### Date Operators

- is
- before
- after
- on or before
- on or after
- is not
- is empty
- is not empty

#### Number Operators

- = (equal)
- not equal
- greater than
- less than
- greater or equal
- less or equal
- is empty
- is not empty

### Date Value Options

- today
- tomorrow
- yesterday
- one week ago
- one week from now
- one month ago
- one month from now
- number of days ago
- number of days from now
- exact date

### UI Requirements

- recursive group rendering
- + Add Condition button
- + Add Group button
- delete condition/group
- dynamic value input based on field type
- controlled state

## Output Format

Output filter state as a JSON AST with this structure:

```json
{
  "type": "group",
  "logic": "and",
  "children": []
}
```

## URL Integration

Integrate with a hook that encodes the filter JSON into a URL parameter called "filter".

**Example:**

```
/tasks?filter=<encoded_json>
```

## Component Architecture

Ensure the components are modular:

- `QueryBuilder` - Main entry component
- `GroupNode` - Recursive group renderer
- `ConditionRow` - Individual condition row
- `ValueInput` - Dynamic value input
- `FieldSelector` - Field selection dropdown
- `OperatorSelector` - Operator selection dropdown

## Complete Architecture Blueprint

This blueprint implements an enterprise dynamic filter builder with:

- Nested groups
- AND / OR logic
- Text / Date / Number rules
- Relative date values
- URL storage
- Backend SQL translation for Supabase

This keeps the system maintainable, reusable, and scalable.

---

## 1. High-Level Architecture

```
Frontend Query Builder UI
        ↓
Filter AST (JSON tree)
        ↓
URL param (encoded)
        ↓
API request
        ↓
Backend Filter DSL interpreter
        ↓
Supabase query builder
        ↓
Filtered data
```

The Filter AST becomes the contract between frontend and backend.

---

## 2. Filter AST Structure (Shared Type)

Create a shared type.

**Location:** `app/development/filters/query-filter/shared/types/filter.ts`

```typescript
export type Logic = "and" | "or"

export type FilterNode = FilterGroup | FilterCondition

export interface FilterGroup {
  type: "group"
  logic: Logic
  children: FilterNode[]
}

export interface FilterCondition {
  type: "condition"
  field: string
  operator: string
  value?: unknown
}
```

**Example:**

```json
{
  "type": "group",
  "logic": "and",
  "children": []
}
```

---

## 3. Frontend Folder Structure

```
app/development/filters/query-filter/
  components/
    query-builder/
      QueryBuilder.tsx
      GroupNode.tsx
      ConditionRow.tsx
      ValueInput.tsx
      RuleSelector.tsx
      FieldSelector.tsx
      AddButtons.tsx

  hooks/
    useFilterBuilder.ts
    useUrlFilters.ts

  config/
    filterFields.ts
    filterRules.ts
    dateValues.ts

  utils/
    encodeFilters.ts
    decodeFilters.ts

  backend/
    filters/
      filter-schema.ts
      filter-dsl.ts
      resolve-date.ts
      apply-filters.ts
      validate-filter.ts

// Backend route
app/api/filters/query/route.ts
```

---

## 4. Frontend Configuration Files

### Field Definitions

**Location:** `filterFields.ts`

```typescript
export const filterFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "createdAt", label: "Date", type: "date" },
  { key: "amount", label: "Amount", type: "number" }
]
```

### Operator Rules

**Location:** `filterRules.ts`

```typescript
export const rules = {
  text: [
    "contains",
    "does_not_contain",
    "is",
    "is_not",
    "is_empty",
    "is_not_empty"
  ],

  date: [
    "is",
    "before",
    "after",
    "on_or_before",
    "on_or_after",
    "is_not",
    "is_empty",
    "is_not_empty"
  ],

  number: [
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "is_empty",
    "is_not_empty"
  ]
}
```

### Date Values

**Location:** `dateValues.ts`

```typescript
export const dateValues = [
  "today",
  "tomorrow",
  "yesterday",
  "one_week_ago",
  "one_week_from_now",
  "one_month_ago",
  "one_month_from_now",
  "exact_date",
  "days_ago",
  "days_from_now"
]
```

---

## 5. Frontend State Hook

**Location:** `useFilterBuilder.ts`

Responsible for:

- managing filter tree
- adding groups
- adding conditions
- updating nodes

### Main Functions

- `addCondition(groupId)` - Add a condition to a group
- `addGroup(groupId)` - Add a nested group
- `removeNode(nodeId)` - Remove a node
- `updateCondition(nodeId, field)` - Update condition field
- `updateOperator(nodeId, operator)` - Update condition operator
- `updateValue(nodeId, value)` - Update condition value

**Example:**

```typescript
const addCondition = (groupId) => {
  // push condition node into group.children
}
```

---

## 6. Main Frontend Components

### QueryBuilder

Entry component.

**Responsibilities:**

- holds filter state
- serializes filters
- updates URL

**Usage:**

```tsx
<QueryBuilder
  value={filterTree}
  onChange={setFilterTree}
/>
```

### GroupNode

Recursive renderer.

**Structure:**

```
GroupNode
  ├ ConditionRow
  ├ ConditionRow
  └ GroupNode
```

**Provides buttons:**

- + Add Condition
- + Add Group

### ConditionRow

Renders:

- Field Selector
- Operator Selector
- Value Input
- Delete Button

### ValueInput

Dynamic input depending on field type.

**Examples:**

- `text` → input
- `number` → number input
- `date` → date picker / relative selector

---

## 7. URL Storage

Filters stored as encoded JSON.

### encodeFilters.ts

```typescript
export function encodeFilters(filterTree) {
  return encodeURIComponent(JSON.stringify(filterTree))
}
```

### decodeFilters.ts

```typescript
export function decodeFilters(param) {
  if (!param) return null
  return JSON.parse(decodeURIComponent(param))
}
```

**Example URL:**

```
/tasks?filter=%7B%22type%22%3A%22group%22...
```

---

## 8. Backend Filter DSL

**Location:** `filter-dsl.ts`

```typescript
export const FilterDSL = {
  text: {
    contains: (v) => ({ op: "ilike", value: `%${v}%` }),
    does_not_contain: (v) => ({ op: "not.ilike", value: `%${v}%` }),
    is: (v) => ({ op: "eq", value: v }),
    is_not: (v) => ({ op: "neq", value: v })
  },

  number: {
    eq: (v) => ({ op: "eq", value: v }),
    gt: (v) => ({ op: "gt", value: v }),
    lt: (v) => ({ op: "lt", value: v }),
    gte: (v) => ({ op: "gte", value: v }),
    lte: (v) => ({ op: "lte", value: v })
  },

  date: {
    before: (v) => ({ op: "lt", value: resolveDate(v) }),
    after: (v) => ({ op: "gt", value: resolveDate(v) }),
    is: (v) => ({ op: "eq", value: resolveDate(v) })
  }
}
```

---

## 9. Date Resolver

**Location:** `resolve-date.ts`

```typescript
export function resolveDate(value) {
  const now = new Date()

  if (value === "today") return now.toISOString()

  if (value === "yesterday") {
    now.setDate(now.getDate() - 1)
    return now.toISOString()
  }

  if (value === "one_week_ago") {
    now.setDate(now.getDate() - 7)
    return now.toISOString()
  }

  return value
}
```

---

## 10. Filter Interpreter

**Location:** `apply-filters.ts`

Recursive interpreter.

```typescript
export function applyFilters(query, node) {
  if (node.type === "group") {
    node.children.forEach(child => {
      applyFilters(query, child)
    })

    return query
  }

  const field = fields[node.field]
  const opFn = FilterDSL[field.type][node.operator]
  const { op, value } = opFn(node.value)

  query.filter(field.column, op, value)
}
```

---

## 11. Example API Route

**Location:** `app/api/filters/query/route.ts`

```typescript
export async function GET(req) {
  const filterParam = req.nextUrl.searchParams.get("filter")
  const filter = JSON.parse(decodeURIComponent(filterParam))

  let query = supabase
    .from("tasks")
    .select("*")

  applyFilters(query, filter)

  const { data } = await query

  return Response.json(data)
}
```
