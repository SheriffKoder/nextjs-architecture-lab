'use client'

import React, { useState, useEffect } from 'react'
import { InvestorTableItem } from '../../config/table-config'
import { Allocation, Project } from '@/lib/types'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { ChevronDownIcon, DollarSign, Plus, Trash2, FolderKanban } from 'lucide-react'
import GlassInput from '@/components/design/glass-input'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'

interface DropdownItem {
  id: string | number
  label: string
  value: any
}

interface AllocationRow {
  id: string
  project_id: string | null
  allocation_amount: number | null
}

interface InvestorAllocationsFormProps {
  selectedInvestor: InvestorTableItem
  formData: InvestorTableItem
  setFormData: React.Dispatch<React.SetStateAction<InvestorTableItem>>
  availableProjects?: Project[]
}

const InvestorAllocationsForm = ({ selectedInvestor, formData, setFormData, availableProjects = [] }: InvestorAllocationsFormProps) => {
  // Initialize allocation rows from formData allocations or selectedInvestor allocations
  const [allocationRows, setAllocationRows] = useState<AllocationRow[]>(() => {
    const allocations = formData.allocations && formData.allocations.length > 0 
      ? formData.allocations 
      : (selectedInvestor.allocations && selectedInvestor.allocations.length > 0 ? selectedInvestor.allocations : [])
    
    if (allocations.length > 0) {
      return allocations.map((alloc, idx) => ({
        id: alloc.id || `alloc-${idx}`,
        project_id: alloc.project_id || null,
        allocation_amount: alloc.allocation_amount || null
      }))
    }
    return []
  })

  // Convert projects to dropdown items
  const projectItems: DropdownItem[] = availableProjects.map(project => ({
    id: project.id,
    label: project.address || `Project ${project.id}`,
    value: project.id
  }))

  // Update formData when allocationRows change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      allocations: allocationRows.map(row => {
        // Try to find existing allocation to preserve other fields
        const existingAlloc = prev.allocations?.find(a => a.id === row.id) || 
                             selectedInvestor.allocations?.find(a => a.id === row.id)
        
        return {
          ...(existingAlloc || {}),
          id: row.id,
          project_id: row.project_id || '',
          allocation_amount: row.allocation_amount || 0,
          user_id: prev.id || selectedInvestor.id,
          status: existingAlloc?.status || 'active',
          interest_rate_percentage: existingAlloc?.interest_rate_percentage || 0,
          investment_method: existingAlloc?.investment_method || 'equity',
          investment_type: existingAlloc?.investment_type || 'direct',
          profit_split_percentage: existingAlloc?.profit_split_percentage || null,
          payment_term: existingAlloc?.payment_term || 'monthly',
          accrued_interest: existingAlloc?.accrued_interest || 0,
          distributed_to_date: existingAlloc?.distributed_to_date || null,
          days_left: existingAlloc?.days_left || null,
          note_maturity_date: existingAlloc?.note_maturity_date || null,
          created_at: existingAlloc?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Allocation
      })
    }))
  }, [allocationRows])

  const handleAddRow = () => {
    const newRow: AllocationRow = {
      id: `alloc-${Date.now()}`,
      project_id: null,
      allocation_amount: null
    }
    setAllocationRows(prev => [...prev, newRow])
  }

  const handleRemoveRow = (rowId: string) => {
    setAllocationRows(prev => prev.filter(row => row.id !== rowId))
  }

  const handleProjectChange = (rowId: string, projectId: string) => {
    setAllocationRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, project_id: projectId } : row
    ))
  }

  const handleAmountChange = (rowId: string, amount: string) => {
    const numValue = amount === '' ? null : Number(amount)
    setAllocationRows(prev => prev.map(row => 
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

  return (
    <CollapsibleCard 
      headerText="Project Allocations"
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      <div className="p-3 space-y-4">
        {allocationRows.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No allocations yet. Click the + button to add an allocation.
          </div>
        ) : (
          <div className="space-y-0">
            {/* Labels Header Row */}
            <div className="flex gap-2">
              <div style={{ width: '45%', flexShrink: 0 }}>
                <label className="block text-xs text-foreground/70 text-left">Select Project</label>
              </div>
              <div style={{ width: '35%', flexShrink: 0 }}>
                <label className="block text-xs text-foreground/70 text-left">Allocation ($)</label>
              </div>
              <div style={{ width: '15%', flexShrink: 0 }}>
                <label className="block text-xs text-foreground/70 text-left">Remove</label>
              </div>
            </div>

            {/* Input Rows */}
            {allocationRows.map((row) => {
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
                      style = {{ padding: '0', margin: '0' }}
                    />
                  </div>

                  {/* Remove Button - 15% */}
                  <div className="flex items-end justify-start" style={{ width: '15%', flexShrink: 0 }}>
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-2 text-foreground/70 hover:text-destructive transition-colors rounded-md hover:bg-foreground/5"
                      aria-label="Remove allocation"
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
        <div className="flex justify-end pt-">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-3 py-2 text-xs text-foreground/70 hover:text-tertiary transition-colors rounded-md hover:bg-foreground/5 border border-foreground/10"
            aria-label="Add allocation"
          >
            <Plus size={14} />
            <span>Add Allocation</span>
          </button>
        </div>
      </div>
    </CollapsibleCard>
  )
}

export default InvestorAllocationsForm
