// General domain interfaces based on Prisma schema

export type OrgType = 'internal' | 'investor' | 'lender' | 'realtor' | 'contractor';

export interface Role {
  id: string;
  key: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  org_memberships?: OrgMember[];
}

export interface Org {
  id: string;
  name: string;
  org_types: OrgType[];
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  org?: Org;
  user?: User;
  role?: Role;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TitleCompany {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  lender_org_id: string | null;
  realtor_org_id: string | null;
  contractor_org_id?: string | null;
  title_company_id?: string | null;
  address: string;
  purchase_price: number | null;
  rehab_budget: number | null;
  after_repair_value: number | null;
  mortgage_amount: number | null;
  status: string;
  purchase_closing_date: string | null;
  sale_date: string | null;
  created_at: string;
  updated_at: string;
  company?: Company;
  lender_org?: Org;
  realtor_org?: Org;
  contractor_org?: Org;
  title_company?: TitleCompany;
  allocations?: Allocation[];
  // Calculated fields for UI
  total_cost?: number;
  equity?: number;
  investor_current_value?: number;
  investor_capital?: number;
  leverage_percentage?: number;
}

export interface Allocation {
  id: string;
  status: string;
  investor_org_id: string;
  created_by_user_id: string;
  project_id: string;
  allocation_amount: number;
  interest_rate_percentage: number;
  investment_method: string;
  investment_date: string;
  investment_type: string;
  profit_split_percentage: number | null;
  payment_term: string;
  distributed_to_date: number;
  note_maturity_date: string | null;
  inactive_date: string | null;
  created_at: string;
  updated_at: string;
  investor_org?: Org;
  project?: Project;
  created_by?: User;
  accrued_interest: number;
  transactions?: Transaction[];
  // Calculated fields for UI
  current_investment?: number;
  days_left?: number | null;
}

export interface Transaction {
  id: string;
  from_company_id: string;
  to_org_id: string;
  amount: number;
  allocation_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  from_company?: Company;
  to_org?: Org;
  allocation?: Allocation;
  project?: Project;
}
