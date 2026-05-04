'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DollarSign, Trash2, FolderKanban } from 'lucide-react'
import GlassInput from '@/components/design/glass-input'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'
import { Project } from '@/lib/types'

interface DropdownItem {
  id: string | number
  label: string
  value: any
}

interface ReallocationProjectRow {
  id: string
  project_id: string | null
  allocation_amount: number | null
}

interface ReallocationProjectsProps {
  availableProjects?: Project[]
  onAllocationsChange?: (sum: number) => void
  onProjectsChange?: (projects: Array<{ projectId: string; projectName: string; amount: number }>) => void
}

const ReallocationProjects: React.FC<ReallocationProjectsProps> = ({
  availableProjects = [],
  onAllocationsChange,
  onProjectsChange
}) => {
  const [reallocationRows, setReallocationRows] = useState<ReallocationProjectRow[]>(() => {
    // Initialize with one default row
    return [{
      id: `realloc-${Date.now()}`,
      project_id: null,
      allocation_amount: null
    }]
  })

  // Convert projects to dropdown items
  const projectItems: DropdownItem[] = availableProjects.map(project => ({
    id: project.id,
    label: project.address || `Project ${project.id}`,
    value: project.id
  }))

  const handleAddRow = () => {
    const newRow: ReallocationProjectRow = {
      id: `realloc-${Date.now()}`,
      project_id: null,
      allocation_amount: null
    }
    setReallocationRows(prev => [...prev, newRow])
  }

  const handleRemoveRow = (rowId: string) => {
    setReallocationRows(prev => prev.filter(row => row.id !== rowId))
  }

  const handleProjectChange = (rowId: string, projectId: string) => {
    setReallocationRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, project_id: projectId } : row
    ))
  }

  const handleAmountChange = (rowId: string, amount: string) => {
    const numValue = amount === '' ? null : Number(amount)
    setReallocationRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, allocation_amount: numValue } : row
    ))
  }

  const formatValueForInput = (value: any): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  const getSelectedProjectItem = (projectId: string | null): DropdownItem | null => {
    if (!projectId) return null
    return projectItems.find(item => item.value === projectId) || null
  }

  // Track previous values to prevent unnecessary updates
  const previousSumRef = useRef<number>(0)
  const previousProjectsRef = useRef<string>('')

  // Calculate sum of all allocation amounts and notify parent
  useEffect(() => {
    const sum = reallocationRows.reduce((total, row) => {
      return total + (row.allocation_amount || 0)
    }, 0)

    // Only update if sum actually changed
    if (sum !== previousSumRef.current) {
      previousSumRef.current = sum
      onAllocationsChange?.(sum)
    }

    // Notify parent of project details for preview
    const projectsData = reallocationRows
      .filter(row => row.project_id && row.allocation_amount !== null && row.allocation_amount > 0)
      .map(row => {
        const project = availableProjects.find(p => p.id === row.project_id)
        return {
          projectId: row.project_id!,
          projectName: project?.address || `Project ${row.project_id}`,
          amount: row.allocation_amount!
        }
      })
    
    // Create a string representation to compare
    const projectsKey = JSON.stringify(projectsData.map(p => ({ id: p.projectId, amount: p.amount })))
    
    // Only update if projects data actually changed
    if (projectsKey !== previousProjectsRef.current) {
      previousProjectsRef.current = projectsKey
      onProjectsChange?.(projectsData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reallocationRows, availableProjects])

  return (
    <div className="flex flex-col gap-0">
      {/* Labels Header Row */}
      <div className="flex gap-2">
        <div style={{ width: '45%', flexShrink: 0 }}>
          <label className="block text-xs text-foreground/70 text-left">Select Project</label>
        </div>
        <div style={{ width: '35%', flexShrink: 0 }}>
          <label className="block text-xs text-foreground/70 text-left">Allocation amount</label>
        </div>
        <div style={{ width: '15%', flexShrink: 0 }}>
          <label className="block text-xs text-foreground/70 text-left">Remove</label>
        </div>
      </div>

      {/* Input Rows */}
      {reallocationRows.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No reallocation projects yet. Click the + button to add a project.
        </div>
      ) : (
        <div className="space-y-2">
          {reallocationRows.map((row) => {
            const selectedProjectItem = getSelectedProjectItem(row.project_id)
            const selectedProjectItems: DropdownItem[] = selectedProjectItem ? [selectedProjectItem] : []

            return (
              <div key={row.id} className="flex flex-row items-end gap-2">
                {/* Select Project - 45% */}
                <div style={{ width: '45%', flexShrink: 0 }}>
                  <DropdownSelect
                    icon={FolderKanban}
                    buttonText={selectedProjectItem ? selectedProjectItem.label : "Select Project"}
                    items={projectItems}
                    selectedItems={selectedProjectItems}
                    onSelectionChange={(items: DropdownItem[]) => {
                      if (items.length > 0) {
                        handleProjectChange(row.id, items[0].value as string)
                      }
                    }}
                    searchPlaceholder="Search project..."
                    searchable={false}
                    width="100%"
                    maxHeight="400px"
                    selectedText="project"
                    showSelectedItems={true}
                    showItemCount={false}
                    showCheckboxes={false}
                    singleChoice={true}
                    hideTopButtons={true}
                    className="w-full mt-auto"
                  />
                </div>

                {/* Allocation Amount - 35% */}
                <div className="flex items-end" style={{ width: '35%', flexShrink: 0 }}>
                  <GlassInput
                    value={formatValueForInput(row.allocation_amount)}
                    onChange={(e) => handleAmountChange(row.id, e.target.value)}
                    placeholder="Enter amount"
                    required={false}
                    label=""
                    type="number"
                    theme="dark"
                    size="sm"
                    labelPosition="top"
                    leftIcon={DollarSign}
                    style={{ padding: '0', margin: '0' }}
                  />
                </div>

                {/* Remove Button - 15% */}
                <div className="flex items-end justify-start" style={{ width: '15%', flexShrink: 0 }}>
                  <button
                    onClick={() => handleRemoveRow(row.id)}
                    className="p-2 text-foreground/70 hover:text-destructive transition-colors rounded-md hover:bg-foreground/5"
                    aria-label="Remove reallocation"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-start mt-4">
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 px-3 py-2 text-xs  transition-colors rounded-md dark:bg-black bg-white"
          aria-label="Add reallocation project"
        >
          <span className="text-sm">+</span>
          <span>Add Reallocation Project</span>
        </button>
      </div>
    </div>
  )
}

export default ReallocationProjects
