# Transparent Header Feature

## Overview

The `transparentHeader` feature enables a dynamic header styling mechanism where the table header starts transparent and becomes opaque when the user scrolls. This provides a cleaner initial view while maintaining header visibility during scrolling.

**Default Behavior**: When `transparentHeader` is `false` (default) or not set, the header always displays with a background color.

**Enabled Behavior**: When `transparentHeader` is `true`, the header is transparent initially and shows a background color when the scroll container is scrolled.

---

## Section 1: Logic in Table Header

### Scroll Detection Mechanism

The scroll detection logic is implemented in `filtering-table-header.tsx` and consists of several key components:

#### 1.1 State Management

```typescript
const [isScrolled, setIsScrolled] = useState(false);
const headerRef = React.useRef<HTMLDivElement>(null);
const scrollContainerRef = React.useRef<HTMLElement | null>(null);
```

- **`isScrolled`**: Boolean state tracking whether the scroll container has been scrolled
- **`headerRef`**: Reference to the header DOM element for finding the scroll container
- **`scrollContainerRef`**: Reference to the actual scrollable container element

#### 1.2 Conditional Activation

The scroll detection only runs when `transparentHeader` is `true`:

```typescript
useEffect(() => {
  // Only enable scroll detection if transparentHeader is true
  if (!transparentHeader) {
    return; // Early exit if feature is disabled
  }
  // ... scroll detection logic
}, [transparentHeader]);
```

This ensures the scroll detection logic and event listeners are only active when needed, improving performance.

#### 1.3 Scroll Container Discovery

The `findScrollContainer()` function traverses the DOM tree upward from the header to find the scrollable parent:

```typescript
const findScrollContainer = (): HTMLElement | null => {
  if (!headerRef.current) return null;
  
  let element: HTMLElement | null = headerRef.current.parentElement;
  
  while (element) {
    const style = window.getComputedStyle(element);
    const hasOverflow = style.overflow === 'auto' || style.overflow === 'scroll' || 
                       style.overflowY === 'auto' || style.overflowY === 'scroll';
    
    if (hasOverflow && element.scrollHeight > element.clientHeight) {
      return element; // Found scrollable container
    }
    element = element.parentElement;
  }
  
  return null; // No scrollable container found
};
```

**How it works:**
1. Starts from the header's parent element
2. Checks each parent's computed styles for overflow properties
3. Verifies the element is actually scrollable (`scrollHeight > clientHeight`)
4. Returns the first matching scrollable container, or `null` if none found

#### 1.4 Scroll Event Handling

The `handleScroll()` function updates the scroll state:

```typescript
const handleScroll = () => {
  const scrollContainer = scrollContainerRef.current;
  if (scrollContainer) {
    const hasScrolled = scrollContainer.scrollTop > 0;
    setIsScrolled(hasScrolled);
  }
};
```

- Checks if `scrollTop > 0` to determine if scrolling has occurred
- Updates `isScrolled` state accordingly
- Uses passive event listener for better scroll performance

#### 1.5 Retry Mechanism

Since the DOM may not be fully ready on mount, the implementation includes a retry mechanism:

```typescript
const setupScrollListener = () => {
  const scrollContainer = findScrollContainer();
  
  if (scrollContainer) {
    scrollContainerRef.current = scrollContainer;
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return true;
  }
  return false;
};
```

**Retry Strategy:**
1. **Immediate attempt**: Tries to find and setup the scroll container immediately
2. **Delayed retries**: If not found, uses `requestAnimationFrame` and `setTimeout` to retry
3. **Maximum attempts**: Limits to 10 attempts (approximately 500ms total)
4. **50ms delay**: Between each retry attempt for optimal timing

This ensures reliable scroll container detection even when:
- Components mount asynchronously
- Parent containers are rendered after the header
- CSS transitions affect layout timing

#### 1.6 Cleanup

The effect properly cleans up all resources:

```typescript
return () => {
  if (rafId) cancelAnimationFrame(rafId);
  if (timeoutId) clearTimeout(timeoutId);
  if (scrollContainerRef.current) {
    scrollContainerRef.current.removeEventListener('scroll', handleScroll);
    scrollContainerRef.current = null;
  }
};
```

- Cancels pending animation frames
- Clears pending timeouts
- Removes scroll event listeners
- Resets refs to prevent memory leaks

#### 1.7 Dynamic Styling

The header cell styling conditionally applies background based on `transparentHeader` and `isScrolled`:

```typescript
className={`... ${
  transparentHeader 
    ? (isScrolled ? 'bg-[#f1f1f1] dark:bg-[#131313]' : 'bg-transparent')
    : 'bg-[#f1f1f1] dark:bg-[#131313]'
} ...`}
```

**Styling Logic:**
- **`transparentHeader: false`**: Always shows background (`bg-[#f1f1f1] dark:bg-[#131313]`)
- **`transparentHeader: true` + not scrolled**: Transparent background (`bg-transparent`)
- **`transparentHeader: true` + scrolled**: Shows background (`bg-[#f1f1f1] dark:bg-[#131313]`)

---

## Section 2: Prop Implementation Flow

The `transparentHeader` prop flows through the component hierarchy as follows:

### Step 1: Type Definition

**File**: `features/virtualized-table/types/table-config.ts`

```typescript
export interface TableConfig<T = any> {
  // ... other config options
  transparentHeader?: boolean; // When true, header is transparent until scrolled
}
```

The prop is added to the `TableConfig` interface as an optional boolean property.

### Step 2: FilteringWrapper Component

**File**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`

The `FilteringWrapper` receives `tableConfig` as a prop and passes it down to child components:

```typescript
export function FilteringWrapper<T>({
  // ... other props
  tableConfig,
  // ...
}: FilteringWrapperProps<T>) {
  // ...
  
  // Passes tableConfig to VirtualizedTableComponent or SubHeadingsContainer
  <VirtualizedTableComponent
    // ... other props
    tableConfig={tableConfig}
  />
  
  // OR
  
  <SubHeadingsContainer
    // ... other props
    tableConfig={tableConfig}
  />
}
```

**Flow**: `tableConfig` → `VirtualizedTableComponent` or `SubHeadingsContainer`

### Step 3A: VirtualizedTableComponent Extraction

**File**: `features/virtualized-table/virtualized-table-container.tsx`

The component extracts `transparentHeader` from `tableConfig`:

```typescript
export function VirtualizedTableComponent<T>({
  // ... other props
  tableConfig,
  // ...
}: VirtualizedTableComponentProps<T>) {
  
  // Extract props from tableConfig
  const {
    // ... other extracted props
    transparentHeader = false, // Defaults to false
  } = tableConfig || {};
  
  // ...
}
```

**Flow**: `tableConfig.transparentHeader` → extracted with default value `false`

### Step 3B: SubHeadingsContainer Extraction

**File**: `features/subheadings/subheadings-container.tsx`

Similar extraction for the subheadings view:

```typescript
export function SubHeadingsContainer<T>({
  // ... other props
  tableConfig,
  // ...
}: SubHeadingsContainerProps<T>) {
  
  // Extract props from tableConfig
  const {
    // ... other extracted props
    transparentHeader = false, // Defaults to false
  } = tableConfig || {};
  
  // ...
}
```

**Flow**: `tableConfig.transparentHeader` → extracted with default value `false`

### Step 4A: VirtualizedTableComponent → VirtualizedTableHeader

**File**: `features/virtualized-table/virtualized-table-container.tsx`

The extracted `transparentHeader` is passed to `VirtualizedTableHeader`:

```typescript
<VirtualizedTableHeader
  columns={visibleColumns as any}
  sortConfig={sortConfig || { key: "", direction: "none" }}
  handleSort={handleSort}
  // ... other props
  transparentHeader={transparentHeader} // ← Passed here
/>
```

**Flow**: Extracted `transparentHeader` → `VirtualizedTableHeader` prop

### Step 4B: SubHeadingsContainer → VirtualizedTableHeader

**File**: `features/subheadings/subheadings-container.tsx`

Same prop passing for subheadings view:

```typescript
<VirtualizedTableHeader
  columns={visibleColumns as any}
  sortConfig={sortConfig || { key: "", direction: "none" }}
  handleSort={handleSort}
  // ... other props
  transparentHeader={transparentHeader} // ← Passed here
/>
```

**Flow**: Extracted `transparentHeader` → `VirtualizedTableHeader` prop

### Step 5: VirtualizedTableHeader Props Interface

**File**: `features/filtering-wrapper-multi-display/components/filtering-table-header.tsx`

The prop is defined in the component's props interface:

```typescript
interface VirtualizedTableHeaderProps<T = any> {
  // ... other props
  transparentHeader?: boolean; // Whether header should be transparent until scrolled
}
```

**Flow**: Prop interface definition

### Step 6: VirtualizedTableHeader Component

**File**: `features/filtering-wrapper-multi-display/components/filtering-table-header.tsx`

The component receives and uses the prop:

```typescript
function VirtualizedTableHeader<T>({
  // ... other props
  transparentHeader = false, // Defaults to false
}: VirtualizedTableHeaderProps<T>) {
  
  // Used in scroll detection useEffect
  useEffect(() => {
    if (!transparentHeader) {
      return; // Early exit if disabled
    }
    // ... scroll detection logic
  }, [transparentHeader]);
  
  // Used in styling
  className={`... ${
    transparentHeader 
      ? (isScrolled ? 'bg-[#f1f1f1] dark:bg-[#131313]' : 'bg-transparent')
      : 'bg-[#f1f1f1] dark:bg-[#131313]'
  } ...`}
}
```

**Flow**: Prop → used in scroll detection logic and styling

---

## Complete Flow Diagram

```
User Configuration
    ↓
tableConfig: { transparentHeader: true }
    ↓
FilteringWrapper
    ↓
    ├─→ VirtualizedTableComponent
    │       ↓
    │   Extract: transparentHeader = false (default)
    │       ↓
    │   VirtualizedTableHeader
    │       ↓
    │   Scroll Detection + Styling
    │
    └─→ SubHeadingsContainer
            ↓
        Extract: transparentHeader = false (default)
            ↓
        VirtualizedTableHeader
            ↓
        Scroll Detection + Styling
```

---

## Usage Example

```typescript
// In your table configuration file
export const tableConfig = {
  rowHeight: 40,
  dynamicRowHeight: false,
  // ... other config options
  transparentHeader: true, // Enable transparent header with scroll detection
};

// In your component
<FilteringWrapper
  data={data}
  columns={columns}
  tableConfig={tableConfig} // transparentHeader flows through here
  filterConfig={filterConfig}
/>
```

---

## Key Points

1. **Default Behavior**: `transparentHeader` defaults to `false`, so existing tables are unaffected
2. **Performance**: Scroll detection only runs when `transparentHeader` is `true`
3. **Reliability**: Retry mechanism ensures scroll container is found even with async rendering
4. **Cleanup**: Proper cleanup prevents memory leaks and event listener issues
5. **Styling**: Conditional styling provides smooth visual transition on scroll

---

## Related Files

- **Type Definition**: `features/virtualized-table/types/table-config.ts`
- **Header Component**: `features/filtering-wrapper-multi-display/components/filtering-table-header.tsx`
- **Virtualized Table**: `features/virtualized-table/virtualized-table-container.tsx`
- **SubHeadings**: `features/subheadings/subheadings-container.tsx`
- **Wrapper**: `features/filtering-wrapper-multi-display/filtering-wrapper.tsx`
