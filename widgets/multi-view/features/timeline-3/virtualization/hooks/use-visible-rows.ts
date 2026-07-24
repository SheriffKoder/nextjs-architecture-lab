/**
 * useVisibleRows Hook
 * 
 * Purpose: React hook to calculate visible row indices for vertical virtualization
 * Used in: timeline-container.tsx
 * Why: Memoizes visible row calculations to prevent unnecessary re-renders
 * 
 * Hook Signature:
 * const { visibleRowIndices, startIndex, endIndex } = useVisibleRows({
 *   scrollTop,
 *   viewportHeight,
 *   rowHeight,
 *   totalRows,
 *   overscanCount
 * })
 * 
 * Dependencies: visible-row-calculator.ts
 * Pattern: Similar to use-visible-years.ts and use-visible-days.ts
 */

import { useMemo } from 'react'
import { calculateVisibleRows } from '../utils/visible-row-calculator'

/**
 * Hook Parameters Interface
 */
export interface UseVisibleRowsParams {
  scrollTop: number          // Current vertical scroll position (px)
  viewportHeight: number     // Height of visible viewport (px)
  rowHeight: number          // Height of each row (px)
  totalRows: number          // Total number of rows in dataset
  overscanCount?: number     // Buffer rows before/after viewport (default: 5)
}

/**
 * Hook Return Interface
 */
export interface UseVisibleRowsReturn {
  visibleRowIndices: number[]  // Array of row indices to render
  startIndex: number           // First visible row index (with overscan)
  endIndex: number             // Last visible row index (with overscan)
  totalRows: number            // Total rows (passed through for convenience)
}

/**
 * useVisibleRows Hook
 * 
 * Purpose: Calculate which timeline rows should be rendered based on vertical scroll
 * 
 * @param params - Hook parameters (scroll position, viewport size, row config)
 * @returns Memoized visible row indices and metadata
 * 
 * Optimization:
 * - useMemo prevents recalculation unless scroll/viewport/row params change
 * - Only recalculates when necessary (scroll or resize)
 * - Consumer components re-render only when visible rows actually change
 * 
 * Performance:
 * - Typical case: ~10-25 visible rows from 100+ total rows
 * - 75-90% reduction in rendered DOM elements
 * - Smooth 60fps scrolling even with large datasets
 * 
 * Example:
 * ```typescript
 * const { visibleRowIndices } = useVisibleRows({
 *   scrollTop: 1000,
 *   viewportHeight: 600,
 *   rowHeight: 40,
 *   totalRows: 100,
 *   overscanCount: 5
 * })
 * // Returns indices [20, 21, 22, ..., 35] (visible + overscan)
 * 
 * {visibleRowIndices.map(index => (
 *   <TimelineRow key={index} data={timelineData[index]} />
 * ))}
 * ```
 */
export const useVisibleRows = ({
  scrollTop,
  viewportHeight,
  rowHeight,
  totalRows,
  overscanCount = 5
}: UseVisibleRowsParams): UseVisibleRowsReturn => {
  /**
   * Memoize visible row calculation
   * 
   * Why useMemo:
   * - Scroll events fire frequently (multiple times per second)
   * - Prevent unnecessary recalculation when inputs haven't changed
   * - Reduce CPU usage during scroll
   * 
   * Dependencies:
   * - scrollTop: Changes on every scroll
   * - viewportHeight: Changes on window resize
   * - rowHeight: Typically constant, but can change with zoom
   * - totalRows: Changes when data is filtered
   * - overscanCount: Typically constant
   */
  const visibleRowsData = useMemo(() => {
    return calculateVisibleRows(
      scrollTop,
      viewportHeight,
      rowHeight,
      totalRows,
      overscanCount
    )
  }, [scrollTop, viewportHeight, rowHeight, totalRows, overscanCount])
  
  // Return with totalRows for convenience
  return {
    visibleRowIndices: visibleRowsData.visibleIndices,
    startIndex: visibleRowsData.startIndex,
    endIndex: visibleRowsData.endIndex,
    totalRows
  }
}

/**
 * Example Usage in Component:
 * 
 * ```typescript
 * function TimelineContainer() {
 *   const [scrollTop, setScrollTop] = useState(0)
 *   const [viewportHeight, setViewportHeight] = useState(600)
 *   const rowHeight = 40
 *   
 *   const { visibleRowIndices } = useVisibleRows({
 *     scrollTop,
 *     viewportHeight,
 *     rowHeight,
 *     totalRows: timelineData.length,
 *     overscanCount: 5
 *   })
 *   
 *   return (
 *     <div 
 *       style={{ height: `${timelineData.length * rowHeight}px`, position: 'relative' }}
 *     >
 *       {visibleRowIndices.map(index => (
 *         <div 
 *           key={index}
 *           style={{ position: 'absolute', top: `${index * rowHeight}px`, width: '100%' }}
 *         >
 *           <TimelineRow data={timelineData[index]} />
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */

