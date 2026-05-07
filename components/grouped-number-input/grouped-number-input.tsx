"use client";

/*
 * Grouped number input — GroupedNumberInput component
 *
 * Purpose: Ready-made `<input type="text">` with grouped-number typing behavior and `forwardRef` for blur/commit patterns.
 * Used in: app routes, forms, anywhere a standalone grouped field is needed outside virtualized tables
 * Used for: Parent passes numeric `value` + `groupedNumber` config; optional `onBlur` + `commitGroupedNumberInput` to persist.
 *
 * Function Index:
 * GroupedNumberInput: React.forwardRef HTMLInputElement
 * Example: value={1234.5} groupedNumber={{ prefix: "$", allowDecimals: true, ... }}
 *
 * Steps:
 * 1. Call `useGroupedNumberInput` with variant "grouped".
 * 2. Render controlled input: text, inputMode from decimals flag, spread rest props (className, onBlur, aria-*).
 */

import React, { forwardRef } from "react";
import type { EditableGroupedNumberConfig } from "@/utils/number-formatters/format-grouped-number";
import { useGroupedNumberInput } from "./use-grouped-number-input";

export type GroupedNumberInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange" | "inputMode"
> & {
  /** Numeric (or coercible) value owned by the parent. */
  value: unknown;
  groupedNumber: EditableGroupedNumberConfig;
};

export const GroupedNumberInput = forwardRef<
  HTMLInputElement,
  GroupedNumberInputProps
>(function GroupedNumberInput(
  { value, groupedNumber, className, ...rest },
  ref,
) {
  const { inputValue, onChange } = useGroupedNumberInput({
    value,
    variant: "grouped",
    groupedNumber,
  });

  return (
    <input
      ref={ref}
      type="text"
      inputMode={groupedNumber.allowDecimals ? "decimal" : "numeric"}
      autoComplete="off"
      value={inputValue}
      onChange={onChange}
      className={className}
      {...rest}
    />
  );
});
