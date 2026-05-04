'use client'

import React from 'react'
import GlassInput from '@/components/design/glass-input'
import { DollarSign } from 'lucide-react'

interface DistributionInputsProps {
  distributionAmount: string
  reallocationAmount: string
  onDistributionChange: (value: string) => void
  onReallocationChange: (value: string) => void
  isDistributionDisabled?: boolean
  isReallocationDisabled?: boolean
}

const DistributionInputs: React.FC<DistributionInputsProps> = ({
  distributionAmount,
  reallocationAmount,
  onDistributionChange,
  onReallocationChange,
  isDistributionDisabled = false,
  isReallocationDisabled = false
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Distribution Amount Input */}
      <GlassInput
        value={distributionAmount}
        onChange={(e) => onDistributionChange(e.target.value)}
        placeholder="0.00"
        required={false}
        label="Distribution amount"
        type="number"
        theme="dark"
        labelPosition="top"
        size="sm"
        leftIcon={DollarSign}
        disabled={isDistributionDisabled}
      />

      {/* Re-allocation Amount Input */}
      <GlassInput
        value={reallocationAmount}
        onChange={(e) => onReallocationChange(e.target.value)}
        placeholder="0.00"
        required={false}
        label="Re-allocation amount"
        type="number"
        theme="dark"
        labelPosition="top"
        size="sm"
        leftIcon={DollarSign}
        disabled={isReallocationDisabled}
      />
    </div>
  )
}

export default DistributionInputs
