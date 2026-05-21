'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { buildQueryParams } from '@/lib/utils';
type RoleUniqueValue = {
  id: string;
  title: string;
  available: number;
  total: number;
};

interface GetUsersParams {
  page?: number;
  limit?: number;
  /** Sort: "name:asc" | "name:desc" */
  sort?: string;
  email_search?: string;
  name_search?: string;
  phone_search?: string;
  /** Comma-separated or array of role IDs */
  role_ids?: string[] | string;
}

interface GetUsersResponse {
  data: User[];
  total: number;
  uniqueValues?: { role_unique_values?: RoleUniqueValue[] };
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role_id: string;
}

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAll = async (params?: GetUsersParams): Promise<GetUsersResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);

      const response = await fetch(`/api/users?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch users');
        return null;
      }

      return data as GetUsersResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOneById = async (id: string): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch user');
        return null;
      }

      return data as User;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (userData: CreateUserData): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create user');
        return null;
      }

      return data as User;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, userData: Partial<CreateUserData>): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update user');
        return null;
      }

      return data as User;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
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
    update,
    delete: deleteUser,
    loading,
    error,
  };
}

