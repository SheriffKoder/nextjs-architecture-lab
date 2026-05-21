import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@/features/auth/roles/types';

interface RoleState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  isLoading: false,
  error: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
      state.error = null;
      console.log('[roleSlice] Roles stored in state:', {
        count: action.payload.length,
      });
    },
    clearRoles: (state) => {
      state.roles = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRoles, clearRoles, setLoading, setError } = roleSlice.actions;
export default roleSlice.reducer;

