/*
 * Grouped number input — format field value for display / sync
 *
 * Purpose: Turn a stored numeric (or empty) `value` into the string shown in the UI or used to seed an input.
 * Used in: components/grouped-number-input/use-grouped-number-input.ts, table cells, development formatters demo
 * Used for: Read-only labels and resetting edit text from props after save or cancel.
 *
 * Function Index:
 * formatPlainNumberForInput(value): non-grouped numeric string for plainNumber variant
 * formatGroupedFieldValue(value, config): grouped + optional decimals per config
 * Example input: value = 1234.5, config = { prefix: "$", allowDecimals: true, maximumFractionDigits: 2 }
 * Example output: "$1,234.50" (locale-dependent grouping)
 *
 * Steps:
 * 1. formatPlainNumberForInput: guard empty/NaN, else `Number` → `toString()`.
 * 2. formatGroupedFieldValue: guard empty/non-finite, branch allowDecimals → Intl grouped number vs integer.
 */

import type { EditableGroupedNumberConfig } from "@/lib/number-formatters/format-grouped-number";
import {
  formatGroupedInteger,
  formatGroupedNumber,
} from "@/lib/number-formatters/format-grouped-number";

/**
 * Plain numeric string (no thousands separators) for `variant: "plainNumber"` in the hook.
 * @param value - Cell or form value coerced with `Number`.
 */
export function formatPlainNumberForInput(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = Number(value);
  if (Number.isNaN(numValue)) {
    return "";
  }
  return numValue.toString();
}

/**
 * Grouped display string from stored number (prefix/suffix, Intl grouping, optional decimals).
 * @param value - Stored number or coercible string.
 * @param config - Same shape as table `editableGroupedNumber`.
 */
export function formatGroupedFieldValue(
  value: unknown,
  config: EditableGroupedNumberConfig,
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const numValue = Number(value);
  if (!Number.isFinite(numValue)) {
    return "";
  }
  const { allowDecimals, ...opts } = config;
  return allowDecimals
    ? formatGroupedNumber(numValue, opts)
    : formatGroupedInteger(numValue, opts);
}
