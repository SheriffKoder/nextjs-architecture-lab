'use client'

import React, { useState, useEffect } from 'react'
import { ProjectBoardTableItem } from '../../config/table-config'
import { Allocation } from '@/lib/types'
import { useAllocations } from '@/hooks'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import DistributionViewContainer from './distribution-view-container'
import InvestorDetailSlider from './investor-detail-slider'
import InvestorDetailSliderContent from './investor-slider'
import { FolderSymlink, Info } from 'lucide-react'

interface DistributionViewWrapperProps {
  isOpen: boolean
  onClose: () => void
  selectedProject: ProjectBoardTableItem | null
}

const DistributionViewWrapper = ({
  isOpen,
  onClose,
  selectedProject
}: DistributionViewWrapperProps) => {
  const { getAll } = useAllocations()
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null)

  useEffect(() => {
    if (!isOpen || !selectedProject?.id) {
      setAllocations([])
      return
    }
    let cancelled = false
    getAll({ projectIds: [selectedProject.id], limit: 100 }).then((res) => {
      if (!cancelled && res?.data) setAllocations(res.data)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when modal/project changes
  }, [isOpen, selectedProject?.id])

  if (!isOpen || !selectedProject) {
    return null
  }

  const handleRowClick = (allocation: Allocation) => {
    setSelectedAllocation(allocation)
    setIsSliderOpen(true)
  }

  const handleSliderClose = () => {
    setIsSliderOpen(false)
    setSelectedAllocation(null)
  }

  return (
    <>
      <InstructionsModalListings
        setShowInstructionsModal={onClose}
        showInstructionsModal={isOpen}
        headerText="Project Closeout – Distribution & Reallocation"
        descriptionText={`Project: ${selectedProject.address}`}
        icon={<FolderSymlink className="w-full h-full text-tertiary/20" />}
        height='h-[100vh] lg:h-[80vh]'
      >
        <div className="w-full overflow-x-hidden">
          <div className='mt-2 w-full h-fit flex flex-row gap-2 items-center justify-start text-xs text-blue-900/70 dark:text-blue-300/50'>
            <Info className="w-3 h-3" />
            <p>Disclaimer: this will set the project's status to Sold if not already set</p>
          </div>

          <DistributionViewContainer
            selectedProject={selectedProject}
            preFetchedProjectAllocations={allocations}
            onDistributionViewClose={onClose}
            onRowClick={handleRowClick}
          />

          {/* Investor Detail Slider */}
          <InvestorDetailSlider
            isOpen={isSliderOpen}
            onClose={handleSliderClose}
            investorName={selectedAllocation?.investor_org?.name || (selectedAllocation ? `Investor ${selectedAllocation.investor_org_id}` : undefined)}
          >
            <InvestorDetailSliderContent selectedAllocation={selectedAllocation} />
          </InvestorDetailSlider>
        </div>
      </InstructionsModalListings>
    </>
  )
}

export default DistributionViewWrapper
