/**
 * Row action buttons for demo RSC table.
 * Shape matches `filtering-wrapper-multi-display-clean/constants/actions` `actionConfigs` entries.
 *
 * Active: delete only (styled like drawer edit-header trash). View / edit blocks kept commented for toggling.
 */

import type { MouseEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { ActionHandler } from '@/features/filtering-wrapper-multi-display-clean/constants/actions'

/** Matches trash control in `rsc-car-drawer-sticky-header.tsx` (`deleteToolbarBtnClass`). */
const rowDeleteButtonStyle = {
  buttonPadding: 'p-2',
  buttonBackground: 'bg-foreground/5 dark:bg-transparent',
  buttonHoverBackground: 'hover:bg-destructive/10 dark:hover:bg-destructive/15',
  iconColor: 'text-destructive',
  iconSize: 18,
  buttonBorderRadius: 'rounded-md',
  buttonBorder: '',
} as const

export function demoRscRowActionConfigs<T>(
  onActionClick: ActionHandler<T>,
  rowData: T
) {
  return [
    /* Row “view” — off; table `onRowClick` opens the drawer in view mode. Re-enable: import `Eye` from `lucide-react`.
    {
      key: 'view',
      icon: Eye,
      label: 'View details',
      onClick: (_e: MouseEvent) => onActionClick('view', rowData),
      buttonPadding: 'p-2',
      buttonBackground: 'bg-info/5',
      buttonHoverBackground: 'hover:bg-info/10',
      iconColor: 'text-info',
      iconSize: 16,
      buttonBorderRadius: 'rounded-md',
      buttonBorder: 'border border-info',
    },
    */

    /* Row “edit” — off; use pencil in drawer header after opening a row. Re-enable: import `Edit` from `lucide-react`.
    {
      key: 'edit',
      icon: Edit,
      label: 'Edit item',
      onClick: (_e: MouseEvent) => onActionClick('edit', rowData),
      buttonPadding: 'p-2',
      buttonBackground: 'bg-success/5',
      buttonHoverBackground: 'hover:bg-success/10',
      iconColor: 'text-success',
      iconSize: 16,
      buttonBorderRadius: 'rounded-md',
      buttonBorder: 'border border-success',
    },
    */

    {
      key: 'delete',
      icon: Trash2,
      label: 'Delete item',
      onClick: (_e: MouseEvent) => onActionClick('delete', rowData),
      ...rowDeleteButtonStyle,
    },
  ]
}
