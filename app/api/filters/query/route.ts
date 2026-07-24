/**
 * Query Filter API Route
 * 
 * Purpose: API endpoint for query filtering with filter AST
 * Used in: Client pages that need server-side query filtering
 * Why: Processes filter AST and returns filtered data
 */

import { connection, NextRequest, NextResponse } from 'next/server'
import { applyFilters, validateFilter, type FieldMapping } from '@/platform/url-kit/filters/feature-query-builder-filter/backend'
import { decodeFilters } from '@/platform/url-kit/filters/feature-query-builder-filter/utils'
import type { FilterNode } from '@/platform/url-kit/filters/feature-query-builder-filter/types'

// Mock data - replace with actual data source
const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', createdAt: '2025-01-15', amount: 50000 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', createdAt: '2025-01-10', amount: 75000 },
  // Add more mock data as needed
]

/**
 * Field mapping configuration
 * Maps filter field keys to data properties
 */
const fieldMapping: FieldMapping = {
  name: { column: 'name', type: 'text' },
  email: { column: 'email', type: 'text' },
  status: { column: 'status', type: 'text' },
  createdAt: { column: 'createdAt', type: 'date' },
  amount: { column: 'amount', type: 'number' },
}

/**
 * Apply filter to in-memory data (for demo purposes)
 * In production, this would apply to a Supabase query
 */
function applyFilterToData(data: any[], filter: FilterNode): any[] {
  // For demo: simple in-memory filtering
  // In production, use applyFilters with Supabase query builder
  return data.filter(item => {
    if (filter.type === 'group') {
      // Handle group logic
      const results = filter.children.map(child => {
        if (child.type === 'condition') {
          return evaluateCondition(item, child, fieldMapping)
        }
        // Nested group - recursive
        return applyFilterToData([item], child).length > 0
      })
      
      return filter.logic === 'and' 
        ? results.every(r => r)
        : results.some(r => r)
    }
    return true
  })
}

/**
 * Evaluate a single condition against an item
 */
function evaluateCondition(item: any, condition: any, fieldMap: FieldMapping): boolean {
  const field = fieldMap[condition.field]
  if (!field) return true
  
  const itemValue = item[field.column]
  const filterValue = condition.value
  
  switch (condition.operator) {
    case 'contains':
      return String(itemValue || '').toLowerCase().includes(String(filterValue || '').toLowerCase())
    case 'does_not_contain':
      return !String(itemValue || '').toLowerCase().includes(String(filterValue || '').toLowerCase())
    case 'is':
      return String(itemValue) === String(filterValue)
    case 'is_not':
      return String(itemValue) !== String(filterValue)
    case 'is_empty':
      return itemValue === null || itemValue === undefined || itemValue === ''
    case 'is_not_empty':
      return itemValue !== null && itemValue !== undefined && itemValue !== ''
    case 'eq':
      return Number(itemValue) === Number(filterValue)
    case 'neq':
      return Number(itemValue) !== Number(filterValue)
    case 'gt':
      return Number(itemValue) > Number(filterValue)
    case 'lt':
      return Number(itemValue) < Number(filterValue)
    case 'gte':
      return Number(itemValue) >= Number(filterValue)
    case 'lte':
      return Number(itemValue) <= Number(filterValue)
    case 'before':
      return new Date(itemValue) < new Date(filterValue)
    case 'after':
      return new Date(itemValue) > new Date(filterValue)
    case 'on_or_before':
      return new Date(itemValue) <= new Date(filterValue)
    case 'on_or_after':
      return new Date(itemValue) >= new Date(filterValue)
    default:
      return true
  }
}

export async function GET(request: NextRequest) {
  await connection()
  try {
    const searchParams = request.nextUrl.searchParams
    const filterParam = searchParams.get('filter')
    
    // Decode filter from URL
    const filter = decodeFilters(filterParam)
    
    // If no filter, return all data
    if (!filter) {
      return NextResponse.json({ data: mockData })
    }
    
    // Validate filter structure
    if (!validateFilter(filter)) {
      return NextResponse.json(
        { error: 'Invalid filter structure' },
        { status: 400 }
      )
    }
    
    // Apply filter to data
    const filteredData = applyFilterToData(mockData, filter)
    
    return NextResponse.json({ data: filteredData })
  } catch (error) {
    console.error('Query filter error:', error)
    return NextResponse.json(
      { error: 'Failed to process filter' },
      { status: 500 }
    )
  }
}
