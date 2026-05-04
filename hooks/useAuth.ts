'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '@/lib/store/slices/userSlice';
import { User } from '@/lib/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    created_at: string;
    updated_at: string;
  };
  memberships: any[];
  session: any;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.user.isLoading);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      console.log('[useAuth] Starting login...', { email: credentials.email });
      dispatch(setLoading(true));
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('[useAuth] Login API response status:', response.status);
      const data = await response.json();
      console.log('[useAuth] Login API response data:', data);

      if (!response.ok) {
        console.error('[useAuth] Login failed:', data.error);
        setError(data.error || 'Login failed');
        return null;
      }

      const loginData = data as LoginResponse;
      console.log('[useAuth] Parsed login data:', {
        user: loginData.user,
        membershipsCount: loginData.memberships?.length || 0,
        memberships: loginData.memberships,
      });
      
      const user: User = {
        id: loginData.user.id,
        email: loginData.user.email,
        name: loginData.user.name,
        created_at: loginData.user.created_at,
        updated_at: loginData.user.updated_at,
      };

      console.log('[useAuth] Dispatching setUser to Redux...', { user, memberships: loginData.memberships });
      dispatch(setUser({ user, memberships: loginData.memberships }));
      console.log('[useAuth] setUser dispatched successfully');
      
      return user;
    } catch (err) {
      console.error('[useAuth] Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Logout failed');
        return;
      }
      setError(null);
      dispatch(clearUser());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      dispatch(clearUser());
    }
  };

  return {
    login,
    logout,
    error,
    isLoading,
  };
}

