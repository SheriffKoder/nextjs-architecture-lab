/**
 * Table Item Type Definitions
 * 
 * Purpose: Defines TypeScript interfaces for table data structure
 * Used in: Virtualized table components and data generation
 * Why: Provides type safety for table data and ensures consistent data structure
 * 
 * Steps:
 * 1. Define TableItem interface with all required properties
 * 2. Export for use in hooks, constants, and components
 */

/**
 * Interface defining the structure of table items for virtualized table demonstration
 * Represents a sample data item with various data types for testing table functionality
 * 
 * @example
 * ```tsx
 * const tableItem: TableItem = {
 *   id: "ID-00001",
 *   name: "Item 1",
 *   amount: 123.45,
 *   date: "12/25/2023",
 *   time: "14:30:25",
 *   status: "active"
 * };
 * ```
 */
export interface TableItem {
  // Unique identifier for the item (formatted with zero-padding)
  id: string;
  // Human-readable name for the item
  name: string;
  // Numeric amount value for currency formatting demonstration
  amount: number;
  // Date string in MM/DD/YYYY format for date filtering
  date: string;
  // Date picker field for custom date filtering (YYYY-MM-DD format)
  datepicker: string;
  // Time string in HH:MM:SS format for time filtering
  time: string;
  // Status value for categorical filtering demonstration
  status: string;
} 