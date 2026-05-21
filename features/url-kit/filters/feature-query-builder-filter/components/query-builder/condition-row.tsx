/**
 * Condition Row Component
 * 
 * Purpose: Individual condition row with all selectors and inputs
 * Used in: GroupNode component
 * Why: Provides complete UI for a single filter condition
 */

'use client'

import React from 'react'
import { X, CircleMinus, CircleCheck, MoveUp, MoveDown } from 'lucide-react'
import { LogicSelector } from './logic-selector'
import { LogicText } from './logic-text'
import { WhereText } from './where-text'
import { FieldSelector } from './field-selector'
import { OperatorSelector } from './operator-selector'
import { DateTypeSelector } from './date-type-selector'
import { ValueInput } from './value-input'
import { isConditionComplete } from '../../utils/is-condition-complete'
import type { FilterCondition } from '../../types/filter'
import type { FilterField } from '../../types/field'

interface ConditionRowProps {
  condition: FilterCondition
  showLogic: boolean
  logic: 'and' | 'or'
  isApplied: boolean
  fields: FilterField[]
  isFirst: boolean
  isLast: boolean
  isSecond: boolean  // NEW: Whether this is the second row (shows dropdown)
  onLogicChange: (logic: 'and' | 'or') => void
  onFieldChange: (field: string) => void
  onOperatorChange: (operator: string) => void
  onDateTypeChange: (dateType: string) => void
  onValueChange: (value: unknown) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

/**
 * ConditionRow component - individual condition row
 * WHY: Provides complete UI for a single filter condition
 * HOW: Renders logic selector, field selector, operator selector, date type selector (if date), value input, and delete button
 */
export function ConditionRow({
  condition,
  showLogic,
  logic,
  isApplied,
  fields,
  isFirst,
  isLast,
  isSecond,
  onLogicChange,
  onFieldChange,
  onOperatorChange,
  onDateTypeChange,
  onValueChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ConditionRowProps) {
  const selectedField = fields.find(f => f.key === condition.field)
  const isDateField = selectedField?.type === 'date'
  const needsValueInput = condition.operator && 
    condition.operator !== 'is_empty' && 
    condition.operator !== 'is_not_empty'
  
  // Check if condition is complete
  const isComplete = isConditionComplete(condition)

  return (
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
      {/* Logic Display: First = "Where", Second = Dropdown, Third+ = Inherited Text */}
      {isFirst ? (
        <WhereText className="w-[65px]" />
      ) : isSecond ? (
        <LogicSelector
          value={logic}
          onChange={onLogicChange}
          className="w-[65px]"
        />
      ) : (
        <LogicText
          value={logic}
          className="w-[65px]"
        />
      )}

      {/* Field Selector */}
      <FieldSelector
        value={condition.field}
        fields={fields}
        onChange={onFieldChange}
      />

      {/* Operator Selector */}
      <OperatorSelector
        value={condition.operator}
        fieldType={selectedField?.type || null}
        onChange={onOperatorChange}
      />

      {/* Date Type Selector (only for date fields) */}
      {isDateField && needsValueInput && (
        <DateTypeSelector
          value={condition.dateType || ''}
          onChange={onDateTypeChange}
        />
      )}

      {/* Value Input */}
      {needsValueInput && (
        <ValueInput
          fieldType={selectedField?.type || null}
          dateType={condition.dateType}
          operator={condition.operator}
          value={condition.value}
          onChange={onValueChange}
        />
      )}

      {/* Completion Indicator */}
      <div className="ml-auto flex items-center">
        {isComplete && isApplied ? (
          <div title="Condition applied and active in filter">
            <CircleCheck className="w-4 h-4 text-green-500" />
          </div>
        ) : isComplete ? (
          <div title="Condition complete but not yet applied">
            <CircleMinus className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : (
          <div title="Condition incomplete - fill in all required fields">
            <CircleMinus className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={onRemove}
        className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
        title="Remove condition"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Move Up Button */}
      <button
        onClick={onMoveUp}
        disabled={isFirst}
        className={`p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ${
          isFirst ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Move up"
      >
        <MoveUp className="w-3 h-3" />
      </button>

      {/* Move Down Button */}
      <button
        onClick={onMoveDown}
        disabled={isLast}
        className={`p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors ${
          isLast ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Move down"
      >
        <MoveDown className="w-3 h-3" />
      </button>
    </div>
  )
}
