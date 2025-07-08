// frontend/src/hooks/useTheme.js
import { useState, useEffect } from 'react'

/**
 * Hook personnalisé pour gérer le thème sombre/clair
 * 
 * POURQUOI ce hook ?
 * - Centralise la logique du thème
 * - Persiste automatiquement dans localStorage  
 * - Synchronise avec les variables CSS définies dans theme.css
 * - Réutilisable dans toute l'application
 */
export const useTheme = () => {
  // État du thème avec récupération du localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      // Priorité : localStorage > préférence système > mode clair par défaut
      if (savedTheme) {
        return savedTheme === 'dark'
      }
      return systemPrefersDark
    }
    return false
  })

  // Effet pour appliquer le thème au DOM
  useEffect(() => {
    const root = document.documentElement
    
    if (isDarkMode) {
      // Active le thème sombre via l'attribut data-theme
      // Ceci déclenche toutes les variables CSS [data-theme="dark"] dans theme.css
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      // Retire l'attribut pour revenir au thème clair
      root.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }

    // Ajoute une classe pour les transitions fluides
    root.classList.add('theme-transition')
  }, [isDarkMode])

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  // Fonction pour forcer un thème spécifique
  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark')
  }

  return { 
    isDarkMode, 
    toggleTheme, 
    setTheme,
    theme: isDarkMode ? 'dark' : 'light'
  }
}