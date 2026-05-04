'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useMemo, useState } from 'react'
import AdminConfigurationContent from './admin-configuration-content'
import Unauthorized from '@/components/unauthorized'
import { useAppSelector } from '@/lib/store/hooks'
import { isInternalAdmin } from '@/lib/utils'
import RightSlider from '@/components/design/right-slider'
import { useCompanies, useOrgs, useProjects, useTitleCompanies, useRealtors } from '@/hooks'
import type { RealtorWithAdmin } from '@/hooks'
import type { Company, Org, Project, TitleCompany } from '@/lib/types'
import { ConfigurationAddCompany } from './components/configuration-add-company'
import { ConfigurationCompanyDetails } from './components/configuration-company-details'
import { ConfigurationTitleCompanyDetails } from './components/configuration-title-company-details'
import { ConfigurationOrgDetails } from './components/configuration-org-details'
import { ConfigurationAddOrg } from './components/configuration-add-org'
import { ConfigurationRealtorDetails } from './components/configuration-realtor-details'
import { ConfigurationAddRealtor } from './components/configuration-add-realtor'
import { ConfigurationAddTitleCompany } from './components/configuration-add-title-company'
import ProjectSliderAddContainer from '@/features/portfolio-project-board/components/project-slider-add-container'
import ProjectSliderDetailsContainer from '@/features/portfolio-project-board/components/project-slider-details-container'
import ProjectSliderEditContainer from '@/features/portfolio-project-board/components/project-slider-edit-container'
import type { ProjectBoardTableItem } from '@/features/portfolio-project-board/config/table-config'
import { capitalizeAllFirstLetters } from '@/lib/utils'
import ConfirmModal from '@/components/confirm-modal'
import { Edit, Trash2, Undo } from 'lucide-react'

export type ConfigTabId = 'companies' | 'contractors' | 'lenders' | 'realtors' | 'titleCompanies' | 'projects'

const TABS: { id: ConfigTabId; label: string }[] = [
  { id: 'companies', label: 'Companies' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'lenders', label: 'Lenders' },
  { id: 'realtors', label: 'Realtors' },
  { id: 'titleCompanies', label: 'Title Companies' },
  { id: 'projects', label: 'Projects' },
]

const Index = () => {
  const [activeTab, setActiveTab] = useState<ConfigTabId>('companies')
  const [isAddSliderOpen, setIsAddSliderOpen] = useState(false)
  const [addSliderTab, setAddSliderTab] = useState<ConfigTabId | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isCompanyEditMode, setIsCompanyEditMode] = useState(false)
  const [companyDeleteConfirmOpen, setCompanyDeleteConfirmOpen] = useState(false)
  const [companyDeleteLoading, setCompanyDeleteLoading] = useState(false)
  const [companyDeleteError, setCompanyDeleteError] = useState<string | null>(null)
  const [companyRelatedOrgsModalOpen, setCompanyRelatedOrgsModalOpen] = useState(false)
  const [companyRelatedOrgs, setCompanyRelatedOrgs] = useState<Array<{ id: string; name: string; org_types: string[] }>>([])
  const [contractors, setContractors] = useState<Org[]>([])
  const [selectedContractor, setSelectedContractor] = useState<Org | null>(null)
  const [isContractorEditMode, setIsContractorEditMode] = useState(false)
  const [contractorDeleteConfirmOpen, setContractorDeleteConfirmOpen] = useState(false)
  const [contractorDeleteLoading, setContractorDeleteLoading] = useState(false)
  const [contractorDeleteError, setContractorDeleteError] = useState<string | null>(null)
  const [contractorRelatedProjectsModalOpen, setContractorRelatedProjectsModalOpen] = useState(false)
  const [contractorRelatedProjects, setContractorRelatedProjects] = useState<Array<{ id: string; address: string; status: string }>>([])
  const [lenders, setLenders] = useState<Org[]>([])
  const [selectedLender, setSelectedLender] = useState<Org | null>(null)
  const [isLenderEditMode, setIsLenderEditMode] = useState(false)
  const [lenderDeleteConfirmOpen, setLenderDeleteConfirmOpen] = useState(false)
  const [lenderDeleteLoading, setLenderDeleteLoading] = useState(false)
  const [lenderDeleteError, setLenderDeleteError] = useState<string | null>(null)
  const [lenderRelatedProjectsModalOpen, setLenderRelatedProjectsModalOpen] = useState(false)
  const [lenderRelatedProjects, setLenderRelatedProjects] = useState<Array<{ id: string; address: string; status: string }>>([])
  const [realtors, setRealtors] = useState<Org[]>([])
  const [selectedRealtor, setSelectedRealtor] = useState<RealtorWithAdmin | null>(null)
  const [isRealtorEditMode, setIsRealtorEditMode] = useState(false)
  const [realtorDeleteConfirmOpen, setRealtorDeleteConfirmOpen] = useState(false)
  const [realtorDeleteLoading, setRealtorDeleteLoading] = useState(false)
  const [realtorDeleteError, setRealtorDeleteError] = useState<string | null>(null)
  const [realtorRelatedProjectsModalOpen, setRealtorRelatedProjectsModalOpen] = useState(false)
  const [realtorRelatedProjects, setRealtorRelatedProjects] = useState<Array<{ id: string; address: string; status: string }>>([])
  const [titleCompanies, setTitleCompanies] = useState<TitleCompany[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsListLoading, setProjectsListLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectBoardTableItem | null>(null)
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false)
  const [isProjectEditMode, setIsProjectEditMode] = useState(false)
  const [projectDeleteConfirmOpen, setProjectDeleteConfirmOpen] = useState(false)
  const [projectDeleteLoading, setProjectDeleteLoading] = useState(false)
  const [projectDeleteError, setProjectDeleteError] = useState<string | null>(null)
  const [selectedTitleCompany, setSelectedTitleCompany] = useState<TitleCompany | null>(null)
  const [isTitleCompanyEditMode, setIsTitleCompanyEditMode] = useState(false)
  const [titleCompanyDeleteConfirmOpen, setTitleCompanyDeleteConfirmOpen] = useState(false)
  const [titleCompanyDeleteLoading, setTitleCompanyDeleteLoading] = useState(false)
  const [titleCompanyDeleteError, setTitleCompanyDeleteError] = useState<string | null>(null)
  const [titleCompanyRelatedProjectsModalOpen, setTitleCompanyRelatedProjectsModalOpen] = useState(false)
  const [titleCompanyRelatedProjects, setTitleCompanyRelatedProjects] = useState<Array<{ id: string; address: string; status: string }>>([])

  const companiesHook = useCompanies()
  const orgsHook = useOrgs()
  const realtorsHook = useRealtors()
  const titleCompaniesHook = useTitleCompanies()
  const projectsHook = useProjects()

  const sliceUser = useAppSelector((state) => state.user.user)
  const memberships = useAppSelector((state) => state.user.memberships)
  const userWithMemberships = useMemo(
    () => (sliceUser ? { ...sliceUser, org_memberships: memberships } : null),
    [sliceUser, memberships]
  )
  const isAdmin = isInternalAdmin(userWithMemberships)

  useEffect(() => {
    if (activeTab === 'companies') {
      companiesHook.getAll({ limit: 1000 }).then((res) => {
        if (res) setCompanies(res.data)
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'contractors') {
      orgsHook.getAll({ org_type: 'contractor', limit: 1000, includeAdmins: true }).then((res) => {
        if (res) setContractors(res.data)
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'lenders') {
      orgsHook.getAll({ org_type: 'lender', limit: 1000, includeAdmins: true }).then((res) => {
        if (res) setLenders(res.data)
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'realtors') {
      orgsHook.getAll({ org_type: 'realtor', limit: 1000, includeAdmins: true }).then((res) => {
        if (res) setRealtors(res.data)
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'titleCompanies') {
      titleCompaniesHook.getAll({ limit: 1000 }).then((res) => {
        if (res) setTitleCompanies(res.data)
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'projects') {
      setProjectsListLoading(true)
      projectsHook.getAll({ limit: 1000 }).then((res) => {
        if (res) setProjects(res.data)
      }).finally(() => setProjectsListLoading(false))
    }
  }, [activeTab])

  const getData = (): unknown[] => {
    switch (activeTab) {
      case 'companies':
        return companies
      case 'contractors':
        return contractors
      case 'lenders':
        return lenders
      case 'realtors':
        return realtors
      case 'titleCompanies':
        return titleCompanies
      case 'projects':
        return projects
      default:
        return []
    }
  }

  const isLoading =
    (activeTab === 'companies' && companiesHook.loading) ||
    (activeTab === 'contractors' && orgsHook.loading) ||
    (activeTab === 'lenders' && orgsHook.loading) ||
    (activeTab === 'realtors' && orgsHook.loading) ||
    (activeTab === 'titleCompanies' && titleCompaniesHook.loading) ||
    (activeTab === 'projects' && projectsListLoading)

  const refreshCurrentTab = () => {
    if (addSliderTab === 'companies') companiesHook.getAll({ limit: 1000 }).then((res) => res && setCompanies(res.data))
    if (addSliderTab === 'contractors') orgsHook.getAll({ org_type: 'contractor', limit: 1000, includeAdmins: true }).then((res) => res && setContractors(res.data))
    if (addSliderTab === 'lenders') orgsHook.getAll({ org_type: 'lender', limit: 1000, includeAdmins: true }).then((res) => res && setLenders(res.data))
    if (addSliderTab === 'realtors') orgsHook.getAll({ org_type: 'realtor', limit: 1000, includeAdmins: true }).then((res) => res && setRealtors(res.data))
    if (addSliderTab === 'titleCompanies') titleCompaniesHook.getAll({ limit: 1000 }).then((res) => res && setTitleCompanies(res.data))
    if (addSliderTab === 'projects') projectsHook.getAll({ limit: 1000 }).then((res) => res && setProjects(res.data))
  }

  const handleAddClick = (tab: ConfigTabId) => {
    setAddSliderTab(tab)
    setIsAddSliderOpen(true)
  }

  const handleCompanyRowClick = (row: unknown) => {
    if (activeTab !== 'companies') return
    const company = row as Company
    if (company?.id) {
      setSelectedCompany(company)
      setIsCompanyEditMode(false)
      setCompanyDeleteConfirmOpen(false)
    }
  }

  const handleCompanyDetailsClose = () => {
    setSelectedCompany(null)
    setIsCompanyEditMode(false)
    setCompanyDeleteConfirmOpen(false)
    setCompanyDeleteError(null)
  }

  const handleCompanySave = async (id: string, name: string): Promise<boolean> => {
    const updated = await companiesHook.update(id, { name })
    if (updated) {
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
      setSelectedCompany((prev) => (prev?.id === id ? { ...prev, name } : prev))
      setIsCompanyEditMode(false)
      return true
    }
    return false
  }

  const handleCompanyDelete = async (id: string): Promise<{ ok: boolean; relatedOrgs?: Array<{ id: string; name: string; org_types: string[] }> }> => {
    const result = await companiesHook.delete(id)
    if (result.success) {
      setCompanies((prev) => prev.filter((c) => c.id !== id))
      setSelectedCompany(null)
      return { ok: true }
    }
    return { ok: false, relatedOrgs: result.relatedOrgs }
  }

  const handleCompanyDeleteConfirm = async () => {
    if (!selectedCompany?.id) return
    setCompanyDeleteError(null)
    setCompanyDeleteLoading(true)
    try {
      const result = await handleCompanyDelete(selectedCompany.id)
      if (result.ok) {
        setCompanyDeleteConfirmOpen(false)
      } else if (result.relatedOrgs?.length) {
        setCompanyDeleteConfirmOpen(false)
        setCompanyRelatedOrgs(result.relatedOrgs)
        setCompanyRelatedOrgsModalOpen(true)
      } else {
        setCompanyDeleteError(companiesHook.error ?? 'Failed to delete company.')
      }
    } finally {
      setCompanyDeleteLoading(false)
    }
  }

  const handleContractorRowClick = (row: unknown) => {
    if (activeTab !== 'contractors') return
    const org = row as Org
    if (org?.id) {
      setSelectedContractor(org)
      setIsContractorEditMode(false)
      setContractorDeleteConfirmOpen(false)
      setContractorRelatedProjectsModalOpen(false)
    }
  }

  const handleContractorDetailsClose = () => {
    setSelectedContractor(null)
    setIsContractorEditMode(false)
    setContractorDeleteConfirmOpen(false)
    setContractorDeleteError(null)
    setContractorRelatedProjectsModalOpen(false)
    setContractorRelatedProjects([])
  }

  const handleContractorSave = async (id: string, name: string): Promise<boolean> => {
    const updated = await orgsHook.update(id, { name })
    if (updated) {
      setContractors((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
      setSelectedContractor((prev) => (prev?.id === id ? { ...prev, name } : prev))
      setIsContractorEditMode(false)
      return true
    }
    return false
  }

  const handleContractorDelete = async (id: string): Promise<{ ok: boolean; relatedProjects?: Array<{ id: string; address: string; status: string }> }> => {
    const result = await orgsHook.delete(id, { removeType: 'contractor' })
    if (result.success) {
      setContractors((prev) => prev.filter((c) => c.id !== id))
      setSelectedContractor(null)
      return { ok: true }
    }
    return { ok: false, relatedProjects: result.relatedProjects }
  }

  const handleContractorDeleteConfirm = async () => {
    if (!selectedContractor?.id) return
    setContractorDeleteError(null)
    setContractorDeleteLoading(true)
    try {
      const result = await handleContractorDelete(selectedContractor.id)
      if (result.ok) {
        setContractorDeleteConfirmOpen(false)
      } else if (result.relatedProjects?.length) {
        setContractorDeleteConfirmOpen(false)
        setContractorRelatedProjects(result.relatedProjects)
        setContractorRelatedProjectsModalOpen(true)
      } else {
        setContractorDeleteError(orgsHook.error ?? 'Failed to delete contractor.')
      }
    } finally {
      setContractorDeleteLoading(false)
    }
  }

  const handleLenderRowClick = (row: unknown) => {
    if (activeTab !== 'lenders') return
    const org = row as Org
    if (org?.id) {
      setSelectedLender(org)
      setIsLenderEditMode(false)
      setLenderDeleteConfirmOpen(false)
      setLenderRelatedProjectsModalOpen(false)
    }
  }

  const handleLenderDetailsClose = () => {
    setSelectedLender(null)
    setIsLenderEditMode(false)
    setLenderDeleteConfirmOpen(false)
    setLenderDeleteError(null)
    setLenderRelatedProjectsModalOpen(false)
    setLenderRelatedProjects([])
  }

  const handleLenderSave = async (id: string, name: string): Promise<boolean> => {
    const updated = await orgsHook.update(id, { name })
    if (updated) {
      setLenders((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)))
      setSelectedLender((prev) => (prev?.id === id ? { ...prev, name } : prev))
      setIsLenderEditMode(false)
      return true
    }
    return false
  }

  const handleLenderDelete = async (id: string): Promise<{ ok: boolean; relatedProjects?: Array<{ id: string; address: string; status: string }> }> => {
    const result = await orgsHook.delete(id, { removeType: 'lender' })
    if (result.success) {
      setLenders((prev) => prev.filter((l) => l.id !== id))
      setSelectedLender(null)
      return { ok: true }
    }
    return { ok: false, relatedProjects: result.relatedProjects }
  }

  const handleLenderDeleteConfirm = async () => {
    if (!selectedLender?.id) return
    setLenderDeleteError(null)
    setLenderDeleteLoading(true)
    try {
      const result = await handleLenderDelete(selectedLender.id)
      if (result.ok) {
        setLenderDeleteConfirmOpen(false)
      } else if (result.relatedProjects?.length) {
        setLenderDeleteConfirmOpen(false)
        setLenderRelatedProjects(result.relatedProjects)
        setLenderRelatedProjectsModalOpen(true)
      } else {
        setLenderDeleteError(orgsHook.error ?? 'Failed to delete lender.')
      }
    } finally {
      setLenderDeleteLoading(false)
    }
  }

  const handleRealtorRowClick = (row: unknown) => {
    if (activeTab !== 'realtors') return
    const org = row as RealtorWithAdmin
    if (org?.id) {
      setSelectedRealtor(org)
      setIsRealtorEditMode(false)
      setRealtorDeleteConfirmOpen(false)
      setRealtorRelatedProjectsModalOpen(false)
    }
  }

  const handleRealtorDetailsClose = () => {
    setSelectedRealtor(null)
    setIsRealtorEditMode(false)
    setRealtorDeleteConfirmOpen(false)
    setRealtorDeleteError(null)
    setRealtorRelatedProjectsModalOpen(false)
    setRealtorRelatedProjects([])
  }

  const handleRealtorSave = async (
    id: string,
    data: { name: string; email: string; phone: string | null }
  ): Promise<boolean> => {
    const updated = await realtorsHook.update(id, data)
    if (updated) {
      setRealtors((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          return {
            ...r,
            name: updated.name,
            members: updated.members ?? (r as RealtorWithAdmin).members,
          } as RealtorWithAdmin
        })
      )
      setSelectedRealtor(updated)
      setIsRealtorEditMode(false)
      return true
    }
    return false
  }

  const handleRealtorDelete = async (
    id: string
  ): Promise<{ ok: boolean; relatedProjects?: Array<{ id: string; address: string; status: string }> }> => {
    const result = await realtorsHook.delete(id)
    if (result.success) {
      setRealtors((prev) => prev.filter((r) => r.id !== id))
      setSelectedRealtor(null)
      return { ok: true }
    }
    return { ok: false, relatedProjects: result.relatedProjects }
  }

  const handleRealtorDeleteConfirm = async () => {
    if (!selectedRealtor?.id) return
    setRealtorDeleteError(null)
    setRealtorDeleteLoading(true)
    try {
      const result = await handleRealtorDelete(selectedRealtor.id)
      if (result.ok) {
        setRealtorDeleteConfirmOpen(false)
      } else if (result.relatedProjects?.length) {
        setRealtorDeleteConfirmOpen(false)
        setRealtorRelatedProjects(result.relatedProjects)
        setRealtorRelatedProjectsModalOpen(true)
      } else {
        setRealtorDeleteError(realtorsHook.error ?? 'Failed to delete realtor.')
      }
    } finally {
      setRealtorDeleteLoading(false)
    }
  }

  const handleProjectRowClick = async (row: unknown) => {
    if (activeTab !== 'projects') return
    const project = row as Project
    if (!project?.id) return
    setSelectedProjectId(project.id)
    setSelectedProject(null)
    setIsProjectEditMode(false)
    setProjectDetailsLoading(true)
    try {
      const full = await projectsHook.getOneById(project.id)
      if (full) {
        const item: ProjectBoardTableItem = {
          ...full,
          owner: full.company?.name ?? null,
          lender: full.lender_org?.name ?? null,
          titleCompany: full.title_company?.name ?? null,
        }
        setSelectedProject(item)
      } else {
        setSelectedProjectId(null)
      }
    } finally {
      setProjectDetailsLoading(false)
    }
  }

  const handleProjectDetailsClose = () => {
    setSelectedProjectId(null)
    setSelectedProject(null)
    setIsProjectEditMode(false)
    setProjectDeleteConfirmOpen(false)
    setProjectDeleteError(null)
  }

  const handleProjectDeleteConfirm = async () => {
    if (!selectedProject?.id) return
    setProjectDeleteError(null)
    setProjectDeleteLoading(true)
    try {
      const ok = await projectsHook.delete(selectedProject.id)
      if (ok) {
        setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
        setSelectedProjectId(null)
        setSelectedProject(null)
        setProjectDeleteConfirmOpen(false)
      } else {
        setProjectDeleteError(projectsHook.error ?? 'Failed to delete project.')
      }
    } finally {
      setProjectDeleteLoading(false)
    }
  }

  const handleTitleCompanyRowClick = (row: unknown) => {
    if (activeTab !== 'titleCompanies') return
    const tc = row as TitleCompany
    if (tc?.id) {
      setSelectedTitleCompany(tc)
      setIsTitleCompanyEditMode(false)
      setTitleCompanyDeleteConfirmOpen(false)
      setTitleCompanyRelatedProjectsModalOpen(false)
    }
  }

  const handleTitleCompanyDetailsClose = () => {
    setSelectedTitleCompany(null)
    setIsTitleCompanyEditMode(false)
    setTitleCompanyDeleteConfirmOpen(false)
    setTitleCompanyDeleteError(null)
    setTitleCompanyRelatedProjectsModalOpen(false)
    setTitleCompanyRelatedProjects([])
  }

  const handleTitleCompanySave = async (id: string, name: string): Promise<boolean> => {
    const updated = await titleCompaniesHook.update(id, { name })
    if (updated) {
      setTitleCompanies((prev) => prev.map((tc) => (tc.id === id ? { ...tc, name } : tc)))
      setSelectedTitleCompany((prev) => (prev?.id === id ? { ...prev, name } : prev))
      setIsTitleCompanyEditMode(false)
      return true
    }
    return false
  }

  const handleTitleCompanyDelete = async (id: string): Promise<{ ok: boolean; relatedProjects?: Array<{ id: string; address: string; status: string }> }> => {
    const result = await titleCompaniesHook.delete(id)
    if (result.success) {
      setTitleCompanies((prev) => prev.filter((tc) => tc.id !== id))
      setSelectedTitleCompany(null)
      return { ok: true }
    }
    return { ok: false, relatedProjects: result.relatedProjects }
  }

  const handleTitleCompanyDeleteConfirm = async () => {
    if (!selectedTitleCompany?.id) return
    setTitleCompanyDeleteError(null)
    setTitleCompanyDeleteLoading(true)
    try {
      const result = await handleTitleCompanyDelete(selectedTitleCompany.id)
      if (result.ok) {
        setTitleCompanyDeleteConfirmOpen(false)
      } else if (result.relatedProjects?.length) {
        setTitleCompanyDeleteConfirmOpen(false)
        setTitleCompanyRelatedProjects(result.relatedProjects)
        setTitleCompanyRelatedProjectsModalOpen(true)
      } else {
        setTitleCompanyDeleteError(titleCompaniesHook.error ?? 'Failed to delete title company.')
      }
    } finally {
      setTitleCompanyDeleteLoading(false)
    }
  }

  const addSliderLabel = addSliderTab ? TABS.find((t) => t.id === addSliderTab)?.label ?? addSliderTab : ''

  const renderAddForm = () => {
    if (!addSliderTab) return null
    switch (addSliderTab) {
      case 'companies':
        return (
          <ConfigurationAddCompany
            onSuccess={() => { refreshCurrentTab(); setIsAddSliderOpen(false) }}
            onCancel={() => setIsAddSliderOpen(false)}
          />
        )
      case 'contractors':
        return (
          <ConfigurationAddOrg
            orgType="contractor"
            onSuccess={() => { refreshCurrentTab(); setIsAddSliderOpen(false) }}
            onCancel={() => setIsAddSliderOpen(false)}
          />
        )
      case 'lenders':
        return (
          <ConfigurationAddOrg
            orgType="lender"
            onSuccess={() => { refreshCurrentTab(); setIsAddSliderOpen(false) }}
            onCancel={() => setIsAddSliderOpen(false)}
          />
        )
      case 'realtors':
        return (
          <ConfigurationAddRealtor
            onSuccess={() => { refreshCurrentTab(); setIsAddSliderOpen(false) }}
            onCancel={() => setIsAddSliderOpen(false)}
          />
        )
      case 'titleCompanies':
        return (
          <ConfigurationAddTitleCompany
            onSuccess={() => { refreshCurrentTab(); setIsAddSliderOpen(false) }}
            onCancel={() => setIsAddSliderOpen(false)}
          />
        )
      case 'projects':
        return (
          <ProjectSliderAddContainer
            onSuccess={() => { refreshCurrentTab(); setIsAddSliderOpen(false) }}
            onCancel={() => setIsAddSliderOpen(false)}
          />
        )
      default:
        return null
    }
  }

  if (!isAdmin) return <Unauthorized />

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative">
      <header className="absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0 bg-background/20 backdrop-blur-sm z-[50]">
        <PageHeader />
      </header>

      <div className="flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[130px] lg:pt-[100px] w-full">
        <div className="h-full w-full pr-2 pt-2 min-w-0">
          <AdminConfigurationContent
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            data={getData()}
            loading={isLoading}
            onAddClick={handleAddClick}
            onRowClick={
              activeTab === 'companies' ? handleCompanyRowClick :
              activeTab === 'contractors' ? handleContractorRowClick :
              activeTab === 'lenders' ? handleLenderRowClick :
              activeTab === 'realtors' ? handleRealtorRowClick :
              activeTab === 'projects' ? handleProjectRowClick :
              activeTab === 'titleCompanies' ? handleTitleCompanyRowClick :
              undefined
            }
          />
        </div>
      </div>

      <RightSlider
        isOpen={isAddSliderOpen}
        onClose={() => { setIsAddSliderOpen(false); setAddSliderTab(null) }}
        header={addSliderLabel ? `Add ${addSliderLabel}` : 'Add'}
      >
        {renderAddForm()}
      </RightSlider>

      <RightSlider
        isOpen={!!selectedCompany}
        onClose={handleCompanyDetailsClose}
        header="Company Details"
        subHeader={selectedCompany?.name}
        headerActions={selectedCompany ? [
          ...(isCompanyEditMode ? [{
            icon: Undo,
            onClick: () => setIsCompanyEditMode(false),
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit',
          }] : [{
            icon: Edit,
            onClick: () => setIsCompanyEditMode(true),
            ariaLabel: 'Edit company',
            title: 'Edit company',
          }]),
          {
            icon: Trash2,
            onClick: () => setCompanyDeleteConfirmOpen(true),
            ariaLabel: 'Delete company',
            title: 'Delete company',
          },
        ] : undefined}
      >
        <ConfigurationCompanyDetails
          company={selectedCompany}
          isEditMode={isCompanyEditMode}
          onExitEditMode={() => setIsCompanyEditMode(false)}
          onSave={handleCompanySave}
        />
      </RightSlider>

      <ConfirmModal
        open={companyDeleteConfirmOpen}
        onClose={() => { setCompanyDeleteConfirmOpen(false); setCompanyDeleteError(null); }}
        title="Delete company"
        description={
          <>
            {selectedCompany && (
              <p>
                Are you sure you want to delete <strong>{selectedCompany.name}</strong>? This cannot be undone.
              </p>
            )}
            {companyDeleteError && (
              <p className="mt-2 text-destructive">{companyDeleteError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={companyDeleteLoading}
        onConfirm={handleCompanyDeleteConfirm}
      />

      <RightSlider
        isOpen={!!selectedContractor}
        onClose={handleContractorDetailsClose}
        header="Contractor Details"
        subHeader={selectedContractor?.name}
        headerActions={selectedContractor ? [
          ...(isContractorEditMode ? [{
            icon: Undo,
            onClick: () => setIsContractorEditMode(false),
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit',
          }] : [{
            icon: Edit,
            onClick: () => setIsContractorEditMode(true),
            ariaLabel: 'Edit contractor',
            title: 'Edit contractor',
          }]),
          {
            icon: Trash2,
            onClick: () => setContractorDeleteConfirmOpen(true),
            ariaLabel: 'Delete contractor',
            title: 'Delete contractor',
          },
        ] : undefined}
      >
        <ConfigurationOrgDetails
          org={selectedContractor}
          isEditMode={isContractorEditMode}
          onExitEditMode={() => setIsContractorEditMode(false)}
          onSave={handleContractorSave}
        />
      </RightSlider>

      <ConfirmModal
        open={contractorDeleteConfirmOpen}
        onClose={() => { setContractorDeleteConfirmOpen(false); setContractorDeleteError(null); }}
        title="Delete contractor"
        description={
          <>
            {selectedContractor && (
              <p>
                Are you sure you want to delete <strong>{selectedContractor.name}</strong>? This cannot be undone.
              </p>
            )}
            {contractorDeleteError && (
              <p className="mt-2 text-destructive">{contractorDeleteError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={contractorDeleteLoading}
        onConfirm={handleContractorDeleteConfirm}
      />

      <ConfirmModal
        open={contractorRelatedProjectsModalOpen}
        onClose={() => { setContractorRelatedProjectsModalOpen(false); setContractorRelatedProjects([]); }}
        title="Cannot delete contractor"
        description={
          <>
            <p className="mb-2">
              This contractor cannot be deleted because they are assigned to active projects. Remove or reassign them from the following projects first:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {contractorRelatedProjects.map((p) => (
                <li key={p.id}>
                  <strong>{p.address || p.id}</strong>
                  {p.status && (
                    <span className="text-foreground/70 ml-1">({capitalizeAllFirstLetters(p.status)})</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        }
        confirmLabel="OK"
        hideCancel
        onConfirm={() => { setContractorRelatedProjectsModalOpen(false); setContractorRelatedProjects([]); }}
      />

      <RightSlider
        isOpen={!!selectedLender}
        onClose={handleLenderDetailsClose}
        header="Lender Details"
        subHeader={selectedLender?.name}
        headerActions={selectedLender ? [
          ...(isLenderEditMode ? [{
            icon: Undo,
            onClick: () => setIsLenderEditMode(false),
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit',
          }] : [{
            icon: Edit,
            onClick: () => setIsLenderEditMode(true),
            ariaLabel: 'Edit lender',
            title: 'Edit lender',
          }]),
          {
            icon: Trash2,
            onClick: () => setLenderDeleteConfirmOpen(true),
            ariaLabel: 'Delete lender',
            title: 'Delete lender',
          },
        ] : undefined}
      >
        <ConfigurationOrgDetails
          org={selectedLender}
          isEditMode={isLenderEditMode}
          onExitEditMode={() => setIsLenderEditMode(false)}
          onSave={handleLenderSave}
        />
      </RightSlider>

      <ConfirmModal
        open={lenderDeleteConfirmOpen}
        onClose={() => { setLenderDeleteConfirmOpen(false); setLenderDeleteError(null); }}
        title="Delete lender"
        description={
          <>
            {selectedLender && (
              <p>
                Are you sure you want to delete <strong>{selectedLender.name}</strong>? This cannot be undone.
              </p>
            )}
            {lenderDeleteError && (
              <p className="mt-2 text-destructive">{lenderDeleteError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={lenderDeleteLoading}
        onConfirm={handleLenderDeleteConfirm}
      />

      <ConfirmModal
        open={lenderRelatedProjectsModalOpen}
        onClose={() => { setLenderRelatedProjectsModalOpen(false); setLenderRelatedProjects([]); }}
        title="Cannot delete lender"
        description={
          <>
            <p className="mb-2">
              This lender cannot be deleted because they are assigned to active projects. Remove or reassign them from the following projects first:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {lenderRelatedProjects.map((p) => (
                <li key={p.id}>
                  <strong>{p.address || p.id}</strong>
                  {p.status && (
                    <span className="text-foreground/70 ml-1">({capitalizeAllFirstLetters(p.status)})</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        }
        confirmLabel="OK"
        hideCancel
        onConfirm={() => { setLenderRelatedProjectsModalOpen(false); setLenderRelatedProjects([]); }}
      />

      <RightSlider
        isOpen={!!selectedRealtor}
        onClose={handleRealtorDetailsClose}
        header="Realtor Details"
        subHeader={selectedRealtor?.members?.[0]?.user?.name ?? selectedRealtor?.name}
        headerActions={selectedRealtor ? [
          ...(isRealtorEditMode ? [{
            icon: Undo,
            onClick: () => setIsRealtorEditMode(false),
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit',
          }] : [{
            icon: Edit,
            onClick: () => setIsRealtorEditMode(true),
            ariaLabel: 'Edit realtor',
            title: 'Edit realtor',
          }]),
          {
            icon: Trash2,
            onClick: () => setRealtorDeleteConfirmOpen(true),
            ariaLabel: 'Delete realtor',
            title: 'Delete realtor',
          },
        ] : undefined}
      >
        <ConfigurationRealtorDetails
          realtor={selectedRealtor}
          isEditMode={isRealtorEditMode}
          onExitEditMode={() => setIsRealtorEditMode(false)}
          onSave={handleRealtorSave}
        />
      </RightSlider>

      <ConfirmModal
        open={realtorDeleteConfirmOpen}
        onClose={() => { setRealtorDeleteConfirmOpen(false); setRealtorDeleteError(null); }}
        title="Delete realtor"
        description={
          <>
            {selectedRealtor && (
              <p>
                Are you sure you want to delete <strong>{selectedRealtor.name}</strong>? This will remove the organization and all associated user accounts. This cannot be undone.
              </p>
            )}
            {realtorDeleteError && (
              <p className="mt-2 text-destructive">{realtorDeleteError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={realtorDeleteLoading}
        onConfirm={handleRealtorDeleteConfirm}
      />

      <ConfirmModal
        open={realtorRelatedProjectsModalOpen}
        onClose={() => { setRealtorRelatedProjectsModalOpen(false); setRealtorRelatedProjects([]); }}
        title="Cannot delete realtor"
        description={
          <>
            <p className="mb-2">
              This realtor cannot be deleted because they are assigned to active projects. Remove or reassign them from the following projects first:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {realtorRelatedProjects.map((p) => (
                <li key={p.id}>
                  <strong>{p.address || p.id}</strong>
                  {p.status && (
                    <span className="text-foreground/70 ml-1">({capitalizeAllFirstLetters(p.status)})</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        }
        confirmLabel="OK"
        hideCancel
        onConfirm={() => { setRealtorRelatedProjectsModalOpen(false); setRealtorRelatedProjects([]); }}
      />

      <RightSlider
        isOpen={!!selectedProjectId || !!selectedProject}
        onClose={handleProjectDetailsClose}
        width="lg:w-[60vw] w-screen duration-1000"
        header="Project Details"
        subHeader={selectedProject?.address ?? (selectedProjectId ? 'Loading…' : undefined)}
        headerActions={selectedProject && !projectDetailsLoading ? [
          ...(isProjectEditMode ? [{
            icon: Undo,
            onClick: () => setIsProjectEditMode(false),
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit',
          }] : [{
            icon: Edit,
            onClick: () => setIsProjectEditMode(true),
            ariaLabel: 'Edit project',
            title: 'Edit project',
          }]),
          {
            icon: Trash2,
            onClick: () => { setProjectDeleteError(null); setProjectDeleteConfirmOpen(true); },
            ariaLabel: 'Delete project',
            title: 'Delete project',
          },
        ] : undefined}
      >
        {projectDetailsLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading…
          </div>
        ) : selectedProject ? (isProjectEditMode ? (
          <ProjectSliderEditContainer
            selectedProject={selectedProject}
            onSuccess={() => {
              projectsHook.getAll({ limit: 1000 }).then((res) => { if (res) setProjects(res.data); })
              setSelectedProject(null)
              setSelectedProjectId(null)
              setIsProjectEditMode(false)
            }}
          />
        ) : (
          <ProjectSliderDetailsContainer selectedProject={selectedProject} />
        )) : null}
      </RightSlider>

      <ConfirmModal
        open={projectDeleteConfirmOpen}
        onClose={() => { setProjectDeleteConfirmOpen(false); setProjectDeleteError(null); }}
        title="Delete project"
        description={
          <>
            {selectedProject && (
              <p>
                Are you sure you want to delete <strong>{selectedProject.address}</strong>? This cannot be undone.
              </p>
            )}
            {projectDeleteError && (
              <p className="mt-2 text-destructive">{projectDeleteError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={projectDeleteLoading}
        onConfirm={handleProjectDeleteConfirm}
      />

      <RightSlider
        isOpen={!!selectedTitleCompany}
        onClose={handleTitleCompanyDetailsClose}
        header="Title Company Details"
        subHeader={selectedTitleCompany?.name}
        headerActions={selectedTitleCompany ? [
          ...(isTitleCompanyEditMode ? [{
            icon: Undo,
            onClick: () => setIsTitleCompanyEditMode(false),
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit',
          }] : [{
            icon: Edit,
            onClick: () => setIsTitleCompanyEditMode(true),
            ariaLabel: 'Edit title company',
            title: 'Edit title company',
          }]),
          {
            icon: Trash2,
            onClick: () => setTitleCompanyDeleteConfirmOpen(true),
            ariaLabel: 'Delete title company',
            title: 'Delete title company',
          },
        ] : undefined}
      >
        <ConfigurationTitleCompanyDetails
          titleCompany={selectedTitleCompany}
          isEditMode={isTitleCompanyEditMode}
          onExitEditMode={() => setIsTitleCompanyEditMode(false)}
          onSave={handleTitleCompanySave}
        />
      </RightSlider>

      <ConfirmModal
        open={titleCompanyDeleteConfirmOpen}
        onClose={() => { setTitleCompanyDeleteConfirmOpen(false); setTitleCompanyDeleteError(null); }}
        title="Delete title company"
        description={
          <>
            {selectedTitleCompany && (
              <p>
                Are you sure you want to delete <strong>{selectedTitleCompany.name}</strong>? This cannot be undone.
              </p>
            )}
            {titleCompanyDeleteError && (
              <p className="mt-2 text-destructive">{titleCompanyDeleteError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={titleCompanyDeleteLoading}
        onConfirm={handleTitleCompanyDeleteConfirm}
      />

      <ConfirmModal
        open={titleCompanyRelatedProjectsModalOpen}
        onClose={() => { setTitleCompanyRelatedProjectsModalOpen(false); setTitleCompanyRelatedProjects([]); }}
        title="Cannot delete title company"
        description={
          <>
            <p className="mb-2">
              This title company cannot be deleted because it has projects linked to it. Remove or reassign the following projects first:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {titleCompanyRelatedProjects.map((p) => (
                <li key={p.id}>
                  <strong>{p.address || p.id}</strong>
                  {p.status && (
                    <span className="text-foreground/70 ml-1">({capitalizeAllFirstLetters(p.status)})</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        }
        confirmLabel="OK"
        hideCancel
        onConfirm={() => { setTitleCompanyRelatedProjectsModalOpen(false); setTitleCompanyRelatedProjects([]); }}
      />

      <ConfirmModal
        open={companyRelatedOrgsModalOpen}
        onClose={() => { setCompanyRelatedOrgsModalOpen(false); setCompanyRelatedOrgs([]); }}
        title="Cannot delete company"
        description={
          <>
            <p className="mb-2">
              This company cannot be deleted because it has organizations linked to it. Remove or reassign the following organizations first:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {companyRelatedOrgs.map((org) => (
                <li key={org.id}>
                  <strong>{org.name}</strong>
                  {Array.isArray(org.org_types) && org.org_types.length > 0 && (
                    <span className="text-foreground/70 ml-1">
                      ({org.org_types.map((t) => t.replace(/\b\w/g, (c) => c.toUpperCase())).join(', ')})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        }
        confirmLabel="OK"
        hideCancel
        onConfirm={() => { setCompanyRelatedOrgsModalOpen(false); setCompanyRelatedOrgs([]); }}
      />
    </div>
  )
}

export default Index
