import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, OrgMember } from '@/lib/types';

interface UserState {
  user: User | null;
  memberships: OrgMember[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  memberships: [],
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; memberships: OrgMember[] }>) => {
      console.log('[userSlice] setUser reducer called with:', {
        user: action.payload.user,
        membershipsCount: action.payload.memberships?.length || 0,
        memberships: action.payload.memberships,
      });
      state.user = action.payload.user;
      state.memberships = action.payload.memberships;
      state.isAuthenticated = true;
      console.log('[userSlice] State after setUser:', {
        user: state.user,
        membershipsCount: state.memberships.length,
        isAuthenticated: state.isAuthenticated,
      });
    },
    clearUser: (state) => {
      state.user = null;
      state.memberships = [];
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;
export default userSlice.reducer;

