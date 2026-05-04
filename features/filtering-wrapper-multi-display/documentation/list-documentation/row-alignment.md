# Row Alignment in Grouped Tables

## Overview

Table headers and data rows within grouped tables must align with their parent group headers. This ensures visual consistency and proper indentation hierarchy.

## Problem

Currently, group headers have dynamic indentation based on their level (`paddingLeft: ${level * 20}px`), but table headers and data rows don't have matching indentation, causing misalignment.

## Solution

Apply the same indentation calculation to table headers and data rows, and adjust their width accordingly to maintain proper layout.

## Implementation Plan

### Phase 1: Two-Layer Structure for Border Alignment
- Outer div: Preserves react-window's `style` object (position, top, height) for virtualization
- Inner div: Applies indentation and border, ensuring border aligns with indented content

### Phase 2: Calculate Indentation for Table Headers and Rows
- Extract the level from `flattenedRow.level`
- Calculate indent: `indent = level * 20` (same formula as group headers)
- Apply `marginLeft: ${indent}px` to the inner wrapper div

### Phase 3: Adjust Width for Indented Rows
- When `indent > 0`, adjust width: `width: calc(100% - ${indent}px)`
- This ensures rows don't overflow and maintain proper alignment
- For `indent === 0`, use `width: 100%`

### Phase 4: Apply Border to Inner Wrapper
- Move `border-b border-gray-200` to the inner wrapper div
- This ensures the border starts at the indented position, not at 0px

### Phase 5: Apply to Both Table Headers and Data Rows
- Update `table-header` case in `rowRenderer`
- Update `data-row` case in `rowRenderer`
- Ensure consistent styling across both row types

## Level Mapping

| Row Type | Level | Indent | Description |
|----------|-------|--------|-------------|
| Group Header (top-level) | 0 | 0px | Main group header |
| Table Header (no sub-groups) | 1 | 0px | Aligns with group header |
| Data Row (no sub-groups) | 1 | 0px | Aligns with group header |
| Sub-group Header | 1 | 20px | Nested group header |
| Table Header (with sub-groups) | 2 | 20px | Aligns with sub-group header |
| Data Row (with sub-groups) | 2 | 20px | Aligns with sub-group header |

## Code Changes

### virtualized-list-container.tsx

**Table Header Case:**
```typescript
case 'table-header':
  const tableHeaderIndent = (flattenedRow.level || 0) * 20;
  return (
    <div style={style}>
      <div 
        style={{ 
          marginLeft: `${tableHeaderIndent}px`,
          width: tableHeaderIndent > 0 ? `calc(100% - ${tableHeaderIndent}px)` : '100%'
        }} 
        className="border-b border-gray-200"
      >
        <VirtualizedTableHeader ... />
      </div>
    </div>
  );
```

**Data Row Case:**
```typescript
case 'data-row':
  const dataRowIndent = (flattenedRow.level || 0) * 20;
  return (
    <div style={style}>
      <div 
        style={{ 
          marginLeft: `${dataRowIndent}px`,
          width: dataRowIndent > 0 ? `calc(100% - ${dataRowIndent}px)` : '100%'
        }} 
        className="border-b border-gray-200"
      >
        <VirtualizedTableRow ... />
      </div>
    </div>
  );
```

## Visual Result

Before:
```
▼ [Category] Analytics (1)
[Table Header Row]          ← Misaligned
[Data Row]                  ← Misaligned
```

After:
```
▼ [Category] Analytics (1)
  [Table Header Row]        ← Aligned
  [Data Row]                ← Aligned
```

## Notes

- The indentation formula matches group headers: `level * 20px`
- Width adjustment prevents overflow when indentation is applied
- Works correctly with react-window virtualization (style object is preserved)
- Maintains proper alignment for nested groups (sub-groups)
