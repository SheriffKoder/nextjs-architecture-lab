/**
 * Timeline Data Mapping Utility
 * 
 * Purpose: Generic mapping utility that adds timeline metadata to any data structure
 * Used in: timeline-mapper.tsx
 * Why: Maps dates to timelineIndex:year:month:day format for cell positioning while keeping raw data intact
 * 
 * Features:
 * - Works with any data structure (generic)
 * - Uses provided start/end keys to extract dates
 * - Adds mapping metadata object with cell IDs and positioning info
 * - Groups items with the same ID into arrays
 * - Clean separation between raw data and mapping metadata
 * - Easy to unwrap mapping when saving data
 * - Applies GMT shift for display (subtracts shift from stored dates)
 * 
 * Function Index:
 * - mapTimelineDataToCellIds<T>() - Generic function that works with any data structure
 * 
 * Example Usage:
 * // For project data
 * mapTimelineDataToCellIds(projectData, {startDateKey: 'created_at', endDateKey: 'due_date', uniqueIdKey: 'id'}, 3)
 * 
 * // For task data with different structure
 * mapTimelineDataToCellIds(taskData, {startDateKey: 'start_date', endDateKey: 'end_date', uniqueIdKey: 'task_id'}, 3)
 */

export interface TimelineMapping {
  timelineIndex: number
  startCellId: string
  endCellId: string
  startDate: Date
  endDate: Date
  uniqueId?: string
}

export interface MappedTimelineItem {
  // Generic structure - any properties from the original data
  [key: string]: any
  
  // Added mapping metadata
  mapping: TimelineMapping
}

// GroupedTimelineItem is now just an array of arrays: MappedTimelineItem[][]
// Each sub-array contains items with the same unique ID
  
  export interface MappingKeys {
    startDateKey: string
    endDateKey: string
    titleKey: string
    typeKey: string
    statusKey: string
    uniqueIdKey?: string // Optional unique ID for grouping instances (defaults to 'id')
  }
  
  /**
   * Maps timeline data to dimensional cell IDs while preserving original structure and grouping by unique ID
   * @param data - Array of timeline items (any structure)
   * @param keys - Object containing key names for different properties
   * @param gmtShift - GMT shift in hours (e.g., +3) to subtract from dates for display
   * @returns Array of arrays where each sub-array contains items with the same ID
   */
  export const mapTimelineDataToCellIds = <T = any>(
    data: T[], 
    keys: MappingKeys,
    gmtShift: number = 0
  ): MappedTimelineItem[][] => {
    // First, map all items to cell IDs
    const mappedItems: MappedTimelineItem[] = data.map((item, index) => {
      const startDate = (item as any)[keys.startDateKey]
      const endDate = (item as any)[keys.endDateKey]
      
      if (!startDate || !endDate) return null
      
      // Parse dates and adjust for display (subtract GMT shift)
      const start = new Date(startDate)
      const end = new Date(endDate)
      // Adjust for display: subtract GMT shift
      start.setHours(start.getHours() - gmtShift)
      end.setHours(end.getHours() - gmtShift)
      
      // Create mapping metadata
      const mapping: TimelineMapping = {
        timelineIndex: index,
        startCellId: `${index}:${start.getFullYear()}:${start.getMonth() + 1}:${start.getDate()}`,
        endCellId: `${index}:${end.getFullYear()}:${end.getMonth() + 1}:${end.getDate()}`,
        startDate: start,
        endDate: end,
        uniqueId: (item as any)[keys.uniqueIdKey || 'id'] || undefined
      }
      
      // Return original item with added mapping
      return {
        ...item, // Spread all original properties
        mapping // Add mapping metadata
      } as MappedTimelineItem
    }).filter(Boolean) as MappedTimelineItem[]
    
    // Group items by uniqueId
    const groupedMap = new Map<string | number, MappedTimelineItem[]>()
    
    mappedItems.forEach((item) => {
      const uniqueId = item.mapping.uniqueId || (item as any)[keys.uniqueIdKey || 'id'] || item.mapping.timelineIndex
      
      if (!groupedMap.has(uniqueId)) {
        groupedMap.set(uniqueId, [])
      }
      groupedMap.get(uniqueId)!.push(item)
    })
    
    // Convert grouped map to array of arrays
    const groupedItems: MappedTimelineItem[][] = []
    
    groupedMap.forEach((items) => {
      groupedItems.push(items) // Each sub-array contains items with the same unique ID
    })
    
    return groupedItems
  }