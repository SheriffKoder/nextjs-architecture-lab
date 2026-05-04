'use client';

import { useState } from 'react';
import type { Org } from '@/lib/types';

export type RealtorWithAdmin = Org & {
  members?: Array<{
    org_id: string;
    user_id: string;
    role_id: string;
    user?: { id: string; name: string | null; email: string | null; phone?: string | null };
    role?: { id: string; name: string; key: string };
  }>;
};

export type DeleteRealtorResult =
  | { success: true }
  | { success: false; error?: string; relatedProjects?: Array<{ id: string; address: string; status: string }> };

export function useRealtors() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOne = async (id: string): Promise<RealtorWithAdmin | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/orgs/${id}/realtor`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Failed to fetch realtor');
        return null;
      }
      return data as RealtorWithAdmin;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (
    id: string,
    data: { name?: string; email?: string; phone?: string | null }
  ): Promise<RealtorWithAdmin | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/orgs/${id}/realtor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Failed to update realtor');
        if (response.status === 409) setError(result.error ?? 'This email is already in use');
        return null;
      }
      return result as RealtorWithAdmin;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRealtor = async (id: string): Promise<DeleteRealtorResult> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/orgs/${id}/realtor`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? 'Failed to delete realtor');
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
    getOne,
    update,
    delete: deleteRealtor,
    loading,
    error,
  };
}
