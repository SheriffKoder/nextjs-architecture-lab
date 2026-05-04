'use client'

import React from 'react'

type AllocationMode = 'full-distribution' | 'full-reallocation' | 'split-distribution'

interface AllocationTypeSelectorProps {
  selectedMode: AllocationMode | null
  onModeChange: (mode: AllocationMode) => void
}

const AllocationTypeSelector: React.FC<AllocationTypeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  const options: { value: AllocationMode; label: string }[] = [
    { value: 'full-distribution', label: 'Full Distribution' },
    { value: 'full-reallocation', label: 'Full Re-allocation' },
    { value: 'split-distribution', label: 'Split Distribution' }
  ]

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-foreground dark:font-light">Choose Allocation Type</span>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = selectedMode === option.value
          return (
            <button
              key={option.value}
              onClick={() => onModeChange(option.value)}
              className="bg-foreground/5 dark:bg-black bg-white rounded-md p-3 flex items-center justify-between gap-2 hover:bg-foreground/10 transition-colors"
            >
              <span className="text-xs text-foreground font-normal dark:font-light text-left">
                {option.label}
              </span>

              {/* Radio Circle */}
              <div
                className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                  isSelected
                    ? 'bg-foreground border-foreground'
                    : 'border-foreground'
                }`}
              />


            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AllocationTypeSelector
export type { AllocationMode }
