/**
 * Card interaction helpers — propagation guards + edit-surface policy.
 */

export {
  isInteractiveEventTarget,
} from './is-interactive-target'
export { isCardSurfaceEditable } from './is-card-surface-editable'
export {
  stopCardInteractionPropagation,
  stopMousePropagation,
  stopPointerPropagation,
  stopPropagation,
} from './stop-propagation'
