'use client'

import React from 'react'
import { InvestorTableItem } from '../../config/table-config'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { ChevronDownIcon, Percent, Calendar } from 'lucide-react'
import GlassInput from '@/components/design/glass-input'

interface InvestorInvestmentDetailsFormProps {
  selectedInvestor: InvestorTableItem
  formData: InvestorTableItem
  setFormData: React.Dispatch<React.SetStateAction<InvestorTableItem>>
}

const InvestorInvestmentDetailsForm = ({ selectedInvestor, formData, setFormData }: InvestorInvestmentDetailsFormProps) => {
  // Get first allocation for default values
  const firstAllocation = selectedInvestor.allocations && selectedInvestor.allocations.length > 0 
    ? selectedInvestor.allocations[0] 
    : null

  const formatValueForInput = (value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string' && value.includes('T')) {
      // If it's a full datetime string, extract just the date part
      return value.split('T')[0]
    }
    return String(value)
  }

  // Get investment date (could be from allocation or a separate field)
  const investmentDate = firstAllocation?.created_at || formData.allocations?.[0]?.created_at || ''
  const interestRate = firstAllocation?.interest_rate_percentage || formData.allocations?.[0]?.interest_rate_percentage || null

  return (
    <CollapsibleCard 
      headerText="Investment Details"
      rightIcon={ChevronDownIcon}
      defaultOpen={false}
      variant="sm"
    >
      <div className="space-y-4 p-3">
        <GlassInput
          value={formatValueForInput(investmentDate)}
          onChange={(e) => {
            const value = e.target.value
            setFormData(prev => ({
              ...prev,
              allocations: prev.allocations && prev.allocations.length > 0
                ? prev.allocations.map((alloc, idx) => 
                    idx === 0 ? { ...alloc, created_at: value } : alloc
                  )
                : [{ ...prev.allocations?.[0] || {}, created_at: value } as any]
            }))
          }}
          placeholder="YYYY-MM-DD"
          required={false}
          label="Investment Date"
          type="date"
          theme="dark"
          size="sm"
          labelPosition="top"
        />

        <GlassInput
          value={interestRate ? String(interestRate) : ''}
          onChange={(e) => {
            const value = e.target.value
            const numValue = value === '' ? null : Number(value)
            setFormData(prev => ({
              ...prev,
              allocations: prev.allocations && prev.allocations.length > 0
                ? prev.allocations.map((alloc, idx) => 
                    idx === 0 ? { ...alloc, interest_rate_percentage: numValue } : alloc
                  )
                : [{ ...prev.allocations?.[0] || {}, interest_rate_percentage: numValue } as any]
            }))
          }}
          placeholder="Enter interest rate"
          required={false}
          label="Interest Rate (%)"
          type="number"
          theme="dark"
          size="sm"
          labelPosition="top"
          rightIcon={Percent}
        />
      </div>
    </CollapsibleCard>
  )
}

export default InvestorInvestmentDetailsForm
