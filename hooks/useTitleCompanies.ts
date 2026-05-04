'use client';

import { useState } from 'react';
import { TitleCompany } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';

interface GetTitleCompaniesResponse {
  data: TitleCompany[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DeleteTitleCompanyResult =
  | { success: true }
  | { success: false; error?: string; relatedProjects?: Array<{ id: string; address: string; status: string }> };

export function useTitleCompanies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: { search?: string; page?: number; limit?: number }): Promise<GetTitleCompaniesResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/title-companies?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch title companies');
        return null;
      }

      return data as GetTitleCompaniesResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOneById = async (id: string): Promise<TitleCompany | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/title-companies/${id}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to fetch title company');
        return null;
      }
      return data as TitleCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: { name: string }): Promise<TitleCompany | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/title-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create title company');
        return null;
      }

      return result as TitleCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: { name: string }): Promise<TitleCompany | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/title-companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to update title company');
        return null;
      }
      return result as TitleCompany;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTitleCompany = async (id: string): Promise<DeleteTitleCompanyResult> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/title-companies/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Failed to delete title company');
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
    getOneById,
    create,
    update,
    delete: deleteTitleCompany,
    loading,
    error,
  };
}
