'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Allocation, Project } from '@/lib/types'
import InvestorSummaryGrid from './investor-summary-grid'
import AllocationTypeSelector, { AllocationMode } from './allocation-type-selector'
import DistributionInputs from './distribution-inputs'
import ReallocationProjects from './reallocation-projects'
import DifferenceIndicators from './difference-indicators'
import DistributionPreview, { ReallocationProjectPreview } from './distribution-preview'
import PrimaryButton from '@/components/design/primary-button'

interface InvestorDetailSliderContentProps {
  selectedAllocation: Allocation | null
}

/**
 * Investor Detail Slider Content Component
 * 
 * Main content component for the investor detail slider.
 * Holds multiple components in a flex-col layout.
 * 
 * ALLOCATION MODE SYSTEM:
 * ======================
 * This component manages three allocation modes that determine how funds are distributed:
 * 
 * 1. Full Distribution:
 *    - Distribution amount = Total Available Balance
 *    - Re-allocation amount = 0
 *    - Re-allocation input is DISABLED
 *    - Reallocation Projects component is HIDDEN
 *    - Use case: Investor receives full payout, no funds re-allocated to other projects
 * 
 * 2. Full Re-allocation:
 *    - Distribution amount = 0
 *    - Re-allocation amount = Total Available Balance
 *    - Distribution input is DISABLED
 *    - Reallocation Projects component is VISIBLE
 *    - Use case: All funds are re-allocated to another project, no payout to investor
 * 
 * 3. Split Distribution:
 *    - Distribution amount = Total Available Balance / 2
 *    - Re-allocation amount = Total Available Balance / 2
 *    - Both inputs are ENABLED (user can adjust)
 *    - Reallocation Projects component is VISIBLE
 *    - Use case: Funds are split between payout and re-allocation
 * 
 * When the allocation mode changes, the input values are automatically calculated and populated.
 * The disabled states prevent users from entering conflicting values based on the selected mode.
 * 
 * REALLOCATION PROJECTS SYSTEM:
 * =============================
 * When not in "Full Distribution" mode, users can allocate reallocation funds to multiple projects:
 * 
 * - Component displays a table with: Select Project, Allocation amount, Remove columns
 * - Users can add multiple reallocation project rows
 * - One row is added by default when component becomes visible
 * - Each row tracks: project_id and allocation_amount
 * - Sum of all reallocation project allocations is tracked and passed to Difference Indicators
 * 
 * DIFFERENCE INDICATORS SYSTEM:
 * =============================
 * Provides real-time validation feedback to users:
 * 
 * Row 1 - Distribution/Re-allocation Sum Validation:
 *    - Compares sum of Distribution + Re-allocation amounts vs Total Available Balance
 *    - Green text + checkmark: Sum equals total (valid)
 *    - Red text + X: Sum is higher or lower than total (invalid)
 *    - Shows exact difference amount when invalid
 * 
 * Row 2 - Remaining Re-allocation Balance:
 *    - Calculates: Re-allocation amount - Sum of all reallocation project allocations
 *    - Green text + checkmark: Remaining balance is 0 (all reallocation funds allocated)
 *    - Red text + X: Remaining balance is not 0 (unallocated funds remain)
 *    - Displays formatted currency value
 * 
 * Legend:
 *    - Green circle + "Valid" label: Indicates valid state
 *    - Red circle + "Invalid" label: Indicates invalid state
 * 
 * STATE MANAGEMENT:
 * ================
 * - selectedAllocationMode: Tracks which allocation mode is selected (null, 'full-distribution', 'full-reallocation', 'split-distribution')
 * - distributionAmount: String value of distribution input (controlled)
 * - reallocationAmount: String value of reallocation input (controlled)
 * - reallocationProjectsSum: Number sum of all reallocation project allocation amounts (updated via callback from ReallocationProjects)
 * 
 * The component uses useEffect to automatically populate input values when allocation mode changes.
 */
const InvestorDetailSliderContent: React.FC<InvestorDetailSliderContentProps> = ({
  selectedAllocation
}) => {
  const [selectedAllocationMode, setSelectedAllocationMode] = useState<AllocationMode | null>('full-distribution')
  const [distributionAmount, setDistributionAmount] = useState<string>('')
  const [reallocationAmount, setReallocationAmount] = useState<string>('')
  const [reallocationProjectsSum, setReallocationProjectsSum] = useState<number>(0)
  const [reallocationProjects, setReallocationProjects] = useState<ReallocationProjectPreview[]>([])
  const [sendEmail, setSendEmail] = useState(false)

  // Calculate values from allocation (use 0 as defaults if selectedAllocation is null)
  // Memoize to prevent unnecessary recalculations
  const totalAvailableBalance = useMemo(() => {
    const originalInvestment = selectedAllocation?.allocation_amount || 0
    const accruedInterest = selectedAllocation?.accrued_interest || 0
    return originalInvestment + accruedInterest
  }, [selectedAllocation?.allocation_amount, selectedAllocation?.accrued_interest])

  // Track previous mode to prevent unnecessary updates
  const previousModeRef = useRef<AllocationMode | null>(null)

  ///////////////////////
  // Update input values based on selected allocation mode
  // Why: Automatically populate inputs with calculated values when mode changes
  // How: useEffect watches selectedAllocationMode and totalAvailableBalance, calculates values per mode
  useEffect(() => {
    // Skip if mode hasn't actually changed
    if (selectedAllocationMode === previousModeRef.current) {
      return
    }

    previousModeRef.current = selectedAllocationMode

    if (!selectedAllocationMode) {
      // Reset values when no mode is selected
      setDistributionAmount('')
      setReallocationAmount('')
      return
    }

    switch (selectedAllocationMode) {
      case 'full-distribution':
        // Full Distribution: All funds to distribution, none to re-allocation
        setDistributionAmount(totalAvailableBalance.toFixed(2))
        setReallocationAmount('0.00')
        break
      
      case 'full-reallocation':
        // Full Re-allocation: All funds to re-allocation, none to distribution
        setDistributionAmount('0.00')
        setReallocationAmount(totalAvailableBalance.toFixed(2))
        break
      
      case 'split-distribution':
        // Split Distribution: Divide funds equally between both
        const splitAmount = (totalAvailableBalance / 2).toFixed(2)
        setDistributionAmount(splitAmount)
        setReallocationAmount(splitAmount)
        break
    }
  }, [selectedAllocationMode, totalAvailableBalance])

  ///////////////////////
  // Determine disabled states based on allocation mode
  // Why: Prevent users from entering conflicting values based on selected mode
  // How: Check selectedAllocationMode and return boolean for each input
  const isDistributionDisabled = selectedAllocationMode === 'full-reallocation'
  const isReallocationDisabled = selectedAllocationMode === 'full-distribution'

  // Early return after all hooks have been called
  if (!selectedAllocation) {
    return null
  }

  // Reallocation project list: pass real projects from parent or useProjects() when ready
  const availableProjects: Project[] = []

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Summary Grid */}
      <InvestorSummaryGrid
        originalInvestment={selectedAllocation?.allocation_amount || 0}
        accruedInterest={selectedAllocation?.accrued_interest || 0}
        totalAvailableBalance={totalAvailableBalance}
      />

      {/* Allocation Type Selector */}
      <AllocationTypeSelector
        selectedMode={selectedAllocationMode}
        onModeChange={setSelectedAllocationMode}
      />

      {/* Distribution Inputs */}
      <DistributionInputs
        distributionAmount={distributionAmount}
        reallocationAmount={reallocationAmount}
        onDistributionChange={setDistributionAmount}
        onReallocationChange={setReallocationAmount}
        isDistributionDisabled={isDistributionDisabled}
        isReallocationDisabled={isReallocationDisabled}
      />

    {/* Reallocation Projects - Only visible when NOT in full-distribution mode */}
    {selectedAllocationMode !== 'full-distribution' && selectedAllocationMode !== null && (
        <>
          <div className='flex flex-col gap-2'>
              <span className='text-xs text-foreground/70 dark:font-light'>Reallocation Projects</span>
              <div className='w-full bg-background/40 rounded-md p-4'>
                      <ReallocationProjects 
                        availableProjects={availableProjects} 
                        onAllocationsChange={setReallocationProjectsSum}
                        onProjectsChange={setReallocationProjects}
                      />
              </div>
          </div>

          {/* Difference Indicators */}
          <DifferenceIndicators
            distributionAmount={distributionAmount}
            reallocationAmount={reallocationAmount}
            totalAvailableBalance={totalAvailableBalance}
            reallocationProjectsSum={reallocationProjectsSum}
          />
        </>
    )}

      {/* Distribution Preview - Visible for all allocation types */}
      {selectedAllocationMode !== null && (
        <DistributionPreview
          distributionAmount={distributionAmount}
          reallocationAmount={reallocationAmount}
          reallocationProjects={reallocationProjects}
          onSendEmailChange={setSendEmail}
        />
      )}

      {/* Confirm Button */}
      {selectedAllocationMode !== null && (
        <PrimaryButton
          onClick={() => {
            // TODO: Implement confirm action
            console.log('Confirm clicked', {
              mode: selectedAllocationMode,
              distributionAmount,
              reallocationAmount,
              reallocationProjects,
              sendEmail
            })
          }}
          className="w-full"
          buttonClassName="bg-white dark:bg-black text-foreground dark:text-white border border-foreground/10 dark:border-white/10"
        >
          Confirm
        </PrimaryButton>
      )}

    </div>
  )
}

export default InvestorDetailSliderContent
