'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/features/auth/store/hooks';
import { setRoles, setLoading, setError } from '@/features/auth/store/slices/roleSlice';
import type { Role } from '@/features/auth/roles/types';

interface GetRolesResponse {
  data: Role[];
}

export function useRoles() {
  const dispatch = useAppDispatch();
  const { roles, isLoading, error } = useAppSelector((state) => state.role);

  /**
   * Fetches roles if not already in state
   * Checks the slice - if roles exist, returns them without fetching
   * If not, fetches from API and dispatches to slice
   */
  const getRoles = useCallback(async (): Promise<Role[] | null> => {
    // If roles already exist in slice, return them without fetching
    if (roles.length > 0) {
      console.log('[useRoles] Roles already in slice, returning cached roles');
      return roles;
    }

    // If currently loading, don't fetch again
    if (isLoading) {
      console.log('[useRoles] Already loading, skipping fetch');
      return roles;
    }

    try {
      console.log('[useRoles] Fetching roles from API...');
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await fetch('/api/roles');
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to fetch roles';
        console.error('[useRoles] API error:', errorMessage);
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        return null;
      }

      const rolesData = data as GetRolesResponse;
      const fetchedRoles = rolesData.data || [];
      
      console.log('[useRoles] Roles fetched successfully:', {
        count: fetchedRoles.length,
      });
      
      // Dispatch to slice
      dispatch(setRoles(fetchedRoles));
      dispatch(setLoading(false));
      
      return fetchedRoles;
    } catch (err) {
      console.error('[useRoles] Fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return null;
    }
  }, [dispatch, roles, isLoading]);

  return {
    getRoles,
    roles,
    loading: isLoading,
    error,
  };
}

