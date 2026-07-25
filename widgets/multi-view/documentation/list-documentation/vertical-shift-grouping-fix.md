# Fix: Vertical Row Shift After Grouping (List View)

## Problem

In list view (`virtualized-list-container.tsx`) with `dynamicRowHeight: true`:

1. **Default (never grouped)** — rows align correctly.
2. **After enabling grouping** — data rows shift vertically.
3. **After clearing grouping** — the shift remains until a full remount.

Virtualized table already handled this correctly; list did not.

## Root Causes

### 1. Stale `VariableSizeList` size cache

`react-window`'s `VariableSizeList` caches per-index item heights. Grouping changes what each index means:

| Index (example) | Ungrouped | Grouped |
|-----------------|-----------|---------|
| 0 | data row | group-header (`40`) |
| 1 | data row | table-header (`50`) or spacer (`groupSpacing`) |
| 2+ | data rows | mix of headers / data |

Toggling grouping without remounting or calling `resetAfterIndex(0)` leaves those cached sizes in place. Absolute `top` offsets stay wrong → vertical shift that survives ungrouping.

List remount key was only height-based:

```typescript
key={`table-${calculatedRowHeight}`}
```

Table already remounted on mode change:

```typescript
key={`table-${calculatedRowHeight}-${flattenedRows ? 'grouped' : 'ungrouped'}`}
```

### 2. `TableRowMeasurer` measured flattened rows as data items

When grouped, `displayData` is `FlattenedRow[]` (headers, spacers, data wrappers). The measurer passed each entry to `VirtualizedTableRow` as `item`, so it measured `{ type: 'group-header', ... }` / `{ type: 'data-row', data: T }` instead of the real `T`. That poisoned `calculatedRowHeight` while grouped.

### 3. Nested bordered wrappers inside the virtualized slot

Grouped `table-header` / `data-row` used:

```typescript
<div style={style}>           {/* react-window: absolute + fixed height */}
  <div className="border-b …" style={{ marginLeft, width }}>
    <VirtualizedTableRow style={{ height: style.height, … }} />
  </div>
</div>
```

The extra bordered layer could overflow the fixed slot by ~1px and compound misalignment. Indent still belongs with the group hierarchy; it should not add layout height outside the slot budget.

## Solution

**File:** `features/virtualized-list/virtualized-list-container.tsx`

### 1. Remount on group / ungroup

```typescript
<VariableSizeList
  key={`table-${calculatedRowHeight}-${flattenedRows ? 'grouped' : 'ungrouped'}`}
  // ...
/>
```

Matches virtualized-table: a fresh list when grouping mode changes so the size cache cannot carry over.

### 2. Reset sizes on flatten structure changes

Expand/collapse changes the flat row list without changing the `grouped` / `ungrouped` key. Clear the cache explicitly:

```typescript
useEffect(() => {
  const list = listRef.current as VariableSizeList | null;
  if (list && typeof list.resetAfterIndex === 'function') {
    list.resetAfterIndex(0, true);
  }
}, [flattenedRows, effectiveGroupBy, effectiveSubGroupBy, listRef]);
```

### 3. Measure real data rows only

```typescript
const measureData = useMemo(() => {
  if (!flattenedRows) return data;
  return flattenedRows
    .filter((row) => row.type === 'data-row' && row.data != null)
    .map((row) => row.data as T);
}, [flattenedRows, data]);

// ...
{dynamicRowHeight && measureData.length > 0 && (
  <TableRowMeasurer data={measureData} /* … */ />
)}
```

Never pass flattened headers/spacers into `TableRowMeasurer`.

### 4. Indent on the react-window slot (no nested border wrapper)

```typescript
case 'data-row':
  const dataRowIndent = (flattenedRow.level || 0) * 20;
  return (
    <div style={{ ...style, paddingLeft: dataRowIndent }}>
      <VirtualizedTableRow
        style={{ height: style.height, width: '100%' }}
        // ...
      />
    </div>
  );
```

Same pattern for `table-header`. Formula stays `level * 20` (see `row-alignment.md`).

## Related

- Accordion header chrome padding for list/subheadings matches table: `pt-[24px]` when `accordionConfig.groups` is present (toggle sits at `-top-6`).
- Horizontal indent details: `row-alignment.md`
- Group spacer rows: `spacing.md`
- Table-side overlap fix (similar class of bug): `../table-documentation/grouping/grouping-fix-flying-rows.md`

## Checklist

- [x] Remount key includes `grouped` / `ungrouped`
- [x] `resetAfterIndex(0)` when flattened structure / group keys change
- [x] `measureData` filters to `data-row` items only
- [x] Grouped rows indent via `paddingLeft` on the slot, no nested `border-b` wrapper
- [x] Accordion top padding aligned with table (`pt-[24px]`)
