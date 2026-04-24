import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseApi } from './api/baseApi';
import authReducer from './features/auth/authSlice';
import sessionReducer from './features/session/sessionSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['tempToken'],
};

const sessionPersistConfig = {
  key: 'session',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  session: persistReducer(sessionPersistConfig, sessionReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
