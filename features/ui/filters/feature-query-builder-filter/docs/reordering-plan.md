# Filter Reordering Plan

## Overview
Add up/down arrow buttons to reorder conditions and groups within filter trees. Users can change the order of conditions and nested groups to control filter evaluation order.

## Problem
- No way to reorder conditions within a group
- No way to reorder nested groups
- Filter evaluation order is fixed by creation order

## Solution
1. **Reordering Functions**: Add `moveNodeUp` and `moveNodeDown` to filter builder hook
2. **UI Controls**: Add up/down arrow buttons to condition rows and group containers
3. **Position**: Place arrows to the right of the delete (X) button
4. **State Management**: Update filter tree immutably when reordering

## Implementation Steps

### Phase 1: Add Reorder Functions to Hook

#### 1.1 `hooks/use-filter-builder.ts`
- Function: `moveNodeUp(nodeId: string)`
- Function: `moveNodeDown(nodeId: string)`
- Purpose: Reorder nodes within their parent group
- Logic:
  - Find parent group of the node
  - Find node index in parent's children array
  - Swap with previous/next sibling
  - Handle root group and nested groups
  - Disable buttons at first/last position

### Phase 2: Update Components

#### 2.1 `components/query-builder/condition-row.tsx`
- Add `isFirst: boolean` prop
- Add `isLast: boolean` prop
- Add `onMoveUp: () => void` prop
- Add `onMoveDown: () => void` prop
- Import `MoveUp` and `MoveDown` from lucide-react
- Add up/down buttons after delete button
- Disable buttons when at first/last position

#### 2.2 `components/query-builder/group-node.tsx`
- Calculate `isFirst` and `isLast` for each child
- Pass reorder props to ConditionRow
- Add reorder buttons for nested groups
- Position buttons consistently with condition rows

### Phase 3: Export Functions

#### 3.1 `hooks/use-filter-builder.ts`
- Export `moveNodeUp` and `moveNodeDown` in return object

## Visual Design

### Button Position
- **Layout**: `[Logic] [Field] [Operator] [Value] [Completion Icon] [X] [↑] [↓]`
- **Position**: Right of delete button (X)
- **Spacing**: Same gap as other buttons

### Button Styling
- **Size**: `w-3 h-3` icons, `p-1` padding
- **Colors**: `text-muted-foreground` default, `hover:text-foreground`
- **Disabled**: `opacity-50 cursor-not-allowed` when at first/last
- **Hover**: `hover:bg-muted` background

### Button States
- **Enabled**: Normal opacity, hover effects
- **Disabled**: 50% opacity, no hover, cursor not-allowed
- **Tooltips**: "Move up" / "Move down"

## Behavior

### Reordering Logic
1. Find parent group of the node to move
2. Get current index in parent's children array
3. Validate move (not at first/last)
4. Swap with previous/next sibling
5. Update filter tree immutably
6. Trigger URL sync (if conditions are complete)

### Edge Cases
- **First item**: Up button disabled
- **Last item**: Down button disabled
- **Single item**: Both buttons disabled
- **Root group**: Handle root group children
- **Nested groups**: Handle nested group children recursively

## Benefits
- ✅ Control filter evaluation order
- ✅ Better UX for complex filters
- ✅ Consistent with sorting control pattern
- ✅ Works at any nesting level
- ✅ Immediate visual feedback

## Testing Checklist
- [ ] Move condition up in root group
- [ ] Move condition down in root group
- [ ] Move condition up in nested group
- [ ] Move condition down in nested group
- [ ] Move nested group up
- [ ] Move nested group down
- [ ] Disable up button at first position
- [ ] Disable down button at last position
- [ ] Disable both buttons for single item
- [ ] Reordering updates URL params correctly
- [ ] Completion indicators update after reorder
