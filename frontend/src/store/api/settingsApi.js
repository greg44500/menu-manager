// frontend/src/store/api/settingsApi.js
import { baseApi } from './baseApi'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettingsStats: builder.query({
      async queryFn(_, __, ___, fetchWithBQ) {
        try {
          const [servicesTypes, locations, productions] = await Promise.all([
            fetchWithBQ('/types-services'),    // ← à adapter selon ta route réelle
            fetchWithBQ('/locations'),
            fetchWithBQ('/production-types')
          ])

          const stats = {
            typesServicesCount: servicesTypes?.data?.length || 0,
            locationsCount: locations?.data?.length || 0,
            productionTypesCount: productions?.data?.length || 0
          }

          return { data: stats }
        } catch (error) {
          return { error: { message: 'Erreur lors du chargement des paramétrages', details: error } }
        }
      },
      providesTags: ['Settings']
    })
  }),
  overrideExisting: false
})

export const {
  useGetSettingsStatsQuery
} = settingsApi
