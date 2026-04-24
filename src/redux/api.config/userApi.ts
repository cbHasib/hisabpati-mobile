import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { IUser } from '@/src/interface/user.interface';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<{ success: boolean; data: IUser }, string>({
      query: (id) => `${API_ENDPOINTS.USER.GET_USER}${id}`,
      providesTags: [CACHE_TAGS.USER],
    }),
    updateUser: builder.mutation<{ success: boolean; data: IUser }, { id: string; body: Partial<IUser> }>({
      query: ({ body }) => ({ url: API_ENDPOINTS.USER.UPDATE_USER, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.USER],
    }),
  }),
});

export const { useGetUserByIdQuery, useUpdateUserMutation } = userApi;
