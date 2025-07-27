// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Import des slices
import authSlice from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import calendarSessionReducer from './slices/calendarSessionSlice';

// Import de l'API de base (RTK Query)
import { baseApi } from './api/baseApi'

// Import des APIs spécifiques (pour les enregistrer)
import './api/authApi' // Enregistre les endpoints auth dans baseApi
import './api/dashboardApi' // Enregistre les endpoints dashboard dans baseApi
import './api/settingsApi'
import './api/calendarApi'

// 🏪 CONFIGURATION DU STORE PRINCIPAL
export const store = configureStore({
  reducer: {
    // Gestion de l'authentification
    auth: authSlice,
    dashboard: dashboardReducer,
    calendarSession: calendarSessionReducer,

    // API centralisée avec RTK Query
    // POURQUOI ? RTK Query gère automatiquement :
    // - Le cache des données
    // - Les états de loading/error
    // - La synchronisation des données
    [baseApi.reducerPath]: baseApi.reducer,
  },

  // MIDDLEWARE
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configuration pour les données non-sérialisables
      serializableCheck: {
        ignoredActions: [
          // Actions RTK Query à ignorer
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
      },
    })
      // ⚡ Middleware RTK Query pour les appels API automatiques
      .concat(baseApi.middleware),

  // DevTools en développement uniquement
  devTools: import.meta.env.MODE !== 'production'
})

// 🔄 LISTENERS RTK QUERY
// Active la re-synchronisation automatique des données
// quand l'utilisateur revient sur l'onglet
setupListeners(store.dispatch)

