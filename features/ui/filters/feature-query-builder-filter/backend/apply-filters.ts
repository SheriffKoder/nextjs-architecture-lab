/**
 * Apply Filters Utility
 * 
 * Purpose: Apply filter AST to Supabase query
 * Used in: Backend API routes
 * Why: Translates filter AST to database queries
 */

import type { FilterNode, FilterGroup, FilterCondition } from '../types/filter'
import { FilterDSL } from './filter-dsl'
import type { FilterField } from '../types/field'

/**
 * Field mapping configuration
 * Maps filter field keys to database column names
 * This should be provided by the caller based on their data model
 */
export interface FieldMapping {
  [key: string]: {
    column: string
    type: 'text' | 'date' | 'number'
  }
}

/**
 * Apply filters to query (recursive)
 * WHY: Translate filter AST to Supabase query filters
 * HOW: Recursively traverse filter tree and apply conditions based on group logic
 * @param {any} query - Supabase query builder instance
 * @param {FilterNode} node - Filter node to apply
 * @param {FieldMapping} fieldMap - Mapping of filter fields to database columns
 * @param {Logic} parentLogic - Parent group logic (for nested groups)
 */
export function applyFilters(
  query: any,
  node: FilterNode,
  fieldMap: FieldMapping,
  parentLogic: 'and' | 'or' = 'and'
): any {
  if (node.type === 'group') {
    const group = node as FilterGroup
    
    // For nested groups, we need to handle AND/OR logic
    // Supabase uses .or() for OR groups
    if (group.logic === 'or') {
      // Create OR group
      const orConditions: string[] = []
      
      group.children.forEach(child => {
        if (child.type === 'condition') {
          const condition = child as FilterCondition
          const field = fieldMap[condition.field]
          
          if (field) {
            const opFn = FilterDSL[field.type][condition.operator as keyof typeof FilterDSL[typeof field.type]]
            if (opFn) {
              let result: { op: string; value: any }
              
              // Handle different operator signatures
              if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
                // Empty operators take no parameters
                result = (opFn as () => { op: string; value: any })()
              } else if (field.type === 'date') {
                // Date operators take value, dateType, and optional days
                result = (opFn as (v: string, dateType?: string, days?: number) => { op: string; value: any })(
                  condition.value as string,
                  condition.dateType,
                  condition.dateType === 'days_ago' || condition.dateType === 'days_from_now' 
                    ? condition.value as number 
                    : undefined
                )
              } else {
                // Text and number operators take single value parameter
                result = (opFn as (v: any) => { op: string; value: any })(condition.value)
              }
              
              orConditions.push(`${field.column}.${result.op}.${result.value}`)
            }
          }
        }
      })
      
      if (orConditions.length > 0) {
        query.or(orConditions.join(','))
      }
    } else {
      // AND logic: apply each child filter
      group.children.forEach(child => {
        applyFilters(query, child, fieldMap, group.logic)
      })
    }
    
    return query
  }

  // Apply condition
  const condition = node as FilterCondition
  const field = fieldMap[condition.field]
  
  if (!field) {
    return query // Skip invalid fields
  }

  const opFn = FilterDSL[field.type][condition.operator as keyof typeof FilterDSL[typeof field.type]]
  
  if (!opFn) {
    return query // Skip invalid operators
  }

  // Handle different operator signatures
  let result: { op: string; value: any }
  
  if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
    // Empty operators take no parameters
    result = (opFn as () => { op: string; value: any })()
  } else if (field.type === 'date') {
    // Date operators take value, dateType, and optional days
    result = (opFn as (v: string, dateType?: string, days?: number) => { op: string; value: any })(
      condition.value as string,
      condition.dateType,
      condition.dateType === 'days_ago' || condition.dateType === 'days_from_now' 
        ? condition.value as number 
        : undefined
    )
  } else {
    // Text and number operators take single value parameter
    result = (opFn as (v: any) => { op: string; value: any })(condition.value)
  }

  // Apply filter to query
  query.filter(field.column, result.op, result.value)

  return query
}
