'use client';

import { useState } from 'react';
import { Allocation, Project } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';
import type { UniqueValueItem } from '@/features/filtering-wrapper-multi-display/types';

interface GetProjectsParams {
  projectIds?: string[];
  companyIds?: string[];
  search?: string;
  page?: number;
  limit?: number;
  /** Compound sort: "column1:asc,column2:desc,..." e.g. "arv:asc,mortgage:desc". Columns: address, owner, lender, arv, mortgage, equity, investor_capital, leverage_percentage, status, created_at */
  sort?: string;
  // Filter parameters
  address_search?: string;
  company_search?: string;
  company_ids?: string[]; // Array of company IDs for filtering
  lender_search?: string;
  lender_ids?: string[]; // Array of lender IDs for filtering
  status_search?: string;
  after_repair_value_filter_from?: number;
  after_repair_value_filter_to?: number;
  mortgage_amount_filter_from?: number;
  mortgage_amount_filter_to?: number;
  purchase_price_filter_from?: number;
  purchase_price_filter_to?: number;
  rehab_budget_filter_from?: number;
  rehab_budget_filter_to?: number;
  purchase_date_filter_start?: string;
  purchase_date_filter_end?: string;
  sale_date_filter_start?: string;
  sale_date_filter_end?: string;
  created_at_filter_start?: string;
  created_at_filter_end?: string;
}

/** Re-export for consumers that import from hooks. */
export type { UniqueValueItem } from '@/features/filtering-wrapper-multi-display/types';

/** Summary aggregates over the filtered set (before pagination). */
export interface ProjectsSummary {
  total_arv: number;
  total_equity: number;
  total_investor_capital: number;
}

interface GetProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Facet counts per column, e.g. { company_unique_values: [...], lender_unique_values: [...] } */
  uniqueValues?: Record<string, UniqueValueItem[]>;
  /** Totals over filtered projects (after filters, before pagination). */
  summary?: ProjectsSummary;
}

interface CreateProjectData {
  company_id: string;
  address: string;
  status?: string;
  purchase_price?: number;
  rehab_budget?: number;
  after_repair_value?: number;
  mortgage_amount?: number;
  lender_org_id?: string | null;
  realtor_org_id?: string | null;
  contractor_org_id?: string | null;
  title_company_id?: string | null;
  purchase_closing_date?: string | null;
  sale_date?: string | null;
}

/** Simple params for GET /api/projects (no facets). */
interface GetAllParams {
  page?: number;
  limit?: number;
  /** Filter to projects that have at least one allocation for this investor org */
  investor_org_id?: string;
  /** Filter by company IDs (API param: company_ids, comma-separated) */
  company_ids?: string[];
}

interface GetAllResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useProjects() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: GetAllParams): Promise<GetAllResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/projects?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch projects');
        return null;
      }

      return data as GetAllResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAllWithFacets = async (params?: GetProjectsParams): Promise<GetProjectsResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/projects/with-facets?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch projects');
        return null;
      }

      return data as GetProjectsResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOneById = async (id: string): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch project');
        return null;
      }

      return data as Project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (projectData: CreateProjectData): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create project');
        return null;
      }

      return data as Project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, projectData: Partial<CreateProjectData>): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update project');
        return null;
      }

      return data as Project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete project');
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAll,
    getAllWithFacets,
    getOneById,
    create,
    update,
    delete: deleteProject,
    loading,
    error,
  };
}

