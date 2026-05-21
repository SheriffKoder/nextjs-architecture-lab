/**
 * Row action buttons for demo RSC table (Actions column — dropdown).
 *
 * Purpose: View + Edit entries for `ActionButton` `mode="dropdown"`; Delete lives on separate `delete` column (`columnActions`).
 * Used in: `demo-rsc-content.tsx` → `actionConfigs={getRowActionConfigs}`
 *
 * Shape matches `filtering-wrapper-multi-display-clean/constants/actions` `actionConfigs` entries.
 */

import type { MouseEvent } from 'react'
import { Eye, Pencil } from 'lucide-react'
import type { ActionHandler } from '@/features/multi-view/constants/actions'

/** Named `group` so icon hover uses `group-hover/row-action-button:` — not the table row `group-hover`. */
const rowActionMenuButtonClassName =
  'group/row-action-button flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-tertiary/20'

/** Light: blue icon; dark: foreground; hover (this action button only): foreground. */
const rowActionMenuIconClassNameEdit =
  'text-blue-500 transition-colors group-hover/row-action-button:text-foreground dark:text-foreground'

const rowActionMenuIconClassNameView =
  'text-blue-500 transition-colors group-hover/row-action-button:text-foreground dark:text-foreground'

const rowActionMenuItemStyleEdit = {
  buttonClassName: rowActionMenuButtonClassName,
  iconClassName: rowActionMenuIconClassNameEdit,
  iconSize: 16,
} as const

const rowActionMenuItemStyleView = {
  buttonClassName: rowActionMenuButtonClassName,
  iconClassName: rowActionMenuIconClassNameView,
  iconSize: 16,
} as const

export function demoRscRowActionConfigs<T>(
  onActionClick: ActionHandler<T>,
  rowData: T
) {
  return [
    {
      key: 'view',
      icon: Eye,
      label: 'View',
      onClick: (_e: MouseEvent) => onActionClick('view', rowData),
      ...rowActionMenuItemStyleView,
    },
    {
      key: 'edit',
      icon: Pencil,
      label: 'Edit',
      onClick: (_e: MouseEvent) => onActionClick('edit', rowData),
      ...rowActionMenuItemStyleEdit,
    },
  ]
}
