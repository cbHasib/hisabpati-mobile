import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { IAccount } from '@/src/interface/common.interface';

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query<{ success: boolean; data: IAccount[] }, void>({
      query: () => API_ENDPOINTS.ACCOUNT.BASE,
      providesTags: [CACHE_TAGS.ACCOUNTS],
    }),
    getAccount: builder.query<{ success: boolean; data: IAccount }, string>({
      query: (id) => `${API_ENDPOINTS.ACCOUNT.BASE}${id}`,
      providesTags: [CACHE_TAGS.ACCOUNTS],
    }),
    createAccount: builder.mutation<{ success: boolean; data: IAccount }, Partial<IAccount>>({
      query: (body) => ({ url: API_ENDPOINTS.ACCOUNT.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.ACCOUNTS, CACHE_TAGS.DASHBOARD],
    }),
    updateAccount: builder.mutation<{ success: boolean; data: IAccount }, { id: string; body: Partial<IAccount> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.ACCOUNT.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.ACCOUNTS, CACHE_TAGS.DASHBOARD],
    }),
    deleteAccount: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.ACCOUNT.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.ACCOUNTS, CACHE_TAGS.DASHBOARD],
    }),
  }),
});

export const { useGetAccountsQuery, useGetAccountQuery, useCreateAccountMutation, useUpdateAccountMutation, useDeleteAccountMutation } = accountApi;
