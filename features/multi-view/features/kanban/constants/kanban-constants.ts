/**
 * Kanban Constants
 * 
 * Purpose: Default values and configuration constants for Kanban component
 * Used in: All Kanban component files
 * Why: Centralizes magic numbers and default values for maintainability
 * 
 * Constant Index:
 * - DEFAULT_CARD_MIN_HEIGHT: Minimum height for card in pixels
 * - DEFAULT_COLUMN_WIDTH: Default width for each column
 * - DEFAULT_GAP: Spacing between cards and columns
 * - DEFAULT_MIN_CARDS: Minimum rows to display
 * - DROP_INDICATOR_HEIGHT: Height of drop indicator line
 */

//////////////////////////////////
// Layout Constants
//////////////////////////////////

/**
 * Minimum height for a card in pixels
 * Ensures cards are readable and clickable
 */
export const DEFAULT_CARD_MIN_HEIGHT = 100

/**
 * Default width for each column in pixels
 * Used when explicit column widths are not provided
 */
export const DEFAULT_COLUMN_WIDTH = 280

/**
 * Gap between cards and columns in pixels
 * Provides visual separation
 */
export const DEFAULT_GAP = 12

/**
 * Minimum number of rows to display per column
 * Ensures consistent column heights
 */
export const DEFAULT_MIN_CARDS = 1

//////////////////////////////////
// Drag and Drop Constants
//////////////////////////////////

/**
 * Height of the drop indicator in pixels
 * Shows where card will be inserted during drag
 * Should match card height for proper visual feedback
 */
export const DROP_INDICATOR_HEIGHT = DEFAULT_CARD_MIN_HEIGHT

/**
 * Activation distance in pixels before drag starts
 * Prevents accidental drags on click
 */
export const DRAG_ACTIVATION_DISTANCE = 8

//////////////////////////////////
// Animation Constants
//////////////////////////////////

/**
 * Transition duration for animations in milliseconds
 */
export const TRANSITION_DURATION = 200

//////////////////////////////////
// Z-Index Constants
//////////////////////////////////

/**
 * Z-index for dragging cards
 * Ensures dragged card appears above other elements
 */
export const DRAG_Z_INDEX = 1000

/**
 * Z-index for drop indicators
 * Should be below dragged cards but above normal cards
 */
export const DROP_INDICATOR_Z_INDEX = 100

//////////////////////////////////
// Drop Zone Behavior Constants
//////////////////////////////////

/**
 * Whether to show bottom drop zones in all columns during drag
 * When true, displays drop zones at the bottom of all columns (except source column if item is last)
 * These zones are visible but only become active when hovered
 */
export const SHOW_BOTTOM_DROP_ZONES = true

