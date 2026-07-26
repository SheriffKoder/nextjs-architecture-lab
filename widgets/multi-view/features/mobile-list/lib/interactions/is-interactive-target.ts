/**
 * Detect clicks that originated on interactive controls inside a card.
 * Used as a safety net when a child forgets stopPropagation.
 */

const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [role="menuitem"], [role="checkbox"], [role="option"], [data-mobile-card-interactive]'

export function isInteractiveEventTarget(
  target: EventTarget | null
): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(INTERACTIVE_SELECTOR))
}
