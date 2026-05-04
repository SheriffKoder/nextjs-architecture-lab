'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useState, useRef } from 'react'
import ProjectBoardContent from './projectboard-content'
import ActionButtons from './components/action-buttons'
import { Project } from '@/lib/types';
import { ScoreData } from './types';
import RightSlider from '@/components/design/right-slider'
import { ProjectBoardTableItem } from './config/table-config'
import { useProjects, type ProjectsSummary } from '@/hooks'
import { FilterUniqueValuesMap } from '@/features/filtering-wrapper-multi-display/types'
import { convertFilterToApiParams, getStringFilterParam, getNumberFilterParams, getDateFilterParams } from '@/lib/utils'
import { filterConfig as projectFilterConfig } from './config/table-config'
import ProjectSliderDetailsContainer from './components/project-slider-details-container'
import ProjectSliderEditContainer from './components/project-slider-edit-container'
import ProjectSliderAddContainer from './components/project-slider-add-container'
import { Edit, Trash2, Undo, FolderSymlink, FileSpreadsheet } from 'lucide-react'
import DistributionViewWrapper from './components/distribution-view/distribution-view-wrapper'
import InstructionsModalListings from '@/components/design/InstructionsModalListings'
import ConfirmModal from '@/components/confirm-modal'

const Index = () => {
  const projectsHook = useProjects()
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [distributionViewIsOpen, setDistributionViewIsOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportCSVModal, setShowExportCSVModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmError, setDeleteConfirmError] = useState<string | null>(null);
  const [updatingProjectIds, setUpdatingProjectIds] = useState<string[]>([]);

  // View mode is now managed by URL params in FilteringWrapper

  const [data, setData] = useState<ProjectBoardTableItem[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterUniqueValues, setFilterUniqueValues] = useState<FilterUniqueValuesMap>({});
  const [summary, setSummary] = useState<ProjectsSummary | null>(null);

  const itemsPerPage = projectFilterConfig?.itemsPerPage ?? 10;

  // Load projects data (merge current filters + sort + pagination with any override params)
  const loadProjects = async (filterParams?: Record<string, any>) => {
    let isMounted = true;
    setIsLoading(true)
    setError(null)
    
    // Determine which filters to use: passed in explicitly or from state
    const currentFilters = filterParams?.filters ?? filters;
    
    // When filterParams are provided, they represent the complete set of parameters for the request
    // This avoids race conditions with state updates for filters/sort/page
    const params: Record<string, any> = {
      limit: itemsPerPage,
      page: filterParams?.page ?? page,
      sort: filterParams?.sort ?? (sort || undefined),
      ...currentFilters,
    };
    
    // Remove the temporary 'filters' key if it was passed in filterParams
    if (params.filters) delete params.filters;
    
    try {
      const response = await projectsHook.getAllWithFacets(params)
      
      if (!isMounted) return;

      if (response) {
        // Transform projects to ProjectBoardTableItem format
        // Note: The API already calculates total_cost, equity, investor_current_value, 
        // investor_capital, and leverage_percentage via mapProjectsVariables
        const transformedData: ProjectBoardTableItem[] = response.data.map((project) => {
          return {
            ...project,
            owner: project.company?.name || null,
            lender: project.lender_org?.name || null,
            titleCompany: project.title_company?.name || null,
          }
        })
        setData(transformedData)
        if (response.uniqueValues) {
          setFilterUniqueValues(response.uniqueValues)
        }
        if (response.summary) {
          setSummary(response.summary)
        }
        if (typeof response.total === 'number') {
          setTotal(response.total)
        }
        if (filterParams?.page != null) {
          setPage(filterParams.page)
        }
      }
      setIsLoading(false)
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        console.error('Error loading projects:', err)
        setIsLoading(false)
      }
    }
    
    return () => {
      isMounted = false;
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])
  

  const scoreData: ScoreData[] = [
    {
      title: 'Total ARV',
      description: 'Total After Repair Value across filtered projects',
      value: summary?.total_arv ?? 0,
      prefix: '$',
    },
    {
      title: 'Total Equity',
      description: 'Total equity across filtered projects',
      value: summary?.total_equity ?? 0,
      prefix: '$',
    },
    {
      title: 'Total Investor Capital',
      description: 'Total investor capital across filtered projects',
      value: summary?.total_investor_capital ?? 0,
      prefix: '$',
    },
  ]

  // Empty callback functions for action buttons
  const handleExportCSV = () => {
    setShowExportCSVModal(true)
  }

  const handleAddProject = () => {
    setSelectedProject(null)
    setIsEditMode(false)
    setIsCreateMode(true)
    setIsPanelOpen(true)
  }

  const handleDataUpdate = (updatedData: ProjectBoardTableItem[]) => {
    setData(updatedData)
  }

  const mergeUpdatedProjectIntoData = (
    prev: ProjectBoardTableItem[],
    projectId: string,
    updated: Awaited<ReturnType<typeof projectsHook.update>>
  ): ProjectBoardTableItem[] => {
    if (!updated) return prev
    return prev.map((p) =>
      p.id !== projectId
        ? p
        : {
            ...p,
            ...updated,
            status: updated.status,
            owner: updated.company?.name ?? p.owner,
            lender: updated.lender_org?.name ?? p.lender,
            titleCompany: updated.title_company?.name ?? p.titleCompany,
          }
    )
  }

  const handleProjectStatusChange = async (projectId: string, newStatus: string) => {
    setUpdatingProjectIds((ids) => [...ids, projectId])
    try {
      const updated = await projectsHook.update(projectId, { status: newStatus })
      if (updated) {
        setData((prev) => mergeUpdatedProjectIntoData(prev, projectId, updated))
      }
    } finally {
      setUpdatingProjectIds((ids) => ids.filter((id) => id !== projectId))
    }
  }

  const handleSubheadingsDragEnd = (updatedData: ProjectBoardTableItem[]) => {
    setData(updatedData)
    const toPersist = updatedData.filter((p) => {
      const prev = data.find((d) => d.id === p.id)
      return prev && prev.status !== p.status
    })
    toPersist.forEach((p) => {
      setUpdatingProjectIds((ids) => [...ids, p.id])
      projectsHook
        .update(p.id, { status: p.status })
        .then((updated) => {
          if (updated) {
            setData((prev) => mergeUpdatedProjectIntoData(prev, p.id, updated))
          }
        })
        .finally(() => {
          setUpdatingProjectIds((ids) => ids.filter((id) => id !== p.id))
        })
    })
  }

  const handleRowClick = (project: ProjectBoardTableItem) => {
    setSelectedProject(project)
    setIsEditMode(false)
    setIsCreateMode(false)
    setIsPanelOpen(true)
  }

  // When table header sort changes, update sort state and refetch with current filters + new sort (reset to page 1)
  const handleSortChange = (sortSpec: string | undefined) => {
    setSort(sortSpec ?? undefined)
    setPage(1)
    loadProjects({ sort: sortSpec ?? undefined, page: 1 })
  }

  // Handle filter apply from FilteringWrapper
  const handleFilterApply = (
    key: string, 
    items: string[], 
    type: string, 
    columnConfig?: { 
      filterApiParams?: { 
        text?: string; 
        number?: { from: string; to: string }; 
        date?: { start: string; end: string }; 
        isArray?: boolean; 
        valueField?: 'id' | 'item' 
      } 
    }
  ) => {
    // Convert filter to API parameters (using custom config if provided)
    const apiParams = convertFilterToApiParams(key, items, type, columnConfig)
    
    // Update filters state and refetch
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters }
      
      // Get all parameter names that could be related to this column key
      // Check custom config first, then fall back to default mappings
      const customTextParam = columnConfig?.filterApiParams?.text;
      const customNumberParams = columnConfig?.filterApiParams?.number;
      const customDateParams = columnConfig?.filterApiParams?.date;
      
      const paramNames = [
        customTextParam || getStringFilterParam(key),
        customNumberParams?.from || getNumberFilterParams(key)?.from,
        customNumberParams?.to || getNumberFilterParams(key)?.to,
        customDateParams?.start || getDateFilterParams(key)?.start,
        customDateParams?.end || getDateFilterParams(key)?.end,
      ].filter(Boolean) as string[]
      
      // Remove existing filters for this column key
      paramNames.forEach(paramName => {
        if (paramName && newFilters[paramName] !== undefined) {
          delete newFilters[paramName]
        }
      })
      
      // Add new filter parameters (only non-empty ones)
      Object.keys(apiParams).forEach(paramKey => {
        const value = apiParams[paramKey]
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          newFilters[paramKey] = value
        }
      })
      
      // Refetch with updated filters (reset to page 1)
      setPage(1)
      loadProjects({ filters: newFilters, page: 1 })

      return newFilters
    })
  }

  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
         {/* Header */}
         <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
         bg-background/20 backdrop-blur-sm z-[50]'>
            <PageHeader />
            <ActionButtons onExportCSV={handleExportCSV} onAddProject={handleAddProject} />
        </header>

        
        <div className='flex-1 overflow-y-auto flex pb-0 min-w-0 pt-[150px] lg:pt-[100px] w-full'>
        {/* Main content */}
            <div className='h-full w-full pr-2 pt-2 min-w-0'>
              <ProjectBoardContent 
              data={data} 
              scoreData={scoreData} 
              loading={isLoading} 
              setSelectedProject={setSelectedProject} 
              setIsPanelOpen={setIsPanelOpen}
              handleRowClick={handleRowClick}
              onDataUpdate={handleDataUpdate}
              onFilterApply={handleFilterApply}
              onSortChange={handleSortChange}
              serverPagination={{
                total,
                page,
                limit: itemsPerPage,
                onPageChange: (p) => { setPage(p); loadProjects({ page: p }); },
              }}
              filterUniqueValues={filterUniqueValues}
              onProjectStatusChange={handleProjectStatusChange}
              onSubheadingsDragEnd={handleSubheadingsDragEnd}
              loadingProjectIds={updatingProjectIds}
            />
            </div>
        </div>

        <RightSlider
        isOpen={isPanelOpen}
        width={isCreateMode ? 'w-[400px]' : 'lg:w-[60vw] w-screen duration-1000'}
        onClose={() => { setIsPanelOpen(false); setIsEditMode(false); setIsCreateMode(false); setIsDeleteMode(false); }}
        header={isCreateMode ? 'Add a Project' : selectedProject ? 'Project Details' : 'Panel Title'}
        subHeader={isCreateMode ? 'New Project' : selectedProject ? (selectedProject.address || undefined) : undefined}
        headerActions={isCreateMode ? undefined : selectedProject ? [
          ...(isEditMode ? [{
            icon: Undo,
            onClick: () => {
              setIsEditMode(false)
              console.log('Cancel edit mode')
            },
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit'
          }] : [{
            icon: Edit,
            onClick: () => {
              setIsEditMode(true)
              console.log('Edit project:', selectedProject.id)
            },
            ariaLabel: 'Edit project',
            title: 'Edit project',
          }]),
          {
            icon: Trash2,
            onClick: () => {
              if (!selectedProject?.id) return
              setDeleteConfirmError(null)
              setDeleteConfirmOpen(true)
            },
            ariaLabel: 'Delete project',
            title: 'Delete project',
          }
        ] : undefined}
        >
          {isCreateMode ? (
            <ProjectSliderAddContainer
              onSuccess={() => {
                setIsPanelOpen(false)
                setIsCreateMode(false)
                loadProjects()
              }}
              onCancel={() => { setIsPanelOpen(false); setIsCreateMode(false) }}
            />
          ) : isEditMode ? (
            <ProjectSliderEditContainer 
              selectedProject={selectedProject} 
              onDistributionViewOpen={() => setDistributionViewIsOpen(true)}
              onSuccess={() => {
                setIsPanelOpen(false)
                setIsEditMode(false)
                loadProjects()
              }}
            />
          ) : (
            <ProjectSliderDetailsContainer selectedProject={selectedProject} />
          )}
      </RightSlider>

      {/* Distribution View Modal */}
      {distributionViewIsOpen && (
        <DistributionViewWrapper
          isOpen={distributionViewIsOpen}
          onClose={() => setDistributionViewIsOpen(false)}
          selectedProject={selectedProject as ProjectBoardTableItem}
        />
      )}

      {/* Delete project confirmation modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setDeleteConfirmError(null)
        }}
        title={deleteConfirmError ? 'Error' : 'Delete project?'}
        description={
          deleteConfirmError ?? (
            <>
              Delete &quot;{selectedProject?.address ?? selectedProject?.id}&quot;? This cannot be undone.
            </>
          )
        }
        confirmLabel={deleteConfirmError ? 'OK' : 'Delete'}
        cancelLabel="Cancel"
        variant={deleteConfirmError ? 'default' : 'destructive'}
        hideCancel={!!deleteConfirmError}
        onConfirm={async () => {
          if (deleteConfirmError) {
            setDeleteConfirmOpen(false)
            setDeleteConfirmError(null)
            return
          }
          if (!selectedProject?.id) return
          const deleted = await projectsHook.delete(selectedProject.id)
          if (deleted) {
            setDeleteConfirmOpen(false)
            setDeleteConfirmError(null)
            setIsPanelOpen(false)
            setSelectedProject(null)
            setIsDeleteMode(false)
            loadProjects()
          } else {
            setDeleteConfirmError(projectsHook.error ?? 'Failed to delete project.')
          }
        }}
      />

      {/* Export CSV Instructions Modal */}
      {showExportCSVModal && (
      <InstructionsModalListings
        height='h-screen lg:h-fit'
        showInstructionsModal={showExportCSVModal}
        setShowInstructionsModal={setShowExportCSVModal}
        headerText="Export Projects to CSV"
        descriptionText="Generate a CSV file containing all project data"
        icon={<FileSpreadsheet className="w-full h-full text-foreground/10" />}
      >
        <div className="text-sm text-foreground/70 dark:text-foreground/50 mt-4">
          <p>The CSV export will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>All project details</li>
          </ul>
          </div>
        </InstructionsModalListings>
      )}
    </div>
  )
}

export default Index
