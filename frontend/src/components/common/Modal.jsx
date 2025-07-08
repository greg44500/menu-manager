// frontend/src/components/common/Modal.jsx
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * COMPOSANT MODAL RÉUTILISABLE
 * 
 * POURQUOI UN PORTAL ?
 * - Évite les problèmes de z-index
 * - Rendu en dehors de l'arbre DOM principal
 * - Meilleure gestion de l'accessibilité
 * 
 * FONCTIONNALITÉS :
 * - Fermeture par ESC
 * - Fermeture par clic sur overlay
 * - Gestion du focus (accessibilité)
 * - Animations CSS intégrées
 */

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // GESTION DU FOCUS POUR L'ACCESSIBILITÉ
  useEffect(() => {
    if (isOpen) {
      // Sauvegarde du focus actuel
      previousFocusRef.current = document.activeElement
      
      // Focus sur la modale après un délai pour l'animation
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus()
        }
      }, 100)

      // Bloque le scroll du body
      document.body.style.overflow = 'hidden'
    } else {
      // Restaure le scroll
      document.body.style.overflow = 'unset'
      
      // Restaure le focus précédent
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // GESTION DE LA TOUCHE ESCAPE
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeOnEscape, onClose])

  // GESTION DU FOCUS TRAP (garde le focus dans la modale)
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (!focusableElements?.length) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  // GESTION DU CLIC SUR L'OVERLAY
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose()
    }
  }

  // TAILLES DE MODALE
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay-wrapper">
      {/* OVERLAY AVEC ANIMATION */}
      <div 
        className={`
          fixed inset-0 z-[1000]
          bg-black/50 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* CONTAINER MODAL */}
      <div className={`
        fixed inset-0 z-[1001]
        flex items-center justify-center
        p-4 sm:p-6
        transition-all duration-300 ease-out
      `}>
        {/* CONTENU MODAL */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          tabIndex={-1}
          onKeyDown={handleTabKey}
          className={`
            relative w-full ${sizeClasses[size]}
            bg-surface border border-border-light
            rounded-lg shadow-xl
            transform transition-all duration-300 ease-out
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
            ${className}
          `}
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-light)',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}
        >
          {/* HEADER */}
          {(title || showCloseButton) && (
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              {title && (
                <h2 
                  id="modal-title"
                  className="text-xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h2>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-lg
                    transition-all duration-200 ease-out
                    hover:bg-surface-hover
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  "
                  style={{
                    color: 'var(--text-muted)',
                    '--tw-ring-color': 'var(--primary)'
                  }}
                  aria-label="Fermer la modale"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* CONTENU */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal