/**
 * View switcher dropdown — presentational; parent owns URL via onViewChange.
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
  LayoutList,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { MinimalControlsTriggerButton } from './trigger-button'

const VIEW_OPTIONS: Record<
  string,
  { key: string; label: string; icon: LucideIcon }
> = {
  table: { key: 'table', label: 'Table', icon: Table },
  list: { key: 'list', label: 'List', icon: List },
  cards: { key: 'cards', label: 'Cards', icon: LayoutList },
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

export interface ViewSwitcherControlProps {
  availableViews: string[]
  currentView: string
  onViewChange: (view: string) => void
  className?: string
  disabled?: boolean
}

export function ViewSwitcherControl({
  availableViews,
  currentView,
  onViewChange,
  className = '',
  disabled = false,
}: ViewSwitcherControlProps) {
  const options = availableViews
    .map((key) => VIEW_OPTIONS[key])
    .filter(
      (option): option is { key: string; label: string; icon: LucideIcon } =>
        option !== undefined
    )

  if (options.length <= 1) {
    return null
  }

  const currentOption = VIEW_OPTIONS[currentView]
  const CurrentIcon = currentOption?.icon || Table

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MinimalControlsTriggerButton
          className={className}
          disabled={disabled}
        >
          <CurrentIcon className="w-4 h-4" />
          <span>{currentOption?.label || 'View'}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </MinimalControlsTriggerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={option.key}
              onClick={() => onViewChange(option.key)}
              className={currentView === option.key ? 'bg-accent' : ''}
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
