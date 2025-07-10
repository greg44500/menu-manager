import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, children, title = "Formulaire" }) => {
  useEffect(() => {
    if (!isOpen) return
    
    // Gestion de la touche Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    
    // Blocage du scroll du body
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <>
      {/* 🎨 OVERLAY avec flou et animation */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1040,
          backgroundColor: 'rgba(37, 36, 34, 0.6)',
          backdropFilter: 'blur(8px) saturate(180%)',
          WebkitBackdropFilter: 'blur(8px) saturate(180%)',
          animation: 'fadeInBlur 0.3s ease-out forwards'
        }}
        onClick={onClose}
      />

      {/* 🎯 CONTAINER MODAL */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        {/* 🎨 CARD MODALE avec design system */}
        <div 
          className="card theme-transition"
          style={{
            width: '100%',
            maxWidth: '28rem',
            margin: '0 auto',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'slideInScale 0.3s ease-out forwards',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant sur la modale
        >
          {/* 🎯 HEADER avec style terracotta */}
          <div className="card-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface-hover)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {title}
            </h3>
            
            {/* 🎨 BOUTON FERMETURE avec hover terracotta */}
            <button
              onClick={onClose}
              title="Fermer"
              style={{
                padding: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--error-bg)'
                e.target.style.color = 'var(--error)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = 'var(--text-muted)'
              }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* 🎯 CONTENU avec padding cohérent */}
          <div className="card-content" style={{
            padding: '1.5rem',
            maxHeight: 'calc(80vh - 120px)',
            overflowY: 'auto'
          }}>
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default Modal