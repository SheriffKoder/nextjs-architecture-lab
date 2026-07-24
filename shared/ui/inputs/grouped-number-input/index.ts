/**
 * @file shared/ui/inputs/grouped-number-input/index.ts
 * Public barrel for grouped number input (UI + hook + pure helpers).
 */

export type { EditableGroupedNumberConfig } from '@/shared/lib/formatters/number'

export { applyGroupedNumberInputChange } from './lib/apply-grouped-number-input-change'
export {
  commitGroupedNumberInput,
  commitPlainNumericInput,
} from './lib/commit-grouped-number-input'
export {
  formatGroupedFieldValue,
  formatPlainNumberForInput,
} from './lib/format-grouped-field-value'

export { GroupedNumberInput } from './ui/grouped-number-input'
export type { GroupedNumberInputProps } from './ui/grouped-number-input'

export {
  useGroupedNumberInput,
  type GroupedNumberInputVariant,
  type UseGroupedNumberInputOptions,
} from './hooks/use-grouped-number-input'
