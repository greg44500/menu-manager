// frontend/src/store/api/locationApi.js
import { baseApi } from './baseApi'

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔁 Liste des ateliers
    getLocations: builder.query({
      query: () => '/locations',
      providesTags: ['Location']
    }),

    // ➕ Créer
    createLocation: builder.mutation({
      query: (data) => ({
        url: '/locations',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Location', 'Settings']
    }),

    // ✏️ Modifier
    updateLocation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/locations/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Location', 'Settings']
    }),

    // 🗑️ Supprimer
    deleteLocation: builder.mutation({
      query: (id) => ({
        url: `/locations/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Location', 'Settings']
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation
} = locationApi
