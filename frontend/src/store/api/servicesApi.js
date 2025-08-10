import { baseApi } from './baseApi'

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Liste des services d'une progression
    getServicesByProgression: builder.query({
      query: (progressionId) => `/progressions/${progressionId}/services`,
      providesTags: (result, error, progressionId) => [
        { type: 'Services', id: progressionId },
        'Services'
      ]
    }),

    // Détail d'un service
    getServiceById: builder.query({
      query: ({ progressionId, serviceId }) => `/progressions/${progressionId}/services/${serviceId}`,
      providesTags: (result, error, { serviceId }) => [
        { type: 'Service', id: serviceId }
      ]
    }),

    // Modifier un service (ou menu inclus)
    updateService: builder.mutation({
      query: ({ progressionId, serviceId, ...body }) => ({
        url: `/progressions/${progressionId}/services/${serviceId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (result, error, { serviceId }) => [
        { type: 'Service', id: serviceId },
        'Service'
      ]
    }),
    // Modifier la date d'un service
    updateServiceDate: builder.mutation({
      query: ({ progressionId, serviceId, serviceDate }) => ({
        url: `/progressions/${progressionId}/services/${serviceId}/date`,
        method: 'PATCH',
        body: { serviceDate }
      }),
      invalidatesTags: (r, e, { serviceId }) => [{ type: 'Service', id: serviceId }, 'Service']
    }),
    // Supprimer un service
    deleteService: builder.mutation({
      query: ({ progressionId, serviceId }) => ({
        url: `/progressions/${progressionId}/services/${serviceId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Service']
    }),
  }),
  overrideExisting: false
})

export const {
  useGetServicesByProgressionQuery,
  useGetServiceByIdQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useUpdateServiceDateMutation
} = servicesApi