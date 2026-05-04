'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useProjects } from '@/hooks/useProjects';
import { useAllocations } from '@/hooks/useAllocations';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useCompanies } from '@/hooks/useCompanies';
import { useOrgs } from '@/hooks/useOrgs';
import { useOrgMembers } from '@/hooks/useOrgMembers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, XCircle, Info, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Project, Allocation, User, Role, OrgMember, Company, Org, OrgType } from '@/lib/types';

// Client-safe date formatting function
const formatDDMMYYYY = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const ORG_TYPE_OPTIONS: OrgType[] = ['internal', 'investor', 'lender', 'realtor', 'contractor'];

type Module = 'projects' | 'allocations' | 'users' | 'roles' | 'companies' | 'orgs' | 'org-members';

export default function TestFlowPage() {
  const { user, memberships, isAuthenticated } = useAppSelector((state) => state.user);
  const [activeModule, setActiveModule] = useState<Module>('projects');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Hooks
  const { roles, getRoles, loading: rolesLoading } = useRoles();
  const projectsHook = useProjects();
  const allocationsHook = useAllocations();
  const usersHook = useUsers();
  const companiesHook = useCompanies();
  const orgsHook = useOrgs();
  const orgMembersHook = useOrgMembers();

  // Data states
  const [projectsData, setProjectsData] = useState<any>(null);
  const [allocationsData, setAllocationsData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [rolesData, setRolesData] = useState<any>(null);
  const [companiesData, setCompaniesData] = useState<any>(null);
  const [orgsData, setOrgsData] = useState<any>(null);
  const [orgMembersData, setOrgMembersData] = useState<any>(null);

  // Reference data for select inputs
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [investorOrgs, setInvestorOrgs] = useState<Org[]>([]);
  const [lenderOrgs, setLenderOrgs] = useState<Org[]>([]);
  const [realtorOrgs, setRealtorOrgs] = useState<Org[]>([]);
  const [contractorOrgs, setContractorOrgs] = useState<Org[]>([]);
  const [allOrgs, setAllOrgs] = useState<Org[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    console.log('[TestFlowPage] Redux state updated:', {
      user,
      memberships,
      isAuthenticated,
      membershipsCount: memberships?.length || 0,
    });
  }, [user, memberships, isAuthenticated]);

  const loadData = async () => {
    switch (activeModule) {
      case 'projects':
        const projects = await projectsHook.getAllWithFacets();
        setProjectsData(projects);
        break;
      case 'allocations':
        const allocations = await allocationsHook.getAll();
        setAllocationsData(allocations);
        break;
      case 'users':
        const users = await usersHook.getAll();
        setUsersData(users);
        break;
      case 'roles':
        await getRoles();
        setRolesData({ data: roles, total: roles.length });
        break;
      case 'companies':
        const companies = await companiesHook.getAll();
        setCompaniesData(companies);
        break;
      case 'orgs':
        const orgs = await orgsHook.getAll();
        setOrgsData(orgs);
        break;
      case 'org-members':
        const orgMembers = await orgMembersHook.getAll();
        setOrgMembersData(orgMembers);
        break;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeModule, isAuthenticated]);

  const loadReferenceData = async () => {
    switch (activeModule) {
      case 'projects': {
        const [companiesRes, lenderOrgsRes, realtorOrgsRes, contractorOrgsRes] = await Promise.all([
          companiesHook.getAll(),
          orgsHook.getAll({ org_type: 'lender' }),
          orgsHook.getAll({ org_type: 'realtor' }),
          orgsHook.getAll({ org_type: 'contractor' }),
        ]);
        setCompaniesList(companiesRes?.data || []);
        setLenderOrgs(lenderOrgsRes?.data || []);
        setRealtorOrgs(realtorOrgsRes?.data || []);
        setContractorOrgs(contractorOrgsRes?.data || []);
        break;
      }
      case 'allocations': {
        const [investorOrgsRes, projectsRes] = await Promise.all([
          orgsHook.getAll({ org_type: 'investor' }),
          projectsHook.getAllWithFacets(),
        ]);
        setInvestorOrgs(investorOrgsRes?.data || []);
        setProjectsList(projectsRes?.data || []);
        break;
      }
      case 'users': {
        const fetchedRoles = await getRoles();
        setRolesList(fetchedRoles || roles);
        break;
      }
      case 'org-members': {
        const [orgsRes, usersRes] = await Promise.all([
          orgsHook.getAll(),
          usersHook.getAll(),
        ]);
        const fetchedRoles = await getRoles();
        setAllOrgs(orgsRes?.data || []);
        setUsersList(usersRes?.data || []);
        setRolesList(fetchedRoles || roles);
        break;
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReferenceData();
    }
  }, [activeModule, isAuthenticated]);

  const handleCreate = async () => {
    try {
      let result;
      switch (activeModule) {
        case 'projects':
          result = await projectsHook.create(formData);
          break;
        case 'allocations':
          result = await allocationsHook.create(formData);
          break;
        case 'users':
          result = await usersHook.create(formData);
          break;
        case 'roles':
          result = await fetch('/api/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }).then(r => r.json());
          break;
        case 'companies':
          result = await companiesHook.create(formData);
          break;
        case 'orgs':
          result = await orgsHook.create(formData);
          break;
        case 'org-members':
          result = await orgMembersHook.create(formData);
          break;
      }
      if (result) {
        setShowCreateForm(false);
        setFormData({});
        loadData();
      }
    } catch (error: any) {
      console.error('Create error:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      let result;
      switch (activeModule) {
        case 'projects':
          result = await projectsHook.update(id, formData);
          break;
        case 'allocations':
          result = await allocationsHook.update(id, formData);
          break;
        case 'users':
          result = await usersHook.update(id, formData);
          break;
        case 'companies':
          result = await companiesHook.update(id, formData);
          break;
      }
      if (result) {
        setEditingId(null);
        setFormData({});
        loadData();
      }
    } catch (error: any) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      let result;
      switch (activeModule) {
        case 'projects':
          result = await projectsHook.delete(id);
          break;
        case 'allocations':
          result = await allocationsHook.delete(id);
          break;
        case 'users':
          result = await usersHook.delete(id);
          break;
        case 'companies':
          result = await companiesHook.delete(id);
          break;
      }
      const ok = result === true || (typeof result === 'object' && result !== null && 'success' in result && (result as { success: boolean }).success);
      if (ok) loadData();
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  const getCurrentData = () => {
    switch (activeModule) {
      case 'projects': return projectsData;
      case 'allocations': return allocationsData;
      case 'users': return usersData;
      case 'roles': return rolesData;
      case 'companies': return companiesData;
      case 'orgs': return orgsData;
      case 'org-members': return orgMembersData;
      default: return null;
    }
  };

  const renderForm = () => {
    const isEditing = editingId !== null;
    const data = getCurrentData();
    const item = isEditing && data?.data ? data.data.find((i: any) => i.id === editingId) : null;

    switch (activeModule) {
      case 'projects':
        return (
          <div className="space-y-4">
            <div>
              <Label>Company *</Label>
              <select
                value={isEditing ? item?.company_id || formData.company_id || '' : formData.company_id || ''}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">Select company</option>
                {companiesList.map((company) => (
                  <option key={company.id} value={company.id} className='text-black'>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Address *</Label>
              <Input
                value={isEditing ? item?.address || formData.address || '' : formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Project address"
              />
            </div>
            <div>
              <Label>Purchase Price</Label>
              <Input
                type="number"
                step="0.01"
                value={isEditing ? item?.purchase_price || formData.purchase_price || '' : formData.purchase_price || ''}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Rehab Budget</Label>
              <Input
                type="number"
                step="0.01"
                value={isEditing ? item?.rehab_budget || formData.rehab_budget || '' : formData.rehab_budget || ''}
                onChange={(e) => setFormData({ ...formData, rehab_budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>After Repair Value</Label>
              <Input
                type="number"
                step="0.01"
                value={isEditing ? item?.after_repair_value || formData.after_repair_value || '' : formData.after_repair_value || ''}
                onChange={(e) => setFormData({ ...formData, after_repair_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Mortgage Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={isEditing ? item?.mortgage_amount || formData.mortgage_amount || '' : formData.mortgage_amount || ''}
                onChange={(e) => setFormData({ ...formData, mortgage_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Lender Org</Label>
              <select
                value={isEditing ? item?.lender_org_id || formData.lender_org_id || '' : formData.lender_org_id || ''}
                onChange={(e) => setFormData({ ...formData, lender_org_id: e.target.value || undefined })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">None</option>
                {lenderOrgs.map((org) => (
                  <option key={org.id} value={org.id} className='text-black'>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Realtor Org</Label>
              <select
                value={isEditing ? item?.realtor_org_id || formData.realtor_org_id || '' : formData.realtor_org_id || ''}
                onChange={(e) => setFormData({ ...formData, realtor_org_id: e.target.value || undefined })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">None</option>
                {realtorOrgs.map((org) => (
                  <option key={org.id} value={org.id} className='text-black'>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Contractor Org</Label>
              <select
                value={isEditing ? item?.contractor_org_id || formData.contractor_org_id || '' : formData.contractor_org_id || ''}
                onChange={(e) => setFormData({ ...formData, contractor_org_id: e.target.value || undefined })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">None</option>
                {contractorOrgs.map((org) => (
                  <option key={org.id} value={org.id} className='text-black'>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Purchase Closing Date (DD/MM/YYYY)</Label>
              <Input
                value={isEditing && item?.purchase_closing_date 
                  ? formatDDMMYYYY(item.purchase_closing_date)
                  : formData.purchase_closing_date || ''}
                onChange={(e) => setFormData({ ...formData, purchase_closing_date: e.target.value || undefined })}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <Label>Sale Date (DD/MM/YYYY)</Label>
              <Input
                value={isEditing && item?.sale_date 
                  ? formatDDMMYYYY(item.sale_date)
                  : formData.sale_date || ''}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value || undefined })}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => isEditing ? handleUpdate(editingId!) : handleCreate()}>
                <Save size={16} className="mr-2" /> {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                value={isEditing ? item?.email || formData.email || '' : formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            {!isEditing && (
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
            )}
            <div>
              <Label>Name</Label>
              <Input
                value={isEditing ? item?.name || formData.name || '' : formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="User name"
              />
            </div>
            {!isEditing && (
              <div>
                <Label>Role *</Label>
                <select
                  value={formData.role_id || ''}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option className='text-black' value="">Select role</option>
                  {rolesList.map((role) => (
                    <option key={role.id} value={role.id} className='text-black'>
                      {role.name} ({role.key})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => isEditing ? handleUpdate(editingId!) : handleCreate()}>
                <Save size={16} className="mr-2" /> {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Role name"
              />
            </div>
            <div>
              <Label>Key (optional, auto-generated)</Label>
              <Input
                value={formData.key || ''}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="role_key"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Save size={16} className="mr-2" /> Create
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      case 'companies':
        return (
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={isEditing ? item?.name || formData.name || '' : formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => isEditing ? handleUpdate(editingId!) : handleCreate()}>
                <Save size={16} className="mr-2" /> {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      case 'orgs':
        return (
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Organization name"
              />
            </div>
            <div>
              <Label>Org Types *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ORG_TYPE_OPTIONS.map((type) => {
                  const selected = Array.isArray(formData.org_types)
                    ? formData.org_types.includes(type)
                    : false;
                  return (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => {
                          const current = Array.isArray(formData.org_types)
                            ? formData.org_types
                            : [];
                          const next = checked
                            ? Array.from(new Set([...current, type]))
                            : current.filter((t: OrgType) => t !== type);
                          setFormData({ ...formData, org_types: next });
                        }}
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Save size={16} className="mr-2" /> Create
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      case 'org-members':
        return (
          <div className="space-y-4">
            <div>
              <Label>Org *</Label>
              <select
                value={formData.org_id || ''}
                onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">Select org</option>
                {allOrgs.map((org) => (
                  <option key={org.id} value={org.id} className='text-black'>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>User *</Label>
              <select
                value={formData.user_id || ''}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">Select user</option>
                {usersList.map((userOption) => (
                  <option key={userOption.id} value={userOption.id} className='text-black'>
                    {userOption.name || userOption.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Role *</Label>
              <select
                value={formData.role_id || ''}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">Select role</option>
                {rolesList.map((role) => (
                  <option key={role.id} value={role.id} className='text-black'>
                    {role.name} ({role.key})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Save size={16} className="mr-2" /> Create
              </Button>
              <Button variant="outline" onClick={() => { setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      case 'allocations':
        return (
          <div className="space-y-4">
            <div>
              <Label>Investor Org *</Label>
              <select
                value={isEditing ? item?.investor_org_id || formData.investor_org_id || '' : formData.investor_org_id || ''}
                onChange={(e) => setFormData({ ...formData, investor_org_id: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">Select investor org</option>
                {investorOrgs.map((org) => (
                  <option key={org.id} value={org.id} className='text-black'>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Project *</Label>
              <select
                value={isEditing ? item?.project_id || formData.project_id || '' : formData.project_id || ''}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option className='text-black' value="">Select project</option>
                {projectsList.map((project) => (
                  <option key={project.id} value={project.id} className='text-black'>
                    {project.address}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Allocation Amount *</Label>
              <Input
                type="number"
                value={isEditing ? item?.allocation_amount || formData.allocation_amount || '' : formData.allocation_amount || ''}
                onChange={(e) => setFormData({ ...formData, allocation_amount: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Interest Rate % *</Label>
              <Input
                type="number"
                value={isEditing ? item?.interest_rate_percentage || formData.interest_rate_percentage || '' : formData.interest_rate_percentage || ''}
                onChange={(e) => setFormData({ ...formData, interest_rate_percentage: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Investment Method *</Label>
              <Input
                value={isEditing ? item?.investment_method || formData.investment_method || '' : formData.investment_method || ''}
                onChange={(e) => setFormData({ ...formData, investment_method: e.target.value })}
                placeholder="Investment method"
              />
            </div>
            <div>
              <Label>Investment Type *</Label>
              <Input
                value={isEditing ? item?.investment_type || formData.investment_type || '' : formData.investment_type || ''}
                onChange={(e) => setFormData({ ...formData, investment_type: e.target.value })}
                placeholder="Investment type"
              />
            </div>
            <div>
              <Label>Payment Term *</Label>
              <Input
                value={isEditing ? item?.payment_term || formData.payment_term || '' : formData.payment_term || ''}
                onChange={(e) => setFormData({ ...formData, payment_term: e.target.value })}
                placeholder="Payment term"
              />
            </div>
            <div>
              <Label>Note Maturity Date (DD/MM/YYYY)</Label>
              <Input
                value={isEditing && item?.note_maturity_date 
                  ? formatDDMMYYYY(item.note_maturity_date)
                  : formData.note_maturity_date || ''}
                onChange={(e) => setFormData({ ...formData, note_maturity_date: e.target.value || undefined })}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <Label>Investment Date (DD/MM/YYYY)</Label>
              <Input
                value={isEditing && item?.investment_date 
                  ? formatDDMMYYYY(item.investment_date)
                  : formData.investment_date || ''}
                onChange={(e) => setFormData({ ...formData, investment_date: e.target.value || undefined })}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => isEditing ? handleUpdate(editingId!) : handleCreate()}>
                <Save size={16} className="mr-2" /> {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setEditingId(null); setShowCreateForm(false); setFormData({}); }}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderList = () => {
    const data = getCurrentData();
    if (!data || !data.data) return <p className="text-muted-foreground">No data loaded. Click "Load Data" to fetch.</p>;

    const items = data.data;
    const hasUpdate = ['projects', 'allocations', 'users', 'companies'].includes(activeModule);
    const hasDelete = ['projects', 'allocations', 'users', 'companies'].includes(activeModule);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Total: {data.total || 0} | Showing: {items.length}
          </p>
          <Button onClick={loadData} size="sm" variant="outline">
            <Loader2 size={14} className="mr-2" /> Refresh
          </Button>
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {items.map((item: any) => (
            <div key={item.id} className="p-3 border rounded-md bg-muted/30">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {activeModule === 'projects' && (
                    <div>
                      <p className="font-semibold">{item.address}</p>
                      <p className="text-xs text-muted-foreground">Company: {item.company?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">Price: ${item.purchase_price || 0}</p>
                    </div>
                  )}
                  {activeModule === 'allocations' && (
                    <div>
                      <p className="font-semibold">${item.allocation_amount}</p>
                      <p className="text-xs text-muted-foreground">Project: {item.project?.address || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">Rate: {item.interest_rate_percentage}%</p>
                    </div>
                  )}
                  {activeModule === 'users' && (
                    <div>
                      <p className="font-semibold">{item.name || 'No Name'}</p>
                      <p className="text-xs text-muted-foreground">{item.email}</p>
                    </div>
                  )}
                  {activeModule === 'roles' && (
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <code className="text-xs text-muted-foreground">{item.key}</code>
                    </div>
                  )}
                  {activeModule === 'companies' && (
                    <div>
                      <p className="font-semibold">{item.name}</p>
                    </div>
                  )}
                  {activeModule === 'orgs' && (
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(item.org_types || []).map((type: OrgType) => (
                          <Badge key={type} variant="outline" className="text-xs capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeModule === 'org-members' && (
                    <div>
                      <p className="font-semibold">{item.user?.name || item.user_id}</p>
                      <p className="text-xs text-muted-foreground">Org: {item.org?.name} | Role: {item.role?.name}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {hasUpdate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(item.id);
                        setShowCreateForm(false);
                        setFormData(item);
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                  )}
                  {hasDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle size={20} /> Not Authenticated
            </CardTitle>
            <CardDescription>
              Please log in to test the authorization flow.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const modules: { key: Module; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'allocations', label: 'Allocations' },
    { key: 'users', label: 'Users' },
    { key: 'roles', label: 'Roles' },
    { key: 'companies', label: 'Companies' },
    { key: 'orgs', label: 'Organizations' },
    { key: 'org-members', label: 'Org Members' },
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRUD Operations Tester</h1>
        <p className="text-muted-foreground mt-2">
          Full CRUD operations for all modules. Test create, read, update, and delete operations.
        </p>
      </div>

      {/* Module Tabs */}
      <div className="flex gap-2 border-b">
        {modules.map((module) => (
          <Button
            key={module.key}
            variant={activeModule === module.key ? 'default' : 'ghost'}
            onClick={() => {
              setActiveModule(module.key);
              setEditingId(null);
              setShowCreateForm(false);
              setFormData({});
            }}
          >
            {module.label}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* List View */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{modules.find(m => m.key === activeModule)?.label} List</CardTitle>
              {!showCreateForm && !editingId && (
                <Button size="sm" onClick={() => { setShowCreateForm(true); setEditingId(null); setFormData({}); }}>
                  <Plus size={16} className="mr-2" /> Create New
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderList()}
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit' : showCreateForm ? 'Create New' : 'Form'}
            </CardTitle>
            <CardDescription>
              {!showCreateForm && !editingId && 'Click "Create New" to add an item'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(showCreateForm || editingId) ? renderForm() : (
              <p className="text-muted-foreground text-sm">No form active</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="text-blue-500" size={20} /> Current User Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">User</p>
              <p className="font-mono text-xs">{user?.id}</p>
              <p>{user?.name || 'N/A'} ({user?.email})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Memberships</p>
              <div className="space-y-1">
                {memberships.map((m, i) => (
                  <div key={i} className="text-xs p-2 bg-muted rounded">
                    <span className="font-bold">{m.org?.name}</span> - {m.role?.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
