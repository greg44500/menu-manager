// frontend/src/store/api/classroomsApi.js
import { baseApi } from './baseApi';

export const classroomsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 📋 RÉCUPÉRER TOUTES LES CLASSES
    getAllClassrooms: builder.query({
      query: () => '/classrooms',
      providesTags: ['Classroom'],
      transformResponse: (response) => ({
        classrooms: response.classrooms || [],
        count: response.count || 0,
      })
    }),

    // ➕ CRÉER UNE CLASSE
    createClassroom: builder.mutation({
      query: (data) => ({
        url: '/classrooms/create-classroom',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Classroom', 'Dashboard']
    }),

    // ✏️ METTRE À JOUR UNE CLASSE
    updateClassroom: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/classrooms/update-classroom/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Classroom', id },
        'Classroom'
      ]
    }),

    // 🔍 RÉCUPÉRER UNE CLASSE PAR ID
    getClassroomById: builder.query({
      query: (id) => `/classrooms/${id}`,
      providesTags: (result, error, id) => [{ type: 'Classroom', id }]
    }),

    // 🗑️ SUPPRIMER UNE CLASSE
    deleteClassroom: builder.mutation({
      query: (id) => ({
        url: `/classrooms/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Classroom', 'Dashboard']
    }),

  }),
  overrideExisting: false
});

export const {
  useGetAllClassroomsQuery,
  useCreateClassroomMutation,
  useUpdateClassroomMutation,
  useGetClassroomByIdQuery,
  useDeleteClassroomMutation
} = classroomsApi;
