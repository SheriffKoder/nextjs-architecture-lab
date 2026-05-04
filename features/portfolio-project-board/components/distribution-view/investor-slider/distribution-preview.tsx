'use client'

import React, { useState } from 'react'
import { formatCurrency } from '@/utils/formatters'
import { Checkbox } from '@/components/ui/checkbox'

interface ReallocationProjectPreview {
  projectId: string
  projectName: string
  amount: number
}

interface DistributionPreviewProps {
  distributionAmount: string
  reallocationAmount: string
  reallocationProjects: ReallocationProjectPreview[]
  onSendEmailChange: (sendEmail: boolean) => void
}

const DistributionPreview: React.FC<DistributionPreviewProps> = ({
  distributionAmount,
  reallocationAmount,
  reallocationProjects,
  onSendEmailChange
}) => {
  const [sendEmail, setSendEmail] = useState(false)

  const handleEmailCheckboxChange = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true
    setSendEmail(isChecked)
    onSendEmailChange(isChecked)
  }

  const distributionNum = parseFloat(distributionAmount) || 0
  const reallocationNum = parseFloat(reallocationAmount) || 0

  return (
    <div className="flex flex-col gap-4 border-t dark:border-border border-neutral-400/30 pt-4">
      <span className="text-sm text-foreground dark:font-light font-medium">Preview</span>
      
      <div className="flex flex-col gap-2">
        {/* Distribution */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-foreground dark:font-light">Distribution</span>
          <span className="text-xs text-foreground font-medium">{formatCurrency(distributionNum)}</span>
        </div>

        {/* Total Re-allocation */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-foreground dark:font-light">Total Re-allocation</span>
          <span className="text-xs text-foreground font-medium">{formatCurrency(reallocationNum)}</span>
        </div>

        {/* Individual Reallocation Projects */}
        {reallocationProjects.map((project, index) => (
          <div key={project.projectId} className="flex justify-between items-center">
            <span className="text-xs text-foreground/70 dark:font-light">
              Re-allocation {index + 1} ({project.projectName})
            </span>
            <span className="text-xs text-foreground font-medium">{formatCurrency(project.amount)}</span>
          </div>
        ))}
      </div>

      {/* Send Email Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="send-email"
          checked={sendEmail}
          onCheckedChange={handleEmailCheckboxChange}
        />
        <label
          htmlFor="send-email"
          className="text-xs text-foreground/70 dark:font-light cursor-pointer"
        >
          Send investor confirmation email
        </label>
      </div>
    </div>
  )
}

export default DistributionPreview
export type { ReallocationProjectPreview }
