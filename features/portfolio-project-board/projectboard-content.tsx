'use client'

import { Project } from '@/lib/types'
import React from 'react'
import { usePathname } from 'next/navigation'
import { ScoreData } from './types'
import ScoreCards from '../../components/design/score-cards/score-cards'
import { FilteringWrapper } from '@/features/filtering-wrapper-multi-display/filtering-wrapper'
import { FilterUniqueValuesMap } from '@/features/filtering-wrapper-multi-display/types'
import { tableColumns, tableConfig, filterConfig, ProjectBoardTableItem } from './config/table-config'
import { CheckCircle } from 'lucide-react'
import { ProjectStatusEnum } from '@/lib/constants'
import { capitalizeAllFirstLetters } from '@/lib/utils'

const ProjectBoardContent = ({ data, scoreData, loading, setSelectedProject, setIsPanelOpen, handleRowClick, onDataUpdate, onFilterApply, onSortChange, serverPagination, filterUniqueValues = {}, onProjectStatusChange, onSubheadingsDragEnd, loadingProjectIds = [] }: { data: Project[], scoreData: ScoreData[], loading: boolean, setSelectedProject: (project: ProjectBoardTableItem) => void, setIsPanelOpen: (isOpen: boolean) => void, handleRowClick: (project: ProjectBoardTableItem) => void, onDataUpdate: (updatedData: ProjectBoardTableItem[]) => void, onFilterApply?: (key: string, items: string[], type: string) => void, onSortChange?: (sortSpec: string | undefined) => void, serverPagination?: { total: number; page: number; limit: number; onPageChange: (page: number) => void }, filterUniqueValues?: FilterUniqueValuesMap, onProjectStatusChange?: (projectId: string, newStatus: string) => Promise<void>, onSubheadingsDragEnd?: (updatedData: ProjectBoardTableItem[]) => void, loadingProjectIds?: string[] }) => {
  const pathname = usePathname()

  // Handle kanban drag end (full list update; status persistence is via onItemUpdate)
  const kanbanDragEnd = (updatedData: ProjectBoardTableItem[]) => {
    onDataUpdate(updatedData)
  }

  // Handle subheadings drag end (grouped view): update local state and persist status changes via API
  const subheadingsDragEnd = (updatedData: ProjectBoardTableItem[]) => {
    if (onSubheadingsDragEnd) {
      onSubheadingsDragEnd(updatedData)
    } else {
      onDataUpdate(updatedData)
    }
  }

  // SubHeadings configuration (grouped view)
  const subheadingsConfig = {
    columnKey: "status",
    groups: [
      { key: ProjectStatusEnum.PENDING_PURCHASE, label: capitalizeAllFirstLetters(ProjectStatusEnum.PENDING_PURCHASE) },
      { key: ProjectStatusEnum.ACTIVE_CONSTRUCTION, label: capitalizeAllFirstLetters(ProjectStatusEnum.ACTIVE_CONSTRUCTION) },
      { key: ProjectStatusEnum.FOR_SALE, label: capitalizeAllFirstLetters(ProjectStatusEnum.FOR_SALE) },
      { key: ProjectStatusEnum.RENTAL_PROPERTIES, label: capitalizeAllFirstLetters(ProjectStatusEnum.RENTAL_PROPERTIES) },
      { key: ProjectStatusEnum.SOLD, label: capitalizeAllFirstLetters(ProjectStatusEnum.SOLD) }
    ],
    subheadingsDragEnd: subheadingsDragEnd
  }

  // Handle kanban card actions
  const handleKanbanCardActions = (action: string, projectData: ProjectBoardTableItem) => {
    console.log(`🎴 Kanban: Card action - ${action}`, projectData)
    
    // Handle different actions
    switch (action) {
      case 'edit':
        console.log('Edit project:', projectData)
        break
      case 'delete':
        console.log('Delete project:', projectData)
        break
      case 'click':
        handleRowClick(projectData)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  // Kanban configuration
  const kanbanConfig = {
    columnKey: "status",
    cardKey: "id",
    cardTitle: "Project",
    cardContent: "address",
    dateKey: "created_at",
    minCards: 4,
    hideEmptyColumns: false,
    manualSorting: false,
    sortableColumns: ["address", "status", "after_repair_value", "mortgage_amount", "investor_capital"],
    columns: [
      { 
        label: "Pending Purchase", 
        key: "pending purchase",
        headerColors: "bg-orange-500/20 text-orange-700 border-orange-400/50 dark:bg-orange-500/30 dark:text-orange-300 dark:border-orange-400/60"
      },
      { 
        label: "Active Construction", 
        key: "active construction",
        headerColors: "bg-blue-500/20 text-blue-700 border-blue-400/50 dark:bg-blue-500/30 dark:text-blue-300 dark:border-blue-400/60"
      },
      { 
        label: "For Sale", 
        key: "for sale",
        headerColors: "bg-amber-500/20 text-amber-700 border-amber-400/50 dark:bg-amber-500/30 dark:text-amber-300 dark:border-amber-400/60"
      },
      { 
        label: "Rental Properties", 
        key: "rental properties",
        headerColors: "bg-violet-500/20 text-violet-700 border-violet-400/50 dark:bg-violet-500/30 dark:text-violet-300 dark:border-violet-400/60"
      },
      { 
        label: "Sold", 
        key: "sold", 
        icon: <CheckCircle />,
        headerColors: "bg-emerald-500/20 text-emerald-700 border-emerald-400/50 dark:bg-emerald-500/30 dark:text-emerald-300 dark:border-emerald-400/60"
      }
    ],
    kanbanDragEnd: kanbanDragEnd,
    handleCardActions: handleKanbanCardActions,
    onItemUpdate: onProjectStatusChange
      ? async (item: ProjectBoardTableItem, newColumnKey: string) => {
          await onProjectStatusChange(item.id, newColumnKey)
        }
      : undefined,
    loadingItemIds: loadingProjectIds,
  }

  return (
    <div className='w-full flex flex-col gap-6 h-full p-2 lg:p-0'>
      <ScoreCards scoreCardsConfig={scoreData} />
      
      <div className='flex-1 min-w-0 overflow-auto'>
        <FilteringWrapper
          key={pathname}
          data={data}
          columns={tableColumns}
          onRowClick={handleRowClick}
          filterConfig={filterConfig}
          tableConfig={{
            ...tableConfig,
            loading: loading,
          }}
          availableViews={['subheadings', 'kanban']}
          kanbanConfig={kanbanConfig}
          subheadingsConfig={subheadingsConfig}
          onFilterApply={onFilterApply}
          onSortChange={onSortChange}
          serverPagination={serverPagination}
          filterUniqueValues={filterUniqueValues}
        />
      </div>
    </div>
  )
}

export default ProjectBoardContent
