import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { ILoanReceiving } from '@/src/interface/common.interface';

export const loanReceivingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoanReceivings: builder.query<{ success: boolean; data: ILoanReceiving[] }, void>({
      query: () => API_ENDPOINTS.LOAN_RECEIVING.BASE,
      providesTags: [CACHE_TAGS.LOAN_RECEIVING],
    }),
    getSingleLoanReceiving: builder.query<{ success: boolean; data: ILoanReceiving }, string>({
      query: (id) => `${API_ENDPOINTS.LOAN_RECEIVING.BASE}${id}`,
      providesTags: [CACHE_TAGS.LOAN_RECEIVING],
    }),
    addLoanReceiving: builder.mutation<{ success: boolean; data: ILoanReceiving }, Partial<ILoanReceiving>>({
      query: (body) => ({ url: API_ENDPOINTS.LOAN_RECEIVING.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.LOAN_RECEIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    updateLoanReceiving: builder.mutation<{ success: boolean; data: ILoanReceiving }, { id: string; body: Partial<ILoanReceiving> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.LOAN_RECEIVING.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.LOAN_RECEIVING, CACHE_TAGS.DASHBOARD],
    }),
    deleteLoanReceiving: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.LOAN_RECEIVING.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.LOAN_RECEIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    addLoanReceivingPayment: builder.mutation<{ success: boolean }, { id: string; amount: number; date: string }>({
      query: ({ id, ...body }) => ({
        url: API_ENDPOINTS.LOAN_RECEIVING.PAYMENT(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: [CACHE_TAGS.LOAN_RECEIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    revertLoanReceivingToUnpaid: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: API_ENDPOINTS.LOAN_RECEIVING.REVERT(id), method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.LOAN_RECEIVING, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
  }),
});

export const {
  useGetLoanReceivingsQuery,
  useGetSingleLoanReceivingQuery,
  useAddLoanReceivingMutation,
  useUpdateLoanReceivingMutation,
  useDeleteLoanReceivingMutation,
  useAddLoanReceivingPaymentMutation,
  useRevertLoanReceivingToUnpaidMutation,
} = loanReceivingApi;
