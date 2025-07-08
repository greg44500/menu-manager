// frontend/src/components/common/ThemeToggle.jsx
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

/**
 * Composant Toggle pour basculer entre mode sombre/clair
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' (défaut: 'md')
 * - showLabel: boolean (défaut: false)
 * - className: string pour styles additionnels
 */
const ThemeToggle = ({
  size = 'md',
  showLabel = false,
  className = '',
  orientation = 'horizontal' // 'horizontal' | 'vertical'
}) => {
  const { isDarkMode, toggleTheme } = useTheme()

  // Configuration des tailles (corrigée pour éviter que l'icône sorte du bouton)
  const sizeConfig = {
    sm: {
      container: 'h-5 w-9',
      thumb: 'h-4 w-4',
      iconSize: 12,
      translate: 'translate-x-4',
      labelSize: 'text-xs'
    },
    md: {
      container: 'h-6 w-11',
      thumb: 'h-5 w-5',
      iconSize: 14,
      translate: 'translate-x-4.5',
      labelSize: 'text-sm'
    },
    lg: {
      container: 'h-7 w-12',
      thumb: 'h-6 w-6',
      iconSize: 16,
      translate: 'translate-x-5',
      labelSize: 'text-base'
    }
  }

  const config = sizeConfig[size] || sizeConfig.md

  return (
    <div
      className={`
        flex items-center gap-3
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${className}
      `}
    >
      {/* Label optionnel */}
      {showLabel && (
        <span
          className={`
            ${config.labelSize} font-medium
            transition-colors duration-300 ease-in-out
          `}
          style={{ color: 'var(--text-secondary)' }}
        >
          {isDarkMode ? 'Mode sombre' : 'Mode clair'}
        </span>
      )}

      {/* Toggle Switch */}
      <button
        onClick={toggleTheme}
        className={`
          theme-toggle
          relative inline-flex ${config.container} items-center 
          rounded-full border-2 border-transparent 
          transition-all duration-500 ease-in-out 
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          cursor-pointer
          ${isDarkMode ? 'theme-toggle-active' : ''}
        `}
        style={{
          backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--border)',
          boxShadow: isDarkMode
            ? '0 4px 12px rgba(235, 94, 40, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            : 'inset 0 2px 4px rgba(37, 36, 34, 0.1)'
        }}
        role="switch"
        aria-checked={isDarkMode}
        aria-label={`Basculer vers le mode ${isDarkMode ? 'clair' : 'sombre'}`}
        title={`Passer en mode ${isDarkMode ? 'clair' : 'sombre'}`}
      >
        {/* Thumb coulissant avec icône */}
        <span
          className={`
            theme-toggle-button
            ${config.thumb}
            inline-flex items-center justify-center
            transition-transform duration-200 ease-in-out
            ${isDarkMode ? 'theme-toggle-button-active' : ''}
            `}
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(0, 0, 0, 0.2)'
              : '0 2px 4px rgba(37, 36, 34, 0.1)',
          }}
        >
          {/* Animation des icônes SANS rotation pour éviter la disparition */}
          <div
            className="relative transition-all duration-300 ease-in-out flex items-center justify-center"
          >
            {isDarkMode ? (
              <Moon
                size={config.iconSize}
                strokeWidth={2}
                style={{ color: 'var(--primary)' }}
                className="drop-shadow-sm"
              />
            ) : (
              <Sun
                size={config.iconSize}
                strokeWidth={2}
                style={{ color: 'var(--warning)' }}
                className="drop-shadow-sm"
              />
            )}
          </div>
        </span>

        {/* Effet de brillance subtil */}
        <span
          className={`
            absolute inset-0 rounded-full
            transition-opacity duration-500 ease-in-out pointer-events-none
            ${isDarkMode ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            animation: isDarkMode ? 'shimmer 2s ease-in-out infinite' : 'none'
          }}
        />
      </button>

      {/* Indicateur textuel pour l'accessibilité (screen readers) */}
      <span className="sr-only">
        Thème actuel : {isDarkMode ? 'sombre' : 'clair'}
      </span>
    </div>
  )
}

export default ThemeToggle