'use client'

import PageHeader from '@/components/layout/page-header'
import React, { useEffect, useMemo, useState } from 'react'
import UserManagementContent from './user-management-content'
import Unauthorized from '@/components/unauthorized'
import { isInternalAdmin } from '@/lib/utils'
import ActionButtons from './components/action-buttons'
import RightSlider from '@/components/design/right-slider'
import { AdminUserTableItem, filterConfig as userFilterConfig } from './config/table-config'
import { useUsers, useOrgs } from '@/hooks'
import UserSliderDetailsContainer from './components/user-slider-details-container'
import UserSliderEditContainer from './components/user-slider-edit-container'
import UserSliderAddContainer from './components/user-slider-add-container'
import { Edit, Trash2, Undo } from 'lucide-react'
import ConfirmModal from '@/components/confirm-modal'
import { FilterUniqueValuesMap } from '@/features/filtering-wrapper-multi-display/types'
import { convertFilterToApiParams, getStringFilterParam } from '@/lib/utils'
import { useAppSelector } from '@/lib/store/hooks'
import type { User } from '@/lib/types'
import { INTERNAL_ORG_ID } from '@/lib/constants'

const Index = () => {
  const usersHook = useUsers()
  const orgsHook = useOrgs()
  const roles = useAppSelector((state) => state.role.roles)
  const sliceUser = useAppSelector((state) => state.user.user)
  const memberships = useAppSelector((state) => state.user.memberships)
  const userWithMemberships = useMemo(
    () => (sliceUser ? { ...sliceUser, org_memberships: memberships } : null),
    [sliceUser, memberships]
  )
  const isAdmin = isInternalAdmin(userWithMemberships)

  const [internalOrgId, setInternalOrgId] = useState<string>(INTERNAL_ORG_ID)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserTableItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
  const [deleteConfirmError, setDeleteConfirmError] = useState<string | null>(null);

  const [data, setData] = useState<AdminUserTableItem[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sort, setSort] = useState<string | undefined>('name:asc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterUniqueValues, setFilterUniqueValues] = useState<FilterUniqueValuesMap>({});

  const itemsPerPage = userFilterConfig?.itemsPerPage ?? 20;

  const userToTableItem = (user: User): AdminUserTableItem => ({
    id: user.id,
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone ?? '',
    role: user.org_memberships?.[0]?.role?.name ?? 'N/A',
  });

  const loadUsers = async (override?: { filters?: Record<string, any>; page?: number; sort?: string }) => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    const currentFilters = override?.filters ?? filters;
    const params: Record<string, any> = {
      limit: itemsPerPage,
      page: override?.page ?? page,
      sort: override?.sort ?? sort ?? undefined,
      org_id: internalOrgId,
      ...currentFilters,
    };
    if (params.filters) delete params.filters;
    try {
      const response = await usersHook.getAll(params);
      if (!isMounted) return;
      if (response) {
        const transformedData: AdminUserTableItem[] = response.data.map(userToTableItem);
        setData(transformedData);
        if (response.uniqueValues) setFilterUniqueValues(response.uniqueValues);
        if (typeof response.total === 'number') setTotal(response.total);
        if (override?.page != null) setPage(override.page);
      }
    } catch (err) {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
        console.error('Error loading users:', err);
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
    return () => { isMounted = false; };
  };

  useEffect(() => {
    loadUsers();
  }, [])

  const handleSortChange = (sortSpec: string | undefined) => {
    setSort(sortSpec ?? undefined);
    setPage(1);
    loadUsers({ sort: sortSpec ?? undefined, page: 1 });
  };

  const handleFilterApply = (
    key: string,
    items: string[],
    type: string,
    columnConfig?: { filterApiParams?: { text?: string; number?: { from: string; to: string }; date?: { start: string; end: string }; isArray?: boolean; valueField?: 'id' | 'item' } }
  ) => {
    const apiParams = convertFilterToApiParams(key, items, type, columnConfig);
    const customTextParam = columnConfig?.filterApiParams?.text;
    const paramNames = [customTextParam || getStringFilterParam(key)].filter(Boolean) as string[];
    const newFilters = { ...filters };
    paramNames.forEach((paramName) => {
      if (paramName && newFilters[paramName] !== undefined) delete newFilters[paramName];
    });
    Object.keys(apiParams).forEach((paramKey) => {
      const value = apiParams[paramKey];
      if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        newFilters[paramKey] = value;
      }
    });
    setFilters(newFilters);
    setPage(1);
    loadUsers({ filters: newFilters, page: 1 });
  };

  const serverPagination = {
    total,
    page,
    limit: itemsPerPage,
    onPageChange: (p: number) => {
      setPage(p);
      loadUsers({ page: p });
    },
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAddUserOpen(true);
    setIsPanelOpen(true);
  };

  const handleAddUserSuccess = (createdUser: User) => {
    const item = userToTableItem(createdUser);
    setData((prev) => [item, ...prev]);
    setTotal((prev) => prev + 1);
    setIsAddUserOpen(false);
    setIsPanelOpen(false);
  };

  const handleEditSuccess = (updatedUser: User) => {
    const item = userToTableItem(updatedUser);
    setData((prev) => prev.map((u) => (u.id === item.id ? item : u)));
    setSelectedUser(item);
    setIsEditMode(false);
  };

  const handleRowClick = (user: AdminUserTableItem) => {
    setSelectedUser(user);
    setIsAddUserOpen(false);
    setIsPanelOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser?.id) return;
    setDeleteConfirmError(null);
    setDeleteConfirmLoading(true);
    try {
      const ok = await usersHook.delete(selectedUser.id);
      if (ok) {
        setData((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setTotal((prev) => Math.max(0, prev - 1));
        setIsDeleteMode(false);
        setIsPanelOpen(false);
        setSelectedUser(null);
      } else {
        setDeleteConfirmError(usersHook.error ?? 'Failed to delete user');
      }
    } finally {
      setDeleteConfirmLoading(false);
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteMode(false);
    setDeleteConfirmError(null);
  };

  if (!isAdmin) return <Unauthorized />

  return (
    <div className='flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative'>
         {/* Header */}
         <header className='absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0
         bg-background/20 backdrop-blur-sm z-[50]'>
            <PageHeader />
            <ActionButtons onAddUser={handleAddUser} />
        </header>

        
        <div className='flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[130px] lg:pt-[100px] w-full'>
        {/* Main content */}
            <div className='h-full w-full pr-2 pt-2 min-w-0'>
              <UserManagementContent
                data={data}
                loading={isLoading}
                onRowClick={handleRowClick}
                onFilterApply={handleFilterApply}
                onSortChange={handleSortChange}
                serverPagination={serverPagination}
                filterUniqueValues={filterUniqueValues}
              />
            </div>
        </div>

        <RightSlider
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setIsAddUserOpen(false);
          setIsEditMode(false);
          setIsDeleteMode(false);
        }}
        header={isAddUserOpen ? "Add User" : isEditMode ? "Edit User" : "User Details"}
        subHeader={!isAddUserOpen && selectedUser ? `${selectedUser.name}` : undefined}
        headerActions={!isAddUserOpen && selectedUser ? [
          // Show Edit icon when not in edit mode, Undo icon when in edit mode
          isEditMode ? {
            icon: Undo,
            onClick: () => {
              setIsEditMode(false)
              console.log('Cancel edit mode')
            },
            ariaLabel: 'Cancel edit',
            title: 'Cancel edit'
          } : {
            icon: Edit,
            onClick: () => {
              setIsEditMode(true)
              console.log('Edit user:', selectedUser.id)
              // TODO: Implement edit functionality
            },
            ariaLabel: 'Edit user',
            title: 'Edit user'
          },
          // Trash icon always visible
          {
            icon: Trash2,
            onClick: () => setIsDeleteMode(true),
            ariaLabel: 'Delete user',
            title: 'Delete user'
          }
        ] : undefined}
        >
          {isAddUserOpen ? (
            <UserSliderAddContainer
              roleOptions={roles}
              defaultOrgId={internalOrgId ?? undefined}
              onCreateUser={async (data) => {
                const user = await usersHook.create(data);
                if (!user) throw new Error('Failed to create user');
                return user;
              }}
              onSuccess={handleAddUserSuccess}
              onCancel={() => { setIsAddUserOpen(false); setIsPanelOpen(false); }}
            />
          ) : isEditMode ? (
            <UserSliderEditContainer
              selectedUser={selectedUser}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <UserSliderDetailsContainer selectedUser={selectedUser} />
          )}
      </RightSlider>

      <ConfirmModal
        open={isDeleteMode}
        onClose={handleDeleteModalClose}
        title="Delete user"
        description={
          <>
            {selectedUser && (
              <p>
                Are you sure you want to delete <strong>{selectedUser.name}</strong> ({selectedUser.email})? This cannot be undone.
              </p>
            )}
            {deleteConfirmError && (
              <p className="mt-2 text-destructive">{deleteConfirmError}</p>
            )}
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteConfirmLoading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default Index
