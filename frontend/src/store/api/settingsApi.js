// frontend/src/store/api/settingsApi.js
import { baseApi } from './baseApi'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettingsStats: builder.query({
      async queryFn(_, __, ___, fetchWithBQ) {
        try {
          const [typesServices, locations] = await Promise.all([
            fetchWithBQ('/types-services'),    // ← Types de services 
            fetchWithBQ('/locations'),         // ← Ateliers/locaux
          ])

          console.log('🔍 DEBUG - Réponses API:')
          console.log('- Types services:', typesServices)
          console.log('- Locations:', locations)
  

          // 🔧 CLARIFICATION DES 3 TYPES DE DONNÉES
          const stats = {
            // Types de services : petit-déjeuner, déjeuner, dîner, cocktail...
            typesServicesCount: typesServices?.data?.data?.length || 0,
            
            // Ateliers/locaux : cuisine, salle, bar, cave...
            locationsCount: locations?.data?.data?.length || 
                           locations?.data?.length || 
                           (Array.isArray(locations?.data) ? locations.data.length : 0),

          }

          console.log('📊 Stats calculées:', stats)
          return { data: stats }
          
        } catch (error) {
          console.error('❌ Erreur settingsApi:', error)
          return { 
            error: { 
              message: 'Erreur lors du chargement des paramétrages', 
              details: error 
            } 
          }
        }
      },
      providesTags: ['Settings', 'Location', 'TypeService'], // ← Tags simplifiés
    })
  }),
  overrideExisting: false
})

export const {
  useGetSettingsStatsQuery
} = settingsApi