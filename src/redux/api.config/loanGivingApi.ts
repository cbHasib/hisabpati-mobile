import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { ILoanGiving } from '@/src/interface/common.interface';

export const loanGivingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoanGivings: builder.query<{ success: boolean; data: ILoanGiving[] }, void>({
      query: () => API_ENDPOINTS.LOAN_GIVING.BASE,
      providesTags: [CACHE_TAGS.LOAN_GIVING],
    }),
    getSingleLoanGiving: builder.query<{ success: boolean; data: ILoanGiving }, string>({
      query: (id) => `${API_ENDPOINTS.LOAN_GIVING.BASE}${id}`,
      providesTags: [CACHE_TAGS.LOAN_GIVING],
    }),
    addLoanGiving: builder.mutation<{ success: boolean; data: ILoanGiving }, Partial<ILoanGiving>>({
      query: (body) => ({ url: API_ENDPOINTS.LOAN_GIVING.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.LOAN_GIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    updateLoanGiving: builder.mutation<{ success: boolean; data: ILoanGiving }, { id: string; body: Partial<ILoanGiving> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.LOAN_GIVING.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.LOAN_GIVING, CACHE_TAGS.DASHBOARD],
    }),
    deleteLoanGiving: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.LOAN_GIVING.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.LOAN_GIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    addLoanGivingPayment: builder.mutation<{ success: boolean }, { id: string; amount: number; date: string }>({
      query: ({ id, ...body }) => ({
        url: API_ENDPOINTS.LOAN_GIVING.PAYMENT(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: [CACHE_TAGS.LOAN_GIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    revertLoanGivingToUnpaid: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: API_ENDPOINTS.LOAN_GIVING.REVERT(id), method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.LOAN_GIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
  }),
});

export const {
  useGetLoanGivingsQuery,
  useGetSingleLoanGivingQuery,
  useAddLoanGivingMutation,
  useUpdateLoanGivingMutation,
  useDeleteLoanGivingMutation,
  useAddLoanGivingPaymentMutation,
  useRevertLoanGivingToUnpaidMutation,
} = loanGivingApi;
