/*
 * Grouped number input — commit text to number
 *
 * Purpose: Parse visible input text into a finite number for API/state, or reject incomplete input.
 * Used in: components/grouped-number-input (consumers), features filter-wrapper editable-cell.tsx, forms on blur
 * Used for: Save handlers: grouped fields use `commitGroupedNumberInput`; plain numeric text uses `commitPlainNumericInput`.
 *
 * Function Index:
 * commitGroupedNumberInput(text, config): number | null
 * commitPlainNumericInput(text): number | null
 * Example input (grouped): "$1,234.50", currency config
 * Example output: 1234.5
 *
 * Steps:
 * 1. commitGroupedNumberInput: `groupedInputToNumber` with affixes → null if incomplete → truncate if integers-only.
 * 2. commitPlainNumericInput: trim → Number → null if NaN (empty string yields 0, matching `Number("")`).
 */

import type { EditableGroupedNumberConfig } from "@/utils/number-formatters/format-grouped-number";
import { groupedInputToNumber } from "@/utils/number-formatters/parse-grouped-number-input";

/**
 * Parses grouped display text to a number; `null` when input is incomplete or non-finite.
 * Integers-only columns return `Math.trunc(n)` when `allowDecimals` is false.
 */
export function commitGroupedNumberInput(
  text: string,
  config: EditableGroupedNumberConfig,
): number | null {
  const n = groupedInputToNumber(String(text), {
    prefix: config.prefix,
    suffix: config.suffix,
  });
  if (n === null) {
    return null;
  }
  return config.allowDecimals ? n : Math.trunc(n);
}

/**
 * Parses a plain text field (no commas/affix rules); `null` only when `Number` is NaN.
 */
export function commitPlainNumericInput(text: string): number | null {
  const finalNum = Number(text.trim());
  if (Number.isNaN(finalNum)) {
    return null;
  }
  return finalNum;
}
