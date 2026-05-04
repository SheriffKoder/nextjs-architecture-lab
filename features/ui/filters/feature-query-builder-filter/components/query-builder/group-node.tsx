/**
 * Group Node Component
 * 
 * Purpose: Recursive component for rendering filter groups
 * Used in: QueryBuilder and GroupNode (recursive)
 * Why: Provides recursive rendering of nested filter groups
 */

'use client'

import React from 'react'
import { X, MoveUp, MoveDown } from 'lucide-react'
import { LogicSelector } from './logic-selector'
import { LogicText } from './logic-text'
import { WhereText } from './where-text'
import { ConditionRow } from './condition-row'
import { AddButtons } from './add-buttons'
import type { FilterGroup, FilterCondition } from '../../types/filter'
import type { FilterField } from '../../types/field'
import { useFilterBuilder } from '../../hooks/use-filter-builder'

interface GroupNodeProps {
  group: FilterGroup
  isRoot?: boolean
  filterBuilder: ReturnType<typeof useFilterBuilder>
  fields: FilterField[]
  appliedConditionIds: Set<string>
  isFirstInParent?: boolean
  isSecondInParent?: boolean
  isLastInParent?: boolean
}

/**
 * GroupNode component - recursive group renderer
 * WHY: Provides recursive rendering of nested filter groups
 * HOW: Renders group logic selector, children (conditions and nested groups), and add buttons
 */
export function GroupNode({
  group,
  isRoot = false,
  filterBuilder,
  fields,
  appliedConditionIds,
  isFirstInParent = true,
  isSecondInParent = false,
  isLastInParent = true,
}: GroupNodeProps) {
  const {
    updateGroupLogic,
    updateConditionField,
    updateConditionOperator,
    updateConditionValue,
    updateConditionDateType,
    removeNode,
    addCondition,
    addGroup,
    getParentGroup,
    moveNodeUp,
    moveNodeDown,
  } = filterBuilder

  // Get parent group to determine logic for conditions
  const parentGroup = getParentGroup(group.id)
  // Conditions inside this group should use THIS group's logic, not parent's
  const conditionLogic = group.logic

  return (
    <div className={`${!isRoot ? 'space-y-2 pb-3 border-b border-border' : ''}`}>
      {/* Header row with logic selector and action buttons (only for nested groups) */}
      {!isRoot && (
        <div className="flex items-center gap-2 mb-2">
          {/* For nested groups: first item shows "Where", second shows dropdown, third+ shows inherited text */}
          {isFirstInParent ? (
            <WhereText className="w-[65px] flex-shrink-0" />
          ) : isSecondInParent ? (
            <LogicSelector
              value={group.logic}
              onChange={(logic) => updateGroupLogic(group.id, logic)}
              className="w-[65px] flex-shrink-0"
            />
          ) : (
            // Third+ items: Always show parent's logic, not group's own logic
            <LogicText
              value={parentGroup?.logic ?? 'and'}
              className="w-[65px] flex-shrink-0"
            />
          )}
          <div className="flex-1" /> {/* Spacer */}
          {/* Action buttons for nested group */}
          <div className="flex items-center gap-2">
            {/* Delete button */}
            <button
              onClick={() => removeNode(group.id)}
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
              title="Remove group"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Move Up button */}
            <button
              onClick={() => moveNodeUp(group.id)}
              disabled={isFirstInParent}
              className={`p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ${
                isFirstInParent ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Move up"
            >
              <MoveUp className="w-3 h-3" />
            </button>
            {/* Move Down button */}
            <button
              onClick={() => moveNodeDown(group.id)}
              disabled={isLastInParent}
              className={`p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ${
                isLastInParent ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Move down"
            >
              <MoveDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Bordered container for group's rows */}
      <div className={`${!isRoot ? 'p-4 border border-border rounded-md ml-[73px]' : ''}`}>
        {/* Render children */}
        <div className="space-y-2">
        {group.children.map((child, index) => {
          const isFirst = index === 0
          const isSecond = index === 1
          const isLast = index === group.children.length - 1

          if (child.type === 'condition') {
            const condition = child as FilterCondition
            const showLogic = !isFirst

            return (
              <ConditionRow
                key={child.id}
                condition={condition}
                showLogic={showLogic}
                logic={conditionLogic}
                isApplied={appliedConditionIds.has(condition.id)}
                fields={fields}
                isFirst={isFirst}
                isLast={isLast}
                isSecond={isSecond}
                onLogicChange={(logic) => {
                  // Update group logic (set by second row)
                  updateGroupLogic(group.id, logic)
                }}
                onFieldChange={(field) => updateConditionField(condition.id, field)}
                onOperatorChange={(operator) => updateConditionOperator(condition.id, operator)}
                onDateTypeChange={(dateType) => updateConditionDateType(condition.id, dateType)}
                onValueChange={(value) => updateConditionValue(condition.id, value)}
                onRemove={() => removeNode(condition.id)}
                onMoveUp={() => moveNodeUp(condition.id)}
                onMoveDown={() => moveNodeDown(condition.id)}
              />
            )
          } else {
            // Nested group
            const isSecond = index === 1
            return (
              <div key={child.id} className="mb-3">
                <GroupNode
                  group={child as FilterGroup}
                  isRoot={false}
                  filterBuilder={filterBuilder}
                  fields={fields}
                  appliedConditionIds={appliedConditionIds}
                  isFirstInParent={isFirst}
                  isSecondInParent={isSecond}
                  isLastInParent={isLast}
                />
              </div>
            )
          }
        })}
        </div>

        {/* Add Buttons */}
        <div className="mt-3">
          <AddButtons
            onAddCondition={() => addCondition(group.id)}
            onAddGroup={() => addGroup(group.id)}
          />
        </div>
      </div>
    </div>
  )
}
