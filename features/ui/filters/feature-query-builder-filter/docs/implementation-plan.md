# Query Filter Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for the Advanced Query Filter Builder feature. All files (except the API route) will be located in `app/development/filters/query-filter/` with backend-only code in the `backend/` subfolder.

## Directory Structure

```
app/development/filters/query-filter/
├── components/
│   └── query-builder/
│       ├── query-builder.tsx          # Main entry component (button + dropdown)
│       ├── group-node.tsx             # Recursive group renderer
│       ├── condition-row.tsx           # Individual condition row
│       ├── value-input.tsx            # Dynamic value input (text/number/date)
│       ├── field-selector.tsx        # Field selection dropdown
│       ├── operator-selector.tsx     # Operator selection dropdown
│       ├── date-type-selector.tsx    # Date value type dropdown (for date fields)
│       ├── logic-selector.tsx        # AND/OR selector dropdown
│       ├── add-buttons.tsx            # + Add Condition / + Add Group buttons
│       └── index.ts                   # Component exports
│
├── hooks/
│   ├── use-filter-builder.ts         # State management hook for filter tree
│   ├── use-url-query-filter.ts       # URL encoding/decoding hook
│   └── index.ts                       # Hook exports
│
├── config/
│   ├── filter-fields.ts               # Field definitions (text/date/number)
│   ├── filter-operators.ts            # Operator definitions by field type
│   ├── date-values.ts                 # Date value type options
│   └── index.ts                       # Config exports
│
├── utils/
│   ├── encode-filters.ts              # Encode filter AST to URL param
│   ├── decode-filters.ts              # Decode URL param to filter AST
│   ├── generate-node-id.ts             # Generate unique IDs for nodes
│   └── index.ts                       # Utility exports
│
├── types/
│   ├── filter.ts                      # Filter AST types (FilterNode, FilterGroup, FilterCondition)
│   ├── field.ts                       # Field type definitions
│   ├── operator.ts                    # Operator type definitions
│   └── index.ts                       # Type exports
│
├── backend/
│   ├── filter-dsl.ts                  # Filter DSL for translating to Supabase queries
│   ├── resolve-date.ts                # Resolve relative date values to ISO strings
│   ├── apply-filters.ts               # Recursive filter interpreter
│   ├── validate-filter.ts             # Validate filter AST structure
│   └── index.ts                       # Backend utility exports
│
├── advanced-filter.md                 # Architecture documentation
├── implementation-plan.md             # This file
└── docs/                              # Additional documentation (if needed)

// API Route (outside query-filter folder)
app/api/filters/query/route.ts         # API endpoint for query filtering
```

---

## Implementation Phases

### Phase 1: Foundation (Types & Configuration)

**Goal:** Establish core types and configuration files.

#### Step 1.1: Create Types

**File:** `types/filter.ts`

```typescript
export type Logic = "and" | "or"

export type FilterNode = FilterGroup | FilterCondition

export interface FilterGroup {
  type: "group"
  id: string  // Unique identifier for node manipulation
  logic: Logic
  children: FilterNode[]
}

export interface FilterCondition {
  type: "condition"
  id: string  // Unique identifier for node manipulation
  field: string
  operator: string
  value?: unknown
  dateType?: string  // For date fields: "today", "exact_date", etc.
}
```

**File:** `types/field.ts`

```typescript
export type FieldType = "text" | "date" | "number"

export interface FilterField {
  key: string
  label: string
  type: FieldType
}
```

**File:** `types/operator.ts`

```typescript
export type TextOperator = 
  | "contains"
  | "does_not_contain"
  | "is"
  | "is_not"
  | "is_empty"
  | "is_not_empty"

export type DateOperator =
  | "is"
  | "before"
  | "after"
  | "on_or_before"
  | "on_or_after"
  | "is_not"
  | "is_empty"
  | "is_not_empty"

export type NumberOperator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "is_empty"
  | "is_not_empty"
```

#### Step 1.2: Create Configuration Files

**File:** `config/filter-fields.ts`

```typescript
import type { FilterField } from '../types/field'

export const filterFields: FilterField[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "createdAt", label: "Created Date", type: "date" },
  { key: "amount", label: "Amount", type: "number" }
]
```

**File:** `config/filter-operators.ts`

```typescript
import type { TextOperator, DateOperator, NumberOperator } from '../types/operator'

export const filterOperators = {
  text: [
    "contains",
    "does_not_contain",
    "is",
    "is_not",
    "is_empty",
    "is_not_empty"
  ] as TextOperator[],

  date: [
    "is",
    "before",
    "after",
    "on_or_before",
    "on_or_after",
    "is_not",
    "is_empty",
    "is_not_empty"
  ] as DateOperator[],

  number: [
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "is_empty",
    "is_not_empty"
  ] as NumberOperator[]
}
```

**File:** `config/date-values.ts`

```typescript
export const dateValues = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "yesterday", label: "Yesterday" },
  { value: "one_week_ago", label: "One week ago" },
  { value: "one_week_from_now", label: "One week from now" },
  { value: "one_month_ago", label: "One month ago" },
  { value: "one_month_from_now", label: "One month from now" },
  { value: "days_ago", label: "Number of days ago" },
  { value: "days_from_now", label: "Number of days from now" },
  { value: "exact_date", label: "Exact date" }
] as const

export type DateValueType = typeof dateValues[number]['value']
```

---

### Phase 2: Utilities

**Goal:** Create utility functions for encoding/decoding and ID generation.

#### Step 2.1: URL Encoding/Decoding

**File:** `utils/encode-filters.ts`

```typescript
import type { FilterNode } from '../types/filter'

export function encodeFilters(filterTree: FilterNode | null): string {
  if (!filterTree) return ''
  return encodeURIComponent(JSON.stringify(filterTree))
}
```

**File:** `utils/decode-filters.ts`

```typescript
import type { FilterNode } from '../types/filter'

export function decodeFilters(param: string | null): FilterNode | null {
  if (!param) return null
  try {
    return JSON.parse(decodeURIComponent(param)) as FilterNode
  } catch {
    return null
  }
}
```

#### Step 2.2: Node ID Generation

**File:** `utils/generate-node-id.ts`

```typescript
let nodeIdCounter = 0

export function generateNodeId(): string {
  return `node_${Date.now()}_${++nodeIdCounter}`
}
```

---

### Phase 3: State Management Hook

**Goal:** Create hook for managing filter tree state.

#### Step 3.1: useFilterBuilder Hook

**File:** `hooks/use-filter-builder.ts`

**Responsibilities:**
- Manage filter tree state
- Add/remove conditions and groups
- Update condition properties (field, operator, value)
- Handle nested group operations

**Key Functions:**
- `addCondition(groupId: string)` - Add condition to group
- `addGroup(parentGroupId: string)` - Add nested group
- `removeNode(nodeId: string)` - Remove node (condition or group)
- `updateConditionField(nodeId: string, field: string)` - Update condition field
- `updateConditionOperator(nodeId: string, operator: string)` - Update operator
- `updateConditionValue(nodeId: string, value: unknown)` - Update value
- `updateConditionDateType(nodeId: string, dateType: string)` - Update date type
- `updateGroupLogic(groupId: string, logic: Logic)` - Update group logic
- `getNodeById(nodeId: string)` - Find node by ID
- `getParentGroup(nodeId: string)` - Find parent group of node

**Implementation Notes:**
- Use recursive tree traversal for finding/updating nodes
- Generate unique IDs for all nodes
- Maintain immutability when updating tree

---

### Phase 4: URL Integration Hook

**Goal:** Create hook for syncing filter state with URL.

#### Step 4.1: useUrlQueryFilter Hook

**File:** `hooks/use-url-query-filter.ts`

**Responsibilities:**
- Read filter from URL on mount
- Update URL when filter changes
- Sync with useFilterBuilder state

**Key Functions:**
- `getFilter()` - Get current filter from URL
- `setFilter(filter: FilterNode | null)` - Update URL with filter
- `clearFilter()` - Remove filter from URL

**Implementation Notes:**
- Use `useSearchParams` and `useRouter` from Next.js
- Debounce URL updates if needed
- Handle URL encoding/decoding

---

### Phase 5: Component Implementation (Bottom-Up)

**Goal:** Build UI components starting with smallest, most reusable pieces.

#### Step 5.1: Field Selector

**File:** `components/query-builder/field-selector.tsx`

- Dropdown showing available fields
- Filter by field type if needed
- Display field label
- Callback on selection

#### Step 5.2: Operator Selector

**File:** `components/query-builder/operator-selector.tsx`

- Dropdown showing operators for selected field type
- Filter operators based on field type
- Display operator labels
- Callback on selection

#### Step 5.3: Date Type Selector

**File:** `components/query-builder/date-type-selector.tsx`

- Dropdown showing date value types
- Only shown when field type is "date"
- Display date type labels
- Callback on selection

#### Step 5.4: Logic Selector

**File:** `components/query-builder/logic-selector.tsx`

- Dropdown with AND/OR options
- Only shown for conditions after the first in a group
- Callback on selection

#### Step 5.5: Value Input

**File:** `components/query-builder/value-input.tsx`

**Dynamic input based on field type and date type:**

- **Text field**: Text input
- **Number field**: Number input
- **Date field**:
  - If `dateType === "exact_date"`: Date picker
  - If `dateType === "days_ago"` or `"days_from_now"`: Number input for days
  - Otherwise: No input (relative date)

**Props:**
- `fieldType: FieldType`
- `dateType?: string`
- `value: unknown`
- `onChange: (value: unknown) => void`
- `operator: string` (to hide input for "is_empty" / "is_not_empty")

#### Step 5.6: Condition Row

**File:** `components/query-builder/condition-row.tsx`

**Layout:**
```
[Logic ▼] [Field ▼] [Operator ▼] [Date Type ▼] [Value Input] [×]
```

**Features:**
- Show logic selector only if not first condition in group
- Show date type selector only if field type is "date"
- Show value input based on field type and operator
- Delete button to remove condition
- Callbacks for all updates

#### Step 5.7: Add Buttons

**File:** `components/query-builder/add-buttons.tsx`

- "+ Add Condition" button
- "+ Add Group" button
- Callbacks for both actions

#### Step 5.8: Group Node (Recursive)

**File:** `components/query-builder/group-node.tsx`

**Features:**
- Recursive rendering of children
- Logic selector for group (AND/OR)
- Render conditions and nested groups
- Add buttons at bottom of group
- Delete button for group
- Indentation/padding for nested groups

**Structure:**
```tsx
<div className="group-container">
  <LogicSelector value={group.logic} onChange={...} />
  {group.children.map(child => 
    child.type === "group" 
      ? <GroupNode group={child} ... />
      : <ConditionRow condition={child} ... />
  )}
  <AddButtons onAddCondition={...} onAddGroup={...} />
  <DeleteButton onClick={...} />
</div>
```

#### Step 5.9: Query Builder (Main Component)

**File:** `components/query-builder/query-builder.tsx`

**Features:**
- Button trigger with dropdown
- Dropdown content with QueryBuilderContent
- Integrate with useFilterBuilder and useUrlQueryFilter
- Apply/Reset buttons at bottom
- Styling matching grouping-control.tsx

**Structure:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>Filter</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <QueryBuilderContent />
    <Footer>
      <ResetButton />
      <ApplyButton />
    </Footer>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Phase 6: Backend Implementation

**Goal:** Create backend utilities for processing filters.

#### Step 6.1: Date Resolver

**File:** `backend/resolve-date.ts`

**Functionality:**
- Convert relative date values to ISO strings
- Handle: today, yesterday, tomorrow, one_week_ago, etc.
- Handle days_ago and days_from_now with number input
- Return exact_date as-is (already ISO string)

#### Step 6.2: Filter DSL

**File:** `backend/filter-dsl.ts`

**Functionality:**
- Map filter operators to Supabase query operators
- Handle text operators (contains → ilike, etc.)
- Handle number operators (eq, gt, lt, etc.)
- Handle date operators (before → lt, after → gt, etc.)
- Return { op, value } objects

#### Step 6.3: Filter Interpreter

**File:** `backend/apply-filters.ts`

**Functionality:**
- Recursive function to traverse filter AST
- Apply group logic (AND/OR)
- Apply conditions using FilterDSL
- Build Supabase query filters
- Handle nested groups

#### Step 6.4: Filter Validator

**File:** `backend/validate-filter.ts`

**Functionality:**
- Validate filter AST structure
- Check required fields
- Validate field types
- Validate operators match field types
- Return validation errors

---

### Phase 7: API Route

**Goal:** Create API endpoint for query filtering.

#### Step 7.1: API Route

**File:** `app/api/filters/query/route.ts`

**Functionality:**
- Parse filter from URL parameter
- Decode filter JSON
- Validate filter structure
- Apply filters to Supabase query
- Return filtered data

**Note:** This file is outside the query-filter folder as it's an API route.

---

### Phase 8: Integration & Testing

**Goal:** Integrate with existing pages and test.

#### Step 8.1: Integration Points

- Add QueryBuilder to page-server/page.tsx
- Add QueryBuilder to page-client/page.tsx
- Create filter field configs for employees
- Test URL encoding/decoding
- Test nested groups
- Test all field types
- Test date value types

#### Step 8.2: Testing Checklist

- [ ] Add condition works
- [ ] Add group works
- [ ] Delete condition works
- [ ] Delete group works
- [ ] Update field updates operators
- [ ] Date field shows date type selector
- [ ] Date value inputs show correctly
- [ ] Nested groups render correctly
- [ ] URL updates on changes
- [ ] URL decoding works on page load
- [ ] Backend filter application works
- [ ] All operators work correctly
- [ ] Empty/is_not_empty operators hide value input

---

## Implementation Order

1. **Phase 1**: Types & Configuration (Foundation)
2. **Phase 2**: Utilities (Encoding/Decoding)
3. **Phase 3**: State Management Hook
4. **Phase 4**: URL Integration Hook
5. **Phase 5**: Components (Bottom-up: smallest to largest)
6. **Phase 6**: Backend Utilities
7. **Phase 7**: API Route
8. **Phase 8**: Integration & Testing

---

## Key Implementation Details

### Node IDs

- Every node (condition or group) needs a unique ID
- IDs are used for finding/updating/removing nodes
- Generate IDs using `generateNodeId()` utility

### Recursive Tree Operations

- Use recursive functions for:
  - Finding nodes by ID
  - Updating nodes
  - Removing nodes
  - Rendering groups

### Date Field Handling

- Date fields require extra dropdown for date type
- Date type determines what value input to show:
  - `exact_date` → Date picker
  - `days_ago` / `days_from_now` → Number input
  - Others → No input (relative date)

### Empty Operators

- Operators like "is_empty" and "is_not_empty" don't need value input
- Hide value input when these operators are selected

### Styling

- Match styling from `grouping-control.tsx`
- Use shadcn/ui DropdownMenu components
- Consistent spacing and borders
- Hover states and transitions

---

## Dependencies

- Next.js navigation hooks (`useRouter`, `useSearchParams`)
- shadcn/ui components (`DropdownMenu`, `Button`, `Input`)
- Date picker library (if needed for exact_date)
- TypeScript for type safety

---

## Notes

- All frontend code in `app/development/filters/query-filter/`
- Backend-only code in `app/development/filters/query-filter/backend/`
- API route at `app/api/filters/query/route.ts` (outside query-filter folder)
- Filter AST is the contract between frontend and backend
- URL parameter name: `filter`
- Filter is encoded as JSON string in URL
