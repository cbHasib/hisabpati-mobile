import { baseApi } from '../api/baseApi';
import { API_ENDPOINTS, CACHE_TAGS } from '@/src/constants';
import { ICategory } from '@/src/interface/common.interface';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<{ success: boolean; data: ICategory[] }, void>({
      query: () => API_ENDPOINTS.CATEGORY.BASE,
      providesTags: [CACHE_TAGS.CATEGORIES],
    }),
    createCategory: builder.mutation<{ success: boolean; data: ICategory }, { name: string; type: 'income' | 'expense' }>({
      query: (body) => ({ url: API_ENDPOINTS.CATEGORY.BASE, method: 'POST', body }),
      invalidatesTags: [CACHE_TAGS.CATEGORIES],
    }),
    updateCategory: builder.mutation<{ success: boolean; data: ICategory }, { id: string; body: { name: string } }>({
      query: ({ id, body }) => ({ url: `${API_ENDPOINTS.CATEGORY.BASE}${id}`, method: 'PUT', body }),
      invalidatesTags: [CACHE_TAGS.CATEGORIES],
    }),
    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${API_ENDPOINTS.CATEGORY.BASE}${id}`, method: 'DELETE' }),
      invalidatesTags: [CACHE_TAGS.CATEGORIES],
    }),
  }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } = categoryApi;
