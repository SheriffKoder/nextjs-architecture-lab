# Row Alignment in Grouped Tables

## Overview

Table headers and data rows within grouped tables must align with their parent group headers. This ensures visual consistency and proper indentation hierarchy.

## Approach

Apply the same indentation calculation as group headers (`level * 20px`) on the **react-window slot** via `paddingLeft`. Do not wrap content in a nested bordered div inside the fixed-height slot — that overflows the virtualized row height and contributes to vertical misalignment (see `vertical-shift-grouping-fix.md`).

## Level Mapping

| Row Type | Level | Indent | Description |
|----------|-------|--------|-------------|
| Group Header (top-level) | 0 | 0px | Main group header |
| Table Header (no sub-groups) | 1 | 20px | Aligns under group header content |
| Data Row (no sub-groups) | 1 | 20px | Aligns under group header content |
| Sub-group Header | 1 | 20px | Nested group header |
| Table Header (with sub-groups) | 2 | 40px | Aligns with sub-group header |
| Data Row (with sub-groups) | 2 | 40px | Aligns with sub-group header |

## Code Changes

### `virtualized-list-container.tsx`

**Table header / data row:**

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

Same pattern for `table-header` with `VirtualizedTableHeader`.

## Notes

- Indent formula matches group headers: `level * 20px`
- Preserve react-window’s `style` (position / top / height) on the outer slot
- Pass only `{ height, width }` into the inner row — not the full absolute style
- Avoid nested `marginLeft` + `border-b` wrappers inside the slot
- Vertical size-cache issues when toggling grouping: `vertical-shift-grouping-fix.md`
