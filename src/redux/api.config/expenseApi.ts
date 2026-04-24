import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { IExpense } from '@/src/interface/common.interface';

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<{ success: boolean; data: IExpense[] }, void>({
      query: () => API_ENDPOINTS.EXPENSE.BASE,
      providesTags: [CACHE_TAGS.EXPENSES],
    }),
    getExpense: builder.query<{ success: boolean; data: IExpense }, string>({
      query: (id) => `${API_ENDPOINTS.EXPENSE.BASE}${id}`,
      providesTags: [CACHE_TAGS.EXPENSES],
    }),
    createExpense: builder.mutation<
      { success: boolean; data: IExpense },
      { amount: number; category: string; account: string; note: string; date: string }
    >({
      query: (body) => ({ url: API_ENDPOINTS.EXPENSE.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.EXPENSES, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS, CACHE_TAGS.REPORT],
    }),
    updateExpense: builder.mutation<
      { success: boolean; data: IExpense },
      { id: string; body: Partial<IExpense> }
    >({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.EXPENSE.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.EXPENSES, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS, CACHE_TAGS.REPORT],
    }),
    deleteExpense: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.EXPENSE.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.EXPENSES, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS, CACHE_TAGS.REPORT],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
