'use client'

import React, { useEffect, useState } from 'react'
import GlassInput from '@/components/design/inputs/glass-input'
import DropdownSelect from '@/components/design/multi-select/dropdown-select'
import PrimaryButton from '@/components/design/primary-button'
import { Plus, Trash2, DollarSign, Percent, FolderOpen, Tag, ChevronDownIcon } from 'lucide-react'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { useProjects } from '@/hooks'
import {
  AllocationInvestmentMethodEnum,
  AllocationInvestmentTypeEnum,
  AllocationPaymentTermEnum,
} from '@/lib/constants'
import type { DropdownItem } from '@/components/design/multi-select/utils/types'
import { capitalizeAllFirstLetters } from '@/lib/utils'

export interface AllocationDraft {
  project_id: string
  allocation_amount: string
  interest_rate_percentage: string
  investment_method: string
  investment_type: string
  profit_split_percentage: string
  payment_term: string
  note_maturity_date: string
  investment_date: string
}

export function emptyAllocationDraft(): AllocationDraft {
  return {
    project_id: '',
    allocation_amount: '',
    interest_rate_percentage: '',
    investment_method: AllocationInvestmentMethodEnum.CASH,
    investment_type: AllocationInvestmentTypeEnum.COMPOUNDED_INTEREST,
    profit_split_percentage: '',
    payment_term: AllocationPaymentTermEnum.MONTHLY,
    note_maturity_date: '',
    investment_date: '',
  }
}

function enumToItems(obj: Record<string, string>): DropdownItem[] {
  return Object.values(obj).map((v) => ({ id: v, label: capitalizeAllFirstLetters(v), value: v }))
}

const methodItems = enumToItems(AllocationInvestmentMethodEnum)
const typeItems = enumToItems(AllocationInvestmentTypeEnum)
const termItems = enumToItems(AllocationPaymentTermEnum)

interface AllocationFormSectionProps {
  allocations: AllocationDraft[]
  onChange: (allocations: AllocationDraft[]) => void
  /** When set (e.g. in add investor form), only projects for this company are fetched for the project dropdown */
  companyId?: string | null
}

export default function AllocationFormSection({ allocations, onChange, companyId }: AllocationFormSectionProps) {
  const projectsHook = useProjects()
  const [projects, setProjects] = useState<DropdownItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  useEffect(() => {
    // Edit form: companyId not passed (undefined) -> fetch all projects
    if (companyId === undefined) {
      setProjectsLoading(true)
      projectsHook.getAll({ limit: 500 }).then((res) => {
        if (res?.data) {
          setProjects(res.data.map((p) => ({ id: p.id, label: p.address, value: p.id })))
        } else {
          setProjects([])
        }
      }).finally(() => setProjectsLoading(false))
      return
    }
    // Add form, no company selected (null) -> show no projects
    if (companyId === null) {
      setProjects([])
      setProjectsLoading(false)
      return
    }
    // Add form, company selected -> fetch projects for that company
    setProjectsLoading(true)
    projectsHook.getAll({ limit: 500, company_ids: [companyId] }).then((res) => {
      if (res?.data) {
        setProjects(res.data.map((p) => ({ id: p.id, label: p.address, value: p.id })))
      } else {
        setProjects([])
      }
    }).finally(() => setProjectsLoading(false))
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (index: number, field: keyof AllocationDraft, value: string) => {
    const next = [...allocations]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  const add = () => onChange([...allocations, emptyAllocationDraft()])
  const remove = (index: number) => onChange(allocations.filter((_, i) => i !== index))

  const dropdownProps = {
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
    index: number,
    label: string,
    icon: typeof Tag,
    items: DropdownItem[],
    field: keyof AllocationDraft,
    placeholder: string,
  ) => {
    const selected = items.find((i) => i.value === allocations[index][field]) ?? null
    return (
      <div className="flex flex-col gap-1 w-[150px]">
        <label className="block text-xs text-foreground/60">{label}</label>
        <DropdownSelect
          icon={icon}
          buttonText={selected ? selected.label : placeholder}
          items={items}
          selectedItems={selected ? [selected] : []}
          onSelectionChange={(sel: DropdownItem[]) => {
            if (sel.length > 0) update(index, field, sel[0].value)
          }}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          {...dropdownProps}
          searchable={items.length > 5}
          selectedText={label.toLowerCase()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">Allocations</h3>
        <PrimaryButton
          onClick={add}
          buttonClassName="bg-background text-foreground border border-foreground/10 hover:bg-tertiary/30"
          size="sm"
          icon={Plus}
          iconPosition="left"
        >
          Add
        </PrimaryButton>
      </div>

      {allocations.length === 0 && (
        <p className="text-xs text-foreground/40 italic">No allocations added yet.</p>
      )}

      {allocations.map((alloc, idx) => (
        <CollapsibleCard
          key={idx}
          headerText={`Allocation ${idx + 1}`}
          rightIcon={ChevronDownIcon}
          defaultOpen={true}
          variant="sm"
          hideScrollbar={true}
        >
          <div className="space-y-3 p-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-foreground/40 hover:text-destructive transition-colors flex items-center gap-1 text-xs"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>

            {/* Project */}
          <div className="flex flex-col gap-1">
            <label className="block text-xs text-foreground/60">Project</label>
            <DropdownSelect
              icon={FolderOpen}
              buttonText={
                projectsLoading
                  ? 'Loading…'
                  : (() => {
                      const selected = projects.find((i) => i.value === alloc.project_id) ?? null
                      return selected ? selected.label : 'Select Project'
                    })()
              }
              items={projects}
              selectedItems={
                projectsLoading ? [] : (() => {
                  const selected = projects.find((i) => i.value === alloc.project_id) ?? null
                  return selected ? [selected] : []
                })()
              }
              onSelectionChange={(sel: DropdownItem[]) => {
                if (sel.length > 0) update(idx, 'project_id', sel[0].value)
              }}
              searchPlaceholder="Search project..."
              disabled={projectsLoading}
              searchable={projects.length > 5}
              selectedText="project"
              {...dropdownProps}
            />
          </div>

          {/* Amount + Rate side by side + Method + Type */}
          <div className="flex flex-row flex-wrap gap-3">
            <GlassInput
              value={alloc.allocation_amount}
              onChange={(e) => update(idx, 'allocation_amount', e.target.value)}
              placeholder="0.00"
              label="Amount"
              type="number"
              theme="dark"
              size="sm"
              labelPosition="top"
              leftIcon={DollarSign}
              required={false}
              className="w-[150px]"
            />
            <GlassInput
              value={alloc.interest_rate_percentage}
              onChange={(e) => update(idx, 'interest_rate_percentage', e.target.value)}
              placeholder="0.00"
              label="Interest Rate"
              type="number"
              theme="dark"
              size="sm"
              labelPosition="top"
              rightIcon={Percent}
              required={false}
              className="w-[150px]"
            />

            {makeDropdown(idx, 'Method', Tag, methodItems, 'investment_method', 'Select')}
            {makeDropdown(idx, 'Type', Tag, typeItems, 'investment_type', 'Select')}

          </div>

          {/* Payment Term + Profit Split */}
          <div className="flex flex-row flex-wrap gap-3">
            {makeDropdown(idx, 'Payment Term', Tag, termItems, 'payment_term', 'Select')}
            <GlassInput
              value={alloc.profit_split_percentage}
              onChange={(e) => update(idx, 'profit_split_percentage', e.target.value)}
              placeholder="Optional"
              label="Profit Split %"
              type="number"
              theme="dark"
              size="sm"
              labelPosition="top"
              rightIcon={Percent}
              required={false}
              className="w-[150px]"
            />

          {/* Investment Date */}
          <GlassInput
              value={alloc.investment_date}
              onChange={(e) => update(idx, 'investment_date', e.target.value)}
              placeholder="YYYY-MM-DD"
              label="Investment Date"
              type="date"
              theme="dark"
              size="sm"
              labelPosition="top"
              required={false}
              className="w-[150px]"
            />
            <GlassInput
              value={alloc.note_maturity_date}
              onChange={(e) => update(idx, 'note_maturity_date', e.target.value)}
              placeholder="YYYY-MM-DD"
              label="Maturity Date"
              type="date"
              theme="dark"
              size="sm"
              labelPosition="top"
              required={false}
              className="w-[150px]"
            />

          </div>


          </div>
        </CollapsibleCard>
      ))}
    </div>
  )
}
