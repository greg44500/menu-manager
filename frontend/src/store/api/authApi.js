// frontend/src/store/api/authApi.js
import { baseApi } from './baseApi'

// 🔐 API D'AUTHENTIFICATION
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // 🚀 CONNEXION
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials, // { email, password }
      }),
      // 🍪 Les cookies JWT seront automatiquement stockés par le navigateur
      // grâce à credentials: 'include' dans baseApi
      invalidatesTags: ['User'],
    }),
    
    // 🚪 DÉCONNEXION
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'GET', // Votre backend utilise GET pour logout
      }),
      // 🧹 Nettoie le cache après déconnexion
      invalidatesTags: ['User', 'Classroom', 'Progression', 'Service', 'Menu'],
    }),
    
    // 👤 RÉCUPÉRATION DU PROFIL UTILISATEUR
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
      // 🔄 Transforme la réponse pour extraire les données utilisateur
      transformResponse: (response) => response.user,
    }),
    
    // 🔑 CHANGEMENT DE MOT DE PASSE
    updatePassword: builder.mutation({
      query: ({ userId, newPassword }) => ({
        url: `/users/password/${userId}`,
        method: 'PATCH',
        body: { newPassword },
      }),
      invalidatesTags: ['User'],
    }),
    
    // 📧 DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: '/users/request-password-reset',
        method: 'POST',
        body: { email },
      }),
    }),
    
    // 🔄 RÉINITIALISATION DE MOT DE PASSE AVEC TOKEN
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/users/reset-password',
        method: 'POST',
        body: { token, password },
      }),
    }),
    
    // 👥 CRÉER UN UTILISATEUR (Admin seulement)
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/create-user',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
  }),
  overrideExisting: false,
})

// 📤 EXPORT DES HOOKS GÉNÉRÉS AUTOMATIQUEMENT
export const {
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdatePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useCreateUserMutation,
} = authApi