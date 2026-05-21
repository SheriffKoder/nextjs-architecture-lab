/*
 * Grouped number input — barrel exports
 *
 * Purpose: Single import path `@/components/grouped-number-input` for hooks, components, parsers, and types.
 * Used in: app/development/formatters, features filter-wrapper editable-cell.tsx, future forms
 * Used for: Tree-shakeable re-exports; README.md documents usage patterns (see app/development/project-guidelines.js for comment style).
 *
 * Function Index: (re-exports only — see source files)
 * Steps:
 * 1. Re-export types and implementations from sibling modules.
 */

export type { EditableGroupedNumberConfig } from "@/lib/number-formatters/format-grouped-number";
export { applyGroupedNumberInputChange } from "./apply-grouped-number-input-change";
export {
  commitGroupedNumberInput,
  commitPlainNumericInput,
} from "./commit-grouped-number-input";
export {
  formatGroupedFieldValue,
  formatPlainNumberForInput,
} from "./format-grouped-field-value";
export { GroupedNumberInput } from "./grouped-number-input";
export type { GroupedNumberInputProps } from "./grouped-number-input";
export {
  useGroupedNumberInput,
  type GroupedNumberInputVariant,
  type UseGroupedNumberInputOptions,
} from "./use-grouped-number-input";
