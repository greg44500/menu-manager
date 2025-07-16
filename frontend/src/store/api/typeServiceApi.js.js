// store/api/typeServiceApi.js
import { baseApi } from './baseApi'

export const typeServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTypesServices: builder.query({
      query: () => '/types-services',
      providesTags: ['TypeService']
    }),
    createTypeService: builder.mutation({
      query: (newType) => ({
        url: '/types-services',
        method: 'POST',
        body: newType
      }),
      invalidatesTags: ['TypeService', 'Settings']
    }),
    updateTypeService: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/types-services/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: ['TypeService', 'Settings']
    }),
    deleteTypeService: builder.mutation({
      query: (id) => ({
        url: `/types-services/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['TypeService', 'Settings']
    })
  })
})

// ✅ Noms des hooks cohérents avec les noms des endpoints
export const {
  useGetTypesServicesQuery,
  useCreateTypeServiceMutation,
  useUpdateTypeServiceMutation,
  useDeleteTypeServiceMutation
} = typeServiceApi
