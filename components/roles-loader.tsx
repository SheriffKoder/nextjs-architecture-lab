'use client';

import { useEffect } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { useAppSelector } from '@/lib/store/hooks';

/**
 * RolesLoader component
 * 
 * This component runs on mount and ensures roles are loaded.
 * Uses the useRoles hook which handles checking if roles exist
 * and only fetching if needed.
 * Only fetches roles when the user is authenticated.
 */
export function RolesLoader() {
  const { getRoles, roles, loading } = useRoles();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Only fetch roles if user is authenticated
    if (!isAuthenticated) {
      console.log('[RolesLoader] User not authenticated, skipping roles fetch');
      return;
    }

    // The hook will check if roles exist and only fetch if needed
    if (!loading && roles.length === 0) {
      console.log('[RolesLoader] User authenticated, calling getRoles from hook...');
      getRoles();
    }
  }, [getRoles, roles.length, loading, isAuthenticated]);

  return null; // This component doesn't render anything
}
