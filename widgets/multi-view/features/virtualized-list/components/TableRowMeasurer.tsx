/**
 * TableRowMeasurer Component
 *
 * Purpose: Measures the height of table rows for dynamic sizing
 * Used in: `virtualized-list-container` when `effectiveDynamicRowHeight` is true
 * Why: Separates measurement concerns and provides accurate DOM-based height calculation
 *
 * Performance:
 * - Renders at most `ROW_HEIGHT_MEASURE_SAMPLE_SIZE` rows off-screen (not the full dataset).
 * - Skips `onHeightCalculated` when the measured height has not changed.
 * - Passes `actionConfigs` factory through to rows (same wiring as the main table).
 *
 * Steps:
 * 1. Render a bounded sample of rows in a hidden container
 * 2. Measure the maximum height among sample rows
 * 3. Notify parent component of the calculated height
 */

import React, { useRef, useEffect, useMemo } from "react";
import { ROW_HEIGHT_MEASURE_SAMPLE_SIZE } from "../../../constants/virtualization";
import { TableColumn } from "../types/table-column";
import { VirtualizedTableRow } from "./rows/table-row";

////////////////////////////////////
// Type Definitions: Component props and interfaces
////////////////////////////////////

/**
 * Props for the TableRowMeasurer component
 */
interface TableRowMeasurerProps<T> {
  // Data array to measure
  data: T[];
  // Column definitions for table structure
  columns: TableColumn<T>[];
  // Callback to notify parent of calculated height
  onHeightCalculated: (height: number) => void;
  // Optional row click handler (for consistency with main table)
  onRowClick?: (row: T) => void;
  onRowPointerEnter?: (row: T) => void;
  // Optional action click handler (for consistency with main table)
  onActionClick?: (action: string, row: T) => void;
  // Action mode for consistency
  actionMode?: "inline" | "dropdown";
  // Action config factory for consistency (not pre-built arrays)
  actionConfigs?: (row: T) => any[];
  // Global search text for consistency
  globalSearchText?: string;
  // Minimum row height in pixels (defaults to 40)
  minRowHeight?: number;
}

////////////////////////////////////
// Component Implementation: Row height measurement
////////////////////////////////////

/**
 * Component that measures table row heights by rendering them invisibly
 * Uses actual DOM rendering to get accurate height measurements
 *
 * @template T - The type of data items in the table
 * @param {TableRowMeasurerProps<T>} props - Component props
 * @returns {JSX.Element} Hidden measurement container
 *
 * @example
 * ```tsx
 * <TableRowMeasurer
 *   data={measureData}
 *   columns={columns}
 *   onHeightCalculated={setCalculatedRowHeight}
 * />
 * ```
 */
export function TableRowMeasurer<T>({
  data,
  columns,
  onHeightCalculated,
  onRowClick,
  onRowPointerEnter,
  onActionClick,
  actionMode = "inline",
  actionConfigs,
  globalSearchText,
  minRowHeight = 40,
}: TableRowMeasurerProps<T>) {
  ////////////////////////////////////
  // Refs: Container reference for height measurement
  ////////////////////////////////////

  // Reference to the measurement container
  const measureRef = useRef<HTMLDivElement>(null);
  // Last reported height — avoids redundant parent updates
  const lastHeightRef = useRef<number | null>(null);

  ////////////////////////////////////
  // Sample data: cap off-screen render count (C1)
  ////////////////////////////////////

  const sampleData = useMemo(
    () => data.slice(0, ROW_HEIGHT_MEASURE_SAMPLE_SIZE),
    [data],
  );

  ////////////////////////////////////
  // Height Measurement: Calculate maximum row height
  ////////////////////////////////////

  /**
   * Measure the height of sample rows and find the maximum.
   * Height is an estimate for dynamic mode on large sets; parent may fall back
   * to fixed height when row count exceeds the sample cap.
   */
  useEffect(() => {
    if (measureRef.current && sampleData.length > 0) {
      // Use a small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        // Get all row elements
        const rowElements =
          measureRef.current?.querySelectorAll("[data-measure-row]");

        if (!rowElements || rowElements.length === 0) return;

        let maxHeight = 0;

        // Find the maximum height among sample rows
        rowElements.forEach((rowElement) => {
          const height = rowElement.getBoundingClientRect().height;
          maxHeight = Math.max(maxHeight, height);
        });

        // Ensure minimum height (configurable via minRowHeight prop)
        const finalHeight = Math.max(maxHeight, minRowHeight);

        // Only update if height has changed to avoid unnecessary re-renders
        if (finalHeight !== lastHeightRef.current) {
          lastHeightRef.current = finalHeight;
          onHeightCalculated(finalHeight);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [sampleData, columns, onHeightCalculated, minRowHeight]);

  ////////////////////////////////////
  // Main Render: Hidden measurement container
  ////////////////////////////////////

  return (
    <div
      ref={measureRef}
      className="invisible absolute -top-[9999px] left-0"
      style={{
        visibility: "hidden",
        position: "absolute",
        top: "-9999px",
        left: 0,
        width: "100%",
        minWidth: "1200px", // Ensure minimum width for proper text wrapping
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      {/* Render sample rows for measurement */}
      {sampleData.map((item, index) => (
        <div key={index} data-measure-row>
          <VirtualizedTableRow
            item={item}
            columns={columns}
            onRowClick={onRowClick}
            onRowPointerEnter={onRowPointerEnter}
            style={{}} // Empty style for measurement
            isLastRow={index === sampleData.length - 1}
            onActionClick={onActionClick}
            actionMode={actionMode}
            actionConfigs={actionConfigs}
            globalSearchText={globalSearchText}
          />
        </div>
      ))}
    </div>
  );
}

// Export default for convenience
export default TableRowMeasurer;
