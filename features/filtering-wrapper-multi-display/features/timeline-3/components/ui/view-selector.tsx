"use client"

import React from 'react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon } from 'lucide-react'

type ViewType = 'Year' | 'Month' | 'Week' | 'Day'

interface ViewSelectorProps {
  selectedView: ViewType
  onViewChange: (view: ViewType) => void
}

const ViewSelector = ({ selectedView, onViewChange }: ViewSelectorProps) => {
  const viewOptions = ['Year', 'Month', 'Week', 'Day'] as const

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          View: {selectedView}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {viewOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onViewChange(option)}
            className={selectedView === option ? 'bg-accent' : ''}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ViewSelector
export type { ViewType }

