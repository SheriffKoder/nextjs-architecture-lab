'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/features/auth/store/hooks';
import { setUser, clearUser, setLoading } from '@/features/auth/store/slices/userSlice';
import type { User } from '@/features/auth/users/types';
import type { UserRole } from '@/features/auth/roles/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  role: UserRole | null;
  session: unknown;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.user.isLoading);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      dispatch(setLoading(true));
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return null;
      }

      const loginData = data as LoginResponse;
      dispatch(setUser({ user: loginData.user, role: loginData.role }));

      return loginData.user;
    } catch (err) {
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
