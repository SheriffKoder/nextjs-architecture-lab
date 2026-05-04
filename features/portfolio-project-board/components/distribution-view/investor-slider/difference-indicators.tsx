'use client'

import React from 'react'
import { formatCurrency } from '@/utils/formatters'
import { Check, X } from 'lucide-react'

interface DifferenceIndicatorsProps {
  distributionAmount: string
  reallocationAmount: string
  totalAvailableBalance: number
  reallocationProjectsSum: number
}

const DifferenceIndicators: React.FC<DifferenceIndicatorsProps> = ({
  distributionAmount,
  reallocationAmount,
  totalAvailableBalance,
  reallocationProjectsSum
}) => {
  // Parse amounts to numbers
  const distributionNum = parseFloat(distributionAmount) || 0
  const reallocationNum = parseFloat(reallocationAmount) || 0
  const sum = distributionNum + reallocationNum

  // Calculate difference between sum and total available balance
  const difference = sum - totalAvailableBalance
  const isEqual = Math.abs(difference) < 0.01 // Allow for floating point precision
  const isOver = difference > 0.01
  const isUnder = difference < -0.01

  // Calculate remaining balance (reallocation amount - sum of reallocation projects)
  const remainingBalance = reallocationNum - reallocationProjectsSum
  const isRemainingBalanceZero = Math.abs(remainingBalance) < 0.01 // Allow for floating point precision

  // Determine status text and color for row 1
  let statusText = ''
  let statusColor = ''

  if (isEqual) {
    statusText = 'Distribution and Re-allocation sum equals total available balance'
    statusColor = 'text-green-600 dark:text-green-400'
  } else if (isOver) {
    statusText = `Distribution and Re-allocation sum is $${Math.abs(difference).toFixed(2)} higher than total available balance`
    statusColor = 'text-red-600 dark:text-red-400'
  } else if (isUnder) {
    statusText = `Distribution and Re-allocation sum is $${Math.abs(difference).toFixed(2)} lower than total available balance`
    statusColor = 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: Distribution and Re-allocation sum comparison */}
      <div className="text-left flex items-center gap-2">
        <span className={`text-xs ${statusColor}`}>
          {statusText}
        </span>
        {isEqual ? (
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : (
          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
        )}
      </div>

      {/* Row 2: Remaining balance */}
      <div className="text-left flex items-center gap-2">
        <span className={`text-xs ${isRemainingBalanceZero ? 'text-foreground/70 dark:font-light' : 'text-red-600 dark:text-red-400'}`}>
          Remaining re-allocation balance: <span className="font-medium">{formatCurrency(remainingBalance)}</span>
        </span>
        {isRemainingBalanceZero ? (
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : (
          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
        )}
      </div>

      {/* Legend: Colored circles with labels */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600 dark:bg-green-400" />
          <span className="text-xs text-foreground/70 dark:font-light">Valid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 dark:bg-red-400" />
          <span className="text-xs text-foreground/70 dark:font-light">Invalid</span>
        </div>
      </div>
    </div>
  )
}

export default DifferenceIndicators
