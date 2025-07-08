// frontend/src/components/users/UserModal.jsx
import Modal from '../common/Modal'
import UserForm from './UserForm'

/**
 * MODALE UTILISATEUR
 * 
 * RESPONSABILITÉS :
 * - Encapsule le formulaire dans une modale
 * - Gère l'ouverture/fermeture
 * - Transmet les callbacks de succès/annulation
 * - Adapte le titre selon le mode (création/édition)
 */

const UserModal = ({
  isOpen,
  onClose,
  user = null, // null = création, objet = édition
  onSuccess // Callback appelé après succès (pour refresh des données)
}) => {
  const isEditMode = Boolean(user)

  // GESTION DU SUCCÈS
  const handleSuccess = (result) => {
    // Fermer la modale
    onClose()
    
    // Appeler le callback parent pour rafraîchir les données
    onSuccess?.(result)
  }

  // TITRE DYNAMIQUE
  const modalTitle = isEditMode 
    ? `Modifier ${user?.firstname} ${user?.lastname}`
    : 'Créer un nouvel utilisateur'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg" // Taille large pour le formulaire
      className="user-modal"
    >
      <UserForm
        user={user}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}

export default UserModal