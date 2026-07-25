/**
 * Format option count / initialCount for chip + dropdown labels.
 */

export function formatLabelFilterCount(
  option: { count?: number; initialCount?: number },
  showInitialCount: boolean
): string | null {
  if (option.count === undefined) return null
  if (showInitialCount && option.initialCount !== undefined) {
    return `${option.count} / ${option.initialCount}`
  }
  return String(option.count)
}

export function labelFilterOptionTitle(
  option: { label: string; count?: number; initialCount?: number },
  showInitialCount: boolean,
  isDisabled: boolean
): string {
  if (isDisabled) return `${option.label} (unavailable)`
  const countText = formatLabelFilterCount(option, showInitialCount)
  return countText ? `${option.label} (${countText})` : option.label
}

export function labelFilterOptionAriaLabel(
  option: { label: string },
  isDisabled: boolean,
  isSelected: boolean
): string {
  if (isDisabled) return `${option.label}, unavailable`
  if (isSelected) return `${option.label}, selected`
  return option.label
}
