import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '@/src/interface/user.interface';

type TAuthState = {
  user: null | IUser;
  token: string | null;
  tempToken: string | null;
  isAuthenticated: boolean;

  lastLoginEmail?: string | null;
};

const initialState: TAuthState = {
  user: null,
  token: null,
  tempToken: null,
  isAuthenticated: false,
  lastLoginEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<IUser>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    logout() {
      return { ...initialState };
    },
    setLastLoginEmail(state, action: PayloadAction<string | null>) {
      state.lastLoginEmail = action.payload;
    },
  },
});

export const { setUser, setToken, updateUser, logout, setLastLoginEmail } = authSlice.actions;
export default authSlice.reducer;
