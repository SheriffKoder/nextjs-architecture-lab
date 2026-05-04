# Logic Display Pattern

## Overview
The logic selector (AND/OR) follows a cascading pattern where the logic is set once and inherited by subsequent rows.

## Pattern Rules

### Root Group
- **Row 1**: Shows "Where" (text, not editable)
- **Row 2**: Shows AND/OR dropdown (sets group logic)
- **Row 3+**: Shows inherited logic as text (e.g., "AND" or "OR", read-only)

### Nested Groups
- **First item**: Shows "Where" (text, not editable)
- **Second item**: Shows AND/OR dropdown (sets nested group logic)
- **Third+ items**: Shows inherited logic as text (read-only)

## Examples

### Example 1: AND Logic
```
Where    [Field] [Operator] [Value]
AND ▼    [Field] [Operator] [Value]
AND      [Field] [Operator] [Value]
AND      [Group]
```

### Example 2: OR Logic
```
Where    [Field] [Operator] [Value]
OR  ▼    [Field] [Operator] [Value]
OR       [Field] [Operator] [Value]
```

### Example 3: Nested Groups
```
Where    [Field] [Operator] [Value]
AND ▼    [Field] [Operator] [Value]
AND      [Group]
           Where    [Field] [Operator] [Value]
           OR  ▼    [Field] [Operator] [Value]
           OR       [Field] [Operator] [Value]
```

## Implementation Details

### Logic Inheritance Rules

1. **For Conditions Inside a Group:**
   - Conditions use their **parent group's logic** (the group they belong to)
   - Example: If a nested group has `logic: "and"`, all conditions inside it use "and"

2. **For Nested Groups (Third+ Items):**
   - Nested group headers show their **parent group's logic** (not their own logic)
   - Example: If root group has `logic: "or"` and a nested group is the 3rd item, it shows "OR" text
   - The nested group's own logic only applies to conditions **inside** that nested group

### Code Implementation

- `conditionLogic = group.logic` - Conditions use their immediate parent group's logic
- `inheritedLogic = parentGroup?.logic ?? 'and'` - Nested groups (third+) show parent's logic

## Backend Compatibility

✅ **Fully Compatible**: The backend stores logic at the group level (`FilterGroup.logic`), which applies to all children. This UI pattern is purely presentational and doesn't change the AST structure.

## Benefits

1. **Clearer UX**: "Where" clearly indicates the first condition
2. **Less Repetition**: Logic set once, inherited automatically
3. **Visual Clarity**: Shows which logic applies to each row
4. **Industry Standard**: Matches patterns from Airtable, Notion, etc.

## Fixes Applied

### Issue 1: Nested Group Not Showing Inherited Logic
**Problem**: Nested groups (third+ items) were showing their own logic instead of parent's logic.

**Solution**: Changed inherited logic calculation to always use `parentGroup?.logic` for third+ items, not the group's own logic.

### Issue 2: Second-Row Dropdown Not Working
**Problem**: Conditions inside nested groups were using parent's logic instead of their group's logic.

**Solution**: Changed `conditionLogic` to use `group.logic` directly, ensuring conditions inside a group use that group's logic, not the parent's.
