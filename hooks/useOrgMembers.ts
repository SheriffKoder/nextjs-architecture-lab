'use client';

import { useState } from 'react';
import { OrgMember } from '@/lib/types';

interface GetOrgMembersResponse {
  data: OrgMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateOrgMemberData {
  org_id: string;
  user_id: string;
  role_id: string;
}

export function useOrgMembers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: { org_id?: string; user_id?: string; page?: number; limit?: number }): Promise<GetOrgMembersResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.org_id) queryParams.append('org_id', params.org_id);
      if (params?.user_id) queryParams.append('user_id', params.user_id);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/org-members?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch org members');
        return null;
      }

      return data as GetOrgMembersResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (memberData: CreateOrgMemberData): Promise<OrgMember | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/org-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create org member');
        return null;
      }

      return data as OrgMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAll,
    create,
    loading,
    error,
  };
}
