# Condition Completion Tracking Plan

## Overview
Add visual indicators and validation to track which filter conditions are complete and applied to URL parameters. Only complete conditions should be synced to the URL.

## Problem
- Users can add unlimited empty conditions that still update URL params
- No visual feedback on which conditions are complete vs incomplete
- No way to know which conditions are actually applied to the filter

## Solution
1. **Validation**: Only sync complete conditions to URL
2. **Visual Indicators**: Show completion status for each condition
3. **Real-time Updates**: Update indicators as conditions are completed

## Implementation Steps

### Phase 1: Create Utility Functions

#### 1.1 `utils/is-condition-complete.ts`
- Function: `isConditionComplete(condition: FilterCondition): boolean`
- Purpose: Check if a condition has all required fields
- Logic:
  - Must have `field` and `operator`
  - For empty operators (`is_empty`, `is_not_empty`): no value needed
  - For date fields with `days_ago`/`days_from_now`: need numeric value
  - For date fields with `exact_date`: need date string
  - For other operators: need non-empty value

#### 1.2 `utils/get-applied-conditions.ts`
- Function: `getAppliedConditionIds(urlFilter: FilterNode | null): Set<string>`
- Purpose: Extract all condition IDs from the filter tree in URL
- Logic: Recursively traverse filter tree and collect condition IDs

#### 1.3 `utils/filter-complete-conditions.ts`
- Function: `filterCompleteConditions(node: FilterNode | null): FilterNode | null`
- Purpose: Filter out incomplete conditions from filter tree
- Logic: Recursively remove incomplete conditions and empty groups

### Phase 2: Update Components

#### 2.1 `components/query-builder/condition-row.tsx`
- Add `isApplied: boolean` prop
- Import `CircleMinus` and `CircleCheck` from lucide-react
- Import `isConditionComplete` utility
- Add completion indicator icon:
  - `CircleCheck` (green) if complete and applied
  - `CircleMinus` (muted) if incomplete or not applied
- Position indicator between inputs and delete button

#### 2.2 `components/query-builder/group-node.tsx`
- Add `appliedConditionIds: Set<string>` prop
- Pass `isApplied={appliedConditionIds.has(condition.id)}` to ConditionRow
- Pass `appliedConditionIds` to nested GroupNode components

#### 2.3 `components/query-builder/query-builder.tsx`
- Import utilities: `isConditionComplete`, `getAppliedConditionIds`, `filterCompleteConditions`
- Update URL sync effect to only sync complete conditions
- Get applied condition IDs from URL filter
- Pass `appliedConditionIds` to GroupNode

### Phase 3: Export Utilities

#### 3.1 `utils/index.ts`
- Export `isConditionComplete`
- Export `getAppliedConditionIds`
- Export `filterCompleteConditions`

## Visual Design

### Completion Indicator
- **Position**: Right side of condition row, before delete button
- **Complete & Applied**: `CircleCheck` icon, green color (`text-green-500`)
- **Incomplete or Not Applied**: `CircleMinus` icon, muted color (`text-muted-foreground`)
- **Size**: `w-4 h-4`
- **Tooltip**: "Condition applied" or "Condition incomplete or not applied"

## Behavior

### URL Sync Logic
1. When filter tree changes, filter out incomplete conditions
2. If filtered tree has at least one complete condition, sync to URL
3. If no complete conditions, clear URL parameter
4. Track which condition IDs are in the URL

### Visual Feedback
1. Real-time updates as user fills in condition fields
2. Icon changes from CircleMinus to CircleCheck when condition becomes complete and applied
3. Icon reverts to CircleMinus if condition becomes incomplete

## Benefits
- ✅ Prevents empty conditions from polluting URL
- ✅ Clear visual feedback on condition status
- ✅ Better UX - users know which conditions are active
- ✅ Maintains filter tree structure while only applying complete conditions

## Testing Checklist
- [ ] Empty condition shows CircleMinus
- [ ] Complete condition shows CircleCheck when applied
- [ ] Incomplete condition doesn't sync to URL
- [ ] Complete condition syncs to URL
- [ ] Nested groups work correctly
- [ ] Date fields with different date types validate correctly
- [ ] Empty operators (is_empty, is_not_empty) validate correctly
