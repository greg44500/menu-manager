// frontend/src/components/common/StatCard.jsx - VERSION INTERACTIVE
import { useState } from 'react'

/**
 * CARTE STATISTIQUE INTERACTIVE
 * 
 * POURQUOI ce composant ?
 * - Affiche des statistiques visuelles
 * - Cliquable pour ouvrir des détails dans une modale
 * - Animations hover pour indiquer l'interactivité
 * - Adaptatif selon le type de données
 * 
 * PROPS :
 * - title: Titre de la statistique
 * - count: Nombre à afficher
 * - icon: Icône React (Lucide)
 * - onClick: Fonction appelée au clic (optionnel)
 * - clickable: Boolean pour indiquer si cliquable
 * - variant: 'primary' | 'success' | 'warning' | 'info' (couleur)
 */

const StatCard = ({ 
  title, 
  count, 
  icon, 
  onClick = null,
  clickable = true,
  variant = 'primary',
  loading = false 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // CONFIGURATION DES VARIANTS DE COULEUR
  const variantConfig = {
    primary: {
      iconColor: 'var(--primary)',
      hoverBg: 'var(--primary-pale)',
      hoverBorder: 'var(--primary)'
    },
    success: {
      iconColor: 'var(--success)',
      hoverBg: 'var(--success-bg)',
      hoverBorder: 'var(--success)'
    },
    warning: {
      iconColor: 'var(--warning)',
      hoverBg: 'var(--warning-bg)',
      hoverBorder: 'var(--warning)'
    },
    info: {
      iconColor: 'var(--info)',
      hoverBg: 'var(--info-bg)',
      hoverBorder: 'var(--info)'
    }
  }

  const config = variantConfig[variant] || variantConfig.primary

  // 🎬 GESTIONNAIRE DE CLIC
  const handleClick = () => {
    if (clickable && onClick && !loading) {
      onClick()
    }
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        backgroundColor: isHovered && clickable ? config.hoverBg : 'var(--surface)',
        border: `1px solid ${isHovered && clickable ? config.hoverBorder : 'var(--border)'}`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isHovered && clickable 
          ? 'var(--shadow-lg)' 
          : 'var(--shadow-md)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: clickable ? 'pointer' : 'default',
        transform: isHovered && clickable ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      role={clickable ? 'button' : 'article'}
      tabIndex={clickable ? 0 : -1}
      aria-label={clickable ? `Voir les détails pour ${title}` : title}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      
      {/* EFFET DE FOND ANIMÉ */}
      {clickable && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, transparent, ${config.iconColor}08, transparent)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          }}
        />
      )}

      {/*CONTENU PRINCIPAL */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: '0.75rem'
        }}>
          {title}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          {/* NOMBRE PRINCIPAL */}
          <p style={{
            fontSize: '2.25rem',
            fontWeight: '700',
            margin: 0,
            color: 'var(--text-primary)',
            lineHeight: 1,
            transition: 'color 0.3s ease'
          }}>
            {loading ? (
              <span style={{
                display: 'inline-block',
                width: '3rem',
                height: '2.25rem',
                backgroundColor: 'var(--border)',
                borderRadius: '0.25rem',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ) : (
              count
            )}
          </p>
          
          {/*INDICATEUR CLIQUABLE */}
          {clickable && !loading && (
            <span style={{
              fontSize: '0.75rem',
              color: config.iconColor,
              fontWeight: '500',
              opacity: isHovered ? 1 : 0.7,
              transition: 'all 0.3s ease',
              transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
            }}>
              Voir détails →
            </span>
          )}
        </div>
      </div>

      {/* ICÔNE DÉCORATIVE */}
      <div style={{
        fontSize: '3rem',
        color: config.iconColor,
        opacity: isHovered && clickable ? 0.6 : 0.3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        transform: isHovered && clickable ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
        position: 'relative',
        zIndex: 1
      }}>
        {loading ? (
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          icon
        )}
      </div>

      {/* ✨ EFFET DE BRILLANCE AU HOVER */}
      {clickable && (
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
            transform: isHovered ? 'translateX(50%)' : 'translateX(-100%)',
            transition: 'transform 0.6s ease',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  )
}



export default StatCard