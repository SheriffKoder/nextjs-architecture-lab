'use client';

import { useState } from 'react';
import { Company } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';

interface GetCompaniesResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateCompanyData {
  name: string;
}

export type DeleteCompanyResult =
  | { success: true }
  | { success: false; error?: string; relatedOrgs?: Array<{ id: string; name: string; org_types: string[] }> };

export function useCompanies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: { search?: string; page?: number; limit?: number }): Promise<GetCompaniesResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/companies?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch companies');
        return null;
      }

      return data as GetCompaniesResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOneById = async (id: string): Promise<Company | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch company');
        return null;
      }

      return data as Company;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (companyData: CreateCompanyData): Promise<Company | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create company');
        return null;
      }

      return data as Company;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, companyData: Partial<CreateCompanyData>): Promise<Company | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update company');
        return null;
      }

      return data as Company;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string): Promise<DeleteCompanyResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Failed to delete company');
        if (response.status === 409 && Array.isArray(data.relatedOrgs)) {
          return { success: false, relatedOrgs: data.relatedOrgs, error: data.error };
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
    getOneById,
    create,
    update,
    delete: deleteCompany,
    loading,
    error,
  };
}
