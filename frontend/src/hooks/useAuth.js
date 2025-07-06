// frontend/src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectAuth, 
  selectUser, 
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectRequirePasswordChange,
  logout,
  clearError,
  loginStart,
  loginSuccess,
  loginFailure,
  passwordChangeComplete
} from '../store/slices/authSlice'

import { 
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdatePasswordMutation
} from '../store/api/authApi'

export const useAuth = () => {
  const dispatch = useDispatch()
  
  // Sélecteurs Redux
  const auth = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const requirePasswordChange = useSelector(selectRequirePasswordChange)
  
  // Mutations RTK Query
  const [loginMutation] = useLoginMutation()
  const [logoutMutation] = useLogoutMutation()
  const [updatePasswordMutation] = useUpdatePasswordMutation()
  
  // Query pour récupérer le profil
  const { 
    data: profileData, 
    isLoading: isProfileLoading,
    refetch: refetchProfile 
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated
  })

  // FONCTION DE CONNEXION
  const login = async (credentials) => {
    try {
      dispatch(loginStart())
      
      const result = await loginMutation(credentials).unwrap()
      
      dispatch(loginSuccess({
        user: result.user,
        requirePasswordChange: result.requirePasswordChange
      }))
      
      return { success: true, data: result }
    } catch (error) {
      dispatch(loginFailure(error.data?.message || 'Erreur de connexion'))
      return { success: false, error: error.data?.message }
    }
  }

  // FONCTION DE DÉCONNEXION
  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      return { success: true }
    } catch (error) {
      // Même en cas d'erreur serveur, on déconnecte côté client
      dispatch(logout())
      return { success: true }
    }
  }

  // FONCTION DE CHANGEMENT DE MOT DE PASSE
  const updatePassword = async (newPassword) => {
    if (!user?.id) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    try {
      await updatePasswordMutation({
        userId: user.id,
        newPassword
      }).unwrap()
      
      dispatch(passwordChangeComplete())
      await refetchProfile()
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.data?.message }
    }
  }

  // FONCTION POUR NETTOYER LES ERREURS
  const clearAuthError = () => {
    dispatch(clearError())
  }

  // FONCTION POUR VÉRIFIER LES PERMISSIONS
  const hasRole = (roles) => {
    if (!user?.role) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  // FONCTION POUR VÉRIFIER SI ADMIN
  const isAdmin = () => hasRole(['superAdmin', 'manager'])

  // FONCTION POUR VÉRIFIER SI SUPERADMIN
  const isSuperAdmin = () => hasRole('superAdmin')

  return {
    // États
    auth,
    user,
    isAuthenticated,
    isLoading: isLoading || isProfileLoading,
    error,
    requirePasswordChange,
    
    // Actions
    login,
    logout: handleLogout,
    updatePassword,
    clearError: clearAuthError,
    
    // Utilitaires
    hasRole,
    isAdmin,
    isSuperAdmin,
    refetchProfile,
  }
}