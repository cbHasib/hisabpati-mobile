import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TSessionState = {
  isOnboarded: boolean;
  theme: 'light' | 'dark';
  language: string;
  isLanguageSet: boolean;
};

const initialState: TSessionState = {
  isOnboarded: false,
  theme: 'light',
  language: 'en',
  isLanguageSet: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setOnboarded(state) {
      state.isOnboarded = true;
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
      state.isLanguageSet = true;
    },
  },
});

export const { setOnboarded, setTheme, setLanguage } = sessionSlice.actions;
export default sessionSlice.reducer;
