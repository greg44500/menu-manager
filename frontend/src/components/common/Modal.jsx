import { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  children,
  title = "Formulaire",
  size = "default" // ← tu peux utiliser "large" ou "default"
}) => {
  useEffect(() => {
    if (!isOpen) return

    // ... (identique)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Détermine la classe selon la taille
  const modalCardClass = size === "large"
    ? "card theme-transition modal-card modal-card-large"
    : "card theme-transition modal-card"

  return ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div
        className="modal-overlay"
        onClick={onClose}
      />

      {/* Container central */}
      <div className="modal-container">
        {/* Carte modale */}
        <div
          className={modalCardClass}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="card-header modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              onClick={onClose}
              title="Fermer"
              className="modal-close"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
          {/* Contenu */}
          <div className="card-content modal-content">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default Modal
