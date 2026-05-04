/**
 * Timeline Data Filtering Utilities
 * 
 * Purpose: Filter timeline data based on visible date range (horizontal virtualization)
 * Used in: timeline-container.tsx
 * Why: Only process and render timeline items that overlap with visible years/months/days
 * 
 * Function Index:
 * - filterDataByYear: Year view - filter by visible years
 * - filterDataByMonth: Month/Week view - filter by visible months
 * - filterDataByDay: Day view - filter by visible days
 * - getVisibleMonths: Extract visible months from visible years based on scroll position
 * 
 * Performance Impact:
 * - Before: Process all 100 rows regardless of visible date range
 * - After: Process only ~20-40 rows that overlap with visible dates
 * - Result: 60-80% reduction in processed data
 */

import { MappedTimelineItem, MappingKeys } from '../mapping/timeline-mapping'
import { YearPosition } from '../../virtualization/context/visible-range-context'

/**
 * Filter Data by Year (Year View)
 * 
 * Purpose: Show only timeline items whose dates overlap with ANY visible year
 * 
 * @param data - Mapped timeline data (array of arrays grouped by unique ID)
 * @param visibleYears - Array of years currently visible in viewport
 * @param mappingKeys - Keys to access start/end date fields
 * @returns Filtered data containing only items that overlap visible years
 * 
 * Logic:
 * - Item is visible if: (itemStartYear <= lastVisibleYear) AND (itemEndYear >= firstVisibleYear)
 * - Example: Item spans 2024-05 to 2025-08, visible years are [2024, 2025] → VISIBLE
 * - Example: Item spans 2023-01 to 2023-12, visible years are [2024, 2025] → HIDDEN
 * 
 * Performance:
 * - O(n) where n = total number of item groups
 * - Typical: 100 items → 60 items visible (when 3 years visible out of 6 total)
 */
export const filterDataByYear = (
  data: MappedTimelineItem[][],
  visibleYears: number[],
  mappingKeys: MappingKeys
): MappedTimelineItem[][] => {
  if (visibleYears.length === 0) return []
  
  const firstVisibleYear = Math.min(...visibleYears)
  const lastVisibleYear = Math.max(...visibleYears)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📅 Visible Years:', visibleYears.sort((a, b) => a - b).join(', '))
  }
  
  return data.filter(itemGroup => {
    // Check if ANY item in the group overlaps with visible years
    return itemGroup.some(item => {
      const startDate = new Date(item.mapping.startDate)
      const endDate = new Date(item.mapping.endDate)
      
      const itemStartYear = startDate.getFullYear()
      const itemEndYear = endDate.getFullYear()
      
      // Item overlaps if it starts before/during visible range AND ends during/after visible range
      return itemEndYear >= firstVisibleYear && itemStartYear <= lastVisibleYear
    })
  })
}

/**
 * Filter Data by Month (Month/Week View)
 * 
 * Purpose: Show only timeline items whose dates overlap with ANY visible month
 * 
 * @param data - Mapped timeline data (array of arrays grouped by unique ID)
 * @param visibleYears - Array of years currently visible in viewport
 * @param scrollOffset - Current horizontal scroll position
 * @param yearPositions - Map of year positions (startX, width)
 * @param mappingKeys - Keys to access start/end date fields
 * @returns Filtered data containing only items that overlap visible months
 * 
 * Logic:
 * - Determine which months are visible based on scroll position within visible years
 * - Item is visible if it overlaps with any visible month
 * - More precise than year-level filtering
 * 
 * Example:
 * - Visible range: May 2024 - August 2024
 * - Item A (2024-06-01 to 2024-07-15): VISIBLE (overlaps June, July)
 * - Item B (2024-01-01 to 2024-04-30): HIDDEN (no overlap with May-Aug)
 * - Item C (2024-12-01 to 2024-12-31): HIDDEN (no overlap with May-Aug)
 * 
 * Performance:
 * - O(n × m) where n = items, m = visible months (typically 3-6)
 * - Typical: 100 items → 20-40 items visible
 */
export const filterDataByMonth = (
  data: MappedTimelineItem[][],
  visibleYears: number[],
  scrollOffset: number,
  yearPositions: Map<number, YearPosition>,
  mappingKeys: MappingKeys,
  viewportWidth: number
): MappedTimelineItem[][] => {
  if (visibleYears.length === 0) return []
  
  // Get visible months based on scroll position
  const visibleMonths = getVisibleMonths(visibleYears, yearPositions, scrollOffset, viewportWidth)
  
  if (visibleMonths.length === 0) {
    // Fallback to year-level filtering if month calculation fails
    return filterDataByYear(data, visibleYears, mappingKeys)
  }
  
  return data.filter(itemGroup => {
    // Check if ANY item in the group overlaps with visible months
    return itemGroup.some(item => {
      const startDate = new Date(item.mapping.startDate)
      const endDate = new Date(item.mapping.endDate)
      
      // Check if item overlaps with any visible month
      return visibleMonths.some(visibleMonth => {
        const monthStart = new Date(visibleMonth.year, visibleMonth.month, 1)
        const monthEnd = new Date(visibleMonth.year, visibleMonth.month + 1, 0, 23, 59, 59, 999)
        
        // Item overlaps month if: item starts before month ends AND item ends after month starts
        return startDate <= monthEnd && endDate >= monthStart
      })
    })
  })
}

/**
 * Filter Data by Day (Day View)
 * 
 * Purpose: Show only timeline items whose dates overlap with ANY visible day
 * 
 * @param data - Mapped timeline data (array of arrays grouped by unique ID)
 * @param visibleDays - Array of Date objects currently visible in viewport
 * @param mappingKeys - Keys to access start/end date fields
 * @returns Filtered data containing only items that overlap visible days
 * 
 * Logic:
 * - Item is visible if it overlaps with any visible day
 * - Most precise filtering (day-level granularity)
 * 
 * Example:
 * - Visible range: May 1-3, 2024
 * - Item A (2024-05-01 10:00 to 2024-05-02 14:00): VISIBLE
 * - Item B (2024-05-05 09:00 to 2024-05-06 17:00): HIDDEN
 * 
 * Performance:
 * - O(n × d) where n = items, d = visible days (typically 5-10 with overscan)
 * - Typical: 100 items → 10-20 items visible
 */
export const filterDataByDay = (
  data: MappedTimelineItem[][],
  visibleDays: Date[],
  mappingKeys: MappingKeys
): MappedTimelineItem[][] => {
  if (visibleDays.length === 0) return []
  
  // Normalize visible days to day boundaries
  const normalizedVisibleDays = visibleDays.map(day => {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    return d
  })
  
  if (process.env.NODE_ENV === 'development') {
    const sortedDays = [...normalizedVisibleDays].sort((a, b) => a.getTime() - b.getTime())
    const dayStrings = sortedDays.map(d => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })
    const firstDay = dayStrings[0]
    const lastDay = dayStrings[dayStrings.length - 1]
    const rangeStr = firstDay === lastDay ? firstDay : `${firstDay} to ${lastDay} (${dayStrings.length} days)`
    console.log('📅 Visible Days:', rangeStr)
    if (dayStrings.length <= 10) {
      console.log('   All days:', dayStrings.join(', '))
    } else {
      console.log('   First 5:', dayStrings.slice(0, 5).join(', '), '...', 'Last 5:', dayStrings.slice(-5).join(', '))
    }
  }
  
  return data.filter(itemGroup => {
    // Check if ANY item in the group overlaps with visible days
    return itemGroup.some(item => {
      const startDate = new Date(item.mapping.startDate)
      const endDate = new Date(item.mapping.endDate)
      
      // Normalize to day boundaries
      const itemStart = new Date(startDate)
      itemStart.setHours(0, 0, 0, 0)
      const itemEnd = new Date(endDate)
      itemEnd.setHours(23, 59, 59, 999)
      
      // Check if item overlaps with any visible day
      return normalizedVisibleDays.some(visibleDay => {
        const dayEnd = new Date(visibleDay)
        dayEnd.setHours(23, 59, 59, 999)
        
        // Item overlaps day if: item starts before day ends AND item ends after day starts
        return itemStart <= dayEnd && itemEnd >= visibleDay
      })
    })
  })
}

/**
 * Get Visible Months
 * 
 * Purpose: Determine which months are actually visible within visible years based on scroll position
 * 
 * @param visibleYears - Array of years currently visible
 * @param yearPositions - Map of year positions (startX, width)
 * @param scrollOffset - Current horizontal scroll position
 * @param viewportWidth - Visible viewport width
 * @returns Array of {year, month} objects representing visible months
 * 
 * Algorithm:
 * 1. For each visible year, determine if any of its months are in viewport
 * 2. Approximate month positions (year width / 12)
 * 3. Check if month's x-range overlaps viewport x-range
 * 
 * Note: This is an approximation - actual month widths vary in Month/Week view
 * For precise filtering, we accept some over-rendering (better than under-rendering)
 */
export const getVisibleMonths = (
  visibleYears: number[],
  yearPositions: Map<number, YearPosition>,
  scrollOffset: number,
  viewportWidth: number
): Array<{ year: number; month: number }> => {
  const visibleMonths: Array<{ year: number; month: number }> = []
  
  // Add a small buffer to catch edge months (10% of month width)
  const buffer = viewportWidth > 0 ? (viewportWidth / 12) * 0.1 : 0
  const viewportStart = scrollOffset - buffer
  const viewportEnd = scrollOffset + viewportWidth + buffer
  
  if (process.env.NODE_ENV === 'development') {
    console.log('   Viewport calculation:', {
      scrollOffset,
      viewportWidth,
      viewportStart,
      viewportEnd,
      buffer
    })
  }
  
  visibleYears.forEach(year => {
    const yearPos = yearPositions.get(year)
    if (!yearPos) return
    
    // Approximate: each month takes 1/12 of year width
    const monthWidth = yearPos.width / 12
    
    for (let month = 0; month < 12; month++) {
      const monthStart = yearPos.startX + (month * monthWidth)
      const monthEnd = monthStart + monthWidth
      
      // Month is visible if it overlaps viewport (with buffer for edge cases)
      const isVisible = monthEnd >= viewportStart && monthStart <= viewportEnd
      
      if (isVisible) {
        visibleMonths.push({ year, month })
      }
    }
  })
  
  // Sort by year then month
  visibleMonths.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })
  
  if (process.env.NODE_ENV === 'development') {
    const monthStrings = visibleMonths.map(m => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[m.month]} ${m.year}`
    })
    console.log('📅 Visible Months:', visibleMonths.length, 'months')
    if (monthStrings.length <= 12) {
      console.log('   All months:', monthStrings.join(', '))
    } else {
      console.log('   First 6:', monthStrings.slice(0, 6).join(', '), '...')
      console.log('   Last 6:', monthStrings.slice(-6).join(', '))
    }
    // Also show date range
    if (visibleMonths.length > 0) {
      const firstMonth = visibleMonths[0]
      const lastMonth = visibleMonths[visibleMonths.length - 1]
      const firstDate = new Date(firstMonth.year, firstMonth.month, 1)
      const lastDate = new Date(lastMonth.year, lastMonth.month + 1, 0)
      const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      console.log('   Range:', fmt(firstDate), 'to', fmt(lastDate))
    }
  }
  
  return visibleMonths
}

/**
 * Get Most Visible Year
 * 
 * Purpose: Determine which year occupies most of the viewport (center year)
 * 
 * @param visibleYears - Array of years currently visible
 * @param yearPositions - Map of year positions
 * @param scrollOffset - Current horizontal scroll position
 * @param viewportWidth - Visible viewport width
 * @returns Year number that is most visible
 * 
 * Use case: When filtering needs to prioritize one year (e.g., for header highlights)
 */
export const getMostVisibleYear = (
  visibleYears: number[],
  yearPositions: Map<number, YearPosition>,
  scrollOffset: number,
  viewportWidth: number
): number | null => {
  if (visibleYears.length === 0) return null
  if (visibleYears.length === 1) return visibleYears[0]
  
  const viewportCenter = scrollOffset + (viewportWidth / 2)
  
  let closestYear: number | null = null
  let closestDistance = Infinity
  
  visibleYears.forEach(year => {
    const yearPos = yearPositions.get(year)
    if (!yearPos) return
    
    const yearCenter = yearPos.startX + (yearPos.width / 2)
    const distance = Math.abs(yearCenter - viewportCenter)
    
    if (distance < closestDistance) {
      closestDistance = distance
      closestYear = year
    }
  })
  
  return closestYear
}

/**
 * Get Most Visible Day
 * 
 * Purpose: Determine which day occupies most of the viewport (center day)
 * 
 * @param visibleDays - Array of days currently visible
 * @returns Date object for most visible day
 * 
 * Use case: When filtering needs to prioritize one day (e.g., for navigation)
 */
export const getMostVisibleDay = (
  visibleDays: Date[]
): Date | null => {
  if (visibleDays.length === 0) return null
  
  // Return the middle day
  const middleIndex = Math.floor(visibleDays.length / 2)
  return visibleDays[middleIndex]
}

