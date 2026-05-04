'use client';

import { useState } from 'react';
import { Org, OrgType } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';

interface GetOrgsResponse {
  data: Org[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateOrgData {
  name: string;
  org_types: OrgType[];
  company_id?: string;
  /** When provided with adminEmail and adminPassword, creates an admin user for the org */
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminPhone?: string;
}

export type DeleteOrgResult =
  | { success: true }
  | { success: false; error?: string; relatedProjects?: Array<{ id: string; address: string; status: string }> };

export function useOrgs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: { 
    org_type?: string; 
    search?: string; 
    page?: number; 
    limit?: number;
    includeAdmins?: boolean;
    includeMembers?: boolean;
    totalInvested?: boolean;
    projectsCount?: boolean;
  }): Promise<GetOrgsResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/orgs?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch orgs');
        return null;
      }

      return data as GetOrgsResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (orgData: CreateOrgData): Promise<Org | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create org');
        return null;
      }

      return data as Org;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: { name: string }): Promise<Org | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orgs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to update organization');
        return null;
      }

      return result as Org;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrg = async (
    id: string,
    options?: { removeType?: 'contractor' | 'lender' }
  ): Promise<DeleteOrgResult> => {
    try {
      setLoading(true);
      setError(null);

      const url =
        options?.removeType != null
          ? `/api/orgs/${id}?remove_type=${encodeURIComponent(options.removeType)}`
          : `/api/orgs/${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Failed to delete organization');
        if (response.status === 409 && Array.isArray(data.relatedProjects)) {
          return { success: false, relatedProjects: data.relatedProjects, error: data.error };
        }
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    } finally {
      setLoading(false);
    }
  };

  return {
    getAll,
    create,
    update,
    delete: deleteOrg,
    loading,
    error,
  };
}
