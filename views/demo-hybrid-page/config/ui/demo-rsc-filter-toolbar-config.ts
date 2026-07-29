/**
 * Demo hybrid — FilterToolbar page + presentation config.
 */

import type { GroupableField } from '@/platform/url-kit/minimal-controls'
import type { PlaceholderMarqueeProp } from '@/platform/url-kit/filters/feature-filtering/features/placeholder-marquee'
import {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../data/demo-rsc-views-config'

export {
  DEMO_RSC_AVAILABLE_VIEWS,
  DEMO_RSC_DEFAULT_VIEW,
  DEMO_RSC_USE_ALL_ITEMS_VIEWS,
} from '../data/demo-rsc-views-config'

export { DEMO_RSC_DEFAULT_GROUPS_EXPANDED } from '../data/demo-rsc-grouping-config'

export interface DemoRscFilterToolbarConfig {
  availableViews: string[]
  defaultView?: string
  useAllItems?: readonly string[]
  defaultPageSize?: number
  groupableFields?: GroupableField[]
  labelFilterKey?: string
  enabledFilterKeys?: string[]
}

export const demoRscFilterToolbarConfig: DemoRscFilterToolbarConfig = {
  availableViews: [...DEMO_RSC_AVAILABLE_VIEWS],
  defaultView: DEMO_RSC_DEFAULT_VIEW,
  useAllItems: DEMO_RSC_USE_ALL_ITEMS_VIEWS,
  defaultPageSize: 10,
  groupableFields: [
    { key: 'status', label: 'Status' },
    { key: 'make', label: 'Make' },
    { key: 'location', label: 'Location' },
  ],
  labelFilterKey: 'status',
  enabledFilterKeys: ['status', 'make', 'location'],
}

export const DEMO_RSC_GROUPING_ALLOWED_KEYS =
  demoRscFilterToolbarConfig.groupableFields?.map((f) => f.key) ?? []

/**
 * Search placeholder marquee for narrow fields.
 *
 * - omit / false → off
 * - true → both desktop + mobile
 * - `{ mobile: true }` → mobile only
 * - `{ desktop: true, mobile: true }` → both
 * - `{ desktop: { cycleMs: 12000 }, mobile: true }` → per-shell timing
 */
export const DEMO_RSC_PLACEHOLDER_MARQUEE: PlaceholderMarqueeProp = {
  desktop: false,
  mobile: true,
}
