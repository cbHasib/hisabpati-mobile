import { baseApi } from '../../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { setLastLoginEmail, setToken, setUser } from './authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ success: boolean; token: string; user: any }, { email: string; password: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.token));
          dispatch(setUser(data.user));
          dispatch(setLastLoginEmail(data?.user?.email));
        } catch {}
      },
    }),
    register: builder.mutation<
      { success: boolean; message: string },
      { name: string; email: string; phone: string; password: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { oldPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body,
      }),
    }),
    resetPasswordEmail: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD_EMAIL,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useResetPasswordEmailMutation,
} = authApi;
