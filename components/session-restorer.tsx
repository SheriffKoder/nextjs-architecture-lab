'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, setLoading } from '@/lib/store/slices/userSlice';
import { User, OrgMember } from '@/lib/types';

/**
 * SessionRestorer component
 * 
 * This component runs on mount and checks for an active Supabase session.
 * If a session exists, it fetches the user data and populates Redux.
 * This ensures Redux state persists across page navigations and refreshes.
 */
export function SessionRestorer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Only restore if not already authenticated
    if (isAuthenticated) {
      console.log('[SessionRestorer] Already authenticated, skipping restore');
      return;
    }

    const restoreSession = async () => {
      try {
        console.log('[SessionRestorer] Checking for active session...');
        dispatch(setLoading(true));

        const supabase = createClient();
        
        // Check for active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[SessionRestorer] Error getting session:', sessionError);
          dispatch(setLoading(false));
          return;
        }

        if (!session?.user) {
          console.log('[SessionRestorer] No active session found');
          dispatch(setLoading(false));
          return;
        }

        console.log('[SessionRestorer] Active session found, fetching user data...', {
          userId: session.user.id,
        });

        // Fetch user data from API
        const userResponse = await fetch('/api/users/me');
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('[SessionRestorer] User data fetched:', {
            userId: userData.id,
            email: userData.email,
            membershipsCount: userData.memberships?.length || 0,
            memberships: userData.memberships,
          });
          
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
          };

          console.log('[SessionRestorer] Dispatching setUser to Redux...', {
            user,
            memberships: userData.memberships || [],
          });
          
          dispatch(setUser({ 
            user, 
            memberships: userData.memberships || [] 
          }));
          
          console.log('[SessionRestorer] Session restored successfully');
        } else {
          const errorData = await userResponse.json().catch(() => ({}));
          console.log('[SessionRestorer] Failed to fetch user data:', {
            status: userResponse.status,
            error: errorData.error,
          });
        }
      } catch (error) {
        console.error('[SessionRestorer] Error restoring session:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  return null; // This component doesn't render anything
}
