/**
 * Icon-only grouping dropdown (groupBy / subGroupBy).
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
import { Layers, X, RotateCcw, ChevronDown } from 'lucide-react'
import type { GroupableField } from '../../model/types'
import { DEFAULT_GROUPING_SUPPORTED_VIEWS } from '../../config/chrome'
import { IconTriggerButton } from '../shared/icon-trigger-button'

export interface GroupControlProps {
  fields: GroupableField[]
  selectedGroupBy: string | null
  selectedSubGroupBy?: string | null
  onGroupByChange: (groupBy: string | null) => void
  onSubGroupByChange?: (subGroupBy: string | null) => void
  currentView?: string
  groupingSupportedViews?: readonly string[]
}

export function GroupControl({
  fields,
  selectedGroupBy,
  selectedSubGroupBy,
  onGroupByChange,
  onSubGroupByChange,
  currentView = 'table',
  groupingSupportedViews = DEFAULT_GROUPING_SUPPORTED_VIEWS,
}: GroupControlProps) {
  if (!groupingSupportedViews.includes(currentView)) return null
  if (fields.length === 0) return null

  const labelFor = (key: string | null) => {
    if (!key) return null
    return fields.find((f) => f.key === key)?.label ?? key
  }

  const selectedGroupByDisplay = labelFor(selectedGroupBy ?? null)
  const selectedSubGroupByDisplay = labelFor(selectedSubGroupBy ?? null)
  const availableSubGroupFields = fields.filter((f) => f.key !== selectedGroupBy)

  const handleReset = () => {
    onGroupByChange(null)
    onSubGroupByChange?.(null)
  }

  const hasGrouping =
    selectedGroupBy !== null || selectedSubGroupBy != null

  const groupTitle = selectedGroupByDisplay
    ? selectedSubGroupByDisplay
      ? `Grouped by ${selectedGroupByDisplay} → ${selectedSubGroupByDisplay}`
      : `Grouped by ${selectedGroupByDisplay}`
    : 'Group rows'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconTriggerButton
          active={hasGrouping}
          title={groupTitle}
          aria-label={groupTitle}
          aria-haspopup="menu"
        >
          <Layers aria-hidden className="w-4 h-4" />
        </IconTriggerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 min-h-[300px] flex flex-col p-0"
      >
        <div className="px-3 pt-3 pb-1">
          <DropdownMenuLabel className="p-0 text-xs">
            {selectedGroupBy && selectedSubGroupBy ? 'Grouping' : 'Group by'}
          </DropdownMenuLabel>
          {!selectedGroupBy && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Organize rows by a field
            </p>
          )}
          {selectedGroupBy && !selectedSubGroupBy && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Optionally add a subgroup
            </p>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="flex-1 flex flex-col p-3 overflow-y-auto">
          {!selectedGroupBy && (
            <div className="space-y-1">
              {fields.map((field) => (
                <div
                  key={field.key}
                  onClick={() => onGroupByChange(field.key)}
                  className="flex items-center py-1.5 px-2 rounded-md hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent cursor-pointer transition-colors"
                >
                  <span className="text-xs text-foreground flex-1">
                    {field.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedGroupBy && !selectedSubGroupBy && (
            <>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                <div className="flex-1 flex items-center gap-2">
                  <span className="w-[3.5rem] shrink-0 text-xs font-medium text-muted-foreground">
                    Group
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background"
                      >
                        <span className="text-foreground">
                          {selectedGroupByDisplay}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {fields.map((field) => (
                        <DropdownMenuItem
                          key={field.key}
                          onClick={() => onGroupByChange(field.key)}
                          className={
                            selectedGroupBy === field.key ? 'bg-accent' : ''
                          }
                        >
                          {field.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <button
                  type="button"
                  onClick={() => onGroupByChange(null)}
                  className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                  title="Remove group"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                Subgroup by
              </p>
              <div className="space-y-1">
                {availableSubGroupFields.map((field) => (
                  <div
                    key={field.key}
                    onClick={() => onSubGroupByChange?.(field.key)}
                    className="flex items-center py-1.5 px-2 rounded-md hover:bg-gradient-to-r hover:from-tertiary/10 hover:to-transparent cursor-pointer transition-colors"
                  >
                    <span className="text-xs text-foreground flex-1">
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedGroupBy && selectedSubGroupBy && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-[3.5rem]">
                    Group
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background"
                      >
                        <span className="text-foreground">
                          {selectedGroupByDisplay}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {fields.map((field) => (
                        <DropdownMenuItem
                          key={field.key}
                          onClick={() => onGroupByChange(field.key)}
                          className={
                            selectedGroupBy === field.key ? 'bg-accent' : ''
                          }
                        >
                          {field.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <button
                  type="button"
                  onClick={() => onGroupByChange(null)}
                  className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                  title="Remove group"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-[3.5rem]">
                    Subgroup
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-between px-2 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors bg-background"
                      >
                        <span className="text-foreground">
                          {selectedSubGroupByDisplay}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {availableSubGroupFields.map((field) => (
                        <DropdownMenuItem
                          key={field.key}
                          onClick={() => onSubGroupByChange?.(field.key)}
                          className={
                            selectedSubGroupBy === field.key
                              ? 'bg-accent'
                              : ''
                          }
                        >
                          {field.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <button
                  type="button"
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

        <div className="mt-auto p-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
