/**
 * ViewControl — icon trigger → view dropdown (desktop).
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
import { Table } from 'lucide-react'
import { IconTriggerButton } from '../shared/icon-trigger-button'
import { VIEW_OPTIONS, resolveViewOptions } from './view-options'

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
  const options = resolveViewOptions(availableViews)

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
