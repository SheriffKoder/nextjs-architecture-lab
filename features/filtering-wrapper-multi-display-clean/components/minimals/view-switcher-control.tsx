/**
 * View Switcher Control Component
 * 
 * Purpose: Provides UI to switch between views via dropdown
 * Used in: FilteringWrapper for view switching
 * Why: Clean, minimal view switcher with button + dropdown
 */

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, LayoutDashboard, Map, Calendar, List, AlignStartHorizontal, ChevronDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Pre-configured view options
const VIEW_OPTIONS: Record<string, { key: string; label: string; icon: LucideIcon }> = {
  table: {
    key: 'table',
    label: 'Table',
    icon: Table
  },
  list: {
    key: 'list',
    label: 'List',
    icon: List
  },
  kanban: {
    key: 'kanban',
    label: 'Kanban',
    icon: LayoutDashboard
  },
  map: {
    key: 'map',
    label: 'Map',
    icon: Map
  },
  calendar: {
    key: 'calendar',
    label: 'Calendar',
    icon: Calendar
  },
  subheadings: {
    key: 'subheadings',
    label: 'SubHeadings',
    icon: List
  },
  timeline: {
    key: 'timeline',
    label: 'Timeline',
    icon: AlignStartHorizontal
  }
};

/**
 * Props for ViewSwitcherControl component
 */
export interface ViewSwitcherControlProps {
  /** Available view keys to display */
  availableViews: string[];
  /** Current view key */
  currentView: string;
  /** Change handler */
  onViewChange: (view: string) => void;
  /** Optional className */
  className?: string;
  /** Optional disabled state */
  disabled?: boolean;
}

/**
 * View Switcher Control Component
 * Provides dropdown to switch between available views
 */
export function ViewSwitcherControl({
  availableViews,
  currentView,
  onViewChange,
  className = '',
  disabled = false
}: ViewSwitcherControlProps) {
  // Filter options to only show available views
  const options = availableViews
    .map(key => VIEW_OPTIONS[key])
    .filter((option): option is { key: string; label: string; icon: LucideIcon } => option !== undefined);

  // Don't render if no valid options or only one option
  if (options.length <= 1) {
    return null;
  }

  // Get current view option
  const currentOption = VIEW_OPTIONS[currentView];
  const CurrentIcon = currentOption?.icon || Table;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          disabled={disabled}
        >
          <CurrentIcon className="w-4 h-4" />
          <span>{currentOption?.label || 'View'}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.key}
              onClick={() => onViewChange(option.key)}
              className={currentView === option.key ? 'bg-accent' : ''}
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
