// frontend/src/store/api/baseApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// 🌐 CONFIGURATION DE BASE POUR TOUTES LES APIs
export const baseApi = createApi({
  // 📛 Nom unique pour cette API
  reducerPath: 'api',
  
  // ⚙️ CONFIGURATION DES REQUÊTES
  baseQuery: fetchBaseQuery({
    // 🔗 URL de base de votre backend
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    
    // 🍪 GESTION DES COOKIES JWT
    credentials: 'include', // ESSENTIEL : Inclut les cookies dans toutes les requêtes
    
    // 🔐 HEADERS AUTOMATIQUES
    prepareHeaders: (headers) => {
      // 📝 Headers par défaut
      headers.set('Content-Type', 'application/json')
      
      // 🍪 PAS DE TOKEN BEARER - on utilise les cookies !
      // Le cookie JWT sera automatiquement envoyé grâce à credentials: 'include'
      
      return headers
    },
  }),
  
  // TAGS POUR LE CACHE
  // POURQUOI ? Permet d'invalider automatiquement 
  // le cache quand les données changent
  tagTypes: [
    'User',           // Utilisateurs
    'Classroom',      // Classes
    'Progression',    // Progressions
    'Service',        // Services
    'Menu',           // Menus
    'Item',           // Items de menu
    'Location',       // Localisations
    'ProductionType', // Types de production
  ],
  
  // ENDPOINTS (seront définis dans des fichiers séparés)
    keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
})

// GESTION DES ERREURS GLOBALES
// Vous pouvez ajouter ici une logique pour :
// - Rediriger vers login si 401
// - Afficher des notifications d'erreur
// - Logger les erreurs

