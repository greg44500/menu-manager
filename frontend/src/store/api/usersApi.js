// frontend/src/store/api/usersApi.js - VERSION FINALISÉE

import { baseApi } from './baseApi'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // ============================================================================
    // RÉCUPÉRATION DES UTILISATEURS
    // ============================================================================
    
    // 📋 RÉCUPÉRER TOUS LES UTILISATEURS (route backend implémentée ✅)
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response) => ({
        users: response.data || [],
        count: response.count || 0
      }),
    }),
    
    // 👤 RÉCUPÉRER LE PROFIL UTILISATEUR CONNECTÉ (route existante ✅)
    getUserProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['UserProfile'],
      transformResponse: (response) => response.user,
    }),
    
    // 👤 RÉCUPÉRER UN UTILISATEUR SPÉCIFIQUE (route backend implémentée ✅)
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response) => response.data,
    }),

    // 📊 STATISTIQUES DES UTILISATEURS (calculées dynamiquement)
    getUserStats: builder.query({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response) => {
        const users = response.data || []
        
        // Calcul des statistiques à partir des données réelles
        const stats = {
          total: users.length,
          superAdmins: users.filter(u => u.role === 'superAdmin').length,
          managers: users.filter(u => u.role === 'manager').length,
          formateurs: users.filter(u => u.role === 'user').length,
          active: users.filter(u => u.isActive === true).length,
          inactive: users.filter(u => u.isActive === false).length,
          temporaryPasswords: users.filter(u => u.isTemporaryPassword === true).length,
          cuisine: users.filter(u => u.role === 'user' && u.specialization === 'cuisine').length,
          service: users.filter(u => u.role === 'user' && u.specialization === 'service').length,
        }
        
        return stats
      },
    }),
    
    // ============================================================================
    // MUTATIONS - CRÉATION/MODIFICATION/SUPPRESSION
    // ============================================================================
    
    // ➕ CRÉER UN NOUVEL UTILISATEUR (route existante ✅)
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/create-user',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User', 'UserProfile', 'Dashboard'],
      transformResponse: (response) => response.data,
      // Gestion d'erreur personnalisée
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors de la création de l\'utilisateur',
        errors: response.data?.errors || null
      }),
    }),
    
    // ✏️ METTRE À JOUR UN UTILISATEUR (route backend implémentée ✅)
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: [(result, error, { id }) => [
        { type: 'User', id },
        'User',
        'UserProfile'
      ]],
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur',
        errors: response.data?.errors || null
      }),
    }),
    
    // 🗑️ SUPPRIMER UN UTILISATEUR (route backend implémentée ✅)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        'User',
        'Dashboard'
      ],
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors de la suppression de l\'utilisateur'
      }),
    }),
    
    // ============================================================================
    // GESTION DES MOTS DE PASSE
    // ============================================================================
    
    // 🔄 CHANGER LE MOT DE PASSE (route existante ✅)
    changeUserPassword: builder.mutation({
      query: ({ userId, newPassword }) => ({
        url: `/users/password/${userId}`,
        method: 'PATCH',
        body: { newPassword },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'UserProfile'
      ],
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors du changement de mot de passe'
      }),
    }),
    
    // 📧 DEMANDER RESET MOT DE PASSE (route existante ✅)
    requestPasswordReset: builder.mutation({
      query: ({ email }) => ({
        url: '/users/request-password-reset',
        method: 'POST',
        body: { email },
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors de la demande de réinitialisation'
      }),
    }),
    
    // 🔐 RÉINITIALISER MOT DE PASSE (route existante ✅)
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/users/reset-password',
        method: 'POST',
        body: { token, password },
      }),
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors de la réinitialisation du mot de passe'
      }),
    }),
    
    // 📧 ENVOYER RAPPELS MOTS DE PASSE TEMPORAIRES (route existante ✅)
    sendPasswordReminder: builder.mutation({
      query: () => ({
        url: '/users/send-password-reminders',
        method: 'POST',
      }),
      // Invalide les stats pour actualiser le nombre de mots de passe temporaires
      invalidatesTags: ['User'],
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Erreur lors de l\'envoi des rappels'
      }),
    }),
    
    // ============================================================================
    // REQUÊTES SPÉCIALISÉES
    // ============================================================================
    
    // 🎯 RÉCUPÉRER TOUS LES FORMATEURS (utilise getAllUsers avec filtre côté client)
   getAllTeachers: builder.query({
  query: () => '/users',
  providesTags: ['User'],
  transformResponse: (response) => {
    const allUsers = response.data || []
    const teachers = allUsers.filter(user => user.role === 'user' && user.isTeacher === true)

    return {
      teachers,
      count: teachers.length
    }
  },
}),
getTeachersOnly: builder.query({
  query: () => '/users/teachers',
  providesTags: ['User'],
  transformResponse: (response) => {
    const teachers = response.data || []
    return {
      teachers,
      count: teachers.length
    }
  }
}),

    
    // 🔍 RECHERCHER DES UTILISATEURS PAR CRITÈRES
    searchUsers: builder.query({
      query: ({ role, specialization, isActive, search }) => {
        const params = new URLSearchParams()
        if (role) params.append('role', role)
        if (specialization) params.append('specialization', specialization)
        if (isActive !== undefined) params.append('isActive', isActive)
        if (search) params.append('search', search)
        
        return `/users?${params.toString()}`
      },
      providesTags: ['User'],
      transformResponse: (response) => ({
        users: response.data || [],
        count: response.count || 0
      }),
    }),
    
    // 📈 OBTENIR LES UTILISATEURS AVEC MOTS DE PASSE TEMPORAIRES
    getUsersWithTempPasswords: builder.query({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response) => {
        const allUsers = response.data || []
        const usersWithTempPasswords = allUsers.filter(user => user.isTemporaryPassword === true)
        
        return {
          users: usersWithTempPasswords,
          count: usersWithTempPasswords.length
        }
      },
    }),
    
  }),
  overrideExisting: false,
})

// ============================================================================
// EXPORT DES HOOKS AVEC CONFIGURATION OPTIMISÉE
// ============================================================================
export const {
  // Queries
  useGetAllUsersQuery,
  useGetTeachersOnlyQuery,
  useGetUserProfileQuery,
  useGetUserByIdQuery,
  useGetUserStatsQuery,
  useGetAllTeachersQuery,
  useSearchUsersQuery,
  useGetUsersWithTempPasswordsQuery,
  
  // Mutations
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserPasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useSendPasswordReminderMutation,
  
  // Utilitaires pour le cache
  util: { 
    getRunningQueriesThunk,
    invalidateTags,
    resetApiState 
  }
} = usersApi

// ============================================================================
// HOOKS PERSONNALISÉS POUR SIMPLIFIER L'USAGE
// ============================================================================

/**
 * Hook personnalisé pour récupérer les statistiques avec auto-refresh
 */
export const useUserStatsWithRefresh = (refreshInterval = 30000) => {
  return useGetUserStatsQuery(undefined, {
    pollingInterval: refreshInterval,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })
}

/**
 * Hook personnalisé pour la liste des utilisateurs avec options avancées
 */
export const useUsersListWithOptions = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 60000,
    skipIfNoAuth = true
  } = options
  
  // ✅ CORRECTION : Appel inconditionnel du hook
  const { data: userProfile } = useGetUserProfileQuery()
  
  return useGetAllUsersQuery(undefined, {
    pollingInterval: autoRefresh ? refreshInterval : 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    skip: skipIfNoAuth && !userProfile,
  })
}

/**
 * Hook personnalisé pour les formateurs avec filtres prédéfinis
 */
export const useTeachersWithFilters = (filters = {}) => {
  const { specialization, isActive } = filters
  
  return useSearchUsersQuery({
    role: 'user',
    specialization,
    isActive
  }, {
    refetchOnMountOrArgChange: true,
  })
}