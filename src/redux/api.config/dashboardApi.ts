import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<{ success: boolean; data: any }, void>({
      query: () => API_ENDPOINTS.DASHBOARD.BASE,
      providesTags: [CACHE_TAGS.DASHBOARD],
    }),
    getIncomeExpenseByMonth: builder.query<{ success: boolean; data: any }, void>({
      query: () => API_ENDPOINTS.DASHBOARD.INCOME_EXPENSE_BY_MONTH,
      providesTags: [CACHE_TAGS.DASHBOARD],
    }),
  }),
});

export const { useGetDashboardQuery, useGetIncomeExpenseByMonthQuery } = dashboardApi;
