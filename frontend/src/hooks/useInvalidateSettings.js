// frontend/src/hooks/useInvalidateSettings.js
import { useDispatch } from 'react-redux'
import { settingsApi } from '../store/api/settingsApi'

/**
 * Hook personnalisé pour forcer la mise à jour des statistiques
 * après une modification des données
 */
export const useInvalidateSettingsStats = () => {
  const dispatch = useDispatch()

  return () => {
    // 🔄 Force le rechargement des stats
    dispatch(settingsApi.util.invalidateTags(['Settings', 'Location', 'TypeService']))
    
    // 🔄 Alternative : refetch direct si besoin
    // dispatch(settingsApi.endpoints.getSettingsStats.initiate(undefined, { forceRefetch: true }))
  }
}