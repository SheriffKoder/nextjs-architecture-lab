import React from 'react'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface DistributionSummaryGridProps {
  saleDate: string | null | undefined
  totalCapitalInvested: number
  totalInterestAccrued: number
  totalAmountToAllocate: number
}

const DistributionSummaryGrid = ({
  saleDate,
  totalCapitalInvested,
  totalInterestAccrued,
  totalAmountToAllocate
}: DistributionSummaryGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {/* Sale Date Card */}
      <div className="bg-foreground/5 dark:bg-[#141414] border border-border rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Sale Date</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatDate(saleDate)}</span>
      </div>

      {/* Total Capital Invested Card */}
      <div className="bg-foreground/5 dark:bg-[#141414] border border-border rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Total Capital Invested</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatCurrency(totalCapitalInvested)}</span>
      </div>

      {/* Total Interest Accrued Card */}
      <div className="bg-foreground/5 dark:bg-[#141414] border border-border rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Total Interest Accrued</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatCurrency(totalInterestAccrued)}</span>
      </div>

      {/* Total Amount to Allocate Card */}
      <div className="bg-foreground/5 dark:bg-[#141414] border border-border rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Total Amount to Allocate</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatCurrency(totalAmountToAllocate)}</span>
      </div>
    </div>
  )
}

export default DistributionSummaryGrid
