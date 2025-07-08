// frontend/src/utils/axios.js
import axios from 'axios'

// Configuration de base
const API_BASE_URL = 'http://localhost:5000'

// Créer une instance Axios configurée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← ESSENTIEL : Envoie automatiquement les cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
})

// Intercepteur pour les réponses (gestion des erreurs globales)
apiClient.interceptors.response.use(
  (response) => {
    // Si la réponse est OK, on la retourne telle quelle
    return response
  },
  (error) => {
    // Gestion des erreurs communes
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          console.log('🚫 Non authentifié - redirection vers login')
          // Tu peux ajouter ici la logique de redirection
          // window.location.href = '/login'
          break
          
        case 403:
          console.log('🚫 Accès refusé - permissions insuffisantes')
          break
          
        case 500:
          console.log('💥 Erreur serveur')
          break
          
        default:
          console.log(`❌ Erreur ${status}:`, data?.message || error.message)
      }
    } else if (error.request) {
      console.log('🌐 Pas de réponse du serveur')
    } else {
      console.log('⚠️ Erreur de configuration:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Intercepteur pour les requêtes (logs de debug)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient

// Export des méthodes courantes pour faciliter l'usage
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
}