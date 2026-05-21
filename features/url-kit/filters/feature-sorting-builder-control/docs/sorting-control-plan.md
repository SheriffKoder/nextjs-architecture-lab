# Sorting Control Feature Architecture Plan

## Overview

A dropdown-based sorting control component that provides advanced multi-level sort management with a visual interface. This feature extends the existing `sorting-feature` by providing a more sophisticated UI for managing multiple sorts simultaneously.

**Architecture**: All sorting-control-related files are self-contained in `app/development/filters/sorting-control-feature/` for clear separation, while reusing core logic from `sorting-feature`.

## 1. Directory Structure

```
app/development/filters/
├── sorting-feature/              # Existing simple sort buttons
│   ├── hooks/
│   │   └── useUrlSorting.ts
│   ├── utils/
│   │   ├── parse-sorts.ts
│   │   └── apply-sorts.ts
│   └── types.ts
│
└── sorting-control-feature/      # New dropdown-based control
    ├── components/
    │   ├── sorting-control.tsx          # Main component (button + dropdown)
    │   ├── sort-row.tsx                 # Individual sort row component
    │   ├── sort-key-dropdown.tsx        # Key selection dropdown
    │   ├── sort-direction-dropdown.tsx  # Direction selection dropdown
    │   ├── available-sorts-list.tsx     # List of available keys
    │   └── index.ts
    ├── hooks/
    │   ├── useUrlSorting.ts             # Copy from sorting-feature (reuse)
    │   └── index.ts
    ├── utils/
    │   ├── parse-sorts.ts               # Copy from sorting-feature (reuse)
    │   ├── apply-sorts.ts               # Copy from sorting-feature (reuse)
    │   └── index.ts
    ├── types.ts                         # Extend from sorting-feature types
    └── docs/
        └── sorting-control-plan.md      # This file
```

## 2. Hook Reuse Strategy

**Copy `useUrlSorting` hook** from `sorting-feature` to `sorting-control-feature/hooks/`:
- Maintains same API and behavior
- Allows independent evolution
- No breaking changes to existing sorting-feature

**Key Functions Used**:
```typescript
const {
  getSorts,        // Get all active sorts in priority order
  setSort,         // Update sort key or direction
  removeSort,      // Remove a sort
  addSort,         // Add new sort
  clearSorts,      // Reset all sorts
  reorderSorts,    // Change sort priority order
  setSorts,        // Batch update (for reordering)
} = useUrlSorting()
```

## 3. Component Architecture

### 3.1 Main Component: `SortingControl`

**Location**: `sorting-control-feature/components/sorting-control.tsx`

**Props**:
```typescript
interface SortingControlProps {
  /**
   * Array of sort configurations (available keys)
   */
  sortConfig: SortConfig[]
  
  /**
   * Optional CSS classes
   */
  className?: string
  
  /**
   * Button text when no sorts are active
   */
  placeholder?: string
}
```

**Structure**:
- **Button**: Shows active sorts count or placeholder
- **Dropdown**: Contains rows + list + reset button
- **Styling**: Matches `grouping-control.tsx` (DropdownMenu from shadcn/ui)

**Button States**:
- No sorts: "Sort" (or placeholder)
- Has sorts: "Sort (2)" or "Sort: Status, Department"

### 3.2 Sort Row Component: `SortRow`

**Location**: `sorting-control-feature/components/sort-row.tsx`

**Props**:
```typescript
interface SortRowProps {
  /**
   * Current sort specification
   */
  sort: SortSpec
  
  /**
   * Priority level (0 = primary, 1 = secondary, etc.)
   */
  level: number
  
  /**
   * All available sort configs
   */
  availableConfigs: SortConfig[]
  
  /**
   * All active sorts (for determining available keys)
   */
  allSorts: SortSpec[]
  
  /**
   * Whether this is the first row (can't move up)
   */
  isFirst: boolean
  
  /**
   * Whether this is the last row (can't move down)
   */
  isLast: boolean
  
  /**
   * Callback when sort changes
   */
  onSortChange: (key: string, direction: SortDirection) => void
  
  /**
   * Callback when sort is removed
   */
  onRemove: () => void
  
  /**
   * Callback to move sort up (increase priority)
   */
  onMoveUp: () => void
  
  /**
   * Callback to move sort down (decrease priority)
   */
  onMoveDown: () => void
}
```

**Layout**:
```
[ Priority Badge ] [ Key Dropdown ▼ ] [ Direction Dropdown ▼ ] [ X ] [ ↑ ] [ ↓ ]
```

**Features**:
- Priority badge showing level (1, 2, 3, etc.)
- Key dropdown: Shows all available keys (excluding already-used keys)
- Direction dropdown: A->Z (asc) or Z->A (desc)
- X button: Remove this sort
- Up/Down arrows: Reorder sorts (change priority)

### 3.3 Key Dropdown: `SortKeyDropdown`

**Location**: `sorting-control-feature/components/sort-key-dropdown.tsx`

**Props**:
```typescript
interface SortKeyDropdownProps {
  /**
   * Currently selected key
   */
  selectedKey: string
  
  /**
   * All available sort configs
   */
  availableConfigs: SortConfig[]
  
  /**
   * Keys already used in other sorts (to exclude)
   */
  excludedKeys: string[]
  
  /**
   * Callback when key changes
   */
  onKeyChange: (key: string) => void
}
```

**Behavior**:
- Shows all keys from `availableConfigs` except `excludedKeys`
- Includes currently selected key (even if in excluded list)
- Updates sort when selection changes

### 3.4 Direction Dropdown: `SortDirectionDropdown`

**Location**: `sorting-control-feature/components/sort-direction-dropdown.tsx`

**Props**:
```typescript
interface SortDirectionDropdownProps {
  /**
   * Currently selected direction
   */
  selectedDirection: SortDirection
  
  /**
   * Callback when direction changes
   */
  onDirectionChange: (direction: SortDirection) => void
}
```

**Options**:
- A->Z (ascending)
- Z->A (descending)

### 3.5 Available Sorts List: `AvailableSortsList`

**Location**: `sorting-control-feature/components/available-sorts-list.tsx`

**Props**:
```typescript
interface AvailableSortsListProps {
  /**
   * All available sort configs
   */
  availableConfigs: SortConfig[]
  
  /**
   * Keys already used in active sorts
   */
  usedKeys: string[]
  
  /**
   * Callback when a key is selected
   */
  onKeySelect: (key: string) => void
}
```

**Behavior**:
- Shows only keys NOT in `usedKeys`
- Clicking a key adds it as a new sort (ascending, appended to end)
- Styling: `hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent`

## 4. Types

**Location**: `sorting-control-feature/types.ts`

```typescript
// Re-export from sorting-feature for convenience
export type { SortDirection, SortConfig, SortSpec } from '../sorting-feature/types'

// New types specific to sorting-control
export interface SortingControlProps {
  sortConfig: SortConfig[]
  className?: string
  placeholder?: string
}

export interface SortRowProps {
  sort: SortSpec
  level: number
  availableConfigs: SortConfig[]
  allSorts: SortSpec[]
  isFirst: boolean
  isLast: boolean
  onSortChange: (key: string, direction: SortDirection) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}
```

## 5. URL Parameter Management

**Format**: Same as `sorting-feature`
```
sort=status:asc,department:desc,createdAt:asc
```

**Update Strategy**:
- **Any change** (key, direction, add, remove, reorder) → **rewrite entire sort param**
- Use `setSorts(newSorts)` for batch updates
- Ensures consistent state and avoids stale params

**Example Flows**:

1. **Change Key in Row**:
   ```typescript
   // Current: sort=status:asc,department:desc
   // User changes first row key from "status" to "role"
   // New: sort=role:asc,department:desc
   const newSorts = allSorts.map(s => 
     s.key === oldKey ? { ...s, key: newKey } : s
   )
   setSorts(newSorts)
   ```

2. **Change Direction**:
   ```typescript
   // Current: sort=status:asc,department:desc
   // User changes first row direction from asc to desc
   // New: sort=status:desc,department:desc
   const newSorts = allSorts.map(s => 
     s.key === key ? { ...s, direction: newDirection } : s
   )
   setSorts(newSorts)
   ```

3. **Add from List**:
   ```typescript
   // Current: sort=status:asc
   // User clicks "department" from available list
   // New: sort=status:asc,department:asc
   const newSorts = [...allSorts, { key: 'department', direction: 'asc' }]
   setSorts(newSorts)
   ```

4. **Remove Sort**:
   ```typescript
   // Current: sort=status:asc,department:desc,role:asc
   // User clicks X on department row
   // New: sort=status:asc,role:asc
   const newSorts = allSorts.filter(s => s.key !== 'department')
   setSorts(newSorts)
   ```

5. **Reorder (Move Up)**:
   ```typescript
   // Current: sort=status:asc,department:desc
   // User clicks ↑ on department row
   // New: sort=department:desc,status:asc
   const index = allSorts.findIndex(s => s.key === 'department')
   const newSorts = [...allSorts]
   ;[newSorts[index - 1], newSorts[index]] = [newSorts[index], newSorts[index - 1]]
   setSorts(newSorts)
   ```

6. **Reorder (Move Down)**:
   ```typescript
   // Current: sort=status:asc,department:desc
   // User clicks ↓ on status row
   // New: sort=department:desc,status:asc
   const index = allSorts.findIndex(s => s.key === 'status')
   const newSorts = [...allSorts]
   ;[newSorts[index], newSorts[index + 1]] = [newSorts[index + 1], newSorts[index]]
   setSorts(newSorts)
   ```

## 6. Styling Reference

**Match `grouping-control.tsx`**:

- **Dropdown Container**:
  ```tsx
  <DropdownMenuContent 
    align="start" 
    className="w-64 min-h-[300px] flex flex-col p-0"
  >
  ```

- **Content Area**:
  ```tsx
  <div className="flex-1 flex flex-col p-3 overflow-y-auto">
    {/* Rows and list */}
  </div>
  ```

- **Row Styling**:
  ```tsx
  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
    {/* Row content */}
  </div>
  ```

- **List Item Styling**:
  ```tsx
  <div className="flex items-center py-1.5 px-2 rounded-md hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent cursor-pointer transition-colors">
    <span className="text-xs text-foreground flex-1">
      {label}
    </span>
  </div>
  ```

- **Dropdown Button** (for key/direction):
  ```tsx
  <button className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background">
    <span className="text-foreground">{selectedLabel}</span>
    <ChevronDown className="w-3 h-3 opacity-50" />
  </button>
  ```

- **Reset Button**:
  ```tsx
  <div className="mt-auto p-3 border-t border-border flex justify-end">
    <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors">
      <RotateCcw className="w-3 h-3" />
      <span>Reset</span>
    </button>
  </div>
  ```

## 7. Component State Management

**Main Component Logic**:

```typescript
export function SortingControl({ sortConfig, placeholder = "Sort" }: SortingControlProps) {
  const { getSorts, setSorts, clearSorts } = useUrlSorting()
  const [isOpen, setIsOpen] = useState(false)
  
  // Get current sorts from URL
  const activeSorts = getSorts()
  
  // Get used keys (for filtering available list)
  const usedKeys = activeSorts.map(s => s.key)
  
  // Get available configs (for list)
  const availableConfigs = sortConfig.filter(c => !usedKeys.includes(c.key))
  
  // Handlers
  const handleKeyChange = (oldKey: string, newKey: string) => {
    const newSorts = activeSorts.map(s => 
      s.key === oldKey ? { ...s, key: newKey } : s
    )
    setSorts(newSorts)
  }
  
  const handleDirectionChange = (key: string, direction: SortDirection) => {
    const newSorts = activeSorts.map(s => 
      s.key === key ? { ...s, direction } : s
    )
    setSorts(newSorts)
  }
  
  const handleRemove = (key: string) => {
    const newSorts = activeSorts.filter(s => s.key !== key)
    setSorts(newSorts.length > 0 ? newSorts : [])
  }
  
  const handleAdd = (key: string) => {
    const newSorts = [...activeSorts, { key, direction: 'asc' }]
    setSorts(newSorts)
  }
  
  const handleMoveUp = (key: string) => {
    const index = activeSorts.findIndex(s => s.key === key)
    if (index <= 0) return
    const newSorts = [...activeSorts]
    ;[newSorts[index - 1], newSorts[index]] = [newSorts[index], newSorts[index - 1]]
    setSorts(newSorts)
  }
  
  const handleMoveDown = (key: string) => {
    const index = activeSorts.findIndex(s => s.key === key)
    if (index < 0 || index >= activeSorts.length - 1) return
    const newSorts = [...activeSorts]
    ;[newSorts[index], newSorts[index + 1]] = [newSorts[index + 1], newSorts[index]]
    setSorts(newSorts)
  }
  
  // Render...
}
```

## 8. Implementation Steps

1. **Create directory structure**
   ```bash
   mkdir -p app/development/filters/sorting-control-feature/{components,hooks,utils,docs}
   ```

2. **Copy hooks and utils from sorting-feature**
   - Copy `useUrlSorting.ts` to `sorting-control-feature/hooks/`
   - Copy `parse-sorts.ts` and `apply-sorts.ts` to `sorting-control-feature/utils/`
   - Create index files for exports

3. **Create types file**
   - Re-export from sorting-feature
   - Add new types for sorting-control components

4. **Build components (bottom-up)**:
   - `SortDirectionDropdown` (simplest)
   - `SortKeyDropdown`
   - `SortRow` (uses above two)
   - `AvailableSortsList`
   - `SortingControl` (main, uses all above)

5. **Test integration**
   - Add to a test page
   - Verify URL updates
   - Test all interactions

6. **Documentation**
   - Update this plan with any deviations
   - Add usage examples

## 9. Integration Points

### RSC Page
```typescript
// Same as sorting-feature - no changes needed
import { parseSorts, applySorts } from '../sorting-control-feature/utils'

const sortParam = searchParams.get('sort') || ''
const sorts = parseSorts(sortParam)
const sortedData = applySorts(data, sorts)
```

### Client Page
```typescript
// Same as sorting-feature - no changes needed
import { useUrlSorting } from '../sorting-control-feature/hooks/useUrlSorting'

const { getSorts } = useUrlSorting()
const sorts = getSorts()
// Include in query key and API call
```

### Component Usage
```tsx
import { SortingControl } from '../sorting-control-feature/components'
import { employeeSortConfig } from './config'

<SortingControl 
  sortConfig={employeeSortConfig}
  placeholder="Sort by..."
/>
```

## 10. Benefits

1. **Isolated**: Independent from sorting-feature, can evolve separately
2. **Reusable**: Core logic copied, not shared (no breaking changes)
3. **Visual**: Dropdown UI makes multi-level sorting intuitive
4. **Flexible**: Supports all operations (add, remove, change, reorder)
5. **Consistent**: Same URL format as sorting-feature (compatible)
6. **Complete**: Reset button, priority badges, visual feedback

## 11. Future Enhancements

- Drag-and-drop reordering (replace up/down arrows)
- Sort presets (save/load common sort combinations)
- Keyboard shortcuts
- Sort indicators in table headers
