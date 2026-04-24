import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { IIncome } from '@/src/interface/common.interface';

export const incomeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomes: builder.query<{ success: boolean; data: IIncome[] }, void>({
      query: () => API_ENDPOINTS.INCOME.BASE,
      providesTags: [CACHE_TAGS.INCOMES],
    }),
    getIncome: builder.query<{ success: boolean; data: IIncome }, string>({
      query: (id) => `${API_ENDPOINTS.INCOME.BASE}${id}`,
      providesTags: [CACHE_TAGS.INCOMES],
    }),
    createIncome: builder.mutation<
      { success: boolean; data: IIncome },
      { amount: number; category: string; account: string; note: string; date: string }
    >({
      query: (body) => ({ url: API_ENDPOINTS.INCOME.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.INCOMES, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS, CACHE_TAGS.REPORT],
    }),
    updateIncome: builder.mutation<
      { success: boolean; data: IIncome },
      { id: string; body: Partial<IIncome> }
    >({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.INCOME.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.INCOMES, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS, CACHE_TAGS.REPORT],
    }),
    deleteIncome: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.INCOME.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.INCOMES, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS, CACHE_TAGS.REPORT],
    }),
  }),
});

export const {
  useGetIncomesQuery,
  useGetIncomeQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
} = incomeApi;
