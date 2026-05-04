'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';

interface GetTransactionsParams {
  to_org_id?: string;
  from_company_id?: string;
  allocation_id?: string;
  project_id?: string;
  page?: number;
  limit?: number;
}

interface GetTransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: GetTransactionsParams): Promise<GetTransactionsResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/transactions?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch transactions');
        return null;
      }

      return data as GetTransactionsResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAll,
    loading,
    error,
  };
}
