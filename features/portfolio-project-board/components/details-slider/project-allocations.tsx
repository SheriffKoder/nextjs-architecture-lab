'use client'

import { useEffect, useState } from 'react'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import { ChevronDownIcon } from 'lucide-react'
import { Allocation } from '@/lib/types'
import { ProjectBoardTableItem } from '../../config/table-config'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useAllocations } from '@/hooks'

interface ProjectAllocationsProps {
  selectedProject: ProjectBoardTableItem
}

const ProjectAllocations = ({ selectedProject }: ProjectAllocationsProps) => {
  const { getAll, loading, error } = useAllocations()
  const [allocations, setAllocations] = useState<Allocation[]>([])

  useEffect(() => {
    if (!selectedProject?.id) {
      setAllocations([])
      return
    }
    let cancelled = false
    getAll({ projectIds: [selectedProject.id], limit: 100 })
      .then((res) => {
        if (!cancelled && res?.data) setAllocations(res.data)
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when project changes
  }, [selectedProject?.id])

  if (!selectedProject?.id) return null
  if (loading && allocations.length === 0) {
    return (
      <CollapsibleCard headerText="Project Investors" rightIcon={ChevronDownIcon} defaultOpen={true} variant="sm">
        <div className="px-3 py-4 text-sm text-muted-foreground">Loading allocations…</div>
      </CollapsibleCard>
    )
  }
  if (error && allocations.length === 0) {
    return (
      <CollapsibleCard headerText="Project Investors" rightIcon={ChevronDownIcon} defaultOpen={true} variant="sm">
        <div className="px-3 py-4 text-sm text-destructive">{error}</div>
      </CollapsibleCard>
    )
  }
  if (!allocations.length) {
    return (
      <CollapsibleCard headerText="Project Investors" rightIcon={ChevronDownIcon} defaultOpen={true} variant="sm">
        <div className="px-3 py-4 text-sm text-muted-foreground">No allocations for this project.</div>
      </CollapsibleCard>
    )
  }

  // Table columns configuration
  const columns = [
    { key: 'investor', label: 'Investor', minWidth: '120px' },
    { key: 'amount', label: 'Amount', minWidth: '100px' },
    { key: 'interestRate', label: 'Interest Rate', minWidth: '100px' },
    { key: 'method', label: 'Method', minWidth: '100px' },
    { key: 'type', label: 'Type', minWidth: '100px' },
    { key: 'status', label: 'Status', minWidth: '80px' },
    { key: 'accruedInterest', label: 'Accrued Interest', minWidth: '120px' },
    { key: 'distributed', label: 'Distributed', minWidth: '120px' },
    { key: 'maturityDate', label: 'Maturity Date', minWidth: '120px' },
  ]

  return (
    <CollapsibleCard 
      headerText="Project Investors"
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      <div className="w-full overflow-x-auto">
        {/* Table Header */}
        <div className="flex items-center border-b border-foreground/10 bg-transparent sticky top-0 z-10">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-3 py-2 text-xs font-semibold text-tertiary uppercase tracking-wider whitespace-nowrap"
              style={{ minWidth: column.minWidth }}
            >
              {column.label}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-foreground/5">
          {allocations.map((allocation) => (
            <div
              key={allocation.id}
              className="flex items-center hover:bg-foreground/5 transition-colors group"
            >
              {/* Investor */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate"
                style={{ minWidth: columns[0].minWidth }}
                title={allocation.investor_org?.name || allocation.investor_org_id}
              >
                {allocation.investor_org?.name || allocation.investor_org_id}
              </div>

              {/* Amount */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate"
                style={{ minWidth: columns[1].minWidth }}
                title={formatCurrency(allocation.allocation_amount)}
              >
                {formatCurrency(allocation.allocation_amount)}
              </div>

              {/* Interest Rate */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate"
                style={{ minWidth: columns[2].minWidth }}
                title={allocation.interest_rate_percentage ? `${allocation.interest_rate_percentage}%` : 'N/A'}
              >
                {allocation.interest_rate_percentage ? `${allocation.interest_rate_percentage}%` : 'N/A'}
              </div>

              {/* Method */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate capitalize"
                style={{ minWidth: columns[3].minWidth }}
                title={allocation.investment_method}
              >
                {allocation.investment_method}
              </div>

              {/* Type */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate capitalize"
                style={{ minWidth: columns[4].minWidth }}
                title={allocation.investment_type}
              >
                {allocation.investment_type}
              </div>

              {/* Status */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate capitalize"
                style={{ minWidth: columns[5].minWidth }}
                title={allocation.status}
              >
                {allocation.status}
              </div>

              {/* Accrued Interest */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate"
                style={{ minWidth: columns[6].minWidth }}
                title={formatCurrency(allocation.accrued_interest)}
              >
                {formatCurrency(allocation.accrued_interest)}
              </div>

              {/* Distributed */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate"
                style={{ minWidth: columns[7].minWidth }}
                title={formatCurrency(allocation.distributed_to_date)}
              >
                {formatCurrency(allocation.distributed_to_date)}
              </div>

              {/* Maturity Date */}
              <div
                className="px-3 py-2 text-sm text-foreground/70 font-normal dark:font-extralight group-hover:text-tertiary truncate"
                style={{ minWidth: columns[8].minWidth }}
                title={formatDate(allocation.note_maturity_date)}
              >
                {formatDate(allocation.note_maturity_date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleCard>
  )
}

export default ProjectAllocations
