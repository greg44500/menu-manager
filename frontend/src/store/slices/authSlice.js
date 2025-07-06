// frontend/src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

// ÉTAT INITIAL DE L'AUTHENTIFICATION
const initialState = {
  // 👤 Informations utilisateur (provenant du backend)
  user: null,
  
  // État de connexion
  isAuthenticated: false,
  
  // États de chargement
  isLoading: false,
  
  // Gestion des erreurs
  error: null,
  
  // Changement de mot de passe requis ?
  requirePasswordChange: false,
}

// SLICE D'AUTHENTIFICATION
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // DÉMARRAGE DE LA CONNEXION
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // CONNEXION RÉUSSIE
    loginSuccess: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.requirePasswordChange = action.payload.requirePasswordChange || false
      state.error = null
    },
    
    // ÉCHEC DE CONNEXION
    loginFailure: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload
      state.requirePasswordChange = false
    },
    
    // DÉCONNEXION
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.requirePasswordChange = false
      state.isLoading = false
    },
    
    // MISE À JOUR DU PROFIL
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    // CHANGEMENT DE MOT DE PASSE TERMINÉ
    passwordChangeComplete: (state) => {
      state.requirePasswordChange = false
      if (state.user) {
        state.user.isTemporaryPassword = false
      }
    },
    
    // NETTOYER LES ERREURS
    clearError: (state) => {
      state.error = null
    },
    
    // RÉINITIALISATION DE L'ÉTAT D'AUTHENTIFICATION
    // Utile lors du rafraîchissement de la page
    initializeAuth: (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true
        state.user = action.payload
        state.requirePasswordChange = action.payload.isTemporaryPassword || false
      }
    },
  },
})

// EXPORT DES ACTIONS
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
  passwordChangeComplete,
  clearError,
  initializeAuth,
} = authSlice.actions

// SÉLECTEURS (pour récupérer facilement les données)
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
export const selectRequirePasswordChange = (state) => state.auth.requirePasswordChange

// EXPORT DU REDUCER
export default authSlice.reducer