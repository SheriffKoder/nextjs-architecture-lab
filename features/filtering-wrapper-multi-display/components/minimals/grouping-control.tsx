/**
 * Grouping Control Component
 * 
 * Purpose: Provides UI to dynamically select grouping keys at runtime
 * Used in: FilteringWrapper for controlling grouping across views
 * Why: Allows users to change grouping without modifying configs
 */

"use client";

import React, { useState } from 'react';
import { TableColumn } from '../../types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layers, X, RotateCcw, ChevronDown } from 'lucide-react';

/**
 * Props for GroupingControl component
 */
export interface GroupingControlProps<T = any> {
  columns: TableColumn<T>[];
  selectedGroupBy: string | null;
  selectedSubGroupBy?: string | null;
  onGroupByChange: (groupBy: string | null) => void;
  onSubGroupByChange?: (subGroupBy: string | null) => void;
  availableViews?: string[];
  currentView?: string;
  availableColumns?: string[]; // Array of column keys available for grouping
}

/**
 * Grouping Control Component
 * Provides dropdown to select grouping keys from available columns
 */
export function GroupingControl<T = any>({
  columns,
  selectedGroupBy,
  selectedSubGroupBy,
  onGroupByChange,
  onSubGroupByChange,
  availableViews = [],
  currentView = 'table',
  availableColumns: availableColumnsConfig,
}: GroupingControlProps<T>) {
  // Check if current view supports grouping
  const supportsGrouping = ['table', 'list', 'subheadings', 'timeline'].includes(currentView);
  
  // Don't render if current view doesn't support grouping
  if (!supportsGrouping) {
    return null;
  }

  // Get available columns for grouping (exclude hidden and action columns)
  let availableColumns = columns.filter(
    col => !col.isHidden && col.key !== 'actions' && col.key !== 'action'
  );

  // Filter by availableColumnsConfig if provided
  if (availableColumnsConfig && availableColumnsConfig.length > 0) {
    availableColumns = availableColumns.filter(
      col => availableColumnsConfig.includes(col.key)
    );
  }

  // Get display name for selected column
  const getColumnDisplayName = (key: string | null) => {
    if (!key) return null;
    const column = columns.find(col => col.key === key);
    return column?.name || key;
  };

  const selectedGroupByDisplay = getColumnDisplayName(selectedGroupBy ?? null);
  const selectedSubGroupByDisplay = getColumnDisplayName(selectedSubGroupBy ?? null);

  // Get available columns for sub-grouping (exclude already selected primary grouping)
  const availableSubGroupColumns = availableColumns.filter(
    col => col.key !== selectedGroupBy
  );

  // Handle reset - clear both group and sub-group
  const handleReset = () => {
    onGroupByChange(null);
    if (onSubGroupByChange) {
      onSubGroupByChange(null);
    }
  };

  // Check if any grouping is selected
  const hasGrouping = selectedGroupBy !== null || selectedSubGroupBy !== null;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasGrouping ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            {selectedGroupByDisplay 
              ? selectedSubGroupByDisplay 
                ? `Group: ${selectedGroupByDisplay} → ${selectedSubGroupByDisplay}`
                : `Group: ${selectedGroupByDisplay}`
              : 'Group'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 min-h-[300px] flex flex-col p-0">
          <div className="flex-1 flex flex-col p-3 overflow-y-auto">
            {/* No groups selected: Show list of available options */}
            {!selectedGroupBy && (
              <div className="space-y-1">
                {availableColumns.map((column) => (
                  <div
                    key={column.key}
                    onClick={() => onGroupByChange(column.key)}
                    className="flex items-center py-1.5 px-2 rounded-md hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent cursor-pointer transition-colors"
                  >
                    <span className="text-xs text-foreground flex-1">
                      {column.name || column.key}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Group selected: Show row with dropdown + trash, then list for subgroup */}
            {selectedGroupBy && !selectedSubGroupBy && (
              <>
                {/* Selected Group Row */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">A</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background">
                          <span className="text-foreground">{selectedGroupByDisplay}</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {availableColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onClick={() => onGroupByChange(column.key)}
                            className={selectedGroupBy === column.key ? 'bg-accent' : ''}
                          >
                            {column.name || column.key}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <button
                    onClick={() => onGroupByChange(null)}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Remove group"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Sub-group selection list */}
                <div className="space-y-1">
                  {availableSubGroupColumns.map((column) => (
                    <div
                      key={column.key}
                      onClick={() => onSubGroupByChange?.(column.key)}
                      className="flex items-center py-1.5 px-2 rounded-md hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent cursor-pointer transition-colors"
                    >
                      <span className="text-xs text-foreground flex-1">
                        {column.name || column.key}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Group and sub-group selected: Just rows with trash */}
            {selectedGroupBy && selectedSubGroupBy && (
              <div className="space-y-2">
                {/* Selected Group Row */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-[3.5rem]">Group</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background">
                          <span className="text-foreground">{selectedGroupByDisplay}</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {availableColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onClick={() => onGroupByChange(column.key)}
                            className={selectedGroupBy === column.key ? 'bg-accent' : ''}
                          >
                            {column.name || column.key}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <button
                    onClick={() => onGroupByChange(null)}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Remove group"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Selected Sub-group Row */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-[3.5rem]">Subgroup</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background">
                          <span className="text-foreground">{selectedSubGroupByDisplay}</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {availableSubGroupColumns.map((column) => (
                          <DropdownMenuItem
                            key={column.key}
                            onClick={() => onSubGroupByChange?.(column.key)}
                            className={selectedSubGroupBy === column.key ? 'bg-accent' : ''}
                          >
                            {column.name || column.key}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <button
                    onClick={() => onSubGroupByChange?.(null)}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                    title="Remove sub-group"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Button - Sticky at bottom */}
          <div className="mt-auto p-3 border-t border-border flex justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
