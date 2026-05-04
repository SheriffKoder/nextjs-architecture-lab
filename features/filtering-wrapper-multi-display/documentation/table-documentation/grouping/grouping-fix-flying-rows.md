# Fix: Overlapping Rows in Grouped Table View

## Problem

When groups expand/collapse, rows overlap with other groups. This is caused by:

1. **Double positioning**: `react-window`'s `style` prop (with `position: absolute` and `top`) was being passed to both the wrapper div AND inner components, causing conflicting positioning.
2. **Missing list reset**: When groups expand/collapse, the virtualization list wasn't resetting to recalculate row positions.

## Solution

### 1. Remove `style` prop from inner components

The wrapper `<div>` handles positioning from `react-window`. Inner components should not receive the full `style` object.

**In `rowRenderer`:**

```typescript
// Group headers - don't pass style prop
<GroupHeaderRow
  // ... props ...
  // style={style} ❌ Remove this
/>

// Data rows - only pass height/width
<VirtualizedTableRow
  // ... props ...
  style={{ height: style.height, width: '100%' }} // ✅ Only height/width
/>
```

### 2. Update `GroupHeaderRow` component

Remove the spread of `style` prop in the root div:

```typescript
// Before
<div style={{ ...style, minWidth: '100%', width: '100%' }}>

// After
<div style={{ minWidth: '100%', width: '100%' }}>
```

### 3. Reset list when structure changes

Add `useEffect` to reset the virtualization list when `flattenedRows` changes (which happens on expand/collapse):

```typescript
useEffect(() => {
  if (flattenedRows && listRef.current && 'resetAfterIndex' in listRef.current) {
    (listRef.current as VariableSizeList).resetAfterIndex(0);
  }
}, [flattenedRows]);
```

## Result

- ✅ Wrapper div handles positioning from `react-window`
- ✅ Inner components don't receive conflicting positioning styles
- ✅ List resets automatically when groups expand/collapse
- ✅ Rows position correctly without overlapping
