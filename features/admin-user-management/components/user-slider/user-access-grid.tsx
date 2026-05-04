import React, { useState, useEffect } from 'react'
import CollapsibleCard from '../../../../components/design/CollapsibleCard-sm'
import { ChevronDownIcon, UserIcon } from 'lucide-react'
import { PageName, getAllPageNames, getPageDisplayName } from '@/lib/page-names'
import { Checkbox } from '@/components/ui/checkbox'

interface UserAccessGridProps {
  availablePages?: PageName[]
}

const UserAccessGrid = ({ availablePages = [] }: UserAccessGridProps) => {
  const [selectedPages, setSelectedPages] = useState<Set<PageName>>(new Set())

  // Initialize selected pages with available pages
  useEffect(() => {
    if (availablePages.length > 0) {
      setSelectedPages(new Set(availablePages))
    }
  }, [availablePages])

  const allPages = getAllPageNames()

  const handlePageToggle = (pageName: PageName) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageName)) {
        newSet.delete(pageName)
      } else {
        newSet.add(pageName)
      }
      return newSet
    })
  }

  return (
    <CollapsibleCard headerText="User Access" leftIcon={UserIcon} rightIcon={ChevronDownIcon} variant='sm'>
      <div className="grid grid-cols-1 gap-0">
        {allPages.map((pageName) => (
          <div
            key={pageName}
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-3 h-full py-2 transition-colors"
            onClick={() => handlePageToggle(pageName)}
          >
            <Checkbox
              checked={selectedPages.has(pageName)}
              onCheckedChange={() => handlePageToggle(pageName)}
            />
            <label className="text-xs text-foreground cursor-pointer flex-1">
              {getPageDisplayName(pageName)}
            </label>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  )
}

export default UserAccessGrid
