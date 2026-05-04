'use client'

import React, { useState, useEffect } from 'react'
import { ProjectBoardTableItem } from '../config/table-config'
import GlassInput from '@/components/design/glass-input'
import PrimaryButton from '@/components/design/primary-button'
import DropdownSelect from '@/components/design/multi-select-2/dropdown-select'
import { Check, Building2, DollarSign, Handshake, Home, HardHat, FileCheck, FolderSymlink, Tag } from 'lucide-react'
import { useCompanies, useOrgs, useProjects, useTitleCompanies } from '@/hooks'
import { formatDDMMYYYY } from '@/lib/utils'
import { ProjectStatusEnum } from '@/lib/constants'
import { getProjectStatusDisplayName } from '@/utils/projects/project-status-utils'
import type { DropdownItem } from '@/components/design/multi-select-2/utils/types'

interface ProjectSliderEditContainerProps {
  selectedProject: ProjectBoardTableItem | null
  onDistributionViewOpen?: () => void
  onSuccess?: () => void
}

function toDropdownItems(orgs: { id: string; name: string }[]): DropdownItem[] {
  return orgs.map((o) => ({ id: o.id, label: o.name, value: o.id }))
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

const statusItems: DropdownItem[] = Object.values(ProjectStatusEnum).map((s) => ({
  id: s,
  label: getProjectStatusDisplayName(s),
  value: s,
}))

const CLEAR_OPTION: DropdownItem = { id: '', label: 'None', value: '' }

const ProjectSliderEditContainer = ({ selectedProject, onDistributionViewOpen, onSuccess }: ProjectSliderEditContainerProps) => {
  const companiesHook = useCompanies()
  const orgsHook = useOrgs()
  const projectsHook = useProjects()
  const titleCompaniesHook = useTitleCompanies()

  // Reference data
  const [companies, setCompanies] = useState<DropdownItem[]>([])
  const [lenders, setLenders] = useState<DropdownItem[]>([])
  const [realtors, setRealtors] = useState<DropdownItem[]>([])
  const [contractors, setContractors] = useState<DropdownItem[]>([])
  const [titleCompanies, setTitleCompanies] = useState<DropdownItem[]>([])

  // Form state — initialised from selectedProject
  const [companyId, setCompanyId] = useState<string | null>(selectedProject?.company_id ?? null)
  const [address, setAddress] = useState(selectedProject?.address ?? '')
  const [status, setStatus] = useState(selectedProject?.status ?? ProjectStatusEnum.PENDING_PURCHASE)
  const [purchase_price, setPurchasePrice] = useState(formatNum(selectedProject?.purchase_price))
  const [rehab_budget, setRehabBudget] = useState(formatNum(selectedProject?.rehab_budget))
  const [after_repair_value, setAfterRepairValue] = useState(formatNum(selectedProject?.after_repair_value))
  const [mortgage_amount, setMortgageAmount] = useState(formatNum(selectedProject?.mortgage_amount))
  const [lender_org_id, setLenderOrgId] = useState<string | null>(selectedProject?.lender_org_id ?? null)
  const [realtor_org_id, setRealtorOrgId] = useState<string | null>(selectedProject?.realtor_org_id ?? null)
  const [contractor_org_id, setContractorOrgId] = useState<string | null>(selectedProject?.contractor_org_id ?? null)
  const [title_company_id, setTitleCompanyId] = useState<string | null>(selectedProject?.title_company_id ?? null)
  const [purchase_closing_date, setPurchaseClosingDate] = useState(toDateInputValue(selectedProject?.purchase_closing_date))
  const [sale_date, setSaleDate] = useState(toDateInputValue(selectedProject?.sale_date))

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load reference data
  useEffect(() => {
    companiesHook.getAll({ limit: 500 }).then((res) => {
      if (res?.data) setCompanies(res.data.map((c) => ({ id: c.id, label: c.name, value: c.id })))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    orgsHook.getAll({ org_type: 'lender', limit: 500 }).then((res) => {
      if (res?.data) setLenders(toDropdownItems(res.data))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    orgsHook.getAll({ org_type: 'realtor', limit: 500 }).then((res) => {
      if (res?.data) setRealtors(toDropdownItems(res.data))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    orgsHook.getAll({ org_type: 'contractor', limit: 500 }).then((res) => {
      if (res?.data) setContractors(toDropdownItems(res.data))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    titleCompaniesHook.getAll({ limit: 500 }).then((res) => {
      if (res?.data) setTitleCompanies(res.data.map((c) => ({ id: c.id, label: c.name, value: c.id })))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedProject) return null

  // Selected items for dropdowns (optional fields get CLEAR_OPTION when null)
  const selectedCompany = companyId ? companies.find((i) => i.id === companyId) ?? null : null
  const selectedLender = lender_org_id ? lenders.find((i) => i.id === lender_org_id) ?? null : null
  const selectedRealtor = realtor_org_id ? realtors.find((i) => i.id === realtor_org_id) ?? null : null
  const selectedContractor = contractor_org_id ? contractors.find((i) => i.id === contractor_org_id) ?? null : null
  const selectedTitleCompany = title_company_id ? titleCompanies.find((i) => i.id === title_company_id) ?? null : null
  const selectedStatus = statusItems.find((i) => i.value === status) ?? null

  const toSingle = (item: DropdownItem | null) => (item ? [item] : [])
  const toSingleOrClear = (item: DropdownItem | null, cleared: boolean) =>
    cleared ? [CLEAR_OPTION] : toSingle(item)

  const handleSubmit = async () => {
    setError(null)
    if (!address.trim()) { setError('Address is required.'); return }
    if (!companyId) { setError('Company is required.'); return }

    setSubmitting(true)
    try {
      const payload = {
        company_id: companyId,
        address: address.trim(),
        status: status,
        purchase_price: purchase_price === '' ? undefined : Number(purchase_price),
        rehab_budget: rehab_budget === '' ? undefined : Number(rehab_budget),
        after_repair_value: after_repair_value === '' ? undefined : Number(after_repair_value),
        mortgage_amount: mortgage_amount === '' ? undefined : Number(mortgage_amount),
        lender_org_id: lender_org_id || null,
        realtor_org_id: realtor_org_id || null,
        contractor_org_id: contractor_org_id || null,
        title_company_id: title_company_id || null,
        purchase_closing_date: purchase_closing_date
          ? formatDDMMYYYY(new Date(purchase_closing_date + 'T12:00:00'))
          : null,
        sale_date: sale_date ? formatDDMMYYYY(new Date(sale_date + 'T12:00:00')) : null,
      }
      const project = await projectsHook.update(selectedProject.id, payload)
      if (project) {
        onSuccess?.()
      } else {
        setError(projectsHook.error ?? 'Failed to update project.')
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
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {onDistributionViewOpen && (
          <PrimaryButton
            onClick={onDistributionViewOpen}
            buttonClassName="bg-background text-foreground border border-foreground/10 hover:bg-tertiary/30"
            size="sm"
            icon={FolderSymlink}
            iconPosition="right"
          >
            Close project
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
          {submitting ? 'Saving…' : 'Apply'}
        </PrimaryButton>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-2">{error}</div>
      )}

      {/* Company */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Company</label>
        <DropdownSelect
          icon={Building2}
          buttonText={selectedCompany ? selectedCompany.label : 'Select Company'}
          items={companies}
          selectedItems={toSingle(selectedCompany)}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setCompanyId(String(items[0].id))
          }}
          searchPlaceholder="Search company..."
          {...dropdownProps}
          selectedText="company"
        />
      </div>

      {/* Address */}
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

      {/* Status */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Status</label>
        <DropdownSelect
          icon={Tag}
          buttonText={selectedStatus ? selectedStatus.label : 'Select Status'}
          items={statusItems}
          selectedItems={toSingle(selectedStatus)}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setStatus(items[0].value)
          }}
          searchPlaceholder="Search status..."
          {...dropdownProps}
          searchable={false}
          selectedText="status"
        />
      </div>

      {/* Financials */}
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

      {/* Lender */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Lender</label>
        <DropdownSelect
          icon={Handshake}
          buttonText={selectedLender ? selectedLender.label : 'None'}
          items={[CLEAR_OPTION, ...lenders]}
          selectedItems={toSingleOrClear(selectedLender, !lender_org_id)}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setLenderOrgId(items[0].id === '' ? null : String(items[0].id))
          }}
          searchPlaceholder="Search lender..."
          {...dropdownProps}
          selectedText="lender"
        />
      </div>

      {/* Realtor */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Realtor</label>
        <DropdownSelect
          icon={Home}
          buttonText={selectedRealtor ? selectedRealtor.label : 'None'}
          items={[CLEAR_OPTION, ...realtors]}
          selectedItems={toSingleOrClear(selectedRealtor, !realtor_org_id)}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setRealtorOrgId(items[0].id === '' ? null : String(items[0].id))
          }}
          searchPlaceholder="Search realtor..."
          {...dropdownProps}
          selectedText="realtor"
        />
      </div>

      {/* Contractor */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Contractor</label>
        <DropdownSelect
          icon={HardHat}
          buttonText={selectedContractor ? selectedContractor.label : 'None'}
          items={[CLEAR_OPTION, ...contractors]}
          selectedItems={toSingleOrClear(selectedContractor, !contractor_org_id)}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setContractorOrgId(items[0].id === '' ? null : String(items[0].id))
          }}
          searchPlaceholder="Search contractor..."
          {...dropdownProps}
          selectedText="contractor"
        />
      </div>

      {/* Title Company */}
      <div className="flex flex-col gap-2">
        <label className="block text-sm text-foreground/70">Title Company</label>
        <DropdownSelect
          icon={FileCheck}
          buttonText={selectedTitleCompany ? selectedTitleCompany.label : 'None'}
          items={[CLEAR_OPTION, ...titleCompanies]}
          selectedItems={toSingleOrClear(selectedTitleCompany, !title_company_id)}
          onSelectionChange={(items: DropdownItem[]) => {
            if (items.length > 0) setTitleCompanyId(items[0].id === '' ? null : String(items[0].id))
          }}
          searchPlaceholder="Search title company..."
          {...dropdownProps}
          selectedText="title company"
        />
      </div>

      {/* Dates */}
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
    </div>
  )
}

export default ProjectSliderEditContainer
