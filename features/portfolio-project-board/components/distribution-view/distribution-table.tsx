import React from 'react'
import { Allocation } from '@/lib/types'
import { formatCurrency } from '@/utils/formatters'
import { Badge } from '@/components/ui/badge'

interface DistributionTableProps {
  allocations: Allocation[]
  onRowClick?: (allocation: Allocation) => void
}

const DistributionTable = ({ allocations, onRowClick }: DistributionTableProps) => {
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active' || statusLower === 'completed') {
      return 'default'
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return 'secondary'
    }
    if (statusLower === 'failed' || statusLower === 'cancelled') {
      return 'destructive'
    }
    return 'outline'
  }

  const getStatusDisplayName = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  }

  return (
    <div className="w-full min-w-[600px]">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 pb-2 border-b border-border">
        <div className="text-xs text-foreground">Investor</div>
        <div className="text-xs text-foreground">Principal</div>
        <div className="text-xs text-foreground">Interest</div>
        <div className="text-xs text-foreground">Total Due</div>
        <div className="text-xs text-foreground">Action</div>
        <div className="text-xs text-foreground">Status</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border">
        {allocations.map((allocation) => {
          const principal = allocation.allocation_amount || 0
          const interest = allocation.accrued_interest || 0
          const totalDue = principal + interest

          return (
            <div 
              key={allocation.id} 
              className="grid grid-cols-6 gap-4 py-3 cursor-pointer hover:bg-foreground/5 transition-colors"
              onClick={() => onRowClick?.(allocation)}
            >
              {/* Investor */}
              <div className="text-xs text-foreground/60">
                {allocation.created_by?.name || `User ${allocation.created_by_user_id}`}
              </div>

              {/* Principal */}
              <div className="text-xs text-foreground/60">
                {formatCurrency(principal)}
              </div>

              {/* Interest */}
              <div className="text-xs text-foreground/60">
                {formatCurrency(interest)}
              </div>

              {/* Total Due */}
              <div className="text-xs text-foreground/60">
                {formatCurrency(totalDue)}
              </div>

              {/* Action */}
              <div className="text-xs text-foreground/60">
                {/* TODO: Add action button/dropdown */}
                <span className="cursor-pointer hover:text-foreground">View</span>
              </div>

              {/* Status */}
              <div className="text-xs text-foreground/60">
                <Badge variant={getStatusVariant(allocation.status)} className="text-xs">
                  {getStatusDisplayName(allocation.status)}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DistributionTable
