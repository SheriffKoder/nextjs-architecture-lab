/**
 * Pure view resolution from a raw URL param + allow-list.
 */

import type { ViewResolution } from '../model/types'

export function resolveView(
  requested: string | null | undefined,
  availableViews: readonly string[],
  defaultView: string
): ViewResolution {
  if (!requested) {
    return { status: 'missing', view: defaultView }
  }
  if (availableViews.includes(requested)) {
    return { status: 'available', view: requested }
  }
  return { status: 'fallback', view: defaultView, requested }
}
