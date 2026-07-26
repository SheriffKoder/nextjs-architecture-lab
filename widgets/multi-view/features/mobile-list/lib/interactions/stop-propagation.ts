/**
 * Stop pointer/mouse events from bubbling to the card open handler.
 */

import type { MouseEvent, PointerEvent, SyntheticEvent } from 'react'

export function stopPropagation(e: SyntheticEvent): void {
  e.stopPropagation()
}

export function stopMousePropagation(e: MouseEvent): void {
  e.stopPropagation()
}

export function stopPointerPropagation(e: PointerEvent): void {
  e.stopPropagation()
}

/** Prefer on interactive clusters so nested controls do not open the drawer. */
export function stopCardInteractionPropagation(
  e: MouseEvent | PointerEvent
): void {
  e.stopPropagation()
}
