/**
 * Icon → view dropdown.
 */

'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  LayoutDashboard,
  Map,
  Calendar,
  List,
  AlignStartHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { IconTriggerButton } from '../shared/icon-trigger-button'

const VIEW_OPTIONS: Record<
  string,
  { key: string; label: string; icon: LucideIcon }
> = {
  table: { key: 'table', label: 'Table', icon: Table },
  list: { key: 'list', label: 'List', icon: List },
  kanban: { key: 'kanban', label: 'Kanban', icon: LayoutDashboard },
  map: { key: 'map', label: 'Map', icon: Map },
  calendar: { key: 'calendar', label: 'Calendar', icon: Calendar },
  subheadings: { key: 'subheadings', label: 'SubHeadings', icon: List },
  timeline: {
    key: 'timeline',
    label: 'Timeline',
    icon: AlignStartHorizontal,
  },
}

export interface ViewControlProps {
  availableViews: readonly string[]
  currentView: string
  onViewChange: (view: string) => void
  className?: string
  disabled?: boolean
}

export function ViewControl({
  availableViews,
  currentView,
  onViewChange,
  className,
  disabled = false,
}: ViewControlProps) {
  const options = availableViews
    .map((key) => VIEW_OPTIONS[key])
    .filter(
      (option): option is { key: string; label: string; icon: LucideIcon } =>
        option !== undefined
    )

  if (options.length <= 1) return null

  const currentOption = VIEW_OPTIONS[currentView]
  const CurrentIcon = currentOption?.icon || Table
  const viewTitle = `View: ${currentOption?.label ?? currentView}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconTriggerButton
          className={className}
          disabled={disabled}
          title={viewTitle}
          aria-label={viewTitle}
          aria-haspopup="menu"
        >
          <CurrentIcon aria-hidden className="w-4 h-4" />
        </IconTriggerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.key}
              onClick={() => onViewChange(option.key)}
              className={
                currentView === option.key ? 'bg-accent' : undefined
              }
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
