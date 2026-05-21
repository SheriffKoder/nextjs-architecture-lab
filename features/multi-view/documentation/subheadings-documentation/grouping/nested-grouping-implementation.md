# Nested Grouping (Subgroups) Implementation Guide

## Overview

This document provides a step-by-step guide for implementing nested grouping (subgroups) in the subheadings feature. Nested grouping allows items to be organized in a two-level hierarchy (e.g., Primary Group → Subgroup), where dragging items between subgroups can update multiple fields simultaneously.

## affected files (Lotis)
features\filtering-wrapper-multi-display\features\subheadings\subheadings-container.tsx
features\filtering-wrapper-multi-display\features\subheadings\dnd\types.ts
features\filtering-wrapper-multi-display\filtering-wrapper.tsx add to interface and pass  nestedGrouping={subheadingsConfig?.nestedGrouping} tp SubheadingsContainer
features\filtering-wrapper-multi-display\features\subheadings\dnd\hooks\use-subheadings-state.ts

in subheadingsConfig on client place
nestedGrouping: {
    enabled: true,
    primaryKey: 'project',    // Primary grouping field
    secondaryKey: 'phase',    // Secondary grouping field
    separator: '|'             // Separator for composite keys
}

### Use Cases

- **Same Primary Group, Different Subgroup**: Item moves within the same primary group but changes subgroup (updates only the subgroup field)
- **Cross Primary Group, Different Subgroup**: Item moves to a different primary group and subgroup (updates both primary and subgroup fields)

### Architecture Approach

We use **composite group keys** to represent nested groups. A composite key combines the primary and subgroup values using a separator (e.g., `"primaryValue|subgroupValue"`).

**Benefits:**
- Minimal changes to existing code structure
- Maintains backward compatibility with single-level grouping
- Clear separation of concerns
- Easy to parse and update multiple fields

---

## Implementation Steps

### Step 1: Update Type Definitions

**File:** `features/filtering-wrapper-multi-display/features/subheadings/types/table-config.ts` (or relevant type file)

Add nested grouping configuration to the subheadings config type:

```typescript
export interface NestedGroupingConfig {
  enabled: boolean
  primaryKey: string      // Field name for primary grouping (e.g., 'project')
  secondaryKey: string    // Field name for secondary grouping (e.g., 'phase')
  separator: string       // Separator for composite keys (e.g., '|')
}

export interface SubheadingsConfig<T = any> {
  columnKey?: string
  groups?: Array<{ key: string; label: string }>
  subheadingsDragEnd?: (updatedData: T[]) => void
  nestedGrouping?: NestedGroupingConfig  // NEW
}
```

---

### Step 2: Update Group Configuration in Consumer Component

**File:** Your component that uses `FilteringWrapper` (e.g., `features/tasks/tasks-content.tsx`)

Create composite groups that combine primary and secondary values:

```typescript
// Example: Grouping by project (primary) and phase (secondary)
const nestedGroups = useMemo(() => {
  const uniquePrimaryValues = Array.from(
    new Set(data.map(item => item.primaryField).filter(Boolean))
  )
  
  const groups: Array<{ 
    key: string
    label: string
    primaryValue: string
    secondaryValue: string
  }> = []
  
  uniquePrimaryValues.sort().forEach(primaryValue => {
    // Add all possible secondary values for each primary value
    const secondaryOptions = ['option1', 'option2'] // Your secondary options
    
    secondaryOptions.forEach(secondaryValue => {
      const compositeKey = `${primaryValue}|${secondaryValue}`
      groups.push({
        key: compositeKey,
        label: `${formatPrimary(primaryValue)} - ${formatSecondary(secondaryValue)}`,
        primaryValue,
        secondaryValue
      })
    })
  })
  
  return groups
}, [data])

// Update subheadingsConfig
const subheadingsConfig = {
  columnKey: 'primaryField', // Keep for backward compatibility
  groups: nestedGroups.map(g => ({ 
    key: g.key, 
    label: g.label 
  })),
  subheadingsDragEnd: subheadingsDragEnd,
  nestedGrouping: {
    enabled: true,
    primaryKey: 'primaryField',    // e.g., 'project'
    secondaryKey: 'secondaryField', // e.g., 'phase'
    separator: '|'                  // Must not appear in your data values
  }
}
```

**Important Notes:**
- Choose a separator (`|`, `::`, `__`) that will never appear in your actual data values
- Ensure all possible combinations of primary + secondary are included in `groups`
- The `label` should be user-friendly and clearly show the hierarchy

---

### Step 3: Update Grouping Logic in SubHeadingsContainer

**File:** `features/filtering-wrapper-multi-display/features/subheadings/subheadings-container.tsx`

Modify the `groupedData` useMemo to handle composite keys:

```typescript
const groupedData = useMemo(() => {
  const groups: Record<string, T[]> = {}
  
  // Initialize all groups from config
  if (groupsConfig && groupsConfig.length > 0) {
    groupsConfig.forEach((group) => {
      groups[group.key] = []
    })
  }
  
  // Group items by composite key (primary|secondary)
  filteredData.forEach((item) => {
    const primaryValue = (item as any)[nestedGroupingConfig?.primaryKey || groupByKey] || 'Unknown'
    const secondaryValue = (item as any)[nestedGroupingConfig?.secondaryKey || ''] || 'default'
    
    let compositeKey: string
    
    if (nestedGroupingConfig?.enabled) {
      // Use composite key for nested grouping
      compositeKey = `${primaryValue}${nestedGroupingConfig.separator}${secondaryValue}`
    } else {
      // Fallback to single-level grouping
      compositeKey = String(primaryValue)
    }
    
    if (!groups[compositeKey]) {
      groups[compositeKey] = []
    }
    groups[compositeKey].push(item)
  })
  
  return groups
}, [filteredData, groupsConfig, nestedGroupingConfig, groupByKey])
```

**Extract nested grouping config from subheadingsConfig:**

```typescript
// At the top of the component, extract nestedGroupingConfig
const nestedGroupingConfig = (subheadingsConfig as any)?.nestedGrouping
```

---

### Step 4: Update processGroupChange Function

**File:** `features/filtering-wrapper-multi-display/features/subheadings/dnd/hooks/use-subheadings-state.ts`

Modify `processGroupChange` to handle composite keys:

```typescript
export function processGroupChange<T extends Record<string, any>>(
  data: T[],
  itemId: string | number,
  targetGroupKey: string,
  groupByKey: string,
  nestedGrouping?: NestedGroupingConfig  // NEW parameter
): T[] {
  // Find the item in the data array
  const itemIndex = data.findIndex((item: any) => {
    return item.id === itemId || 
           item._id === itemId || 
           String(item.id) === String(itemId) ||
           String(item._id) === String(itemId)
  })

  if (itemIndex === -1) {
    console.error('❌ Item not found in data array:', itemId)
    return data
  }

  // Handle nested grouping with composite keys
  if (nestedGrouping?.enabled && targetGroupKey.includes(nestedGrouping.separator)) {
    const parts = targetGroupKey.split(nestedGrouping.separator)
    
    if (parts.length !== 2) {
      console.error('❌ Invalid composite key format:', targetGroupKey)
      return data
    }
    
    const [primaryValue, secondaryValue] = parts
    
    // Update both primary and secondary fields
    const updatedItem = {
      ...data[itemIndex],
      [nestedGrouping.primaryKey]: primaryValue,
      [nestedGrouping.secondaryKey]: secondaryValue
    }

    const updatedData = [...data]
    updatedData[itemIndex] = updatedItem

    console.log('✅ NESTED GROUP CHANGE:', {
      itemId,
      from: {
        [nestedGrouping.primaryKey]: data[itemIndex][nestedGrouping.primaryKey],
        [nestedGrouping.secondaryKey]: data[itemIndex][nestedGrouping.secondaryKey]
      },
      to: {
        [nestedGrouping.primaryKey]: primaryValue,
        [nestedGrouping.secondaryKey]: secondaryValue
      }
    })

    return updatedData
  }

  // Fallback to single field update (original behavior for backward compatibility)
  const updatedItem = {
    ...data[itemIndex],
    [groupByKey]: targetGroupKey
  }

  const updatedData = [...data]
  updatedData[itemIndex] = updatedItem

  console.log('✅ GROUP CHANGE:', {
    itemId,
    from: data[itemIndex][groupByKey],
    to: targetGroupKey
  })

  return updatedData
}
```

**Update the export in the index file:**

**File:** `features/filtering-wrapper-multi-display/features/subheadings/dnd/index.ts`

```typescript
export { useSubHeadingsState, processGroupChange } from './hooks/use-subheadings-state'
export type { NestedGroupingConfig } from './types' // If you create a types file
```

---

### Step 5: Update Drag End Handler

**File:** `features/filtering-wrapper-multi-display/features/subheadings/subheadings-container.tsx`

Pass nested grouping config to `processGroupChange`:

```typescript
const onDragEnd = (event: any) => {
  if (!subheadingsDragEnd) {
    return
  }

  const result = handleDragEnd(event)
  
  if (!result) {
    return
  }

  const { itemId, targetGroupKey, dragSource } = result

  // Don't process if dropped on the same group
  if (dragSource?.groupKey === targetGroupKey) {
    console.log('⏭️ Dropped on same group, skipping update')
    return
  }

  // Extract nested grouping config from subheadingsConfig
  const nestedGroupingConfig = (subheadingsConfig as any)?.nestedGrouping

  // Process the group change with nested grouping support
  const updatedData = processGroupChange(
    data as Record<string, any>[],
    itemId,
    targetGroupKey,
    groupByKey,
    nestedGroupingConfig  // Pass nested grouping config
  ) as T[]

  // Call the callback with updated data
  subheadingsDragEnd(updatedData)
}
```

---

### Step 6: Update Group Rendering for Visual Nesting (Optional)

**File:** `features/filtering-wrapper-multi-display/features/subheadings/subheadings-container.tsx`

If you want to visually nest groups (show primary group headers with secondary groups underneath), update the rendering logic:

```typescript
// Create a map of primary groups to their secondary groups
const primaryGroupsMap = useMemo(() => {
  if (!nestedGroupingConfig?.enabled) {
    return null
  }
  
  const map: Record<string, Array<{ key: string; label: string; secondaryValue: string }>> = {}
  
  groupKeys.forEach(groupKey => {
    if (groupKey.includes(nestedGroupingConfig.separator)) {
      const [primaryValue, secondaryValue] = groupKey.split(nestedGroupingConfig.separator)
      
      if (!map[primaryValue]) {
        map[primaryValue] = []
      }
      
      // Find label from groupsConfig
      const groupConfig = groupsConfig?.find(g => g.key === groupKey)
      const label = groupConfig?.label || secondaryValue
      
      map[primaryValue].push({ 
        key: groupKey, 
        label, 
        secondaryValue 
      })
    }
  })
  
  return map
}, [groupKeys, nestedGroupingConfig, groupsConfig])

// In the render section, conditionally render nested structure
{primaryGroupsMap ? (
  // Nested rendering: Primary group headers with secondary groups
  Object.entries(primaryGroupsMap).map(([primaryValue, secondaryGroups]) => (
    <div key={primaryValue} className="mb-8">
      {/* Primary Group Header */}
      <div className="text-lg font-semibold mb-4 px-2">
        {formatGroupName(primaryValue)}
      </div>
      
      {/* Secondary Groups */}
      {secondaryGroups.map(({ key: secondaryKey, label: secondaryLabel }) => {
        const groupItems = groupedData[secondaryKey]
        const isExpanded = expandedGroups.has(secondaryKey)
        
        return (
          <DroppableGroup 
            key={secondaryKey} 
            groupKey={secondaryKey} 
            isExpanded={isExpanded}
          >
            {/* Existing group header and items rendering */}
            {/* ... */}
          </DroppableGroup>
        )
      })}
    </div>
  ))
) : (
  // Original flat rendering (backward compatibility)
  groupKeys.map((groupKey) => {
    // ... existing rendering logic
  })
)}
```

**Note:** This step is optional. You can keep the flat rendering and just use composite keys for the drag-and-drop functionality.

---

## Configuration Example

### Example: Tasks grouped by Project (primary) and Phase (secondary)

```typescript
const subheadingsConfig = {
  columnKey: 'project',
  groups: [
    { key: 'Project Alpha|phase1', label: 'Project Alpha - Phase 1' },
    { key: 'Project Alpha|nepa', label: 'Project Alpha - NEPA' },
    { key: 'Project Beta|phase1', label: 'Project Beta - Phase 1' },
    { key: 'Project Beta|nepa', label: 'Project Beta - NEPA' },
  ],
  subheadingsDragEnd: handleDragEnd,
  nestedGrouping: {
    enabled: true,
    primaryKey: 'project',
    secondaryKey: 'phase',
    separator: '|'
  }
}
```

---

## Testing Checklist

- [ ] **Same Primary, Different Secondary**: Drag item from `Project A|phase1` to `Project A|nepa`
  - ✅ Only `phase` field should update
  - ✅ `project` field should remain unchanged

- [ ] **Different Primary, Different Secondary**: Drag item from `Project A|phase1` to `Project B|nepa`
  - ✅ Both `project` and `phase` fields should update

- [ ] **Same Group**: Drag item within the same group
  - ✅ No update should occur (early return)

- [ ] **Backward Compatibility**: Use config without `nestedGrouping`
  - ✅ Should work with single-level grouping as before

- [ ] **Empty Groups**: Groups with no items should still be visible
  - ✅ All configured groups appear in the UI

- [ ] **Visual Rendering**: If implementing nested visual structure
  - ✅ Primary group headers are clearly distinguished
  - ✅ Secondary groups are visually nested under primary groups

---

## Troubleshooting

### Issue: Items not updating correctly after drag

**Solution:** 
- Verify the separator doesn't appear in your actual data values
- Check that `nestedGroupingConfig` is being passed correctly to `processGroupChange`
- Ensure composite keys match the format: `primaryValue|secondaryValue`

### Issue: Groups not showing all combinations

**Solution:**
- Ensure `groupsConfig` includes all possible combinations of primary × secondary values
- Check that `groupedData` initializes all groups from `groupsConfig`

### Issue: Drag and drop not working

**Solution:**
- Verify `DroppableGroup` receives the correct `groupKey` (composite key)
- Check that `targetGroupKey` in `handleDragEnd` matches the composite key format
- Ensure `subheadingsDragEnd` callback is provided

---

## Backward Compatibility

This implementation maintains full backward compatibility:

- If `nestedGrouping` is not provided or `enabled: false`, the system falls back to single-level grouping
- Existing implementations continue to work without changes
- The `groupByKey` parameter is still used as a fallback

---

## Future Enhancements

Potential improvements for future iterations:

1. **Three-level nesting**: Extend to support primary → secondary → tertiary grouping
2. **Dynamic subgroups**: Allow subgroups to be determined at runtime based on data
3. **Custom separators per group**: Support different separators for different group types
4. **Visual indicators**: Add icons or colors to distinguish primary vs secondary groups
5. **Collapsible primary groups**: Allow collapsing/expanding entire primary groups

---

## Related Files

- `features/filtering-wrapper-multi-display/features/subheadings/subheadings-container.tsx`
- `features/filtering-wrapper-multi-display/features/subheadings/dnd/hooks/use-subheadings-state.ts`
- `features/filtering-wrapper-multi-display/features/subheadings/dnd/components/droppable-group.tsx`
- `features/filtering-wrapper-multi-display/features/subheadings/dnd/hooks/use-subheadings-dnd.ts`