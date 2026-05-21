'use client';

import { useEffect } from 'react';
import { createClient } from '@/features/auth/supabase/client';
import { useAppDispatch, useAppSelector } from '@/features/auth/store/hooks';
import { setUser, setLoading } from '@/features/auth/store/slices/userSlice';
import type { User } from '@/features/auth/users/types';
import type { UserRole } from '@/features/auth/roles/types';

/**
 * Restores Redux user + role from Supabase session via GET /api/users/me.
 */
export function SessionRestorer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    const restoreSession = async () => {
      try {
        dispatch(setLoading(true));

        const supabase = createClient();
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          dispatch(setLoading(false));
          return;
        }

        const userResponse = await fetch('/api/users/me');

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
          };

          dispatch(
            setUser({
              user,
              role: (userData.role as UserRole | null) ?? null,
            })
          );
        }
      } catch (error) {
        console.error('[SessionRestorer] Error restoring session:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  return null;
}
