import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { INotification } from '@/src/interface/common.interface';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ success: boolean; data: INotification[] }, void>({
      query: () => API_ENDPOINTS.NOTIFICATION.BASE,
      providesTags: [CACHE_TAGS.NOTIFICATIONS],
    }),
    getNotification: builder.query<{ success: boolean; data: INotification }, string>({
      query: (id) => API_ENDPOINTS.NOTIFICATION.GET_SINGLE(id),
      providesTags: [CACHE_TAGS.NOTIFICATIONS],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.NOTIFICATION.BASE}mark-read/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: [CACHE_TAGS.NOTIFICATIONS],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: `${API_ENDPOINTS.NOTIFICATION.BASE}mark-all-read`,
        method: 'PUT',
      }),
      invalidatesTags: [CACHE_TAGS.NOTIFICATIONS],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
