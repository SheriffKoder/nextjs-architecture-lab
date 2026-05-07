'use client'

import React, { useState } from 'react'
import { InvestorTableItem } from '../../config/table-config'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { ChevronDownIcon, DollarSign, Percent, Tag } from 'lucide-react'
import GlassInput from '@/components/design/inputs/glass-input'
import DropdownSelect from '@/components/design/multi-select/dropdown-select'

interface DropdownItem {
  id: string | number
  label: string
  value: any
}

interface InvestorBasicFormProps {
  selectedInvestor: InvestorTableItem
  formData: InvestorTableItem
  setFormData: React.Dispatch<React.SetStateAction<InvestorTableItem>>
}

const InvestorBasicForm = ({ selectedInvestor, formData, setFormData }: InvestorBasicFormProps) => {
  // Investment method options (Invested How)
  const investmentMethodItems: DropdownItem[] = [
    { id: 'equity', label: 'Equity', value: 'equity' },
    { id: 'note', label: 'Note', value: 'note' },
    { id: 'loan', label: 'Loan', value: 'loan' },
  ]

  // Investment type options
  const investmentTypeItems: DropdownItem[] = [
    { id: 'direct', label: 'Direct', value: 'direct' },
    { id: 'secured', label: 'Secured', value: 'secured' },
    { id: 'partnership', label: 'Partnership', value: 'partnership' },
  ]

  // Get first allocation for default values
  const firstAllocation = selectedInvestor.allocations && selectedInvestor.allocations.length > 0 
    ? selectedInvestor.allocations[0] 
    : null

  // Get selected investment method
  const selectedMethodItem = investmentMethodItems.find(item => item.value === (firstAllocation?.investment_method || formData.allocations?.[0]?.investment_method)) || null
  const selectedMethodItems: DropdownItem[] = selectedMethodItem ? [selectedMethodItem] : []

  // Get selected investment type
  const selectedTypeItem = investmentTypeItems.find(item => item.value === (firstAllocation?.investment_type || formData.allocations?.[0]?.investment_type)) || null
  const selectedTypeItems: DropdownItem[] = selectedTypeItem ? [selectedTypeItem] : []

  const handleInputChange = (field: keyof InvestorTableItem) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('totalInvested') || field.includes('Invested')
        ? (value === '' ? null : Number(value))
        : value
    }))
  }

  const formatValueForInput = (value: any): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  // Get profit split from first allocation
  const profitSplitValue = firstAllocation?.profit_split_percentage || formData.allocations?.[0]?.profit_split_percentage || null
  const profitSplitDisplay = profitSplitValue ? String(profitSplitValue) : ''

  return (
    <CollapsibleCard 
      headerText="Edit Investor Details"
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      <div className="space-y-4 p-3">
        <GlassInput
          value={formatValueForInput(formData.name)}
          onChange={handleInputChange('name')}
          placeholder="Enter investor name"
          required={false}
          label="Investor Name"
          type="text"
          theme="dark"
          size="sm"
          labelPosition="top"
        />

        <div className="flex flex-col gap-2">
          <label className="block text-sm text-foreground/70">Invested How</label>
          <DropdownSelect
            icon={Tag}
            buttonText={selectedMethodItem ? selectedMethodItem.label : "Select Investment Method"}
            items={investmentMethodItems}
            selectedItems={selectedMethodItems}
            onSelectionChange={(items: DropdownItem[]) => {
              if (items.length > 0) {
                // Update the first allocation's investment_method
                setFormData(prev => ({
                  ...prev,
                  allocations: prev.allocations && prev.allocations.length > 0
                    ? prev.allocations.map((alloc, idx) => 
                        idx === 0 ? { ...alloc, investment_method: items[0].value } : alloc
                      )
                    : [{ ...prev.allocations?.[0] || {}, investment_method: items[0].value } as any]
                }))
              }
            }}
            searchPlaceholder="Search method..."
            searchable={false}
            width="100%"
            maxHeight="400px"
            selectedText="method"
            showSelectedItems={true}
            showItemCount={false}
            showCheckboxes={false}
            singleChoice={true}
            hideTopButtons={true}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-sm text-foreground/70">Investment Type</label>
          <DropdownSelect
            icon={Tag}
            buttonText={selectedTypeItem ? selectedTypeItem.label : "Select Investment Type"}
            items={investmentTypeItems}
            selectedItems={selectedTypeItems}
            onSelectionChange={(items: DropdownItem[]) => {
              if (items.length > 0) {
                // Update the first allocation's investment_type
                setFormData(prev => ({
                  ...prev,
                  allocations: prev.allocations && prev.allocations.length > 0
                    ? prev.allocations.map((alloc, idx) => 
                        idx === 0 ? { ...alloc, investment_type: items[0].value } : alloc
                      )
                    : [{ ...prev.allocations?.[0] || {}, investment_type: items[0].value } as any]
                }))
              }
            }}
            searchPlaceholder="Search type..."
            searchable={false}
            width="100%"
            maxHeight="400px"
            selectedText="type"
            showSelectedItems={true}
            showItemCount={false}
            showCheckboxes={false}
            singleChoice={true}
            hideTopButtons={true}
            className="w-full"
          />
        </div>

        <GlassInput
          value={profitSplitDisplay}
          onChange={(e) => {
            const value = e.target.value
            const numValue = value === '' ? null : Number(value)
            setFormData(prev => ({
              ...prev,
              allocations: prev.allocations && prev.allocations.length > 0
                ? prev.allocations.map((alloc, idx) => 
                    idx === 0 ? { ...alloc, profit_split_percentage: numValue } : alloc
                  )
                : [{ ...prev.allocations?.[0] || {}, profit_split_percentage: numValue } as any]
            }))
          }}
          placeholder="Enter profit split percentage"
          required={false}
          label="Profit Split (%)"
          type="number"
          theme="dark"
          size="sm"
          labelPosition="top"
          rightIcon={Percent}
        />

        <GlassInput
          value={formatValueForInput(formData.totalInvested)}
          onChange={handleInputChange('totalInvested')}
          placeholder="Enter total investment amount"
          required={false}
          label="Total Investment Amount"
          type="number"
          theme="dark"
          size="sm"
          labelPosition="top"
          leftIcon={DollarSign}
        />
      </div>
    </CollapsibleCard>
  )
}

export default InvestorBasicForm
