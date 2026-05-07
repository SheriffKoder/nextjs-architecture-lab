'use client'

import React, { useEffect, useState } from 'react'
import GlassInput from '@/components/design/inputs/glass-input'
import DropdownSelect from '@/components/design/multi-select/dropdown-select'
import PrimaryButton from '@/components/design/primary-button'
import { Check, DollarSign, Percent, FolderOpen, Tag } from 'lucide-react'
import { useAllocations, useProjects } from '@/hooks'
import {
  AllocationInvestmentMethodEnum,
  AllocationInvestmentTypeEnum,
  AllocationPaymentTermEnum,
  AllocationStatusEnum,
} from '@/lib/constants'
import { formatDDMMYYYY } from '@/lib/utils'
import { capitalizeAllFirstLetters } from '@/lib/utils'
import type { Allocation } from '@/lib/types'
import type { DropdownItem } from '@/components/design/multi-select/utils/types'

function enumToItems(obj: Record<string, string>): DropdownItem[] {
  return Object.values(obj).map((v) => ({ id: v, label: capitalizeAllFirstLetters(v), value: v }))
}

const methodItems = enumToItems(AllocationInvestmentMethodEnum)
const typeItems = enumToItems(AllocationInvestmentTypeEnum)
const termItems = enumToItems(AllocationPaymentTermEnum)
const statusItems = enumToItems(AllocationStatusEnum)

interface AllocationEditSliderProps {
  allocation: Allocation
  onSuccess?: () => void
  onCancel?: () => void
}

function toInputDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function AllocationEditSlider({ allocation, onSuccess, onCancel }: AllocationEditSliderProps) {
  const allocationsHook = useAllocations()
  const projectsHook = useProjects()

  const [projects, setProjects] = useState<DropdownItem[]>([])
  const [projectId, setProjectId] = useState(allocation.project_id)
  const [amount, setAmount] = useState(String(allocation.allocation_amount ?? ''))
  const [interestRate, setInterestRate] = useState(String(allocation.interest_rate_percentage ?? ''))
  const [method, setMethod] = useState(allocation.investment_method ?? AllocationInvestmentMethodEnum.CASH)
  const [type, setType] = useState(allocation.investment_type ?? AllocationInvestmentTypeEnum.COMPOUNDED_INTEREST)
  const [profitSplit, setProfitSplit] = useState(allocation.profit_split_percentage != null ? String(allocation.profit_split_percentage) : '')
  const [paymentTerm, setPaymentTerm] = useState(allocation.payment_term ?? AllocationPaymentTermEnum.MONTHLY)
  const [status, setStatus] = useState(allocation.status ?? AllocationStatusEnum.ACTIVE)
  const [investmentDate, setInvestmentDate] = useState(toInputDate(allocation.investment_date))
  const [maturityDate, setMaturityDate] = useState(toInputDate(allocation.note_maturity_date))

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    projectsHook.getAll({ limit: 500 }).then((res) => {
      if (res?.data) {
        setProjects(res.data.map((p) => ({ id: p.id, label: p.address, value: p.id })))
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dropdownProps = {
    searchable: true,
    width: '100%' as const,
    maxHeight: '300px',
    showSelectedItems: true,
    showItemCount: false,
    showCheckboxes: false,
    singleChoice: true,
    hideTopButtons: true,
    className: 'w-full',
  }

  const makeDropdown = (
    label: string,
    icon: typeof Tag,
    items: DropdownItem[],
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
  ) => {
    const selected = items.find((i) => i.value === value) ?? null
    return (
      <div className="flex flex-col gap-1">
        <label className="block text-xs text-foreground/60">{label}</label>
        <DropdownSelect
          icon={icon}
          buttonText={selected ? selected.label : placeholder}
          items={items}
          selectedItems={selected ? [selected] : []}
          onSelectionChange={(sel: DropdownItem[]) => {
            if (sel.length > 0) onChange(sel[0].value)
          }}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          {...dropdownProps}
          searchable={items.length > 5}
          selectedText={label.toLowerCase()}
        />
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!projectId) { setError('Project is required.'); return }
    if (!amount) { setError('Amount is required.'); return }
    if (!interestRate) { setError('Interest rate is required.'); return }

    setError(null)
    setSubmitting(true)
    try {
      const result = await allocationsHook.update(allocation.id, {
        project_id: projectId,
        allocation_amount: Number(amount),
        interest_rate_percentage: Number(interestRate),
        investment_method: method,
        investment_type: type,
        profit_split_percentage: profitSplit ? Number(profitSplit) : undefined,
        payment_term: paymentTerm,
        note_maturity_date: maturityDate
          ? formatDDMMYYYY(new Date(maturityDate + 'T12:00:00'))
          : undefined,
        investment_date: investmentDate
          ? formatDDMMYYYY(new Date(investmentDate + 'T12:00:00'))
          : undefined,
      })
      if (result) {
        onSuccess?.()
      } else {
        setError(allocationsHook.error ?? 'Failed to update allocation.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">Edit Allocation</h3>
        <div className="flex gap-2">
          {onCancel && (
            <PrimaryButton
              onClick={onCancel}
              buttonClassName="bg-background text-foreground border border-foreground/10 hover:bg-foreground/5"
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
            {submitting ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-2">{error}</div>
      )}

      {makeDropdown('Project', FolderOpen, projects, projectId, setProjectId, 'Select Project')}

      {makeDropdown('Status', Tag, statusItems, status, setStatus, 'Select Status')}

      <div className="grid grid-cols-2 gap-3">
        <GlassInput
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          label="Amount"
          type="number"
          theme="dark"
          size="sm"
          labelPosition="top"
          leftIcon={DollarSign}
          required={false}
        />
        <GlassInput
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          placeholder="0.00"
          label="Interest Rate"
          type="number"
          theme="dark"
          size="sm"
          labelPosition="top"
          rightIcon={Percent}
          required={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {makeDropdown('Method', Tag, methodItems, method, setMethod, 'Select')}
        {makeDropdown('Type', Tag, typeItems, type, setType, 'Select')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {makeDropdown('Payment Term', Tag, termItems, paymentTerm, setPaymentTerm, 'Select')}
        <GlassInput
          value={profitSplit}
          onChange={(e) => setProfitSplit(e.target.value)}
          placeholder="Optional"
          label="Profit Split %"
          type="number"
          theme="dark"
          size="sm"
          labelPosition="top"
          rightIcon={Percent}
          required={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GlassInput
          value={investmentDate}
          onChange={(e) => setInvestmentDate(e.target.value)}
          placeholder="YYYY-MM-DD"
          label="Investment Date"
          type="date"
          theme="dark"
          size="sm"
          labelPosition="top"
          required={false}
        />
        <GlassInput
          value={maturityDate}
          onChange={(e) => setMaturityDate(e.target.value)}
          placeholder="YYYY-MM-DD"
          label="Maturity Date"
          type="date"
          theme="dark"
          size="sm"
          labelPosition="top"
          required={false}
        />
      </div>
    </div>
  )
}
