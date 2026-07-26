/**
 * Resolve top-right action menu entries.
 * Prefers explicit `actionConfigs`; falls back to shared defaults without `delete`
 * (delete is a dedicated trash control via `columnActions.delete`).
 */

import {
  actionConfigs as defaultActionConfigs,
  type ActionHandler,
} from '@/widgets/multi-view/constants/actions'
import type { CardActionConfig } from '../actions'

export function resolveCardActionConfigs<T>(
  item: T,
  actionConfigs?: CardActionConfig[],
  onActionClick?: ActionHandler<T>
): CardActionConfig[] | undefined {
  if (actionConfigs && actionConfigs.length > 0) {
    return actionConfigs
  }
  if (!onActionClick) return undefined
  return defaultActionConfigs(onActionClick, item).filter(
    (action) => action.key !== 'delete'
  ) as CardActionConfig[]
}
