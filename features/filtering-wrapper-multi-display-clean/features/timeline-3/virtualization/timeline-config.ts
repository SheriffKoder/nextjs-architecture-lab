/**
 * Timeline Configuration Constants
 * 
 * Purpose: Centralized configuration for timeline behavior and performance settings
 * Used in: timeline-container.tsx, day-time-calculator.ts, timeline-row-day.tsx
 * Why: Makes performance tuning easy without changing multiple files
 * 
 * Configuration Index:
 * - MINUTE_GRANULARITY: Time precision for Day view cells (5, 15, or 30 minutes)
 * - CELLS_PER_HOUR: Calculated from MINUTE_GRANULARITY (60 / granularity)
 * - OVERSCAN_YEARS: Buffer years to render before/after visible range
 * - OVERSCAN_DAYS: Buffer days to render before/after visible range
 * 
 * Example usage:
 * import { MINUTE_GRANULARITY, CELLS_PER_HOUR } from './utils/timeline-config'
 * 
 * Steps:
 * 1. Define constants with default values
 * 2. Export for use across timeline components
 * 3. Document performance impact of each setting
 */

//////////////////////////////////
// Minute Granularity: Time precision for Day view
// Why configurable: Balance between precision and performance
//////////////////////////////////

/**
 * MINUTE_GRANULARITY
 * 
 * Purpose: Defines time slot precision in Day view
 * 
 * Options:
 * - 5 minutes: Highest precision, more DOM elements (current default)
 * - 15 minutes: Balanced precision, 67% fewer elements
 * - 30 minutes: Fastest performance, 83% fewer elements
 * 
 * Performance Impact:
 * - 5 min: Each day = 24 hours × 12 cells = 288 cells
 * - 15 min: Each day = 24 hours × 4 cells = 96 cells (67% reduction)
 * - 30 min: Each day = 24 hours × 2 cells = 48 cells (83% reduction)
 * 
 * Current Setting: 5 minutes
 * Note: Changing this requires updating drag/drop/resize handlers to match new granularity
 * TODO: When handlers are updated, consider changing to 15 for better performance
 */
export const MINUTE_GRANULARITY = 15 as 5 | 15 | 30

/**
 * CELLS_PER_HOUR
 * 
 * Purpose: Number of cells per hour (calculated from MINUTE_GRANULARITY)
 * 
 * Calculation: 60 / MINUTE_GRANULARITY
 * - 5 min → 12 cells per hour
 * - 15 min → 4 cells per hour
 * - 30 min → 2 cells per hour
 * 
 * Why calculated: Ensures consistency with MINUTE_GRANULARITY
 */
export const CELLS_PER_HOUR = 60 / MINUTE_GRANULARITY

/**
 * MINUTE_INTERVALS
 * 
 * Purpose: Array of minute values for each cell in an hour
 * 
 * Examples:
 * - 5 min: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
 * - 15 min: [0, 15, 30, 45]
 * - 30 min: [0, 30]
 * 
 * Why needed: Used for generating cell IDs and droppable zones
 */
export const MINUTE_INTERVALS = Array.from(
  { length: CELLS_PER_HOUR },
  (_, i) => i * MINUTE_GRANULARITY
)

//////////////////////////////////
// Overscan Configuration: Buffer zones for smooth scrolling
// Why configurable: Balance between smoothness and performance
//////////////////////////////////

/**
 * OVERSCAN_YEARS
 * 
 * Purpose: Number of years to render before/after visible range
 * 
 * Default: 1 year on each side
 * 
 * Performance Impact:
 * - 0: No buffer, possible pop-in during scroll
 * - 1: Smooth scrolling, prevents pop-in (recommended)
 * - 2+: Smoother but more DOM elements
 * 
 * Why 1: Handles timeline items spanning year boundaries
 */
export const OVERSCAN_YEARS = 0

/**
 * OVERSCAN_DAYS
 * 
 * Purpose: Number of days to render before/after visible range in Day view
 * 
 * Default: 3 days on each side (optimized from 7 in Phase 1)
 * 
 * Performance Impact:
 * - Viewport shows ~3 days
 * - With 3-day overscan: 9 days total
 * - Per row: 9 days × 288 cells = 2,592 cells
 * 
 * Previous (7 days):
 * - 17 days total
 * - Per row: 17 days × 288 cells = 4,896 cells
 * 
 * Improvement: ~47% reduction in Day view DOM elements
 * 
 * Why 3: Balances smooth scrolling with performance
 * Note: Still prevents pop-in during normal scroll speeds
 */
export const OVERSCAN_DAYS = 3

/**
 * OVERSCAN_ROWS
 * 
 * Purpose: Number of timeline rows to render before/after visible range (vertical virtualization)
 * 
 * Default: 5 rows on each side
 * 
 * Performance Impact:
 * - Typical viewport shows ~10-15 rows (depending on row height and viewport height)
 * - With 5-row overscan: 20-25 rows total rendered
 * - Example: 100 total rows → only 25 rendered = 75% reduction
 * 
 * Why 5: 
 * - Smooth vertical scrolling experience
 * - Prevents white flashes during scroll
 * - Handles drag/drop across row boundaries
 * - Balances performance with UX
 * 
 * Use case: Large datasets with 50+ timeline rows (tasks/projects)
 */
export const OVERSCAN_ROWS = 5

/**
 * MIN_ROWS
 * 
 * Purpose: Minimum number of rows to always display in timeline (even with no data)
 * 
 * Default: 10 rows
 * 
 * UX Impact:
 * - Prevents completely empty timeline when filtering results in zero matches
 * - Maintains visual consistency and prevents jarring empty state
 * - Provides visual feedback that timeline is functional
 * 
 * Behavior:
 * - If actual data rows < MIN_ROWS: Render dummy rows to fill up to MIN_ROWS
 * - If actual data rows >= MIN_ROWS: Only render actual data rows
 * - Dummy rows use same styling (weekends, borders, backgrounds) but show no data
 * - Dummy rows are NOT droppable and show no timeline items
 * 
 * Why 10:
 * - Provides sufficient visual presence without excessive empty space
 * - Works well with common viewport heights (60vh typically shows ~10-15 rows)
 * - Balances UX with performance (minimal overhead for empty rows)
 */
export const MIN_ROWS = 12

//////////////////////////////////
// Droppable Buffer Configuration: Limit droppable cells around task spans
// Why configurable: Major performance optimization - only useDroppable hook around tasks
//////////////////////////////////

/**
 * DROPPABLE_BUFFER_YEAR
 * 
 * Purpose: Number of cells before/after each task span to make droppable in Year view
 * 
 * Default: 50 cells on each side
 * 
 * Performance Impact:
 * - Without buffer: ~365 droppable cells per row (entire year)
 * - With buffer (50 each side): ~100-150 droppable cells per row (task + buffers)
 * - Reduction: 60-73% fewer useDroppable hooks
 * 
 * Why 50: 
 * - Year view has coarse granularity (1 cell = 1 day)
 * - Tasks typically span multiple days/weeks
 * - 50 days buffer allows comfortable drop zones around tasks
 * 
 * Optimization: Only cells within [taskStart - 50, taskEnd + 50] use useDroppable hook
 */
export const DROPPABLE_BUFFER_YEAR = 30

/**
 * DROPPABLE_BUFFER_MONTH
 * 
 * Purpose: Number of cells before/after each task span to make droppable in Month view
 * 
 * Default: 5 cells on each side
 * 
 * Performance Impact:
 * - Without buffer: ~365 droppable cells per row (entire year)
 * - With buffer (5 each side): ~10-20 droppable cells per row (task + buffers)
 * - Reduction: 94-97% fewer useDroppable hooks
 * 
 * Why 5:
 * - Month view has 1 cell = 1 day granularity
 * - 5 days buffer allows comfortable drop zones around tasks
 * - Significant performance gain with minimal UX impact
 */
export const DROPPABLE_BUFFER_MONTH = 30

/**
 * DROPPABLE_BUFFER_WEEK
 * 
 * Purpose: Number of cells before/after each task span to make droppable in Week view
 * 
 * Default: 5 cells on each side
 * 
 * Performance Impact:
 * - Without buffer: ~365 droppable cells per row (entire year)
 * - With buffer (5 each side): ~10-20 droppable cells per row (task + buffers)
 * - Reduction: 94-97% fewer useDroppable hooks
 * 
 * Why 5:
 * - Week view has 1 cell = 1 day granularity
 * - 5 days buffer allows comfortable drop zones around tasks
 */
  export const DROPPABLE_BUFFER_WEEK = 30

/**
 * DROPPABLE_BUFFER_DAY
 * 
 * Purpose: Number of cells before/after each task span to make droppable in Day view
 * 
 * Default: 5 cells on each side
 * 
 * Performance Impact:
 * - Without buffer: ~288 droppable cells per day (entire day)
 * - With buffer (5 each side): ~10-50 droppable cells per task area (task + buffers)
 * - Reduction: 83-96% fewer useDroppable hooks
 * 
 * Why 5:
 * - Day view has 1 cell = 5 minutes granularity
 * - 5 cells = 25 minutes buffer around tasks
 * - Allows comfortable drop zones without excessive hooks
 */
export const DROPPABLE_BUFFER_DAY = 20


//////////////////////////////////
// Export Summary: All configuration constants
//////////////////////////////////

export const TIMELINE_CONFIG = {
  // Time precision
  MINUTE_GRANULARITY,
  CELLS_PER_HOUR,
  MINUTE_INTERVALS,
  
  // Overscan buffers
  OVERSCAN_YEARS,
  OVERSCAN_DAYS,
  OVERSCAN_ROWS,
  MIN_ROWS,
  
  // Droppable buffers (performance optimization)
  DROPPABLE_BUFFER_YEAR,
  DROPPABLE_BUFFER_MONTH,
  DROPPABLE_BUFFER_WEEK,
  DROPPABLE_BUFFER_DAY,
} as const

/**
 * Future Configuration Options (Not Yet Implemented):
 * 
 * 1. Dynamic Overscan:
 *    - Adjust overscan based on scroll speed
 *    - More buffer when scrolling fast, less when idle
 * 
 * 2. Adaptive Granularity:
 *    - Switch to coarser granularity when zoomed out
 *    - Finer granularity when zoomed in
 * 
 * 3. Lazy Overscan Rendering:
 *    - Render visible portion first
 *    - Add overscan during idle time (requestIdleCallback)
 */

