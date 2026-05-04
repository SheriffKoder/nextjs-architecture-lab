import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    role: roleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

