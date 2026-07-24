"use client";

/*
 * Grouped number input — useGroupedNumberInput hook
 *
 * Purpose: Hold controlled display string (`inputValue`) synced from parent `value` for text / plain / grouped editing.
 * Used in: components/grouped-number-input/grouped-number-input.tsx, features filter-wrapper editable-cell.tsx
 * Used for: Same typing rules as tables while parent keeps the canonical number or string.
 *
 * Function Index:
 * useGroupedNumberInput(options): { inputValue, onChange, setInputValue, resetInput }
 * initialText (internal): maps value + variant to initial string
 * Example: variant "grouped", value 1000, config { prefix: "$" } → inputValue like "$1,000.00" per options
 *
 * Steps:
 * 1. Initialize state from `initialText(value, variant, groupedNumber)`.
 * 2. `useEffect`: when `value` / variant / config change, re-sync display from props.
 * 3. `onChange`: grouped → `applyGroupedNumberInputChange`; else pass through raw string.
 * 4. `resetInput`: same as sync — cancel or invalid save restores display from props.
 */

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import type { EditableGroupedNumberConfig } from "@/shared/lib/formatters/number";
import { applyGroupedNumberInputChange } from "../lib/apply-grouped-number-input-change";
import {
  formatGroupedFieldValue,
  formatPlainNumberForInput,
} from "../lib/format-grouped-field-value";

export type GroupedNumberInputVariant = "text" | "plainNumber" | "grouped";

export type UseGroupedNumberInputOptions = {
  /** Stored value from the parent (number, string, or opaque for `text`). */
  value: unknown;
  variant: GroupedNumberInputVariant;
  /** Required when `variant === "grouped"` for formatting rules. */
  groupedNumber?: EditableGroupedNumberConfig | null;
};

function initialText(
  value: unknown,
  variant: GroupedNumberInputVariant,
  groupedNumber?: EditableGroupedNumberConfig | null,
): string {
  if (variant === "text") {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }
  if (variant === "plainNumber") {
    return formatPlainNumberForInput(value);
  }
  if (groupedNumber) {
    return formatGroupedFieldValue(value, groupedNumber);
  }
  return formatPlainNumberForInput(value);
}

/**
 * Hook return values are intended to be spread onto or wired to an `<input>` (controlled).
 */
export function useGroupedNumberInput({
  value,
  variant,
  groupedNumber,
}: UseGroupedNumberInputOptions) {
  const [inputValue, setInputValue] = useState(() =>
    initialText(value, variant, groupedNumber),
  );

  useEffect(() => {
    setInputValue(initialText(value, variant, groupedNumber));
  }, [value, variant, groupedNumber]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (variant === "grouped" && groupedNumber) {
        setInputValue(applyGroupedNumberInputChange(next, groupedNumber));
        return;
      }
      setInputValue(next);
    },
    [variant, groupedNumber],
  );

  const resetInput = useCallback(() => {
    setInputValue(initialText(value, variant, groupedNumber));
  }, [value, variant, groupedNumber]);

  return {
    inputValue,
    onChange,
    setInputValue,
    resetInput,
  };
}
