// src/store/api/progressionsApi.js
import { baseApi } from "./baseApi"; // Assure-toi que apiSlice.js est bien configuré

export const progressionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer toutes les progressions
    getAllProgressions: builder.query({
      query: () => '/progressions',
      providesTags: ['Progression'],
    }),

    // Récupérer une progression par ID
    getProgressionById: builder.query({
      query: (id) => `/progressions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Progression', id }],
    }),

    // Créer une progression
    createProgression: builder.mutation({
      query: (data) => ({
        url: '/progressions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Progression'],
    }),

    // Modifier une progression
    updateProgression: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/progressions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Progression', id },
        'Progressions',
        { type: 'Services', id } // ✅ invalide les services liés à la progression
      ],
    }),

    //Assigner un formateur à une progression
    assignTeachers: builder.mutation({
      query: ({ id, teachers }) => ({
        url: `/progressions/${id}/assign-teachers`,
        method: 'PUT',
        body: { teachers },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Progression', id },  // <> invalide cette progression
        'Progressions',                // invalide aussi la liste
      ],
    }),

    // Supprimer une progression
    deleteProgression: builder.mutation({
      query: (id) => ({
        url: `/progressions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Progression'],
    }),
  }),
});

export const {
  useGetAllProgressionsQuery,
  useGetProgressionByIdQuery,
  useCreateProgressionMutation,
  useUpdateProgressionMutation,
  useDeleteProgressionMutation,
  useAssignTeachersMutation,
} = progressionsApi;
