
## Group Labels and Spacing

### Overview

Group labels and spacing allow you to add visual separation and context to grouped data. A label (e.g., "Category") can be displayed above each group header, and configurable spacing can be added between groups.

### Features

1. **Group Label**: Small text displayed above each collapsible group header
2. **Group Spacing**: Configurable spacing between groups (in pixels)
3. **Virtualization-Aware**: Spacing is handled through row height calculation, not CSS margins

### Configuration

**File:** `utils/grouping-utils.ts`

Add to `GroupConfig`:
```typescript
export interface GroupConfig {
  // ... existing props
  // Label to display above each group header (e.g., "Category")
  groupLabel?: string;
  // Spacing between groups in pixels (default: 0)
  groupSpacing?: number;
}
```

### Implementation Status

✅ **Implemented**: Spacer rows for group spacing
⏳ **Pending**: Group labels (not yet implemented)

### Implementation Plan

#### ✅ Phase 1: Update GroupConfig Interface (COMPLETED)
- ✅ Added `groupSpacing?: number` - Spacing in pixels between groups (default: 0)
- ⏳ `groupLabel?: string` - Text to display above each group header (not yet implemented)

#### ✅ Phase 2: Update Flattening Logic (COMPLETED)
- ✅ Added `'spacer'` row type to `FlattenedRowType`
- ✅ Updated `flattenGroupedRows` to accept `groupConfig` parameter
- ✅ Added spacer row insertion logic (before each group except the first)

#### ✅ Phase 3: Update Row Height Calculation (COMPLETED)
- ✅ Added `case 'spacer'` to `calculateRowHeight` function
- ✅ Returns `listViewConfig?.groupSpacing || 0` for spacer rows
- ✅ Spacing is handled as separate rows, not added to header height

#### ✅ Phase 4: Update Row Renderer (COMPLETED)
- ✅ Added `case 'spacer'` to `rowRenderer` function
- ✅ Renders empty `<div>` with spacing height
- ✅ Spacer rows are virtualization-aware

#### ⏳ Phase 5: Group Labels (PENDING)
- ⏳ Add `groupLabel` prop to `GroupHeaderProps`
- ⏳ Render label above collapsible header when `groupLabel` is provided
- ⏳ Label styling: `text-xs text-foreground/60 uppercase tracking-wide`
- ⏳ Structure: flex-col container with label row and collapsible row
- ⏳ Account for label height (20px) in row height calculation

### Visual Structure

```
┌─────────────────────────────────────────┐
│ Category                    [Label Row]  │
│ ▼ Development (7)          [Header Row] │
│ ┌─────────────────────────────────────┐ │
│ │ [Table Header Row]                   │ │
│ │ [Data Rows...]                       │ │
│ └─────────────────────────────────────┘ │
│ [groupSpacing pixels]                    │
├─────────────────────────────────────────┤
│ Category                    [Label Row]  │
│ ▼ Analytics (1)            [Header Row]  │
│ ┌─────────────────────────────────────┐ │
│ │ [Table Header Row]                   │ │
│ │ [Data Rows...]                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Usage Example

```typescript
const listViewConfig: GroupConfig = {
  groupBy: 'category',
  groupLabel: 'Category',
  groupSpacing: 16, // 16px spacing between groups
  groupKeyFormatter: (value) => value || 'Uncategorized',
};
```

### Styling

- **Label**: `text-xs text-foreground/60 uppercase tracking-wide`
- **Label Padding**: `px-4 py-1`
- **Header Height**: 40px (base) + label height (20px if present)
- **Spacing**: Implemented as separate spacer rows between groups (not as part of row height)

### Implementation Details: Spacer Rows

Spacing between groups is implemented using **separate spacer rows** rather than adding spacing to row heights. This approach ensures:

1. **Visual Gap**: Creates actual visual separation between groups
2. **No Block Movement**: Doesn't push entire blocks down (which happens when spacing is added to row height)
3. **Virtualization Compatible**: Works correctly with react-window's absolute positioning

#### How It Works

1. **Spacer Row Type**: A new `'spacer'` row type is added to `FlattenedRowType`
2. **Flattening Logic**: `flattenGroupedRows` adds a spacer row before each group (except the first)
3. **Height Calculation**: Spacer rows return the configured `groupSpacing` value as their height
4. **Rendering**: Spacer rows render as empty `<div>` elements with the spacing height

#### Code Structure

```typescript
// Spacer row added between groups
flattened.push({
  type: 'spacer',
  level: 0,
});

// Height calculation
case 'spacer':
  return listViewConfig?.groupSpacing || 0;

// Rendering
case 'spacer':
  return <div style={style} />; // Empty div with spacing height
```

#### Why Not Row Height?

Adding spacing to row height (e.g., `return 40 + spacing`) causes the entire block to shift down because react-window uses absolute positioning based on cumulative heights. Spacer rows create actual gaps in the virtualized list without affecting the positioning of other elements.