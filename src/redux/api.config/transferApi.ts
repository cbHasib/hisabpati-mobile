import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { ITransfer } from '@/src/interface/common.interface';

export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransfers: builder.query<{ success: boolean; data: ITransfer[] }, void>({
      query: () => API_ENDPOINTS.TRANSFER.BASE,
      providesTags: [CACHE_TAGS.TRANSFERS],
    }),
    getTransfer: builder.query<{ success: boolean; data: ITransfer }, string>({
      query: (id) => `${API_ENDPOINTS.TRANSFER.BASE}${id}`,
      providesTags: [CACHE_TAGS.TRANSFERS],
    }),
    transferMoney: builder.mutation<
      { success: boolean; data: ITransfer },
      { from: string; to: string; amount: number; charge?: number; date: string; note?: string }
    >({
      query: (body) => ({ url: API_ENDPOINTS.TRANSFER.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.TRANSFERS, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    updateTransfer: builder.mutation<{ success: boolean; data: ITransfer }, { id: string; body: Partial<ITransfer> }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.TRANSFER.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.TRANSFERS, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
    deleteTransfer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.TRANSFER.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.TRANSFERS, CACHE_TAGS.DASHBOARD, CACHE_TAGS.ACCOUNTS],
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useGetTransferQuery,
  useTransferMoneyMutation,
  useUpdateTransferMutation,
  useDeleteTransferMutation,
} = transferApi;
