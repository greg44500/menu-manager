// dashboardApi.js
import { baseApi } from './baseApi'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 📊 RÉCUPÉRATION DES STATS DU DASHBOARD
    getDashboardStats: builder.query({
      // 👇 On combine plusieurs appels API dans un seul
      async queryFn(_, __, ___, fetchWithBQ) {
        try {
          const [users, classrooms, progressions] = await Promise.all([
            fetchWithBQ('/users'),
            fetchWithBQ('/classrooms'),
            fetchWithBQ('/progressions'),
          ])

          const stats = {
            usersCount: users.data?.count || users.data?.data?.length || 0,
            classroomsCount: classrooms.data?.count || classrooms.data?.classrooms?.length || 0,
            progressionsCount: progressions.data?.count || progressions.data?.data?.length || 0,
            menusCount: 0, // À adapter plus tard
          }

          return { data: stats }
        } catch (error) {
          return { error: { message: 'Erreur dashboard', details: error } }
        }
      },
      providesTags: ['Dashboard']
    }),
  }),
  overrideExisting: false
})

export const {
  useGetDashboardStatsQuery,
} = dashboardApi
