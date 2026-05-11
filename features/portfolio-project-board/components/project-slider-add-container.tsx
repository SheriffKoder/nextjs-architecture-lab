'use client'

import React, { useState, useEffect } from 'react'
import GlassInput from '@/components/design/inputs/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import DropdownSelect from '@/components/design/multi-select/dropdown-select'
import { Check, Building2, DollarSign, Handshake, Home, HardHat, FileCheck } from 'lucide-react'
import { useCompanies, useOrgs, useProjects, useTitleCompanies } from '@/hooks'
import { formatDDMMYYYY } from '@/lib/utils'
import type { Project } from '@/lib/types'
import type { DropdownItem } from '@/components/design/multi-select/utils/types'

interface ProjectSliderAddContainerProps {
  onSuccess?: (project: Project) => void
  onCancel?: () => void
}

function toDropdownItems(orgs: { id: string; name: string }[]): DropdownItem[] {
  return orgs.map((o) => ({ id: o.id, label: o.name, value: o.id }))
}

export default function ProjectSliderAddContainer({ onSuccess, onCancel }: ProjectSliderAddContainerProps) {
  const companiesHook = useCompanies()
  const orgsHook = useOrgs()
  const projectsHook = useProjects()
  const titleCompaniesHook = useTitleCompanies()

  const [companies, setCompanies] = useState<DropdownItem[]>([])
  const [lenders, setLenders] = useState<DropdownItem[]>([])
  const [realtors, setRealtors] = useState<DropdownItem[]>([])
  const [contractors, setContractors] = useState<DropdownItem[]>([])
  const [titleCompanies, setTitleCompanies] = useState<DropdownItem[]>([])

  const [companyId, setCompanyId] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [purchase_price, setPurchasePrice] = useState<string>('')
  const [rehab_budget, setRehabBudget] = useState<string>('')
  const [after_repair_value, setAfterRepairValue] = useState<string>('')
  const [mortgage_amount, setMortgageAmount] = useState<string>('')
  const [lender_org_id, setLenderOrgId] = useState<string | null>(null)
  const [realtor_org_id, setRealtorOrgId] = useState<string | null>(null)
  const [contractor_org_id, setContractorOrgId] = useState<string | null>(null)
  const [title_company_id, setTitleCompanyId] = useState<string | null>(null)
  const [purchase_closing_date, setPurchaseClosingDate] = useState<string>('')
  const [sale_date, setSaleDate] = useState<string>('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    companiesHook.getAll({ limit: 500 }).then((res) => {
      if (res?.data) {
        setCompanies(res.data.map((c) => ({ id: c.id, label: c.name, value: c.id })))
      }
    })
  }, [])

  useEffect(() => {
    orgsHook.getAll({ org_type: 'lender', limit: 500 }).then((res) => {
      if (res?.data) setLenders(toDropdownItems(res.data))
    })
  }, [])
  useEffect(() => {
    orgsHook.getAll({ org_type: 'realtor', limit: 500 }).then((res) => {
      if (res?.data) setRealtors(toDropdownItems(res.data))
    })
  }, [])
  useEffect(() => {
    orgsHook.getAll({ org_type: 'contractor', limit: 500 }).then((res) => {
      if (res?.data) setContractors(toDropdownItems(res.data))
    })
  }, [])
  useEffect(() => {
    titleCompaniesHook.getAll({ limit: 500 }).then((res) => {
      if (res?.data) {
        setTitleCompanies(res.data.map((c) => ({ id: c.id, label: c.name, value: c.id })))
      }
    })
  }, [])

  const selectedCompany = companyId ? companies.find((item) => item.id === companyId) ?? null : null
  const selectedLender = lender_org_id ? lenders.find((item) => item.id === lender_org_id) ?? null : null
  const selectedRealtor = realtor_org_id ? realtors.find((item) => item.id === realtor_org_id) ?? null : null
  const selectedContractor = contractor_org_id ? contractors.find((item) => item.id === contractor_org_id) ?? null : null
  const selectedTitleCompany = title_company_id ? titleCompanies.find((item) => item.id === title_company_id) ?? null : null

  const toSingle = (item: DropdownItem | null) => (item ? [item] : [])
  const selectedCompanyItems = toSingle(selectedCompany)
  const selectedLenderItems = toSingle(selectedLender)
  const selectedRealtorItems = toSingle(selectedRealtor)
  const selectedContractorItems = toSingle(selectedContractor)
  const selectedTitleCompanyItems = toSingle(selectedTitleCompany)

  const handleSubmit = async () => {
    setError(null)
    if (!address.trim()) {
      setError('Address is required.')
      return
    }
    if (!companyId) {
      setError('Company is required.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        company_id: companyId,
        address: address.trim(),
        purchase_price: purchase_price === '' ? undefined : Number(purchase_price),
        rehab_budget: rehab_budget === '' ? undefined : Number(rehab_budget),
        after_repair_value: after_repair_value === '' ? undefined : Number(after_repair_value),
        mortgage_amount: mortgage_amount === '' ? undefined : Number(mortgage_amount),
        lender_org_id: lender_org_id || undefined,
        realtor_org_id: realtor_org_id || undefined,
        contractor_org_id: contractor_org_id || undefined,
        title_company_id: title_company_id || undefined,
        purchase_closing_date: purchase_closing_date
          ? formatDDMMYYYY(new Date(purchase_closing_date + 'T12:00:00'))
          : undefined,
        sale_date: sale_date ? formatDDMMYYYY(new Date(sale_date + 'T12:00:00')) : undefined,
      }
      const project = await projectsHook.create(payload)
      if (project) {
        onSuccess?.(project)
      } else {
        setError(projectsHook.error ?? 'Failed to create project.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const dropdownProps = {
    searchable: true,
    width: '100%' as const,
    maxHeight: '400px',
    showSelectedItems: true,
    showItemCount: false,
    showCheckboxes: false,
    singleChoice: true,
    hideTopButtons: true,
    className: 'w-full',
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-2">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Company</label>
        <DropdownSelect
          icon={Building2}
          buttonText={selectedCompany ? selectedCompany.label : 'Select Company'}
          items={companies}
          selectedItems={selectedCompanyItems}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setCompanyId(String(items[0].id))
          }}
          searchPlaceholder="Search company..."
          {...dropdownProps}
          selectedText="company"
        />
      </div>

      <GlassInput
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address"
        label="Address"
        type="text"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />

      <GlassInput
        value={purchase_price}
        onChange={(e) => setPurchasePrice(e.target.value)}
        placeholder="Enter purchase price"
        label="Purchase Price"
        type="number"
        theme="dark"
        size="sm"
        labelPosition="top"
        leftIcon={DollarSign}
        required={false}
      />
      <GlassInput
        value={rehab_budget}
        onChange={(e) => setRehabBudget(e.target.value)}
        placeholder="Enter rehab budget"
        label="Rehab Budget"
        type="number"
        theme="dark"
        size="sm"
        labelPosition="top"
        leftIcon={DollarSign}
        required={false}
      />
      <GlassInput
        value={after_repair_value}
        onChange={(e) => setAfterRepairValue(e.target.value)}
        placeholder="Enter after repair value"
        label="ARV"
        type="number"
        theme="dark"
        size="sm"
        labelPosition="top"
        leftIcon={DollarSign}
        required={false}
      />
      <GlassInput
        value={mortgage_amount}
        onChange={(e) => setMortgageAmount(e.target.value)}
        placeholder="Enter mortgage amount"
        label="Mortgage Amount"
        type="number"
        theme="dark"
        size="sm"
        labelPosition="top"
        leftIcon={DollarSign}
        required={false}
      />

      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Lender</label>
        <DropdownSelect
          icon={Handshake}
          buttonText={selectedLender ? selectedLender.label : 'Select Lender'}
          items={lenders}
          selectedItems={selectedLenderItems}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setLenderOrgId(String(items[0].id))
          }}
          searchPlaceholder="Search lender..."
          {...dropdownProps}
          selectedText="lender"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Realtor</label>
        <DropdownSelect
          icon={Home}
          buttonText={selectedRealtor ? selectedRealtor.label : 'Select Realtor'}
          items={realtors}
          selectedItems={selectedRealtorItems}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setRealtorOrgId(String(items[0].id))
          }}
          searchPlaceholder="Search realtor..."
          {...dropdownProps}
          selectedText="realtor"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Contractor</label>
        <DropdownSelect
          icon={HardHat}
          buttonText={selectedContractor ? selectedContractor.label : 'Select Contractor'}
          items={contractors}
          selectedItems={selectedContractorItems}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setContractorOrgId(String(items[0].id))
          }}
          searchPlaceholder="Search contractor..."
          {...dropdownProps}
          selectedText="contractor"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Title Company</label>
        <DropdownSelect
          icon={FileCheck}
          buttonText={selectedTitleCompany ? selectedTitleCompany.label : 'Select Title Company'}
          items={titleCompanies}
          selectedItems={selectedTitleCompanyItems}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setTitleCompanyId(String(items[0].id))
          }}
          searchPlaceholder="Search title company..."
          {...dropdownProps}
          selectedText="title company"
        />
      </div>

      <GlassInput
        value={purchase_closing_date}
        onChange={(e) => setPurchaseClosingDate(e.target.value)}
        placeholder="YYYY-MM-DD"
        label="Purchase Closing Date"
        type="date"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />
      <GlassInput
        value={sale_date}
        onChange={(e) => setSaleDate(e.target.value)}
        placeholder="YYYY-MM-DD"
        label="Sale Date"
        type="date"
        theme="dark"
        size="sm"
        labelPosition="top"
        required={false}
      />

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
          {submitting ? 'Creating…' : 'Create Project'}
        </PrimaryButton>
      </div>
    </div>
  )
}
