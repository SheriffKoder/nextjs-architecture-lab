'use client'

import React, { useState, useEffect } from 'react'
import GlassInput from '@/components/design/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'
import { Check, Building2 } from 'lucide-react'
import { useOrgs, useCompanies, useAllocations } from '@/hooks'
import { OrgTypeEnum } from '@/lib/constants'
import { formatDDMMYYYY } from '@/lib/utils'
import type { DropdownItem } from '@/components/design/multi-select-2/utils/types'
import AllocationFormSection, { AllocationDraft } from './allocation-form-section'

interface InvestorSliderAddContainerProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function InvestorSliderAddContainer({ onSuccess, onCancel }: InvestorSliderAddContainerProps) {
  const orgsHook = useOrgs()
  const companiesHook = useCompanies()
  const allocationsHook = useAllocations()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<DropdownItem[]>([])
  const [allocationDrafts, setAllocationDrafts] = useState<AllocationDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    companiesHook.getAll({ limit: 500 }).then((res) => {
      if (res?.data) {
        setCompanies(res.data.map((c) => ({ id: c.id, label: c.name, value: c.id })))
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCompany = companyId ? companies.find((i) => i.id === companyId) ?? null : null

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) { setError('Name is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }

    for (let i = 0; i < allocationDrafts.length; i++) {
      const a = allocationDrafts[i]
      if (!a.project_id) { setError(`Allocation ${i + 1}: Project is required.`); return }
      if (!a.allocation_amount) { setError(`Allocation ${i + 1}: Amount is required.`); return }
      if (!a.interest_rate_percentage) { setError(`Allocation ${i + 1}: Interest rate is required.`); return }
    }

    setSubmitting(true)
    try {
      const org = await orgsHook.create({
        name: name.trim(),
        org_types: [OrgTypeEnum.INVESTOR],
        company_id: companyId || undefined,
        adminName: name.trim(),
        adminEmail: email.trim(),
        adminPhone: phone.trim() || undefined,
      })
      if (!org) {
        setError(orgsHook.error ?? 'Failed to create investor.')
        return
      }

      if (allocationDrafts.length > 0) {
        const payloads = allocationDrafts.map((draft) => ({
          investor_org_id: org.id,
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
        const allocResult = await allocationsHook.createBulk(payloads)
        if (allocResult === null) {
          setError(allocationsHook.error ?? 'Failed to create allocations.')
          return
        }
      }

      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-2">{error}</div>
      )}
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        label="Email"
        type="email"
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
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Company</label>
        <DropdownSelect
          icon={Building2}
          buttonText={selectedCompany ? selectedCompany.label : 'Select Company (optional)'}
          items={companies}
          selectedItems={selectedCompany ? [selectedCompany] : []}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setCompanyId(String(items[0].id))
            else setCompanyId(null)
          }}
          searchPlaceholder="Search company..."
          searchable={true}
          width="100%"
          maxHeight="400px"
          selectedText="company"
          showSelectedItems={true}
          showItemCount={false}
          showCheckboxes={false}
          singleChoice={true}
          hideTopButtons={true}
          className="w-full"
        />
      </div>

      {/* Allocations */}
      <div className="border-t border-foreground/10 pt-4">
        <AllocationFormSection
          companyId={companyId}
          allocations={allocationDrafts}
          onChange={setAllocationDrafts}
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <PrimaryButton
            onClick={onCancel}
            buttonClassName="bg-background text-foreground border border-foreground/10 hover:bg-tertiary/30"
            size="sm"
          >
            Cancel
          </PrimaryButton>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          disabled={submitting}
          buttonClassName="bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
          size="sm"
          icon={Check}
          iconPosition="right"
        >
          {submitting ? 'Creating…' : 'Create Investor'}
        </PrimaryButton>
      </div>
    </div>
  )
}
