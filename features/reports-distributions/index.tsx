'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useState, useRef } from 'react'
import MonthlyDistributionsContent from './monthly-distributions-content'
import ActionButtons from './components/action-buttons'
import RightSlider from '@/components/design/right-slider'
import { MonthlyDistributionTableItem } from './config/table-config'
import { useAllocations } from '@/hooks'
import { capitalizeAllFirstLetters } from '@/lib/utils'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import { FileSpreadsheet } from 'lucide-react'

const Index = () => {
  const allocationsHook = useAllocations()
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<MonthlyDistributionTableItem | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportCSVModal, setShowExportCSVModal] = useState(false);

  const [data, setData] = useState<MonthlyDistributionTableItem[]>([]);

  // Load allocations and transform to distribution format
  useEffect(() => {
    let isMounted = true;

    const loadDistributions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await allocationsHook.getAll({ limit: 1000 })
        
        if (!isMounted) return;

        if (response) {
          // Transform allocations to MonthlyDistributionTableItem format
          const transformedData: MonthlyDistributionTableItem[] = response.data.map((allocation) => {

            return {
              id: allocation.id,
              company: allocation.project?.company?.name || 'N/A',
              investor: allocation.investor_org?.name || 'N/A',
              property: allocation.project?.address || 'N/A',
              type: capitalizeAllFirstLetters(allocation.payment_term || 'N/A'),
              amount: allocation.allocation_amount || 0,
              interestRate: allocation.interest_rate_percentage || 0,
              accruedInterest: allocation.accrued_interest || 0,
              paymentDue: allocation.note_maturity_date || '',
              status: allocation.status || 'N/A',
              date: allocation.investment_date || allocation.created_at,
            }
          })

          // Set data first, then set loading to false to ensure state updates in correct order
          setData(transformedData)
        }
        setIsLoading(false)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load distributions')
          console.error('Error loading distributions:', err)
          setIsLoading(false)
        }
      }
    }

    loadDistributions()

    return () => {
      isMounted = false;
    }
  }, [])

  // Empty callback functions for action buttons
  const handleExportCSV = () => {
    setShowExportCSVModal(true)
  }

  const handleRowClick = (distribution: MonthlyDistributionTableItem) => {
    setSelectedDistribution(distribution)
    setIsPanelOpen(true)
  }

  // used to update the row on status change
  const handleCellValueChange = (rowIndex: number, columnKey: string, newValue: any) => {
    setData(prevData => {
      const updatedData = [...prevData];
      if (updatedData[rowIndex]) {
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [columnKey]: newValue
        };
      }
      return updatedData;
    });
    // TODO: Make API call to save the change to the backend
    console.log(`Cell updated: Row ${rowIndex}, Column ${columnKey}, New Value: ${newValue}`);
  }

  useEffect(() => {
    if (data.length > 0) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [data])

  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
         {/* Header */}
         <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
         bg-background/20 backdrop-blur-sm z-[50]'>
            <PageHeader />
            <ActionButtons onExportCSV={handleExportCSV} />
        </header>

        
        <div className='flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[170px] lg:pt-[100px] w-full'>
        {/* Main content */}
            <div className='h-full w-full pr-2 pt-2 min-w-0'>
              <MonthlyDistributionsContent 
              data={data} 
              loading={isLoading} 
              onRowClick={handleRowClick}
              onCellValueChange={handleCellValueChange}/>
            </div>
        </div>

        {/* <RightSlider
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        header="Distribution Details"
        subHeader={selectedDistribution ? `${selectedDistribution.investor} - ${selectedDistribution.property}` : undefined}
        >
          <div>Your content here</div>
      </RightSlider> */}

      {/* Export CSV Instructions Modal */}
      {showExportCSVModal && (
      <InstructionsModalListings
        height='h-screen lg:h-fit'
        showInstructionsModal={showExportCSVModal}
        setShowInstructionsModal={setShowExportCSVModal}
        headerText="Export Distributions to CSV"
        descriptionText="Generate a CSV file containing all distribution data"
        icon={<FileSpreadsheet className="w-full h-full text-foreground/10" />}
      >
        <div className="text-sm text-foreground/70 dark:text-foreground/50 mt-4">
          <p>The CSV export will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>All distribution details</li>
          </ul>
          </div>
        </InstructionsModalListings>
      )}
    </div>
  )
}

export default Index
