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
import type { ActionHandler } from '@/features/filtering-wrapper-multi-display-clean/constants/actions'

const rowViewButtonStyle = {
  buttonPadding: 'p-2',
  buttonBackground: 'bg-foreground/5 dark:bg-transparent',
  buttonHoverBackground: 'hover:bg-info/10 dark:hover:bg-info/15',
  iconColor: 'text-info',
  iconSize: 16,
  buttonBorderRadius: 'rounded-md',
  buttonBorder: '',
} as const

const rowEditButtonStyle = {
  buttonPadding: 'p-2',
  buttonBackground: 'bg-foreground/5 dark:bg-transparent',
  buttonHoverBackground: 'hover:bg-success/10 dark:hover:bg-success/15',
  iconColor: 'text-success',
  iconSize: 16,
  buttonBorderRadius: 'rounded-md',
  buttonBorder: '',
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
      ...rowViewButtonStyle,
    },
    {
      key: 'edit',
      icon: Pencil,
      label: 'Edit',
      onClick: (_e: MouseEvent) => onActionClick('edit', rowData),
      ...rowEditButtonStyle,
    },
  ]
}
