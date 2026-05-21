/**
 * LoadingRows Component (subheadings)
 *
 * Purpose: Shimmer skeleton that mirrors grouped subheadings layout:
 *   [chevron-ish shimmer] [label shimmer] [count shimmer]  ← group row
 *   [cell] [cell] [cell] [cell] [cell]                     ← one data row (5 shimmers)
 * Used in: SubHeadingsContainer when loading + loadingStateShimmer
 */

import React from "react";
import { TableColumn } from "../../types/table-column";

/** Shimmers in the faux data row (not tied to real column count). */
const DATA_ROW_SHIMMER_COUNT = 5;

interface LoadingRowsProps<T = any> {
  columns: TableColumn<T>[];
  rowHeight: number;
  containerHeight: number;
  showActions?: boolean;
  actionMode?: "inline" | "dropdown";
}

/** Matches subheadings group header: `py-3` + chevron row (~48px). */
const GROUP_HEADER_SHIMMER_HEIGHT_PX = 48;

export function LoadingRows<T = any>(props: LoadingRowsProps<T>) {
  const { rowHeight, containerHeight } = props;
  const blockHeight = GROUP_HEADER_SHIMMER_HEIGHT_PX + rowHeight;
  const repeatCount = Math.min(
    10,
    Math.max(1, Math.ceil(containerHeight / blockHeight))
  );

  const renderGroupHeaderShimmer = (key: string | number) => (
    <div
      key={`g-${key}`}
      className="flex w-full cursor-default items-center justify-between border-b border-tertiary/10 px-0 py-3"
      style={{ minHeight: GROUP_HEADER_SHIMMER_HEIGHT_PX }}
    >
      <div className="flex items-center gap-2">
        {/* <div
          className="h-4 w-4 shrink-0 rounded-sm bg-foreground/15 shimmer"
          aria-hidden
        /> */}
        <div
          className="h-4 w-40 max-w-[45%] rounded-[3px] bg-foreground/15 shimmer sm:w-48"
          aria-hidden
        />
        {/* <div
          className="h-3 w-10 rounded-[3px] bg-foreground/10 shimmer"
          aria-hidden
        /> */}
      </div>
    </div>
  );

  const renderDataRowFiveShimmers = (key: string | number, index: number) => (
    <div
      key={`r-${key}-${index}`}
      className="flex w-full items-center border-b border-border"
      style={{ height: rowHeight }}
    >
      {Array.from({ length: DATA_ROW_SHIMMER_COUNT }, (_, i) => (
        <div
          key={i}
          className="flex min-w-0 flex-1 items-center px-3 py-2"
        >
          <div
            className={`h-4 max-w-full rounded-[3px] bg-foreground/15 shimmer ${
              i % 3 === 0 ? "w-4/5" : i % 3 === 1 ? "w-3/5" : "w-11/12"
            }`}
            aria-hidden
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full w-full">
      {Array.from({ length: repeatCount }, (_, i) => (
        <React.Fragment key={i}>
          {renderGroupHeaderShimmer(i)}
          {renderDataRowFiveShimmers(5, 0)}
          {renderDataRowFiveShimmers(5, 1)}
          {renderDataRowFiveShimmers(5, 2)}


        </React.Fragment>
      ))}
    </div>
  );
}

export default React.memo(LoadingRows);
