// frontend/src/store/api/calendarApi.js

import { baseApi } from '../api/baseApi'

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * 📅 RÉCUPÉRER TOUS LES CALENDRIERS (sessions)
     * - Tag chaque calendrier individuellement et tag "LIST" pour la collection.
     * - Permet l'invalidation fine et globale.
     */
    getAllCalendars: builder.query({
      query: () => '/calendars',
      // Tags: tous les calendriers + "LIST" pour la liste
      providesTags: (result) =>
        result && result.calendars
          ? [
            ...result.calendars.map(({ _id }) => ({ type: 'Calendar', id: _id })),
            { type: 'Calendar', id: 'LIST' }
          ]
          : [{ type: 'Calendar', id: 'LIST' }],
      transformResponse: (response) => ({
        calendars: response.data || [],
        count: Array.isArray(response.data) ? response.data.length : 0
      }),
    }),

    /**
     * ➕ CRÉER UN CALENDRIER
     * - Invalide la liste des calendriers pour forcer le refetch dans tous les composants consommateurs.
     */
    createCalendar: builder.mutation({
      query: (calendarData) => ({
        url: '/calendars',
        method: 'POST',
        body: calendarData,
      }),
      // Invalide la "LIST" pour recharger toutes les listes après création
      invalidatesTags: [{ type: 'Calendar', id: 'LIST' }],
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Erreur lors de la création du calendrier",
      }),
    }),

    /**
     * ✏️ MODIFIER UN CALENDRIER
     * - Invalide l'item édité ET la "LIST" (cohérence partout)
     */
    updateCalendar: builder.mutation({
      query: ({ id, ...calendarData }) => ({
        url: `/calendars/${id}`,
        method: 'PUT',
        body: calendarData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Calendar', id },
        { type: 'Calendar', id: 'LIST' }
      ],
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Erreur lors de la modification du calendrier",
      }),
    }),

    /**
     * 🗑️ SUPPRIMER UN CALENDRIER
     * - Invalide l'item supprimé ET la "LIST"
     */
    deleteCalendar: builder.mutation({
      query: (id) => ({
        url: `/calendars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Calendar', id },
        { type: 'Calendar', id: 'LIST' }
      ],
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Erreur lors de la suppression du calendrier",
      }),
    }),
  })
})

// Export des hooks générés
export const {
  useGetAllCalendarsQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
} = calendarApi;
