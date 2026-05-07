'use client'

import React, { useState } from 'react'
import { InvestorTableItem } from '../config/table-config'
import GlassInput from '@/components/design/inputs/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import { Check, X } from 'lucide-react'
import { useAllocations } from '@/hooks'
import { formatDDMMYYYY } from '@/lib/utils'
import AllocationFormSection, { AllocationDraft } from './allocation-form-section'

interface InvestorSliderEditContainerProps {
  selectedInvestor: InvestorTableItem | null
  selectedOrg: { id: string; company_id?: string | null } | null
  onSuccess?: () => void
}

const InvestorSliderEditContainer = ({ selectedInvestor, selectedOrg, onSuccess }: InvestorSliderEditContainerProps) => {
  const allocationsHook = useAllocations()

  const [name, setName] = useState(selectedInvestor?.name ?? '')
  const [phone, setPhone] = useState(selectedInvestor?.phone ?? '')
  const [allocationDrafts, setAllocationDrafts] = useState<AllocationDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!selectedInvestor) return null

  const handleApply = async () => {
    if (!selectedOrg?.id) return

    for (let i = 0; i < allocationDrafts.length; i++) {
      const a = allocationDrafts[i]
      if (!a.project_id) { setError(`Allocation ${i + 1}: Project is required.`); return }
      if (!a.allocation_amount) { setError(`Allocation ${i + 1}: Amount is required.`); return }
      if (!a.interest_rate_percentage) { setError(`Allocation ${i + 1}: Interest rate is required.`); return }
    }

    setError(null)
    setSubmitting(true)
    try {
      // TODO: update investor name/phone via API when endpoint is available

      const payloads = allocationDrafts.map((draft) => ({
        investor_org_id: selectedOrg.id,
        project_id: draft.project_id,
        allocation_amount: Number(draft.allocation_amount),
        interest_rate_percentage: Number(draft.interest_rate_percentage),
        investment_method: draft.investment_method,
        investment_type: draft.investment_type,
        profit_split_percentage: draft.profit_split_percentage ? Number(draft.profit_split_percentage) : undefined,
        payment_term: draft.payment_term,
        note_maturity_date: draft.note_maturity_date
          ? formatDDMMYYYY(new Date(draft.note_maturity_date + 'T12:00:00'))
          : undefined,
        investment_date: draft.investment_date
          ? formatDDMMYYYY(new Date(draft.investment_date + 'T12:00:00'))
          : undefined,
      }))

      const result = await allocationsHook.createBulk(payloads)
      if (result === null) {
        setError(allocationsHook.error ?? 'Failed to create allocations.')
        return
      }
      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative space-y-4">
      {/* Error Message - Absolute positioned at top */}
      {error && (
        <div className="sticky top-0 left-0 right-0 z-50 bg-red-100 text-destructive dark:text-red-500 text-sm p-2 flex items-center justify-between gap-2 border border-destructive/20">
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="flex-shrink-0 p-1 hover:bg-destructive/20 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <PrimaryButton
          onClick={handleApply}
          disabled={submitting}
          buttonClassName="bg-tertiary text-background border border-foreground/10 hover:bg-tertiary/30"
          size="sm"
          icon={Check}
          iconPosition="left"
        >
          {submitting ? 'Saving…' : 'Apply'}
        </PrimaryButton>
      </div>

      <GlassInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter investor name"
        label="Name"
        type="text"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />
      <GlassInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone (optional)"
        label="Phone (optional)"
        type="tel"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />

      <div className="border-t border-foreground/10 pt-4">
        <AllocationFormSection
          companyId={selectedOrg?.company_id ?? undefined}
          allocations={allocationDrafts}
          onChange={setAllocationDrafts}
        />
      </div>
    </div>
  )
}

export default InvestorSliderEditContainer
