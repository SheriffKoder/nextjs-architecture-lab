'use client'

import React from 'react'
import CollapsibleCard from '@/components/design/CollapsibleCard-sm'
import SimpleTable, { type SimpleTableColumn } from '@/components/design/simple-table'
import { ChevronDownIcon, Loader2 } from 'lucide-react'
import type { Allocation } from '@/lib/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { capitalizeAllFirstLetters } from '@/lib/utils'

interface InvestorProjectsProps {
  allocations: Allocation[]
  allocationsLoading?: boolean
  onAllocationClick?: (allocation: Allocation) => void
}

const InvestorProjects = ({ allocations, allocationsLoading, onAllocationClick }: InvestorProjectsProps) => {

  const columns: SimpleTableColumn<Allocation>[] = [
    {
      key: 'project',
      label: 'Project',
      minWidth: '160px',
      render: (_, row) => row.project?.address ?? `Project ${row.project_id}`,
    },
    {
      key: 'status_project',
      label: 'Project Status',
      minWidth: '120px',
      render: (_, row) => capitalizeAllFirstLetters(row.project?.status ?? 'N/A'),
    },
    {
      key: 'amount',
      label: 'Amount',
      minWidth: '100px',
      render: (_, row) => formatCurrency(row.allocation_amount),
    },
    {
      key: 'interestRate',
      label: 'Interest Rate',
      minWidth: '100px',
      render: (_, row) => row.interest_rate_percentage != null ? `${row.interest_rate_percentage}%` : 'N/A',
    },
    {
      key: 'method',
      label: 'Method',
      minWidth: '90px',
      render: (_, row) => capitalizeAllFirstLetters(row.investment_method ?? 'N/A'),
    },
    {
      key: 'type',
      label: 'Type',
      minWidth: '90px',
      render: (_, row) => capitalizeAllFirstLetters(row.investment_type ?? 'N/A'),
    },
    {
      key: 'payment_term',
      label: 'Payment Term',
      minWidth: '100px',
      render: (_, row) => capitalizeAllFirstLetters(row.payment_term ?? 'N/A'),
    },
    {
      key: 'status',
      label: 'Allocation Status',
      minWidth: '100px',
      render: (_, row) => capitalizeAllFirstLetters(row.status ?? 'N/A'),
    },
    {
      key: 'accruedInterest',
      label: 'Accrued Interest',
      minWidth: '110px',
      render: (_, row) => formatCurrency(row.accrued_interest),
    },
    {
      key: 'distributed',
      label: 'Distributed',
      minWidth: '110px',
      render: (_, row) => formatCurrency(row.distributed_to_date),
    },
    {
      key: 'maturityDate',
      label: 'Maturity Date',
      minWidth: '110px',
      render: (_, row) => formatDate(row.note_maturity_date),
    },
  ]

  return (
    <CollapsibleCard
      headerText="Investor Projects"
      rightIcon={ChevronDownIcon}
      defaultOpen={true}
      variant="sm"
    >
      {allocationsLoading ? (
        <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Loading allocations…</span>
        </div>
      ) : allocations.length === 0 ? (
        <p className="text-muted-foreground text-sm p-2 text-center">No allocations.</p>
      ) : (
        <SimpleTable<Allocation>
          columns={columns}
          data={allocations}
          getRowKey={(row) => row.id}
          onRowClick={onAllocationClick}
        />
      )}
    </CollapsibleCard>
  )
}

export default InvestorProjects
