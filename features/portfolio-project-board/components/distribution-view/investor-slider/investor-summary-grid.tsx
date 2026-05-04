import React from 'react'
import { formatCurrency } from '@/utils/formatters'

interface InvestorSummaryGridProps {
  originalInvestment: number
  accruedInterest: number
  totalAvailableBalance: number
}

const InvestorSummaryGrid = ({
  originalInvestment,
  accruedInterest,
  totalAvailableBalance
}: InvestorSummaryGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Original Investment Card */}
      <div className="bg-foreground/5 dark:bg-black bg-white rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Original Investment</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatCurrency(originalInvestment)}</span>
      </div>

      {/* Accrued Interest Card */}
      <div className="bg-foreground/5 dark:bg-black bg-white rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Accrued Interest</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatCurrency(accruedInterest)}</span>
      </div>

      {/* Total Available Balance Card */}
      <div className="bg-foreground/5 dark:bg-black bg-white rounded-md p-3 flex flex-col gap-1">
        <span className="text-xs text-foreground/50 dark:font-light">Total Available Balance</span>
        <span className="text-sm text-foreground font-normal dark:font-light mt-auto">{formatCurrency(totalAvailableBalance)}</span>
      </div>
    </div>
  )
}

export default InvestorSummaryGrid
