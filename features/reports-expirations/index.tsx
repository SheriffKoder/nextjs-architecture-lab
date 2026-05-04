'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import ExpirationsContent from './expirations-content'
import ActionButtons from './components/action-buttons'
import RightSlider from '@/components/design/right-slider'
import { NoteExpirationTableItem } from './config/table-config'
import { useAllocations } from '@/hooks'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import { FileSpreadsheet } from 'lucide-react'

const Index = () => {
  const allocationsHook = useAllocations()
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState<NoteExpirationTableItem | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportCSVModal, setShowExportCSVModal] = useState(false);

  // View mode is now managed by URL params in FilteringWrapper
  const [rawData, setRawData] = useState<Omit<NoteExpirationTableItem, 'daysUntilExpiration'>[]>([]);

  // Helper function to calculate days until expiration
  const calculateDaysUntilExpiration = (expirationDate: string | null): number | null => {
    if (!expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Calculate days until expiration for each item
  const data = useMemo<NoteExpirationTableItem[]>(() => {
    return rawData.map(item => ({
      ...item,
      daysUntilExpiration: calculateDaysUntilExpiration(item.expirationDate)
    }));
  }, [rawData]);

  // Load allocations with note_maturity_date
  useEffect(() => {
    let isMounted = true;

    const loadExpirations = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await allocationsHook.getAll({ limit: 1000 })
        
        if (!isMounted) return;

        if (response) {
          // Transform allocations to NoteExpirationTableItem format (include all allocations, not just those with maturity dates)
          const filteredData = response.data.map((allocation) => ({
            id: allocation.id,
            company: allocation.project?.company?.name || 'N/A',
            investor: allocation.investor_org?.name || 'N/A',
            property: allocation.project?.address || 'N/A',
            invAmount: allocation.allocation_amount || 0,
            rate: allocation.interest_rate_percentage || 0,
            expirationDate: allocation.note_maturity_date || '',
            contactInfo: allocation.investor_org?.name || allocation.created_by?.email || 'N/A',
          }))
          // Set data first, then set loading to false to ensure state updates in correct order
          setRawData(filteredData)
        }
        setIsLoading(false)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load expirations')
          console.error('Error loading expirations:', err)
          setIsLoading(false)
        }
      }
    }

    loadExpirations()

    return () => {
      isMounted = false;
    }
  }, [])

  // Empty callback functions for action buttons
  const handleExportCSV = () => {
    setShowExportCSVModal(true)
  }

  const handleRowClick = (expiration: NoteExpirationTableItem) => {
    setSelectedExpiration(expiration)
    setIsPanelOpen(true)
  }


  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
         {/* Header */}
         <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
         bg-background/20 backdrop-blur-sm z-[50]'>
            <PageHeader />
            <ActionButtons onExportCSV={handleExportCSV} />
        </header>

        
        <div className='flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[120px] lg:pt-[100px] w-full'>
        {/* Main content */}
            <div className='h-full w-full pr-2 pt-2 min-w-0'>
              <ExpirationsContent 
              data={data} 
              loading={isLoading} 
              handleRowClick={handleRowClick}
              />
            </div>
        </div>

        {/* <RightSlider
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        header="Expiration Details"
        subHeader={selectedExpiration ? `${selectedExpiration.investor} - ${selectedExpiration.property}` : undefined}
        >
          <div>Your content here</div>
      </RightSlider> */}

      {/* Export CSV Instructions Modal */}
      {showExportCSVModal && (
      <InstructionsModalListings
        height='h-screen lg:h-fit'
        showInstructionsModal={showExportCSVModal}
        setShowInstructionsModal={setShowExportCSVModal}
        headerText="Export Expirations to CSV"
        descriptionText="Generate a CSV file containing all expiration data"
        icon={<FileSpreadsheet className="w-full h-full text-foreground/10" />}
      >
        <div className="text-sm text-foreground/70 dark:text-foreground/50 mt-4">
          <p>The CSV export will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>All expiration details</li>
          </ul>
          </div>
        </InstructionsModalListings>
      )}
    </div>
  )
}

export default Index
