/**
 * Visible Row Calculator Utility
 * 
 * Purpose: Calculate which timeline rows should be rendered based on vertical scroll position
 * Used in: use-visible-rows.ts hook
 * Why: Vertical virtualization - only render rows visible in viewport (with overscan buffer)
 * 
 * Function Index:
 * - calculateVisibleRows: Main function to determine visible row indices
 * 
 * Example Usage:
 * const { visibleIndices, startIndex, endIndex } = calculateVisibleRows(
 *   scrollTop: 500,
 *   viewportHeight: 600,
 *   rowHeight: 40,
 *   totalRows: 100,
 *   overscan: 5
 * )
 * // Returns: visibleIndices = [7, 8, 9, ..., 27] (start-5 to end+5)
 * 
 * Steps:
 * 1. Calculate which row indices are in viewport
 * 2. Add overscan buffer (rows before and after)
 * 3. Clamp to valid range [0, totalRows-1]
 * 4. Return array of indices to render
 */

/**
 * Row Position Interface
 * 
 * Purpose: Store position metadata for a timeline row
 * Why: Track where each row should be positioned absolutely
 */
export interface RowPosition {
  index: number         // Row index (0-based)
  topOffset: number     // Pixels from top of container
  height: number        // Row height in pixels
}

/**
 * Calculate Visible Rows
 * 
 * Purpose: Determine which row indices should be rendered based on scroll position
 * 
 * @param scrollTop - Current vertical scroll position in pixels
 * @param viewportHeight - Height of visible viewport in pixels
 * @param rowHeight - Height of each row in pixels (uniform)
 * @param totalRows - Total number of rows in dataset
 * @param overscanCount - Number of extra rows to render before/after viewport (default: 5)
 * @returns Object with startIndex, endIndex, and visibleIndices array
 * 
 * Algorithm:
 * 1. Find first visible row: Math.floor(scrollTop / rowHeight)
 * 2. Find last visible row: Math.ceil((scrollTop + viewportHeight) / rowHeight)
 * 3. Expand range by overscan: start - overscan, end + overscan
 * 4. Clamp to [0, totalRows-1]
 * 5. Generate array of indices in range
 * 
 * Performance:
 * - O(1) for calculations
 * - O(n) for array generation where n = number of visible rows (typically 10-25)
 * - Runs on every scroll event (throttled in consuming component)
 */
export const calculateVisibleRows = (
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  totalRows: number,
  overscanCount: number = 5
): {
  startIndex: number
  endIndex: number
  visibleIndices: number[]
} => {
  // Handle edge cases
  if (totalRows === 0 || rowHeight <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      visibleIndices: []
    }
  }
  
  // Calculate viewport boundaries in row indices
  const viewportStart = scrollTop
  const viewportEnd = scrollTop + viewportHeight
  
  // Find first and last visible rows (without overscan)
  const firstVisibleRow = Math.floor(viewportStart / rowHeight)
  const lastVisibleRow = Math.ceil(viewportEnd / rowHeight)
  
  // Add overscan buffer
  const startWithOverscan = Math.max(0, firstVisibleRow - overscanCount)
  const endWithOverscan = Math.min(totalRows - 1, lastVisibleRow + overscanCount)
  
  // Generate array of indices
  const visibleIndices: number[] = []
  for (let i = startWithOverscan; i <= endWithOverscan; i++) {
    visibleIndices.push(i)
  }
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Calculate Visible Rows:', {
      scrollTop,
      viewportHeight,
      rowHeight,
      totalRows,
      overscanCount,
      firstVisibleRow,
      lastVisibleRow,
      startWithOverscan,
      endWithOverscan,
      visibleCount: visibleIndices.length
    })
  }
  
  return {
    startIndex: startWithOverscan,
    endIndex: endWithOverscan,
    visibleIndices
  }
}

/**
 * Calculate Row Positions
 * 
 * Purpose: Calculate absolute positioning for all rows
 * 
 * @param totalRows - Total number of rows
 * @param rowHeight - Height of each row in pixels
 * @returns Map of row index to RowPosition
 * 
 * Why: Used for absolute positioning of virtualized rows
 * Performance: O(n) where n = totalRows, but cached in consuming component
 */
export const calculateRowPositions = (
  totalRows: number,
  rowHeight: number
): Map<number, RowPosition> => {
  const positions = new Map<number, RowPosition>()
  
  for (let i = 0; i < totalRows; i++) {
    positions.set(i, {
      index: i,
      topOffset: i * rowHeight,
      height: rowHeight
    })
  }
  
  return positions
}

/**
 * Get Total Container Height
 * 
 * Purpose: Calculate total height needed for scroll container
 * 
 * @param totalRows - Total number of rows
 * @param rowHeight - Height of each row in pixels
 * @returns Total height in pixels
 * 
 * Why: Sets height of inner container to enable scrolling
 */
export const getTotalContainerHeight = (
  totalRows: number,
  rowHeight: number
): number => {
  return totalRows * rowHeight
}

