'use client';

import { useState } from 'react';
import { Allocation } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';

interface GetAllocationsParams {
  userIds?: string[];
  projectIds?: string[];
  /** Filter by investor org IDs (internal admin only). API param: investorOrgIds (comma-separated). */
  investorOrgIds?: string[];
  daysLeft?: number;
  page?: number;
  limit?: number;
}

interface GetAllocationsResponse {
  data: Allocation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateAllocationData {
  investor_org_id: string;
  project_id: string;
  allocation_amount: number;
  interest_rate_percentage: number;
  investment_method: string;
  investment_type: string;
  profit_split_percentage?: number;
  payment_term: string;
  note_maturity_date?: string;
  investment_date?: string;
}

type UpdateAllocationData = Partial<CreateAllocationData> & { status?: string };

export interface UseAllocationsReturn {
  getAll: (params?: GetAllocationsParams) => Promise<GetAllocationsResponse | null>;
  getOneById: (id: string) => Promise<Allocation | null>;
  create: (data: CreateAllocationData) => Promise<Allocation | null>;
  createBulk: (items: CreateAllocationData[]) => Promise<Allocation[] | null>;
  update: (id: string, data: UpdateAllocationData) => Promise<Allocation | null>;
  delete: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useAllocations(): UseAllocationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: GetAllocationsParams): Promise<GetAllocationsResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/allocations?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch allocations');
        return null;
      }

      return data as GetAllocationsResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOneById = async (id: string): Promise<Allocation | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/allocations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch allocation');
        return null;
      }

      return data as Allocation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (allocationData: CreateAllocationData): Promise<Allocation | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allocationData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create allocation');
        return null;
      }

      return data as Allocation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** Create multiple allocations in one request. Returns created allocations or null on error. */
  const createBulk = async (items: CreateAllocationData[]): Promise<Allocation[] | null> => {
    try {
      setLoading(true);
      setError(null);

      if (items.length === 0) return [];

      const response = await fetch('/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create allocations');
        return null;
      }

      return (data.data ?? data) as Allocation[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, allocationData: UpdateAllocationData): Promise<Allocation | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/allocations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allocationData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update allocation');
        return null;
      }

      return data as Allocation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllocation = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/allocations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete allocation');
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
    getOneById,
    create,
    createBulk,
    update,
    delete: deleteAllocation,
    loading,
    error,
  };
}

